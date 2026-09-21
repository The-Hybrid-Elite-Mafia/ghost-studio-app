/* Ghost DSP, original algorithms. Shared by AudioWorklet and offline signal tests. */
(function(root){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), db=x=>20*Math.log10(Math.max(1e-12,x)), gain=x=>10**(x/20), PI=Math.PI;
const mix=(dry,wet,m)=>dry+(wet-dry)*m;
class Biquad {
 constructor(sr){this.sr=sr;this.z1=[0,0];this.z2=[0,0];this.key='';this.b0=1;this.b1=this.b2=this.a1=this.a2=0;this.off=true;}
 set(type,f=1000,q=.707,g=0){const key=[type,f,q,g].join('/');if(key===this.key)return;this.key=key;this.off=!f||((type==='peak'||type==='lowShelf'||type==='highShelf')&&g===0);if(this.off){this.z1.fill(0);this.z2.fill(0);return;}
  const w=2*PI*clamp(f,1,this.sr*.475)/this.sr,c=Math.cos(w),s=Math.sin(w),A=10**(g/40),alpha=s/(2*Math.max(.1,q)),beta=2*Math.sqrt(A)*alpha;let b0,b1,b2,a0,a1,a2;
  if(type==='low'){b0=(1-c)/2;b1=1-c;b2=b0;a0=1+alpha;a1=-2*c;a2=1-alpha;}
  else if(type==='high'){b0=(1+c)/2;b1=-(1+c);b2=b0;a0=1+alpha;a1=-2*c;a2=1-alpha;}
  else if(type==='band'){b0=alpha;b1=0;b2=-alpha;a0=1+alpha;a1=-2*c;a2=1-alpha;}
  else if(type==='peak'){b0=1+alpha*A;b1=-2*c;b2=1-alpha*A;a0=1+alpha/A;a1=-2*c;a2=1-alpha/A;}
  else if(type==='lowShelf'){b0=A*((A+1)-(A-1)*c+beta);b1=2*A*((A-1)-(A+1)*c);b2=A*((A+1)-(A-1)*c-beta);a0=(A+1)+(A-1)*c+beta;a1=-2*((A-1)+(A+1)*c);a2=(A+1)+(A-1)*c-beta;}
  else {b0=A*((A+1)+(A-1)*c+beta);b1=-2*A*((A-1)+(A+1)*c);b2=A*((A+1)+(A-1)*c-beta);a0=(A+1)-(A-1)*c+beta;a1=2*((A-1)-(A+1)*c);a2=(A+1)-(A-1)*c-beta;}
  this.b0=b0/a0;this.b1=b1/a0;this.b2=b2/a0;this.a1=a1/a0;this.a2=a2/a0;
 }
 tick(x,c){if(this.off)return x;const y=this.b0*x+this.z1[c];this.z1[c]=this.b1*x-this.a1*y+this.z2[c];this.z2[c]=this.b2*x-this.a2*y;return y;}
}
class DelayLine {
 constructor(n){this.data=new Float32Array(Math.ceil(n)+4);this.at=0;}
 read(delay){let pos=this.at-clamp(delay,1,this.data.length-2);if(pos<0)pos+=this.data.length;const i=Math.floor(pos),a=pos-i;return this.data[i]*(1-a)+this.data[(i+1)%this.data.length]*a;}
 write(x){this.data[this.at]=x;this.at=(this.at+1)%this.data.length;}
}
function color(x,amount,bias=0){if(!amount)return x;const k=1+amount*.045,b=bias*.002;return (Math.tanh(x*k+b)-Math.tanh(b))/k;}
function reduction(level,threshold,ratio,knee=0){const x=db(level)-threshold,slope=1-1/ratio;if(!knee)return Math.max(0,x)*slope;if(x<=-knee/2)return 0;if(x>=knee/2)return x*slope;return slope*(x+knee/2)**2/(2*knee);}
function coeff(ms,sr){return Math.exp(-1/(Math.max(.05,ms)*.001*sr));}
class Processor {
 constructor(type,sr){this.type=type;this.sr=sr;this.f=Array.from({length:16},()=>new Biquad(sr));this.env=[0,0];this.slow=[0,0];this.phase=[0,.31];this.gr=0;this.bandActivity=[0,0,0,0];this.p={};this.frame=0;this.limitGain=1;this.out=[0,0];
  if(type==='masterrack'){this.children=root.GhostPacks.rackOrder.map(([prefix,type])=>({prefix,proc:new Processor(type,sr),p:{}}));}
  if(type==='doubler')this.delays=[new DelayLine(sr*.25),new DelayLine(sr*.25)];
  if(type==='delay')this.delays=[new DelayLine(sr*.7),new DelayLine(sr*.7)];
  if(type==='throw')this.delays=[new DelayLine(sr*8.1),new DelayLine(sr*8.1)];
  if(type==='plate'){this.pre=[new DelayLine(sr*.2),new DelayLine(sr*.2)];this.lengths=[1423,1559,1747,1999,2137,2371,2539,2797].map(n=>n*sr/48000);this.lines=this.lengths.map(n=>new DelayLine(n+sr*.004));this.damped=new Float64Array(8);this.reads=new Float64Array(8);this.decays=new Float64Array(8);}
 }
 configure(params,bpm=110){const p=this.p=params,f=this.f;this.bpm=bpm;this.wet=(p.mix??100)/100;this.inGain=gain(p.inputDrive??p.input??0);this.outGain=gain(p.output??p.gain??p.makeup??0);this.a=coeff(p.attack??10,this.sr);this.r=coeff(p.release??100,this.sr);this.gr=0;this.bandActivity.fill(0);this.neutral=(p.mix===0)||((this.type==='mastereq')&&![p.hpf,p.lowShelf,p.lowMidTilt,p.presence,p.airShelf,p.deHarsh,p.output].some(Boolean))||((this.type==='imager')&&![p.width,p.lowMono,p.midSpread,p.highWidth,p.centerFocus,p.msBalance,p.output].some(Boolean))||((this.type==='dynamic')&&![p.lowControl,p.lowMidControl,p.presenceControl,p.harshnessControl,p.output].some(Boolean))||((this.type==='final')&&![p.inputDrive,p.clipAmount,p.limiterAmount,p.tone].some(Boolean));
  switch(this.type){
   case 'highpass':case 'lowpass':f[0].set(this.type==='highpass'?'high':'low',p.frequency,p.Q);break;
   case 'lowshelf':case 'highshelf':case 'peaking':f[0].set(this.type==='lowshelf'?'lowShelf':this.type==='highshelf'?'highShelf':'peak',p.frequency,p.Q??.707,p.gain);break;
   case 'compressor':this.a=coeff(p.attack,this.sr);this.r=coeff(p.release,this.sr);this.outGain=gain(p.makeup);break;
   case 'vocal73': f[0].set('high',p.hpf);f[1].set('lowShelf',150,.707,p.body);f[2].set('peak',2700,.65,p.presence);f[3].set('highShelf',10000,.707,p.air);break;
   case 'deesser': f[0].set('band',p.frequency,1.5);f[1].set('high',Math.max(1800,p.frequency*.65));f[2].set('high',Math.min(this.sr*.45,p.frequency*1.7));this.a=coeff(.3+p.smoothness*.04,this.sr);this.r=coeff(30+p.smoothness*1.5,this.sr);break;
   case 'fet':case 'glue':f[0].set('high',p.sidechainHPF);break;
   case 'opto':f[0].set('highShelf',2500,.707,p.emphasis*.09);this.a=coeff(8,this.sr);this.r=coeff(90,this.sr);this.slowR=coeff(900,this.sr);break;
   case 'vocalair':f[0].set('high',p.hpf);f[1].set('lowShelf',170,.707,p.body);f[2].set('peak',350,.65,-p.mudCut*.08);f[3].set('peak',3000,.6,p.presence);f[4].set('highShelf',11000,.707,p.air*.08);f[5].set('peak',3800,.7,-p.deHarsh*.06);break;
   case 'doubler':this.rates=[1-2**(p.leftDetune/1200),1-2**(p.rightDetune/1200)];this.base=[p.leftDelay*this.sr/1000,p.rightDelay*this.sr/1000];break;
   case 'plate':f[0].set('high',p.lowCut);f[1].set('low',p.highCut);this.dampCoeff=1-Math.exp(-2*PI*(1200+(100-p.damping)*65+p.brightness*40)/this.sr);for(let i=0;i<8;i++)this.decays[i]=.001**(this.lengths[i]/this.sr/p.decay);break;
   case 'throw':this.delaySamples=clamp((p.sync?(60/bpm)*[.25,.5,.75,1,1.5,2,4][Math.round(p.division)]:p.time/1000)*this.sr,1,this.sr*8);f[0].set('low',p.tone<0?17000*2**(p.tone/26):19500);f[1].set('high',p.tone>0?20+p.tone*8:20);this.a=coeff(5,this.sr);this.r=coeff(180,this.sr);break;
   case 'mastereq':f[0].set('high',p.hpf);f[1].set('lowShelf',90,.707,p.lowShelf);f[2].set('peak',350,.5,p.lowMidTilt);f[3].set('peak',2600,.5,p.presence);f[4].set('highShelf',12000,.707,p.airShelf);f[5].set('peak',4000,.65,-p.deHarsh*.05);break;
   case 'varimu':this.a=coeff(10+p.timeConstant*12,this.sr);this.r=coeff(120+p.timeConstant*160,this.sr);f[0].set('highShelf',6000,.707,-p.tone*.012);f[1].set('lowShelf',180,.707,p.tone*.006);break;
   case 'passive':f[0].set('lowShelf',p.lowFrequency,.707,p.lowBoost);f[1].set('lowShelf',p.lowFrequency*2.3,.707,-p.lowAttenuation);f[2].set('peak',p.highFrequency,1.2-p.bandwidth*.009,p.highBoost);f[3].set('highShelf',p.highFrequency*.85,.707,-p.highAttenuation);break;
   case 'tape':f[0].set('peak',p.speed===15?65:95,.7,p.headBump*.035);f[1].set('highShelf',p.speed===15?4500:7500,.707,-p.hfSmooth*(p.speed===15?.065:.045));f[2].set('high',p.bias&&p.saturation?8:0);break;
   case 'imager':f[0].set('high',p.lowMono);f[1].set('low',250);f[2].set('low',4000);break;
   case 'dynamic':[80,320,2500,5500].forEach((hz,i)=>{f[i].set('band',hz,.9);});this.a=coeff(3+p.smoothness*.3,this.sr);this.r=coeff(60+p.smoothness*4,this.sr);break;
   case 'final':f[0].set('low',140);f[1].set('highShelf',6500,.707,p.tone);this.cap=gain(p.ceiling-(p.overshoot?.7:0));break;
   case 'masterrack':for(const c of this.children){for(const key of Object.keys(root.GhostPacks.definitions[c.proc.type].params))c.p[key]=p[c.prefix+'_'+key];c.on=p[c.prefix+'On']>=.5;c.proc.configure(c.p,bpm);}this.outGain=gain(p.outputGain);break;
  }
 }
 follower(x,c=0){const abs=Math.abs(x),k=abs>this.env[c]?this.a:this.r;this.env[c]=abs+(this.env[c]-abs)*k;return this.env[c];}
 filters(x,c,count){for(let i=0;i<count;i++)x=this.f[i].tick(x,c);return x;}
 sample(L,R){if(this.neutral){this.out[0]=L;this.out[1]=R;return this.out;}const p=this.p,f=this.f;let l=L,r=R,m=this.wet;
  switch(this.type){
   case 'gain':l=L*this.outGain;r=R*this.outGain;break;
   case 'highpass':case 'lowpass':case 'lowshelf':case 'highshelf':case 'peaking':l=f[0].tick(L,0);r=f[0].tick(R,1);break;
   case 'compressor':{const env=this.follower(Math.max(Math.abs(L),Math.abs(R))),gr=reduction(env,p.threshold,p.ratio,p.knee),g=gain(-gr)*this.outGain;this.gr=Math.max(this.gr,gr);l=L*g;r=R*g;break;}
   case 'delay':{l=this.delays[0].read(Math.max(1,p.time*this.sr/1000));r=this.delays[1].read(Math.max(1,p.time*this.sr/1000));this.delays[0].write(L+l*p.feedback/100);this.delays[1].write(R+r*p.feedback/100);break;}
   case 'saturation':l=Math.tanh(L*p.drive)/Math.tanh(p.drive);r=Math.tanh(R*p.drive)/Math.tanh(p.drive);break;
   case 'vocal73':l=this.filters(L*this.inGain,0,4);r=this.filters(R*this.inGain,1,4);{const amount=p.saturation+(p.toneMode===0?0:p.inputDrive*(p.toneMode===1?1:1.8));l=color(l,amount,p.toneMode===1?20:0)*this.outGain;r=color(r,amount,p.toneMode===1?20:0)*this.outGain;}break;
   case 'deesser':{const a=f[0].tick(L,0),b=f[0].tick(R,1),env=this.follower(Math.max(Math.abs(a),Math.abs(b))),gr=Math.min(p.range,Math.max(0,db(env)-p.threshold)),g=gain(-gr);this.gr=Math.max(this.gr,gr);const hiL=f[1].tick(L,0),hiR=f[1].tick(R,1),airL=f[2].tick(L,0),airR=f[2].tick(R,1);l=p.monitor?a:p.mode?L+(g-1)*(a-airL*p.airPreserve/100):L*g+(1-g)*airL*p.airPreserve/100;r=p.monitor?b:p.mode?R+(g-1)*(b-airR*p.airPreserve/100):R*g+(1-g)*airR*p.airPreserve/100;break;}
   case 'fet':case 'glue':{l=L*this.inGain;r=R*this.inGain;const detector=Math.max(Math.abs(f[0].tick(l,0)),Math.abs(f[0].tick(r,1)));if(p.autoRelease)this.r=coeff(p.release*(1+Math.min(3,this.env[0]*5)),this.sr);const env=this.follower(detector),gr=reduction(env,this.type==='fet'?-18:p.threshold,p.ratio,this.type==='fet'?3:6),g=gain(-gr);this.gr=Math.max(this.gr,gr);l=color(l*g,p.presenceDrive||0)*this.outGain;r=color(r*g,p.presenceDrive||0)*this.outGain;break;}
   case 'opto':{const x=Math.max(Math.abs(f[0].tick(L,0)),Math.abs(f[0].tick(R,1))),fast=this.follower(x);this.slow[0]=Math.max(fast,this.slow[0]*this.slowR);const level=fast*.75+this.slow[0]*.25,gr=p.peakReduction?reduction(level,-p.peakReduction*.48,p.mode?10:3,12):0,g=gain(-gr);this.gr=Math.max(this.gr,gr);l=color(L*g,p.warmth,15)*this.outGain;r=color(R*g,p.warmth,15)*this.outGain;break;}
   case 'vocalair':l=this.filters(L,0,6)*this.outGain;r=this.filters(R,1,6)*this.outGain;break;
   case 'doubler':{const input=[L,R],wet=this.out;for(let c=0;c<2;c++){this.delays[c].write(input[c]);const rate=this.rates[c],window=this.sr*.045;let d;if(Math.abs(rate)<1e-10)d=this.delays[c].read(this.base[c]+1);else {this.phase[c]=(this.phase[c]+rate/window+1)%1;const ph=this.phase[c],ph2=(ph+.5)%1,w=Math.sin(PI*ph)**2;d=this.delays[c].read(this.base[c]+1+ph*window)*w+this.delays[c].read(this.base[c]+1+ph2*window)*(1-w);}const mod=p.modulation/100*.15*Math.sin(2*PI*this.frame/this.sr*(c?.37:.29));wet[c]=d*(1+mod);}const mid=(wet[0]+wet[1])*.5,side=(wet[0]-wet[1])*.5*(1+p.width/100),amount=p.amount/100,keep=p.centerKeep/100;l=L*(1-amount*(1-keep))+amount*(mid+side);r=R*(1-amount*(1-keep))+amount*(mid-side);break;}
   case 'plate':{this.pre[0].write(L);this.pre[1].write(R);const preL=p.preDelay?this.pre[0].read(p.preDelay*this.sr/1000+1):L,preR=p.preDelay?this.pre[1].read(p.preDelay*this.sr/1000+1):R;let sum=0,a=0,b=0;for(let i=0;i<8;i++){const modulation=p.modulation*.000012*this.sr*Math.sin(this.frame/this.sr*(.7+i*.17));const y=this.lines[i].read(this.lengths[i]+modulation);this.damped[i]+=this.dampCoeff*(y-this.damped[i]);this.reads[i]=this.damped[i];sum+=this.reads[i];a+=this.reads[i]*(i%2?1:-1);b+=this.reads[i]*(i%3?1:-1);}for(let i=0;i<8;i++){const feed=(sum*.25-this.reads[i])*this.decays[i],input=(i%2?preL:preR)*(i<4?1:-1)*.23;this.lines[i].write(feed+input);}l=f[1].tick(f[0].tick(a*.32,0),0);r=f[1].tick(f[0].tick(b*.32,1),1);const mid=(l+r)*.5,side=(l-r)*.5*(1+p.width/100);l=mid+side;r=mid-side;break;}
   case 'throw':{const freeze=p.freeze?1:0;this.freeze=(this.freeze||0)+.002*(freeze-(this.freeze||0));const a=this.delays[0].read(this.delaySamples),b=this.delays[1].read(this.delaySamples*(1+p.width*.0003)),feedback=p.feedback/100*(1-this.freeze)+this.freeze;const wa=f[1].tick(f[0].tick(a,0),0),wb=f[1].tick(f[0].tick(b,1),1);this.delays[0].write((1-this.freeze)*L+color(mix(wa,a,this.freeze),p.saturation*(1-this.freeze))*feedback);this.delays[1].write((1-this.freeze)*R+color(mix(wb,b,this.freeze),p.saturation*(1-this.freeze))*feedback);const env=this.follower(Math.max(Math.abs(L),Math.abs(R))),duck=1/(1+env*10*p.ducking/100),mid=(wa+wb)*.5,side=(wa-wb)*.5*(1+p.width/100);l=(mid+side)*duck*p.intensity/100;r=(mid-side)*duck*p.intensity/100;break;}
   case 'mastereq':{if(p.msMode){const mid=(L+R)*.5,side=(L-R)*.5,mm=p.msMode===1?this.filters(mid,0,6):mid,ss=p.msMode===2?this.filters(side,1,6):side;l=(mm+ss)*this.outGain;r=(mm-ss)*this.outGain;}else {l=this.filters(L,0,6)*this.outGain;r=this.filters(R,1,6)*this.outGain;}break;}
   case 'varimu':{l=L*this.inGain;r=R*this.inGain;const a=this.follower(l,0),b=this.follower(r,1),linked=Math.max(a,b),link=p.stereoLink/100,ea=mix(a,linked,link),eb=mix(b,linked,link),ga=reduction(ea,p.threshold,1.4+Math.min(3,Math.max(0,db(ea)-p.threshold)*.07),12),gb=reduction(eb,p.threshold,1.4+Math.min(3,Math.max(0,db(eb)-p.threshold)*.07),12);this.gr=Math.max(this.gr,ga,gb);l=f[1].tick(f[0].tick(color(l*gain(-ga),Math.abs(p.tone)*.25,20),0),0)*this.outGain;r=f[1].tick(f[0].tick(color(r*gain(-gb),Math.abs(p.tone)*.25,20),1),1)*this.outGain;break;}
   case 'passive':l=this.filters(L,0,4)*this.outGain;r=this.filters(R,1,4)*this.outGain;break;
   case 'tape':{l=this.filters(color(L*this.inGain,p.saturation*(p.speed===15?1.2:1),p.bias),0,3)*this.outGain;r=this.filters(color(R*this.inGain,p.saturation*(p.speed===15?1.2:1),p.bias),1,3)*this.outGain;break;}
   case 'imager':{let mid=(L+R)*.5,side=f[0].tick((L-R)*.5,0);const low=f[1].tick(side,0),notHigh=f[2].tick(side,0),high=side-notHigh,middle=notHigh-low;side=(low+middle*(1+p.midSpread/100)+high*(1+p.highWidth/100))*(1+p.width/100)*(1-p.centerFocus*.005)*gain(-Math.max(0,-p.msBalance)*.06);mid*=gain(-Math.max(0,p.msBalance)*.06);l=(mid+side)*this.outGain;r=(mid-side)*this.outGain;break;}
   case 'dynamic':{const amounts=[p.lowControl,p.lowMidControl,p.presenceControl,p.harshnessControl];for(let j=0;j<4;j++){const a=f[j].tick(L,0),b=f[j].tick(R,1),det=Math.max(Math.abs(a),Math.abs(b)),k=det>(this.slow[j]||0)?this.a:this.r;this.slow[j]=det+((this.slow[j]||0)-det)*k;const gr=Math.min(9,Math.max(0,db(this.slow[j])-(-12-p.sensitivity*.42)))*amounts[j]/100;this.bandActivity[j]=Math.max(this.bandActivity[j],gr);const g=gain(-gr)-1;l+=a*g;r+=b*g;}this.gr=Math.max(...this.bandActivity);l*=this.outGain;r*=this.outGain;break;}
   case 'final':{l=f[1].tick(L*this.inGain,0);r=f[1].tick(R*this.inGain,1);const lowL=f[0].tick(l,0)*p.lowProtect/100,lowR=f[0].tick(r,1)*p.lowProtect/100,drive=1+p.clipAmount*.025;const clip=x=>clamp(x,-this.cap,this.cap);l=mix(l,lowL+clip((l-lowL)*drive)/drive,p.clipAmount/100);r=mix(r,lowR+clip((r-lowR)*drive)/drive,p.clipAmount/100);const peak=Math.max(Math.abs(l),Math.abs(r)),target=peak>this.cap?this.cap/peak:1;this.limitGain=target<this.limitGain?target:target+(this.limitGain-target)*this.r;const g=mix(1,this.limitGain,p.limiterAmount/100);l*=g;r*=g;this.gr=Math.max(this.gr,-db(g));break;}
   case 'masterrack':{for(const c of this.children){if(c.on){const v=c.proc.sample(l,r);l=v[0];r=v[1];this.gr=Math.max(this.gr,c.proc.gr);}}l*=this.outGain;r*=this.outGain;break;}
  }
  this.frame++;this.out[0]=mix(L,l,m);this.out[1]=mix(R,r,m);return this.out;
 }
 process(left,right,outL=new Float32Array(left.length),outR=new Float32Array(left.length),enabled=true){for(let i=0;i<left.length;i++){if(enabled){const v=this.sample(left[i],right[i]);outL[i]=v[0];outR[i]=v[1];}else {outL[i]=left[i];outR[i]=right[i];}}return [outL,outR];}
}
// Windowed-sinc 4x interpolation estimates intersample peaks. Not a conformance meter.
class TruePeak {
 constructor(){this.n=24;this.at=0;this.data=[new Float64Array(this.n),new Float64Array(this.n)];this.kernels=[];for(let phase=1;phase<4;phase++){const k=new Float64Array(this.n),delay=this.n/2+phase/4;let sum=0;for(let j=0;j<this.n;j++){const x=j-delay,sinc=x===0?1:Math.sin(PI*x)/(PI*x),win=.42-.5*Math.cos(2*PI*j/(this.n-1))+.08*Math.cos(4*PI*j/(this.n-1));k[j]=sinc*win;sum+=k[j];}for(let j=0;j<this.n;j++)k[j]/=sum;this.kernels.push(k);}}
 tick(l,r){this.data[0][this.at]=l;this.data[1][this.at]=r;let peak=Math.max(Math.abs(l),Math.abs(r));for(let c=0;c<2;c++)for(const k of this.kernels){let v=0;for(let j=0;j<this.n;j++)v+=this.data[c][(this.at-j+this.n)%this.n]*k[j];peak=Math.max(peak,Math.abs(v));}this.at=(this.at+1)%this.n;return peak;}
}
class Meter {
 constructor(sr,extended=false){this.sr=sr;this.extended=extended;this.tp=extended?new TruePeak():null;this.k=[new Biquad(sr),new Biquad(sr)];this.k[0].set('highShelf',1682,.707,4);this.k[1].set('high',38,.5);this.window=new Float64Array(Math.ceil(sr*.4/128)+2);this.energies=new Float64Array(this.window.length);this.at=0;this.energy=0;this.frames=0;this.peak=0;this.truePeak=0;this.sum=0;this.n=0;this.xy=0;this.xx=0;this.yy=0;this.peakHold=0;this.maxTP=0;this.lufs=-120;}
 process(left,right){let e=0;for(let i=0;i<left.length;i++){const l=left[i],r=right[i],p=Math.max(Math.abs(l),Math.abs(r));this.peak=Math.max(this.peak,p);this.truePeak=Math.max(this.truePeak,this.tp?this.tp.tick(l,r):p);this.sum+=l*l+r*r;this.n+=2;this.xy+=l*r;this.xx+=l*l;this.yy+=r*r;if(this.extended){const a=this.k[1].tick(this.k[0].tick(l,0),0),b=this.k[1].tick(this.k[0].tick(r,1),1);e+=a*a+b*b;}}
  if(this.extended){this.energy+=e-this.energies[this.at];this.frames+=left.length-this.window[this.at];this.window[this.at]=left.length;this.energies[this.at]=e;this.at=(this.at+1)%this.window.length;this.lufs=this.energy>1e-20?-.691+10*Math.log10(this.energy/this.frames):-120;}this.peakHold=Math.max(this.peakHold,this.peak);this.maxTP=Math.max(this.maxTP,this.truePeak);
 }
 read(reset=true){const result={peak:db(this.peak),truePeak:db(this.truePeak),peakHold:db(this.peakHold),maxTP:db(this.maxTP),rms:db(Math.sqrt(this.sum/Math.max(1,this.n))),lufs:this.lufs,correlation:this.xx&&this.yy?this.xy/Math.sqrt(this.xx*this.yy):null,midRms:Math.sqrt(Math.max(0,(this.xx+this.yy+2*this.xy)/(2*Math.max(1,this.n)))),sideRms:Math.sqrt(Math.max(0,(this.xx+this.yy-2*this.xy)/(2*Math.max(1,this.n))))};if(reset){this.peak=0;this.truePeak=0;this.sum=0;this.n=0;this.xy=this.xx=this.yy=0;}return result;}
}
function automationValue(lane,time,fallback){const pts=lane?.points;if(!lane?.enabled||!pts?.length||time<pts[0].time)return fallback;let lo=0,hi=pts.length;while(lo<hi){const mid=(lo+hi)>>1;if(pts[mid].time<=time)lo=mid+1;else hi=mid;}const a=pts[lo-1],b=pts[lo];if(!b||lane.curve==='step')return a.value;return mix(a.value,b.value,clamp((time-a.time)/(b.time-a.time),0,1));}
const api={Processor,Biquad,DelayLine,Meter,TruePeak,automationValue,clamp,db,gain,reduction};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GhostDSP=api;
})(typeof globalThis!=='undefined'?globalThis:this);
