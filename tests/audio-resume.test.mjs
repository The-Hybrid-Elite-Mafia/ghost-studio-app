import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';

test('DAW resumes an interrupted context and retains loaded tracks',async()=>{
 const w=vm.createContext({console,crypto:webcrypto,CustomEvent:class{}});w.window=w;w.dispatchEvent=()=>{};
 for(const name of ['packs.js','audio.js'])vm.runInContext(await readFile(new URL('../studio/'+name,import.meta.url),'utf8'),w);
 const engine=new w.GhostAudio.Engine(),tracks=[{id:'original-song'}];engine.tracks=tracks;
 let resumes=0;engine.context={state:'interrupted',async resume(){resumes++;this.state='running'}};
 await engine.init();assert.equal(resumes,1);assert.equal(engine.tracks,tracks);
 engine.context={state:'suspended',async resume(){}};
 await assert.rejects(engine.init(),/Tap Play again/);
});

test('Rack Play resumes the existing context even if the playing flag is still set',async()=>{
 const html=await readFile(new URL('../studio/rack-reference.html',import.meta.url),'utf8');
 const play=html.slice(html.indexOf('async function play(){'),html.indexOf('\nfunction seekTo('));
 let resumed=0;
 const w=vm.createContext({recording:false,recordPending:false,loading:false,playing:true,init:async()=>{resumed++}});
 vm.runInContext(play,w);await vm.runInContext('play()',w);assert.equal(resumed,1);
});
