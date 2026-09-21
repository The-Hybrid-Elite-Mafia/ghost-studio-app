import {registerHooks} from 'node:module';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {API_OWNER_EMAIL} from '../lib/api-owner.mjs';
import assert from 'node:assert/strict';

// Exercise the built Worker in-process with fixture bindings, without a dev server,
// a browser, a production-site request, or an OpenAI request.
globalThis.__ghostFixtureEnv={
 GHOST_SECRET_KEY:'cd'.repeat(32),
 DB:{
  withSession(){return this;},
  prepare(){return {bind(){return {async first(){return null;}};}};},
 },
 ASSETS:{fetch:async()=>new Response('Not found',{status:404})},
};
const hooks=registerHooks({resolve(specifier,context,next){if(specifier==='cloudflare:workers')return {url:'data:text/javascript,export const env=globalThis.__ghostFixtureEnv',shortCircuit:true};return next(specifier,context);}});
const {default:worker}=await import('../dist/server/index.js');
const headers={'oai-authenticated-user-id':'fixture-owner','oai-authenticated-user-email':API_OWNER_EMAIL};
const call=(path,h={})=>worker.fetch(new Request('https://ghost.example.test'+path,{headers:h}),globalThis.__ghostFixtureEnv,{waitUntil(){},passThroughOnException(){}});
test('built Worker opens the photographic rack and preserves the full DAW route',async()=>{
 const anon=await call('/');assert.equal(anon.status,302);assert.match(anon.headers.get('location'),/^\/signin-with-chatgpt/);
 const app=await call('/',headers);assert.equal(app.status,200);assert.match(app.headers.get('content-type'),/text\/html/);
 assert.equal(await app.text(),await readFile(new URL('../studio/rack-reference.html',import.meta.url),'utf8'));
 const workstation=await call('/workstation',headers);assert.equal(workstation.status,200);
 assert.equal(await workstation.text(),await readFile(new URL('../studio/index.html',import.meta.url),'utf8'));
 assert.equal((await call('/workstation')).status,302);
});
test('built Worker dispatches the authenticated health route with runtime bindings',async()=>{
 assert.equal((await call('/api/health')).status,401);
 const response=await call('/api/health',headers);assert.equal(response.status,200);
 const health=await response.json();assert.equal(health.hosted,true);assert.equal(health.setupAvailable,true);assert.equal(health.aiConfigured,false);
});
test('built Worker blocks visitors from paid API routes while keeping their DAW accessible',async()=>{
 const visitor={'oai-authenticated-user-id':'visitor','oai-authenticated-user-email':'visitor@example.test'};
 assert.equal((await call('/',visitor)).status,200);
 const health=await (await call('/api/health',visitor)).json();assert.equal(health.canUseApi,false);assert.equal(health.setupAvailable,false);
 for(const path of ['/api/connection','/api/ghost','/api/lyrics']){
  const response=await worker.fetch(new Request('https://ghost.example.test'+path,{method:'POST',headers:{...visitor,origin:'https://ghost.example.test','content-type':'application/json'},body:'{"owner":true}'}),globalThis.__ghostFixtureEnv,{waitUntil(){},passThroughOnException(){}});
  assert.equal(response.status,403);assert.equal((await response.json()).code,'owner_only');
 }
});
test.after(()=>{hooks.deregister();delete globalThis.__ghostFixtureEnv;});
test('illustrated manual is available without API access',async()=>{
 const response=await call('/manual');assert.equal(response.status,200);
 const html=await response.text();assert.match(html,/Ghost Studio Illustrated Operating Manual/);assert.match(html,/plugin-masterrack/);
 assert.doesNotMatch(html,/sk-proj-/);
});
