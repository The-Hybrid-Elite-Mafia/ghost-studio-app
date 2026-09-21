import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';

// Audio-buffer and WAV decoding fixtures exercise import/render contracts without
// opening a browser or claiming a listening test of the user's unavailable stems.
const world=vm.createContext({Blob,File,TextEncoder,TextDecoder,crypto:webcrypto,DOMException,setTimeout,clearTimeout,console});
world.window=world;
for(const file of ['packs.js','dsp.js','cleanup.js','studio-core.js','audio-sources.js','render-core.js','audio.js','assistant.js'])vm.runInContext(await readFile(new URL('../studio/'+file,import.meta.url),'utf8'),world,{filename:file});
const A=world.GhostAudio,S=world.GhostSources,R=world.GhostRender;
function createBuffer(channels,length,rate){
 const planes=Array.from({length:channels},()=>new Float32Array(length));
 return {numberOfChannels:channels,length,sampleRate:rate,duration:length/rate,getChannelData:c=>planes[c],copyToChannel:(data,c,offset=0)=>planes[c].set(data,offset)};
}
function pcmFile(index,{silent=false,frames=512,channels=2}={}){
 const b=createBuffer(channels,frames,48000);
 for(let c=0;c<channels;c++)for(let i=0;i<frames;i++)b.getChannelData(c)[i]=silent?0:(Math.sin(i*(index+3)*.071+c*.37)*.015+(i===100+index?.03:0));
 return {file:new File([A.wav(b,32).bytes],`Stem ${index}.wav`,{type:'audio/wav'}),buffer:b};
}
function decoder(){
 const counts={calls:0,active:0,maxActive:0,blobs:[],rates:[]};
 return {counts,releaseSourceCache(){},async decode(blob,rate){
  counts.calls++;counts.active++;counts.maxActive=Math.max(counts.maxActive,counts.active);counts.blobs.push(blob);counts.rates.push(rate);
  try{
   const raw=await blob.arrayBuffer(),v=new DataView(raw);
   if(raw.byteLength<44||v.getUint32(0)!==0x52494646)throw Error('Unsupported or damaged audio fixture.');
   const channels=v.getUint16(22,true),sr=v.getUint32(24,true),n=v.getUint32(40,true)/4/channels;
   assert.ok(!rate||rate===sr,'this fixture only decodes its original sample rate');
   const b=createBuffer(channels,n,sr);for(let i=0;i<n;i++)for(let c=0;c<channels;c++)b.getChannelData(c)[i]=v.getFloat32(44+(i*channels+c)*4,true);
   return b;
  }finally{counts.active--;}
 }};
}
const track=(data,index)=>({id:'track-'+index,name:'Stem '+index,color:'#59e4d0',role:'vocal',...data,start:0,trimStart:0,trimEnd:data.buffer.duration,gainDb:0,pan:0,mute:false,solo:false,effects:[]});
function options(tracks,extra={}){return {tracks,masterEffects:[],sampleRate:48000,definitions:A.TYPES,duration:1024/48000,bpm:110,masterDb:0,createBuffer,...extra};}

test('twelve 4:31 stereo stem metadata fit without retaining 1.16 GiB of decoded audio',async()=>{
 // Virtual long-buffer metadata isolates the memory policy; no fake mobile memory measurement.
 const engine=decoder();let active=0,maxActive=0;
 engine.decode=async()=>{active++;maxActive=Math.max(maxActive,active);await Promise.resolve();active--;return {sampleRate:48000,numberOfChannels:2,length:271*48000,duration:271,getChannelData:()=>new Float32Array(8)};};
 const files=Array.from({length:12},(_,i)=>pcmFile(i).file),tracks=[];
 const results=await S.importBatch(files,{engine,existingCount:()=>tracks.length,retainedBuffers:()=>tracks.map(t=>t.buffer),accept:(data)=>tracks.push(track(data,tracks.length))});
 assert.equal(results.length,12);assert.ok(results.every(r=>r.status==='imported'));assert.equal(tracks.length,12);
 assert.ok(tracks.reduce((n,t)=>n+t.buffer.length*8,0)>1024**3);
 assert.ok(S.usedBytes(tracks.map(t=>t.buffer))<=S.CACHE_LIMIT);assert.equal(maxActive,1);
 tracks.forEach((t,i)=>assert.equal(t.raw,files[i]));
 assert.equal(R.requiresRepair(tracks,[]),true);
});

test('file-by-file results keep valid audio before and after a bad file and report the track cap',async()=>{
 const engine=decoder(),tracks=[];
 const files=[pcmFile(1).file,new File(['damaged'],'broken.wav'),new File(['MThd'],'notes.wav'),pcmFile(2).file];
 const results=await S.importBatch(files,{engine,existingCount:()=>tracks.length,retainedBuffers:()=>tracks.map(t=>t.buffer),accept:data=>tracks.push(track(data,tracks.length))});
 assert.deepEqual(Array.from(results,r=>r.status),['imported','failed','failed','imported']);
 assert.match(results[1].reason,/damaged/);assert.match(results[2].reason,/MIDI/);
 const capped=await S.importBatch([pcmFile(3).file,pcmFile(4).file],{engine,existingCount:()=>23+tracks.length-2,retainedBuffers:()=>[],accept:data=>tracks.push(track(data,tracks.length))});
 assert.equal(capped[0].status,'imported');assert.equal(capped[1].status,'failed');assert.match(capped[1].reason,/24 tracks/);
});

test('twelve deferred WAVs render their original stereo samples with trims, alignment and effects',async()=>{
 const engine=decoder(),fixtures=Array.from({length:12},(_,i)=>pcmFile(i)),tracks=[];
 for(let i=0;i<fixtures.length;i++)tracks.push(track(await S.open(fixtures[i].file,engine),i));
 const fx={...A.newEffect('gain'),enabled:true,params:{gain:-2}};
 for(let i=0;i<tracks.length;i++){tracks[i].trimStart=(i%3)*8/48000;tracks[i].start=(i%4)*16/48000;tracks[i].gainDb=-i/3;tracks[i].pan=(i%3-1)*.4;tracks[i].effects=i===2?[fx]:[];}
 // Compare the existing in-memory mixer with the new sequential path.
 const expected=await R.render(options(tracks));
 S.release(tracks.map(t=>t.buffer));const progress=[];
 const actual=await R.render(options(tracks,{onProgress:m=>progress.push(m)}));
 assert.equal(engine.counts.maxActive,1);assert.equal(S.usedBytes(tracks.map(t=>t.buffer)),0);
 assert.equal(progress.filter(s=>s.startsWith('Preparing stem ')).length,12);
 for(let c=0;c<2;c++)for(let i=0;i<actual.length;i++)assert.ok(Math.abs(actual.getChannelData(c)[i]-expected.getChannelData(c)[i])<2e-7,`sample mismatch at ${c}:${i}`);
 for(let i=0;i<fixtures.length;i++)assert.deepEqual(new Uint8Array(await tracks[i].raw.arrayBuffer()),new Uint8Array(await fixtures[i].file.arrayBuffer()));
});

test('neutral plugin packs add no signal to silent deferred audio',async()=>{
 const engine=decoder(),data=await S.open(pcmFile(0,{silent:true}).file,engine),t=track(data,0);
 t.effects=Object.keys(world.GhostPacks.definitions).slice(0,12).map(type=>A.newEffect(type));
 data.buffer.release();const result=await R.render(options([t],{masterEffects:[A.newEffect('masterrack')]}));
 for(let c=0;c<2;c++)assert.ok(result.getChannelData(c).every(sample=>sample===0));
});

test('save/reopen preserves twelve source files and shared split audio, without decoded accumulation',async()=>{
 const engine=decoder(),tracks=[];
 for(let i=0;i<12;i++){const data=await S.open(pcmFile(i).file,engine);data.buffer.release();tracks.push(track(data,i));}
 tracks.push({...tracks[0],id:'split',start:.002,trimStart:.002});
 const state={name:'Twelve stems',bpm:110,masterDb:0,masterEffects:[A.newEffect('masterrack')]};
 const blob=A.packProject(state,tracks),opened=await A.unpackProject(blob,engine);
 assert.equal(opened.tracks.length,13);assert.equal(opened.state.name,state.name);
 assert.equal(opened.tracks[0].raw,opened.tracks[12].raw);assert.equal(opened.tracks[0].buffer,opened.tracks[12].buffer);
 assert.ok(S.usedBytes(opened.tracks.map(t=>t.buffer))<=S.CACHE_LIMIT);
 for(let i=0;i<12;i++)assert.deepEqual(new Uint8Array(await opened.tracks[i].raw.arrayBuffer()),new Uint8Array(await tracks[i].raw.arrayBuffer()));
 const actual=await R.render(options(opened.tracks));assert.ok(actual.getChannelData(0).some(v=>v!==0));
});

test('analysis reopens the original stem and Stop cancels preparation before another decode',async()=>{
 const engine=decoder(),data=await S.open(pcmFile(1,{frames:4096}).file,engine),t=track(data,0);
 const expected=await A.analyze(t);data.buffer.release();const actual=await A.analyze(t);
 assert.equal(actual.peakDb,expected.peakDb);assert.equal(actual.rmsDb,expected.rmsDb);
 let cancelled=false;const before=engine.counts.calls;
 await assert.rejects(R.render(options([t,t],{onProgress:()=>{cancelled=true;},checkCancelled:()=>{if(cancelled)throw new DOMException('Stopped','AbortError');}})),{name:'AbortError'});
 assert.ok(engine.counts.calls-before<=1);assert.equal(data.buffer.residentBytes,0);
});

test('twelve stems keep twenty independent inserts each through save, reopen and render',async()=>{
 const engine=decoder(),tracks=[];
 const makeGain=value=>({...A.newEffect('gain'),enabled:true,params:{gain:value}});
 for(let i=0;i<12;i++){
  const t=track(await S.open(pcmFile(i).file,engine),i);
  t.effects=A.validateEffects(Array.from({length:20},(_,j)=>makeGain(j===19?-3:-.1)));
  tracks.push(t);
 }
 const masters=A.validateEffects(Array.from({length:16},(_,j)=>makeGain(j===15?-2:0)));
 const packed=A.packProject({name:'Twelve full racks',bpm:110,masterDb:0,masterEffects:masters},tracks);
 const restored=await A.unpackProject(packed,engine);
 assert.equal(restored.tracks.length,12);
 assert.equal(restored.state.masterEffects.length,16);
 for(let i=0;i<12;i++){
  assert.equal(restored.tracks[i].effects.length,20);
  assert.equal(restored.tracks[i].effects[19].params.gain,-3);
  assert.equal(new Set(restored.tracks[i].effects.map(e=>e.id)).size,20);
 }
 restored.tracks[0].effects[0].params.gain=-.2;
 assert.equal(restored.tracks[1].effects[0].params.gain,-.1,'stem racks must remain independent');
 const expectedTracks=restored.tracks.map((t,i)=>({...t,effects:[makeGain(i===0?-5:-4.9)]}));
 const actual=await R.render(options(restored.tracks,{masterEffects:restored.state.masterEffects}));
 const expected=await R.render(options(expectedTracks,{masterEffects:[makeGain(-2)]}));
 for(let c=0;c<2;c++)for(let i=0;i<actual.length;i++)assert.ok(Math.abs(actual.getChannelData(c)[i]-expected.getChannelData(c)[i])<2e-6,'All inserts, including those after twelve, must affect the rendered audio');
});
