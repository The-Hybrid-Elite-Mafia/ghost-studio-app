/* Let the studio document own vertical scrolling, including expanded references. */
(function(root){
 'use strict';
 const doc=root.document,frame=root.frameElement;
 let pending=0,navigationTarget=null,observer=null;
 function measure(){
  pending=0;
  if(!doc.body||frame&&!frame.getClientRects().length)return;
  if(frame){
   // scrollHeight is at least the iframe viewport height and cannot shrink it.
   // A flow-root body gives us the actual content height, including its margins.
   const bodyStyle=root.getComputedStyle(doc.body),frameStyle=root.parent.getComputedStyle(frame);
   const px=value=>parseFloat(value)||0;
   const height=Math.max(1,Math.ceil(doc.body.getBoundingClientRect().height+
    px(bodyStyle.marginTop)+px(bodyStyle.marginBottom)+
    px(frameStyle.borderTopWidth)+px(frameStyle.borderBottomWidth)));
   if(frame.style.height!==height+'px')frame.style.height=height+'px';
   if(root.scrollY)root.scrollTo({top:0,left:0,behavior:'instant'});
  }
  if(navigationTarget){
   const target=doc.getElementById(navigationTarget);navigationTarget=null;
   if(!target)return;
   if(frame){
    root.parent.scrollTo({top:Math.max(0,root.parent.scrollY+
     frame.getBoundingClientRect().top+frame.clientTop+target.getBoundingClientRect().top),behavior:'instant'});
   }else target.scrollIntoView({block:'start',behavior:'instant'});
  }
 }
 function refresh(){if(!pending)pending=root.requestAnimationFrame(measure);}
 function start(){
  if(frame){
   observer=new root.ResizeObserver(refresh);observer.observe(doc.body);
   root.addEventListener('resize',refresh);
   doc.addEventListener('load',refresh,true);
   doc.fonts?.ready.then(refresh);
  }
  refresh();
 }
 root.GhostReferenceLayout={refresh};
 doc.addEventListener('ghost-reference-navigate',event=>{
  navigationTarget=event.detail?.targetId||null;refresh();
 });
 root.addEventListener('pagehide',()=>{observer?.disconnect();root.cancelAnimationFrame(pending);pending=0;});
 root.addEventListener('pageshow',()=>{observer?.observe(doc.body);refresh();});
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(window);
