import {env} from 'cloudflare:workers';
import {createHandler} from '../../../lib/cloud-http.mjs';
import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
const handle=async(request:Request)=>{
 if(!await getChatGPTUser())return Response.json({error:'Sign in with your ChatGPT account to use Ghost.'},{status:401,headers:{'Cache-Control':'no-store'}});
 return createHandler(env)(request);
};
export const GET=handle;
export const POST=handle;
export const DELETE=handle;
