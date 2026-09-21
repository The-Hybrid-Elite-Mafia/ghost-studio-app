(function(root){
'use strict';
root.GhostEffectsLibrary=function({copy,download,useReference}){
 const data=root.GhostEffectsData,host=document.getElementById('lyricsEffectsLibrary');
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const action=(label,fn)=>{const b=el('button',label);b.type='button';b.className='quiet';b.onclick=fn;return b;};
 const channelText=c=>[c.channelName,...c.steps.map(s=>`${s.step}. ${s.processorType} — ${s.product}\nSettings: ${s.settings}\nWhy: ${s.why}`)].join('\n\n');
 const artistText=a=>[a.artist,a.genre+' · '+a.era,...a.signalChain.map(channelText),'SUNO PROMPT\n'+a.sunoPrompt,'MIX-BUS NOTES\n'+a.mixBusNotes].join('\n\n');
 const search=el('input');search.type='search';search.placeholder='Search Hybrid name, genre, processor or setting';search.setAttribute('aria-label','Search effects-chain library');
 const genre=el('select');genre.setAttribute('aria-label','Filter effects chains by genre');genre.append(new Option('All genres',''));[...new Set(data.artists.map(a=>a.genre))].sort().forEach(g=>genre.append(new Option(g,g)));
 const count=el('output');count.setAttribute('role','status');const list=el('div');list.className='effects-library-results';
 const controls=el('div');controls.className='lyrics-small-actions';controls.append(search,genre,action('Download full library JSON',()=>download(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'hybrid-effects-chains.json')));
 host.append(controls,count,list);
 function render(){
  const q=search.value.toLowerCase().trim(),artists=data.artists.filter(a=>(!genre.value||a.genre===genre.value)&&(!q||artistText(a).toLowerCase().includes(q)));
  count.textContent=artists.length+' of '+data.artists.length+' Hybrid profiles';list.replaceChildren();
  if(!artists.length){list.append(el('p','No matching references. Try another Hybrid name, genre or processor.'));return;}
  for(const a of artists){
   const card=el('details');card.className='effects-artist';card.append(el('summary',a.artist+' · '+a.genre));
   let built=false;card.addEventListener('toggle',()=>{if(!card.open||built)return;built=true;
    card.append(el('p',a.era));
    card.append(action('Studio workflow & chains',()=>root.GhostChainUI.openSource('artist-chain',a.id)));
    const actions=el('div');actions.className='lyrics-small-actions';actions.append(action('Use in Lyrics Creator',()=>useReference(a)),action('Copy full '+a.artist+' reference',()=>copy(artistText(a))),action('Copy '+a.artist+' JSON',()=>copy(JSON.stringify(a,null,2))));card.append(actions);
    function block(title,text){const section=el('section');section.append(el('h4',title),action('Copy '+title,()=>copy(text)),el('pre',text));card.append(section);}
    block('Suno prompt',a.sunoPrompt);block('Mix-bus notes',a.mixBusNotes);
    for(const c of a.signalChain){const section=el('details');section.append(el('summary',c.channelName+' · '+c.steps.length+' steps'),action('Copy '+c.channelName,()=>copy(channelText(c))));
     for(const s of c.steps){const step=el('section');const title=s.step+'. '+s.processorType+' — '+s.product;step.append(el('h4',title),action('Copy step '+s.step,()=>copy(title+'\nSettings: '+s.settings+'\nWhy: '+s.why)),el('p','Settings: '+s.settings),el('p','Why: '+s.why));section.append(step);}card.append(section);
    }
   });list.append(card);
  }
 }
 search.addEventListener('input',render);genre.addEventListener('change',render);render();
};
})(window);
