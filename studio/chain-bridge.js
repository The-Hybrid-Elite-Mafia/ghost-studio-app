/* Embedded reference pages share the studio's catalog and accessible dialog. */
(function(root){
 'use strict';
 const api=()=>{try{return root.parent!==root?root.parent.GhostChainUI:root.GhostChainUI;}catch{return null;}};
 const unavailable=()=>{throw Error('Open this reference inside the Creative Studio to use its workflows.');};
 root.GhostChainBridge={
  open(source,key){return (api()||{openSource:unavailable}).openSource(source,key);},
  library(){return (api()||{showLibrary:unavailable}).showLibrary();},
  mount(host){const shared=api();if(!shared){host.textContent='Open this reference inside the Creative Studio to browse the workflow library.';return ()=>{};}return shared.mount(host);},
  button(source,key,label='Workflow & chains'){const b=root.document.createElement('button');b.type='button';b.className='ghost-chain-link';b.textContent=label;b.setAttribute('aria-label',label+' for '+key);b.onclick=event=>{event.preventDefault();event.stopPropagation();root.GhostChainBridge.open(source,key);};return b;}
 };
 root.document.addEventListener('click',event=>{const b=event.composedPath().find(el=>el?.matches?.('[data-chain-source]'));if(b){event.preventDefault();root.GhostChainBridge.open(b.dataset.chainSource,b.dataset.chainKey);}});
})(window);
