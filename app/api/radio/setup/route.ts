import {db,identity,owner,sameOrigin,safe,fail} from "@/lib/radio/station";
export async function POST(r:Request){return safe(async()=>{
 if(!sameOrigin(r))return fail("Request not allowed",403);
 const user=await identity();if(!user)return fail("Sign in first",401);
 if(!await owner(user))return fail("Only the studio owner can set up the station",403);
 await db().prepare("INSERT OR IGNORE INTO station(id,owner) VALUES(1,?)").bind(user).run();
 const s=await db().prepare("SELECT owner FROM station WHERE id=1").first();
 return s?.owner===user?Response.json({ok:true}):fail("This station already has an owner",403);
});}
