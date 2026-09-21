(function(root){
'use strict';
async function call(method,payload,{fetchImpl=root.fetch,base=root.location?.href}={}){
 const url=new URL('/api/connection',base);
 const response=await fetchImpl(url.href,{method,credentials:'same-origin',cache:'no-store',redirect:'error',headers:{'Content-Type':'application/json'},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(20000)});
 let data;try{data=await response.json();}catch{throw Error('Ghost could not read the connection response. Reopen the website and sign in.');}
 if(!response.ok)throw Error(data?.error||'The connection could not be saved.');
 return data.status;
}
const api={save:(key,options)=>call('POST',{apiKey:key},options),remove:options=>call('DELETE',null,options)};
root.GhostCloud=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
