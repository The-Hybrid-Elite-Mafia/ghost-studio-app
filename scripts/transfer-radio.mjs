/* Owner-authorized migration. Never deletes the source site or source media. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const limit=120*1024*1024;
export function validateManifest(value){
 if(!value||!Array.isArray(value.tracks)||!Array.isArray(value.genres)||!Array.isArray(value.uploads))throw Error('Expected tracks, genres and uploads from the source inventory.');
 if(value.uploads.some(x=>x.state!=='done')||value.tracks.some(x=>x.status==='uploading'))throw Error('The source has unfinished uploads. Resolve them before transferring or deleting it.');
 const ids=new Set();for(const t of value.tracks){
  if(!/^[a-zA-Z0-9_-]{1,100}$/.test(t.id)||ids.has(t.id))throw Error('Invalid or duplicate track ID.');ids.add(t.id);
  if(!['approved','pending','rejected'].includes(t.status)||!['audio/mpeg','audio/wav','video/mp4'].includes(t.mime))throw Error('Unsupported track status or media type.');
  if(!Number.isSafeInteger(t.bytes)||t.bytes<12||t.bytes>limit||!Number.isSafeInteger(t.created)||t.created<0)throw Error('Invalid source size or timestamp.');
  for(const [key,max] of [['title',120],['artist',100],['genre',35],['uploader',200]])if(typeof t[key]!=='string'||!t[key].trim()||t[key].length>max)throw Error('Invalid source '+key+'.');
 }
 return value;
}
export async function transferStation({manifest,sourceUrl,targetUrl,backupDir,sourceToken,targetToken,fetchImpl=fetch}){
 validateManifest(manifest);const source=new URL(sourceUrl),target=new URL(targetUrl);
 if(source.origin===target.origin)throw Error('Source and destination must differ.');
 if(source.protocol!=='https:'||target.protocol!=='https:')throw Error('HTTPS is required.');
 await fs.mkdir(backupDir,{recursive:true});await fs.writeFile(path.join(backupDir,'source-inventory.json'),JSON.stringify(manifest,null,2));
 const headers=(token,extra={})=>({...token?{'OAI-Sites-Authorization':token}:{},...extra});
 async function request(base,token,p,{method='GET',body,raw=false}={}){
  const h=headers(token,method==='GET'?{}:{Origin:base.origin,...raw?{'Content-Type':'application/octet-stream'}:{'Content-Type':'application/json'}});
  const r=await fetchImpl(new URL(p,base),{method,headers:h,redirect:'error',...(body!==undefined?{body:raw?body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Error('Station request failed ('+r.status+') for '+p.split('?')[0]+'. Source deletion is not safe.');return r;
 }
 const api=async(p,opts)=>(await request(target,targetToken,p,opts)).json();
 // Prove owner access before sending any data.
 const before=await api('/api/radio/migration');if(!Array.isArray(before.tracks)||!Array.isArray(before.uploads))throw Error('Destination inventory is unavailable.');
 if(before.uploads.length)throw Error('Destination has active uploads. Wait before migration.');
 await api('/api/radio/setup',{method:'POST'});
 const status=await api('/api/radio/station');const knownGenres=new Set(status.genres);
 for(const genre of [...manifest.genres.map(x=>typeof x==='string'?x:x.name),...manifest.tracks.map(t=>t.genre)])if(!knownGenres.has(genre)){await api('/api/radio/genres',{method:'POST',body:{name:genre}});knownGenres.add(genre);}
 const receipt={source:source.origin,target:target.origin,verified:[],sourceMayBeDeleted:false};
 for(const t of manifest.tracks){
  const files=[];
  for(const cover of [false,...t.cover_key?[true]:[]]){
   const r=await request(source,sourceToken,'/api/media/'+encodeURIComponent(t.id)+(cover?'?cover=1':''));
   const declared=Number(r.headers.get('content-length'));if(!declared||declared>limit)throw Error('Unexpected media size.');
   const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length!==declared)throw Error('Incomplete source media.');
   const filename=t.id+(cover?'.cover':'.audio');await fs.writeFile(path.join(backupDir,filename),bytes);files.push({cover,bytes,sha256:hash(bytes),filename});
  }
  if(files.reduce((sum,f)=>sum+f.bytes.length,0)!==t.bytes)throw Error('Source inventory size does not match its media.');
  const existing=before.tracks.find(x=>x.id===t.id);
  if(!existing){
   const ext=t.mime==='audio/wav'?'wav':t.mime==='video/mp4'?'mp4':'mp3';
   const uploadInfo={title:t.title,artist:t.artist,genre:t.genre,name:t.id+'.'+ext,audioSize:files[0].bytes.length,coverSize:files[1]?.bytes.length||0,rights:true,restore:{id:t.id,status:t.status,uploader:t.uploader,created:t.created}};
   const payload=Buffer.concat(files.map(x=>x.bytes));
   const session=await api('/api/radio/chunks',{method:'POST',body:{size:payload.length,uploadInfo}});
   if(session.id!==t.id||!Number.isInteger(session.chunkSize)||session.chunkSize<1)throw Error('Unexpected upload session.');
   for(let start=0,part=0;start<payload.length;start+=session.chunkSize,part++)await api('/api/radio/chunks?id='+encodeURIComponent(session.id)+'&part='+part,{method:'PUT',body:payload.subarray(start,start+session.chunkSize),raw:true});
   let complete=false;
   for(let step=0;step<200;step++){const result=await api('/api/radio/chunks?id='+encodeURIComponent(session.id),{method:'PATCH'});if(!result.pending){if(result.id!==t.id||result.status!==t.status)throw Error('Restored record differs.');complete=true;break;}}
   if(!complete)throw Error('Transfer remains incomplete. Source deletion is not safe.');
   await api('/api/radio/chunks?id='+encodeURIComponent(session.id),{method:'DELETE'});
  }
  const stored=await api('/api/radio/migration?id='+encodeURIComponent(t.id));
  for(const key of ['id','title','artist','genre','status','uploader','created','bytes','mime'])if(stored.track?.[key]!==t[key])throw Error('Destination metadata mismatch: '+key);
  for(const file of files){
   const r=await request(target,targetToken,'/api/radio/media/'+encodeURIComponent(t.id)+(file.cover?'?cover=1':''));const bytes=Buffer.from(await r.arrayBuffer());
   if(bytes.length!==file.bytes.length||hash(bytes)!==file.sha256)throw Error('Destination audio or artwork checksum mismatch.');
  }
  receipt.verified.push({id:t.id,files:files.map(({filename,sha256,bytes})=>({filename,sha256,size:bytes.length}))});
  await fs.writeFile(path.join(backupDir,'transfer-receipt.json'),JSON.stringify(receipt,null,2));
 }
 const after=await api('/api/radio/migration');
 if(after.uploads.length||manifest.tracks.some(t=>!after.tracks.some(x=>x.id===t.id)))throw Error('Destination has missing tracks or unfinished uploads.');
 // External deletion additionally requires a fresh source inventory comparison and durable backup.
 receipt.transferVerified=true;
 await fs.writeFile(path.join(backupDir,'transfer-receipt.json'),JSON.stringify(receipt,null,2));
 return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [manifestPath,sourceUrl,targetUrl,backupDir]=process.argv.slice(2);
 if(!manifestPath||!sourceUrl||!targetUrl||!backupDir)throw Error('Usage: node scripts/transfer-radio.mjs MANIFEST SOURCE_ORIGIN TARGET_ORIGIN BACKUP_DIRECTORY');
 const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 const result=await transferStation({manifest,sourceUrl,targetUrl,backupDir,sourceToken:process.env.RADIO_SOURCE_TOKEN,targetToken:process.env.RADIO_TARGET_TOKEN});
 console.log(JSON.stringify({verifiedTracks:result.verified.length,transferVerified:result.transferVerified,sourceDeleted:false}));
}
