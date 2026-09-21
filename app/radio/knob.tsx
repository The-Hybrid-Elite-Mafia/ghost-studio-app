"use client";
import {useRef} from 'react';
export default function Knob({label,value,min=-9,max=9,step=.5,unit='dB',onChange}:{label:string;value:number;min?:number;max?:number;step?:number;unit?:string;onChange:(v:number)=>void}){
 const drag=useRef<{id:number;y:number;value:number}|null>(null);
 const set=(v:number)=>onChange(Math.max(min,Math.min(max,Math.round(v/step)*step)));
 return <div className="rotary"><span className="rotary-label">{label}</span><div className="rotary-ring" role="slider" tabIndex={0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value} ${unit}`} style={{'--turn':`${-135+(value-min)/(max-min)*270}deg`} as React.CSSProperties}
 onPointerDown={e=>{if(e.button!==0||drag.current)return;e.preventDefault();drag.current={id:e.pointerId,y:e.clientY,value};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.focus({preventScroll:true});}}
 onPointerMove={e=>{if(drag.current?.id===e.pointerId)set(drag.current.value+(drag.current.y-e.clientY)*(max-min)/160);}}
 onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}
 onDoubleClick={()=>set(0)} onKeyDown={e=>{let v=value;switch(e.key){case 'ArrowUp':case 'ArrowRight':v+=step;break;case 'ArrowDown':case 'ArrowLeft':v-=step;break;case 'PageUp':v+=step*4;break;case 'PageDown':v-=step*4;break;case 'Home':v=min;break;case 'End':v=max;break;default:return;}e.preventDefault();set(v);}}><span className="rotary-ticks" aria-hidden="true"/><span className="rotary-cap" aria-hidden="true"><span className="rotary-pointer"><i/></span><span className="rotary-reading"><strong>{value>0?'+':''}{value.toFixed(step<1?1:0)}</strong><small>{unit}</small></span></span></div><output>{value>0?'+':''}{value.toFixed(step<1?1:0)} <small>{unit}</small></output></div>;
}
