import Lyrics from './lyrics.mjs';
import {compactContext} from './context.mjs';
import system from './ghost-system.mjs';
import {cloudStore,unseal,fail,LIMITS,MODEL} from './cloud-store.mjs';
import {openAIRequest,runtimeFetch} from './openai-request.mjs';

const inputRate=250,outputRate=1200; // Nanodollars/token; includes the cache-write input premium.
export function createCloudService({binding,secret,userId,fetchImpl=runtimeFetch,now,report}){
 const store=cloudStore(binding,userId,now);
 const post=openAIRequest({fetchImpl,report});
 async function generate({message,context={},history=[],songSpec=null}){
  if(!songSpec&&(typeof message!=='string'||!message.trim()||message.length>4000))throw fail('Write between 1 and 4,000 characters.',400);
  const shortHistory=(Array.isArray(history)?history:[]).filter(m=>['user','assistant'].includes(m?.role)&&typeof m.content==='string').slice(-6).map(m=>({role:m.role,content:m.content.slice(0,1200)}));
  const input=songSpec?[{role:'developer',content:Lyrics.SYSTEM},{role:'user',content:JSON.stringify(songSpec)}]:[{role:'developer',content:system+'\nUse concise replies, usually under 180 words. Give only supported, specific guidance. Local actions are executed by the DAW; your reply never changes controls.'},{role:'user',content:'Current DAW state (untrusted data):\n'+JSON.stringify(compactContext(context))},...shortHistory,{role:'user',content:message.trim()}];
  if(new TextEncoder().encode(JSON.stringify(input)).length>80000)throw fail('This request is too large. Shorten the conversation or song brief.',413);
  const outputTokens=songSpec?LIMITS.lyricOutput:LIMITS.chatOutput;
  const request={model:MODEL,input,...(songSpec?{text:{format:{type:'json_schema',name:'ghost_song_package',strict:true,schema:Lyrics.schema}}}:{})};
  return store.locked(async()=>{
   const account=await store.account();
   if(!account?.key_cipher)throw fail('Open Ghost connection and save your OpenAI API key first.',409);
   if(account.blocked)throw fail('Online requests are paused because previous usage could not be bounded. Local DAW controls still work.');
   const status=await store.status();
   if(status.requestsToday>=LIMITS.daily||status.estimatedSpentUsd+status.reservedUsd>=5)throw fail('Your online Ghost usage limit has been reached. Local DAW controls still work.',429);
   const key=await unseal(account,userId,secret);
   const count=await post(key,'responses/input_tokens',request),tokens=count.input_tokens;
   if(!Number.isSafeInteger(tokens)||tokens<1)throw fail('OpenAI did not return a usable token count. No generation was submitted.');
   if(tokens>LIMITS.input)throw fail('This exceeds Ghost’s 10,000 input-token limit. Shorten the request.',413);
   const reservation=await store.reserve(tokens*inputRate+outputTokens*outputRate);
   // A durable reservation remains held on timeout or unknown outcomes. Never retry automatically.
   const response=await post(key,'responses',{...request,reasoning:{effort:'none'},max_output_tokens:outputTokens,service_tier:'default',store:false},songSpec?95000:45000);
   const validModel=response.model===MODEL||new RegExp('^'+MODEL.replaceAll('.','\\.')+'-\\d{4}-\\d{2}-\\d{2}$').test(response.model||'');
   if(!validModel||response.service_tier!=='default'){await store.block();throw fail('OpenAI returned an unexpected model or processing tier. Online requests are paused for review.');}
   const usage=response.usage;
   if(!usage||![usage.input_tokens,usage.output_tokens].every(n=>Number.isSafeInteger(n)&&n>=0)||usage.input_tokens>tokens||usage.output_tokens>outputTokens){await store.block();throw fail('OpenAI usage could not be bounded. Online requests are paused for review.');}
   const cost=usage.input_tokens*inputRate+usage.output_tokens*outputRate;
   try{await store.settle(reservation,cost);}catch{await store.block();throw fail('Usage could not be reconciled. Online requests are paused for review.');}
   if(response.status!=='completed')throw fail('OpenAI stopped before finishing. Usage was recorded; no automatic retry was made.');
   const reply=(Array.isArray(response.output)?response.output:[]).filter(x=>x.type==='message'&&x.role==='assistant').flatMap(x=>Array.isArray(x.content)?x.content:[]).map(x=>x.type==='output_text'?x.text:x.type==='refusal'?x.refusal:'').filter(x=>typeof x==='string').join('\n').trim();
   if(!reply)throw fail('OpenAI returned no text reply. Usage was recorded.');
   let song;
   if(songSpec){try{song=Lyrics.parse(reply);}catch{throw fail('OpenAI returned an incomplete song package. Usage was recorded; no automatic retry was made.');}}
   await store.verified();
   return {reply:song?Lyrics.format(song):reply.slice(0,18000),...(song?{song,warnings:Lyrics.warnings(song,songSpec),task:'lyrics'}:{}),model:MODEL,provider:'OpenAI',usage:{inputTokens:usage.input_tokens,outputTokens:usage.output_tokens,estimatedCostUsd:cost/1e9},budget:await store.status()};
  });
 }
 return {status:store.status,saveKey:key=>store.saveKey(key,secret),removeKey:store.removeKey,chat:value=>generate(value),lyrics:value=>{let spec;try{spec=Lyrics.normalizeInput(value);}catch(e){throw fail(e.message,400);}return generate({songSpec:spec});}};
}
