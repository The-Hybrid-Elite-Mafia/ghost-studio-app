import {isApiOwner} from "../api-owner.mjs";
import { env } from "cloudflare:workers";
import { headers } from "next/headers";
export const defaults=["Country","Hip-Hop","Rock","R&B / Soul","Electronic","Pop","Gospel","Other"];
export function db(){if(!env.DB)throw new Error("Storage unavailable");return env.DB;}
export function bucket(){if(!env.BUCKET)throw new Error("Audio storage unavailable");return env.BUCKET;}
export async function identity(){return (await headers()).get("oai-authenticated-user-id");}
export async function owner(id:string|null){
 if(!id)return false;
 const h=await headers();
 return h.get("oai-authenticated-user-id")===id && isApiOwner({headers:h});
}
export function fail(message:string,status=400){return Response.json({error:message},{status});}
export function sameOrigin(r:Request){const origin=r.headers.get("origin");return !!origin&&origin===new URL(r.url).origin;}
export async function safe(handler:()=>Promise<Response>){try{return await handler();}catch(e){console.error("Station request failed",e);return fail("Something went wrong. Please try again. Your file stays on your phone.",503);}}
