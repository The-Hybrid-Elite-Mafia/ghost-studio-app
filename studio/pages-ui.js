(function(root){
'use strict';
root.GhostWorkspacePages=function({$,state,toast,download,filename,showView,showAIStatus,addChat}){
 const L=root.GhostLyrics,STORE='ghost-lyrics-workspace-v1';
 const pageIds={'hem-atm':'hemAtmPage',encyclopedia:'encyclopediaPage',lyrics:'lyricsPage'};
 const frames={'hem-atm':'hemAtmFrame',encyclopedia:'encyclopediaFrame'},blobs=[];
 let song=null,lastSpec=null,drafts=[],writing=false,saveTimer,activeView='',revision=0,pendingRequest=null;
 const fieldId=key=>'lyrics'+key[0].toUpperCase()+key.slice(1);
 function readForm(){return Object.fromEntries(Object.keys(L.defaults).map(key=>[key,['bpm','lyricDensity'].includes(key)?Number($(fieldId(key)).value):$(fieldId(key)).value]));}
 function restoreForm(value={}){
  for(const [key,fallback] of Object.entries(L.defaults)){
   const given=key==='reference'?root.GhostMigrateEffectsReference(value[key]):value[key],ok=key==='lyricDensity'?Number.isInteger(given)&&given>=0&&given<=100:key==='bpm'?Number.isFinite(given)&&given>=40&&given<=240:typeof given==='string'&&given.length<=(L.limits[key]||40);
   $(fieldId(key)).value=ok?given:fallback;
  }
  if(!['create','rewrite'].includes($('lyricsMode').value))$('lyricsMode').value='create';
  if(!['none','natural','custom'].includes($('lyricsRhyme').value))$('lyricsRhyme').value='none';
  if(!['faithful','inspired','reimagined'].includes($('lyricsCreativeMode').value))$('lyricsCreativeMode').value='inspired';
  formState();
 }
 function formState(){
  const d=Number($('lyricsLyricDensity').value),density=d===0?'Instrumental':d<=25?'Sparse vocal':d<=50?'Light vocal':d<=80?'Full vocal':'Dense vocal';
  $('lyricsDensityLabel').textContent=d+' · '+density;
  $('lyricsBriefReview').textContent=[['Reference','referenceTrack'],['Mode','creativeMode'],['Genre','genre'],['Tempo target','bpm'],['Key target','key'],['Instruments','instruments'],['Groove','groove'],['Energy','energyArc'],['Sections','sections'],['Language','language']].map(([label,key])=>label+': '+($(fieldId(key)).value||'Not specified')).concat('Vocals: '+density).join('\n');
  const rewrite=$('lyricsMode').value==='rewrite';$('lyricsRewriteFields').hidden=!rewrite;$('lyricsRhymeNotesLabel').hidden=$('lyricsRhyme').value!=='custom';
  $('lyricsGenerateBtn').textContent=writing?'Writing…':rewrite?'Rewrite song package':'Write song package';
  $('lyricsSourceCount').textContent=$('lyricsSourceLyrics').value.length.toLocaleString('en-US')+' / 12,000 characters';
 }
 function progress(message,error=false){$('lyricsProgress').textContent=message;$('lyricsProgress').classList.toggle('error',error);}
 function connection(){
  $('lyricsConnection').textContent=(state.endpoint?'Uses '+(state.aiInfo?.model||'your configured Ghost service')+'. ':'Connect Ghost to write or rewrite lyrics. ')+'Your brief and submitted lyrics are sent only when you generate. '+(state.aiInfo?root.GhostAI.usageText(state.aiInfo):'Reference pages, draft editing and copying stay available.');
 }
 function persist(){
  clearTimeout(saveTimer);
  try{localStorage.removeItem(STORE);}catch{}
  $('lyricsSaveStatus').textContent='Temporary only. Copy or download before leaving this page.';
 }
 function queueSave(){persist();}
 function clearLyrics(){
  revision++;pendingRequest?.abort();pendingRequest=null;clearTimeout(saveTimer);
  song=null;lastSpec=null;drafts=[];setWriting(false);restoreForm();
  $('lyricsForm').reset();restoreForm();
  for(const id of ['lyricsFramework','lyricsTextFile','lyricsDraftFile'])$(id).value='';
  $('lyricsResultTitle').textContent='';$('lyricsWarnings').replaceChildren();$('lyricsWarnings').hidden=true;
  $('lyricsBlueprintStatus').textContent='';$('lyricsEffectsStatus').textContent='';
  renderDrafts();renderSong();persist();progress('Cleared. Nothing is saved in this lyrics workspace.');
 }
 function renderDrafts(){
  $('lyricsDraftList').replaceChildren(new Option('Choose a saved draft',''));
  for(const d of drafts){const option=new Option(d.song.songBrief.title+' · '+new Date(d.created).toLocaleString(),d.id);$('lyricsDraftList').append(option);}
 }
 function checks(){
  if(!song)return;
  $('lyricsFramework').value=L.format(song,{allowEmpty:true});$('lyricsResultTitle').textContent=song.songBrief.title;
  const warnings=L.warnings(song,lastSpec||{});$('lyricsWarnings').replaceChildren();$('lyricsWarnings').hidden=!warnings.length;
  for(const text of warnings){const li=document.createElement('li');li.textContent=text;$('lyricsWarnings').append(li);}
 }
 async function copy(text){
  let copied=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);copied=true;}}catch{}
  if(!copied){const el=document.createElement('textarea'),focused=document.activeElement;el.value=text;el.style.cssText='position:fixed;left:-10000px;top:0';document.body.append(el);el.focus();el.select();try{copied=document.execCommand('copy');}catch{}el.remove();focused?.focus();}
  toast(copied?'Copied.':'Copy failed. Select the text and copy it manually.',!copied);
 }
 let fieldViews={};
 // Keep the [START_ON:TRUE][START_ON:"first line"] tag in Style and Lyrics matched to the current first sung line.
 function syncStartOn(editing){
  L.applyStartOn(song);
  for(const key of ['lyrics','stylePrompt']){
   const view=fieldViews[key];if(!view||view.text.value===song[key])continue;
   if(view.text===editing){const end=view.text.value.length-view.text.selectionEnd;view.text.value=song[key];const at=Math.max(0,song[key].length-end);view.text.setSelectionRange(at,at);}
   else view.text.value=song[key];
   view.count();
  }
 }
 function renderSong(){
  $('lyricsEmpty').hidden=!!song;$('lyricsResults').hidden=!song;$('lyricsUseDraftBtn').disabled=!song||writing;
  $('lyricsOutputCards').replaceChildren();fieldViews={};if(!song)return;
  const cards=[['stylePrompt','1 · Style prompt',4,1000],['lyrics','2 · Lyrics',19,5000],['negativePrompt','3 · Negative prompt',3,0],['productionNotes','4 · Production notes',7,0],['instrumentalPrompt','Instrumental prompt',4,1000]];
  for(const [key,label,rows,max] of cards){
   const card=document.createElement('section');card.className='desk lyrics-card';card.dataset.field=key;
   const heading=document.createElement('div');heading.className='lyrics-card-heading';
   const title=document.createElement('h3');title.textContent=label;
   const button=document.createElement('button');button.type='button';button.className='quiet';button.textContent='Copy';button.setAttribute('aria-label','Copy '+label);button.onclick=()=>copy(song[key]);
   const text=document.createElement('textarea');text.value=song[key];text.rows=rows;text.maxLength=20000;text.setAttribute('aria-label',label);text.spellcheck=true;
   const counter=document.createElement('output');
   const count=()=>{counter.textContent=text.value.length.toLocaleString('en-US')+(max?' / '+max.toLocaleString('en-US'):'')+' characters';counter.classList.toggle('over',!!max&&text.value.length>max);};
   text.oninput=()=>{song[key]=text.value;if(key==='lyrics'||key==='stylePrompt')syncStartOn(text);count();try{checks();queueSave();}catch{progress('This draft has an empty required section. Add text before exporting the full framework.',true);}};
   fieldViews[key]={text,count};
   count();heading.append(title,button);card.append(heading,text,counter);$('lyricsOutputCards').append(card);
  }
  checks();
 }
 function setWriting(value){
  writing=value;$('lyricsForm').setAttribute('aria-busy',String(value));
  for(const el of $('lyricsForm').querySelectorAll('input,select,textarea,button'))el.disabled=value;
  $('lyricsUseDraftBtn').disabled=value||!song;$('lyricsDraftList').disabled=value;$('lyricsImportDraftBtn').disabled=value;
  formState();
 }
 async function generate({fromChat=false}={}){
  if(writing)throw Error('Ghost is already writing this draft. Please wait.');
  const spec=L.normalizeInput(readForm()),endpoint=state.endpoint;
  if(!endpoint){$('aiSettingsBtn').click();throw Error('Connect Ghost’s AI service first, then generate your song.');}
  const generation=revision;pendingRequest=new AbortController();
  setWriting(true);progress(spec.mode==='rewrite'?'Reworking your lyrics and checking the lines to preserve…':'Writing the lyrics, arrangement and complete framework…');
  try{
   const response=await root.GhostAI.writeLyrics(endpoint,spec,{base:location.href,signal:pendingRequest.signal});
   if(generation!==revision)return null;
   song=L.validateSong(response.song);lastSpec=spec;
   if(state.endpoint===endpoint){state.connected=true;if(response.budget)state.aiInfo=response.budget;showAIStatus();}
   renderSong();renderDrafts();persist();progress('Draft ready. Read it aloud, edit any line, then copy or download your framework.');
   if(fromChat)addChat('ghost','Your song package is ready in Lyrics Creator. Copy or download it before leaving; it will be cleared.');
   return song;
  }catch(e){if(generation!==revision)return null;if(e.budget&&state.endpoint===endpoint){state.aiInfo=e.budget;showAIStatus();}progress(e.message,true);throw e;}
  finally{if(generation===revision){pendingRequest=null;setWriting(false);}}
 }
 async function fromChat(text){
  if(writing)return 'Ghost is already writing a song package. The draft will appear in Lyrics Creator.';
  showView('lyrics');const rewrite=/\b(?:rewrite|re-write|revise|rework|polish)\b/i.test(text);
  $('lyricsMode').value=rewrite?'rewrite':'create';$('lyricsBrief').value=text;
  if(rewrite){if(text.length<=L.limits.fix)$('lyricsFix').value=text;if(!$('lyricsSourceLyrics').value&&song)$('lyricsSourceLyrics').value=song.lyrics;}
  formState();persist();
  if(rewrite&&!$('lyricsSourceLyrics').value)return 'Paste the lyrics into the Rewrite page and choose Rewrite song package. You can lock exact lines before I make changes.';
  await generate({fromChat:true});return null;
 }
 function show(view){
  if(activeView==='lyrics'&&view!=='lyrics')clearLyrics();
  activeView=view;
  const external=Object.hasOwn(pageIds,view);$('resourcePages').hidden=!external;
  for(const [key,id] of Object.entries(pageIds))$(id).hidden=key!==view;
  if(frames[view]){
   const frame=$(frames[view]);
   if(!frame.dataset.loaded){
    const html=root.GhostImportedPages?.[view];if(typeof html!=='string')throw Error('This reference page is missing from the app package.');
    const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));blobs.push(url);frame.src=url;frame.dataset.loaded='1';
   }
   else frame.contentWindow?.GhostReferenceLayout?.refresh();
  }
  if(view==='lyrics')connection();
 }
 function downloadSong(kind){
  if(!song)throw Error('Write or open a draft first.');
  const name=filename(song.songBrief.title)||'Ghost-song';
  if(kind==='text')download(new Blob([L.format(song)],{type:'text/plain;charset=utf-8'}),name+'.txt');
  else download(new Blob([JSON.stringify({format:'ghost-lyrics',version:1,spec:lastSpec,song:L.validateSong(song,{allowEmpty:true})},null,2)],{type:'application/json'}),name+'.ghostlyrics.json');
 }
 const act=fn=>async()=>{try{await fn();}catch(e){progress(e.message,true);toast(e.message,true);}};
 const blueprint=root.GhostLyricsBlueprint;
 root.GhostEffectsLibrary({copy,download,useReference:a=>{
  if(writing){$('lyricsEffectsStatus').textContent='Wait for the current draft to finish before changing its reference.';return;}
  const reference='Production reference: '+a.artist+' · '+a.genre+' · '+a.era+'\n\n'+a.sunoPrompt+'\n\nMix-bus notes: '+a.mixBusNotes;
  if(reference.length>L.limits.reference){$('lyricsEffectsStatus').textContent='This reference is too long for the writing field. Copy the sections you need instead.';return;}
  $('lyricsReference').value=reference;formState();persist();$('lyricsEffectsStatus').textContent=a.artist+' production reference loaded. Your story, lyrics and tempo are unchanged.';
 }});
 for(const section of blueprint.sections){
  const detail=document.createElement('details'),heading=document.createElement('summary'),text=document.createElement('pre'),button=document.createElement('button');
  heading.textContent=section.title;text.textContent=section.text;button.type='button';button.className='quiet';button.textContent='Copy '+section.title;button.onclick=act(()=>copy(section.text));detail.append(heading,button,text);$('lyricsBlueprintSections').append(detail);
 }
 $('lyricsUseBlueprintBtn').onclick=()=>{if(writing)return;$('lyricsBpm').value=69;$('lyricsReference').value=blueprint.reference;formState();persist();$('lyricsBlueprintStatus').textContent='Blueprint loaded: 69 BPM, 4/4 production reference. Your story and lyrics are unchanged.';};
 $('lyricsCopyBlueprintBtn').onclick=act(()=>copy(blueprint.text));
 $('lyricsCopyBlueprintJsonBtn').onclick=act(()=>copy(JSON.stringify(blueprint.data,null,2)));
 $('lyricsDownloadBlueprintBtn').onclick=()=>download(new Blob([JSON.stringify(blueprint.data,null,2)],{type:'application/json'}),'my-time-coming-to-an-end-blueprint.json');
 $('lyricsForm').onsubmit=e=>{e.preventDefault();void act(()=>generate())();};
 $('lyricsForm').addEventListener('input',()=>{formState();queueSave();});$('lyricsForm').addEventListener('change',()=>{formState();queueSave();});
 $('lyricsConnectBtn').onclick=()=>$('aiSettingsBtn').click();
 $('lyricsUseDraftBtn').onclick=()=>{if(!song||writing)return;$('lyricsMode').value='rewrite';$('lyricsSourceLyrics').value=song.lyrics;$('lyricsLockedLines').value='';formState();persist();$('lyricsFix').focus();};
 $('lyricsCopyAllBtn').onclick=act(()=>copy(L.format(song)));$('lyricsDownloadBtn').onclick=act(()=>downloadSong('text'));$('lyricsSaveDraftBtn').onclick=act(()=>downloadSong('draft'));
 $('lyricsDraftList').onchange=()=>{const draft=drafts.find(x=>x.id===$('lyricsDraftList').value);if(!draft||writing)return;song=JSON.parse(JSON.stringify(draft.song));lastSpec=draft.spec;restoreForm(draft.spec);renderSong();persist();progress('Saved draft restored.');};
 $('lyricsImportTextBtn').onclick=()=>$('lyricsTextFile').click();$('lyricsImportDraftBtn').onclick=()=>$('lyricsDraftFile').click();
 $('lyricsTextFile').onchange=act(async()=>{const importedAt=revision;const file=$('lyricsTextFile').files[0];if(!file)return;try{if(file.size>48000)throw Error('Choose a lyric text file under 48 KB.');const text=await file.text();if(importedAt!==revision)return;if(text.length>12000)throw Error('The source exceeds 12,000 characters. Shorten it before importing.');$('lyricsSourceLyrics').value=text;$('lyricsMode').value='rewrite';formState();persist();}finally{$('lyricsTextFile').value='';}});
 $('lyricsDraftFile').onchange=act(async()=>{const importedAt=revision;const file=$('lyricsDraftFile').files[0];if(!file)return;try{if(file.size>200000)throw Error('This draft file is too large.');const raw=await file.text();if(importedAt!==revision)return;const value=JSON.parse(raw);if(value.format!=='ghost-lyrics'||value.version!==1)throw Error('Choose a Ghost lyrics draft file.');const loaded=L.validateSong(value.song,{allowEmpty:true}),spec=L.normalizeInput(value.spec);song=loaded;lastSpec=spec;restoreForm(spec);renderSong();persist();progress('Draft opened. No AI request was sent.');}finally{$('lyricsDraftFile').value='';}});
 clearLyrics();connection();
 $('lyricsClearBtn').onclick=()=>{clearLyrics();$('lyricsTitle').focus();};
 $('lyricsForm').setAttribute('autocomplete','off');
 root.addEventListener('ghost-ai-state',connection);
 root.addEventListener('pagehide',clearLyrics);
 root.addEventListener('pageshow',event=>{if(event.persisted)clearLyrics();});
 return {show,fromChat,generate,connection,clearLyrics,get writing(){return writing;},getSong:()=>song,readForm};
};
})(typeof window!=='undefined'?window:globalThis);
