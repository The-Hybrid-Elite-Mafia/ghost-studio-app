import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

// Loudness meter accuracy: the K-weighting must be the ITU-R BS.1770 filter (published 48 kHz table,
// analog-prototype design at other rates), and the EBU Tech 3341 case 1 signal (1 kHz stereo sine at
// -23 dBFS) must read -23.0 +/- 0.1 LUFS. Ghost's meter gives momentary loudness (LUFS-M) only.
const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');
const dspSource=await read('studio/dsp.js');
const world=vm.createContext({console});
vm.runInContext(dspSource,world,{filename:'dsp.js'});
const D=world.GhostDSP;

const table48={stage1:{b0:1.53512485958697,b1:-2.69169618940638,b2:1.19839281085285,a1:-1.69065929318241,a2:0.73248077421585},stage2:{b0:1,b1:-2,b2:1,a1:-1.99004745483398,a2:0.99007225036621}};
// Independent reference: the analog-prototype design used by libebur128 / pyloudnorm.
function reference(fs){
 let f0=1681.974450955533,G=3.999843853973347,Q=0.7071752369554196,K=Math.tan(Math.PI*f0/fs);
 const Vh=10**(G/20),Vb=Vh**0.4996667741545416,a0=1+K/Q+K*K;
 const stage1={b0:(Vh+Vb*K/Q+K*K)/a0,b1:2*(K*K-Vh)/a0,b2:(Vh-Vb*K/Q+K*K)/a0,a1:2*(K*K-1)/a0,a2:(1-K/Q+K*K)/a0};
 f0=38.13547087602444;Q=0.5003270373238773;K=Math.tan(Math.PI*f0/fs);
 const d=1+K/Q+K*K;
 return {stage1,stage2:{b0:1,b1:-2,b2:1,a1:2*(K*K-1)/d,a2:(1-K/Q+K*K)/d}};
}
function assertCoeffs(filter,want,label){
 assert.equal(filter.off,false,label+' is switched on');
 for(const k of ['b0','b1','b2','a1','a2'])assert.ok(Math.abs(filter[k]-want[k])<=1e-8,`${label} ${k}: got ${filter[k]}, want ${want[k]}`);
}

test('K-weighting at 48 kHz matches the BS.1770 table to 1e-8',()=>{
 const m=new D.Meter(48000,true);
 assertCoeffs(m.k[0],table48.stage1,'stage 1');
 assertCoeffs(m.k[1],table48.stage2,'stage 2');
});

test('K-weighting at 44.1 / 88.2 / 96 / 192 kHz matches the analog-prototype design to 1e-8',()=>{
 for(const fs of [44100,88200,96000,192000]){
  const m=new D.Meter(fs,true),ref=reference(fs);
  assertCoeffs(m.k[0],ref.stage1,'stage 1 @ '+fs);
  assertCoeffs(m.k[1],ref.stage2,'stage 2 @ '+fs);
 }
});

test('EBU Tech 3341 case 1: 1 kHz stereo sine at -23 dBFS reads -23.0 +/- 0.1 LUFS-M at 44.1 / 48 / 96 kHz',()=>{
 for(const fs of [44100,48000,96000]){
  const m=new D.Meter(fs,true),n=fs*5,amp=10**(-23/20),x=new Float32Array(n);
  for(let i=0;i<n;i++)x[i]=amp*Math.sin(2*Math.PI*1000*i/fs);
  for(let i=0;i<n;i+=128)m.process(x.subarray(i,i+128),x.subarray(i,i+128));
  const lufs=m.read().lufs;
  console.log(`  LUFS-M @ ${fs} Hz: ${lufs.toFixed(3)}`);
  assert.ok(Math.abs(lufs+23)<=0.1,`momentary @ ${fs} Hz: got ${lufs.toFixed(3)} LUFS, want -23.0 +/- 0.1`);
 }
});

test('the worklet bundles and the built page carry the same meter code as studio/dsp.js',async()=>{
 const bundle=await read('studio/ghost-worklet-bundle.js'),published=await read('public/ghost-worklet-bundle.js'),page=await read('studio/index.html');
 assert.ok(bundle.includes(dspSource),'studio/ghost-worklet-bundle.js is out of date: run node studio/build.mjs');
 assert.equal(published,bundle,'public/ghost-worklet-bundle.js must be a copy of studio/ghost-worklet-bundle.js');
 assert.ok(page.includes(dspSource.replace(/<\/script/gi,'<\\/script')),'studio/index.html is out of date: run node studio/build.mjs');
});
