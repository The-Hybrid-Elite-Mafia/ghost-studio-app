import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {cloudStore,seal,unseal,MODEL} from '../lib/cloud-store.mjs';
import {createCloudService} from '../lib/cloud-service.mjs';
import {API_OWNER_EMAIL} from '../lib/api-owner.mjs';
import {createHandler} from '../lib/cloud-http.mjs';
import {songFixture} from './song-fixture.mjs';

// Transport-only fixtures. These keys are not credentials and no test calls the network.
const fixtureSecret='ab'.repeat(32),fixtureKey='sk-fixture-not-a-real-api-key-0123456789';
const now=()=>new Date('2026-09-07T12:00:00Z');
const migrations=readdirSync(new URL('../drizzle/',import.meta.url)).filter(x=>x.endsWith('.sql')).sort().map(x=>readFileSync(new URL('../drizzle/'+x,import.meta.url),'utf8')).join('\n');
function database(t){
 const sql=new DatabaseSync(':memory:');sql.exec(migrations);t.after(()=>sql.close());
 const binding={
  withSession(){return this;},
  prepare(query){const statement=sql.prepare(query);let values=[];
   const obj={bind(...args){values=args;return obj;},async first(){return statement.get(...values)??null;},async run(){return obj.execute();},execute(){const result=statement.run(...values);return {success:true,meta:{changes:Number(result.changes)}};}};return obj;
  },
  async batch(statements){sql.exec('BEGIN');try{const result=statements.map(s=>s.execute());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}
 };
 return {sql,binding};
}
const options=(binding,userId='owner',fetchImpl)=>({binding,userId,secret:fixtureSecret,now,fetchImpl,report:()=>{}});
function upstream({reply='Ghost is connected and ready.',input=200,output=30,model=MODEL,tier='default',status='completed'}={}){
 const calls=[];
 const fetchImpl=async(url,init)=>{const body=JSON.parse(init.body);calls.push({url,body});assert.equal(init.redirect,'manual');assert.equal(init.headers.Authorization,'Bearer '+fixtureKey);
  if(url.endsWith('/responses/input_tokens'))return Response.json({input_tokens:200});
  assert.equal(url,'https://api.openai.com/v1/responses');
  return Response.json({model,service_tier:tier,status,usage:{input_tokens:input,output_tokens:output},output:[{type:'message',role:'assistant',content:[{type:'output_text',text:reply}]}]});
 };
 return {fetchImpl,calls};
}
function req(path,method='GET',body,extra={}){
 const headers={'oai-authenticated-user-id':'owner','oai-authenticated-user-email':API_OWNER_EMAIL,...(method!=='GET'?{origin:'https://ghost.example.test','Content-Type':'application/json'}:{}),...extra};
 return new Request('https://ghost.example.test'+path,{method,headers,...(body!==undefined?{body:JSON.stringify(body)}:{})});
}

test('key encryption is user-bound, randomized, and rejects tampering',async()=>{
 const one=await seal(fixtureKey,'owner',fixtureSecret),two=await seal(fixtureKey,'owner',fixtureSecret);
 assert.notEqual(one.cipher,two.cipher);assert.notEqual(one.iv,two.iv);
 const record={key_cipher:one.cipher,key_iv:one.iv};
 assert.equal(await unseal(record,'owner',fixtureSecret),fixtureKey);
 await assert.rejects(unseal(record,'other',fixtureSecret),/could not be opened/);
 await assert.rejects(unseal({...record,key_iv:two.iv},'owner',fixtureSecret),/could not be opened/);
 await assert.rejects(seal(fixtureKey,'owner',''),/unavailable/);
});

test('save is encrypted at rest, not live-verified, isolated, and never calls OpenAI',async t=>{
 const {binding,sql}=database(t);let network=0;
 const service=createCloudService(options(binding,'owner',()=>{network++;throw Error('No requests allowed.');}));
 const saved=await service.saveKey(fixtureKey);assert.equal(saved.aiConfigured,true);assert.equal(saved.apiVerified,false);assert.equal(network,0);
 assert.equal(JSON.stringify(saved).includes(fixtureKey),false);
 assert.equal(JSON.stringify(sql.prepare('SELECT * FROM ghost_accounts').all()).includes(fixtureKey),false);
 const other=createCloudService(options(binding,'other',()=>{throw Error();}));
 assert.equal((await other.status()).aiConfigured,false);
 await assert.rejects(other.chat({message:'Hello'}),/save your OpenAI API key first/);
 await assert.rejects(service.saveKey('not a key'),/complete OpenAI API key/);
 await service.removeKey();assert.equal((await service.status()).aiConfigured,false);
});

test('chat and lyrics use one durable budget with different bounded output contracts',async t=>{
 const {binding}=database(t),mock=upstream();
 const chat=createCloudService(options(binding,'owner',mock.fetchImpl));await chat.saveKey(fixtureKey);
 const result=await chat.chat({message:'Hello',context:{tracks:[]}});
 assert.equal(result.reply,'Ghost is connected and ready.');assert.equal(result.budget.apiVerified,true);
 assert.equal(result.budget.requestsToday,1);assert.equal(result.budget.reservedUsd,0);
 const [,request]=mock.calls;assert.equal(request.body.max_output_tokens,600);assert.equal(request.body.reasoning.effort,'none');assert.equal(request.body.store,false);assert.equal(request.body.service_tier,'default');
 assert.deepEqual(mock.calls[0].body.input,request.body.input);
 const lyricMock=upstream({reply:JSON.stringify(songFixture)});
 const lyrics=createCloudService(options(binding,'owner',lyricMock.fetchImpl));
 const song=await lyrics.lyrics({mode:'create',title:'The Spare Key',brief:'Someone leaving a spare key by the sink.'});
 assert.equal(song.task,'lyrics');assert.match(song.reply,/SUNO v5\.5 MASTER/);assert.equal(song.song.lyrics,songFixture.lyrics);
 assert.equal(song.budget.requestsToday,2);assert.equal(song.budget.reservedUsd,0);
 assert.equal(lyricMock.calls[1].body.max_output_tokens,6000);
 assert.equal(lyricMock.calls[1].body.text.format.type,'json_schema');assert.equal(lyricMock.calls[1].body.text.format.strict,true);
 assert.deepEqual(lyricMock.calls[0].body.text,lyricMock.calls[1].body.text);
 assert.equal((await createCloudService(options(binding)).status()).estimatedSpentUsd,result.budget.estimatedSpentUsd*2);
});

test('independent Worker instances serialize generations and key changes per user',async t=>{
 const {binding}=database(t),one=cloudStore(binding,'owner',now),two=cloudStore(binding,'owner',now);
 await one.saveKey(fixtureKey,fixtureSecret);
 let release,entered;const ready=new Promise(resolve=>entered=resolve),gate=new Promise(resolve=>release=resolve);
 const pending=one.locked(async()=>{entered();await gate;});await ready;
 await assert.rejects(two.locked(async()=>{}),e=>e.status===429);
 await assert.rejects(two.removeKey(),e=>e.status===429);
 await cloudStore(binding,'another-user',now).locked(async()=>{});
 release();await pending;await two.locked(async()=>{});
});

test('budget and daily limit are atomic and cannot be reset by replacing a key',async t=>{
 const {binding,sql}=database(t),store=cloudStore(binding,'owner',now);await store.saveKey(fixtureKey,fixtureSecret);
 const reservation=await store.reserve(4999500000);await store.settle(reservation,4999500000);
 await assert.rejects(store.reserve(800000),e=>e.status===429);
 await store.removeKey();await store.saveKey(fixtureKey,fixtureSecret);
 assert.equal((await store.status()).estimatedSpentUsd,4.9995);
 await store.block();await store.saveKey(fixtureKey,fixtureSecret);assert.equal((await store.status()).blocked,true);
 const daily=cloudStore(binding,'daily-owner',now);await daily.saveKey(fixtureKey,fixtureSecret);
 for(let i=0;i<100;i++){const r=await daily.reserve(10);await daily.settle(r,1);}
 await assert.rejects(daily.reserve(10),e=>e.status===429);
 assert.equal((await daily.status()).requestsToday,100);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM ghost_requests WHERE user_id=?').get('owner').n,1);
});

test('a timeout retains its full reservation across Worker restarts without retrying',async t=>{
 const {binding}=database(t);let calls=0;
 const fetchImpl=async url=>{calls++;if(url.endsWith('/input_tokens'))return Response.json({input_tokens:200});throw Error('network interrupted');};
 const service=createCloudService(options(binding,'owner',fetchImpl));await service.saveKey(fixtureKey);
 await assert.rejects(service.chat({message:'Hello'}),/No automatic retry/);
 assert.equal(calls,2);const fresh=createCloudService(options(binding));const s=await fresh.status();
 assert.equal(s.requestsToday,1);assert.equal(s.estimatedSpentUsd,0);assert.equal(s.reservedUsd,(200*250+600*1200)/1e9);assert.equal(s.apiVerified,false);
});

test('unexpected model or usage pauses the account and does not erase the reservation',async t=>{
 for(const params of [{model:'different-model'},{tier:'priority'},{input:201},{output:601}]){
  const {binding}=database(t),mock=upstream(params),service=createCloudService(options(binding,'owner',mock.fetchImpl));
  await service.saveKey(fixtureKey);await assert.rejects(service.chat({message:'Hello'}),/paused/);
  const s=await service.status();assert.equal(s.blocked,true);assert.ok(s.reservedUsd>0);
  await assert.rejects(service.chat({message:'Again'}),/paused/);assert.equal(mock.calls.length,2);
 }
});

test('a malformed song package records bounded usage without retry',async t=>{
 const {binding}=database(t),mock=upstream({reply:'not a song package'}),service=createCloudService(options(binding,'owner',mock.fetchImpl));await service.saveKey(fixtureKey);
 await assert.rejects(service.lyrics({mode:'create',brief:'A short farewell'}),/incomplete song package/);
 const s=await service.status();assert.equal(s.reservedUsd,0);assert.ok(s.estimatedSpentUsd>0);assert.equal(s.apiVerified,false);assert.equal(mock.calls.length,2);
});

test('HTTP API rejects anonymous and cross-origin requests, and never exposes the key',async t=>{
 const {binding}=database(t),mock=upstream(),handle=createHandler({DB:binding,GHOST_SECRET_KEY:fixtureSecret},{fetchImpl:mock.fetchImpl,now,report:()=>{}});
 assert.equal((await handle(new Request('https://ghost.example.test/api/health'))).status,401);
 const hostile=req('/api/connection','POST',{apiKey:fixtureKey},{origin:'https://other.example.test'});
 assert.equal((await handle(hostile)).status,403);
 assert.equal((await handle(req('/api/connection','POST',{apiKey:fixtureKey},{origin:'null'}))).status,403);
 assert.equal((await handle(req('/api/connection','POST',{apiKey:fixtureKey},{'Content-Type':'text/plain'}))).status,415);
 assert.equal((await handle(req('/api/connection','POST',{apiKey:'x'.repeat(3000)}))).status,413);
 const saved=await handle(req('/api/connection','POST',{apiKey:fixtureKey}));assert.equal(saved.status,200);assert.equal((await saved.text()).includes(fixtureKey),false);assert.equal(mock.calls.length,0);
 const health=await handle(req('/api/health'));assert.equal(health.headers.get('Cache-Control'),'no-store');const info=await health.json();assert.equal(info.setupAvailable,true);assert.equal(info.apiVerified,false);
 const reply=await handle(req('/api/ghost','POST',{message:'Hello'}));assert.equal(reply.status,200);assert.equal((await reply.json()).budget.apiVerified,true);
 const removed=await handle(req('/api/connection','DELETE'));assert.equal(removed.status,200);
 assert.equal((await handle(req('/api/ghost','POST',{message:'Hello'}))).status,409);
 assert.equal((await handle(req('/api/unknown'))).status,404);
});

test('mobile client sends a key only to its same-origin connection endpoint',async()=>{
 const require=createRequire(import.meta.url),client=require('../studio/cloud-connection.js'),ai=require('../studio/ai-client.js');
 const calls=[],fetchImpl=async(url,init)=>{calls.push({url,init});return Response.json({status:{aiConfigured:true,apiVerified:false}});};
 const result=await client.save(fixtureKey,{base:'https://ghost.example.test/',fetchImpl});
 assert.equal(result.apiVerified,false);assert.equal(calls[0].url,'https://ghost.example.test/api/connection');assert.equal(calls[0].init.credentials,'same-origin');assert.equal(JSON.parse(calls[0].init.body).apiKey,fixtureKey);
 assert.throws(()=>ai.endpoint('https://other.example.test/api/ghost','https://ghost.example.test/'),/signed-in website/);
 await client.remove({base:'https://ghost.example.test/',fetchImpl});assert.equal(calls[1].init.method,'DELETE');assert.equal(calls[1].init.body,undefined);
});


test('visitor cannot configure, remove, test, chat, or generate lyrics; no DB or upstream access',async()=>{
 let dbCalls=0,network=0;
 const handle=createHandler({DB:{prepare(){dbCalls++;throw Error('Visitor must not access DB');}},GHOST_SECRET_KEY:fixtureSecret},{fetchImpl:()=>{network++;throw Error('Visitor must not reach OpenAI');}});
 const visitor={'oai-authenticated-user-id':'visitor','oai-authenticated-user-email':'visitor@example.test'};
 const health=await handle(req('/api/health','GET',undefined,visitor));
 assert.equal(health.status,200);const status=await health.json();
 assert.equal(status.canUseApi,false);assert.equal(status.setupAvailable,false);assert.equal(status.aiConfigured,false);assert.equal('estimatedSpentUsd' in status,false);
 for(const [path,method] of [['/api/connection','POST'],['/api/connection','DELETE'],['/api/ghost','POST'],['/api/lyrics','POST']]){
  const r=await handle(req(path,method,method==='POST'?{apiKey:fixtureKey,message:'hello',owner:true,userId:'owner',email:API_OWNER_EMAIL}:undefined,visitor));
  assert.equal(r.status,403);assert.equal((await r.json()).code,'owner_only');
 }
 const anonymous=await handle(new Request('https://ghost.example.test/api/connection',{method:'POST',headers:{origin:'https://ghost.example.test','content-type':'application/json'},body:JSON.stringify({email:API_OWNER_EMAIL,owner:true})}));
 assert.equal(anonymous.status,401);assert.equal(dbCalls,0);assert.equal(network,0);
});
