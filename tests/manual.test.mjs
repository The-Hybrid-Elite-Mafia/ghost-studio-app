import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createRequire} from 'node:module';
const P=createRequire(import.meta.url)('../studio/packs.js');
test('manual covers all chapters and processors with existing labeled images',async()=>{
 const html=await readFile(new URL('../studio/manual.html',import.meta.url),'utf8');
 const chapters=JSON.parse(await readFile(new URL('../studio/manual/chapters.json',import.meta.url),'utf8'));
 for(const c of chapters)assert.ok(html.includes(`id="${c.id}"`));
 for(const [type,d] of Object.entries(P.definitions)){assert.ok(html.includes(`id="plugin-${type}"`));assert.ok(html.includes(d.name.replace(/&/g,'&amp;')));}
 const paths=[...new Set([...html.matchAll(/src="(\/manual\/[^\"]+\.svg)"/g)].map(x=>x[1]))];
 assert.equal(paths.length,chapters.length*2+27);
 for(const c of chapters)assert.ok(c.steps?.length, 'Missing illustrated steps: '+c.id);
 for(const id of ['rack-presets','radio-upload','workflow-chains','file-types'])assert.ok(html.includes('id="'+id+'"'));
 assert.ok(html.includes('Ghost-Studio-Illustrated-Manual.pdf'));
 for(const p of paths)await access(new URL('../public'+p,import.meta.url));
 assert.match(html,/not screenshots|not installable VST/);assert.match(html,/Only the owner/);
});
