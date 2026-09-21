/* Original audio files with a bounded decoded cache. No conversion or remote storage. */
(function(root){
'use strict';
const MB=1024*1024,CACHE_LIMIT=96*MB,FILE_LIMIT=160*MB,PROJECT_LIMIT=24*FILE_LIMIT+4*MB;
const decodedBytes=b=>b.length*b.numberOfChannels*4;
class AudioSource {
 constructor(raw,buffer,decode){
  this.raw=raw instanceof Blob?raw:new Blob([raw]);
  this.length=buffer.length;this.sampleRate=buffer.sampleRate;
  this.numberOfChannels=buffer.numberOfChannels;this.duration=buffer.duration;
  this.cached=buffer;this.decode=decode;
 }
 get residentBytes(){return this.cached?decodedBytes(this.cached):0;}
 release(){this.cached=null;}
 async load(sampleRate=this.sampleRate){
  if(this.cached&&sampleRate===this.sampleRate)return this.cached;
  const buffer=await this.decode(this.raw,sampleRate);
  const sameTiming=sampleRate===this.sampleRate?buffer.length===this.length:Math.abs(buffer.duration-this.duration)<=2/Math.min(sampleRate,this.sampleRate);
  if(!sameTiming||buffer.sampleRate!==sampleRate||buffer.numberOfChannels!==this.numberOfChannels)throw Error('The audio source could not be reopened with its original timing. Import the original file again.');
  // Deliberately do not retain a decoded stem after the caller has finished using it.
  return buffer;
 }
 getChannelData(channel){if(!this.cached)throw Error('Load this audio source before reading its samples.');return this.cached.getChannelData(channel);}
}
const isSource=b=>b instanceof AudioSource;
const isDeferred=b=>isSource(b)&&!b.cached;
const residentBytes=b=>isSource(b)?b.residentBytes:decodedBytes(b);
const usedBytes=buffers=>[...new Set(buffers)].reduce((sum,b)=>sum+residentBytes(b),0);
function release(buffers){for(const b of new Set(buffers))if(isSource(b))b.release();}
function trimCache(buffers,limit=CACHE_LIMIT){if(usedBytes(buffers)>limit)release(buffers);}
async function resolve(buffer,sampleRate){return isSource(buffer)?buffer.load(sampleRate):buffer;}
async function open(raw,engine){
 const blob=raw instanceof Blob?raw:new Blob([raw]);
 if(!blob.size)throw Error('This audio file is empty.');
 if(blob.size>FILE_LIMIT)throw Error('This audio file exceeds 160 MB.');
 const buffer=await engine.decode(blob),peaks=root.GhostAudio.peaks(buffer);
 return {raw:blob,buffer:new AudioSource(blob,buffer,(data,rate)=>engine.decode(data,rate)),peaks};
}
async function importBatch(files,{engine,existingCount=()=>0,retainedBuffers=()=>[],accept,onProgress}={}){
 const results=[];
 for(let i=0;i<files.length;i++){
  const file=files[i];onProgress?.(file,i,files.length);
  try{
   if(existingCount()>=24)throw Error('This session already has 24 tracks.');
   const magic=new Uint8Array(await file.slice(0,4).arrayBuffer());
   if(magic[0]===77&&magic[1]===84&&magic[2]===104&&magic[3]===100)throw Error('This is a MIDI note file. Import WAV/MP3 audio here to hear the original recording and vocals.');
   // Leave decoding room for long WAVs; keep short sessions available for live playback.
   if(file.size>16*MB)release(retainedBuffers());
   const data=await open(file,engine);
   trimCache([...retainedBuffers(),data.buffer]);
   await accept(data,file);
   results.push({name:file.name,status:'imported'});
  }catch(error){results.push({name:file.name,status:'failed',reason:error.message||'This file could not be decoded.'});}
 }
 return results;
}
const api={AudioSource,isSource,isDeferred,resolve,residentBytes,usedBytes,release,trimCache,open,importBatch,CACHE_LIMIT,FILE_LIMIT,PROJECT_LIMIT};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GhostSources=api;
})(typeof globalThis!=='undefined'?globalThis:this);
