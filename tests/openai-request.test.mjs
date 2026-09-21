import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {openAIRequest,runtimeFetch} from '../lib/openai-request.mjs';
const key='sk-fixture-not-a-real-api-key-0123456789';

test('runtime fetch keeps its owning global receiver',async()=>{
 const original=globalThis.fetch;let calls=0;
 try{
  globalThis.fetch=async function(){assert.equal(this,globalThis);calls++;return Response.json({input_tokens:1});};
  const send=runtimeFetch;assert.equal((await send('https://fixture.test')).status,200);assert.equal(calls,1);
 }finally{globalThis.fetch=original;}
});

test('redirects are identified and never followed with the saved key',async()=>{
 const events=[];let calls=0;
 const post=openAIRequest({report:e=>events.push(e),fetchImpl:async(url,init)=>{
  calls++;assert.equal(url,'https://api.openai.com/v1/responses/input_tokens');assert.equal(init.redirect,'manual');
  return new Response(null,{status:307,headers:{Location:'https://untrusted.example.test'}});
 }});
 await assert.rejects(post(key,'responses/input_tokens',{}),e=>e.diagnostic.code==='redirect-refused'&&e.diagnostic.httpStatus===307);
 assert.equal(calls,1);assert.equal(events[0].stage,'token-count');assert.equal(JSON.stringify(events).includes(key),false);
});

test('fast runtime exceptions are not misreported as timeouts; logs redact credentials',async()=>{
 const events=[];let calls=0;
 const post=openAIRequest({report:e=>events.push(e),fetchImpl:async()=>{calls++;throw new TypeError('Illegal invocation with '+key+' and Bearer '+key);}});
 await assert.rejects(post(key,'responses/input_tokens',{}),e=>e.diagnostic.code==='runtime-error'&&!/timed out/.test(e.message));
 assert.equal(calls,1);assert.equal(events[0].code,'runtime-error');assert.equal(JSON.stringify(events).includes(key),false);
});

test('network failures preserve safe cause and stage without claiming invalid credentials',async()=>{
 const events=[];
 const post=openAIRequest({report:e=>events.push(e),fetchImpl:async()=>{throw Object.assign(new Error('fetch failed'),{cause:{code:'ENOTFOUND'}});}});
 await assert.rejects(post(key,'responses/input_tokens',{}),e=>e.diagnostic.code==='transport-enotfound'&&/has not been marked invalid/.test(e.message));
 assert.equal(events[0].cause,'ENOTFOUND');assert.equal(events[0].stage,'token-count');
});

test('an actual timeout aborts the request and never retries it',async()=>{
 let calls=0;const events=[];
 const post=openAIRequest({report:e=>events.push(e),fetchImpl:async(url,{signal})=>{calls++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));}});
 await assert.rejects(post(key,'responses',{},5),e=>e.diagnostic.code==='timeout');
 assert.equal(calls,1);assert.equal(events[0].stage,'generation');
});

test('real HTTP authentication errors remain distinct even with non-JSON bodies',async()=>{
 const post=openAIRequest({report:()=>{},fetchImpl:async()=>new Response('Unauthorized',{status:401})});
 await assert.rejects(post(key,'responses/input_tokens',{}),e=>e.diagnostic.code==='invalid-key'&&e.diagnostic.httpStatus===401&&/did not accept/.test(e.message));
});

test('mobile error displays preserve the safe connection diagnostic',async()=>{
 const require=createRequire(import.meta.url),client=require('../studio/ai-client.js');
 const diagnostic={stage:'token-count',code:'runtime-error'};
 let failure;try{await client.request('/api/ghost',{message:'Hello'},{base:'https://fixture.test',fetchImpl:async()=>Response.json({error:'Server request failed.',diagnostic},{status:503})});}catch(e){failure=e;}
 assert.deepEqual(failure.diagnostic,diagnostic);assert.match(client.errorText(failure),/token-count · runtime-error/);
});
