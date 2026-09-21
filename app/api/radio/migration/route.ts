import {db,bucket,identity,owner,safe,fail} from "@/lib/radio/station";
export const dynamic="force-dynamic";
// Read-only owner inventory used to verify a station transfer before deletion.
export async function GET(r:Request){return safe(async()=>{
 const user=await identity();if(!await owner(user))return fail("Owner access required",403);
 const url=new URL(r.url),id=url.searchParams.get('id');
 if(id){const t=await db().prepare('SELECT * FROM tracks WHERE id=?').bind(id).first();if(!t)return fail('Track missing',404);
 const audio=await bucket().head(String(t.audio_key)),cover=t.cover_key?await bucket().head(String(t.cover_key)):null;
 return Response.json({track:t,audioBytes:audio?.size??null,coverBytes:cover?.size??null},{headers:{'Cache-Control':'no-store'}});}
 const tracks=await db().prepare('SELECT * FROM tracks ORDER BY id').all();
 const uploads=await db().prepare("SELECT id,state,size FROM uploads WHERE state!='done'").all();
 const genres=await db().prepare('SELECT name FROM genres ORDER BY name').all();
 return Response.json({tracks:tracks.results,uploads:uploads.results,genres:genres.results},{headers:{'Cache-Control':'no-store'}});
});}
