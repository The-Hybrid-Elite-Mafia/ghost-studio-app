/* Local navigation only. Opening a result never generates, inserts or processes audio. */
(function(root){
'use strict';
const categories=['Home & Radio','Create','Record & Mix','Plugins & Cleanup','Sound Library','Projects & Help'];
const norm=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function category(entry){
 if(/repair|mastering|processor|effects|production preset/i.test(entry.kind))return 'Plugins & Cleanup';
 if(/microphone|interface|equipment|engineer/i.test(entry.kind))return 'Record & Mix';
 if(entry.kind==='General workflow')return /vocal|record|mix/i.test(entry.family+' '+entry.label)?'Record & Mix':'Create';
 return 'Sound Library';
}
const feature=(id,label,group,description,view,target,click)=>({id:'tool-'+id,label,group,description,kind:'Studio tool',view,target,click});
const features=[
 feature('radio','Radio & equalizer',categories[0],'Station player, music library, uploads and radio EQ','dashboard','dashboardRadio'),
 feature('home','Dashboard',categories[0],'Current session and lyrics workspace','dashboard'),
 feature('lyrics','Lyrics Creator',categories[1],'Write, rewrite, edit, copy and download song packages','lyrics','lyricsForm'),
 feature('blueprints','Song blueprints',categories[1],'Production structure and song framework','lyrics','lyricsBlueprintSections'),
 feature('prompts','Prompt Encyclopedia',categories[1],'Suno prompts, production techniques and reference material','encyclopedia'),
 feature('arrangement','Arrangement & stems',categories[2],'Track timing, trimming, split and audio editing','studio','arrangement'),
 feature('mixer','Mixer & master bus',categories[2],'Faders, pan, inserts and master processing','studio','mixer'),
 feature('midi','MIDI & piano roll',categories[2],'Compose notes, choose instruments and quantize','studio','composer','openComposerBtn'),
 feature('record','Recording controls',categories[2],'Audio input, MIDI recording, tempo and metronome','studio','recordKind'),
 feature('automation','Automation & MIDI learn',categories[2],'Recorded control movements and MIDI mappings','forge','automationFocus'),
 feature('plugins','Plugin workshop',categories[3],'Build chains, browse processors and manage saved custom plugins','forge','forge'),
 feature('cleanup','Stem Cleanup',categories[3],'Find the built-in noise and click repair processor','forge','catalogSearch'),
 feature('library','Music Library',categories[4],'Genres, subgenres, vocal profiles, beats and instruments','hem-atm'),
 feature('projects','Projects & backups',categories[5],'Save, open or download a portable session','studio',null,'projectBtn'),
 feature('export','Export audio & MIDI',categories[5],'WAV mix, aligned stem ZIP and MIDI export options','studio',null,'exportBtn'),
 feature('settings','Ghost connection settings',categories[5],'Owner connection settings and access information','studio',null,'aiSettingsBtn'),
 {id:'rack',label:'3D Ghost Rack',group:categories[2],kind:'Studio tool',description:'Single-track Dynamics A console, rack presets and audio preview',href:'/rack'},
 {id:'prompt-forge',label:'Plugin Prompt Forge',group:categories[3],kind:'Reference library',description:'Plugin instructions, preset prompts and chain recipes',href:'/plugin-prompts.html'},
 {id:'manual',label:'Illustrated studio manual',group:categories[5],kind:'Help',description:'Labeled diagrams, instructions and every processor control',href:'/manual'},
];
function buildEntries(data,packs){return [...features,...Object.values(packs||{}).map(p=>({id:'processor-'+p.type,label:p.name,group:categories[3],kind:'Built-in processor',description:p.description,view:'forge',target:'catalogSearch',plugin:p.name})),...(data?.entries||[]).map(e=>({id:'workflow-'+e.id,label:e.label,group:category(e),kind:e.kind,description:e.family+' · '+e.brief,workflow:e.id,keywords:[...(e.aliases||[]),...(e.context||[]).flat()].join(' ')}))].map(e=>({...e,search:norm(e.label+' '+e.kind+' '+e.group+' '+e.description+' '+(e.keywords||''))}));}
function filter(entries,query='',group='',favorites=null){const words=norm(query).split(' ').filter(Boolean);return entries.filter(e=>(!group||e.group===group)&&(!favorites||favorites.has(e.id))&&words.every(w=>e.search.includes(w)));}
root.GhostDirectoryCore={categories,buildEntries,filter};
if(!root.document)return;
const doc=root.document,el=(tag,text,cls)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const entries=buildEntries(root.GhostChainData,root.GhostPacks.definitions);
let favorites=new Set(),group='',onlyFavorites=false,page=0,returnFocus;
try{const saved=JSON.parse(localStorage.getItem('ghost-directory-favorites-v1')||'[]');if(Array.isArray(saved))favorites=new Set(saved.filter(x=>typeof x==='string'));}catch{}
const dialog=el('dialog',undefined,'hem-directory');dialog.setAttribute('aria-labelledby','directoryTitle');
const head=el('header'),heading=el('div'),title=el('h2','Find anything');title.id='directoryTitle';heading.append(el('span','HYBRID ELITE MAFIA','eyebrow'),title);
const close=el('button','Close');close.type='button';close.onclick=()=>dialog.close();head.append(heading,close);
const controls=el('div',undefined,'directory-controls'),label=el('label','Search tools, genres, vocals and instruments');
const search=el('input');search.type='search';search.id='directorySearch';search.placeholder='Try banjo, de-esser, trap, export…';label.htmlFor=search.id;
const select=el('select');select.setAttribute('aria-label','Category');select.append(new Option('All categories',''));categories.forEach(c=>select.append(new Option(c,c)));
const fav=el('button','Favorites');fav.type='button';fav.setAttribute('aria-pressed','false');
const clear=el('button','Clear filters');clear.type='button';
controls.append(label,search,select,fav,clear);
const status=el('p',undefined,'directory-status');status.setAttribute('role','status');
const results=el('div',undefined,'directory-results');
const pages=el('div',undefined,'directory-pagination'),prev=el('button','Previous'),next=el('button','Next'),position=el('span');prev.type=next.type='button';pages.append(prev,position,next);
dialog.append(head,controls,status,results,pages);doc.body.append(dialog);
function reveal(entry){
 dialog.close();
 if(entry.workflow){root.GhostChainUI.open(entry.workflow);return;}
 if(entry.href){root.open(entry.href,'_blank','noopener');return;}
 root.GhostStudio.showView(entry.view);
 if(entry.click)doc.getElementById(entry.click)?.click();
 if(entry.plugin||entry.id==='tool-cleanup'){
  const input=doc.getElementById('catalogSearch'),filter=doc.getElementById('catalogFilter');filter.value='All';filter.dispatchEvent(new Event('change'));input.value=entry.plugin||'Stem Cleanup';input.dispatchEvent(new Event('input'));
 }
 requestAnimationFrame(()=>{const target=doc.getElementById(entry.target);if(!target)return;for(let n=target.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;target.scrollIntoView({block:'center',behavior:'instant'});if(!target.hasAttribute('tabindex')&&!/INPUT|BUTTON|SELECT|TEXTAREA/.test(target.tagName))target.tabIndex=-1;target.focus({preventScroll:true});});
}
function render(){
 const matches=filter(entries,search.value,group,onlyFavorites?favorites:null),count=Math.max(1,Math.ceil(matches.length/24));page=Math.min(page,count-1);
 status.textContent=matches.length.toLocaleString()+' results'+(group?' in '+group:'')+(onlyFavorites?' · favorites':'');results.replaceChildren();
 if(!matches.length)results.append(el('p',onlyFavorites?'No matching favorites. Save items with the star button.':'No matches. Try a shorter term or clear the filters.','directory-empty'));
 for(const item of matches.slice(page*24,page*24+24)){
  const card=el('article',undefined,'directory-card'),open=el('button',undefined,'directory-open');open.type='button';open.append(el('small',item.group+' / '+item.kind),el('strong',item.label),el('span',item.description));open.onclick=()=>reveal(item);
  const star=el('button',favorites.has(item.id)?'★':'☆','directory-star');star.type='button';star.setAttribute('aria-label','Favorite '+item.label);star.setAttribute('aria-pressed',String(favorites.has(item.id)));star.onclick=()=>{favorites.has(item.id)?favorites.delete(item.id):favorites.add(item.id);let saved=true;try{localStorage.setItem('ghost-directory-favorites-v1',JSON.stringify([...favorites]));}catch{saved=false;}render();const replacement=[...results.querySelectorAll('.directory-star')].find(b=>b.getAttribute('aria-label')==='Favorite '+item.label);(replacement||fav).focus();if(!saved)status.textContent+=' · Favorites could not be saved on this device.';};
  card.append(open,star);results.append(card);
 }
 prev.disabled=page===0;next.disabled=page>=count-1;position.textContent=(page+1)+' / '+count;pages.hidden=matches.length<=24;
}
search.oninput=()=>{page=0;render();};select.onchange=()=>{group=select.value;page=0;render();};fav.onclick=()=>{onlyFavorites=!onlyFavorites;fav.setAttribute('aria-pressed',String(onlyFavorites));page=0;render();};clear.onclick=()=>{search.value='';select.value=group='';onlyFavorites=false;fav.setAttribute('aria-pressed','false');page=0;render();search.focus();};
prev.onclick=()=>{page--;render();dialog.scrollTop=0;};next.onclick=()=>{page++;render();dialog.scrollTop=0;};
dialog.addEventListener('keydown',e=>e.stopPropagation());dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
function open(category=''){returnFocus=doc.activeElement;group=category;select.value=category;search.value='';page=0;onlyFavorites=false;fav.setAttribute('aria-pressed','false');render();dialog.showModal();search.focus();}
const launcher=el('button','Search everything','hem-search-launch');launcher.type='button';launcher.onclick=()=>open();doc.querySelector('.header-right').prepend(launcher);
const nav=doc.querySelector('.topnav');nav.replaceChildren();
for(const [label,view] of [['Home & Radio','dashboard'],['Full DAW','studio'],['Plugin Workshop','forge'],['Lyrics Creator','lyrics'],['Music Library','hem-atm'],['Prompt Encyclopedia','encyclopedia']]){
 const b=el('button',label,'nav-tab');b.type='button';b.dataset.view=view;
 const active=root.GhostStudio.state.view===view;b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');
 b.onclick=()=>root.GhostStudio.showView(view);nav.append(b);
}
const shortcuts=el('nav',undefined,'directory-shortcuts');shortcuts.setAttribute('aria-label','Studio shortcuts');
for(const [label,href] of [['3D Rack','/rack'],['Illustrated Manual','/manual']]){const a=el('a',label+' ↗');a.href=href;a.target='_blank';a.rel='noopener';shortcuts.append(a);}
for(const [label,group] of [['Projects & Export',categories[5]],['All Tools & Chains','']]){const b=el('button',label);b.type='button';b.onclick=()=>open(group);shortcuts.append(b);}
doc.querySelector('.topbar').after(shortcuts);
const groups=doc.querySelector('.dashboard-launchers');groups.replaceChildren();
for(const [i,c] of categories.entries()){
 const b=el('button');b.type='button';b.append(el('span','0'+(i+1)),el('strong',c),el('small',entries.filter(e=>e.group===c).length.toLocaleString()+' tools & references'));b.onclick=()=>open(c);groups.append(b);
}
const hint=el('button','Search the whole studio →','directory-home-search');hint.type='button';hint.onclick=()=>open();groups.before(hint);
root.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(!dialog.open)open();}});
root.GhostDirectory={open,entries};
})(typeof window==='undefined'?globalThis:window);
