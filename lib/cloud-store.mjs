export const fail=(message,status=503)=>Object.assign(new Error(message),{status});
export const LIMITS=Object.freeze({monthlyNanos:5000000000,daily:100,input:10000,chatOutput:600,lyricOutput:6000});
export const MODEL='gpt-5.6-luna';
const encoder=new TextEncoder();
const bytes64=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
const to64=value=>btoa(String.fromCharCode(...new Uint8Array(value)));
async function encryptionKey(secret){
 if(typeof secret!=='string'||! /^[a-f0-9]{64}$/i.test(secret))throw fail('Secure key storage is unavailable. Please try again later.');
 return crypto.subtle.importKey('raw',Uint8Array.from(secret.match(/../g),x=>parseInt(x,16)),{name:'AES-GCM'},false,['encrypt','decrypt']);
}
export async function seal(key,userId,secret){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('Ghost API key:'+userId)},await encryptionKey(secret),encoder.encode(key));
 return {cipher:to64(cipher),iv:to64(iv)};
}
export async function unseal(record,userId,secret){
 try{return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes64(record.key_iv),additionalData:encoder.encode('Ghost API key:'+userId)},await encryptionKey(secret),bytes64(record.key_cipher)));}
 catch{throw fail('The saved connection could not be opened. Save your key again in Ghost connection.');}
}
export function cloudStore(binding,userId,now=()=>new Date()){
 if(!binding)throw fail('Ghost’s online storage is unavailable. Your audio remains on this device.');
 const db=binding.withSession?binding.withSession('first-primary'):binding;
 const stmt=(sql,...args)=>db.prepare(sql).bind(...args);
 const dates=()=>{const day=now().toISOString().slice(0,10);return {day,month:day.slice(0,7)};};
 async function account(){return stmt('SELECT key_cipher,key_iv,verified_at,blocked FROM ghost_accounts WHERE user_id=?',userId).first();}
 async function status(){
  const {day,month}=dates();const [a,u,d]=await Promise.all([account(),stmt('SELECT spent_nanos,held_nanos FROM ghost_usage WHERE user_id=? AND month=?',userId,month).first(),stmt('SELECT COUNT(*) AS count FROM ghost_requests WHERE user_id=? AND day=?',userId,day).first()]);
  return {service:'ghost-daw',hosted:true,model:MODEL,provider:'OpenAI',aiConfigured:!!a?.key_cipher,apiVerified:!!a?.verified_at,month,estimatedSpentUsd:(u?.spent_nanos||0)/1e9,reservedUsd:(u?.held_nanos||0)/1e9,monthlyBudgetUsd:5,dailyRequestLimit:LIMITS.daily,requestsToday:d?.count||0,blocked:!!a?.blocked,inputTokenLimit:LIMITS.input,outputTokenLimit:LIMITS.chatOutput,lyricsOutputTokenLimit:LIMITS.lyricOutput,pricingChecked:'2026-09-07'};
 }
 async function locked(fn){
  const id=crypto.randomUUID(),ms=now().getTime();
  const row=await stmt('INSERT INTO ghost_locks(user_id,request_id,expires_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET request_id=excluded.request_id,expires_at=excluded.expires_at WHERE ghost_locks.expires_at<? RETURNING request_id',userId,id,ms+10*60*1000,ms).first();
  if(row?.request_id!==id)throw fail('Ghost is already processing your request. Please wait.',429);
  try{return await fn();}finally{await stmt('DELETE FROM ghost_locks WHERE user_id=? AND request_id=?',userId,id).run().catch(()=>{});}
 }
 async function saveKey(value,secret){
  if(typeof value!=='string'||!/^sk-[A-Za-z0-9_-]{20,1020}$/.test(value.trim()))throw fail('Enter your complete OpenAI API key in the private key field.',400);
  return locked(async()=>{const encrypted=await seal(value.trim(),userId,secret);
   await stmt('INSERT INTO ghost_accounts(user_id,key_cipher,key_iv,updated_at,verified_at,blocked) VALUES(?,?,?,?,NULL,0) ON CONFLICT(user_id) DO UPDATE SET key_cipher=excluded.key_cipher,key_iv=excluded.key_iv,updated_at=excluded.updated_at,verified_at=NULL',userId,encrypted.cipher,encrypted.iv,now().getTime()).run();
   return status();});
 }
 async function removeKey(){return locked(async()=>{await stmt('UPDATE ghost_accounts SET key_cipher=NULL,key_iv=NULL,verified_at=NULL,updated_at=? WHERE user_id=?',now().getTime(),userId).run();return status();});}
 async function reserve(amount){
  const {month,day}=dates(),id=crypto.randomUUID();
  const results=await db.batch([
   stmt('INSERT OR IGNORE INTO ghost_usage(user_id,month,spent_nanos,held_nanos) VALUES(?,?,0,0)',userId,month),
   stmt("INSERT INTO ghost_requests(id,user_id,month,day,reserved_nanos,status,created_at) SELECT ?,?,?,?,?, 'reserved',? WHERE EXISTS(SELECT 1 FROM ghost_accounts WHERE user_id=? AND blocked=0 AND key_cipher IS NOT NULL) AND (SELECT spent_nanos+held_nanos FROM ghost_usage WHERE user_id=? AND month=?)+?<=? AND (SELECT COUNT(*) FROM ghost_requests WHERE user_id=? AND day=?)<?",id,userId,month,day,amount,now().getTime(),userId,userId,month,amount,LIMITS.monthlyNanos,userId,day,LIMITS.daily),
   stmt("UPDATE ghost_usage SET held_nanos=held_nanos+? WHERE user_id=? AND month=? AND EXISTS(SELECT 1 FROM ghost_requests WHERE id=? AND status='reserved')",amount,userId,month,id),
  ]);
  if(results[1].meta.changes!==1)throw fail('This request would exceed your online Ghost budget or daily limit. Check Ghost connection for usage.',429);
  return {id,month,amount};
 }
 async function settle(reservation,cost){
  if(!Number.isSafeInteger(cost)||cost<0||cost>reservation.amount)throw fail('The returned usage could not be safely recorded.');
  const {id,month,amount}=reservation;
  const result=await db.batch([
   stmt("UPDATE ghost_usage SET held_nanos=held_nanos-?,spent_nanos=spent_nanos+? WHERE user_id=? AND month=? AND held_nanos>=? AND EXISTS(SELECT 1 FROM ghost_requests WHERE id=? AND user_id=? AND status='reserved')",amount,cost,userId,month,amount,id,userId),
   stmt("UPDATE ghost_requests SET status='complete',actual_nanos=? WHERE id=? AND user_id=? AND status='reserved'",cost,id,userId),
  ]);
  if(result[0].meta.changes!==1||result[1].meta.changes!==1)throw fail('Usage could not be reconciled. Please check Ghost connection.');
 }
 async function block(){await stmt('UPDATE ghost_accounts SET blocked=1 WHERE user_id=?',userId).run();}
 async function verified(){await stmt('UPDATE ghost_accounts SET verified_at=? WHERE user_id=?',now().getTime(),userId).run();}
 return {account,status,locked,saveKey,removeKey,reserve,settle,block,verified};
}
