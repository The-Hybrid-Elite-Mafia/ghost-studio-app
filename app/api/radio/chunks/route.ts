import {assembleStep,clearSession,type UploadSession} from "@/lib/radio/upload-assembly";
import {validateInfo,validateCover,type UploadInfo,type CoverInfo} from "@/lib/radio/owner-upload";
import {db,bucket,identity,owner,sameOrigin,safe,fail} from "@/lib/radio/station";
import {POST as saveUpload} from "../upload/route";
const CHUNK=256*1024,MAX=14*1024*1024;
type Session=UploadSession;
const STALE=3*60*1000;
const idle=(s:Session)=>Date.now()-(s.updated||s.created);
async function cleanup(s:Session){const keys=Array.from({length:Math.ceil(s.size/CHUNK)},(_,i)=>`chunks/${s.id}/${i}`);for(let i=0;i<keys.length;i+=100)await bucket().delete(keys.slice(i,i+100));}
async function session(r:Request,user:string){const id=new URL(r.url).searchParams.get("id");return db().prepare("SELECT * FROM uploads WHERE id=? AND user=?").bind(id||"",user).first<Session>();}
async function bytes(r:Request,max:number){if(Number(r.headers.get("content-length"))>max)throw Error("Chunk too large");if(!r.body)throw Error("Missing chunk");const reader=r.body.getReader(),parts:Uint8Array[]=[];let count=0;for(;;){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>max){await reader.cancel();throw Error("Chunk too large");}parts.push(value);}return new Blob(parts as BlobPart[]).arrayBuffer();}
export async function POST(r:Request){return safe(async()=>{
 if(!sameOrigin(r))return fail("Request not allowed",403);const user=await identity();if(!user)return fail("Please sign in again",401);
 const {size,contentType,uploadInfo,coverInfo}=await r.json() as {size:number;contentType:string;uploadInfo?:UploadInfo;coverInfo?:CoverInfo};
 let storedType=contentType;
 if(uploadInfo&&coverInfo)return fail("Choose one upload type");
 if(coverInfo){if(!await owner(user))return fail("Only the station owner can change cover art",403);try{await validateCover(coverInfo);}catch(e){return fail((e as Error).message);}if(size!==coverInfo.coverSize)return fail("Invalid cover size");storedType=JSON.stringify(coverInfo);}

 if(uploadInfo){if(!await owner(user))return fail("Only the station owner can upload WAV or MP4 files",403);try{await validateInfo(uploadInfo);}catch(e){return fail((e as Error).message);}if(size!==uploadInfo.audioSize+uploadInfo.coverSize)return fail("Invalid upload size");storedType=JSON.stringify(uploadInfo);}

 if(!uploadInfo&&!coverInfo&&(!Number.isInteger(size)||size<1||size>MAX||typeof contentType!=="string"||contentType.length>200||!/^multipart\/form-data;\s*boundary=[a-zA-Z0-9-]+$/.test(contentType)))return fail("Choose an MP3 under 12 MB and cover under 1 MB");
 const old=await db().prepare("SELECT * FROM uploads WHERE user=? AND (state='done' OR CASE WHEN updated>0 THEN updated ELSE created END<?)").bind(user,Date.now()-STALE).all<Session>();
 for(const s of old.results){await clearSession(s);}
 const id=uploadInfo?.restore?.id||crypto.randomUUID();
 if(uploadInfo?.restore&&await db().prepare('SELECT id FROM tracks WHERE id=?').bind(id).first())return fail('This original track already exists. Verify it before retrying.',409);
 const result=await db().prepare("INSERT INTO uploads(id,user,size,content_type,created,state) SELECT ?,?,?,?,?,'uploading' WHERE (SELECT COUNT(*) FROM uploads WHERE user=?)=0").bind(id,user,size,storedType,Date.now(),user).run();
 if(!result.meta.changes)return fail("An unfinished upload is active. Tap Reset stuck upload on the Upload page, then try again.",409);
 return Response.json({id,chunkSize:CHUNK});
});}
export async function PUT(r:Request){return safe(async()=>{
 if(!sameOrigin(r))return fail("Request not allowed",403);const user=await identity();if(!user)return fail("Please sign in again",401);const s=await session(r,user);if(!s||s.state!=="uploading"||idle(s)>STALE)return fail("Upload expired. Please try again.",409);
 const index=Number(new URL(r.url).searchParams.get("part"));if(!Number.isInteger(index)||index<0||index>=Math.ceil(s.size/CHUNK))return fail("Invalid upload part");
 const body=await bytes(r,CHUNK),expected=Math.min(CHUNK,s.size-index*CHUNK);if(body.byteLength!==expected)return fail("Incomplete upload part. Please retry.");
 await bucket().put(`chunks/${s.id}/${index}`,body);await db().prepare("UPDATE uploads SET updated=? WHERE id=? AND state='uploading'").bind(Date.now(),s.id).run();return Response.json({ok:true});
});}
export async function PATCH(r:Request){return safe(async()=>{
 if(!sameOrigin(r))return fail("Request not allowed",403);const user=await identity();if(!user)return fail("Please sign in again",401);const s=await session(r,user);if(!s)return fail("Upload not found",404);if(s.state==='done'&&s.result)return Response.json(JSON.parse(s.result));
 const lock=await db().prepare("UPDATE uploads SET state='finishing',updated=? WHERE id=? AND state IN ('uploading','assembling')").bind(Date.now(),s.id).run();if(!lock.meta.changes)return fail("Your song is still being saved. Please wait.",409);
 try {
 if(s.content_type.startsWith('{')){
 if(!await owner(user))return fail("Owner access required",403);
 const output=await assembleStep(s);
 if('pending' in output){await db().prepare("UPDATE uploads SET state='assembling',updated=? WHERE id=? AND state='finishing'").bind(Date.now(),s.id).run();return Response.json(output);}
 const result=JSON.stringify(output);await db().prepare("UPDATE uploads SET state='done',result=? WHERE id=?").bind(result,s.id).run();await cleanup(s);return new Response(result,{headers:{"Content-Type":"application/json"}});
 }
 const parts:ArrayBuffer[]=[];for(let i=0;i<Math.ceil(s.size/CHUNK);i++){const part=await bucket().get(`chunks/${s.id}/${i}`);if(!part)throw Error("Missing upload part");parts.push(await part.arrayBuffer());}
 const payload=new Blob(parts,{type:s.content_type});if(payload.size!==s.size)throw Error("Incomplete upload");
 const response=await saveUpload(new Request(r.url,{method:"POST",headers:{origin:r.headers.get("origin")!,"content-type":s.content_type,"x-upload-session":s.id},body:payload}));
 if(!response.ok){await db().prepare("UPDATE uploads SET state='uploading' WHERE id=?").bind(s.id).run();return response;}
 const result=await response.text();await db().prepare("UPDATE uploads SET state='done',result=? WHERE id=?").bind(result,s.id).run();await cleanup(s);return new Response(result,{headers:{"Content-Type":"application/json"}});
 }catch(e){await db().prepare("UPDATE uploads SET state=CASE WHEN progress IS NULL THEN 'uploading' ELSE 'assembling' END WHERE id=? AND state='finishing'").bind(s.id).run();throw e;}
});}
export async function GET(){return safe(async()=>{const user=await identity();if(!user)return fail("Sign in first",401);const s=await db().prepare("SELECT * FROM uploads WHERE user=? AND state!='done' ORDER BY created DESC LIMIT 1").bind(user).first<Session>();return Response.json({active:!!s,canReset:!!s&&(s.state!=="finishing"||idle(s)>STALE)},{headers:{"Cache-Control":"no-store"}});});}
export async function DELETE(r:Request){return safe(async()=>{
 if(!sameOrigin(r))return fail("Request not allowed",403);const user=await identity();if(!user)return fail("Please sign in again",401);
 const reset=new URL(r.url).searchParams.get('reset')==='1';
 const s=reset?await db().prepare("SELECT * FROM uploads WHERE user=? ORDER BY created DESC LIMIT 1").bind(user).first<Session>():await session(r,user);
 if(!s)return Response.json({ok:true});
 if(s.state==='finishing'&&idle(s)<STALE)return fail("A save is still running. Wait three minutes without uploading, then reset it.",409);
 await clearSession(s);return Response.json({ok:true});
});}
