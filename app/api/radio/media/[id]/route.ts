import {db,bucket,identity,owner,safe,fail} from "@/lib/radio/station";
export const dynamic="force-dynamic";
export async function GET(r:Request,{params}:{params:Promise<{id:string}>}){return safe(async()=>{
 const {id}=await params;const t=await db().prepare("SELECT * FROM tracks WHERE id=?").bind(id).first();if(!t||t.status==='uploading')return fail("Track unavailable",404);
 if(t.status!=="approved"&&!await owner(await identity()))return fail("Track is not published",403);
 const isCover=new URL(r.url).searchParams.get("cover")==="1",key=isCover?t.cover_key:t.audio_key;if(!key)return fail("No cover",404);
 const meta=await bucket().head(String(key));if(!meta)return fail("File unavailable",404);
 const h=new Headers({"Content-Type":meta.httpMetadata?.contentType||"audio/mpeg","Accept-Ranges":"bytes","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"});
 const range=r.headers.get("range");let start=0,end=meta.size-1,status=200;
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2])){h.set("Content-Range",`bytes */${meta.size}`);return new Response(null,{status:416,headers:h});}if(!m[1])start=Math.max(0,meta.size-Number(m[2]));else {start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}if(start>end||start>=meta.size){h.set("Content-Range",`bytes */${meta.size}`);return new Response(null,{status:416,headers:h});}status=206;h.set("Content-Range",`bytes ${start}-${end}/${meta.size}`);}
 const object=await bucket().get(String(key),{range:{offset:start,length:end-start+1}});if(!object)return fail("File unavailable",404);h.set("Content-Length",String(end-start+1));return new Response(object.body,{status,headers:h});
});}
