(function(root){
'use strict';
const $=id=>document.getElementById(id),canvas=$('consoleSpectrum');
if(!canvas)return;
const ctx=canvas.getContext('2d'),bins=new Uint8Array(1024),motion=matchMedia('(prefers-reduced-motion: reduce)');
$('consoleTempoButton').onclick=()=>{root.GhostStudio.showView('studio');$('bpmInput').scrollIntoView({block:'center'});$('bpmInput').focus();};
$('consoleFind').onclick=()=>root.GhostDirectory.open();
let last=0,frame=0;
function update(now){
 frame=requestAnimationFrame(update);
 if(document.hidden||$('dashboard').hidden||now-last<(motion.matches?250:80))return;last=now;
 const {engine,state}=root.GhostStudio;
 const set=(id,value)=>{if($(id).textContent!==String(value))$(id).textContent=value;};
 set('consoleTempo',state.bpm);set('consoleTracks',engine.tracks.length);set('consolePlayback',engine.playing?'Playing':'Stopped');set('consoleSession',state.name||'Untitled session');
 const signal=engine.playing&&engine.analyser;
 set('consoleSignal',signal?'Live studio output':'No studio signal');
 if(!ctx)return;
 ctx.clearRect(0,0,480,220);ctx.strokeStyle='#39e5ff20';ctx.lineWidth=1;
 for(let x=0;x<=480;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,220);ctx.stroke();}
 for(let y=0;y<=220;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(480,y);ctx.stroke();}
 if(signal)engine.analyser.getByteFrequencyData(bins);else bins.fill(0);
 const gradient=ctx.createLinearGradient(0,220,0,0);gradient.addColorStop(0,'#2ab4ec');gradient.addColorStop(.65,'#74f7ff');gradient.addColorStop(1,'#d0a8ff');ctx.fillStyle=gradient;ctx.shadowColor='#2befff';ctx.shadowBlur=8;
 for(let i=0;i<40;i++){const index=Math.floor(Math.pow(i/39,2)*(bins.length-1));const height=signal?Math.max(2,bins[index]/255*200):2;ctx.fillRect(i*12+2,216-height,7,height);}ctx.shadowBlur=0;
}
frame=requestAnimationFrame(update);root.addEventListener('pagehide',()=>cancelAnimationFrame(frame));root.addEventListener('pageshow',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);});
})(window);
