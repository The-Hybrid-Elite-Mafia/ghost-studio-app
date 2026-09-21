/* One shared mixer clock for compatibility playback and portable offline rendering. */
(function(root){
'use strict';
const D=root.GhostDSP,quantum=128;
class Effect {
 constructor(effect,sr,definitions,report=true){this.type=effect.type;this.sr=sr;this.def=definitions[this.type];if(!this.def)throw Error('Unknown processor '+this.type);this.proc=new D.Processor(this.type,sr);this.report=report;this.frames=0;this.gr=0;this.bands=[0,0,0,0];this.p={};this.update(effect,110);this.reset();}
 update(effect,bpm=this.bpm){this.effect=effect;this.bpm=bpm;this.manual={};}
 override(key,value){this.manual[key]=value;}
 reset(){this.inputMeter=new D.Meter(this.sr);this.outputMeter=new D.Meter(this.sr,this.type==='final'||this.type==='masterrack');this.meters=null;}
 process(left,right,time,bpm){if(!this.report&&!this.effect.enabled&&!this.effect.automation?.enabled?.enabled&&!this.manual.enabled)return;const automation=this.effect.automation||{},params=this.effect.params;this.bpm=bpm;
  for(const [key,r] of Object.entries(this.def.params)){let v=this.manual[key]??D.automationValue(automation[key],time,params[key]??r[2]);v=D.clamp(v,r[0],r[1]);const choices=this.def.choices?.[key];if(choices)v=choices.reduce((a,b)=>Math.abs(b[0]-v)<Math.abs(a[0]-v)?b:a)[0];this.p[key]=v;}
  const enabled=(this.manual.enabled??D.automationValue(automation.enabled,time,this.effect.enabled?1:0))>=.5;
  if(this.report)this.inputMeter.process(left,right);if(enabled)this.proc.configure(this.p,bpm);this.proc.process(left,right,left,right,enabled);
  for(let i=0;i<left.length;i++)if(!Number.isFinite(left[i])||!Number.isFinite(right[i]))throw Error(this.def.name+' produced a non-finite audio sample. Playback stopped.');
  if(this.report){this.outputMeter.process(left,right);this.gr=Math.max(this.gr,enabled?this.proc.gr:0);for(let i=0;i<4;i++)this.bands[i]=Math.max(this.bands[i],enabled?this.proc.bandActivity[i]:0);this.frames+=left.length;if(this.frames>=this.sr/10){this.meters={input:this.inputMeter.read(),output:this.outputMeter.read(),gr:this.gr,bands:this.bands.slice(),enabled,params:{...this.p}};this.frames=0;this.gr=0;this.bands.fill(0);}}
 }
}
function trackPan(l,r,pan,mono,expandedMono=false){const x=mono?(pan+1)*.5:pan<=0?pan+1:pan,a=Math.cos(x*Math.PI/2),b=Math.sin(x*Math.PI/2);if(mono)return [l*a,l*b];const scale=expandedMono?1/Math.sqrt(2+2*Math.sin(Math.abs(pan)*Math.PI/2)):1;return pan<=0?[(l+r*a)*scale,r*b*scale]:[l*a*scale,(r+l*b)*scale];}
class Mixer {
 constructor({tracks,masterEffects,sampleRate,definitions,registry=new Map(),report=true,bpm=110,masterDb=0}){this.tracks=tracks;this.sr=sampleRate;this.bpm=bpm;this.masterDb=masterDb;this.report=report;this.registry=registry;this.levels={};this.frames=0;this.outputReadout=null;this.outputMeter=report?new D.Meter(sampleRate,true):null;this.tempL=new Float32Array(quantum);this.tempR=new Float32Array(quantum);this.mixL=new Float32Array(quantum);this.mixR=new Float32Array(quantum);this.postL=new Float32Array(quantum);this.postR=new Float32Array(quantum);
  const chain=effects=>effects.map(e=>{const c=new Effect(e,sampleRate,definitions,report);registry.set(e.id,c);return c;});
  this.channels=tracks.map(track=>{if(track.buffer.sampleRate!==sampleRate)throw Error('Audio must be resampled to the mixer rate before playback.');const left=track.buffer.getChannelData(0),right=track.buffer.numberOfChannels>1?track.buffer.getChannelData(1):left;return {track,left,right,chain:chain(track.effects),monoSource:track.buffer.numberOfChannels===1,mono:track.buffer.numberOfChannels===1&&!track.effects.some(e=>root.GhostPacks.definitions[e.type]),peak:0,level:track.mute||(tracks.some(t=>t.solo)&&!track.solo)?0:D.gain(track.gainDb),pan:track.pan};});this.masterChain=chain(masterEffects);
 }
 process(outputL,outputR,startTime,{period=0,bpm=this.bpm,masterDb=this.masterDb,applyMaster=true}={}){outputL.fill(0);outputR.fill(0);const anySolo=this.tracks.some(t=>t.solo);let offset=0;
  while(offset<outputL.length){const absoluteFrame=Math.round(startTime*this.sr)+offset,loopFrames=period?Math.max(1,Math.round(period*this.sr)):0,frame=loopFrames&&absoluteFrame>=0?((absoluteFrame%loopFrames)+loopFrames)%loopFrames:absoluteFrame;let size=Math.min(quantum,outputL.length-offset);if(loopFrames&&frame>=0)size=Math.min(size,loopFrames-frame);if(frame<0){size=Math.min(size,-frame);offset+=size;continue;}const time=frame/this.sr,mixL=this.mixL.subarray(0,size),mixR=this.mixR.subarray(0,size);mixL.fill(0);mixR.fill(0);
   for(const channel of this.channels){const {track:t,chain,left,right}=channel,l=this.tempL.subarray(0,size),r=this.tempR.subarray(0,size);l.fill(0);r.fill(0);const clipStart=Math.round(t.start*this.sr),trimIn=Math.round(t.trimStart*this.sr),trimOut=Math.min(left.length,Math.round(t.trimEnd*this.sr));for(let i=0;i<size;i++){const relative=frame+i-clipStart,source=trimIn+relative;if(relative>=0&&source>=trimIn&&source<trimOut){l[i]=left[source];r[i]=right[source];}}
    for(const fx of chain)fx.process(l,r,time,bpm);const target=t.mute||(anySolo&&!t.solo)?0:D.gain(t.gainDb),step=1-Math.exp(-1/(this.sr*.012));for(let i=0;i<size;i++){channel.level+=step*(target-channel.level);channel.pan+=step*(t.pan-channel.pan);const x=channel.mono?(channel.pan+1)*.5:channel.pan<=0?channel.pan+1:channel.pan,a=Math.cos(x*Math.PI/2),b=Math.sin(x*Math.PI/2),level=channel.level*(channel.monoSource&&!channel.mono?1/Math.sqrt(2+2*Math.sin(Math.abs(channel.pan)*Math.PI/2)):1),ll=(channel.mono?l[i]*a:channel.pan<=0?l[i]+r[i]*a:l[i]*a)*level,rr=(channel.mono?l[i]*b:channel.pan<=0?r[i]*b:r[i]+l[i]*b)*level;mixL[i]+=ll;mixR[i]+=rr;channel.peak=Math.max(channel.peak,Math.abs(ll),Math.abs(rr));}}
   for(const fx of this.masterChain)fx.process(mixL,mixR,time,bpm);const gain=D.gain(masterDb),postL=this.postL.subarray(0,size),postR=this.postR.subarray(0,size);for(let i=0;i<size;i++){postL[i]=mixL[i]*gain;postR[i]=mixR[i]*gain;outputL[offset+i]=applyMaster?postL[i]:mixL[i];outputR[offset+i]=applyMaster?postR[i]:mixR[i];}if(this.report)this.outputMeter.process(postL,postR);this.frames+=size;if(this.frames>=this.sr/10){for(const c of this.channels){this.levels[c.track.id]=c.peak;c.peak=0;}if(this.report)this.outputReadout=this.outputMeter.read();this.frames=0;}offset+=size;
  }
 }
}
async function resample(buffer,rate,createBuffer){if(buffer.sampleRate===rate)return buffer;const scale=rate/buffer.sampleRate,length=Math.max(1,Math.round(buffer.length*scale)),result=createBuffer(buffer.numberOfChannels,length,rate),cutoff=Math.min(1,scale)*.94,radius=24;for(let c=0;c<buffer.numberOfChannels;c++){const input=buffer.getChannelData(c),output=result.getChannelData(c);for(let i=0;i<length;i++){const pos=i/scale,base=Math.floor(pos);let sum=0,weight=0;for(let j=base-radius+1;j<=base+radius;j++){const distance=pos-j,window=.5+.5*Math.cos(Math.PI*distance/radius),x=Math.PI*distance*cutoff,k=(Math.abs(x)<1e-10?1:Math.sin(x)/x)*cutoff*window;sum+=(j>=0&&j<input.length?input[j]:0)*k;weight+=k;}output[i]=weight?sum/weight:0;if(i%65536===0)await new Promise(resolve=>setTimeout(resolve,0));}}return result;}
function requiresRepair(tracks,masterEffects){return tracks.some(t=>root.GhostSources?.isDeferred(t.buffer))||root.GhostCompose?.needsPrepared(tracks)||[...masterEffects,...tracks.flatMap(t=>t.effects)].some(e=>e.type==='cleanup');}
async function processChain(planes,effects,sr,definitions,bpm,timeOffset,onProgress,checkCancelled){
 for(const effect of effects){
  checkCancelled?.();
  if(!effect.enabled&&!effect.automation?.enabled?.enabled)continue;
  if(effect.type==='cleanup'){planes=await root.GhostCleanup.restore(planes,sr,effect,timeOffset,p=>{checkCancelled?.();onProgress?.('Preparing Stem Cleanup · '+Math.round(p*100)+'%');});continue;}
  const fx=new Effect(effect,sr,definitions,false);
  for(let at=0;at<planes[0].length;at+=quantum){fx.process(planes[0].subarray(at,at+quantum),planes[1].subarray(at,at+quantum),timeOffset+at/sr,bpm);if(at%16384===0){checkCancelled?.();await new Promise(resolve=>setTimeout(resolve,0));}}
 }
 return planes;
}
async function sourcePlanes(t,sr,bpm,createBuffer,checkCancelled){
 // A separate scope releases the decoded source before effect processing begins.
 const decoded=await root.GhostSources.resolve(t.buffer,sr);checkCancelled?.();
 const source=await resample(decoded,sr,createBuffer),start=Math.round(t.trimStart*sr),end=Math.min(source.length,Math.round(t.trimEnd*sr));
 const length=Math.max(1,end-start+Math.ceil(root.GhostAudio.tail(t.effects,bpm)*sr));
 const planes=[new Float32Array(length),new Float32Array(length)];
 for(let c=0;c<2;c++){const data=source.getChannelData(Math.min(c,source.numberOfChannels-1));for(let i=0;i<end-start;i++){planes[c][i]=data[t.reverse?end-1-i:start+i]*(root.GhostCompose?.envelope(t,i/sr)??1);if(i%65536===0){checkCancelled?.();await new Promise(resolve=>setTimeout(resolve,0));}}}
 return planes;
}
function checkRenderMemory(tracks,masterEffects,sr,duration,bpm){
 const output=Math.ceil(duration*sr)*8,cleanup=effects=>effects.some(e=>e.type==='cleanup'&&(e.enabled||e.automation?.enabled?.enabled));
 // Bound the largest preparation step, rather than the sum of every stem in the song.
 let working=output*(cleanup(masterEffects)?3.5:1);
 const resident=root.GhostSources.usedBytes(tracks.map(t=>t.buffer));
 for(const t of tracks){if(t.disabled||t.mute||(tracks.some(x=>x.solo)&&!t.solo))continue;
  const planes=Math.ceil((t.trimEnd-t.trimStart+root.GhostAudio.tail(t.effects,bpm))*sr)*8;
  const decoded=t.buffer.length*t.buffer.numberOfChannels*4;
  const conversion=t.buffer.sampleRate===sr?0:Math.ceil(t.buffer.duration*sr)*t.buffer.numberOfChannels*4;
  working=Math.max(working,output+planes*(cleanup(t.effects)?3.5:1),output+planes+decoded+conversion);
 }
 if(working+resident>512*1024*1024)throw Error('This playback or export needs too much working audio memory. Shorten the longest clip or choose a lower export sample rate. Your original stems are unchanged.');
}
async function renderRepair({tracks,masterEffects,sampleRate:sr,definitions,duration,bpm,masterDb,createBuffer,onProgress,checkCancelled}){
 checkRenderMemory(tracks,masterEffects,sr,duration,bpm);
 const output=createBuffer(2,Math.ceil(duration*sr),sr),left=output.getChannelData(0),right=output.getChannelData(1);
 for(let index=0;index<tracks.length;index++){
  checkCancelled?.();const t=tracks[index];if(t.disabled||t.mute||(tracks.some(x=>x.solo)&&!t.solo))continue;onProgress?.('Preparing stem '+(index+1)+' of '+tracks.length+' · '+t.name);
  let planes=await sourcePlanes(t,sr,bpm,createBuffer,checkCancelled);
  planes=await processChain(planes,t.effects,sr,definitions,bpm,t.start,onProgress,checkCancelled);
  const mono=t.buffer.numberOfChannels===1&&!t.effects.some(e=>root.GhostPacks.definitions[e.type]),at=Math.round(t.start*sr);
  for(let i=0;i<planes[0].length&&at+i<left.length;i++){const time=t.start+i/sr,pan=root.GhostCompose?.automation(t.trackAutomation?.pan,time,t.pan)??t.pan,volume=root.GhostCompose?.automation(t.trackAutomation?.gainDb,time,t.gainDb)??t.gainDb,v=trackPan(planes[0][i],planes[1][i],pan,mono,t.buffer.numberOfChannels===1&&!mono),automatedLevel=D.gain(volume);left[at+i]+=v[0]*automatedLevel;right[at+i]+=v[1]*automatedLevel;if(i%65536===0){checkCancelled?.();await new Promise(resolve=>setTimeout(resolve,0));}}
  planes=null;
 }
 const result=await processChain([left,right],masterEffects,sr,definitions,bpm,0,onProgress,checkCancelled),gain=D.gain(masterDb);
 for(let i=0;i<left.length;i++){left[i]=result[0][i]*gain;right[i]=result[1][i]*gain;if(i%65536===0){checkCancelled?.();await new Promise(resolve=>setTimeout(resolve,0));}}
 return output;
}
async function render(options){
 const {tracks,masterEffects,sampleRate,definitions,duration,bpm,masterDb,createBuffer,onProgress}=options;
 if(requiresRepair(tracks,masterEffects))return renderRepair(options);
 const buffers=new Map(),converted=[];for(const t of tracks){if(!buffers.has(t.buffer))buffers.set(t.buffer,await resample(t.buffer,sampleRate,createBuffer));converted.push({...t,buffer:buffers.get(t.buffer)});}const output=createBuffer(2,Math.ceil(duration*sampleRate),sampleRate),l=output.getChannelData(0),r=output.getChannelData(1),mixer=new Mixer({tracks:converted,masterEffects,sampleRate,definitions,report:false,bpm,masterDb});
 for(let offset=0;offset<l.length;offset+=quantum){mixer.process(l.subarray(offset,offset+quantum),r.subarray(offset,offset+quantum),offset/sampleRate);if(offset%16384===0){onProgress?.('Preparing playback · '+Math.round(offset/l.length*100)+'%');await new Promise(resolve=>setTimeout(resolve,0));}}return output;
}
const api={Effect,Mixer,resample,render,renderRepair,requiresRepair,trackPan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GhostRender=api;
})(typeof globalThis!=='undefined'?globalThis:this);
