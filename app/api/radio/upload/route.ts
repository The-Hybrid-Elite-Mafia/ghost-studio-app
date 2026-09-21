import {db,bucket,identity,owner,defaults,sameOrigin,safe,fail} from "@/lib/radio/station";
export async function POST(r:Request){return safe(async()=>{
 if(!sameOrigin(r))return fail("Request not allowed",403);
 const user=await identity();if(!user)return fail("Please sign in to submit music",401);
 if(!await db().prepare("SELECT id FROM station WHERE id=1").first())return fail("The owner is still setting up this station",409);
 const limit=14*1024*1024;
 if(Number(r.headers.get("content-length"))>limit)return fail("Upload is too large. Choose an MP3 under 12 MB and cover under 1 MB",413);
 if(!r.body)return fail("Choose an audio file");
 let total=0;const parts:Uint8Array[]=[];const reader=r.body.getReader();
 while(true){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>limit){await reader.cancel();return fail("Upload exceeds 14 MB",413);}parts.push(value);}
 const data=await new Response(new Blob(parts as BlobPart[]),{headers:{"Content-Type":r.headers.get("content-type")||""}}).formData();
 const title=String(data.get("title")||"").trim(),artist=String(data.get("artist")||"").trim(),genre=String(data.get("genre")||"").trim();
 if(!title||title.length>120||!artist||artist.length>100)return fail("Enter a title and artist (120 and 100 characters maximum)");
 if(!defaults.includes(genre)&&!await db().prepare("SELECT name FROM genres WHERE name=?").bind(genre).first())return fail("Choose an available genre");
 if(data.get("rights")!=="yes")return fail("Please confirm you have permission to share this music");
 if(data.getAll("audio").length!==1)return fail("Upload one track at a time");
 const audio=data.get("audio"),cover=data.get("cover");
 if(!(audio instanceof File)||!audio.size||audio.size>12*1024*1024||!audio.name.toLowerCase().endsWith(".mp3"))return fail("Choose an MP3 file up to 12 MB");
 const head=new Uint8Array(await audio.slice(0,4).arrayBuffer());
 if(!(head[0]===73&&head[1]===68&&head[2]===51)&&!(head[0]===255&&(head[1]&224)===224))return fail("This file does not appear to be an MP3");
 let coverFile:File|null=null;
 if(cover instanceof File&&cover.size){if(cover.size>1024*1024)return fail("Cover art must be under 1 MB");const h=new Uint8Array(await cover.slice(0,8).arrayBuffer());const jpg=h[0]===255&&h[1]===216&&h[2]===255;const png=h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71;if(!jpg&&!png)return fail("Choose a JPG or PNG cover");coverFile=new File([cover],"cover",{type:jpg?"image/jpeg":"image/png"});}
 const sessionId=r.headers.get("x-upload-session");
 let uploadId=crypto.randomUUID();
 if(sessionId){const active=await db().prepare("SELECT id FROM uploads WHERE id=? AND user=? AND state='finishing'").bind(sessionId,user).first();if(!active)return fail("Invalid upload session",403);uploadId=sessionId;const existing=await db().prepare("SELECT id,status FROM tracks WHERE id=? AND uploader=?").bind(uploadId,user).first();if(existing&&existing.status!=="uploading")return Response.json({ok:true,id:existing.id,status:existing.status});if(existing)return fail("This song is still being saved",409);}
 const admin=await owner(user),id=uploadId,key="audio/"+id,ck=coverFile?"covers/"+id:null,bytes=audio.size+(coverFile?.size||0),now=Date.now();
 const reserved=await db().prepare("INSERT INTO tracks(id,title,artist,genre,status,uploader,audio_key,cover_key,mime,bytes,created) SELECT ?,?,?,?,'uploading',?,?,?,'audio/mpeg',?,? WHERE (SELECT COALESCE(SUM(bytes),0) FROM tracks)+?<=2000000000 AND (SELECT COUNT(*) FROM tracks)<2000 AND (?=1 OR (SELECT COUNT(*) FROM tracks WHERE uploader=? AND created>?)<5)").bind(id,title,artist,genre,user,key,ck,bytes,now,bytes,admin?1:0,user,now-86400000).run();
 if(!reserved.meta.changes)return fail("Upload limit reached. Listeners can submit 5 tracks a day; the station holds up to 2 GB or 2,000 tracks.",429);
 try{await bucket().put(key,await audio.arrayBuffer(),{httpMetadata:{contentType:"audio/mpeg"}});if(coverFile&&ck)await bucket().put(ck,await coverFile.arrayBuffer(),{httpMetadata:{contentType:coverFile.type}});await db().prepare("UPDATE tracks SET status=? WHERE id=?").bind(admin?"approved":"pending",id).run();}
 catch(e){await bucket().delete([key,...(ck?[ck]:[])]);await db().prepare("DELETE FROM tracks WHERE id=?").bind(id).run();throw e;}
 return Response.json({ok:true,id,status:admin?"approved":"pending"});
});}
