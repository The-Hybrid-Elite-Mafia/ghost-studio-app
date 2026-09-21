import {bucket,db} from './station';
import {readRange,validateInfo,validateCover,type UploadInfo,type CoverInfo} from './owner-upload';
type Target={key:string;start:number;size:number;mime:string;uploadId?:string;parts:R2UploadedPart[];offset:number;done:boolean};
type Job={targets:Target[];trackId:string;coverEdit:boolean;previousKey?:string|null;previousBytes?:number;delta?:number};
export type UploadSession={id:string;user:string;size:number;content_type:string;created:number;updated:number;state:string;result:string|null;progress:string|null};
function imageMime(h:Uint8Array){return h[0]===255&&h[1]===216&&h[2]===255?'image/jpeg':h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71?'image/png':'';}
async function saveJob(s:UploadSession,job:Job){const r=await db().prepare("UPDATE uploads SET progress=?,updated=? WHERE id=? AND state='finishing'").bind(JSON.stringify(job),Date.now(),s.id).run();if(!r.meta.changes)throw Error('Upload was reset. Please try again.');}
export async function assembleStep(s:UploadSession){
 const info=JSON.parse(s.content_type) as UploadInfo&CoverInfo;
 // Recover an already committed result after a lost response.
 if(info.action==='cover'){
 const t=await db().prepare('SELECT cover_key FROM tracks WHERE id=?').bind(info.trackId).first();if(t?.cover_key==='covers/'+s.id)return {ok:true,id:info.trackId,coverKey:t.cover_key};
 }else{const t=await db().prepare("SELECT status FROM tracks WHERE id=?").bind(s.id).first();if(t&&t.status!=='uploading')return {ok:true,id:s.id,status:t.status};}
 let job:Job;
 if(s.progress)job=JSON.parse(s.progress);
 else{
 if(info.action==='cover'){
 await validateCover(info);const t=await db().prepare('SELECT cover_key,bytes FROM tracks WHERE id=?').bind(info.trackId).first<{cover_key:string|null;bytes:number}>();if(!t)throw Error('Track not found');
 const mime=imageMime(new Uint8Array(await readRange(s.id,0,8)));if(!mime)throw Error('Choose JPG or PNG cover art');
 const old=t.cover_key?await bucket().head(t.cover_key):null;
 job={trackId:info.trackId,coverEdit:true,previousKey:t.cover_key,previousBytes:t.bytes,delta:info.coverSize-(old?.size||0),targets:[{key:'covers/'+s.id,start:0,size:info.coverSize,mime,parts:[],offset:0,done:false}]};
 }else{
 await validateInfo(info);const h=new Uint8Array(await readRange(s.id,0,12)),text=(a:number,b:number)=>String.fromCharCode(...h.slice(a,b));
 const ext=info.name.split('.').pop()!.toLowerCase(),mime=ext==='wav'?'audio/wav':ext==='mp4'?'video/mp4':'audio/mpeg';
 if(ext==='mp3'&&!(text(0,3)==='ID3'||h[0]===255&&(h[1]&224)===224))throw Error('The file is not an MP3');
 if(ext==='wav'&&!(text(0,4)==='RIFF'&&text(8,12)==='WAVE'))throw Error('The file is not a WAV');
 if(ext==='mp4'&&text(4,8)!=='ftyp')throw Error('The file is not an MP4');
 const targets:Target[]=[{key:'audio/'+s.id,start:0,size:info.audioSize,mime,parts:[],offset:0,done:false}];
 if(info.coverSize){const image=imageMime(new Uint8Array(await readRange(s.id,info.audioSize,info.audioSize+Math.min(8,info.coverSize))));if(!image)throw Error('Choose JPG or PNG cover art');targets.push({key:'covers/'+s.id,start:info.audioSize,size:info.coverSize,mime:image,parts:[],offset:0,done:false});}
 const previous=await db().prepare('SELECT id FROM tracks WHERE id=?').bind(s.id).first();
 if(!previous){const total=info.audioSize+info.coverSize;const reserved=await db().prepare("INSERT INTO tracks(id,title,artist,genre,status,uploader,audio_key,cover_key,mime,bytes,created) SELECT ?,?,?,?,'uploading',?,?,?,?,?,? WHERE (SELECT COALESCE(SUM(bytes),0) FROM tracks)+?<=2000000000 AND (SELECT COUNT(*) FROM tracks)<2000").bind(s.id,info.title.trim(),info.artist.trim(),info.genre,s.user,'audio/'+s.id,info.coverSize?'covers/'+s.id:null,mime,total,Date.now(),total).run();if(!reserved.meta.changes)throw Error('The station is full');}
 job={targets,trackId:s.id,coverEdit:false};
 }
 await saveJob(s,job);
 }
 const target=job.targets.find(t=>!t.done);
 if(target){
 if(!target.uploadId){const upload=await bucket().createMultipartUpload(target.key,{httpMetadata:{contentType:target.mime}});target.uploadId=upload.uploadId;await saveJob(s,job);}
 const upload=bucket().resumeMultipartUpload(target.key,target.uploadId);
 if(target.offset<target.size){const end=Math.min(target.offset+5*1024*1024,target.size);const bytes=await readRange(s.id,target.start+target.offset,target.start+end);const part=await upload.uploadPart(target.parts.length+1,bytes);target.parts.push(part);target.offset=end;await saveJob(s,job);}
 else{const existing=await bucket().head(target.key);if(!existing||existing.size!==target.size)await upload.complete(target.parts);target.done=true;await saveJob(s,job);}
 return {pending:true,percent:Math.round(job.targets.reduce((n,t)=>n+t.offset,0)/job.targets.reduce((n,t)=>n+t.size,0)*100)};
 }
 if(job.coverEdit){const result=await db().prepare("UPDATE tracks SET cover_key=?,bytes=bytes+? WHERE id=? AND cover_key IS ? AND bytes=? AND (SELECT COALESCE(SUM(bytes),0) FROM tracks)+?<=2000000000").bind(job.targets[0].key,job.delta,job.trackId,job.previousKey,job.previousBytes,job.delta).run();if(!result.meta.changes)throw Error('The track changed or station is full. Reset this upload and try again.');if(job.previousKey)await bucket().delete(job.previousKey).catch(()=>{});return {ok:true,id:job.trackId,coverKey:job.targets[0].key};}
 const status=info.restore?.status||'approved';
 const done=await db().prepare("UPDATE tracks SET status=?,uploader=?,created=? WHERE id=? AND status='uploading'").bind(status,info.restore?.uploader||s.user,info.restore?.created??s.created,job.trackId).run();
 if(!done.meta.changes)throw Error('Track no longer available');return {ok:true,id:job.trackId,status};
}
export async function clearSession(s:UploadSession){
 const claimed=await db().prepare("UPDATE uploads SET state='cancelling' WHERE id=? AND user=? AND state=? AND updated=?").bind(s.id,s.user,s.state,s.updated).run();if(!claimed.meta.changes)throw Error('Upload activity changed. Please try again.');
 const job=s.progress?JSON.parse(s.progress) as Job:null;
 if(job)for(const t of job.targets){if(t.uploadId)await bucket().resumeMultipartUpload(t.key,t.uploadId).abort().catch(()=>{});}
 // Delete only objects not referenced by a completed track.
 for(const key of ['audio/'+s.id,'covers/'+s.id]){const used=await db().prepare("SELECT id FROM tracks WHERE (audio_key=? OR cover_key=?) AND status!='uploading'").bind(key,key).first();if(!used)await bucket().delete(key);}
 await db().prepare("DELETE FROM tracks WHERE id=? AND uploader=? AND status='uploading'").bind(s.id,s.user).run();
 const keys=Array.from({length:Math.ceil(s.size/(256*1024))},(_,i)=>`chunks/${s.id}/${i}`);for(let i=0;i<keys.length;i+=100)await bucket().delete(keys.slice(i,i+100));
 await db().prepare('DELETE FROM uploads WHERE id=? AND user=?').bind(s.id,s.user).run();
}
