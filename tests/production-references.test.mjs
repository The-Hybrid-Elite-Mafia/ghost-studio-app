import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const pack=JSON.parse(fs.readFileSync(new URL('../studio/arena-production-references.json',import.meta.url),'utf8'));
const html=fs.readFileSync(new URL('../studio/pages/plugin-encyclopedia.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)[1].replace('/* ARENA_REFERENCE_DATA */',`const referencePack=${JSON.stringify(pack)};Object.assign(allData,referencePack.categories);`);
const scope={document:{addEventListener(){}},setTimeout(){}};
vm.createContext(scope);vm.runInContext(script,scope);

test('keeps all 201 existing references and adds 107 distinct complete records',()=>{
 const counts=vm.runInContext('Object.fromEntries(TAB_ORDER.map(k=>[k,allData[k].length]))',scope);
 assert.equal(Object.values(counts).reduce((a,b)=>a+b),308);
 assert.equal(counts.vocals+counts.instruments+counts.artifacts+counts.processing+counts.effects+counts.mastering,201);
 const rows=Object.values(pack.categories).flat();assert.equal(rows.length,107);
 assert.equal(new Set(rows.map(r=>r.id)).size,107);
 for(const row of rows){assert.ok(row.p.length>100);assert.ok(!row.p.includes('Generating...'));}
});
test('finds replacement recipes by old names and preserves detailed macro settings',()=>{
 const result=vm.runInContext("filterPrompts(allData.genreBlueprints,'stadium trapper')",scope);
 assert.equal(result.length,1);assert.match(result[0].name,/Basement Fusion/);
 assert.match(result[0].p,/Polished↔Gritty/);
 assert.match(result[0].p,/30 ms/);
 assert.equal(vm.runInContext("filterPrompts(allData.vocalProfiles,'obsidian')",scope).length,1);
 assert.equal(vm.runInContext("filterPrompts(allData.industrialVocals,'controlled ruin')",scope).length,1);
});
test('generated hosted app includes the same reference pack',()=>{
 const built=fs.readFileSync(new URL('../studio/index.html',import.meta.url),'utf8');
 const pages=JSON.parse(built.match(/window.GhostImportedPages=(.*);/)[1]);
 assert.ok(!pages.encyclopedia.includes('/* ARENA_REFERENCE_DATA */'));
 assert.ok(pages.encyclopedia.includes('Obsidian Profundo'));
 assert.ok(pages.encyclopedia.includes('Download added reference library'));
});
