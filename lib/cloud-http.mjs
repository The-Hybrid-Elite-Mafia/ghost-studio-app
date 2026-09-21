import {createCloudService} from './cloud-service.mjs';
import {fail} from './cloud-store.mjs';
import {isApiOwner} from './api-owner.mjs';
import {runtimeFetch} from './openai-request.mjs';

const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
export function createHandler(environment,{fetchImpl=runtimeFetch,now,report}={}){
 return async function handle(request){
  let service;
  try{
   const uid=request.headers.get('oai-authenticated-user-id');
   if(!uid||!request.headers.get('oai-authenticated-user-email'))return json({error:'Sign in with your ChatGPT account to use Ghost.'},401);
   const url=new URL(request.url),path=url.pathname;
   if(!['/api/health','/api/connection','/api/ghost','/api/lyrics'].includes(path))return json({error:'Unknown Ghost endpoint.'},404);
   const allowed=path==='/api/health'?['GET']:path==='/api/connection'?['POST','DELETE']:['POST'];
   if(!allowed.includes(request.method))return json({error:'Method not allowed.'},405);
   if(request.method!=='GET'){
    if(request.headers.get('origin')!==url.origin)throw fail('Open Ghost from its signed-in website to make changes.',403);
    if(request.method==='POST'&&request.headers.get('content-type')?.split(';')[0].trim()!=='application/json')throw fail('Send a JSON request.',415);
   }
   if(!isApiOwner(request)){
    if(path==='/api/health')return json({service:'ghost-daw',hosted:true,canUseApi:false,ownerOnly:true,aiConfigured:false,apiVerified:false,setupAvailable:false});
    return json({error:'Only the studio owner can activate or use the API. Local studio tools remain available.',code:'owner_only'},403);
   }
   service=createCloudService({binding:environment.DB,secret:environment.GHOST_SECRET_KEY,userId:uid,fetchImpl,now,report});
   if(path==='/api/health')return json({...await service.status(),canUseApi:true,ownerOnly:true,connectionRevision:'owner-only-1',setupAvailable:/^[a-f0-9]{64}$/i.test(environment.GHOST_SECRET_KEY||'')});
   if(request.method==='DELETE')return json({status:await service.removeKey()});
   const maximum=path==='/api/connection'?2048:80000;
   if(Number(request.headers.get('content-length'))>maximum)throw fail('The request is too large.',413);
   let raw='',size=0;const reader=request.body?.getReader(),decoder=new TextDecoder();
   if(!reader)throw fail('The request is empty.',400);
   for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw fail('The request is too large.',413);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();
   let body;try{body=JSON.parse(raw);}catch{throw fail('The request is not valid JSON.',400);}
   if(!body||typeof body!=='object'||Array.isArray(body))throw fail('The request must be a JSON object.',400);
   if(path==='/api/connection')return json({status:await service.saveKey(body.apiKey)});
   return json(await (path==='/api/lyrics'?service.lyrics(body):service.chat(body)));
  }catch(e){
   const status=Number.isInteger(e?.status)&&e.status>=400&&e.status<=599?e.status:503;
   const budget=service?await service.status().catch(()=>null):null;
   return json({error:e?.status?e.message:'Ghost’s online connection is temporarily unavailable. Your audio remains on this device.',...(e?.diagnostic?{diagnostic:e.diagnostic}:{}),...(budget?{budget}:{})},status);
  }
 };
}
