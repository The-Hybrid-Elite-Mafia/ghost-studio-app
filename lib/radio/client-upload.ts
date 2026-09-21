export async function uploadRequest(url:string,options:RequestInit,retry=false):Promise<any>{
 for(let attempt=0;;attempt++){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
 try{const r=await fetch(url,{...options,signal:controller.signal});const text=await r.text();let result:any;try{result=JSON.parse(text);}catch{throw Error(r.status===413?"The upload was rejected as too large. Refresh the app and try again.":"The server could not finish the upload. Please try again.");}
 if(!r.ok){if(retry&&attempt<2&&(r.status>=500||r.status===409)){await new Promise(resolve=>setTimeout(resolve,1500));continue;}throw Error(result.error||"Upload failed. Please try again.");}return result;
 }catch(error){if(retry&&attempt<2&&error instanceof TypeError){await new Promise(resolve=>setTimeout(resolve,1500));continue;}if(error instanceof Error&&error.name==='AbortError')throw Error('The connection timed out. Your completed tracks are safe. Reset the stuck upload and retry.');throw error;}finally{clearTimeout(timer);}
 }
}
export async function sendChunks(payload:Blob,metadata:Record<string,unknown>,onProgress:(n:number)=>void){
 let id='';
 try{
 const session=await uploadRequest('/api/radio/chunks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({size:payload.size,...metadata})});id=session.id;
 for(let start=0,i=0;start<payload.size;start+=session.chunkSize,i++){
 await uploadRequest(`/api/radio/chunks?id=${id}&part=${i}`,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body:payload.slice(start,start+session.chunkSize)},true);
 onProgress(Math.round(Math.min(start+session.chunkSize,payload.size)/payload.size*100));
 }
 for(let step=0;step<200;step++){const result=await uploadRequest(`/api/radio/chunks?id=${id}`,{method:'PATCH'},true);if(!result.pending)return result;}
 throw Error('Saving did not complete. Reset this upload and try again.');
 }finally{if(id){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);try{await fetch(`/api/radio/chunks?id=${id}`,{method:'DELETE',signal:controller.signal}).catch(()=>{});}finally{clearTimeout(timer);}}}
}
