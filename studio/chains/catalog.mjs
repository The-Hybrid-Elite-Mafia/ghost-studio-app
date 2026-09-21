import fs from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import core from '../chain-core.js';
import {readCatalogs} from './sources.mjs';
import {profiles as templates,sources} from './profiles.mjs';

export async function processorRuntime(root){
 const world={console,crypto:webcrypto};world.window=world;world.globalThis=world;vm.createContext(world);
 for(const name of ['packs.js','dsp.js','cleanup.js','audio-sources.js','render-core.js','pack-audio.js','audio.js','studio-core.js'])vm.runInContext(await fs.readFile(new URL(name,root),'utf8'),world,{filename:name});
 return world;
}
const short=(text,size=700)=>String(text||'').replace(/\s+/g,' ').trim().slice(0,size);
const route=(profile,label)=>({id:profile,label:label||templates[profile].label,profile});
const familyStarts={'House':'Electronic','Old School Hip-Hop':'Hip-Hop & Rap','Classic Rock':'Rock & Metal','Synth-Pop':'Pop','Classic R&B':'R&B & Soul','Trad Jazz':'Jazz','Baroque':'Classical & Orchestral','Afrobeats':'World & Folk','Classic Country':'Country & Americana'};
export function familyFor(text){
 const s=core.normalize(text);
 if(/\b(trap|rap|hip hop|drill|boom bap|grime|phonk|plugg)\b/.test(s))return 'Hip-Hop & Rap';
 if(/\b(metal|rock|punk|grunge|hardcore|screamo|djent|shoegaze)\b/.test(s))return 'Rock & Metal';
 if(/\b(classical|orchestra|baroque|opera|chamber|symphon|cinematic|score)\b/.test(s))return 'Classical & Orchestral';
 if(/\b(jazz|bebop|swing|bossa|fusion)\b/.test(s))return 'Jazz';
 if(/\b(country|americana|bluegrass|honky tonk|western)\b/.test(s))return 'Country & Americana';
 if(/\b(soul|r b|gospel|funk|motown|blues)\b/.test(s))return 'R&B & Soul';
 if(/\b(folk|afro\w*|reggae|dub|latin|flamenco|arabic|indian|qawwali|gamelan|traditional|world|celtic)\b/.test(s))return 'World & Folk';
 if(/\b(pop|ballad)\b/.test(s))return 'Pop';
 if(/\b(electro\w*|house|techno|edm|trance|dubstep|ambient|synth\w*|dnb|jungle|break\w*|idm|industrial|drone|digital)\b/.test(s))return 'Electronic';
 return 'Cross-genre';
}
export function vocalFor(name,register='',family=''){
 const s=core.normalize(name),r=core.normalize(register),f=core.normalize(family);
 if(/\b(choir|choral|ensemble|quartet|group harmony|stacked harmon)\b/.test(s))return 'vocal-ensemble';
 if(/\b(growl|scream|shriek|harsh|metal|hardcore|industrial|distorted|rage)\b/.test(s))return 'vocal-texture';
 if(/\b(rap|drill|grime|spoken|narrat\w*|mc|beatbox)\b/.test(s))return 'vocal-rap';
 if(/\b(qawwali|gamelan|raga|hindustani|carnatic|flamenco|maqam|throat singing|tuvan|yodel)\b/.test(s)||/\b(world|traditional)\b/.test(f))return 'vocal-tradition';
 if(/\b(opera|classical|jazz|folk|country|blues)\b/.test(s+' '+f))return 'vocal-natural';
 if(/\b(falsetto|soprano|countertenor|head voice)\b/.test(s+' '+r))return 'vocal-high';
 if(/\b(bass|baritone|contralto|profundo)\b/.test(s+' '+r))return 'vocal-low';
 if(/\b(pop|r b|soul|melodic|hook|belt)\b/.test(s+' '+f))return 'vocal-pop';
 return 'vocal-natural';
}
const instrumentGroups={
 'guitar-electric':['Gibson Les Paul','Fender Stratocaster','Fender Telecaster','PRS Custom'],
 'guitar-heavy':['Ibanez','Jackson'],
 'guitar-acoustic':['Martin D-28','Taylor 814','Yamaha Nylon Classical'],
 'bass-electric':['Fender Precision Bass','Fender Jazz Bass','Musicman Stingray','Warwick','Spector'],
 'drums-acoustic':['Ludwig Drums','Gretsch Drums','Tama Drums','Pearl Drums'],
 cymbals:['Zildjian Cymbals','Sabian Cymbals'],
 'keys-piano':['Steinway Grand Piano','Yamaha Grand Piano'],
 'keys-electric':['Hammond B3 Organ','Yamaha DX7'],
 'synth-lead':['Moog Synthesizer','Theremin'],
 'synth-pad':['Roland Juno','Mellotron'],
 woodwind:['Selmer Saxophone'],
 'strings-bowed':['Stradivarius Violin','Guarneri Violin','Fiddle'],
 'plucked-folk':['Banjo 5-String','Oud'],
 bagpipes:['Bagpipes'],'free-reed':['Harmonica'],
 'tradition-instrument':['Sitar'],
 'tuned-percussion':['Kalimba','Steelpan','Timpani','Vibraphone','Marimba','Xylophone']
};
export const instrumentProfiles=Object.fromEntries(Object.entries(instrumentGroups).flatMap(([profile,names])=>names.map(name=>[name,profile])));
function arrangementFor(family,name=''){
 if(/ambient|drone|space|cinematic|soundscape/i.test(name))return 'instrumental-space';
 if(family==='Rock & Metal')return 'instrumental-heavy';
 if(['Electronic','Hip-Hop & Rap','Pop'].includes(family))return 'instrumental-electronic';
 return 'instrumental-acoustic';
}
function routesFor(family,name='',includeVocal=true){
 const bus=arrangementFor(family,name),electronic=bus==='instrumental-electronic',heavy=bus==='instrumental-heavy';
 const list=[route(bus,'Instrumental mix'),route(electronic?'drums-electronic':'drums-acoustic','Drums and groove'),route(electronic?'bass-sub':'bass-electric','Bass')];
 if(heavy)list.push(route('guitar-heavy','Guitars'));else if(electronic)list.push(route('synth-lead','Lead or melody'),route('synth-pad','Pads and texture'));else if(family==='Classical & Orchestral')list.push(route('strings-bowed','Strings'),route('woodwind','Woodwinds'),route('brass','Brass'),route('keys-piano','Piano'));else list.push(route(family==='Jazz'?'keys-piano':'guitar-acoustic','Harmony instruments'));
 if(includeVocal)list.push(route(vocalFor(name,'',family),'Vocal lead'));
 list.push(route(electronic||heavy?'master-punch':'master-clean','Master and export'));return list;
}
function purposeFor(name,category){
 const s=core.normalize(name);
 if(category==='artifacts'||/artifact|repair|cleanup|eraser|purif|ghost voice|tail cleaner/.test(s))return 'repair';
 if(category==='mastering'||/master|bus finish/.test(s))return 'master-clean';
 if(/808|sub harmonic/.test(s))return 'bass-sub';
 if(/bass/.test(s))return 'bass-electric';
 if(/hat|cymbal/.test(s))return 'cymbals';
 if(/drum|snare|percussion/.test(s))return /folk|studio thump/.test(s)?'drums-acoustic':'drums-electronic';
 if(/fiddle|violin/.test(s))return 'strings-bowed';
 if(/banjo|mandolin/.test(s))return 'plucked-folk';
 if(/guitar|fingerpick/.test(s))return 'guitar-acoustic';
 if(/piano|keys/.test(s))return 'keys-piano';
 if(/vocal|voice|whisper|scream|rap|sibilance/.test(s)&&!['effects','processing'].includes(category))return vocalFor(name);
 if(/reverb|delay|room|shimmer|slap|throw|spatial|width|stereo|chorus|flang|phaser|tremolo|rotary/.test(s))return 'effect-space';
 if(/compress|dynamics|limit|transient|gate|expander/.test(s))return 'effect-dynamics';
 return 'effect-color';
}
const unsupportedNotes=[
 [/pitch|formant|vocoder|robotic|octave|harmoniz/i,'Pitch correction, formant shifting, vocoding and octave generation are not supplied by this chain. Record the intended part or prepare that effect in a tool that supports it.'],
 [/granular|stretch|shimmer|bitcrush|phaser|flanger|rotary|tremolo|vibrato/i,'This guide uses the studio’s available tone, dynamics and space processors. The named specialist synthesis or modulation effect needs a dedicated tool; the neutral chain does not emulate it.'],
 [/dither|linear phase|multiband compressor|phase inverter|expander|gate standard|transient shaper/i,'The named specialist processor is a reference concept. It is not implemented by the chain below. Use a tool with that exact capability when the job requires it.'],
 [/auto.pilot|sentient|set.and.forget|purif|eraser|ghost voice|perfection|reality|non.linear|coherence|formant|echo reduction|spectral glitch|wobble/i,'This reference describes a production goal, not an automatic repair guarantee. Keep the original and audition short passages; missing detail, unwanted voices and separation damage can require a better source.']
];
export async function buildChainCatalog(root){
 const [c,world]=await Promise.all([readCatalogs(root),processorRuntime(root)]);
 const processors=JSON.parse(JSON.stringify(world.GhostAudio.TYPES)),profiles=structuredClone(templates),entries=[],lookup={},coverage={};
 const add=(source,key,item)=>{
  const entry={id:source+'-'+core.id(key),...item,routes:item.routes.filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i)};
  if(entries.some(x=>x.id===entry.id))throw Error('Duplicate workflow ID '+entry.id);
  entries.push(entry);link(source,key,entry);return entry;
 };
 function link(source,key,entry){const lookupKey=source+'::'+key;if(lookup[lookupKey]&&lookup[lookupKey]!==entry.id)throw Error('Ambiguous workflow source '+lookupKey);lookup[lookupKey]=entry.id;(coverage[source]||=[]).push(String(key));}
 const addContext=(item,context)=>({...item,context:context.filter(x=>x[1]).map(([name,value])=>[name,short(Array.isArray(value)?value.join(' · '):value,900)])});
 const general=[
  ['studio-vocal','Professional Vocal Recording','Vocal','Record a consistent performance, edit the useful takes, then build the lead around the song.',[route('vocal-natural','Lead vocal'),route('vocal-ensemble','Doubles and harmonies'),route('master-clean','Master and export')]],
  ['home-vocal','Home Studio Vocal Chain','Vocal','Use the quietest practical recording position, a repeatable mic distance and a short test before the complete take.',[route('capture','Recording input'),route('vocal-natural','Lead vocal'),route('master-clean','Master and export')]],
  ['ai-production','AI-Assisted Production Workflow','Production','Define the composition and arrangement, generate or import the source, audition it, and keep only usable performances. Separate stems only in a tool that supports it.',[route('repair','Inspect and repair'),...routesFor('Pop')]],
  ['hiphop-production','Hip-Hop Beat Making Workflow','Hip-Hop & Rap','Choose the pulse, program a short groove, tune the bass to the composition, then build sections and space for the vocal.',routesFor('Hip-Hop & Rap','Hip-Hop rap')],
  ['instrumental-production','Instrumental Production Workflow','Instrumental','Choose the lead instrument, rhythmic role and arrangement arc before adding processing. Make the melody carry the story without a vocal.',[route('instrumental-acoustic','Acoustic mix'),route('instrumental-electronic','Electronic mix'),route('instrumental-heavy','Rock / metal mix'),route('instrumental-space','Ambient / cinematic mix'),route('master-clean','Master and export')]],
  ['mix-export','Mix, Stems and Final Export','Mastering','Finish the source balance before the master bus. Export aligned stems for collaboration and a separate finished stereo mix.',[route('master-clean','Transparent master'),route('master-punch','Dense master')]]
 ];
 for(const [key,label,family,brief,routes] of general)add('general',key,{label,kind:'General workflow',family,brief,routes,workflow:key==='ai-production'?[['Inspect the source','Listen for warble, clicks, doubled voices and broken tails. Regenerate, replace or rerecord failures that repair cannot solve. Keep the original generation and align all stems before mixing.']]:key==='mix-export'?[['Choose the export','The studio’s aligned stems include track processing, fader and pan but exclude the master bus. Check tails and start times. This studio does not add export dither; if reducing bit depth and dither is required, apply it once in a tool that provides it.']]:[]});
 const genreGroups=[...c.GENRES,...Object.entries(c.va).map(([f,g])=>({f,g}))];
 const families=new Map();for(const group of genreGroups)for(const name of group.g)if(!families.has(core.normalize(name)))families.set(core.normalize(name),group.f);
 const genreEntries=new Map();let family='Electronic';
 for(const [name,prompt] of Object.entries(c.TA)){
  family=familyStarts[name]||family;const f=families.get(core.normalize(name))||family;
  const entry=add('genre',name,{label:name,kind:'Genre / subgenre',family:f,brief:'Build a '+name+' arrangement from the catalog direction below. Treat tempo and tone suggestions as a creative starting point, then adapt them to the song.',context:[['Style direction',prompt]],workflow:[['Establish the style','Use the listed groove, timbres and energy to choose the source parts. Verify the intended pulse and any half-time feel before programming drums or delays.'],['Arrange the roles','Sketch a short section, then separate the bass, rhythmic layer and lead. For an instrumental version, give the lead melody the space normally occupied by the singer.']],routes:routesFor(f,name),notes:'These are adaptable source and bus chains. A genre name does not determine a fixed EQ frequency, compressor threshold or loudness target.'});genreEntries.set(core.normalize(name),entry);
 }
 for(const group of genreGroups)for(const name of group.g){let entry=genreEntries.get(core.normalize(name));if(!entry){entry=add('genre',name,{label:name,kind:'Genre / subgenre',family:group.f,brief:'Choose a '+name+' reference and identify its groove, arrangement and source roles before building your version.',routes:routesFor(group.f,name)});genreEntries.set(core.normalize(name),entry);}if(!lookup['genre::'+name])link('genre',name,entry);}
 const signatureProfiles={Banjo:'plucked-folk',Bagpipes:'bagpipes',Violin:'strings-bowed',Guitar:'guitar-electric',Drums:'drums-electronic',Harmonica:'free-reed'};
 for(const [instrument,genres] of Object.entries(c.Vv))for(const [genre,direction] of Object.entries(genres)){
  if(!signatureProfiles[instrument])throw Error('Signature instrument needs a workflow: '+instrument);
  add('signature',instrument+':'+genre,{label:instrument+' · '+genre,kind:'Instrument / genre',family:genre,brief:'Build the '+instrument.toLowerCase()+' part around the '+genre.toLowerCase()+' arrangement. Preserve its identifying articulation while making space for the rhythm section and vocal.',context:[['Creative direction',direction.sunoPrompt]],routes:[route(signatureProfiles[instrument],instrument+' channel'),...routesFor(familyFor(genre),genre)],notes:'The original prompt describes a creative direction. Choose EQ bands from the actual source. This studio does not create an external kick sidechain; use volume automation for deliberate ducking, or a host with that routing.'});
 }
 for(const voice of [...c.mn,...c.mj])add('vocal',voice.id,addContext({label:voice.name,kind:'Vocal profile',family:voice.genreFamily,brief:voice.shortDescription,routes:[route(vocalFor(voice.name,voice.technicalSpecs.register+' '+voice.technicalSpecs.voiceRange,voice.genreFamily),'Lead vocal'),route('vocal-ensemble','Backing vocals'),route('master-clean','Master and export')],workflow:[['Direct the performance',voice.characteristics.join('. ')+'. Preserve the listed ornaments and phrase shape while recording.']]},Object.entries(voice.technicalSpecs)));
 for(const group of c.VOCALS)for(const voice of group.vocals)add('voice',voice.n,addContext({label:voice.n,kind:'Vocal profile',family:group.reg,brief:voice.d,routes:[route(vocalFor(voice.n,voice.sp.register+' '+voice.sp.voiceRange),'Lead vocal'),route('vocal-ensemble','Backing vocals')],workflow:[['Shape the delivery',voice.ch.join('. ')+'.']]},[['Pairs with',voice.pairs],...Object.entries(voice.sp)]));
 for(const group of c.BEATS)for(const beat of group.beats){const f=familyFor(beat.tags);add('beat',beat.n,{label:beat.n,kind:'Beat / groove',family:f,brief:'Build the '+beat.n+' groove, then balance its drum and bass roles before adding melodic layers.',context:[['Tempo direction',beat.bpm+' BPM'],['Rhythm direction',beat.rhy],['Feel',beat.feel],['Pairs with',beat.tags]],routes:routesFor(f,beat.n,false),workflow:[['Program and audition','Use the rhythm direction as a reference pattern. Set accents and swing by listening, then check a full bar cycle and its transition into the next section.']]});}
 for(const [name,beat] of Object.entries(c.wl))add('beat-builder',name,{label:name,kind:'Beat / groove',family:familyFor(beat.family),brief:'Choose complementary sounds for '+name.toLowerCase()+', establish the groove and tune any pitched bass.',context:[['Style family',beat.family],['Tempo direction',beat.bpmHint]],routes:routesFor(familyFor(beat.family),name,false)});
 for(const [name,voice] of Object.entries(c.ba))add('voice-builder',name,{label:name,kind:/instrumental/i.test(name)?'Instrumental':'Vocal profile',family:voice.register,brief:/instrumental/i.test(name)?'Arrange the lead melody and supporting instruments without a vocal part.':'Record or choose the intended '+voice.delivery.toLowerCase()+' delivery and compare quiet and loud phrases before processing.',context:[['Register',voice.register],['Delivery',voice.delivery]],routes:/instrumental/i.test(name)?routesFor('Cross-genre',name,false):[route(vocalFor(name,voice.register),'Lead vocal'),route('vocal-ensemble','Backing vocals')]});
 for(const preset of c.PRESETS){const f=familyFor(preset.style);add('preset',preset.id,{label:preset.name,kind:'Production preset',family:f,brief:'Build the musical direction in this preset, then work through the source and bus chains that fit your actual arrangement.',context:[['Style direction',preset.style],['Tempo direction',preset.bpm+' BPM'],['Arrangement notes',preset.notes]],routes:routesFor(f,preset.style),notes:'The original preset remains available in the builder. Its named effect settings are creative references; this chain starts neutral.'});}
 const allData={...c.allData,...c.added.categories};
 for(const [category,items] of Object.entries(allData))for(const item of items){
  let profile=category==='instruments'?instrumentProfiles[item.name]:['vocals','vocalProfiles','industrialVocals'].includes(category)?(/artifact|surgeon/i.test(item.name)?'repair':vocalFor(item.name)):purposeFor(item.name,category);
  if(!profile)throw Error('Instrument has no explicit chain: '+item.name);
  const kind=category==='instruments'?'Instrument':['vocals','vocalProfiles','industrialVocals'].includes(category)?'Vocal reference':category==='artifacts'?'Repair reference':category==='mastering'?'Mastering reference':'Production reference';
  const first=short(item.p.split('\n')[0],550),f=category==='instruments'?templates[profile].label:familyFor(item.name);
  add('encyclopedia',category+':'+item.n,{label:item.name,kind,family:f,aliases:item.aliases||[],brief:'Use '+item.name+' as the source or production goal. '+(category==='instruments'?first:'Audition the actual sound and choose only the stages needed for this goal.'),routes:[route(profile,'Source / task chain'),...(!profile.startsWith('master-')?[route('master-clean','Master and export')]:[])],context:category==='instruments'?[['Source character',first]]:[],notes:[...(unsupportedNotes.filter(([test])=>test.test(item.name)).map(([,note])=>note)),kind.includes('reference')?'The original prompt is a reference description. The chain below uses processors available in this studio; named third-party products or proposed plugin features are not installed by opening it.':'Named instruments describe source sounds; this chain processes audio and does not synthesize that instrument.'].join(' ')});
 }
 for(const plugin of c.PLUGINS){const profile=purposeFor(plugin.n+' '+plugin.cat,'tools');add('tool',plugin.n,{label:plugin.n,kind:'Tool reference',family:plugin.cat,brief:'Prepare the source in the named tool when needed, then use this studio for the supported processing steps.',context:[['Production role',plugin.use]],routes:[route(profile,'Studio processing'),route('master-clean','Master and export')].filter((r,i,a)=>a.findIndex(x=>x.id===r.id)===i),notes:'This is a workflow connection, not an installation or emulation of the named external tool. Check that tool’s current capabilities and export its audio before continuing here.'});}
 for(const [type,def] of Object.entries(processors)){
  profiles['processor-'+type]={id:'processor-'+type,label:def.name,target:['mastereq','glue','varimu','passive','tape','imager','dynamic','final','masterrack'].includes(type)?'master':'selected',capture:'Choose the source or bus, keep an untouched copy, and compare its loud and quiet sections.',goal:short(def.description)||'Use '+def.name+' only for a defined processing task.',finish:'Match the output level to bypass before deciding. Recheck in the complete arrangement.',stages:[{type,why:short(def.description)||'Adjust '+def.name+' for the source.',check:'Start bypassed with the actual neutral defaults shown below. Enable the processor only while auditioning; use its documented controls and valid ranges.'}]};
  const recommended=type==='cleanup'?'repair':['deesser','vocal73','fet','opto','vocalair','doubler','plate','throw'].includes(type)?'vocal-natural':profiles['processor-'+type].target==='master'?'master-clean':purposeFor(def.name,'processing');
  add('processor',type,{label:def.name,kind:'Studio processor',family:def.pack||'Custom modules',brief:short(def.description)||'Use '+def.name+' within a defined signal path.',routes:[{id:'module',label:'Individual module',profile:'processor-'+type},route(recommended,'Complete example chain')],notes:'Controls and neutral defaults below come from the installed processor definition. Legacy module edits take effect when playback restarts.'});
 }
 const referenceTypes=['vocal73','deesser','fet','opto','vocalair','doubler','plate','throw','mastereq','glue','varimu','passive','tape','imager','dynamic','final'];
 [...c.Gv,...c.Wv].forEach((item,index)=>{const entry=core.fromSource({entries,lookup},'processor',referenceTypes[index]);if(core.normalize(processors[referenceTypes[index]].name)!==core.normalize(item.name))throw Error('Plugin reference mapping changed: '+item.name);link('plugin-reference',item.name,entry);});
 for(const [collection,kind] of [['hA','Artist reference'],['mA','Producer reference'],['pA','Engineer reference'],['fA','Microphone reference'],['gA','Interface reference'],['_v','Equipment reference']])for(const item of c[collection]){
  const equipment=['fA','gA','_v'].includes(collection),f=familyFor(item.genre||item.specialty||''),captureRoutes=[route('capture','Recording input'),route('vocal-natural','Vocal recording'),route('guitar-acoustic','Acoustic source'),route('master-clean','Master and export')];
  const entry=add('reference',item.id,{label:item.name,kind,family:equipment?'Recording':f,brief:equipment?'Choose the appropriate input and capture a short test before adding a source-specific chain.':'Use the associated musical style as an arrangement reference, then build your own source and bus chains.',context:item.genre?[['Style direction',item.genre]]:[],routes:equipment?captureRoutes:routesFor(f,item.genre||''),notes:equipment?'This guide does not model the named hardware. Match connections, power requirements and operating levels to its manual.':'These are adaptable studio workflows, not verified personal settings or an endorsement by the named artist, producer or engineer.'});link('reference-name',item.name,entry);
 }
 for(const artist of c.artists.artists){const f=familyFor(artist.genre);add('artist-chain',artist.id,{label:artist.artist,kind:'Hybrid effects profile',family:f,brief:'Build the '+artist.genre+' direction with the existing multi-channel reference, then adapt these supported studio chains to your audio.',context:[['Style direction',artist.genre],['Creative direction',short(artist.sunoPrompt,800)]],routes:routesFor(f,artist.genre),notes:'The detailed reference remains in Lyrics Creator. The chains here use this studio’s processors and do not emulate the named third-party products in that reference.'});}
 const patchProfiles={'Pure sine':'synth-lead','Soft keys':'keys-electric','Round bass':'bass-sub','Slow pad':'synth-pad','Glass pluck':'tuned-percussion'};
 for(const name of Object.keys(world.GhostCompose.patches)){if(!patchProfiles[name])throw Error('New synth patch needs a workflow: '+name);add('synth',name,{label:name,kind:'Local synth',family:'Electronic',brief:'Write the notes, velocities and envelope for the '+name.toLowerCase()+' patch before adding track effects.',routes:[route(patchProfiles[name],'Synth channel'),route('instrumental-electronic','Instrumental mix'),route('master-clean','Master and export')],notes:'This opens an effects draft. Select and apply the instrument patch in the MIDI editor separately.'});}
 const data={version:1,entries,lookup,profiles,processors,sources,coverage:Object.fromEntries(Object.entries(coverage).map(([key,values])=>[key,[...new Set(values)]]))};validateCatalog(data);return data;
}
export function validateCatalog(data){
 const ids=new Set();for(const entry of data.entries){if(ids.has(entry.id))throw Error('Duplicate entry '+entry.id);ids.add(entry.id);if(!entry.label||!entry.brief||!entry.routes.length)throw Error('Incomplete workflow '+entry.id);const routes=new Set();for(const r of entry.routes){if(routes.has(r.id))throw Error('Duplicate chain '+entry.id);routes.add(r.id);if(!data.profiles[r.profile])throw Error('Missing recipe '+r.profile);}}
 for(const profile of Object.values(data.profiles)){if(!['selected','master'].includes(profile.target)||!profile.stages.length)throw Error('Invalid recipe '+profile.id);for(const s of profile.stages)if(!data.processors[s.type]||!s.why||!s.check)throw Error('Unsupported recipe stage '+profile.id);}
 for(const [key,value] of Object.entries(data.lookup))if(!ids.has(value))throw Error('Broken source link '+key);
 return data;
}
