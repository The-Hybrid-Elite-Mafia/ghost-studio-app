/* Original starting points for Ghost processors, informed by linked engineering
   documentation. These are not manufacturer presets or measured AI corrections. */
(function(root){
const sources=[
 ['Noise profiles and artifact control','https://docs.izotope.com/rx11/en/spectral-de-noise.html'],
 ['De-essing: threshold, range and audition','https://www.fabfilter.com/help/pro-ds/using/basiccontrols'],
 ['Compression threshold and ratio','https://www.fabfilter.com/help/pro-c/using/dynamicscontrols'],
 ['Compression attack and release','https://www.fabfilter.com/help/pro-c/using/timecontrols']
];
const basic={
 highpass:[['Subsonic cleanup',{frequency:25}],['Low vocal rumble',{frequency:60}],['Vocal low cut',{frequency:80}],['Backing vocal separation',{frequency:120}],['Thin supporting layer',{frequency:180}]],
 lowpass:[['Gentle top rolloff',{frequency:18000}],['Bright stem softening',{frequency:15000}],['High fizz reduction',{frequency:12000}],['Dark background layer',{frequency:8000}],['Telephone top cut',{frequency:3500}]],
 lowshelf:[['Reduce boom',{frequency:120,gain:-1.5}],['Reduce low warmth',{frequency:250,gain:-2}],['Thin voice body',{frequency:180,gain:1}],['Bass weight',{frequency:80,gain:1}],['Low-end restraint',{frequency:60,gain:-1}]],
 highshelf:[['AI bright-top restraint',{frequency:8000,gain:-1.5}],['Gentle darkening',{frequency:6000,gain:-1}],['Dull source lift',{frequency:10000,gain:1}],['Subtle air',{frequency:12000,gain:.5}],['Brittle stem softening',{frequency:4500,gain:-2}]],
 peaking:[['AI low-mid mud',{frequency:300,gain:-2,Q:1}],['AI nasal tone',{frequency:1000,gain:-1.5,Q:1.4}],['AI upper-mid bite',{frequency:3500,gain:-2,Q:1.5}],['AI high-edge softening',{frequency:6500,gain:-1.5,Q:2}],['Dull vocal presence',{frequency:2400,gain:1,Q:1}]],
 compressor:[['Gentle vocal leveling',{threshold:-18,ratio:2,attack:25,release:150,knee:6}],['Peak restraint',{threshold:-12,ratio:4,attack:3,release:80,knee:3}],['Preserve drum attack',{threshold:-16,ratio:2,attack:30,release:120,knee:3}],['Bass leveling',{threshold:-20,ratio:3,attack:20,release:180,knee:6}],['Light mix cohesion',{threshold:-12,ratio:1.5,attack:30,release:200,knee:6}]],
 delay:[['Quiet vocal slap',{time:90,feedback:5,mix:8}],['Short stereo depth',{time:35,feedback:0,mix:6}],['Sparse echo',{time:250,feedback:20,mix:10}],['Long vocal echo',{time:450,feedback:25,mix:12}],['Background wash',{time:600,feedback:40,mix:18}]],
 saturation:[['Subtle harmonic blend',{drive:1.2,mix:5}],['Quiet vocal color',{drive:1.5,mix:8}],['Bass harmonic support',{drive:2,mix:10}],['Drum parallel color',{drive:3,mix:15}],['Creative parallel crunch',{drive:4,mix:20}]],
 gain:[['Create 3 dB headroom',{gain:-3}],['Create 6 dB headroom',{gain:-6}],['Create 9 dB headroom',{gain:-9}],['Fine level down',{gain:-1}],['Fine level up',{gain:1}]],
 cleanup:[['AI light hiss and clicks',{noiseReduction:3,noiseFloor:-65,clickRepair:35,mix:100}],['AI delicate stem cleanup',{noiseReduction:2,noiseFloor:-70,clickRepair:20,mix:100}]]
};
const ai={
 vocal73:['AI restrained front end',{hpf:50,presence:-.5,air:0,saturation:0,mix:100}],
 deesser:['AI gentle S control',{threshold:-24,frequency:8000,range:3,mode:1,smoothness:65,mix:100}],
 fet:['AI light peak blend',{input:0,ratio:4,attack:5,release:120,mix:20}],
 opto:['AI subtle leveling',{peakReduction:15,mix:50}],
 vocalair:['AI brittle vocal softener',{hpf:50,mudCut:10,deHarsh:15,air:0,mix:100}],
 doubler:['AI subtle support width',{amount:35,leftDetune:-3,rightDetune:3,leftDelay:12,rightDelay:18,centerKeep:100,mix:8}],
 plate:['AI short dry-vocal space',{preDelay:30,decay:.6,lowCut:200,highCut:7500,damping:60,mix:6}],
 throw:['AI sparse dry-vocal echo',{time:280,feedback:15,ducking:75,intensity:100,tone:-30,mix:7}],
 mastereq:['AI gentle bright-mix restraint',{airShelf:-.5,deHarsh:10}],
 glue:['AI light bus blend',{threshold:-12,ratio:1.5,attack:30,release:180,sidechainHPF:100,mix:50}],
 varimu:['AI gentle finish blend',{threshold:-12,timeConstant:4,stereoLink:100,mix:25}],
 passive:['AI subtle top attenuation',{highAttenuation:.5,mix:100}],
 tape:['AI restrained top smoothing',{speed:30,saturation:0,hfSmooth:8,mix:50}],
 imager:['AI conservative stereo focus',{lowMono:80,width:-5}],
 dynamic:['AI gentle harshness control',{harshnessControl:20,presenceControl:10,sensitivity:35,smoothness:75}],
 final:['AI no-drive peak margin',{inputDrive:0,ceiling:-1.5,clipAmount:0,limiterAmount:100,release:120,overshoot:1}],
 masterrack:['AI minimal finish',{mix:100,eqOn:1,eq_deHarsh:8,limitOn:1,limit_ceiling:-1.5,limit_limiterAmount:100,limit_overshoot:1}]
};
function attach(types){
 for(const [type,def] of Object.entries(types)){
  const zero=Object.fromEntries(Object.entries(def.params).map(([k,v])=>[k,v[2]]));
  const additions=[...(basic[type]||[]),...(ai[type]?[ai[type]]:[])];
  def.factory||=[];
  for(const [name,params] of additions)if(!def.factory.some(p=>p.name===name))def.factory.push({name,params:{...zero,...params}});
  def.presetGuidance='Starting points for auditioning AI-generated or recorded audio. Match bypass loudness; adjust by ear. These are original Ghost settings, not manufacturer presets.';
  if(['compressor','fet','opto','glue','varimu','masterrack'].includes(type))def.presetGuidance+=' Set input/threshold for light gain reduction first; already compressed audio may need none.';
  if(type==='deesser')def.presetGuidance+=' Audition sibilance and adjust frequency/threshold; back off if consonants lose clarity.';
  if(type==='cleanup')def.presetGuidance+=' Learn noise from a noise-only passage where possible. Back off if watery artifacts appear. This cannot reconstruct missing musical detail.';
  if(['plate','throw','delay','doubler','saturation','tape'].includes(type))def.presetGuidance+=' Creative processing adds sound; it does not remove existing reverb, distortion or AI artifacts.';
  def.presetSources=sources;
 }
}
root.GhostPresetGuidance={attach};
})(globalThis);
