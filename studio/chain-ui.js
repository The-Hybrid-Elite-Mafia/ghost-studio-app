(function(root){
 'use strict';
 const data=root.GhostChainData,C=root.GhostChainCore;
 const mounts=new WeakMap();let options={},dialog,library,detail,title,back,returnFocus;
 function node(doc,tag,text,cls){const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;}
 function button(doc,label,fn,cls=''){const el=node(doc,'button',label,cls);el.type='button';el.onclick=fn;return el;}
 function active(doc){let el=doc.activeElement;while(el?.shadowRoot?.activeElement)el=el.shadowRoot.activeElement;if(el?.tagName==='IFRAME'){try{return active(el.contentDocument);}catch{}}return el;}
 async function copy(text,status){
  let ok=false;try{if(root.navigator.clipboard?.writeText){await root.navigator.clipboard.writeText(text);ok=true;}}catch{}
  if(!ok){const doc=root.document,focus=active(doc),area=node(doc,'textarea');area.value=text;area.style.cssText='position:fixed;left:-10000px;top:0';(dialog?.open?dialog:doc.body).append(area);area.focus();area.select();try{ok=doc.execCommand('copy');}catch{}area.remove();focus?.focus({preventScroll:true});}
  status.textContent=ok?'Copied.':'Copy failed. Select the guide text and copy manually.';
 }
 function download(blob,name){const url=URL.createObjectURL(blob),a=node(root.document,'a');a.href=url;a.download=name;(dialog?.open?dialog:root.document.body).append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function close(){if(!dialog)return;if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');returnFocus?.focus({preventScroll:true});}
 function ensureDialog(){
  if(dialog)return;const doc=root.document;dialog=node(doc,'dialog',undefined,'ghost-chain-ui ghost-chain-dialog');dialog.setAttribute('aria-labelledby','chainDialogTitle');
  const head=node(doc,'div',undefined,'chain-dialog-head');title=node(doc,'h2','Workflows & chains');title.id='chainDialogTitle';title.tabIndex=-1;head.append(title,button(doc,'Close',close));
  back=button(doc,'← All workflows',()=>showLibrary(), 'chain-back');library=node(doc,'div');detail=node(doc,'div');dialog.append(head,back,library,detail);doc.body.append(dialog);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
  // Isolate studio transport shortcuts while reading or searching a guide.
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}event.stopPropagation();});
  mount(library);
 }
 function reveal(){ensureDialog();if(!dialog.open){returnFocus=active(root.document);if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}title.focus({preventScroll:true});dialog.scrollTop=0;}
 function showLibrary(filters){ensureDialog();title.textContent='Workflows & chains';library.hidden=false;detail.hidden=true;back.hidden=true;if(filters)mount(library,filters);reveal();}
 function open(entryId){
  const entry=C.find(data,entryId);if(!entry)throw Error('This entry has no connected workflow.');ensureDialog();const doc=root.document;
  title.textContent=entry.label;detail.replaceChildren();detail.hidden=false;library.hidden=true;back.hidden=false;
  detail.append(node(doc,'p',entry.kind+' · '+entry.family,'chain-meta'),node(doc,'p','Recording → source balance → channel processing → mix → export','chain-path'));
  const actions=node(doc,'div',undefined,'chain-actions'),status=node(doc,'output');status.setAttribute('role','status');actions.append(button(doc,'Copy full workflow',()=>void copy(C.format(data,entry.id),status)),button(doc,'Download guide',()=>download(new Blob([C.format(data,entry.id)],{type:'text/plain;charset=utf-8'}),C.id(entry.label)+'-workflow.txt')));detail.append(actions,status);
  if(entry.context?.length){const context=node(doc,'details');context.append(node(doc,'summary','Source direction'));const dl=node(doc,'dl');for(const [key,value] of entry.context)dl.append(node(doc,'dt',key.replace(/([a-z])([A-Z])/g,'$1 $2')),node(doc,'dd',value));context.append(dl);detail.append(context);}
  const workflow=node(doc,'ol',undefined,'chain-workflow');for(const [heading,text] of C.steps(data,entry)){const li=node(doc,'li');li.append(node(doc,'h3',heading),node(doc,'p',text));workflow.append(li);}detail.append(workflow,node(doc,'h3','Choose a channel or bus chain'));
  detail.append(node(doc,'p','Open a neutral draft in the Plugin workshop. Save or insert it when ready, then enable and adjust one stage at a time. Thresholds and tonal moves depend on your audio.','chain-note'));
  if(entry.notes)detail.append(node(doc,'p',entry.notes,'chain-note'));
  for(const r of entry.routes){
   const profile=data.profiles[r.profile],card=node(doc,'details',undefined,'chain-recipe');card.dataset.chainRoute=r.id;card.append(node(doc,'summary',r.label+' · '+profile.stages.length+' stages · '+(profile.target==='master'?'Master bus':'Selected track')));
   let built=false;card.addEventListener('toggle',()=>{if(card.open&&!built){built=true;buildRecipe(doc,card,entry,r,profile);}});detail.append(card);
  }
  const refs=node(doc,'details');refs.append(node(doc,'summary','Recording and export references'));for(const source of data.sources){const p=node(doc,'p'),a=node(doc,'a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);refs.append(p);}detail.append(refs);reveal();
 }
 function buildRecipe(doc,card,entry,r,profile){
  const status=node(doc,'output');status.setAttribute('role','status');const actions=node(doc,'div',undefined,'chain-actions');
  const draft=()=>C.draft(data,entry.id,r.id,root.GhostAudio?.newEffect);
  actions.append(button(doc,'Open neutral chain in Plugin workshop',()=>{try{const value=draft();if(typeof options.openDraft!=='function')throw Error('Open this guide inside the studio to load the chain.');options.openDraft(value);returnFocus=root.document.getElementById('pluginName')||returnFocus;close();}catch(error){status.textContent=error.message;}},'chain-primary'),button(doc,'Copy chain',()=>void copy(C.format(data,entry.id,r.id),status)),button(doc,'Download chain',()=>{try{const value=draft();download(new Blob([JSON.stringify({format:'ghost-plugin',version:1,name:value.name,effects:value.effects},null,2)],{type:'application/json'}),C.id(entry.label)+'-'+r.id+'.ghostplugin.json');status.textContent='Neutral chain downloaded.';}catch(error){status.textContent=error.message;}}));
  card.append(node(doc,'p',profile.goal),actions,status);const list=node(doc,'ol',undefined,'chain-stages');
  for(const stage of profile.stages){const def=data.processors[stage.type],li=node(doc,'li');li.append(node(doc,'h4',def.name),node(doc,'p',stage.why),node(doc,'p',stage.check,'chain-listen'));
   const controls=node(doc,'details');controls.append(node(doc,'summary','Controls and neutral defaults'));let rendered=false;
   controls.addEventListener('toggle',()=>{if(!controls.open||rendered)return;rendered=true;controls.append(node(doc,'p','Bypass: on. Values below are the installed neutral defaults; they are not a finished preset.'));const table=node(doc,'table'),caption=node(doc,'caption',def.name+' controls'),thead=node(doc,'thead'),header=node(doc,'tr');for(const heading of ['Control','Neutral','Range / choices'])header.append(node(doc,'th',heading));thead.append(header);const tbody=node(doc,'tbody');for(const [key,range] of Object.entries(def.params)){const row=node(doc,'tr'),label=root.GhostPacks?.label(key)||key,choices=def.choices?.[key],unit=range[3]||'';row.append(node(doc,'th',label),node(doc,'td',choices?.find(x=>x[0]===range[2])?.[1]||range[2]+' '+unit),node(doc,'td',choices?choices.map(x=>x[1]).join(' / '):range[0]+' to '+range[1]+' '+unit));tbody.append(row);}table.append(caption,thead,tbody);const wrap=node(doc,'div',undefined,'chain-table-wrap');wrap.append(table);controls.append(wrap);});li.append(controls);list.append(li);
  }
  card.append(list);
 }
 function openSource(source,key){const entry=C.fromSource(data,source,key);if(!entry)throw Error('No workflow is connected to '+key+'.');open(entry.id);return entry.id;}
 function mount(host,initial={}){
  if(mounts.has(host)){mounts.get(host).set(initial);return mounts.get(host).dispose;}
  const doc=host.ownerDocument;host.classList.add('ghost-chain-ui');const wrap=node(doc,'section',undefined,'chain-library');
  const heading=node(doc,'h3','Find your workflow'),intro=node(doc,'p',data.entries.length.toLocaleString('en-US')+' connected entries covering genres, vocals, instruments, beats, production and mastering. Choose an entry for its workflow and source-specific chains.');
  const controls=node(doc,'div',undefined,'chain-filters'),search=node(doc,'input');search.type='search';search.placeholder='Search a genre, vocal, instrument or task';search.setAttribute('aria-label','Search workflows');
  const kind=node(doc,'select'),family=node(doc,'select');kind.setAttribute('aria-label','Workflow type');family.setAttribute('aria-label','Workflow family');
  function selectOptions(select,values,label){select.replaceChildren();const all=node(doc,'option',label);all.value='';select.append(all);for(const value of values){const option=node(doc,'option',value);option.value=value;select.append(option);}}
  selectOptions(kind,[...new Set(data.entries.map(e=>e.kind))].sort(),'All types');selectOptions(family,[...new Set(data.entries.map(e=>e.family))].sort(),'All families');
  const status=node(doc,'output');status.setAttribute('role','status');const results=node(doc,'div',undefined,'chain-results'),pagination=node(doc,'div',undefined,'chain-pagination');let page=0;
  const previous=button(doc,'Previous',()=>{page--;render(true);}),next=button(doc,'Next',()=>{page++;render(true);}),pageLabel=node(doc,'span');pagination.append(previous,pageLabel,next);
  const reset=button(doc,'Clear filters',()=>set({query:'',kind:'',family:''}));controls.append(search,kind,family,reset);wrap.append(heading,intro,controls,status,results,pagination);host.replaceChildren(wrap);
  function render(focus=false){
   const matches=C.filter(data,{query:search.value,kind:kind.value,family:family.value}),pages=Math.max(1,Math.ceil(matches.length/18));page=Math.max(0,Math.min(page,pages-1));status.textContent=matches.length.toLocaleString('en-US')+' matching workflows';results.replaceChildren();
   if(!matches.length){results.append(node(doc,'p','No matching workflows. Try a shorter name or clear the filters.'));}
   for(const entry of matches.slice(page*18,page*18+18)){const card=node(doc,'article',undefined,'chain-result');card.append(node(doc,'p',entry.kind+' · '+entry.family,'chain-meta'),node(doc,'h4',entry.label),node(doc,'p',shortBrief(entry.brief)),button(doc,'Workflow & chains',()=>open(entry.id)));card.lastChild.setAttribute('aria-label','Workflow and chains for '+entry.label);results.append(card);}
   previous.disabled=page===0;next.disabled=page===pages-1;pagination.hidden=matches.length<=18;pageLabel.textContent='Page '+(page+1)+' of '+pages;
   if(focus){const first=results.querySelector('button');first?.focus({preventScroll:true});results.scrollIntoView?.({block:'start',behavior:'auto'});}
  }
  function set(value={}){if('query'in value)search.value=value.query;if('kind'in value)kind.value=value.kind;if('family'in value)family.value=value.family;page=0;render();}
  search.oninput=()=>{page=0;render();};kind.onchange=family.onchange=()=>{page=0;render();};
  const dispose=()=>{host.replaceChildren();mounts.delete(host);};mounts.set(host,{set,dispose});set(initial);return dispose;
 }
 function shortBrief(text){return text.length>170?text.slice(0,167)+'…':text;}
 function handle(event){const target=event.composedPath().find(el=>el?.matches?.('[data-chain-library],[data-chain-source]'));if(!target)return;event.preventDefault();try{if(target.hasAttribute('data-chain-library'))showLibrary();else openSource(target.dataset.chainSource,target.dataset.chainKey);}catch(error){options.report?.(error.message);}}
 function setup(value){options=value||{};root.document.addEventListener('click',handle);}
 root.GhostChainUI={setup,mount,open,openSource,showLibrary,close};
})(window);
