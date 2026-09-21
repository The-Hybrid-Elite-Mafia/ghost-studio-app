import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
async function fixture(){
 const w=vm.createContext({crypto:webcrypto,DOMException,setTimeout,clearTimeout,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}});w.window=w;w.dispatchEvent=()=>{};
 for(const file of ['packs.js','preset-guidance.js','audio.js'])vm.runInContext(await readFile(new URL('../studio/'+file,import.meta.url),'utf8'),w);
 return w;
}
test('Every plugin has five distinct valid presets and bypassed neutral insertion',async()=>{
 const w=await fixture();for(const [type,def] of Object.entries(w.GhostAudio.TYPES)){
  assert.ok(def.factory.length>=5,type);assert.equal(new Set(def.factory.map(p=>p.name)).size,def.factory.length);
  const zero=w.GhostAudio.newEffect(type);assert.equal(zero.enabled,false);assert.equal(zero.preset,'Zero / Neutral');
  for(const [key,r] of Object.entries(def.params)){assert.equal(zero.params[key],r[2]);if(['dB','%','% change'].includes(r[3]))assert.equal(r[2],0,type+'.'+key);}
  for(const preset of def.factory)for(const [key,r] of Object.entries(def.params)){const n=preset.params[key];assert.ok(Number.isFinite(n)&&n>=r[0]&&n<=r[1],type+'/'+preset.name+'/'+key);if(def.choices?.[key])assert.ok(def.choices[key].some(c=>c[0]===n),type+'/'+key);}
 }
});
function audioNode(){return {connect(){},disconnect(){},stop(t){this.stoppedAt=t;},start(...args){this.started=args;},gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}}};}
async function playback(){const w=await fixture(),e=new w.GhostAudio.Engine();e.context={currentTime:10,sampleRate:48000,createGain:audioNode,createBufferSource:audioNode};e.master=audioNode();e.playing=true;e.anchor=0;e.playRequest=1;e.tracks=[{id:'t',buffer:{},effects:[]}];e.duration=()=>100;e.compat={buffered:true,fade:audioNode()};const old=audioNode();e.sources=[old];return {w,e,old};}
test('Buffered edits keep transport running and replace audio at its current position',async()=>{
 const {w,e,old}=await playback();let done;w.GhostRender={render:()=>new Promise(r=>done=r)};
 const fx=w.GhostAudio.newEffect('deesser');e.parameter(fx,'range',3);clearTimeout(e.refreshTimer);
 assert.equal(e.playing,true);assert.equal(old.stoppedAt,undefined);
 const pending=e.refreshPlayback();assert.equal(old.stoppedAt,undefined);e.context.currentTime=12;done({});await pending;
 assert.equal(e.playing,true);assert.equal(e.sources[0].started[1],12.025);assert.equal(old.stoppedAt,12.045);
 e.pause();
});
test('Stop during preparation prevents late render from restarting playback',async()=>{
 const {w,e}=await playback();let done;w.GhostRender={render:()=>new Promise(r=>done=r)};const pending=e.refreshPlayback();e.stop();done({});await pending;assert.equal(e.playing,false);assert.equal(e.position,0);assert.equal(e.sources.length,0);
});
test('Failed update preserves old playback',async()=>{
 const {w,e,old}=await playback();w.GhostRender={render:async()=>{throw Error('test failure');}};await e.refreshPlayback();assert.equal(e.playing,true);assert.equal(e.sources[0],old);assert.equal(old.stoppedAt,undefined);e.pause();
});

test('Command completion waits for refreshed audio and propagates render failure',async()=>{
 const {w,e,old}=await playback();let done;w.GhostRender={render:()=>new Promise(r=>done=r)};
 let complete=false;const pending=e.settleEffects().then(()=>complete=true);
 await Promise.resolve();assert.equal(complete,false);assert.equal(old.stoppedAt,undefined);done({});await pending;assert.equal(complete,true);
 w.GhostRender={render:async()=>{throw Error('render rejected');}};
 await assert.rejects(e.settleEffects(),/render rejected/);e.pause();
});
