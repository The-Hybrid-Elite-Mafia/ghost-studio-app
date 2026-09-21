import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(await readFile('drizzle/0000_noisy_gabe_jones.sql','utf8'));sqlite.exec(await readFile('drizzle/0001_groovy_banshee.sql','utf8'));
const objects=new Map(),multiparts=new Map();let requestGets=0,maxRequestGets=0;
const db = {
 prepare(sql) {
  let values=[];
  return {
   bind(...v) { values=v; return this; },
   async first() { return sqlite.prepare(sql).get(...values)||null; },
   async all() { return {results:sqlite.prepare(sql).all(...values)}; },
   async run() { return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}; }
  };
 }
};
const bucket={async createMultipartUpload(key,options){const uploadId=crypto.randomUUID(),parts=new Map();const upload={uploadId,async uploadPart(n,bytes){parts.set(n,new Uint8Array(bytes));return {partNumber:n,etag:String(n)}},async complete(list){const blob=new Blob(list.map(p=>parts.get(p.partNumber)));objects.set(key,{bytes:new Uint8Array(await blob.arrayBuffer()),httpMetadata:options.httpMetadata})},async abort(){parts.clear()}};multiparts.set(uploadId,upload);return upload},resumeMultipartUpload(key,id){const upload=multiparts.get(id);if(!upload)throw Error('Unknown multipart');return upload},async put(key,body,options){objects.set(key,{bytes:new Uint8Array(body),httpMetadata:options?.httpMetadata})},async head(key){const o=objects.get(key);return o?{size:o.bytes.length,httpMetadata:o.httpMetadata}:null},async get(key,options){requestGets++;maxRequestGets=Math.max(maxRequestGets,requestGets);const o=objects.get(key);const range=options?.range;return o?{body:range?o.bytes.slice(range.offset,range.offset+range.length):o.bytes,async arrayBuffer(){return o.bytes.buffer.slice(o.bytes.byteOffset,o.bytes.byteOffset+o.bytes.byteLength)}}:null},async delete(keys){for(const k of Array.isArray(keys)?keys:[keys])objects.delete(k)}};
globalThis.__stationTest={db,bucket,user:null};
const unusedShim=`export const defaults=['Country','Hip-Hop','Rock','R&B / Soul','Electronic','Pop','Gospel','Other'];export function db(){return globalThis.__stationTest.db}export function bucket(){return globalThis.__stationTest.bucket}export async function identity(){return globalThis.__stationTest.user}export async function owner(id){if(!id)return false;const s=await db().prepare('SELECT owner FROM station WHERE id=1').first();return s?.owner===id}export function fail(error,status=400){return Response.json({error},{status})}export function sameOrigin(r){return r.headers.get('origin')===new URL(r.url).origin}export async function safe(fn){return fn()}`;
const routes={};await mkdir('.sites-runtime/test-routes',{recursive:true});
for(const [key,path] of Object.entries({migration:'migration',chunks:'chunks',station:'station',setup:'setup',genres:'genres',upload:'upload',track:'tracks/[id]',media:'media/[id]'})){
 const result=await build({entryPoints:[`app/api/radio/${path}/route.ts`],bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'local-storage-test',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'cloudflare',namespace:'test'}));b.onResolve({filter:/^next\/headers$/},()=>({path:'headers',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},args=>({contents:args.path==='cloudflare'?`export const env={DB:globalThis.__stationTest.db,BUCKET:globalThis.__stationTest.bucket}`:`export async function headers(){const user=globalThis.__stationTest.user;return new Headers(user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user==='owner'?'steve.reliford@gmail.com':'listener@example.invalid'}:{})}`,loader:'js'}));}}]});
 const file=`.sites-runtime/test-routes/radio-${key}.mjs`;await writeFile(file,result.outputFiles[0].text);routes[key]=await import('../'+file);
}
async function call(route,method='GET',body=null,user=null,id='',extra={}){globalThis.__stationTest.user=user;const r=new Request('https://radio.test/api/'+route+(route==='chunks'&&id?'?'+id:''),{method,headers:{origin:'https://radio.test',...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{}),...extra},...(body?{body:body instanceof FormData||body instanceof Blob?body:JSON.stringify(body)}:{})});for(let step=0;step<200;step++){requestGets=0;const response=await routes[route][method](r.clone(),{params:Promise.resolve({id})});if(route==='chunks'&&method==='PATCH'&&response.ok&&(await response.clone().json()).pending){assert.ok(requestGets<=24,'Finalize step must have bounded object reads');continue;}return response;}throw Error('Too many finalize steps');}
let r=await call('station');assert.equal(r.status,200);assert.equal((await r.json()).setup,false);
assert.equal((await call('setup','POST')).status,401);
assert.equal((await call('setup','POST',null,'listener')).status,403,'visitor cannot claim an uninitialized station');
assert.equal((await call('setup','POST',null,'owner')).status,200);
assert.equal((await call('setup','POST',null,'listener')).status,403);
assert.equal((await call('genres','POST',{name:'Country Trap'},'listener')).status,403);
assert.equal((await call('genres','POST',{name:'Country Trap'},'owner')).status,200);
const fd=new FormData();fd.set('title','Transport test fixture');fd.set('artist','Test fixture');fd.set('genre','Country Trap');fd.set('rights','yes');fd.set('audio',new File([new Uint8Array([73,68,51,4,0,0,0,0,0,0,255,251,144,0])],'fixture.mp3',{type:'audio/mpeg'}));
r=await call('upload','POST',fd,'listener');assert.equal(r.status,200,await r.clone().text());const {id}=await r.json();
assert.equal((await call('media','GET',null,null,id)).status,403);
assert.equal((await call('media','GET',null,'owner',id)).status,200);
r=await call('station');assert.equal((await r.json()).tracks.length,0);
assert.equal((await call('track','PATCH',{status:'approved'},'listener',id)).status,403);
assert.equal((await call('track','PATCH',{status:'approved'},'owner',id)).status,200);
r=await call('station');assert.equal((await r.json()).tracks.length,1);
r=await call('media','GET',null,null,id,{Range:'bytes=0-3'});assert.equal(r.status,206);assert.equal(r.headers.get('Content-Range'),'bytes 0-3/14');assert.equal((await r.arrayBuffer()).byteLength,4);
assert.equal((await call('media','GET',null,null,id,{Range:'bytes=99-100'})).status,416);
assert.equal((await call('track','DELETE',null,'listener',id)).status,403);
assert.equal((await call('track','DELETE',null,'owner',id)).status,200);
assert.equal((await call('media','GET',null,null,id)).status,404);assert.equal(objects.size,0);
const large=new Uint8Array(1500000);large.set([73,68,51]);fd.set('audio',new File([large],'large.mp3',{type:'audio/mpeg'}));
const payload=await new Response(fd).blob();r=await call('chunks','POST',{size:payload.size,contentType:payload.type},'owner');assert.equal(r.status,200,await r.clone().text());const session=await r.json();
assert.equal((await call('chunks','PUT',payload.slice(0,session.chunkSize),'listener','id='+session.id+'&part=0')).status,409);
for(let start=0,i=0;start<payload.size;start+=session.chunkSize,i++){r=await call('chunks','PUT',payload.slice(start,start+session.chunkSize),'owner','id='+session.id+'&part='+i);assert.equal(r.status,200,await r.clone().text());}
r=await call('chunks','PATCH',null,'owner','id='+session.id);assert.equal(r.status,200,await r.clone().text());const saved=await r.json();assert.equal(saved.status,'approved');
r=await call('chunks','PATCH',null,'owner','id='+session.id);assert.equal((await r.json()).id,saved.id);assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM tracks').get().n,1);
r=await call('media','GET',null,null,saved.id);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),large);
assert.equal((await call('chunks','DELETE',null,'owner','id='+session.id)).status,200);
assert.equal([...objects.keys()].filter(k=>k.startsWith('chunks/')).length,0);
const fixtures=[['owner.wav',new Uint8Array([...Buffer.from('RIFF'),0,0,0,0,...Buffer.from('WAVE'),0,0,0,0])],['owner.mp4',process.env.TEST_MP4_PATH?new Uint8Array(await readFile(process.env.TEST_MP4_PATH)):new Uint8Array([...Buffer.from([0,0,0,24]),...Buffer.from('ftypisom'),...new Uint8Array(6*1024*1024)])]];
for(const [name,bytes] of fixtures){
const info={title:name,artist:'Owner',genre:'Country',name,audioSize:bytes.length,coverSize:0,rights:true};
assert.equal((await call('chunks','POST',{size:bytes.length,uploadInfo:info},'listener')).status,403);
r=await call('chunks','POST',{size:bytes.length,uploadInfo:info},'owner');assert.equal(r.status,200,await r.clone().text());const up=await r.json();
for(let start=0,i=0;start<bytes.length;start+=up.chunkSize,i++)assert.equal((await call('chunks','PUT',new Blob([bytes.slice(start,start+up.chunkSize)]),'owner','id='+up.id+'&part='+i)).status,200);
r=await call('chunks','PATCH',null,'owner','id='+up.id);assert.equal(r.status,200,await r.clone().text());const output=await r.json();
r=await call('media','GET',null,null,output.id);assert.equal(r.headers.get('Content-Type'),name.endsWith('.wav')?'audio/wav':'video/mp4');assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes);
await call('chunks','DELETE',null,'owner','id='+up.id);
}

// Two queued owner uploads use the same large cover without altering the bytes.
const artwork=new Uint8Array(6*1024*1024+37);artwork.set([137,80,78,71,13,10,26,10]);
async function rawUpload(body,meta,user='owner'){
let response=await call('chunks','POST',{size:body.size,...meta},user);assert.equal(response.status,200,await response.clone().text());const u=await response.json();
for(let start=0,i=0;start<body.size;start+=u.chunkSize,i++)assert.equal((await call('chunks','PUT',body.slice(start,start+u.chunkSize),user,'id='+u.id+'&part='+i)).status,200);
response=await call('chunks','PATCH',null,user,'id='+u.id);assert.equal(response.status,200,await response.clone().text());const out=await response.json();await call('chunks','DELETE',null,user,'id='+u.id);return out;
}
const newIds=[];
for(const title of ['Batch one','Batch two']){const audioBytes=new Uint8Array([73,68,51,4,0,0,0,0,0,0,255,251,144,0]);const result=await rawUpload(new Blob([audioBytes,artwork]),{uploadInfo:{title,artist:'Owner',genre:'Country',name:'batch.mp3',audioSize:audioBytes.length,coverSize:artwork.length,rights:true}});newIds.push(result.id);assert.deepEqual(objects.get('covers/'+result.id).bytes,artwork);}
const edited=new Uint8Array(2*1024*1024);edited.set([255,216,255]);
const coverInfo={action:'cover',trackId:newIds[0],coverSize:edited.length};
assert.equal((await call('chunks','POST',{size:edited.length,coverInfo},'listener')).status,403);
assert.equal((await call('chunks','POST',{size:21*1024*1024,coverInfo:{...coverInfo,coverSize:21*1024*1024}},'owner')).status,400);
const before=sqlite.prepare('SELECT bytes FROM tracks WHERE id=?').get(newIds[0]).bytes;
const replacement=await rawUpload(new Blob([edited]),{coverInfo});
assert.deepEqual(objects.get(replacement.coverKey).bytes,edited);
assert.equal(objects.has('covers/'+newIds[0]),false);
assert.deepEqual(objects.get('covers/'+newIds[1]).bytes,artwork);
assert.equal(sqlite.prepare('SELECT bytes FROM tracks WHERE id=?').get(newIds[0]).bytes,before-artwork.length+edited.length);
fd.set('cover',new File([edited],'cover.jpg',{type:'image/jpeg'}));
assert.equal((await call('upload','POST',fd,'listener')).status,400);
fd.delete('cover');fd.append('audio',new File([large],'second.mp3',{type:'audio/mpeg'}));
assert.equal((await call('upload','POST',fd,'listener')).status,400);

// Reproduce an abandoned legacy finalization and ensure a new upload can reclaim it.
const staleId='stale-owner';sqlite.prepare("INSERT INTO uploads(id,user,size,content_type,created,state) VALUES(?,?,?,?,?,'finishing')").run(staleId,'owner',256,JSON.stringify({}),Date.now()-600000);
sqlite.prepare("INSERT INTO tracks(id,title,artist,genre,status,uploader,audio_key,mime,bytes,created) VALUES(?,?,?,?,?,?,?,?,?,?)").run(staleId,'unfinished','Owner','Rock','uploading','owner','audio/'+staleId,'audio/wav',256,Date.now());
const big=new Uint8Array(56*1024*1024);big.set(Buffer.from('RIFF'));big.set(Buffer.from('WAVE'),8);
const bigResult=await rawUpload(new Blob([big]),{uploadInfo:{title:'Large WAV check',artist:'Owner',genre:'Rock',name:'large.wav',audioSize:big.length,coverSize:0,rights:true}});
assert.equal(sqlite.prepare('SELECT id FROM uploads WHERE id=?').get(staleId),undefined);
assert.equal(sqlite.prepare('SELECT id FROM tracks WHERE id=?').get(staleId),undefined);
assert.equal(objects.get('audio/'+bigResult.id).bytes.length,big.length);
assert.ok(maxRequestGets<=24);
// Reset is scoped to the current account; active finalization is protected.
sqlite.prepare("INSERT INTO uploads(id,user,size,content_type,created,updated,state) VALUES(?,?,?,?,?,?,'finishing')").run('active-owner','owner',256,'multipart/form-data;boundary=test',Date.now(),Date.now());
assert.equal((await call('chunks','DELETE',null,'listener','reset=1')).status,200);
assert.ok(sqlite.prepare("SELECT id FROM uploads WHERE id='active-owner'").get());
assert.equal((await call('chunks','DELETE',null,'owner','reset=1')).status,409);
sqlite.prepare("UPDATE uploads SET updated=? WHERE id='active-owner'").run(Date.now()-600000);
assert.equal((await call('chunks','DELETE',null,'owner','reset=1')).status,200);
assert.equal(sqlite.prepare("SELECT id FROM uploads WHERE id='active-owner'").get(),undefined);
assert.ok(objects.has('audio/'+bigResult.id),'Completed audio survives reset');
console.log('PASS: stale 10-minute finalization recovery, 56 MB WAV in bounded steps, user-scoped reset, active-save protection, completed-track preservation.');
console.log('PASS: sequential owner uploads with shared 6 MB artwork, independent cover replacement, storage accounting, owner 20 MB cap, and visitor restrictions.');
console.log('PASS: owner WAV and MP4, multipart byte equality, MIME type, and non-owner denial.');
console.log('PASS: chunked 1.5 MB upload, ownership, assembly byte identity, repeat finalization, and temporary cleanup.');
console.log('PASS: API handlers with SQLite and an in-memory object-store adapter: owner setup, visitor restrictions, upload, moderation, publication, range streaming, invalid ranges and deletion. This is not a hosted-runtime or audio-decoding test.');
// Restoring a private submission never briefly publishes it.
const originalId='original-private-track',originalCreated=1700000000000;
const restoreAudio=new Uint8Array([73,68,51,4,0,0,0,0,0,0,255,251,144,0]);
const restoreInfo={title:'Restored private submission',artist:'Original artist',genre:'Country',name:'restored.mp3',audioSize:restoreAudio.length,coverSize:0,rights:true,restore:{id:originalId,status:'pending',uploader:'original-listener',created:originalCreated}};
assert.equal((await call('chunks','POST',{size:restoreAudio.length,uploadInfo:restoreInfo},'listener')).status,403);
const restoreSession=await (await call('chunks','POST',{size:restoreAudio.length,uploadInfo:restoreInfo},'owner')).json();
assert.equal(restoreSession.id,originalId);
assert.equal((await call('chunks','PUT',new Blob([restoreAudio]),'owner','id='+originalId+'&part=0')).status,200);
const restored=await call('chunks','PATCH',null,'owner','id='+originalId);assert.equal(restored.status,200);assert.equal((await restored.json()).status,'pending');
const row=sqlite.prepare('SELECT * FROM tracks WHERE id=?').get(originalId);assert.equal(row.uploader,'original-listener');assert.equal(row.created,originalCreated);assert.equal(row.status,'pending');
assert.equal((await call('media','GET',null,'listener',originalId)).status,403);assert.equal((await call('media','GET',null,'owner',originalId)).status,200);
const publicList=await (await call('station')).json();assert.ok(!publicList.tracks.some(t=>t.id===originalId));
await call('chunks','DELETE',null,'owner','id='+originalId);
assert.equal((await call('chunks','POST',{size:restoreAudio.length,uploadInfo:restoreInfo},'owner')).status,409,'restoration cannot overwrite an existing track');
assert.equal((await call('migration','GET',null,'listener')).status,403);assert.equal((await call('migration','GET',null,'owner')).status,200);
console.log('PASS: main-site migration preserves original identity, private status, uploader, timestamps, exact media, and denies visitor restore/inspection and overwrite.');

sqlite.close();
