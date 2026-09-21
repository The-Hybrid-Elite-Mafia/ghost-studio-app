import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../studio/app.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function knob('),source.indexOf('\nfunction setSelected('));
function node(){return {children:[],events:{},style:{setProperty(){}},dataset:{},append(...nodes){this.children.push(...nodes)},setAttribute(){},addEventListener(k,f){this.events[k]=f},setPointerCapture(){},focus(){}};}
test('DAW knob ignores second pointer, stops on capture loss, and resets neutral',()=>{
 let value=0;const w=vm.createContext({make:node,A:{clamp:(v,a,b)=>Math.max(a,Math.min(b,v))}});vm.runInContext(fn,w);
 const root=w.knob({label:'Gain',value:0,min:-18,max:18,step:.5,onChange:v=>value=v});const e=root.children[1].events;
 const event=(id,y,button=0)=>({pointerId:id,clientY:y,button,preventDefault(){}});
 e.pointerdown(event(1,100));e.pointermove(event(2,10));assert.equal(value,0);
 e.pointermove(event(1,10));assert.equal(value,18);
 e.lostpointercapture();e.pointermove(event(1,200));assert.equal(value,18);
 e.dblclick();assert.equal(value,0);
 e.pointerdown(event(3,100,2));e.pointermove(event(3,10));assert.equal(value,0);
 e.keydown({key:'Home',preventDefault(){}});assert.equal(value,-18);
 e.keydown({key:'End',preventDefault(){}});assert.equal(value,18);
});
