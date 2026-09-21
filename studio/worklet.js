/* Executed only inside the audio rendering thread. */
(function(){
'use strict';
const registered=globalThis.GhostWorkletRegistrations||(globalThis.GhostWorkletRegistrations=new Set());
for(const [type,def] of Object.entries(GhostPacks.definitions)){
 if(def.offline)continue;
 if(registered.has('ghost-'+type))continue;
 class GhostProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors(){return [{name:'enabled',defaultValue:0,minValue:0,maxValue:1,automationRate:'k-rate'},...Object.entries(def.params).map(([name,r])=>({name,defaultValue:r[2],minValue:r[0],maxValue:r[1],automationRate:'k-rate'}))];}
  constructor(options){super();this.dsp=new GhostDSP.Processor(type,sampleRate);this.p=GhostPacks.defaults(type);this.inputMeter=new GhostDSP.Meter(sampleRate);this.outputMeter=new GhostDSP.Meter(sampleRate,type==='final'||type==='masterrack');this.automation={};this.bpm=110;this.origin=0;this.period=0;this.blocks=0;this.zero=new Float32Array(128);this.gr=0;this.bands=[0,0,0,0];this.report=options.processorOptions?.report!==false;this.manual={};this.port.onmessage=({data:d})=>{if(d.kind==='dispose'){this.disposed=true;return;}if(d.kind==='state'){this.automation=d.automation||{};this.bpm=d.bpm||110;this.manual={};}else if(d.kind==='clock'){this.origin=d.origin;this.period=d.period||0;}else if(d.kind==='override'){this.manual[d.key]=d.value;}else if(d.kind==='resetMeters'){this.inputMeter=new GhostDSP.Meter(sampleRate);this.outputMeter=new GhostDSP.Meter(sampleRate,type==='final'||type==='masterrack');}};}
  process(inputs,outputs,parameters){if(this.disposed)return false;const output=outputs[0];if(!output?.length)return true;const size=output[0].length;if(this.zero.length!==size)this.zero=new Float32Array(size);const left=inputs[0]?.[0]||this.zero,right=inputs[0]?.[1]||left,outL=output[0],outR=output[1]||output[0];let time=currentFrame/sampleRate-this.origin;if(this.period&&time>=0)time%=this.period;
   for(const [key,r] of Object.entries(def.params)){let v=this.manual[key]??GhostDSP.automationValue(this.automation[key],time,parameters[key][0]);const options=def.choices[key];v=GhostDSP.clamp(v,r[0],r[1]);if(options)v=options.reduce((a,b)=>Math.abs(b[0]-v)<Math.abs(a[0]-v)?b:a)[0];this.p[key]=v;}
   const enabled=(this.manual.enabled??GhostDSP.automationValue(this.automation.enabled,time,parameters.enabled[0]))>=.5;
   if(this.report)this.inputMeter.process(left,right);if(enabled)this.dsp.configure(this.p,this.bpm);this.dsp.process(left,right,outL,outR,enabled);
   for(let i=0;i<size;i++)if(!Number.isFinite(outL[i])||!Number.isFinite(outR[i])){outL[i]=0;outR[i]=0;this.port.postMessage({kind:'fault',message:'An audio processor returned a non-finite sample and was silenced.'});}
   if(this.report)this.outputMeter.process(outL,outR);this.gr=Math.max(this.gr,enabled?this.dsp.gr:0);for(let i=0;i<4;i++)this.bands[i]=Math.max(this.bands[i],enabled?this.dsp.bandActivity[i]:0);
   if(++this.blocks>=Math.ceil(sampleRate/size/10)){if(this.report)this.port.postMessage({kind:'meters',input:this.inputMeter.read(),output:this.outputMeter.read(),gr:this.gr,bands:this.bands,enabled,params:this.p});this.blocks=0;this.gr=0;this.bands=[0,0,0,0];}return true;
  }
 }
 registerProcessor('ghost-'+type,GhostProcessor);registered.add('ghost-'+type);
}
class GhostOutputMeter extends AudioWorkletProcessor {
 constructor(){super();this.port.onmessage=({data})=>{if(data.kind==='dispose')this.disposed=true;};this.meter=new GhostDSP.Meter(sampleRate,true);this.zero=new Float32Array(128);this.blocks=0;}
 process(inputs,outputs){if(this.disposed)return false;const out=outputs[0];if(!out?.length)return true;if(this.zero.length!==out[0].length)this.zero=new Float32Array(out[0].length);const l=inputs[0]?.[0]||this.zero,r=inputs[0]?.[1]||l;out[0].set(l);if(out[1])out[1].set(r);this.meter.process(l,r);if(++this.blocks>=Math.ceil(sampleRate/l.length/10)){this.port.postMessage({kind:'meters',output:this.meter.read()});this.blocks=0;}return true;}
}
if(!registered.has('ghost-output-meter')){registerProcessor('ghost-output-meter',GhostOutputMeter);registered.add('ghost-output-meter');}
})();
