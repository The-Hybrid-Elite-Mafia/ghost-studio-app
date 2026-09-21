import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
async function fixture(destination='selected'){
 const w=vm.createContext({crypto:webcrypto});w.window=w;
 for(const f of ['packs.js','audio.js','pack-ui.js'])vm.runInContext(await readFile(new URL('../studio/'+f,import.meta.url),'utf8'),w);
 const node=()=>({append(){},replaceChildren(){},setAttribute(){}}),elements=new Map();
 const track={id:'vocal',name:'Lead vocal',effects:[]},engine={tracks:[track],masterEffects:[],async rebuild(){}};
 const state={insertTarget:destination,editingTarget:null,plugin:{name:'Draft',effects:[]},plugins:[]};let dirty=0;
 const ui=w.GhostPluginUI({A:w.GhostAudio,engine,state,$:id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id)},make:node,button:node,snapshot(){},markDirty(){dirty++},showView(view){state.view=view},renderInspector(){},toast(){},selected:()=>track});
 return {w,ui,state,engine,track,dirty:()=>dirty};
}
for(const destination of ['selected','master'])test('Insert binds controls to the actual '+destination+' chain',async()=>{
 const {w,ui,state,engine,track,dirty}=await fixture(destination),draft=w.GhostAudio.newEffect('vocal73');
 await ui.insert([draft],'Vocal 73');
 const effects=destination==='master'?engine.masterEffects:track.effects;
 assert.equal(effects.length,1);assert.notEqual(effects[0],draft);
 assert.equal(state.plugin.effects,effects);assert.equal(state.editingTarget,destination==='master'?'master':track.id);
 assert.equal(state.view,'forge');assert.equal(effects[0].enabled,false);assert.ok(dirty()>0);
 state.plugin.effects[0].params.presence=2;assert.equal(effects[0].params.presence,2);assert.notEqual(draft.params.presence,2);
});
