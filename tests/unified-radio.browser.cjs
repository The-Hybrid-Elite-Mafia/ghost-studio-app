const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),http=require('http');
const {build}=require('esbuild'),{firefox}=require('playwright');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const built=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import Radio from './app/radio/radio';createRoot(document.getElementById('root')).render(<Radio/>);`,resolveDir:root,loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',alias:{'@':root},define:{'process.env.NODE_ENV':'"development"'}});
 const css=fs.readdirSync(path.join(root,'dist/client/assets')).filter(x=>x.endsWith('.css')).map(x=>fs.readFileSync(path.join(root,'dist/client/assets',x),'utf8')).join('\n');
 const fixture={signedIn:true,isOwner:true,setup:true,genres:['Rock','Country','Hip-Hop'],tracks:[],mine:[]};
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://local');
  if(u.pathname==='/api/radio/station'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(fixture));}
  else if(u.pathname==='/preview.js'){res.setHeader('Content-Type','text/javascript');res.end(built.outputFiles[0].text);}
  else if(u.pathname==='/preview.css'){res.setHeader('Content-Type','text/css');res.end(css);}
  else if(u.pathname==='/radio'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/preview.css"></head><body><div id="root"></div><script src="/preview.js"></script></body></html>');}
  else if(u.pathname==='/'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(path.join(root,'studio/index.html')));}
  else{try{const file=path.join(root,'public',u.pathname);res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1',MOZ_DISABLE_RDD_SANDBOX:'1'},firefoxUserPrefs:{'security.sandbox.content.level':0}});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')||r.request().url().startsWith('blob:')?r.continue():r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
 const radio=page.frameLocator('#dashboardRadio');
 await radio.locator('.rotary-ring').first().waitFor({timeout:20000});
 assert.equal(await radio.locator('.rotary-ring').count(),11,'10 EQ bands plus preamp');
 assert.equal(await page.locator('#dashboardRadio').evaluate(e=>new URL(e.src).origin===location.origin),true,'player belongs to the main site');
 const knob=radio.locator('.rotary-ring').first();await knob.focus();await knob.press('ArrowUp');assert.equal(await knob.getAttribute('aria-valuenow'),'0.5');await knob.press('End');assert.equal(await knob.getAttribute('aria-valuenow'),'9');await knob.dblclick();assert.equal(await knob.getAttribute('aria-valuenow'),'0');
 await radio.getByRole('button',{name:'Bypass EQ',exact:true}).click();assert.equal(await radio.getByRole('button',{name:'EQ bypassed',exact:true}).getAttribute('aria-pressed'),'true');await radio.getByRole('button',{name:'EQ bypassed',exact:true}).click();
 await radio.locator('.deck').screenshot({path:path.join(root,'review/main-site-radio-desktop.png')});
 await page.setViewportSize({width:412,height:915});
 await radio.locator('.glass-eq').screenshot({path:path.join(root,'review/main-site-radio-eq-mobile.png')});
 assert.equal(await radio.locator('html').evaluate(e=>e.scrollWidth>innerWidth),false,'radio fits phone');
 const height=await page.locator('#dashboardRadio').evaluate(e=>e.getBoundingClientRect().height);assert.ok(height>1000,'main page expands to the entire radio');
 for(const label of ['Upload','Manage','Listen']){await radio.getByRole('tab',{name:label,exact:true}).click();assert.equal(await radio.getByRole('tab',{name:label,exact:true}).getAttribute('aria-selected'),'true');assert.equal(await radio.locator('html').evaluate(e=>e.scrollWidth>innerWidth),false,label+' fits phone');}
 const radioTab=await radio.getByRole('tab',{name:'Listen',exact:true}).evaluate(e=>({bg:getComputedStyle(e).backgroundImage,radius:getComputedStyle(e).borderRadius}));
 const mainTab=await page.locator('.topnav .nav-tab').first().evaluate(e=>({bg:getComputedStyle(e).backgroundImage,radius:getComputedStyle(e).borderRadius}));
 assert.deepEqual(radioTab,mainTab,'radio and dashboard share tab materials');
 for(const view of ['studio','forge','lyrics','hem-atm','encyclopedia']){
  await page.evaluate(v=>GhostStudio.showView(v),view);
  if(view==='hem-atm'||view==='encyclopedia'){
   const frame=page.frameLocator(view==='hem-atm'?'#hemAtmFrame':'#encyclopediaFrame');
   const tab=frame.locator(view==='hem-atm'?'.tb':'.tab.active').first();await tab.waitFor({state:'attached'});
   const skin=await tab.evaluate(e=>({bg:getComputedStyle(e).backgroundImage,radius:getComputedStyle(e).borderRadius}));assert.deepEqual(skin,mainTab,view+' tabs match dashboard');
  }else{
   const panel=page.locator(view==='studio'?'#arrangement':view==='forge'?'#forge':'#lyricsForm');
   assert.equal(await panel.evaluate(e=>getComputedStyle(e).borderRadius),'3px');
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: main-origin radio, full-page sizing, mobile fit, 11 numbered knobs, keyboard bounds/reset, EQ bypass, Listen/Upload/Manage tabs, shared tabs across Music Library and Prompt Encyclopedia, studio/plugin/lyrics frames, zero runtime errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
