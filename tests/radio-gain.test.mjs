import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
const source=await readFile(new URL('../app/radio/eq.ts',import.meta.url),'utf8');
const {code}=await transform(source,{loader:'ts',format:'esm'});
const {savedSound,compensationDb,listeningGain,flat}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const filter=(fn)=>({getFrequencyResponse(hz,mag){hz.forEach((f,i)=>mag[i]=10**(fn(f)/20));}});
test('Radio preamp permits boost and cut, persists both, and preserves saved volume',()=>{
 for(const preamp of [-18,0,18])assert.equal(savedSound({preamp,volume:.04}).preamp,preamp);
 assert.equal(savedSound({preamp:30}).preamp,18);
 assert.equal(savedSound({preamp:-30}).preamp,-18);
 assert.equal(savedSound({volume:.04}).volume,.04);
 assert.equal(savedSound({preamp:NaN}).preamp,0);
 assert.deepEqual(savedSound(null).eq,flat());
 assert.equal(listeningGain(1,0,0),1);
 assert.ok(Math.abs(listeningGain(1,6,0)-1.995262)<.000001);
 assert.equal(listeningGain(0,18,0),0);
});
test('Headroom follows combined curve, not sum of separated boosts',()=>{
 const separated=[filter(f=>f<200?6:0),filter(f=>f>2000?6:0)];
 assert.ok(Math.abs(compensationDb(separated,48000)-6)<.001);
 const overlapping=[filter(()=>6),filter(()=>6)];
 assert.ok(Math.abs(compensationDb(overlapping,48000)-12)<.001);
 assert.equal(compensationDb([filter(()=>0)],44100),0);
 assert.equal(compensationDb([filter(()=>-6)],44100),0);
 assert.equal(compensationDb([],48000),0);
});
