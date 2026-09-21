const small=(value,n=200)=>typeof value==='string'?value.slice(0,n):'';
const finite=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
const fields=(obj,keys)=>Object.fromEntries(keys.filter(k=>typeof obj?.[k]==='boolean'||typeof obj?.[k]==='string'||finite(obj?.[k])!==null).map(k=>[k,typeof obj[k]==='string'?obj[k].slice(0,180):obj[k]]));
function effects(list){return (Array.isArray(list)?list:[]).filter(e=>e&&typeof e==='object').slice(0,12).map(e=>({type:small(e.type,50),enabled:e.enabled===true,params:fields(e.params,Object.keys(e.params||{}).slice(0,100))}));}
export function compactContext(c={}){
 c=c&&typeof c==='object'?c:{};
 const tracks=(Array.isArray(c.tracks)?c.tracks:[]).filter(t=>t&&typeof t==='object').slice(0,24),chosen=tracks.find(t=>t.id===c.selectedTrackId);
 return {session:fields(c,['name','bpm','position','playing','masterDb','selectedTrackId']),
  tracks:tracks.map(t=>({...fields(t,['id','name','role','mute','solo','disabled','gainDb','pan','start','trimStart','trimEnd','duration']),source:t.midi?'MIDI instrument':t.demo?'demo':'audio',measurements:fields(t.measurements,['peakDb','rmsDb','crestDb','dcDb','channels','correlation','clippedSamples']),spectral:fields(t.measurements?.spectral,['sub','low','lowMid','mid','highMid','high']),inserts:effects(t.effects)})),
  selectedTrack:chosen?{id:chosen.id,measurements:fields(chosen.measurements,['peakDb','rmsDb','crestDb','dcDb','correlation','clippedSamples']),repair:fields(chosen.measurements?.repair,['noiseCandidate','noiseFloorDb','impulses','reason'])}:null,
  masterEffects:effects(c.masterEffects),outputEstimates:fields(c.outputEstimates,['lufs','truePeak','peak','peakHold','maxTP','rms','correlation']),
  pluginCatalog:(Array.isArray(c.pluginCatalog)?c.pluginCatalog:[]).filter(d=>d&&typeof d==='object').slice(0,30).map(d=>({name:small(d.name,100),type:small(d.type,50),description:small(d.description,240)})),
  compositionCommands:(Array.isArray(c.compositionCommands)?c.compositionCommands:[]).slice(0,25).map(x=>small(x,150)),limits:(Array.isArray(c.limits)?c.limits:[]).slice(0,12).map(x=>small(x,220))};
}

