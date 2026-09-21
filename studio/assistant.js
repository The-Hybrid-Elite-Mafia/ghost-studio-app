/* Measured DAW actions. Only a direct user request can reach this executor. */
(function(root){
'use strict';
const A=root.GhostAudio;
function inferRole(name){const words=name.toLowerCase().replace(/[_\-.]/g,' ');if(/\b(vocal\w*|vox|voice|acapella|a cappella|lead vocal|bgv)\b/.test(words))return 'vocal';if(/\b(drums?|kick|snare|percussion|hats?)\b/.test(words))return 'drums';if(/\b(bass|808|sub)\b/.test(words))return 'bass';return 'instrument';}
function sourceSummary(tracks=[]){
 const audio=tracks.filter(t=>!t.midi&&!t.demo),midi=tracks.filter(t=>!!t.midi),demo=tracks.filter(t=>!t.midi&&t.demo);
 const label=[audio.length+' audio',midi.length+' MIDI',...(demo.length?[demo.length+' demo']:[])].join(' · ');
 let title='',detail='';
 if(!audio.length&&midi.length){title='MIDI only · original audio is not loaded';detail='MIDI plays instrument notes. Even a track named “Synth Voice” does not contain the recorded singer or words. Import the original song or vocal stems as WAV/MP3 to hear them.';}
 else if(audio.length&&midi.length){title='Audio and MIDI are loaded';detail='The MIDI instruments can play alongside your audio. Solo the song’s audio track to hear it on its own.';}
 else if(!audio.length&&demo.length){title='Sound check · demo instruments';detail='This sound check contains generated instruments, without sung vocals. Import your song or vocal stems to hear the original recording.';}
 return {audio,midi,demo,label,title,detail};
}
function isPlaybackQuestion(message){
 const text=message.toLowerCase().replace(/[’]/g,"'");
 if(/^\s*(apply|insert|add|create|build|set|mute|unmute|solo|unsolo|remove|reduce|repair|clean|export|download)\b/.test(text))return false;
 return /\b(vocals?|words|lyrics|singer|singing|actual song|original song|synth voice|sine|midi)\b/.test(text)&&(/\b(why|where|missing|not hearing|can't hear|cannot hear|can not hear|don't hear|do not hear|hear the|hear my)\b/.test(text)||/\bonly(?: hearing| hear| playing)? (?:the )?(?:midi|synth voice|sine)\b|\bno (?:recorded |sung )?(?:vocals?|words|lyrics|singing)\b/.test(text));
}
function playbackHelp(message,engine){
 if(!isPlaybackQuestion(message))return null;
 const s=sourceSummary(engine.tracks),lines=['This session has '+s.label+'.'];
 if(!s.audio.length){
  if(s.title)lines.push(s.title+'. '+s.detail);
  else lines.push('No song or stems are loaded. Use Import song / stems to select the original WAV/MP3 or vocal recordings.');
  if(s.midi.length)lines.push('Effects can process these instrument sounds, but cannot recover the original voice from MIDI notes. Import MIDI notes is for editable instrumental parts.');
 }else{
  for(const t of s.audio){const reasons=[];if(t.disabled)reasons.push('clip disabled');if(t.mute)reasons.push('muted');if(engine.tracks.some(x=>x.solo)&&!t.solo)reasons.push('excluded by another track’s Solo');lines.push(t.name+': '+(reasons.length?reasons.join(', '):'included in playback')+'.');}
  if(s.midi.length)lines.push(s.detail);
  lines.push('An audio filename or track role does not prove it contains singing. Solo the original song or vocal stem, return to its start and press Play. If the words are still missing, compare that source file outside the DAW.');
 }
 lines.push('No settings changed.');return lines.join('\n');
}
function intent(message){
 const text=message.toLowerCase().replace(/[’]/g,"'");
 if(/\b(don't|do not|never|not yet|without applying)\b.*\b(apply|insert|plugins?|effects?)\b/.test(text)||/\b(?:don't|do not|never|not)\s+(?:add|remove|reduce|repair|fix|apply|clean)\b/.test(text))return {kind:'decline'};
 const needed=/\b(needed|necessary|recommended|suggested|appropriate|right)\b.*\b(plugins?|effects?|processing)\b|\b(plugins?|effects?)\b.*\b(need\w*|recommend\w*|suggest\w*)\b/.test(text);
 const clean=/\b(clean(?: up)?|remove|reduce|repair|fix)\b.*\b(noise|hiss|static|artifacts?|crackl\w*|clicks?|music|audio|stems?|mix|it)\b/.test(text);
 const apply=/\b(apply|add|insert|use|put)\b/.test(text)&&(needed||/\b(them|those|suggestions|recommendations)\b/.test(text));
 const question=/^\s*(how|why|what|which|explain|tell me about)\b/.test(text)||/\b(suggest|recommend|show me)\b/.test(text)&&!apply;
 if(!needed&&!clean&&!apply)return null;
 const quoted=message.match(/[“"]([^”"]+)[”"]/),scope=/\b(selected|current|this stem|this track)\b/.test(text)?'selected':'all';
 return {kind:question?'suggest':'apply',scope,trackName:quoted?.[1]||null,clean:true};
}
function cleanChain(effects){
 const changes=[],chain=A.validateEffects(effects).filter(e=>!e.assistantKey);
 for(const e of chain){
  if(['saturation','doubler','plate','throw','delay'].includes(e.type)&&(e.enabled||e.automation.enabled?.enabled)){e.enabled=false;e.automation={};changes.push(A.TYPES[e.type].name+' bypassed');continue;}
  const zero=e.type==='masterrack'?['mu_tone','tape_inputDrive','tape_saturation','tape_bias','limit_inputDrive','limit_clipAmount']:e.type==='vocal73'?['saturation','toneMode','inputDrive']:e.type==='fet'?['presenceDrive','input']:e.type==='opto'?['warmth']:e.type==='varimu'?['tone','input']:e.type==='tape'?['saturation','bias','inputDrive']:e.type==='final'?['clipAmount','inputDrive']:[];
  let changed=false;for(const key of zero)if(e.params[key]||e.automation[key]){e.params[key]=0;delete e.automation[key];changed=true;}
  if(e.type==='deesser'&&(e.params.monitor||e.automation.monitor)){e.params.monitor=0;delete e.automation.monitor;changed=true;}
  if(changed){e.preset='Clean processing';changes.push(A.TYPES[e.type].name+' · harmonic drive / audition disabled');}
 }
 return {chain,changes};
}
function suggestions(track,measurement){
 const list=A.recommendations(track,measurement),repair=measurement.repair;
 if(repair?.noiseCandidate||repair?.impulses>0&&repair.impulses<Math.max(8,measurement.duration*40)){
  const e=A.newEffect('cleanup');e.enabled=true;e.params.mix=100;e.params.noiseReduction=repair.noiseCandidate?3:0;e.params.noiseFloor=repair.noiseFloorDb??-60;e.params.clickRepair=repair.impulses>0?100:0;e.preset='Measured cleanup';if(repair.profile)e.noiseProfile=repair.profile;
  list.unshift({key:'source-repair',title:'Stem Cleanup',reason:(repair.noiseCandidate?repair.reason+' Starting with 3 dB maximum noise reduction. ':'')+(repair.impulses?repair.impulses+' isolated sample outliers qualify for interpolation.':''),placement:'start',effects:[e]});
 }
 for(const r of list){r.key||=r.effects[0]?.type||'inspect';if(r.effects[0]?.type==='compressor'&&track.role!=='vocal'){r.effects=[];r.reason+=' No automatic compression for this stem role.';}}
 if(track.role==='vocal'&&measurement.spectral.high>35&&measurement.rmsDb>-60){const e=A.newEffect('deesser');Object.assign(e,{enabled:true,preset:'Measured gentle sibilance control'});Object.assign(e.params,{threshold:A.clamp(measurement.rmsDb+6,-40,-16),range:2,frequency:6500,mode:1,smoothness:75,airPreserve:0,monitor:0,mix:100});list.push({key:'sibilance',title:'Smart De-Esser Pro',reason:'Elevated vocal high-band energy supports auditioning at most 2 dB of sibilance reduction. This measurement cannot prove that consonants are harsh.',effects:[e]});}
 return list.filter(r=>r.title!=='Keep the source intact'||!list.some(x=>x.effects.length));
}
function targets(engine,selectedId,request){
 if(!engine.tracks.length)throw Error('Import your music first. I have no stems to measure or process.');
 let tracks;if(request.trackName){tracks=engine.tracks.filter(t=>t.name.toLowerCase()===request.trackName.toLowerCase());if(!tracks.length)throw Error('No track named “'+request.trackName+'” is loaded. Use its exact track name.');}
 else if(request.scope==='selected'){tracks=engine.tracks.filter(t=>t.id===selectedId);if(!tracks.length)throw Error('Select the stem you want me to process.');}
 else tracks=engine.tracks.filter(t=>!t.demo&&A.audible(t,engine.tracks));
 if(!tracks.length)throw Error('No audible imported stems are available. Import music, or unmute the stems you want me to process.');return tracks;
}
async function plan(engine,selectedId,request,onProgress=null){
 const tracks=targets(engine,selectedId,request),items=[];
 for(let i=0;i<tracks.length;i++){
  const track=tracks[i];onProgress?.('Measuring '+track.name+' · '+(i+1)+' / '+tracks.length);const measurement=track.analysis||await A.analyze(track),recommendations=suggestions(track,measurement),cleaned=cleanChain(track.effects),insert=[],notes=cleaned.changes.slice();
  for(const r of recommendations){if(!r.effects.length){notes.push(r.reason);continue;}
   for(const effect of r.effects){if(cleaned.chain.some(e=>e.type===effect.type&&(e.enabled||e.automation.enabled?.enabled))){notes.push(A.TYPES[effect.type].name+' already has an active insert; kept its controls.');continue;}effect.assistantKey=r.key;insert.push(effect);notes.push(A.TYPES[effect.type].name+' — '+r.reason);}
  }
  // Source repair and input headroom must precede dynamics and tone processors.
  insert.sort((a,b)=>({cleanup:0,gain:1,highpass:2,vocal73:3,deesser:4,compressor:5}[a.type]??6)-({cleanup:0,gain:1,highpass:2,vocal73:3,deesser:4,compressor:5}[b.type]??6));

  items.push({track,measurement,effects:A.validateEffects([...insert,...cleaned.chain]),notes,recommendations});
 }
 const master=cleanChain(engine.masterEffects);
 return {items,masterEffects:master.chain,masterDb:engine.masterDb,masterNotes:master.changes,scope:request.scope};
}
async function checkOutput(engine,plan,onProgress=null){
 const ctx=await engine.init(),tracks=engine.tracks.filter(t=>A.audible(t,engine.tracks)).map(t=>({...t,effects:plan.items.find(i=>i.track.id===t.id)?.effects||t.effects}));
 onProgress?.('Checking the processed mix for output clipping…');
 const duration=A.totalDuration(tracks,true,engine.bpm)+A.tail(plan.masterEffects,engine.bpm)+.05,buffer=await root.GhostRender.render({tracks,masterEffects:plan.masterEffects,sampleRate:ctx.sampleRate,definitions:A.TYPES,duration,bpm:engine.bpm,masterDb:engine.masterDb,createBuffer:(c,n,s)=>ctx.createBuffer(c,n,s),onProgress});
 let peak=0;for(let c=0;c<buffer.numberOfChannels;c++){const data=buffer.getChannelData(c);for(let i=0;i<data.length;i++){if(!Number.isFinite(data[i]))throw Error('The proposed mix produced invalid audio. No changes have been applied.');peak=Math.max(peak,Math.abs(data[i]));if(i%65536===0)await new Promise(resolve=>setTimeout(resolve,0));}}
 if(A.db(peak)>-1){const attenuation=-1-A.db(peak);if(engine.masterDb+attenuation<-60)throw Error('The mix needs more than 60 dB of attenuation. Reduce the existing gain stages first; no settings changed.');plan.masterDb=engine.masterDb+attenuation;plan.masterNotes.push('Master level reduced by '+(-attenuation).toFixed(2)+' dB to leave 1 dB of sample-peak headroom, without clipping or added drive');}
}
function describe(plan,applied=false){
 const lines=[(applied?'Applied clean processing to ':'Measured ')+plan.items.length+' stem'+(plan.items.length===1?'':'s')+'.'];
 for(const item of plan.items){lines.push('\n'+item.track.name+':');for(const note of item.notes)lines.push('• '+note);if(!item.notes.length)lines.push('• No measurement justified another effect.');}
 if(plan.masterNotes.length)lines.push('\nMaster bus: '+plan.masterNotes.join('; ')+'.');
 lines.push(applied?'\nOriginal source files are intact. Use Undo to reverse this operation. Press Play to hear the prepared audio.':'\nNo settings changed. Say “apply needed plugins” to apply the measured plan.');
 lines.push('Noise estimates and isolated-click repair cannot reconstruct source clipping or guarantee removal of every generated artifact.');return lines.join('\n');
}
async function apply(engine,plan,snapshot){
 // Preflight every rack before the single undoable mutation.
 for(const item of plan.items)A.validateEffects(item.effects);A.validateEffects(plan.masterEffects);
 const normalized=effects=>JSON.stringify(effects.map(({id,...e})=>e)),changed=plan.items.some(i=>normalized(i.track.effects)!==normalized(i.effects))||normalized(engine.masterEffects)!==normalized(plan.masterEffects)||Math.abs(engine.masterDb-plan.masterDb)>.00001;
 if(!changed){for(const i of plan.items)i.track.analysis=i.measurement;return 'Measurements do not justify further processing. I left your settings intact and did not stack duplicate plugins.';}
 snapshot();engine.pause();for(const i of plan.items){i.track.effects=i.effects;i.track.analysis=i.measurement;}engine.masterEffects=plan.masterEffects;engine.masterDb=plan.masterDb;engine.update();return describe(plan,true);
}
async function dispatch(message,{local,remote}){
 const text=message.trim().toLowerCase().replace(/[.!?]+$/,''),command=/^(play|start playback|pause|stop|analy[sz]e(?: stem| this)?|check (?:my|this) stem|(?:un)?mute(?: selected(?: stem| track)?)?|(?:un)?solo(?: selected(?: stem| track)?)?|(?:set )?(?:volume|gain)(?: to)? -?\d+(?:\.\d+)?\s*(?:db)?)$/.test(text),namedInsert=/^(insert|add)\b/.test(text)&&(text.includes('master rack pro')||Object.values(A.TYPES).some(d=>text.includes(d.name.toLowerCase())));
 if(root.GhostPluginCommands?.parse(message)||isPlaybackQuestion(message)||root.GhostIsStudioCommand?.(message)||intent(message)||command||namedInsert||!remote)return local(message);
 return remote(message);
}
root.GhostAssistant={intent,cleanChain,suggestions,targets,plan,describe,apply,checkOutput,dispatch,inferRole,sourceSummary,isPlaybackQuestion,playbackHelp};
})(typeof globalThis!=='undefined'?globalThis:this);
