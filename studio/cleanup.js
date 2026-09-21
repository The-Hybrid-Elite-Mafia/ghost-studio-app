/* Non-destructive, time-aligned source repair. Runs before buffered playback/export. */
(function(root){
'use strict';
const N=1024,H=N/4,EPS=1e-20;
const window=Float64Array.from({length:N},(_,i)=>Math.sqrt(.5-.5*Math.cos(2*Math.PI*i/N)));
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
const db=x=>20*Math.log10(Math.max(1e-6,x));
function fft(re,im,inverse=false){
 for(let i=1,j=0;i<N;i++){let bit=N>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
 for(let len=2;len<=N;len*=2){const a=(inverse?2:-2)*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let start=0;start<N;start+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const x=start+j,y=x+len/2,tr=re[y]*cr-im[y]*ci,ti=re[y]*ci+im[y]*cr;re[y]=re[x]-tr;im[y]=im[x]-ti;re[x]+=tr;im[x]+=ti;const next=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=next;}}}
 if(inverse)for(let i=0;i<N;i++){re[i]/=N;im[i]/=N;}
}
function isolatedImpulse(data,i){
 if(i<4||i>=data.length-4||Math.abs(data[i])<=.035)return false;
 let peak=0;for(let d=1;d<=4;d++)peak=Math.max(peak,Math.abs(data[i-d]),Math.abs(data[i+d]));
 return Math.abs(data[i])>peak*4+.035&&Math.abs(data[i]-(data[i-1]+data[i+1])*.5)>.06;
}
function spectrum(planes,offset){const power=new Float64Array(N/2+1),re=new Float64Array(N),im=new Float64Array(N);for(const data of planes){im.fill(0);for(let i=0;i<N;i++)re[i]=(data[offset+i]||0)*window[i];fft(re,im);for(let k=0;k<power.length;k++)power[k]+=(re[k]*re[k]+im[k]*im[k])/(N/2*planes.length);}return power;}
function validateProfile(value){
 if(value==null)return null;
 if(value.fftSize!==N||!Number.isFinite(value.sampleRate)||value.sampleRate<8000||value.sampleRate>192000||!Array.isArray(value.power)||value.power.length!==N/2+1||value.power.some(v=>!Number.isFinite(v)||v<0||v>10000))throw Error('Invalid cleanup noise profile.');
 return {fftSize:N,sampleRate:value.sampleRate,power:value.power.slice(),source:'quiet-section estimate'};
}
async function inspect(buffer,start=0,end=buffer.length){
 const planes=Array.from({length:buffer.numberOfChannels},(_,c)=>buffer.getChannelData(c)),sr=buffer.sampleRate,hop=Math.max(N,Math.round(sr*.05)),blocks=[];let clicks=0;
 for(let at=start;at<end;at+=hop){let sum=0,count=0;const stop=Math.min(end,at+hop);for(const data of planes)for(let i=at;i<stop;i++){sum+=data[i]*data[i];count++;if(i>=start+4&&i<end-4&&isolatedImpulse(data,i))clicks++;}blocks.push({at,rms:Math.sqrt(sum/Math.max(1,count))});if(blocks.length%64===0)await pause();}
 const result={impulses:clicks,noiseCandidate:false,noiseFloorDb:null,profile:null,reason:'No reliable quiet-section noise estimate. Continuous music and wanted transients are left intact.'};
 if(blocks.length<8)return result;
 const sorted=blocks.map(x=>x.rms).sort((a,b)=>a-b),floor=sorted[Math.floor(sorted.length*.2)],active=sorted[Math.floor(sorted.length*.8)];
 if(db(floor)<-85||db(floor)>-24||db(active)-db(floor)<12)return result;
 const quiet=blocks.filter((b,i)=>b.rms>floor*.5&&b.rms<floor*1.7&&blocks[i-1]?.rms<floor*1.7&&blocks[i+1]?.rms<floor*1.7&&b.at+N<=end);
 if(quiet.length<3)return result;
 const power=new Float64Array(N/2+1),chosen=quiet.filter((_,i)=>i%Math.max(1,Math.ceil(quiet.length/32))===0);
 for(const b of chosen){const p=spectrum(planes,b.at);for(let k=0;k<p.length;k++)power[k]+=p[k]/chosen.length;}
 let log=0,sum=0,count=0;for(let k=3;k<power.length;k++){const hz=k*sr/N;if(hz<150||hz>Math.min(16000,sr*.45))continue;log+=Math.log(power[k]+EPS);sum+=power[k];count++;}
 const flatness=Math.exp(log/Math.max(1,count))/(sum/Math.max(1,count)+EPS);
 if(flatness<.25)return result;
 result.noiseCandidate=true;result.noiseFloorDb=db(Math.sqrt(chosen.reduce((s,b)=>s+b.rms*b.rms,0)/chosen.length));result.profile={fftSize:N,sampleRate:sr,power:Array.from(power),source:'quiet-section estimate'};
 result.reason='Quiet sections contain noise-like spectral energy, approximately '+result.noiseFloorDb.toFixed(1)+' dBFS RMS, with '+(db(active)-db(floor)).toFixed(1)+' dB contrast to active sections. This is an estimate, not a noise-only recording.';
 return result;
}
function value(effect,key,time){const base=key==='enabled'?+effect.enabled:effect.params[key];return root.GhostDSP.automationValue(effect.automation?.[key],time,base);}
async function restore(input,sr,effect,timeOffset=0,onProgress=null){
 const variable=Object.values(effect.automation||{}).some(l=>l.enabled&&l.points?.length);
 if(!variable&&(!effect.enabled||!effect.params.mix||(!effect.params.noiseReduction&&!effect.params.clickRepair)))return input;
 const length=input[0].length,planes=input.map(x=>x.slice()),originalProfile=validateProfile(effect.noiseProfile),noise=new Float64Array(N/2+1);
 for(let k=0;k<noise.length;k++){if(originalProfile){const at=k*sr/originalProfile.sampleRate,lo=Math.floor(at),fraction=at-lo;noise[k]=at>N/2?0:((originalProfile.power[lo]||0)*(1-fraction)+(originalProfile.power[Math.min(N/2,lo+1)]||0)*fraction)*originalProfile.sampleRate/sr;}else noise[k]=10**(effect.params.noiseFloor/10);}
 // Only isolated single-sample outliers qualify. No clipping reconstruction is attempted.
 for(let c=0;c<planes.length;c++){const dry=input[c],out=planes[c];for(let i=4;i<length-4;i++){if(isolatedImpulse(dry,i)){const time=timeOffset+i/sr,amount=value(effect,'enabled',time)>=.5?value(effect,'clickRepair',time)/100:0;out[i]=dry[i]+((dry[i-1]+dry[i+1])*.5-dry[i])*amount;}if(i%65536===0)await pause();}}
 const output=input.map(()=>new Float32Array(length)),normal=new Float32Array(length),re=planes.map(()=>new Float64Array(N)),im=planes.map(()=>new Float64Array(N)),smooth=new Float64Array(N/2+1).fill(1),target=new Float64Array(smooth.length),power=new Float64Array(smooth.length);
 const open=Math.exp(-H/(sr*.02)),close=Math.exp(-H/(sr*.12));let blocks=0;
 for(let at=-N+H;at<length;at+=H){
  const time=timeOffset+Math.max(0,at+N/2)/sr,enabled=value(effect,'enabled',time)>=.5,amount=enabled?Math.max(0,Math.min(12,value(effect,'noiseReduction',time))):0,minGain=10**(-amount/20);
  power.fill(0);
  for(let c=0;c<planes.length;c++){im[c].fill(0);for(let i=0;i<N;i++){const pos=at+i;re[c][i]=(pos>=0&&pos<length?planes[c][pos]:0)*window[i];}fft(re[c],im[c]);for(let k=0;k<power.length;k++)power[k]=Math.max(power[k],(re[c][k]**2+im[c][k]**2)/(N/2));}
  for(let k=0;k<power.length;k++){const floor=originalProfile?noise[k]:10**(value(effect,'noiseFloor',time)/10);target[k]=amount===0||power[k]>floor*12?1:Math.max(minGain,Math.sqrt(Math.max(0,1-floor/(power[k]+EPS))));}
  for(let k=0;k<smooth.length;k++){let sum=0,n=0;for(let j=Math.max(0,k-2);j<=Math.min(smooth.length-1,k+2);j++){sum+=target[j];n++;}const t=sum/n,a=t>smooth[k]?open:close;smooth[k]=t+(smooth[k]-t)*a;}
  for(let c=0;c<planes.length;c++){for(let k=0;k<N;k++){const g=smooth[k<=N/2?k:N-k];re[c][k]*=g;im[c][k]*=g;}fft(re[c],im[c],true);for(let i=0;i<N;i++){const pos=at+i;if(pos>=0&&pos<length){output[c][pos]+=re[c][i]*window[i];if(c===0)normal[pos]+=window[i]*window[i];}}}
  if(++blocks%24===0){onProgress?.(Math.min(1,(at+N)/length));await pause();}
 }
 for(let i=0;i<length;i++){const time=timeOffset+i/sr,wet=value(effect,'enabled',time)>=.5?value(effect,'mix',time)/100:0;for(let c=0;c<input.length;c++){const v=normal[i]?output[c][i]/normal[i]:input[c][i];output[c][i]=input[c][i]+(v-input[c][i])*wet;if(!Number.isFinite(output[c][i]))throw Error('Cleanup returned an invalid sample. Original audio is unchanged.');}if(i%65536===0)await pause();}
 return output;
}
root.GhostCleanup={inspect,restore,validateProfile,isolatedImpulse,fft};
})(typeof globalThis!=='undefined'?globalThis:this);
