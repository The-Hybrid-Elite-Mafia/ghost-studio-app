/* Offline browser regression: no remote requests and no paid AI generation. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {firefox}=require('playwright');
(async()=>{
 const base=path.resolve(__dirname,'../studio');
 const {songFixture}=await import('./song-fixture.mjs');
 const server=http.createServer((req,res)=>{try{res.setHeader('content-type','text/html');res.end(req.url.startsWith('/radio')?'<!doctype html><title>Radio isolated for lyrics test</title>':fs.readFileSync(path.join(base,'index.html')));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1',MOZ_DISABLE_RDD_SANDBOX:'1'},firefoxUserPrefs:{'security.sandbox.content.level':0}});
 try{
  const page=await browser.newPage({viewport:{width:412,height:915}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:')?r.continue():r.abort());
  await page.addInitScript(()=>window===window.top&&localStorage.setItem('ghost-lyrics-workspace-v1',JSON.stringify({version:1,form:{brief:'OLD PRIVATE LYRICS'}})));
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.GhostDirectory);
  assert.equal(await page.evaluate(()=>localStorage.getItem('ghost-lyrics-workspace-v1')),null,'remove previously stored writing');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'phone has no horizontal overflow');
  await page.evaluate(()=>GhostStudio.showView('lyrics'));
  await page.locator('#lyricsBrief').fill('PRIVATE BRIEF');await page.locator('#lyricsTitle').fill('PRIVATE TITLE');
  await page.locator('#lyricsClearBtn').click();
  assert.equal(await page.locator('#lyricsBrief').inputValue(),'');assert.equal(await page.locator('#lyricsTitle').inputValue(),'');
  await page.locator('#lyricsBrief').fill('A person leaves a spare key by the kitchen sink.');
  await page.evaluate(()=>{
   GhostStudio.state.endpoint='https://example.invalid/ai';
   GhostAI.writeLyrics=()=>new Promise(resolve=>window.resolveFakeLyrics=resolve);
   window.pendingLyrics=GhostStudio.workspacePages.generate();
  });
  await page.waitForFunction(()=>!!window.resolveFakeLyrics);
  await page.evaluate(()=>GhostStudio.showView('studio'));
  await page.evaluate(async fixture=>{window.resolveFakeLyrics({song:fixture});await window.pendingLyrics;},songFixture);
  assert.equal(await page.evaluate(()=>GhostStudio.workspacePages.getSong()),null,'late responses cannot restore discarded lyrics');
  await page.evaluate(()=>GhostStudio.showView('lyrics'));
  assert.equal(await page.locator('#lyricsBrief').inputValue(),'');
  assert.equal(await page.locator('#lyricsResults').isVisible(),false);
  await page.locator('#lyricsBrief').fill('PAGEHIDE PRIVATE TEXT');
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  assert.equal(await page.locator('#lyricsBrief').inputValue(),'','pagehide clears before back-forward caching');
  await page.evaluate(fixture=>{GhostAI.writeLyrics=async()=>({song:fixture});},songFixture);
  await page.locator('#lyricsBrief').fill('A person leaves a spare key by the kitchen sink.');
  await page.evaluate(()=>GhostStudio.workspacePages.generate());
  assert.ok(await page.evaluate(()=>GhostStudio.workspacePages.getSong()?.lyrics),'fixture is rendered without real generation');
  assert.equal(await page.evaluate(()=>localStorage.getItem('ghost-lyrics-workspace-v1')),null,'generated text is not persisted');
  await page.evaluate(()=>GhostStudio.showView('dashboard'));
  assert.equal(await page.evaluate(()=>GhostStudio.workspacePages.getSong()),null);
  assert.equal(await page.locator('#lyricsFramework').inputValue(),'');
  assert.equal(await page.getByRole('button',{name:'Copy page text',exact:true}).count(),0);
  await page.getByRole('button',{name:'Search everything',exact:true}).click();
  await page.locator('#directorySearch').fill('de-esser');assert.ok(await page.locator('.directory-open').count()>0);
  await page.locator('.directory-open').filter({hasText:'Smart De-Esser Pro'}).first().click();
  assert.equal(await page.locator('#catalogSearch').inputValue(),'Smart De-Esser Pro');
  await page.getByRole('button',{name:'Search everything',exact:true}).click();await page.locator('#directorySearch').fill('zz-no-such-tool-9988');assert.equal(await page.locator('.directory-open').count(),0);
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();assert.equal(await page.locator('.directory-open').count(),24);
  await page.locator('.directory-star').first().click();assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('ghost-directory-favorites-v1')).length));
  assert.deepEqual(errors,[]);
  console.log('PASS: legacy purge, manual clear, route exit, pagehide, late response, no draft persistence, no copy-page button, mobile fit, search, navigation, empty results, favorites.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
