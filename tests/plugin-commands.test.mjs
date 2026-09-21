import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
async function setup(){
 const w=vm.createContext({crypto:webcrypto,setTimeout,clearTimeout});w.window=w;
 for(const f of ['packs.js','audio.js','dsp.js','assistant.js','plugin-commands.js'])vm.runInContext(await readFile(new URL('../studio/'+f,import.meta.url),'utf8'),w);
 const track={id:'song',name:'0 Came for Sushi',role:'instrument',buffer:{},analysis:{rmsDb:-24},effects:[]};
 const engine={tracks:[track],masterEffects:[],playing:true,async rebuild(){},async settleEffects(){this.settled=true;}};
 let snapshots=0;const run=message=>w.GhostPluginCommands.execute(message,{engine,selectedId:track.id,snapshot(){snapshots++;}});
 return {w,track,engine,run,snapshots:()=>snapshots};
}
test('natural de-esser request runs locally, targets named song and enables measured processing',async()=>{
 const {w,track,engine,run,snapshots}=await setup();let remote=0;
 const reply=await w.GhostAssistant.dispatch('Can you apply a de-esser to 0 Came for Sushi?',{local:run,remote:()=>{remote++;}});
 assert.equal(remote,0);assert.match(reply,/Done/);assert.equal(engine.settled,true);assert.equal(snapshots(),1);
 const e=track.effects[0];assert.equal(e.type,'deesser');assert.equal(e.enabled,true);assert.equal(e.params.mix,100);assert.equal(e.params.range,2);assert.equal(e.params.threshold,-30);
 await run('apply a de-esser');assert.equal(track.effects.length,1);
});
test('explicit preset, master targeting, bypass and removal use actual racks',async()=>{
 const {run,engine,track}=await setup();
 await run('apply Final Limit Clipper using Safe Ceiling preset to master bus');
 assert.equal(track.effects.length,0);assert.equal(engine.masterEffects[0].params.ceiling,-1.2);assert.equal(engine.masterEffects[0].enabled,true);
 await run('bypass limiter on master bus');assert.equal(engine.masterEffects[0].enabled,false);
 await run('remove limiter from master bus');assert.equal(engine.masterEffects.length,0);
});
test('missing targets, unavailable presets and failed audio refresh never report success',async()=>{
 const {run,engine,track,snapshots}=await setup();
 await assert.rejects(run('apply a de-esser to Missing'),/Track not found/);
 await assert.rejects(run('apply a de-esser using Imaginary preset'),/preset is not available/);
 assert.equal(snapshots(),0);
 engine.settleEffects=async()=>{throw Error('render failed');};
 await assert.rejects(run('apply a de-esser'),/previous settings restored/);assert.equal(track.effects.length,0);
});
test('questions and negative requests do not mutate, manual defaults remain neutral',async()=>{
 const {w,run,track}=await setup();
 for(const text of ['How do I apply a de-esser?',"Don't apply a de-esser",'What is a de-esser?'])assert.equal(await run(text),null);
 assert.equal(track.effects.length,0);assert.equal(w.GhostAudio.newEffect('deesser').enabled,false);
 assert.equal(w.GhostPluginCommands.parse('apply needed plugins'),null);
});
test('applied de-esser reduces a high-frequency test signal using the real DSP',async()=>{
 const {w,run,track}=await setup();await run('apply de-esser');
 const e=track.effects[0],proc=new w.GhostDSP.Processor('deesser',48000);proc.configure(e.params);
 let input=0,output=0;
 for(let i=0;i<48000;i++){const x=.2*Math.sin(2*Math.PI*6500*i/48000);const y=proc.sample(x,x);if(i>24000){input+=x*x;output+=y[0]*y[0];}}
 assert.ok(Number.isFinite(output)&&output<input*.95,'enabled processor must actually attenuate test sibilance');
});
