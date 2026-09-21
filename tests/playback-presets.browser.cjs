const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {firefox}=require('playwright');
(async()=>{
 const base=path.resolve(__dirname,'../studio');
 const server=http.createServer((req,res)=>{if(req.url.startsWith('/radio')){res.end('<!doctype html><title>Radio isolated</title>');return;}const file=req.url==='/ghost-worklet-bundle.js'?'ghost-worklet-bundle.js':'index.html';res.setHeader('content-type',file.endsWith('.js')?'application/javascript':'text/html');res.end(fs.readFileSync(path.join(base,file)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1',MOZ_DISABLE_RDD_SANDBOX:'1'},firefoxUserPrefs:{'security.sandbox.content.level':0,'media.autoplay.default':0,'media.autoplay.block-webaudio':false}});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});console.log('Page loaded');await page.waitForFunction(()=>!!window.GhostStudio);
 const counts=await page.evaluate(()=>{const s=GhostStudio;s.state.plugin.effects=Object.keys(GhostAudio.TYPES).map(t=>GhostAudio.newEffect(t));s.state.editingTarget=null;s.showView('forge');return [...document.querySelectorAll('.preset-row select')].map(s=>s.options.length);});console.log('Dropdowns:',counts.length);assert.equal(counts.length,27);assert.ok(counts.every(n=>n>=7));
 await page.evaluate(()=>{const b=document.createElement('button');b.id='test-start-audio';b.textContent='Start audio test';b.onclick=()=>GhostStudio.engine.init();document.body.prepend(b);});await page.locator('#test-start-audio').click();
 await page.evaluate(async()=>{const e=GhostStudio.engine,ctx=await Promise.race([e.init(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Audio context unavailable: '+e.context?.state)),10000))]);const buffer=ctx.createBuffer(2,ctx.sampleRate*30,ctx.sampleRate);for(let c=0;c<2;c++){const d=buffer.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=.05*Math.sin(i/ctx.sampleRate*440*2*Math.PI);}const raw=GhostAudio.wav(buffer,16).bytes;const decoded=await e.decode(raw);e.tracks=[{id:'uploaded',name:'Uploaded WAV fixture',buffer:decoded,raw,effects:[],gainDb:0,pan:0,mute:false,solo:false,start:0,trimStart:0,trimEnd:30}];e.backendPreference='compatibility';await e.play();});
 const before=await page.evaluate(()=>GhostStudio.engine.current());
 await page.evaluate(()=>{const e=GhostStudio.engine;window.didPause=false;window.watchPlayback=setInterval(()=>{if(!e.playing)window.didPause=true;},5);e.tracks[0].gainDb=-3;e.update();e.tracks[0].pan=.2;e.update();});
 await page.waitForFunction(()=>document.querySelector('#audioRenderStatus')?.textContent==='Updated sound is playing.',{},{timeout:60000});
 const result=await page.evaluate(()=>{clearInterval(window.watchPlayback);const e=GhostStudio.engine;const result={playing:e.playing,paused:window.didPause,current:e.current()};e.stop();return result;});assert.equal(result.playing,true);assert.equal(result.paused,false);assert.ok(result.current>before);assert.deepEqual(errors,[]);console.log('PASS: 27 preset dropdowns; uploaded WAV keeps playing during fader/pan edits and automatic sound swap.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
