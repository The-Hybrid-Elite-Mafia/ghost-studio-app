"use client";
import {useEffect,useRef,type RefObject} from 'react';
export default function Spectrum({analyser,playing,visible}:{analyser:RefObject<AnalyserNode|null>;playing:boolean;visible:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
 const el=canvas.current;if(!el)return;const context=el.getContext('2d');if(!context)return;
 let frame=0,last=0;let data=new Uint8Array(256);const deck=el.closest<HTMLElement>('.deck');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const draw=(now:number)=>{
 frame=requestAnimationFrame(draw);if(now-last<40||document.hidden||!visible)return;last=now;
 const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;const ratio=Math.min(devicePixelRatio||1,2);
 if(el.width!==Math.round(w*ratio)||el.height!==Math.round(h*ratio)){el.width=Math.round(w*ratio);el.height=Math.round(h*ratio);}
 context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,w,h);
 context.strokeStyle='#1bcddd20';context.lineWidth=1;
 for(let y=20;y<h;y+=25){context.beginPath();context.moveTo(0,y);context.lineTo(w,y);context.stroke();}
 const node=analyser.current;if(node&&data.length!==node.frequencyBinCount)data=new Uint8Array(node.frequencyBinCount);data.fill(0);if(node&&playing&&!reduced.matches)node.getByteFrequencyData(data);
 const energy=data.reduce((sum,value)=>sum+value,0)/(data.length*255);deck?.style.setProperty('--audio-energy',String(Math.min(1,energy*2)));
 const count=32,gap=4,bar=(w-gap*(count-1))/count,mid=h*.65;
 for(let i=0;i<count;i++){
 const index=Math.min(data.length-1,Math.floor(Math.pow(i/(count-1),2)*(data.length-1)));
 const height=Math.max(2,data[index]/255*(h*.55));const x=i*(bar+gap);
 const gradient=context.createLinearGradient(0,mid-height,0,mid);gradient.addColorStop(0,i%7===0?'#ffe299':'#9dffff');gradient.addColorStop(.3,'#34d9f4');gradient.addColorStop(1,'#5750af');context.fillStyle=gradient;context.fillRect(x,mid-height,bar,height);
 context.fillStyle='#b5faff';context.beginPath();context.moveTo(x,mid-height);context.lineTo(x+3,mid-height-3);context.lineTo(x+bar+3,mid-height-3);context.lineTo(x+bar,mid-height);context.fill();
 context.fillStyle='#416792';context.beginPath();context.moveTo(x+bar,mid-height);context.lineTo(x+bar+3,mid-height-3);context.lineTo(x+bar+3,mid-3);context.lineTo(x+bar,mid);context.fill();
 context.globalAlpha=.17;context.fillRect(x,mid+4,bar,height*.42);context.globalAlpha=1;
 }
 };frame=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(frame);deck?.style.removeProperty('--audio-energy');};
 },[playing,visible,analyser]);
 return <div className="spectrum-panel"><div className="spectrum-label"><span>AUDIO SPECTRUM</span><span>{playing?'PLAYING':'STANDBY'}</span></div><canvas ref={canvas} aria-label="Frequency bars responding to the currently playing music" role="img"/><div className="spectrum-scale"><span>60 Hz</span><span>250 Hz</span><span>1 kHz</span><span>4 kHz</span><span>12 kHz</span></div></div>;
}
