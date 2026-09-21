/* Direct plugin commands run locally; model replies never authorize mutations. */
(function(root){
'use strict';
const A=root.GhostAudio;
const normalize=s=>s.toLowerCase().replace(/[–—−]/g,'-').replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
function parse(message){
 let text=normalize(message).replace(/[.!?]+$/,'');
 text=text.replace(/^(?:hey )?ghost[, ]+/,'').replace(/^(?:can|could|would|will) you (?:please )?/,'').replace(/^please /,'');
 if(/^(?:don't|do not|never)\b/.test(text))return null;
 const match=text.match(/^(apply|insert|add|use|put|enable|activate|turn on|bypass|disable|turn off|remove)\s+(.+)$/);
 if(!match)return null;
 let spec=match[2].replace(/^(?:an?|the) /,'').replace(/\s+please$/,'');
 if(/^(?:needed|necessary|recommended|suggested|appropriate|right)\b/.test(spec)||/^(?:them|those|suggestions|recommendations)\b/.test(spec))return null;
 const target=spec.match(/\s+(?:to|on|onto|from|in)\s+(.+)$/);
 if(target)spec=spec.slice(0,target.index).trim();
 const preset=spec.match(/\s+(?:with|using)\s+(?:the )?(.+?)(?: preset)?$/);
 if(preset)spec=spec.slice(0,preset.index).trim();
 spec=spec.replace(/^(?:plugin|effect)\s+/,'').replace(/\s+(?:plugin|effect)$/,'').replace(/^["“]|["”]$/g,'');
 const aliases={'de-esser':'deesser','de esser':'deesser','deesser':'deesser','de-essing':'deesser','compressor':'compressor','compression':'compressor','eq':'peaking','equalizer':'peaking','reverb':'plate','delay':'throw','echo':'throw','limiter':'final','master rack pro':'masterrack','noise reduction':'cleanup','denoiser':'cleanup','saturation':'saturation'};
 const type=aliases[spec]||Object.keys(A.TYPES).find(type=>normalize(A.TYPES[type].name)===spec||type===spec);
 // Leave composition and generic measured cleanup to their existing executors.
 if(!type&&!/\b(plugin|effect)\b/.test(match[2]))return null;
 return {type,requested:spec,action:match[1],target:target?.[1]||'selected',preset:preset?.[1]?.replace(/^["“]|["”]$/g,'')||null};
}
function destination(engine,selectedId,request){
 const name=request.target.replace(/^(?:the|my) /,'').replace(/^["“]|["”]$/g,'');
 if(/^(master|master bus|master output)$/.test(name))return {name:'master bus',effects:engine.masterEffects};
 if(/^(?:all (?:tracks|stems))$/.test(name))throw Error('Name one track or select it before applying this plugin.');
 const matches=/^(selected|current|this)(?: (?:track|stem|song))?$/.test(name)||name==='it'?engine.tracks.filter(t=>t.id===selectedId):engine.tracks.filter(t=>normalize(t.name)===name);
 if(matches.length!==1)throw Error(matches.length?'More than one track has that name. Select the destination track.':'Track not found. Select your song or use its exact name.');
 return matches[0];
}
async function execute(message,{engine,selectedId,snapshot}){
 const request=parse(message);if(!request)return null;
 if(!request.type)throw Error('That plugin is not available in this DAW. No changes made.');
 const target=destination(engine,selectedId,request),existing=target.effects.filter(e=>e.type===request.type);
 const removing=request.action==='remove',bypass=/^(bypass|disable|turn off)$/.test(request.action);
 if((removing||bypass)&&!existing.length)throw Error(A.TYPES[request.type].name+' is not on '+target.name+'.');
 let effect=existing[0]?A.validateEffects([existing[0]])[0]:A.newEffect(request.type),neutral=false;
 if(!removing&&!bypass){
  if(request.preset){const preset=A.TYPES[effect.type].factory?.find(p=>normalize(p.name)===request.preset);if(!preset)throw Error('That preset is not available for '+A.TYPES[effect.type].name+'. No changes made.');effect.params={...preset.params};effect.preset=preset.name;effect.automation={};}
  else if(!existing.length||effect.preset==='Zero / Neutral'){
   // Begin at neutral. Only requested dynamics get measurement-based thresholds.
   if(['deesser','compressor'].includes(effect.type)){
    if(!target.buffer)throw Error('Select an audio track so I can measure it for this plugin.');
    const measurement=target.analysis||await A.analyze(target);
    if(!Number.isFinite(measurement.rmsDb))throw Error('Could not measure this track. No changes made.');
    if(effect.type==='deesser')Object.assign(effect.params,{threshold:A.clamp(measurement.rmsDb-6,-60,-16),frequency:6500,range:2,mode:1,smoothness:75,mix:100,monitor:0});
    else Object.assign(effect.params,{threshold:A.clamp(measurement.rmsDb+6,-60,-6),ratio:2,attack:20,release:160,knee:6});
    effect.preset='Measured starting point';
   }else neutral=true;
  }
  effect.enabled=true;if(effect.automation.enabled)effect.automation.enabled.enabled=false;
 }else if(bypass){effect.enabled=false;if(effect.automation.enabled)effect.automation.enabled.enabled=false;}
 const before=target.effects.slice();
 snapshot();
 if(removing)target.effects.splice(0,target.effects.length,...target.effects.filter(e=>e.type!==request.type));
 else if(existing.length)target.effects.splice(target.effects.indexOf(existing[0]),1,effect);
 else target.effects.push(effect);
 try{await engine.rebuild();if(engine.playing||engine.rendering)await engine.settleEffects();}
 catch(error){target.effects.splice(0,target.effects.length,...before);await engine.rebuild();throw Error('Could not apply the plugin; previous settings restored. '+error.message);}
 const name=A.TYPES[request.type].name;
 return 'Done—'+name+(removing?' removed from ':bypass?' bypassed on ':' applied to ')+target.name+'.'+(neutral?' Enabled at neutral settings; no tone change yet.':!engine.playing&&!removing&&!bypass?' Ready for playback.':'');
}
root.GhostPluginCommands={parse,execute};
})(globalThis);
