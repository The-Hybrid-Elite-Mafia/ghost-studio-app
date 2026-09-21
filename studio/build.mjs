import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import { fileURLToPath } from 'node:url';
import {buildChainCatalog} from './chains/catalog.mjs';
import {enhanceHem} from './chains/integrate.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const get=name=>fs.readFile(path.join(root,name),'utf8');
const [head,body,css,audio,avatar,app,packs,dsp,worklet,bridge,packUI,renderCore,cleanup,assistant,aiClient,compose,studioUI,art,publishArt]=await Promise.all([get('head.html'),get('body.html'),get('style.css'),get('audio.js'),get('avatar.js'),get('app.js'),get('packs.js'),get('dsp.js'),get('worklet.js'),get('pack-audio.js'),get('pack-ui.js'),get('render-core.js'),get('cleanup.js'),get('assistant.js'),get('ai-client.js'),get('studio-core.js'),get('studio-ui.js'),fs.readFile(path.join(root,'ghost-reference.webp')),fs.readFile(path.join(root,'ghost-reference-publish.webp'))]);
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
const copyUI=await get('copy-ui.js');
const referenceLayout=await get('reference-layout.js');
const [chainData,chainCore,chainUI,chainCSS,chainBridge]=await Promise.all([buildChainCatalog(new URL('./',import.meta.url)),get('chain-core.js'),get('chain-ui.js'),get('chain-ui.css'),get('chain-bridge.js')]);
const chains=chainCore+'\nwindow.GhostChainData='+JSON.stringify(chainData)+';\n'+chainUI;
const blueprint=await get('lyrics-blueprint.js');
const effectsLibrary='window.GhostEffectsData='+JSON.stringify(JSON.parse(await get('artists-effects-chains.json')))+';\n'+await get('effects-reference-migration.js')+'\n'+await get('effects-library.js');
const [extraBody,extraCSS,lyricsCore,pagesUI,hemPage,encyclopediaPage]=await Promise.all(['pages.html','pages.css','lyrics-core.js','pages-ui.js','pages/hem-atm.html','pages/plugin-encyclopedia.html'].map(get));
const [dialTheme,genieScript,genieArt,tabletTheme,tabletShadow]=await Promise.all([get('dial-theme.css'),get('genre-genies.js'),fs.readFile(path.join(root,'genre-genies.webp')),get('tablet-theme.css'),get('tablet-shadow.css')]);
const [creativeBrand,brandLogo,brandHeader]=await Promise.all([get('creative-brand.css'),fs.readFile(path.join(root,'../public/branding/hem-creative-studio-logo.webp')),fs.readFile(path.join(root,'../public/branding/hem-creative-studio-header.webp'))]);
const brandAssets=new Map([
 ['branding/hem-creative-studio-logo.webp','data:image/webp;base64,'+brandLogo.toString('base64')],
 ['branding/hem-creative-studio-header.webp','data:image/webp;base64,'+brandHeader.toString('base64')]
]);
const embedBrandAssets=html=>{for(const [name,data] of brandAssets)html=html.replaceAll(name,data);return html;};
const brandAssetCSS=':root,:host{--hem-header-art:url("'+brandAssets.get('branding/hem-creative-studio-header.webp')+'")}';
const genieCSS=':root{--ghost-genie-sheet:url(data:image/webp;base64,'+genieArt.toString('base64')+')}';
const dashboardCSS=await get('dashboard.css'),dashboardBody=(await get('dashboard.html')).replace('<!-- CONSOLE_STAGE -->',await get('console-stage.html')),dashboardJS=await get('dashboard.js');
const consoleStage=await get('console-stage.js'),consoleCSS=(await get('console-stage.css'))+'\n'+(await get('unified-console.css'));
const hologram=await get('hologram.css'),directory=await get('directory.js');
const fullCSS=css+'\n'+extraCSS+'\n'+dialTheme+'\n'+tabletTheme+'\n'+creativeBrand+'\n'+genieCSS+'\n'+brandAssetCSS+'\n'+chainCSS+'\n'+dashboardCSS+'\n'+hologram+'\n'+consoleCSS;
function themedReference(html,kind){
 html=embedBrandAssets(html);
 if(kind==='encyclopedia'){
  html=html.replace('/* ARENA_REFERENCE_DATA */','const referencePack='+JSON.stringify(JSON.parse(arenaReferences))+';\nObject.assign(allData,referencePack.categories);');
 }
 if(kind==='hem'){
  html=enhanceHem(html);
  const marker='st.textContent=css;sh.appendChild(st);';
  if(!html.includes(marker))throw new Error('The HEM Studio shadow theme insertion point is missing.');
  html=html.replace(marker,'st.textContent=css+"\\n"+'+JSON.stringify(tabletShadow+'\n'+brandAssetCSS+'\n'+chainCSS+'\n'+hologram+'\n'+consoleCSS)+';sh.appendChild(st);');
 }
 return html.replace('<html ', '<html data-ghost-theme="tablets" ')
  .replace(/class="dark"/, 'class="dark ghost-reference-page ghost-hem"')
  .replace('<html data-ghost-theme="tablets" lang="en">','<html data-ghost-theme="tablets" lang="en" class="ghost-reference-page ghost-encyclopedia">')
  .replace('</head>','<link rel="icon" type="image/webp" href="'+brandAssets.get('branding/hem-creative-studio-logo.webp')+'"><style>'+dialTheme+'\n'+tabletTheme+'\n'+creativeBrand+'\n'+genieCSS+'\n'+brandAssetCSS+'\n'+chainCSS+'\n'+hologram+'\n'+consoleCSS+'</style><script>'+safeScript(chainBridge)+'</script></head>')
  .replace('</body>','<script>'+safeScript(genieScript)+'\n'+safeScript(copyUI)+'\n'+safeScript(referenceLayout)+'</script></body>');
}
const licenseNotice='<!-- Bundled dependency notices:\n'+(await get('THIRD-PARTY-NOTICES.txt')).replace(/-->/g,'-- >')+'\n-->';
const arenaReferences=await get('arena-production-references.json');
const importedPages='window.GhostImportedPages='+JSON.stringify({'hem-atm':themedReference(hemPage,'hem'),encyclopedia:themedReference(encyclopediaPage,'encyclopedia')})+';';
const cloudConnection=await get('cloud-connection.js');
const pluginCommands=await get('plugin-commands.js');
const audioSources=await get('audio-sources.js');
const presetGuidance=await get('preset-guidance.js');
const workletSource=[packs,dsp,worklet].join('\n');
await fs.writeFile(path.join(root,'ghost-worklet-bundle.js'),workletSource);
const pageBody=embedBrandAssets(body.replace('<!-- GHOST_EXTRA_PAGES -->',extraBody).replace('<!-- GHOST_DASHBOARD -->',dashboardBody)).replaceAll('src="ghost-reference.webp"','src="data:image/webp;base64,'+art.toString('base64')+'"')+'\n<script>\n'+[packs,dsp,cleanup,compose,audioSources,renderCore,'window.GhostBuild="connected-workflows-1";window.GhostWorkletSource='+JSON.stringify(workletSource)+';',bridge,presetGuidance,audio,chains,assistant,pluginCommands,lyricsCore,blueprint,effectsLibrary,aiClient,cloudConnection,avatar,packUI,studioUI,importedPages,pagesUI,dashboardJS,app,genieScript,directory,consoleStage].map(safeScript).join('\n')+'\n</script>';
const html='<!doctype html>\n<html lang="en"><head>\n'+embedBrandAssets(head)+'\n'+licenseNotice+'\n<style>\n'+fullCSS+'\n</style></head><body>\n'+pageBody+'\n<script>'+safeScript(copyUI)+'</script>\n</body></html>';
await fs.writeFile(path.join(root,'index.html'),html);
console.log('Built the complete hosted Ghost DAW.');
console.log('Connected '+chainData.entries.length+' workflow entries to '+Object.keys(chainData.profiles).length+' supported chain templates.');

const packDefs=createRequire(import.meta.url)('./packs.js');
createRequire(import.meta.url)('./preset-guidance.js');
globalThis.GhostPresetGuidance.attach(packDefs.definitions);
for(const [type,def] of Object.entries(packDefs.definitions)){
 if(def.factory.length<5)throw Error(type+' requires at least five opt-in presets.');
 for(const [key,range] of Object.entries(def.params)){
  if((range[3]==='dB'||range[3]==='%'||range[3]==='% change')&&range[2]!==0)throw Error(type+'.'+key+' must default to 0.0');
 }
}
await fs.mkdir(path.join(root,'plugin-pack'),{recursive:true});
const catalog=[];
for(const [type,def] of Object.entries(packDefs.definitions)){
 const effect={id:'ghost-factory-'+type,type,enabled:false,preset:'Zero / Neutral',params:packDefs.defaults(type),automation:{},midi:{}};
 const name=def.name.replace(/[^a-zA-Z0-9 -]/g,'').replace(/ +/g,'-');
 await fs.writeFile(path.join(root,'plugin-pack',name+'.ghostplugin.json'),JSON.stringify({format:'ghost-plugin',version:1,name:def.name,effects:[effect]},null,2));
 catalog.push({...def,zeroDefault:effect});
}
await fs.writeFile(path.join(root,'plugin-pack','Ghost-plugin-catalog.json'),JSON.stringify({format:'ghost-plugin-catalog',version:1,defaultPolicy:'zero-neutral-bypassed',plugins:catalog},null,2));
console.log('Built zero-default plugin settings and the preset catalog.');

await import('./manual-build.mjs');

await import('../scripts/build-forge.mjs');
