/* Shared, pure workflow lookups. Catalog actions accept known IDs only. */
(function(root){
 'use strict';
 const normalize=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const id=value=>normalize(value).replace(/ /g,'-');
 function find(data,entryId){return data.entries.find(entry=>entry.id===entryId)||null;}
 function fromSource(data,source,key){const entryId=data.lookup[source+'::'+String(key)];return entryId?find(data,entryId):null;}
 function recipe(data,entryId,routeId){const entry=find(data,entryId),route=entry?.routes.find(item=>item.id===routeId),profile=route&&data.profiles[route.profile];if(!entry||!route||!profile)throw Error('That workflow chain is unavailable.');return {entry,route,profile};}
 function filter(data,{query='',kind='',family=''}={}){const q=normalize(query).split(' ').filter(Boolean);return data.entries.filter(entry=>(!kind||entry.kind===kind)&&(!family||entry.family===family)&&q.every(word=>normalize([entry.label,entry.family,entry.kind,entry.brief,...(entry.aliases||[]),...(entry.context||[]).flat()].join(' ')).includes(word)));}
 function steps(data,entry){const primary=data.profiles[entry.routes[0].profile];return [
  ['Set the brief',entry.brief],
  ...(entry.workflow||[]),
  ['Prepare the source',primary.capture],
  ['Balance before processing','Keep the original audio. Align starts, choose the useful takes, and set faders before adding inserts. Check the quietest and loudest passages.'],
  ['Build the channel chain',primary.goal+' Open the chain below; every processor starts neutral and bypassed. Enable one stage at a time, adjust to the source, and match the comparison level.'],
  ['Finish the arrangement',primary.finish],
  ['Check and export','Check the full arrangement, transitions, exposed notes, mono playback and the ending. Export a stereo WAV and aligned stems when needed. Choose the delivery sample rate and bit depth deliberately; increasing either cannot restore lost detail. Use a full-song loudness/true-peak meter for delivery decisions; this studio’s live LUFS-M and peak figures are estimates.']
 ];}
 function format(data,entryId,routeId){const entry=find(data,entryId);if(!entry)throw Error('Workflow not found.');const lines=[entry.label,entry.kind+' · '+entry.family,'',...((entry.context||[]).map(([name,value])=>name+': '+value)),'','WORKFLOW',...steps(data,entry).map(([title,text],i)=>(i+1)+'. '+title+'\n'+text)];
  const routes=routeId?entry.routes.filter(route=>route.id===routeId):entry.routes;
  if(!routes.length)throw Error('Chain not found.');
  for(const route of routes){const profile=data.profiles[route.profile];lines.push('',route.label.toUpperCase()+' · '+(profile.target==='master'?'MASTER BUS':'SELECTED TRACK'),profile.goal);profile.stages.forEach((stage,i)=>{const processor=data.processors[stage.type];lines.push((i+1)+'. '+processor.name+'\nPurpose: '+stage.why+'\nAdjust by listening: '+stage.check);});lines.push('Neutral start: bypass on; no added processing. Keep valid neutral frequency, Q, ratio and timing values. Adjust thresholds to the actual recording.');}
  if(entry.notes)lines.push('',entry.notes);
  lines.push('','Recording/export references',...data.sources.map(source=>source.title+' — '+source.url));return lines.join('\n');
 }
 function draft(data,entryId,routeId,newEffect){const {entry,route,profile}=recipe(data,entryId,routeId);if(typeof newEffect!=='function')throw Error('The studio processor factory is unavailable.');const effects=profile.stages.map(stage=>newEffect(stage.type));if(!effects.length)throw Error('This chain needs at least one processor.');if(effects.some(effect=>effect.enabled))throw Error('A workflow chain must start bypassed.');return {name:(entry.label+' · '+route.label).slice(0,60),target:profile.target,effects};}
 const api={normalize,id,find,fromSource,recipe,filter,steps,format,draft};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GhostChainCore=api;
})(typeof window!=='undefined'?window:globalThis);
