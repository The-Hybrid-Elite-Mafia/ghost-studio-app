(function(root){'use strict';
 const origin=root.location.origin;
 root.GhostDashboard=function({engine,state,showView}){
  const $=id=>document.getElementById(id),frame=$('dashboardRadio');let started=false,timer;
  function send(type){if(started)frame.contentWindow?.postMessage({type},origin);}
  root.addEventListener('message',e=>{
   if(e.origin!==origin||e.source!==frame.contentWindow||!e.data||typeof e.data!=='object')return;
   if(e.data.type==='hem-radio-size'&&Number.isFinite(e.data.height)&&e.data.height>=100&&e.data.height<=100000){frame.style.height=Math.ceil(e.data.height)+'px';$('radioConnection').hidden=true;clearTimeout(timer);}
   if(e.data.type==='hem-radio-play')engine.pause();
  });
  frame.addEventListener('load',()=>send('hem-radio-measure'));
  $('dashboardProjects').onclick=()=>{showView('studio');$('projectBtn').click();};
  $('dashboardImport').onclick=()=>{showView('studio');$('importBtn').click();};
  return {show(view){
   const active=view==='dashboard';$('dashboard').hidden=!active;document.body.classList.toggle('dashboard-active',active);
   if(!active){send('hem-radio-pause');return;}
   if(!started){started=true;frame.src=origin+'/radio?embed=studio';timer=setTimeout(()=>{$('radioConnection').textContent='Station connection is taking longer than expected. Refresh the page or try again shortly.';},15000);}
   else send('hem-radio-measure');
   $('dashboardSession').textContent=state.name||'Untitled session';$('dashboardTracks').textContent=engine.tracks.length?engine.tracks.length+' tracks in this session':'No tracks loaded. Import a song or stems to begin.';
   $('dashboardDrafts').replaceChildren();
   const li=document.createElement('li');li.textContent='Lyrics are temporary. Copy or download before leaving Lyrics Creator.';$('dashboardDrafts').append(li);
  }};
 };
})(window);
