export const frequencies = [31,60,125,250,500,1000,2000,4000,8000,12000];
export const bandNames = ['Sub','Deep bass','Punch','Warmth','Body','Mids','Presence','Clarity','Air','Treble'];
export const flat = () => frequencies.map(() => 0);
export const presets:Record<string,number[]> = {
  Flat:flat(), 'Bass weight':[3,4,2,0,-1,0,0,0,1,1],
  'Vocal focus':[-2,-2,-1,-1,0,1,2,2,1,0],
  Rock:[1,2,2,0,-1,0,1,2,2,1], Country:[-1,0,1,0,-1,1,2,1,1,0],
  'Hip-Hop':[3,4,2,0,-1,-1,1,1,2,1], 'Late night':[1,2,1,0,0,0,-1,-2,-2,-3]
};
export function savedSound(input:unknown){
  const x = input && typeof input==='object' ? input as Record<string,unknown> : {};
  const valid = (v:unknown) => typeof v==='number' && Number.isFinite(v) && v>=-9 && v<=9;
  let eq=flat();
  if(Array.isArray(x.eq) && x.eq.length===10 && x.eq.every(valid)) eq=x.eq.map(v=>Math.round(Number(v)*2)/2);
  // Keep the five original saved gains at their original frequencies.
  else if(Array.isArray(x.eq) && x.eq.length===5 && x.eq.every(valid)) [1,3,5,7,9].forEach((at,i)=>{eq[at]=Number((x.eq as number[])[i]);});
  return {eq, volume:typeof x.volume==='number' && Number.isFinite(x.volume)?Math.min(1,Math.max(0,x.volume)):.8,
    preamp:typeof x.preamp==='number'&&Number.isFinite(x.preamp)?Math.min(18,Math.max(-18,x.preamp)):0,
    bypass:x.bypass===true};
}
// Measure the combined filter curve, rather than summing unrelated band boosts.
// Detached filters use target settings so smoothing on the audible filters cannot lag this estimate.
export function compensationDb(filters:Pick<BiquadFilterNode,'getFrequencyResponse'>[],sampleRate:number){
 if(!filters.length)return 0;
 const count=1024, hz=new Float32Array(count), magnitude=new Float32Array(count), phase=new Float32Array(count), total=new Float64Array(count).fill(1);
 for(let i=0;i<count;i++)hz[i]=20*Math.pow((Math.min(20000,sampleRate*.499))/20,i/(count-1));
 for(const f of filters){f.getFrequencyResponse(hz,magnitude,phase);for(let i=0;i<count;i++)total[i]*=magnitude[i];}
 let peak=1;for(const v of total)if(Number.isFinite(v))peak=Math.max(peak,v);
 return Math.max(0,20*Math.log10(peak));
}
export const listeningGain=(volume:number,preamp:number,headroom:number)=>volume*Math.pow(10,(preamp-headroom)/20);
