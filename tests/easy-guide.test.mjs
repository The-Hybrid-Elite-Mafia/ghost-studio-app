import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const src=await readFile(new URL('../studio/app.js',import.meta.url),'utf8');
function node(){return {children:[],classList:{toggle(){return true}},setAttribute(){},replaceChildren(){this.children=[]},append(b){this.children.push(b)}}}
test('Guided cleanup checks before applying and rejects a stale session',async()=>{
 const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)};let applied=0;
 const engine={tracks:[{id:'a',effects:[],gainDb:0}],masterEffects:[],masterDb:0,idle:async()=>{}};
 const w=vm.createContext({$,engine,state:{view:'studio',selected:'a'},button:(text,cls,onclick)=>({text,onclick}),guard:fn=>fn(),busy:(_text,fn)=>fn(),GhostAssistant:{plan:async()=>({items:[]}),describe:()=> 'Checked',checkOutput:async()=>{},apply:async()=>{applied++}},snapshot(){},pluginUI:{resetEditing(){}},renderAll(){},showView(){}});
 vm.runInContext(src.slice(src.indexOf('// Guided local workflow:'),src.lastIndexOf('})();')),w);
 const click=label=>{const b=$('easyActions').children.find(b=>b.text===label);assert.ok(b,label);return b.onclick()};
 await click('Next · check my audio');assert.equal(applied,0);
 await click('Check my audio');assert.equal(applied,0);
 engine.tracks[0].gainDb=3;
 await assert.rejects(()=>click('Apply chain to my audio'),/session changed/);assert.equal(applied,0);
 await click('Check my audio');await click('Apply chain to my audio');assert.equal(applied,1);
 assert.equal($('easyTitle').textContent,'Listen, then save your mix');
});
