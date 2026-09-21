/* Ghost DAW audio and project core. No remote audio processing. */
(function () {
'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const db=v=>v>0?20*Math.log10(v):-120;
const gain=d=>Math.pow(10,d/20);
const clone=v=>JSON.parse(JSON.stringify(v));
const MB=1024*1024;
const LIMIT=512*MB;
const TYPES={
 highpass:{name:'High-pass filter',description:'Remove low-frequency rumble.',params:{frequency:[0,500,0,'Hz'],Q:[0.1,2,0.707,'Q']}},
 lowshelf:{name:'Low shelf',description:'Shape the weight and warmth.',params:{frequency:[40,500,180,'Hz'],gain:[-12,12,0,'dB']}},
 peaking:{name:'Parametric EQ',description:'Cut or lift a focused frequency range.',params:{frequency:[80,12000,2400,'Hz'],gain:[-12,12,0,'dB'],Q:[0.2,8,1,'Q']}},
 highshelf:{name:'High shelf',description:'Shape brightness with a broad shelf.',params:{frequency:[1500,16000,7000,'Hz'],gain:[-12,12,0,'dB']}},
 lowpass:{name:'Low-pass filter',description:'Reduce the top end.',params:{frequency:[0,20000,0,'Hz'],Q:[0.1,2,0.707,'Q']}},
 compressor:{name:'Compressor',description:'Control dynamics; makeup gain follows compression.',params:{threshold:[-60,0,0,'dB'],ratio:[1,12,1,':1'],attack:[1,100,15,'ms'],release:[30,1000,160,'ms'],knee:[0,30,0,'dB'],makeup:[-12,12,0,'dB']}},
 delay:{name:'Stereo delay',description:'Add linked echoes with a parallel dry signal.',params:{time:[0,600,0,'ms'],feedback:[0,60,0,'%'],mix:[0,50,0,'%']}},
 saturation:{name:'Soft saturation',description:'Add harmonics with a parallel blend.',params:{drive:[1,5,1,'×'],mix:[0,50,0,'%']}},
 gain:{name:'Output trim',description:'Set the level leaving your effect.',params:{gain:[-24,12,0,'dB']}}
};
Object.assign(TYPES,window.GhostPacks?.definitions||{});
window.GhostPresetGuidance?.attach(TYPES);
function newEffect(type){if(!Object.hasOwn(TYPES,type))throw Error('Unknown effect');return {id:crypto.randomUUID(),type,enabled:false,preset:'Zero / Neutral',params:Object.fromEntries(Object.entries(TYPES[type].params).map(([k,v])=>[k,v[2]])),automation:{},midi:{}};}
function validateEffects(effects,fresh=false){
 if(!Array.isArray(effects))throw Error('A chain must contain an array of modules.');const ids=new Set();
 return effects.map(e=>{if(!e||!Object.hasOwn(TYPES,e.type))throw Error('Unsupported effect module.');const r=newEffect(e.type);if(!fresh&&typeof e.id==='string'&&e.id.length<=100&&!ids.has(e.id))r.id=e.id;ids.add(r.id);r.enabled=e.enabled===true;r.preset=String(e.preset||'User settings').slice(0,80);
 for(const [k,range] of Object.entries(TYPES[e.type].params)){let n=Number(e.params?.[k]??range[2]);if(!Number.isFinite(n))throw Error('Invalid effect parameter.');n=clamp(n,range[0],range[1]);const choices=TYPES[e.type].choices?.[k];r.params[k]=choices?choices.reduce((a,b)=>Math.abs(b[0]-n)<Math.abs(a[0]-n)?b:a)[0]:n;}
 if(e.type==='cleanup'&&e.noiseProfile)r.noiseProfile=window.GhostCleanup.validateProfile(e.noiseProfile);
 if(typeof e.assistantKey==='string'&&/^[a-z-]{1,40}$/.test(e.assistantKey))r.assistantKey=e.assistantKey;
 r.automation=window.GhostPackAudio?.validateAutomation(e.automation,e.type)||{};
 if(e.midi&&typeof e.midi==='object')for(const [key,m] of Object.entries(e.midi)){if(!Object.hasOwn(TYPES[e.type].params,key)&&key!=='enabled')continue;if(m&&Number.isInteger(m.cc)&&m.cc>=0&&m.cc<=127&&Number.isInteger(m.channel)&&m.channel>=0&&m.channel<16)r.midi[key]={cc:m.cc,channel:m.channel};}
 if(e.ab&&typeof e.ab==='object'){r.ab={};for(const slot of ['A','B']){const x=e.ab[slot];if(x){const safe=validateEffects([{type:e.type,params:x.params,enabled:x.enabled,automation:x.automation,noiseProfile:x.noiseProfile}])[0];r.ab[slot]={params:safe.params,enabled:safe.enabled,automation:safe.automation,noiseProfile:safe.noiseProfile,preset:String(x.preset||'User settings').slice(0,80)};}}r.activeAB=e.activeAB==='B'?'B':'A';}return r;});
}
function factoryEffect(type,preset=null){const e=newEffect(type);if(preset!==null){const p=TYPES[type]?.factory?.find(x=>x.name===preset);if(!p)throw Error('Unknown factory preset');e.params=clone(p.params);e.enabled=true;e.preset=p.name;}return e;}
function createEffect(ctx,e,registry,live=true){
 if(window.GhostPacks?.definitions[e.type])return window.GhostPackAudio.create(ctx,e,registry,live);
 const nodes=[];const node=(kind)=>{const n=ctx[kind]();nodes.push(n);return n;};
 const input=node('createGain'),output=node('createGain'),p=e.params;
 if(!e.enabled||(['highpass','lowpass'].includes(e.type)&&!p.frequency)){input.connect(output);return {input,output,nodes};}
 if(['highpass','lowshelf','peaking','highshelf','lowpass'].includes(e.type)){
  const f=node('createBiquadFilter');f.type=e.type;f.frequency.value=Math.min(p.frequency,ctx.sampleRate*.49);if(p.Q!==undefined)f.Q.value=p.Q;if(p.gain!==undefined)f.gain.value=p.gain;input.connect(f);f.connect(output);
 }else if(e.type==='compressor'){
  const c=node('createDynamicsCompressor');c.threshold.value=p.threshold;c.ratio.value=p.ratio;c.attack.value=p.attack/1000;c.release.value=p.release/1000;c.knee.value=p.knee;output.gain.value=gain(p.makeup);input.connect(c);c.connect(output);
 }else if(e.type==='delay'){
  const dry=node('createGain'),wet=node('createGain'),delay=ctx.createDelay(1),feedback=node('createGain');nodes.push(delay);dry.gain.value=1-p.mix/100;wet.gain.value=p.mix/100;delay.delayTime.value=p.time/1000;feedback.gain.value=p.feedback/100;
  input.connect(dry);dry.connect(output);input.connect(delay);delay.connect(wet);wet.connect(output);delay.connect(feedback);feedback.connect(delay);
 }else if(e.type==='saturation'){
  const dry=node('createGain'),wet=node('createGain'),shape=node('createWaveShaper');const curve=new Float32Array(8193);for(let i=0;i<curve.length;i++){const x=i/(curve.length-1)*2-1;curve[i]=Math.tanh(x*p.drive)/Math.tanh(p.drive);}shape.curve=curve;shape.oversample='2x';dry.gain.value=1-p.mix/100;wet.gain.value=p.mix/100;input.connect(dry);dry.connect(output);input.connect(shape);shape.connect(wet);wet.connect(output);
 }else {output.gain.value=gain(p.gain);input.connect(output);}
 return {input,output,nodes};
}
function tail(effects,bpm=110){return Math.min(24,effects.reduce((s,e)=>{const lanes=Object.entries(e.automation||{}).filter(([,v])=>v.enabled&&v.points?.length);const automatedEnabled=lanes.find(([k])=>k==='enabled')?.[1].points.some(p=>p.value>=.5);if(!e.enabled&&!automatedEnabled)return s;const p={...e.params};for(const [key,lane] of lanes)if(key!=='enabled')p[key]=Math.max(p[key]??0,...lane.points.map(x=>x.value));if(e.type==='masterrack'&&p.mix>0){const children=window.GhostPacks.rackOrder.map(([prefix,type])=>({type,enabled:p[prefix+'On']>=.5,params:Object.fromEntries(Object.keys(TYPES[type].params).map(k=>[k,p[prefix+'_'+k]]))}));return s+tail(children,bpm);}if((e.type==='delay'||e.type==='throw')&&p.mix>0){if(p.freeze)return s+8;const f=p.feedback/100,time=e.type==='throw'&&p.sync?(60/bpm)*[.25,.5,.75,1,1.5,2,4][Math.round(p.division)]:p.time/1000;return s+Math.min(12,time*(f>0?1+Math.ceil(Math.log(.001)/Math.log(f)):1));}if(e.type==='plate'&&p.mix>0)return s+p.decay+p.preDelay/1000+.2;if(e.type==='doubler'&&p.mix>0)return s+.2;if(['compressor','fet','glue','final'].includes(e.type))return Math.max(s,p.release/1000);return s;},0));}
function audible(t,tracks){return !t.disabled&&!t.mute&&(!tracks.some(x=>x.solo)||t.solo);}
function trackEnd(t){return t.start+t.trimEnd-t.trimStart;}
function totalDuration(tracks,withTail=true,bpm=110){return Math.max(0,...tracks.map(t=>trackEnd(t)+(withTail?tail(t.effects,bpm):0)));}
function stereoMeter(ctx,source,nodes=[]){
 const splitter=ctx.createChannelSplitter(2),sink=ctx.createGain();sink.gain.value=0;source.connect(splitter);sink.connect(ctx.destination);nodes.push(splitter,sink);const analysers=[],data=[];for(let c=0;c<2;c++){const a=ctx.createAnalyser();a.fftSize=1024;splitter.connect(a,c);a.connect(sink);nodes.push(a);analysers.push(a);data.push(new Float32Array(1024));}return {analysers,data};
}
function meterPeak(m){let peak=0;for(let c=0;c<m.analysers.length;c++){m.analysers[c].getFloatTimeDomainData(m.data[c]);for(const v of m.data[c])peak=Math.max(peak,Math.abs(v));}return peak;}
function monoCompensation(t){return t.buffer.numberOfChannels===1&&t.effects.some(e=>window.GhostPacks?.definitions[e.type])?1/Math.sqrt(2+2*Math.sin(Math.abs(t.pan)*Math.PI/2)):1;}
function trackGraph(ctx,t,master,active,live=true,registry=null){
 const nodes=[],input=ctx.createGain();nodes.push(input);let last=input;
 for(const e of t.effects){const fx=createEffect(ctx,e,registry,live);nodes.push(...fx.nodes);last.connect(fx.input);last=fx.output;}
 const level=ctx.createGain(),pan=ctx.createStereoPanner(),analyser=ctx.createAnalyser();nodes.push(level,pan,analyser);level.gain.value=active?gain(t.gainDb)*monoCompensation(t):0;pan.pan.value=t.pan;analyser.fftSize=1024;last.connect(level);level.connect(pan);pan.connect(analyser);analyser.connect(master);
 const meter=live?stereoMeter(ctx,pan,nodes):null;return {input,level,pan,analyser,nodes,meter};
}
class Engine {
 constructor(){this.context=null;this.tracks=[];this.graphs=new Map();this.sources=[];this.playing=false;this.position=0;this.anchor=0;this.masterDb=-6;this.loop=false;this.onended=null;this.master=null;this.analyser=null;this.meterData=new Float32Array(2048);this.loopActive=false;this.loopPeriod=0;this.clockToken=0;this.masterMeter=null;this.masterEffects=[newEffect('masterrack')];this.masterNodes=[];this.fx=new Map();this.outputReadout=null;this.bpm=110;this.playRequest=0;this.backendPreference='auto';this.backendInfo={backend:'pending',attempts:[]};this.compat=null;this.renderCache=null;this.rendering=false;this.bufferIds=new WeakMap();this.nextBufferId=0;this.range={enabled:false,start:0,end:8};this.loopOrigin=0;}
 async init(){if(!this.context){const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('This browser does not support Web Audio. Try a current desktop browser.');this.context=new C({latencyHint:'interactive'});this.master=this.context.createGain();this.master.gain.value=gain(this.masterDb);this.analyser=this.context.createAnalyser();this.analyser.fftSize=2048;this.master.connect(this.analyser);this.analyser.connect(this.context.destination);this.masterMeter=stereoMeter(this.context,this.master);this.context.addEventListener('statechange',()=>{if(this.context.state!=='running'&&this.playing){this.pause();window.dispatchEvent(new CustomEvent('ghost-audio-error',{detail:'Browser interrupted audio. Your tracks are still loaded. Tap Play to resume.'}));}});}if(this.context.state==='closed')throw Error('Audio was closed by the browser. Save your project, then reopen this page.');if(this.context.state!=='running')await this.context.resume();if(this.context.state!=='running')throw Error('Browser audio is paused. Tap Play again to enable sound.');return this.context;}
 async prepare(ctx){const result=await window.GhostPackAudio.init(ctx,this.backendPreference);if(ctx===this.context){this.backendInfo=result;window.dispatchEvent(new CustomEvent('ghost-audio-mode',{detail:result}));}return result;}
 diagnostics(){return {build:window.GhostBuild||'unknown',pageProtocol:window.location?.protocol||'unknown',origin:window.location?.origin||'unknown',secureContext:window.isSecureContext===true,agent:window.navigator?.userAgent||'unknown',preference:this.backendPreference,backend:this.backendInfo,contextState:this.context?.state||'not started',sampleRate:this.context?.sampleRate||null,hasWorklet:!!this.context?.audioWorklet,hasCompatibility:typeof this.context?.createScriptProcessor==='function'};}
 async setBackend(preference){if(!['auto','compatibility'].includes(preference))throw Error('Unknown audio mode.');this.pause();this.backendPreference=preference;this.backendInfo={backend:'pending',attempts:[]};if(this.context)window.GhostPackAudio.forget(this.context);}
 async playCompatibility(request){
  const ctx=this.context,end=this.duration(),a=this.loop&&this.range.enabled?clamp(this.range.start,0,Math.max(0,end-.01)):0,b=this.loop&&this.range.enabled?clamp(this.range.end,a+.01,end):end;if(this.position>=b||this.loop&&this.position<a)this.position=a;this.clear();this.loopActive=this.loop;this.loopOrigin=a;this.loopPeriod=b-a;
  this.backendInfo={...this.backendInfo,backend:'buffered'};window.dispatchEvent(new CustomEvent('ghost-audio-mode',{detail:this.backendInfo}));this.rendering=true;
  const progress=message=>window.dispatchEvent(new CustomEvent('ghost-audio-render',{detail:message}));progress('Preparing audio before playback…');
  try{
   const tracks=this.tracks.map(t=>({...t,effects:clone(t.effects)})),masterEffects=clone(this.masterEffects),key=JSON.stringify({bpm:this.bpm,rate:ctx.sampleRate,tracks:tracks.map(t=>{if(!this.bufferIds.has(t.buffer))this.bufferIds.set(t.buffer,++this.nextBufferId);return {...trackMetadata(t),bufferId:this.bufferIds.get(t.buffer)};}),masterEffects});
   if(!this.renderCache||this.renderCache.key!==key){this.renderCache=null;this.releaseSourceCache();const buffer=await window.GhostRender.render({tracks,masterEffects,sampleRate:ctx.sampleRate,definitions:TYPES,duration:end+.05,bpm:this.bpm,masterDb:0,createBuffer:(c,n,sr)=>ctx.createBuffer(c,n,sr),onProgress:progress,checkCancelled:()=>{if(request!==this.playRequest)throw new DOMException('Preparation stopped. Press Play when ready.','AbortError');}});if(request!==this.playRequest)return;this.renderCache={key,buffer};}
   if(request!==this.playRequest)return;const source=ctx.createBufferSource();source.buffer=this.renderCache.buffer;source.loop=this.loop;source.loopStart=a;source.loopEnd=b;const fade=ctx.createGain();source.connect(fade);fade.connect(this.master);const now=ctx.currentTime+.05;this.anchor=now-this.position;this.playStartTime=now;this.compat={buffered:true,fade};this.sources.push(source);this.playing=true;
   source.onended=()=>{if(this.playing&&request===this.playRequest&&!this.loopActive){this.stop();this.onended?.();}};
   if(this.loop)source.start(now,this.position);else source.start(now,this.position,Math.max(.001,end-this.position));progress('Prepared playback. Edits update automatically while the song keeps playing.');
  }finally{this.rendering=false;if(request!==this.playRequest)progress('Preparation stopped. Press Play when ready.');}
 }
 pauseBuffered(){if(this.rendering||this.compat?.buffered)this.queueRefresh();}
 queueRefresh(){
  this.editRevision=(this.editRevision||0)+1;clearTimeout(this.refreshTimer);
  this.refreshTimer=setTimeout(()=>this.refreshPlayback(),180);
 }
 async settleEffects(){
  clearTimeout(this.refreshTimer);
  while(this.rendering||this.refreshing)await new Promise(resolve=>setTimeout(resolve,50));
  clearTimeout(this.refreshTimer);
  if(this.playing)await this.refreshPlayback(true);
 }
 async refreshPlayback(throwOnError=false){
  clearTimeout(this.refreshTimer);
  if(this.refreshing||this.rendering){this.refreshTimer=setTimeout(()=>this.refreshPlayback(),180);return;}
  if(!this.playing)return;
  const revision=this.editRevision,request=this.playRequest,ctx=this.context;
  this.refreshing=true;
  const progress=message=>window.dispatchEvent(new CustomEvent('ghost-audio-render',{detail:message}));
  progress('Updating sound… playback continues.');
  try{
   const tracks=this.tracks.map(t=>({...t,effects:clone(t.effects),trackAutomation:clone(t.trackAutomation||{})}));
   const end=this.duration(),masterEffects=clone(this.masterEffects);
   const buffer=await window.GhostRender.render({tracks,masterEffects,sampleRate:ctx.sampleRate,definitions:TYPES,duration:end+.05,bpm:this.bpm,masterDb:0,createBuffer:(c,n,sr)=>ctx.createBuffer(c,n,sr),checkCancelled:()=>{if(request!==this.playRequest||revision!==this.editRevision)throw new DOMException('Superseded edit','AbortError');}});
   if(!this.playing||request!==this.playRequest||revision!==this.editRevision){if(throwOnError)throw new Error('Playback changed while applying the plugin.');return;}
   const now=ctx.currentTime+.025,a=this.loop&&this.range.enabled?clamp(this.range.start,0,Math.max(0,end-.01)):0,b=this.loop&&this.range.enabled?clamp(this.range.end,a+.01,end):end;
   let position=this.current()+.025;if(this.loop)position=a+((position-a)%(b-a)+(b-a))%(b-a);else if(position>=end)return;
   const source=ctx.createBufferSource(),fade=ctx.createGain();source.buffer=buffer;source.loop=this.loop;source.loopStart=a;source.loopEnd=b;source.connect(fade);fade.connect(this.master);fade.gain.setValueAtTime(0,now);fade.gain.linearRampToValueAtTime(1,now+.02);
   const oldSources=this.sources,oldGraphs=this.graphs,oldNodes=this.masterNodes,oldFx=this.fx,oldFade=this.compat?.fade;
   if(oldFade){oldFade.gain.cancelScheduledValues(now);oldFade.gain.setValueAtTime(1,now);oldFade.gain.linearRampToValueAtTime(0,now+.02);}
   else {for(const g of oldGraphs.values()){g.level.gain.cancelScheduledValues(now);g.level.gain.setValueAtTime(g.level.gain.value,now);g.level.gain.linearRampToValueAtTime(0,now+.02);}}
   this.clockToken++;for(const old of oldSources){old.onended=null;try{old.stop(now+.02);}catch{}}
   this.sources=[source];this.graphs=new Map();this.fx=new Map();this.masterNodes=[];this.compat={buffered:true,fade};this.renderCache=null;
   this.position=position;this.anchor=now-position;this.playStartTime=now;this.loopActive=this.loop;this.loopOrigin=a;this.loopPeriod=b-a;
   source.onended=()=>{if(this.playing&&this.sources.includes(source)&&!this.loopActive){this.stop();this.onended?.();}};
   if(this.loop)source.start(now,position);else source.start(now,position,end-position);
   setTimeout(()=>{for(const old of oldSources)try{old.disconnect();}catch{}for(const g of oldGraphs.values())for(const n of g.nodes)try{n.disconnect();}catch{}for(const n of oldNodes)try{n.disconnect();}catch{}for(const c of oldFx.values())c.dispose?.();oldFade?.disconnect();},100);
   this.backendInfo={...this.backendInfo,backend:'buffered'};window.dispatchEvent(new CustomEvent('ghost-audio-mode',{detail:this.backendInfo}));progress('Updated sound is playing.');
  }catch(error){if(error.name!=='AbortError')progress('Could not update sound; previous audio is still playing. '+error.message);if(throwOnError)throw error;}
  finally{this.refreshing=false;clearTimeout(this.refreshTimer);if(revision!==this.editRevision&&this.playing){clearTimeout(this.refreshTimer);this.refreshTimer=setTimeout(()=>this.refreshPlayback(),180);}}
 }

 duration(){return totalDuration(this.tracks,true,this.bpm)+tail(this.masterEffects,this.bpm);}
 buildMaster(ctx,output,live=true,registry=this.fx){const nodes=[],input=ctx.createGain();nodes.push(input);let last=input;for(const e of this.masterEffects){const fx=createEffect(ctx,e,registry,live);nodes.push(...fx.nodes);last.connect(fx.input);last=fx.output;}last.connect(output);return {input,nodes};}
 parameter(effect,key,value){this.pauseBuffered();if(this.playing&&!this.compat?.buffered&&(!this.fx.has(effect.id)||TYPES[effect.type]?.offline))this.queueRefresh();if(key==='enabled')effect.enabled=!!value;else effect.params[key]=value;effect.preset='User settings';this.fx.get(effect.id)?.override(key,key==='enabled'?(value?1:0):value);}
 effectUpdate(effect){this.pauseBuffered();if(this.playing&&!this.compat?.buffered&&(!this.fx.has(effect.id)||TYPES[effect.type]?.offline))this.queueRefresh();this.fx.get(effect.id)?.update(effect,this.bpm);}
 tempo(value){this.pauseBuffered();this.bpm=value;for(const fx of this.fx.values())fx.update(fx.effect,value);}
 current(){if(!this.playing||this.context.currentTime<(this.playStartTime||0))return this.position;const elapsed=Math.max(0,this.context.currentTime-this.anchor);return this.loopActive&&this.loopPeriod?this.loopOrigin+((elapsed-this.loopOrigin)%this.loopPeriod+this.loopPeriod)%this.loopPeriod:elapsed;}
 clear(){this.clockToken++;if(this.compat){this.compat.fade?.disconnect();this.compat=null;}for(const c of this.fx.values())c.dispose?.();for(const s of this.sources){try{s.stop();s.disconnect();}catch{}}this.sources=[];for(const g of this.graphs.values())for(const n of g.nodes){try{n.disconnect();}catch{}}this.graphs.clear();for(const n of this.masterNodes){try{n.disconnect();}catch{}}this.masterNodes=[];this.fx.clear();}
 async play(){if(this.rendering)return;const request=++this.playRequest;await this.init();if(!this.tracks.length)throw Error('Import stems or load the sound check first.');const repair=window.GhostRender.requiresRepair(this.tracks,this.masterEffects);const mode=repair||this.loop&&this.range.enabled?{backend:'compatibility',attempts:[]}:await this.prepare(this.context);if(request!==this.playRequest)return;if(mode.backend==='compatibility')return this.playCompatibility(request);const end=this.duration();if(this.position>=end)this.position=0;this.clear();this.loopActive=this.loop;this.loopOrigin=0;this.loopPeriod=end;
  if(this.loop){const frames=Math.ceil(end*this.context.sampleRate),bytes=this.tracks.reduce((sum,t)=>sum+frames*t.buffer.numberOfChannels*4,0);if(bytes>256*1024*1024){this.loopActive=false;throw Error('This session is too large for native looping (256 MB loop limit). Turn Loop off to play it normally.');}}
  if(!this.outputMeterNode&&this.context.audioWorklet&&window.GhostWorkletSource){await window.GhostPackAudio.init(this.context);this.outputMeterNode=window.GhostPackAudio.outputMeter(this.context,v=>this.outputReadout=v);this.master.connect(this.outputMeterNode);const silent=this.context.createGain();silent.gain.value=0;this.outputMeterNode.connect(silent);silent.connect(this.context.destination);}
  if(request!==this.playRequest)return;
  const masterGraph=this.buildMaster(this.context,this.master);this.masterNodes.push(...masterGraph.nodes);for(const c of this.fx.values())c.update(c.effect,this.bpm);
  const pending=[];
  for(const t of this.tracks){const g=trackGraph(this.context,t,masterGraph.input,audible(t,this.tracks),true,this.fx);this.graphs.set(t.id,g);const source=this.context.createBufferSource();source.connect(g.input);
   if(this.loop){const sr=this.context.sampleRate,frames=Math.ceil(end*sr),padded=this.context.createBuffer(t.buffer.numberOfChannels,frames,sr),from=Math.floor(t.trimStart*sr),to=Math.min(t.buffer.length,Math.floor(t.trimEnd*sr)),at=Math.floor(t.start*sr);for(let c=0;c<padded.numberOfChannels;c++)padded.copyToChannel(t.buffer.getChannelData(c).subarray(from,to),c,at);source.buffer=padded;source.loop=true;source.loopStart=0;source.loopEnd=end;pending.push({source,delay:0,offset:this.position,duration:null});}
   else{const elapsed=Math.max(0,this.position-t.start),remaining=t.trimEnd-t.trimStart-elapsed;if(remaining<=0){source.disconnect();continue;}source.buffer=await window.GhostSources.resolve(t.buffer);pending.push({source,delay:Math.max(0,t.start-this.position),offset:t.trimStart+elapsed,duration:remaining});}}
  // Buffer preparation is complete before choosing the shared audio-clock start.
  const now=this.context.currentTime+.05;this.anchor=now-this.position;this.playStartTime=now;for(const c of this.fx.values()){c.update(c.effect,this.bpm);c.clock(this.anchor,this.loopActive?end:0);}
  for(const p of pending){if(p.duration===null)p.source.start(now+p.delay,p.offset);else p.source.start(now+p.delay,p.offset,p.duration);this.sources.push(p.source);}
  this.playing=true;
  if(!this.loop){const token=this.clockToken,clock=this.context.createBufferSource();clock.buffer=this.context.createBuffer(1,1,this.context.sampleRate);clock.connect(this.context.destination);clock.onended=()=>{if(this.playing&&token===this.clockToken){this.stop();this.onended?.();}};clock.start(now+end-this.position);this.sources.push(clock);}
 }

 pause(){clearTimeout(this.refreshTimer);this.editRevision=(this.editRevision||0)+1;this.playRequest++;this.position=this.current();this.playing=false;this.clear();}
 stop(){this.pause();this.position=0;}
 async seek(seconds){const was=this.playing;this.pause();this.position=clamp(seconds,0,this.duration());if(was)await this.play();}
 async rebuild(){if(this.playing||this.rendering)this.queueRefresh();else this.renderCache=null;}
 update(){this.pauseBuffered();if(!this.context)return;this.master.gain.setTargetAtTime(gain(this.masterDb),this.context.currentTime,.015);for(const t of this.tracks){const g=this.graphs.get(t.id);if(g){g.level.gain.setTargetAtTime(audible(t,this.tracks)?gain(t.gainDb)*monoCompensation(t):0,this.context.currentTime,.012);g.pan.pan.setTargetAtTime(t.pan,this.context.currentTime,.012);}}}
 tick(){if(this.playing&&!this.loopActive&&this.current()>=this.duration()){this.stop();this.onended?.();}}
 levels(){if(!this.playing||!this.masterMeter)return {master:0,tracks:{}};if(this.compat)return {master:meterPeak(this.masterMeter),tracks:{}};const tracks={};for(const [id,g] of this.graphs)tracks[id]=meterPeak(g.meter);return {master:meterPeak(this.masterMeter),tracks};}

 releaseSourceCache(){window.GhostSources.release(this.retainedBuffers?.()||this.tracks.map(t=>t.buffer));}
 async idle(){this.pause();while(this.rendering)await new Promise(resolve=>setTimeout(resolve,20));this.renderCache=null;this.releaseSourceCache();}
 async decode(raw,sampleRate=null){await this.init();const decoder=sampleRate&&sampleRate!==this.context.sampleRate?new OfflineAudioContext(2,1,sampleRate):this.context;const bytes=raw instanceof Blob?await raw.arrayBuffer():raw.slice(0);const b=await decoder.decodeAudioData(bytes);if(b.numberOfChannels>2)throw Error('Use mono or stereo stems. Multichannel files are not supported.');if(b.duration>720)throw Error('Each stem must be 12 minutes or less.');return b;}
 async render(sampleRate=48000,selectedId=null,onProgress=null){
  if(!this.tracks.length)throw Error('Import some audio first.');let tracks=selectedId?this.tracks.filter(t=>t.id===selectedId).map(t=>({...t,mute:false,solo:false})):this.tracks.filter(t=>audible(t,this.tracks));if(!tracks.length)throw Error('All tracks are muted.');
  const duration=totalDuration(tracks,true,this.bpm)+tail(this.masterEffects,this.bpm)+.05;if(duration>780)throw Error('Move clips inside a 12-minute session before exporting.');const frames=Math.ceil(duration*sampleRate);this.renderCache=null;this.releaseSourceCache();await this.init();const renderPrepared=()=>window.GhostRender.render({tracks,masterEffects:this.masterEffects,sampleRate,definitions:TYPES,duration,bpm:this.bpm,masterDb:this.masterDb,createBuffer:(channels,length,rate)=>this.context.createBuffer(channels,length,rate),onProgress});if(window.GhostRender.requiresRepair(tracks,this.masterEffects))return renderPrepared();const ctx=new OfflineAudioContext(2,frames,sampleRate);const mode=await this.prepare(ctx);if(mode.backend==='compatibility')return renderPrepared();const master=ctx.createGain();master.gain.value=gain(this.masterDb);master.connect(ctx.destination);const registry=new Map(),mg=this.buildMaster(ctx,master,false,registry);
  for(const t of tracks){const g=trackGraph(ctx,t,mg.input,true,false,registry),s=ctx.createBufferSource();s.buffer=await window.GhostSources.resolve(t.buffer);s.connect(g.input);s.start(t.start,t.trimStart,t.trimEnd-t.trimStart);}for(const c of registry.values()){c.update(c.effect,this.bpm);c.clock(0,0);}return await ctx.startRendering();
 }
}
async function measureOutput(buffer){if(!window.GhostDSP)return null;const meter=new window.GhostDSP.Meter(buffer.sampleRate,true),l=buffer.getChannelData(0),r=buffer.numberOfChannels>1?buffer.getChannelData(1):l;for(let i=0;i<l.length;i+=128){meter.process(l.subarray(i,i+128),r.subarray(i,i+128));if(i%(128*2048)===0)await new Promise(resolve=>setTimeout(resolve,0));}const zero=new Float32Array(128);meter.process(zero,zero);return meter.read();}
async function protectTruePeak(buffer,ceiling){const measured=await measureOutput(buffer);if(!measured)return {attenuation:0,estimatedPeak:null};const attenuation=Math.min(0,ceiling-.1-measured.maxTP);if(attenuation<0){const scale=gain(attenuation);for(let c=0;c<buffer.numberOfChannels;c++){const d=buffer.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=scale;}}return {attenuation,estimatedPeak:measured.maxTP+attenuation};}
function wav(buffer,bits=24,ceilingDb=null){
 if(![16,24,32].includes(bits))throw Error('Use 16, 24 or 32-bit WAV.');
 const channels=buffer.numberOfChannels,bytes=bits/8,length=buffer.length,rate=buffer.sampleRate,planes=Array.from({length:channels},(_,c)=>buffer.getChannelData(c));
 let peak=0;for(const data of planes)for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(data[i]));const cap=ceilingDb===null?(bits===32?Infinity:1):gain(ceilingDb),scale=peak>cap?cap/peak:1;
 const out=new ArrayBuffer(44+length*channels*bytes),view=new DataView(out);const str=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i));};
 str(0,'RIFF');view.setUint32(4,out.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,bits===32?3:1,true);view.setUint16(22,channels,true);view.setUint32(24,rate,true);view.setUint32(28,rate*channels*bytes,true);view.setUint16(32,channels*bytes,true);view.setUint16(34,bits,true);str(36,'data');view.setUint32(40,length*channels*bytes,true);
 let offset=44,actualPeak=0;const max=bits===24?8388607:32767;
 for(let i=0;i<length;i++)for(let c=0;c<channels;c++){
  const x=planes[c][i]*scale;if(!Number.isFinite(x))throw Error('Audio contains an invalid sample.');if(bits===32){view.setFloat32(offset,x,true);actualPeak=Math.max(actualPeak,Math.abs(x));offset+=4;continue;}const n=Math.round(clamp(x,-1,1)*max);actualPeak=Math.max(actualPeak,Math.abs(n/max));
  if(bits===24){view.setUint8(offset,n&255);view.setUint8(offset+1,(n>>8)&255);view.setUint8(offset+2,(n>>16)&255);}else view.setInt16(offset,n,true);offset+=bytes;
 }
 return {blob:new Blob([out],{type:'audio/wav'}),bytes:out,attenuationDb:db(scale),peakDb:db(actualPeak),duration:length/rate,sampleRate:rate,bits};
}
function spectral(buffer,start,end){
 const N=2048,windows=Math.min(12,Math.floor((end-start)/N)),energy=[0,0,0];if(windows<1)return {low:0,mid:0,high:0};
 const re=new Float64Array(N),im=new Float64Array(N);
 for(let w=0;w<windows;w++){
  const offset=Math.floor(start+(end-start-N)*(w+.5)/windows);im.fill(0);
  for(let i=0;i<N;i++){let x=0;for(let c=0;c<buffer.numberOfChannels;c++)x+=buffer.getChannelData(c)[offset+i]/buffer.numberOfChannels;re[i]=x*(.5-.5*Math.cos(2*Math.PI*i/(N-1)));}
  for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];}}
  for(let len=2;len<=N;len<<=1){const angle=-2*Math.PI/len;for(let s=0;s<N;s+=len){for(let j=0;j<len/2;j++){const a=s+j,b=a+len/2,c=Math.cos(angle*j),d=Math.sin(angle*j),tr=re[b]*c-im[b]*d,ti=re[b]*d+im[b]*c;re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;}}}
  for(let i=1;i<N/2;i++){const hz=i*buffer.sampleRate/N;if(hz<20||hz>20000)continue;const band=hz<180?0:hz<4000?1:2;energy[band]+=re[i]**2+im[i]**2;}
 }
 const sum=energy.reduce((s,n)=>s+n,0)||1;return {low:energy[0]/sum*100,mid:energy[1]/sum*100,high:energy[2]/sum*100};
}
async function analyze(t){
 const b=await window.GhostSources.resolve(t.buffer),start=Math.floor(t.trimStart*b.sampleRate),end=Math.min(b.length,Math.floor(t.trimEnd*b.sampleRate));let peak=0,clipped=0,totalEnergy=0,maxDC=0;const levels=[];
 for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);let energy=0,sum=0;for(let i=start;i<end;i++){const v=d[i],a=Math.abs(v);peak=Math.max(peak,a);if(a>=.9999)clipped++;energy+=v*v;sum+=v;if(i%1000000===0)await new Promise(r=>setTimeout(r,0));}levels.push(Math.sqrt(energy/Math.max(1,end-start)));maxDC=Math.max(maxDC,Math.abs(sum/Math.max(1,end-start)));totalEnergy+=energy;}
 const rms=Math.sqrt(totalEnergy/Math.max(1,(end-start)*b.numberOfChannels));let correlation=null;
 if(b.numberOfChannels===2){let xy=0,xx=0,yy=0;const a=b.getChannelData(0),bb=b.getChannelData(1);for(let i=start;i<end;i+=8){xy+=a[i]*bb[i];xx+=a[i]**2;yy+=bb[i]**2;}correlation=xy/Math.sqrt(xx*yy||1);}
 const repair=window.GhostCleanup?await window.GhostCleanup.inspect(b,start,end):null;
 return {repair,peakDb:db(peak),rmsDb:db(rms),crestDb:peak>0&&rms>0?db(peak/rms):0,clippedSamples:clipped,dcDb:db(maxDC),balanceDb:levels.length===2?db(levels[0])-db(levels[1]):0,correlation,spectral:spectral(b,start,end),channels:b.numberOfChannels,sampleRate:b.sampleRate,duration:(end-start)/b.sampleRate};
}
function recommendations(t,a){
 const r=[];
 if(a.clippedSamples>0)r.push({title:'Check the source for clipping',reason:a.clippedSamples+' samples are at or near full scale. Lowering the fader creates headroom but cannot repair source clipping.',effects:[]});
 if(a.peakDb>-3)r.push({title:'Create input headroom',placement:'start',reason:'The source peaks at '+a.peakDb.toFixed(1)+' dBFS. A -4 dB trim gives the following effects more room.',effects:[{...newEffect('gain'),enabled:true,preset:'Suggested input headroom',params:{gain:-4}}]});
 if(a.dcDb>-45)r.push({title:'Remove DC and subsonic energy',reason:'The measured DC offset is '+a.dcDb.toFixed(1)+' dBFS. Audition a gentle high-pass filter.',effects:[{...newEffect('highpass'),enabled:true,params:{frequency:25,Q:.707}}]});
 if(t.role==='vocal'&&a.spectral.low>35)r.push({title:'Audition a vocal low cut',reason:'Low frequencies occupy '+a.spectral.low.toFixed(0)+'% of the sampled spectral energy. Start at 70 Hz and check that the voice keeps its body.',effects:[{...newEffect('vocal73'),enabled:true,params:{...newEffect('vocal73').params,hpf:80,mix:100}}]});
 if(a.crestDb>17&&a.rmsDb>-60)r.push({title:'Audition gentle compression',reason:'The source crest factor is '+a.crestDb.toFixed(1)+' dB. If those peaks are distracting, try 2:1 compression; transient-heavy stems may already be right.',effects:[{...newEffect('compressor'),enabled:true,params:{threshold:clamp(a.peakDb-8,-45,-6),ratio:2,attack:25,release:150,knee:10,makeup:0}}]});
 if(a.correlation!==null&&a.correlation<0)r.push({title:'Check mono compatibility',reason:'Sampled left/right correlation is negative. Listen to a mono downmix before making width decisions. This is a warning, not proof of a fault.',effects:[]});
 if(t.role==='vocal'&&a.spectral.high>35)r.push({title:'Audition sibilance control',reason:'The sampled source has elevated high-band energy. Smart De-Esser Pro can target consonants; the measurement alone cannot identify sibilance. Open it from the plugin catalog and use Monitor Sibilance while setting Frequency Focus.',effects:[]});
 if(!r.length)r.push({title:'Keep the source intact',reason:'These measurements do not justify an automatic correction. Set its level in the mix, then decide by listening.',effects:[]});
 return r;
}
function peaks(buffer,bins=1800){const data=buffer.getChannelData(0),step=Math.max(1,Math.ceil(data.length/bins)),out=[];for(let i=0;i<data.length;i+=step){let p=0;for(let j=i;j<Math.min(i+step,data.length);j++)p=Math.max(p,Math.abs(data[j]));out.push(p);}return out;}
function trackMetadata(t){return {...(window.GhostCompose?.extensions(t)||{}),id:t.id,name:t.name,color:t.color,gainDb:t.gainDb,pan:t.pan,mute:t.mute,solo:t.solo,start:t.start,trimStart:t.trimStart,trimEnd:t.trimEnd,role:t.role,demo:t.demo===true,effects:clone(t.effects)};}
function packProject(state,tracks){
 const audio=[],unique=new Map();const items=tracks.map(t=>{if(!unique.has(t.raw)){unique.set(t.raw,audio.length);audio.push(t.raw);}return {...trackMetadata(t),audioIndex:unique.get(t.raw)};});
 const manifest={format:'ghost-daw',version:1,state,tracks:items,audioSizes:audio.map(x=>x instanceof Blob?x.size:x.byteLength)};const json=new TextEncoder().encode(JSON.stringify(manifest));if(json.byteLength>2*MB)throw Error('Project settings exceed 2 MB. Simplify automation or remove unused A/B snapshots before saving.');const header=new ArrayBuffer(12);new Uint8Array(header).set(new TextEncoder().encode('GHOSTDAW'));new DataView(header).setUint32(8,json.byteLength,true);return new Blob([header,json,...audio],{type:'application/octet-stream'});
}
async function unpackProject(file,engine){
 if(file.size>window.GhostSources.PROJECT_LIMIT)throw Error('This project exceeds the 24-file project limit.');const head=await file.slice(0,12).arrayBuffer();if(head.byteLength!==12||new TextDecoder().decode(head.slice(0,8))!=='GHOSTDAW')throw Error('This is not a Ghost DAW project.');const n=new DataView(head).getUint32(8,true);if(n>2*MB||n<2||12+n>file.size)throw Error('Invalid project header.');const m=JSON.parse(await file.slice(12,12+n).text());
 if(m.format!=='ghost-daw'||m.version!==1||!Array.isArray(m.tracks)||m.tracks.length>24||!Array.isArray(m.audioSizes)||m.audioSizes.length>24)throw Error('Unsupported project format.');
 let offset=12+n;const audio=[];engine.releaseSourceCache();for(const size of m.audioSizes){if(!Number.isInteger(size)||size<1||offset+size>file.size)throw Error('Project audio is incomplete.');const raw=file.slice(offset,offset+size);offset+=size;window.GhostSources.release(audio.map(a=>a.buffer));const source=await window.GhostSources.open(raw,engine);window.GhostSources.trimCache([source.buffer]);audio.push(source);}if(offset!==file.size)throw Error('Unexpected project data.');
 const number=(v,a,b)=>{if(typeof v!=='number'||!Number.isFinite(v))throw Error('Invalid project setting.');return clamp(v,a,b);};
 const tracks=m.tracks.map(t=>{const a=audio[t.audioIndex];if(!a)throw Error('Missing project audio.');const trimStart=number(t.trimStart,0,a.buffer.duration-.001),trimEnd=number(t.trimEnd,trimStart+.001,a.buffer.duration);return {...a,...(window.GhostCompose?.extensions(t)||{}),id:crypto.randomUUID(),name:String(t.name).slice(0,80),color:/^#[0-9a-f]{6}$/i.test(t.color)?t.color:'#4bdcc6',gainDb:number(t.gainDb,-60,12),pan:number(t.pan,-1,1),mute:!!t.mute,solo:!!t.solo,start:number(t.start,0,720),trimStart,trimEnd,demo:t.demo===true,role:['vocal','drums','bass','instrument'].includes(t.role)?t.role:'instrument',effects:validateEffects(t.effects)};});
 return {tracks,state:{chat:Array.isArray(m.state?.chat)?m.state.chat.slice(-60).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,18000)})):[],signature:{numerator:Math.round(clamp(Number(m.state?.signature?.numerator)||4,1,32)),denominator:[1,2,4,8,16,32].includes(m.state?.signature?.denominator)?m.state.signature.denominator:4},range:{enabled:m.state?.range?.enabled===true,start:clamp(Number(m.state?.range?.start)||0,0,719),end:clamp(Number(m.state?.range?.end)||8,0.01,720)},name:String(m.state?.name||'Recovered session').slice(0,80),bpm:clamp(Number(m.state?.bpm)||110,40,240),masterDb:clamp(Number(m.state?.masterDb)||0,-60,6),masterEffects:validateEffects(m.state?.masterEffects||[])}};
}
async function storage(action,blob){return new Promise((resolve,reject)=>{const req=indexedDB.open('ghost-daw-studio',1);req.onupgradeneeded=()=>req.result.createObjectStore('sessions');req.onerror=()=>reject(Error('Browser storage is unavailable. Download a project backup instead.'));req.onsuccess=()=>{const db=req.result,tx=db.transaction('sessions',action==='save'?'readwrite':'readonly'),s=tx.objectStore('sessions'),q=action==='save'?s.put(blob,'current'):s.get('current');let result;q.onsuccess=()=>result=q.result;tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(Error('Could not save in this browser. Download a project backup instead.'));};};});}
function demoTracks(ctx){
 const duration=16,sr=ctx.sampleRate,N=sr*duration;
 const specs=[{name:'Sound check · drums',role:'drums',color:'#4bdcc6'},{name:'Sound check · bass',role:'bass',color:'#9d8aff'},{name:'Sound check · keys',role:'instrument',color:'#efb16c'}];
 return specs.map((spec,index)=>{const buffer=ctx.createBuffer(2,N,sr);for(let c=0;c<2;c++){const data=buffer.getChannelData(c);for(let i=0;i<N;i++){const t=i/sr,beat=t%.5,bar=Math.floor(t/2)%4;let x=0;if(index===0){x=Math.sin(2*Math.PI*(48*beat+5*(1-Math.exp(-beat*32))))*Math.exp(-beat*17)*.5;const sn=(t+.5)%1;if(sn<.18)x+=Math.sin(2*Math.PI*190*sn)*Math.exp(-sn*28)*.16;const hat=t%.25;if(hat<.06)x+=Math.sin(2*Math.PI*2200*hat)*Math.exp(-hat*85)*.035;}else if(index===1){const f=[55,65.406,43.654,49][bar],env=Math.min(1,beat*100)*Math.exp(-beat*3);x=(Math.sin(2*Math.PI*f*t)+.18*Math.sin(2*Math.PI*f*2*t))*env*.22;}else{const notes=[[220,261.626,329.628],[261.626,329.628,391.995],[174.614,220,261.626],[196,246.942,293.665]][bar];const env=Math.min(1,(t%2)*20)*Math.exp(-(t%2)*1.5);for(const f of notes)x+=Math.sin(2*Math.PI*f*t+(c?.008:0))*env*.045;}const fade=Math.min(1,t*30,(duration-t)*20);data[i]=x*fade;}}const raw=wav(buffer,16).bytes;return {...spec,demo:true,id:crypto.randomUUID(),buffer,raw,peaks:peaks(buffer),gainDb:0,pan:0,mute:false,solo:false,start:0,trimStart:0,trimEnd:duration,effects:[]};});
}
window.GhostAudio={Engine,TYPES,newEffect,factoryEffect,validateEffects,measureOutput,protectTruePeak,clone,clamp,db,gain,tail,totalDuration,trackEnd,audible,analyze,recommendations,peaks,wav,packProject,unpackProject,storage,demoTracks,trackMetadata,LIMIT};
})();
