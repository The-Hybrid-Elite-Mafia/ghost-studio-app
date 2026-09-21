(function(root){
'use strict';
function endpoint(value,base){
 let url;try{url=new URL(value,base);}catch{throw Error('Enter a valid assistant service URL.');}
 if(url.origin!==new URL(base||root.location.href).origin)throw Error('Open Ghost from its signed-in website to connect.');
 if(url.username||url.password||url.search||url.hash)throw Error('Use a service URL without credentials, query parameters or a fragment.');
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw Error('Use HTTPS, or localhost when running the included server.');
 if(!url.pathname.endsWith('/api/ghost'))throw Error('The Ghost service address must end with /api/ghost.');
 return url;
}
async function inspect(value,{base,fetchImpl=root.fetch}={}){
 const url=endpoint(value,base),health=new URL(url);health.pathname=health.pathname.replace(/\/ghost$/,'/health');
 const response=await fetchImpl(health.href,{method:'GET',cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
 let data;try{data=await response.json();}catch{throw Error('The service did not return a Ghost connection status.');}
 if(!response.ok)throw Error(data?.error||'The Ghost service could not be checked.');
 if(data?.service!=='ghost-daw')throw Error('This address does not identify a compatible Ghost service.');
 if(!data.hosted)throw Error('This is not the online Ghost service.');
 return {endpoint:url.href,status:data};
}
async function request(value,payload,{base,fetchImpl=root.fetch}={}){
 const url=endpoint(value,base),response=await fetchImpl(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(105000)});
 let data;try{data=await response.json();}catch{throw Error('The assistant service returned an unreadable response. No automatic retry was made.');}
 if(!response.ok)throw Object.assign(Error(data?.error||'The assistant service returned HTTP '+response.status+'.'),{budget:data?.budget,diagnostic:data?.diagnostic});
 if(typeof data?.reply!=='string'||!data.reply.trim())throw Error('The assistant service did not return a text reply.');
 return {...data,reply:data.reply.slice(0,18000)};
}
async function writeLyrics(value,spec,{base,fetchImpl=root.fetch,signal}={}){
 const url=endpoint(value,base);url.pathname=url.pathname.replace(/\/ghost$/,'/lyrics');
 const response=await fetchImpl(url.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(spec),redirect:'error',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(160000)]):AbortSignal.timeout(160000)});
 let data;try{data=await response.json();}catch{throw Error('Ghost returned an unreadable song package. No automatic retry was made.');}
 if(!response.ok)throw Object.assign(Error(response.status===404?'Lyrics Creator could not reach the online service. Reopen Ghost’s website.':data?.error||'Ghost could not write the song.'),{budget:data?.budget,diagnostic:data?.diagnostic});
 if(!data?.song||typeof data.reply!=='string'||data.task!=='lyrics')throw Error('The service did not return a complete song package.');
 return data;
}
function errorText(error){
 const detail=error?.diagnostic;
 return (error?.message||'Ghost could not complete the request.')+(detail?'\nConnection detail: '+[detail.stage,detail.code,detail.httpStatus?'HTTP '+detail.httpStatus:''].filter(Boolean).join(' · '):'');
}
function usageText(s){
 if(!s)return 'Connect to see the model and this service’s usage limits.';
 if(s.provider!=='OpenAI')return (s.model||'Local model')+' · no OpenAI API requests';
 const dollars=x=>'$'+(Number.isFinite(x)?x:0).toFixed(4);
 return (s.model||'OpenAI')+' · estimated '+dollars(s.estimatedSpentUsd)+' used of '+dollars(s.monthlyBudgetUsd)+' this month'+(s.reservedUsd?' · '+dollars(s.reservedUsd)+' reserved':'')+' · '+(s.requestsToday||0)+'/'+(s.dailyRequestLimit||0)+' requests today. This is the online app’s estimate, not an account-wide billing limit.';
}
const api={endpoint,inspect,request,writeLyrics,usageText,errorText};root.GhostAI=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
