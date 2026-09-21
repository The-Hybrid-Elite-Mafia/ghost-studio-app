import {fail} from './cloud-store.mjs';

const API='https://api.openai.com/v1/';
// Keep the native receiver when the Worker runtime supplies fetch as a method.
export const runtimeFetch=(...args)=>globalThis.fetch(...args);
const knownCodes=new Set(['ENOTFOUND','EAI_AGAIN','ECONNRESET','ECONNREFUSED','ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','CERT_HAS_EXPIRED','ERR_TLS_CERT_ALTNAME_INVALID']);
function safeFailure(error,key){
 const name=['TypeError','Error','AbortError','TimeoutError','RangeError'].includes(error?.name)?error.name:'Error';
 const value=typeof error?.message==='string'?error.message:'Unknown transport failure';
 const message=value.replaceAll(key,'[redacted]').replace(/Bearer\s+[^\s"']+/gi,'Bearer [redacted]').replace(/sk-[A-Za-z0-9_-]+/g,'[redacted]').replace(/[\r\n\t]/g,' ').slice(0,400);
 const candidate=error?.cause?.code||error?.code;
 return {name,message,...(knownCodes.has(candidate)?{cause:candidate}:{})};
}
export function openAIRequest({fetchImpl=runtimeFetch,report=event=>console.error(JSON.stringify(event))}={}){
 return async function post(key,route,payload,timeout=45000){
  if(!['responses/input_tokens','responses'].includes(route))throw fail('Unknown OpenAI request route.',500);
  const stage=route==='responses/input_tokens'?'token-count':'generation',controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout),started=Date.now();
  let upstreamStatus=null;
  try{
   let response;
   try{
    response=await fetchImpl(API+route,{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   }catch(error){
    const detail=safeFailure(error,key),code=controller.signal.aborted?'timeout':/illegal invocation|incorrect.*this|not a function|not implemented|unsupported/i.test(detail.message)?'runtime-error':detail.cause?'transport-'+detail.cause.toLowerCase():'transport-error';
    report({event:'ghost_openai_failure',stage,code,elapsedMs:Date.now()-started,...detail});
    const message=code==='timeout'?'Ghost’s server timed out waiting for OpenAI.':code==='runtime-error'?'Ghost’s server could not start its OpenAI request.':'Ghost’s server connection failed before OpenAI replied.';
    throw Object.assign(fail(message+' Your saved key has not been marked invalid. No automatic retry was made.'),{diagnostic:{stage,code}});
   }
   upstreamStatus=response.status;
   // Never forward the secret to a redirected host, or hide redirects as timeouts.
   if(response.status>=300&&response.status<400){
    await response.body?.cancel();report({event:'ghost_openai_failure',stage,code:'redirect-refused',httpStatus:response.status});
    throw Object.assign(fail('OpenAI returned a redirect. Ghost stopped without forwarding your key. No automatic retry was made.'),{diagnostic:{stage,code:'redirect-refused',httpStatus:response.status}});
   }
   let data;
   try{
    if(!response.body)throw Error('Empty response');
    const reader=response.body.getReader(),decoder=new TextDecoder();let raw='',size=0;
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1048576){await reader.cancel();throw Error('Response too large');}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();data=JSON.parse(raw);
   }catch{
    report({event:'ghost_openai_failure',stage,code:controller.signal.aborted?'body-timeout':'unreadable-response',httpStatus:upstreamStatus});
    if(response.ok)throw Object.assign(fail(controller.signal.aborted?'OpenAI’s response timed out while being read. No automatic retry was made.':'OpenAI returned an unreadable response. No automatic retry was made.'),{diagnostic:{stage,code:controller.signal.aborted?'body-timeout':'unreadable-response',httpStatus:upstreamStatus}});
    // Keep a real HTTP authentication/quota error distinct from unreadable HTML.
   }
   if(!response.ok){
    const quota=data?.error?.code==='insufficient_quota';
    const code=quota?'insufficient-quota':response.status===401?'invalid-key':response.status===403?'access-denied':response.status===429?'rate-limit':response.status===404?'endpoint-unavailable':'upstream-http-error';
    report({event:'ghost_openai_failure',stage,code,httpStatus:response.status});
    throw Object.assign(fail(quota?'OpenAI API credit is unavailable. Check billing in your OpenAI Platform account.':response.status===401?'OpenAI did not accept the saved key. Check it in Ghost connection.':response.status===403?'OpenAI denied this request. Check the project’s model and key permissions.':response.status===429?'OpenAI rate limit reached. Wait before sending again.':response.status===404?'GPT-5.6 Luna or its required endpoint is unavailable to your project.':'OpenAI returned HTTP '+response.status+'. No automatic retry was made.',response.status===429?429:503),{diagnostic:{stage,code,httpStatus:response.status}});
   }
   return data;
  }finally{clearTimeout(timer);}
 };
}
