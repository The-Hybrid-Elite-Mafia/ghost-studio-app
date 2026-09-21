(function(root){
'use strict';
const rows=[
 ['Vocals',[[70,.707,0],[160,.707,0],[850,.7,-1.2],[1500,.7,0],[9500,.707,1]],[-18,2,25,120,6,false,0]],
 ['Backing_Vocals',[[75,.707,0],[160,.707,0],[850,.7,-1],[1200,.7,0],[9500,.707,.5]]],
 ['Bass',[[25,.707,0],[55,.707,1],[250,.9,-2],[900,.8,-1],[4500,.707,.5]],[-16,3,28,120,4,false,0]],
 ['Drums',[[30,.707,0],[90,.707,1.5],[320,.8,-1.5],[2500,.8,1],[8000,.707,1]],[-14,4,18,75,3,true,.5]],
 ['Woodwinds',[[80,.707,0],[180,.707,-1],[350,.8,-1.5],[2200,.8,1],[7000,.707,.5]],[-20,2,25,140,8,false,0]],
 ['Brass',[[100,.707,0],[220,.707,-1],[500,.8,-1.5],[1800,.8,1],[6500,.707,.5]]],
 ['FX',[[120,.707,0],[250,.707,-1],[450,.8,-1],[2500,.8,.5],[8000,.707,0]]],
 ['Synth',[[70,.707,0],[180,.707,-1],[350,.8,-1.5],[3000,.8,.8],[8500,.707,.5]]],
 ['Strings',[[90,.707,0],[220,.707,-1],[400,.8,-1],[2400,.8,.5],[7500,.707,.5]]],
 ['Percussion',[[100,.707,0],[180,.707,-1],[350,.8,-1],[3000,.8,1],[9000,.707,.5]]],
 ['Keyboard',[[70,.707,0],[180,.707,-1.5],[300,.8,-1.5],[2200,.8,.5],[8000,.707,.5]]],
 ['Guitar',[[100,.707,0],[220,.707,-1],[450,.8,-1],[2500,.8,.5],[7000,.707,.5]]]
];
const types=['highpass','lowshelf','peaking','peaking','highshelf','lowpass'];
const notes=[
 'Saved in this ChatGPT workspace on 2026-09-13. Current settings include the hollow-vocal EQ revisions and the +1.5 dB lead-vocal lift.',
 'Session shown in Suno: 69 BPM, 4/4.',
 'Apply these chains to dry/unprocessed stems. If effects are already printed into the audio, applying them again doubles the processing.',
 'Lead Vocals fader: +1.5 dB (reported linear gain 1.189). Original full-song track: muted, prior reported fader 0 dB.',
 'Match chain order below. All listed plugins are enabled. Band 6 is disabled in every EQ.',
 'This is a manual reference and structured JSON, not a DAW-native preset.',
 'Source: current parameter values reported by Suno Studio during read-only audits. Plugin algorithms were not exported.',
 'Unavailable: EQ slopes/global mix/output; compressor wet/dry; other faders/pans; normalization offsets; automation. Do not assume these are zero.',
 'Band order: 1 high-pass, 2 low shelf, 3 bell, 4 bell, 5 high shelf, 6 low-pass. Bands 1–5 are enabled, including flat bands. High-pass gain values are reported as zero and do not specify slope.',
 'Input/output level fields were reported as 0, but their control-versus-meter meaning was not established. They are preserved in JSON; do not use them as gain targets.',
 'Master Clarity is a Suno-specific processor. Recreating its presence/drive/output stages with another plugin will be approximate. The listed peak ceiling is a setting, not a measured true-peak result.',
 'Use matching parameters as a starting point and level-match playback when comparing in your DAW.'
];
const data={title:'My Time Coming to an End',format:'hem-production-reference',version:1,savedDate:'2026-09-13',session:{bpm:69,timeSignature:'4/4',leadVocalsFaderDb:1.5,leadVocalsReportedLinearGain:1.189,originalFullSongMuted:true,originalFullSongPriorFaderDb:0},notes,tracks:rows.map(([name,bands,c])=>({name,chain:c?['EQ','Compressor']:['EQ'],eq:{enabled:true,bands:[...bands,[8800,.707,0]].map(([frequencyHz,q,gainDb],i)=>({band:i+1,type:types[i],frequencyHz,q,gainDb,enabled:i<5}))},...(c?{compressor:{enabled:true,thresholdDb:c[0],ratio:c[1],attackMs:c[2],releaseMs:c[3],kneeDb:c[4],autoMakeup:c[5],gainDb:c[6],reportedInputLevel:0,reportedOutputLevel:0,levelFieldMeaning:'Unknown: control versus meter; not gain targets'}}:{})})),master:{name:'Master Clarity',enabled:true,position:'Last in main output chain',driveDb:1.5,mixPercent:70,peakCeilingDb:-1,presenceGainDb:.8,presenceFrequencyHz:3500}};
const signed=n=>n>=0?'+'+n:String(n);
const sections=data.tracks.map(t=>({title:t.name,text:[t.name,'Chain: '+t.chain.join(' → '),'Band\tType\tHz\tQ\tGain dB\tEnabled',...t.eq.bands.map(b=>[b.band,b.type,b.frequencyHz,b.q,signed(b.gainDb),b.enabled?'Yes':'No'].join('\t'))].join('\n')}));
const compressors=['Compressors','Track\tThreshold dB\tRatio\tAttack ms\tRelease ms\tKnee dB\tAuto makeup\tGain dB',...data.tracks.filter(t=>t.compressor).map(t=>{const c=t.compressor;return [t.name,c.thresholdDb,c.ratio+':1',c.attackMs,c.releaseMs,c.kneeDb,c.autoMakeup?'on':'off',signed(c.gainDb)].join('\t');})].join('\n');
const master='Main output — Master Clarity, last in chain\nDrive: +1.5 dB\nMix: 70%\nPeak ceiling: -1 dB\nPresence gain: +0.8 dB\nPresence frequency: 3500 Hz';
const text=[data.title+' — DAW plugin reference','Transfer notes',...notes.slice(0,9),'EQ settings',...sections.map(s=>s.text),compressors,notes[9],master,...notes.slice(10)].join('\n\n');
const reference='Production blueprint: My Time Coming to an End. 69 BPM, 4/4. Clean, vocal-forward mix using the supplied hollow-vocal EQ revisions. Lead vocal lift +1.5 dB. Lead EQ: HP 70 Hz Q .707; low shelf 160 Hz 0 dB Q .707; bell 850 Hz -1.2 dB Q .7; bell 1500 Hz 0 dB Q .7; high shelf 9500 Hz +1 dB Q .707. Lead compressor: -18 dB threshold, 2:1, attack 25 ms, release 120 ms, knee 6 dB, auto makeup off, gain 0 dB. Backing EQ: HP 75 Hz; bell 850 Hz -1 dB Q .7; high shelf 9500 Hz +0.5 dB. EQ precedes compression. Bass compressor -16 dB/3:1/28 ms/120 ms/knee 4/off/0 dB; drums -14 dB/4:1/18 ms/75 ms/knee 3/on/+0.5 dB; woodwinds -20 dB/2:1/25 ms/140 ms/knee 8/off/0 dB. Band 6 low-pass disabled in every EQ. Master Clarity last: drive +1.5 dB, mix 70%, peak ceiling -1 dB, presence +0.8 dB at 3500 Hz. Manual starting points for dry stems only; do not double-process printed effects. Suno-specific algorithms are not exported; other DAWs approximate them. Unknown settings remain unknown. Ceiling is not measured true peak; measure and level-match after audio exists. Keep engineering settings in production notes, not sung lyrics. Use the user’s story and chosen genre; this reference supplies no lyrics, genre, or story. Full 12-stem settings remain available in the saved blueprint panel.';
root.GhostLyricsBlueprint={data,text,reference,sections:[{title:'Transfer notes',text:notes.join('\n\n')},...sections,{title:'Compressors',text:compressors},{title:'Master Clarity',text:master}]};
})(typeof window!=='undefined'?window:globalThis);
