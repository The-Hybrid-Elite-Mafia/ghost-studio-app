import { db, identity, owner, defaults, safe } from "@/lib/radio/station";
export const dynamic="force-dynamic";
export async function GET(){return safe(async()=>{
 const user=await identity();
 const isOwner=await owner(user);
 const setup=!!await db().prepare("SELECT id FROM station WHERE id=1").first();
 const genres=await db().prepare("SELECT name FROM genres ORDER BY name").all();
 const tracks=await db().prepare(isOwner?"SELECT id,title,artist,genre,status,mime,cover_key,created,bytes FROM tracks WHERE status!='uploading' ORDER BY created DESC":"SELECT id,title,artist,genre,status,mime,cover_key,created,bytes FROM tracks WHERE status='approved' ORDER BY created DESC").all();
 const mine=user&&!isOwner?await db().prepare("SELECT id,title,artist,genre,status,created FROM tracks WHERE uploader=? AND status!='approved' ORDER BY created DESC").bind(user).all():{results:[]};
 return Response.json({signedIn:!!user,isOwner,setup,genres:[...new Set([...defaults,...genres.results.map((g:any)=>g.name)])],tracks:tracks.results,mine:mine.results},{headers:{"Cache-Control":"no-store"}});
});}
