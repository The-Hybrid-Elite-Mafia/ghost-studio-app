/* Artwork-only companions. These controls do not change audio or prompt settings. */
(function(){
 'use strict';
 const genres=['Rock','Country','Hip-Hop','R&B / Soul','Jazz','Blues','Electronic','Metal','Pop','Reggae','Classical','Latin','World','Folk / Americana','Gospel','Studio'];
 const tools=['electric guitar','banjo','sampler','microphone','saxophone','harmonica','DJ deck','electric guitar','microphone','bass','violin','congas','bagpipes','acoustic guitar','microphone','mixing desk'];
 const aliases=[/rock|punk|new wave|indie/i,/country/i,/hip.?hop|rap|trap/i,/r&b|soul|funk/i,/jazz|swing/i,/blues/i,/electronic|edm|house|techno|dance|ambient/i,/metal/i,/pop/i,/reggae|ska|dub/i,/classical|orchestra|opera/i,/latin|salsa|bachata/i,/world|celtic|afro/i,/folk|americana|singer.songwriter/i,/gospel/i];
 function matchGenre(text){for(const i of [7,3,2,1,4,5,6,9,10,11,12,13,14,0,8])if(aliases[i].test(text))return i;return null;}
 function mount(host,initial,placement){
  const bar=document.createElement('section');bar.className='ghost-genie-bar';bar.setAttribute('aria-label','Genre genie');
  const art=document.createElement('span');art.className='ghost-genie-art';art.setAttribute('role','img');
  const copy=document.createElement('div');copy.className='ghost-genie-copy';const title=document.createElement('strong'),description=document.createElement('span');description.textContent='Ghost in the Machine';copy.append(title,description);
  const label=document.createElement('label');label.className='ghost-genie-choice';label.append(document.createTextNode('Genie character'));const select=document.createElement('select');genres.forEach((name,i)=>select.add(new Option(name,String(i))));label.append(select);
  const motion=document.createElement('button');motion.type='button';motion.className='ghost-genie-motion';let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;function setMotion(){bar.dataset.paused=String(paused);motion.textContent=paused?'Resume motion':'Pause motion';motion.setAttribute('aria-pressed',String(paused));}motion.onclick=()=>{paused=!paused;setMotion();};setMotion();
  function set(i){select.value=String(i);title.textContent=genres[i]+' Genie';art.style.backgroundPosition=(i%4)*100/3+'% '+Math.floor(i/4)*100/3+'%';art.setAttribute('aria-label',genres[i]+' genie with '+tools[i]);}
  select.onchange=()=>set(Number(select.value));bar.append(art,copy,label,motion);set(initial);
  if(placement==='after')host.after(bar);else host.prepend(bar);
  return {bar,set};
 }
 function boot(){
  if(document.documentElement.classList.contains('ghost-reference-page')){
   const companion=mount(document.body,15,'prepend');
   document.addEventListener('click',event=>{const target=event.target.closest('button,[role=tab],a');if(!target||companion.bar.contains(target))return;const text=target.textContent.trim();if(text.length>70)return;const index=matchGenre(text);if(index!==null)companion.set(index);});
   document.addEventListener('change',event=>{if(event.target.tagName!=='SELECT'||companion.bar.contains(event.target))return;const index=matchGenre(event.target.selectedOptions[0]?.textContent||'');if(index!==null)companion.set(index);});
  }else{
   for(const [selector,initial] of [['#forge .section-toolbar',15],['#lyricsPage .page-heading',13]]){const host=document.querySelector(selector);if(host)mount(host,initial,'after');}
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
