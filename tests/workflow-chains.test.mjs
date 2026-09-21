import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import {readCatalogs} from '../studio/chains/sources.mjs';
import {buildChainCatalog,processorRuntime,validateCatalog,instrumentProfiles} from '../studio/chains/catalog.mjs';
import {enhanceHem} from '../studio/chains/integrate.mjs';
import core from '../studio/chain-core.js';

const root=new URL('../studio/',import.meta.url);
const [data,catalog,world]=await Promise.all([buildChainCatalog(root),readCatalogs(root),processorRuntime(root)]);
const connected=(source,key)=>{const result=core.fromSource(data,source,key);assert.ok(result,source+' / '+key+' has a workflow');assert.ok(result.routes.length);return result;};

test('every source catalog entry has a connected workflow, including all genre aliases',()=>{
 for(const name of Object.keys(catalog.TA))connected('genre',name);
 for(const group of catalog.GENRES)for(const name of group.g)connected('genre',name);
 for(const names of Object.values(catalog.va))for(const name of names)connected('genre',name);
 for(const v of [...catalog.mn,...catalog.mj])connected('vocal',v.id);
 for(const group of catalog.VOCALS)for(const v of group.vocals)connected('voice',v.n);
 for(const group of catalog.BEATS)for(const b of group.beats)connected('beat',b.n);
 for(const key of Object.keys(catalog.wl))connected('beat-builder',key);
 for(const key of Object.keys(catalog.ba))connected('voice-builder',key);
 for(const p of catalog.PRESETS)connected('preset',p.id);
 for(const [instrument,genres] of Object.entries(catalog.Vv))for(const genre of Object.keys(genres))connected('signature',instrument+':'+genre);
 for(const [category,items] of Object.entries({...catalog.allData,...catalog.added.categories}))for(const item of items)connected('encyclopedia',category+':'+item.n);
 for(const p of catalog.PLUGINS)connected('tool',p.n);
 for(const p of [...catalog.Gv,...catalog.Wv])connected('plugin-reference',p.name);
 for(const key of ['hA','mA','pA','fA','gA','_v'])for(const item of catalog[key]){connected('reference',item.id);connected('reference-name',item.name);}
 for(const a of catalog.artists.artists)connected('artist-chain',a.id);
 for(const key of Object.keys(world.GhostCompose.patches))connected('synth',key);
 for(const key of Object.keys(world.GhostAudio.TYPES))connected('processor',key);
 assert.equal(data.entries.length,1268);
});
test('instrument and vocal chains preserve distinct source needs and instrumental choices omit vocals',()=>{
 for(const item of catalog.allData.instruments)assert.equal(connected('encyclopedia','instruments:'+item.n).routes[0].profile,instrumentProfiles[item.name]);
 assert.equal(instrumentProfiles.Bagpipes,'bagpipes');assert.equal(instrumentProfiles.Harmonica,'free-reed');assert.equal(instrumentProfiles.Sitar,'tradition-instrument');
 const instrumental=Object.keys(catalog.ba).find(name=>/instrumental/i.test(name));
 assert.ok(connected('voice-builder',instrumental).routes.every(r=>!r.profile.startsWith('vocal-')));
 assert.equal(connected('vocal','southern-gospel-quartet').routes[0].profile,'vocal-ensemble');
 const cumbia=core.filter(data,{query:'Cumbia Electronica'});assert.ok(cumbia.length);
 assert.equal(connected('genre','Shoegaze Pop').kind,'Genre / subgenre');
 assert.equal(core.filter(data,{query:'nothing-matches-this-unique-query-123'}).length,0);
});
test('all loadable chains start bypassed with valid installed defaults and independent effect IDs',()=>{
 const checked=new Set(),ids=new Set();
 for(const entry of data.entries)for(const route of entry.routes){
  if(checked.has(route.profile))continue;checked.add(route.profile);
  const draft=core.draft(data,entry.id,route.id,world.GhostAudio.newEffect);
  assert.ok(draft.effects.length>0&&draft.effects.length<=12);
  const valid=world.GhostAudio.validateEffects(draft.effects);
  for(const effect of valid){assert.equal(effect.enabled,false);assert.equal(effect.preset,'Zero / Neutral');assert.ok(!ids.has(effect.id));ids.add(effect.id);
   for(const [key,value] of Object.entries(effect.params)){const range=world.GhostAudio.TYPES[effect.type].params[key];assert.ok(Number.isFinite(value)&&value>=range[0]&&value<=range[1]);assert.equal(value,range[2]);}
  }
 }
 assert.equal(checked.size,Object.keys(data.profiles).length);
 const e=connected('general','home-vocal');assert.throws(()=>core.draft(data,e.id,'missing',world.GhostAudio.newEffect),/unavailable/);
 assert.throws(()=>core.draft(data,e.id,e.routes[0].id,type=>({...world.GhostAudio.newEffect(type),enabled:true})),/bypassed/);
});
test('opening a workshop draft leaves existing audio, inserts and session history untouched',async()=>{
 vm.runInContext(await fs.readFile(new URL('pack-ui.js',root),'utf8'),world);
 const existing=world.GhostAudio.newEffect('gain');existing.enabled=true;existing.params.gain=-3;
 const engine={tracks:[{id:'track',effects:[existing]}],masterEffects:[world.GhostAudio.newEffect('masterrack')],playing:true},before=JSON.stringify(engine);
 const state={plugin:{name:'Live chain',effects:engine.tracks[0].effects},editingTarget:'track',insertTarget:'selected'};let snapshots=0,view='';
 const control={setAttribute(){},textContent:''};
 const ui=world.GhostPluginUI({A:world.GhostAudio,engine,state,$:()=>control,snapshot:()=>snapshots++,showView:v=>view=v});
 const entry=connected('general','mix-export');const draft=core.draft(data,entry.id,entry.routes[0].id,world.GhostAudio.newEffect);ui.openDraft(draft);
 assert.equal(JSON.stringify(engine),before);assert.equal(snapshots,0);assert.equal(view,'forge');assert.equal(state.editingTarget,null);assert.equal(state.insertTarget,'master');assert.notEqual(state.plugin.effects,draft.effects);assert.ok(state.plugin.effects.every(e=>!e.enabled));
});
test('the generated guides include real stages, source context and supported capability limits',()=>{
 for(const entry of data.entries){const text=core.format(data,entry.id);assert.match(text,/WORKFLOW/);assert.match(text,/Neutral start: bypass on/);assert.match(text,/Check and export/);assert.ok(text.includes(entry.label));}
 const unsupported=data.entries.find(e=>e.label==='Granular Time Stretch');assert.match(core.format(data,unsupported.id),/dedicated tool/);
 assert.match(core.format(data,connected('synth','Round bass').id),/does not create cross-track sidechain routing/);
 const broken=structuredClone(data);broken.entries[0].routes[0].profile='nonexistent';assert.throws(()=>validateCatalog(broken),/Missing recipe/);
});
test('embedded-page integrations parse and fail the build when an integration point changes',async()=>{
 const original=await fs.readFile(new URL('pages/hem-atm.html',root),'utf8'),html=enhanceHem(original);
 for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){const parsed=ts.createSourceFile('embedded.js',match[1],ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);assert.deepEqual(parsed.parseDiagnostics.map(d=>d.messageText),[]);}
 assert.ok(html.includes('data-workflow-library'));
 assert.ok(!html.includes('children:yA.map'));
 assert.throws(()=>enhanceHem(original.replace('function CA(){','function MissingCA(){')),/Missing workflow integration CA/);
});
