import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {transferStation,validateManifest} from '../scripts/transfer-radio.mjs';
const audio=Buffer.from([73,68,51,4,0,0,0,0,0,0,255,251,144,0]);
const track={id:'old-track',title:'Private fixture',artist:'Test',genre:'Rock',status:'pending',uploader:'original-user',created:1700000000000,mime:'audio/mpeg',audio_key:'old/audio',cover_key:null,bytes:audio.length};
const manifest={tracks:[track],genres:[{name:'Rock'}],uploads:[]};
test('rejects unsafe paths, duplicate IDs and unfinished source uploads',()=>{
 assert.throws(()=>validateManifest({...manifest,tracks:[{...track,id:'../escape'}]}));
 assert.throws(()=>validateManifest({...manifest,tracks:[track,track]}));
 assert.throws(()=>validateManifest({...manifest,uploads:[{state:'assembling'}]}));
});
function fake(corrupt=false){let info=null,payload=null,stored=null,calls=[];
 const json=x=>Response.json(x);
 return {calls,fetch:async(url,opts)=>{
  calls.push([url.origin,url.pathname,opts.method]);
  if(url.origin==='https://source.test')return new Response(audio,{headers:{'content-length':String(audio.length)}});
  if(url.pathname.endsWith('/migration'))return json(url.searchParams.has('id')?{track:stored}:{tracks:stored?[stored]:[],uploads:[],genres:['Rock']});
  if(url.pathname.endsWith('/setup'))return json({ok:true});
  if(url.pathname.endsWith('/station'))return json({genres:['Rock']});
  if(url.pathname.endsWith('/chunks')){
   if(opts.method==='POST'){info=JSON.parse(opts.body).uploadInfo;return json({id:info.restore.id,chunkSize:256*1024});}
   if(opts.method==='PUT'){payload=Buffer.from(opts.body);return json({ok:true});}
   if(opts.method==='PATCH'){stored={...track,...info.restore,title:info.title,artist:info.artist,genre:info.genre};return json({id:stored.id,status:stored.status});}
   if(opts.method==='DELETE')return json({ok:true});
  }
  if(url.pathname.includes('/media/'))return new Response(corrupt?Buffer.alloc(audio.length):payload);
  throw Error('Unexpected test request '+url.pathname);
 }};
}
test('transfers and verifies private metadata and exact bytes without deleting source',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'radio-transfer-')),f=fake();
 try{const receipt=await transferStation({manifest,sourceUrl:'https://source.test',targetUrl:'https://main.test',backupDir:dir,fetchImpl:f.fetch});
 assert.equal(receipt.transferVerified,true);assert.equal(receipt.sourceMayBeDeleted,false);assert.equal(receipt.verified.length,1);
 assert.deepEqual(await fs.readFile(path.join(dir,'old-track.audio')),audio);
 assert.ok(!f.calls.some(([origin,,method])=>origin==='https://source.test'&&method!=='GET'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('checksum mismatch blocks migration verification and leaves a backup',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'radio-transfer-')),f=fake(true);
 try{await assert.rejects(transferStation({manifest,sourceUrl:'https://source.test',targetUrl:'https://main.test',backupDir:dir,fetchImpl:f.fetch}),/checksum mismatch/);assert.deepEqual(await fs.readFile(path.join(dir,'old-track.audio')),audio);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
