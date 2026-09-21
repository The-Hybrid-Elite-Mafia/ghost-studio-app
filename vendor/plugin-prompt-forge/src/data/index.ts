import type { Plugin } from "./types";
import { dynamicsA } from "./plugins/dynamics-a";
import { dynamicsB } from "./plugins/dynamics-b";
import { eqA } from "./plugins/eq-a";
import { eqB } from "./plugins/eq-b";
import { spaceA } from "./plugins/space-a";
import { spaceB } from "./plugins/space-b";
import { timeA } from "./plugins/time-a";
import { timeB } from "./plugins/time-b";
import { toneA } from "./plugins/tone-a";
import { toneB } from "./plugins/tone-b";
import { cleanupA } from "./plugins/cleanup-a";
import { cleanupB } from "./plugins/cleanup-b";
import { cleanupC } from "./plugins/cleanup-c";
import { imagingA } from "./plugins/imaging-a";
import { imagingB } from "./plugins/imaging-b";
import { creative } from "./plugins/creative";

export * from "./types";

export const ALL_PLUGINS: Plugin[] = [
  ...dynamicsA,
  ...dynamicsB,
  ...eqA,
  ...eqB,
  ...spaceA,
  ...spaceB,
  ...timeA,
  ...timeB,
  ...toneA,
  ...toneB,
  ...cleanupA,
  ...cleanupB,
  ...cleanupC,
  ...imagingA,
  ...imagingB,
  ...creative,
];

export const PRESET_COUNT = ALL_PLUGINS.reduce((n, p) => n + p.presets.length, 0);

export function findPlugin(id: string): Plugin | undefined {
  return ALL_PLUGINS.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/* Signal-chain recipes: producer-built chains as one chat-bar prompt  */
/* ------------------------------------------------------------------ */

export interface ChainRecipe {
  id: string;
  name: string;
  target: string;
  vibe: string;
  steps: { plugin: string; preset: string }[];
  prompt: string;
}

export const CHAIN_RECIPES: ChainRecipe[] = [
  {
    id: "lead-vocal-pop",
    name: "Lead Vocal — Pop / Radio",
    target: "Lead vocal stem (after Advanced Split + Remove Effects)",
    vibe: "Clean, forward, present, no AI glass",
    steps: [
      { plugin: "de-reverb", preset: "Vocal Dry 50%" },
      { plugin: "eq", preset: "Vocal Clarity Carve" },
      { plugin: "sibilance-fizz", preset: "Two-Stage Vocal Clean" },
      { plugin: "compressor", preset: "Pop Lead Vocal Leveler" },
      { plugin: "shimmer-remover", preset: "Vocal Glass (3 dynamic bands)" },
      { plugin: "de-esser", preset: "Pop Vocal Split-Band" },
      { plugin: "air-exciter", preset: "Vocal Air Lift" },
      { plugin: "delay", preset: "Vocal 1/8 Dotted" },
      { plugin: "plate-reverb", preset: "Lead Vocal Plate 1.8s" },
      { plugin: "limiter", preset: "Vocal Peak Guard" },
    ],
    prompt:
      "Add this effect chain to my LEAD VOCAL track, in this order, and save each one as a preset in my library. Start every plugin with its Amount at 0.0 so the chain is completely transparent until I push it. 1) \"Tail Dryer\" adaptive de-reverb, preset Vocal Dry 50% (-8 dB max, sensitivity 0.5). 2) Six-band EQ, preset Vocal Clarity (HPF 90 Hz, -3.5 dB at 220 Hz, -2 dB at 3.2 kHz, +2.5 dB at 5 kHz, +2 dB shelf at 12 kHz). 3) \"Sib & Fizz\" two-stage tamer (sibilance -5 dB dynamic at 5.5–9 kHz, fizz -3.5 dB at 9–14 kHz, +1.5 dB air keep). 4) Optical compressor, preset Pop Lead Vocal Leveler (-18 dB, 3:1, 18 ms attack, 140 ms release, soft knee, 3–4 dB GR). 5) \"Shimmer Off\" dynamic shimmer remover (5.8–11.5 kHz, 5.5 dB max, 8 ms attack, 90 ms release). 6) Split-band de-esser (5.5–8.5 kHz, 4.5 dB, 0.5 ms attack). 7) \"Air Lift\" harmonic exciter (7 kHz crossover, +3 dB air, 70% mix). 8) Delay, 1/8 dotted, feedback 0.3, wet 250 Hz–6 kHz, 18% mix. 9) Plate reverb 1.8 s, 28 ms pre-delay, 22% wet, wet HPF 220 Hz. 10) Safety limiter, -3 dBFS ceiling. Auto gain-match each stage so bypassing one does not change the level.",
  },
  {
    id: "rap-808",
    name: "Rap Vocal + 808 Mix",
    target: "Rap vocal stem, 808 stem, drum stem",
    vibe: "Loud, forward, mono-solid low end",
    steps: [
      { plugin: "de-reverb", preset: "Vocal Dry 50%" },
      { plugin: "compressor", preset: "Rap Vocal In-Your-Face" },
      { plugin: "sibilance-fizz", preset: "Rap Fizz Kill" },
      { plugin: "eq", preset: "Rap Vocal Forward" },
      { plugin: "low-end-manager", preset: "808 Sustain Control" },
      { plugin: "distortion", preset: "808 Harmonic Top" },
      { plugin: "de-esser", preset: "Rap Fizz & Consonant Control" },
      { plugin: "transient-restorer", preset: "Kit Punch Rebuild" },
      { plugin: "master-limiter-lufs", preset: "Club / Rap -8 LUFS" },
    ],
    prompt:
      "Build a mixing chain for a rap session and save it as presets on the right tracks. All Amount values start at 0.0. RAP VOCAL: \"Tail Dryer\" de-reverb Vocal Dry 50%; FET compressor Rap Slam (-22 dB, 6:1, 4 ms attack, 90 ms release); \"Fizz Kill\" sibilance and fizz tamer (-6 dB sib, -5 dB fizz, 6–14 kHz, 4 ms lookahead); EQ preset Rap Forward (HPF 110 Hz, -3 dB at 400 Hz, +1.5 dB at 1.2 kHz, +3 dB at 6 kHz). 808: \"Low Manager\" preset 808 Control (duck -3 dB under the kick, sustain trim -2 dB, mono below 100 Hz) then \"808 Top\" band-limited distortion (drive 0.3, band 300 Hz–4 kHz, 40% mix). DRUMS: \"Punch Rebuild\" transient restorer (+5 dB in 1–6 kHz, 1 ms attack). MASTER: LUFS limiter to -8 LUFS with a -0.8 dBTP ceiling, 4x oversampling.",
  },
  {
    id: "ai-artifact-rescue",
    name: "AI Artifact Rescue Chain",
    target: "Any generation, before anything else",
    vibe: "Clean the source first — then master the clean version",
    steps: [
      { plugin: "artifact-analyser", preset: "Full Diagnostic Sweep" },
      { plugin: "declick", preset: "Full Mix Two-Stage" },
      { plugin: "spectral-denoise", preset: "Hiss Down 10 dB" },
      { plugin: "shimmer-remover", preset: "Vocal Glass (3 dynamic bands)" },
      { plugin: "fixed-tone-notcher", preset: "Auto-Find and Kill" },
      { plugin: "de-reverb", preset: "Vocal Dry 50%" },
      { plugin: "phase-smear-repair", preset: "Underwater Vocal Fix" },
      { plugin: "robotic-humanizer", preset: "Subtle Humanise" },
      { plugin: "deplasticiser", preset: "Subtle De-Plastic" },
    ],
    prompt:
      "Build an AI-artifact cleanup chain I can drag onto any generation, and save each plugin to my library. Every plugin starts at Amount 0.0 and must be transparent until pushed. Order matters: 1) \"Artifact Analyser\" — diagnostic only, report shimmer, hiss, wobble, smear, fixed tones, clicks and robotic texture with severity scores. 2) \"Two-Stage Clean\" de-click and de-crackle (single-band click then high-band crackle). 3) Spectral de-noiser, -10 dB, transient guard 0.4. 4) \"Shimmer Off\" — three dynamic bands at 5.8–11.5 kHz cutting 5.5 dB max, never a static low-pass. 5) \"Tone Killer\" auto-find fixed-tone notcher (up to 3 notches, -14 dB, Q 22). 6) \"Tail Dryer\" adaptive de-reverb at 50%. 7) \"Underwater Fix\" phase-smear repair (focus 0.6, +4 dB transients in 1.5–7 kHz). 8) \"Humanizer\" — 4 ms micro-timing, 3% formant drift, 1 dB level variation. 9) \"De-Plasticiser\" at 30% for harmonic and phase dither. Give every plugin a Listen-to-residual button so I can hear exactly what each one removes.",
  },
  {
    id: "drum-bus",
    name: "Drum Bus — Punch & Size",
    target: "Drum stem or drum group",
    vibe: "Big attacks, controlled tails, real-kit feel",
    steps: [
      { plugin: "gate", preset: "Tighten AI Drums" },
      { plugin: "transient-shaper", preset: "Punch Kit" },
      { plugin: "eq", preset: "Drum Bus Brighten" },
      { plugin: "compressor", preset: "Drum Bus Punch" },
      { plugin: "parallel-ny-comp", preset: "NY Drum Wall" },
      { plugin: "reverb", preset: "Drum Room Glue" },
      { plugin: "tape-saturation", preset: "Drum Bus Tape Punch" },
      { plugin: "master-clipper", preset: "Drum Bus Clip (Punch)" },
    ],
    prompt:
      "Add a drum-bus chain to my drum track in this order, all saved as presets, all starting at Amount 0.0. 1) Gate \"Drum Tightener\" (-26 dB threshold, 1 ms attack, 40 ms hold, 70 ms release, -16 dB range). 2) \"Punch Kit\" transient shaper (+6 dB attack, -3 dB sustain, 60 ms release). 3) Six-band EQ Drum Shine (HPF 35 Hz, +2 dB at 3.5 kHz, -2 dB at 8 kHz, +2.5 dB shelf at 14 kHz). 4) Bus compressor Drum Bus Punch (-14 dB, 4:1, 25 ms attack, 110 ms release, 85% wet). 5) \"NY Wall\" parallel compressor (15:1, 20 ms attack, 90 ms release, 35% wet, HPF 150 Hz, LPF 8 kHz). 6) Room reverb (1.1 s decay, 0 ms pre-delay, 18% wet). 7) Tape stage Drum Tape (drive 0.45, +2 dB transient lift). 8) Clipper at -3 dB with 2x oversampling.",
  },
  {
    id: "edm-drop",
    name: "EDM Drop / Supersaw",
    target: "Synth and drop bus",
    vibe: "Huge, pumping, wide but mono-safe",
    steps: [
      { plugin: "multiband-compressor", preset: "EDM Drop Punch" },
      { plugin: "sidechain-compressor", preset: "EDM 1/8 Pump" },
      { plugin: "chorus", preset: "Super Synth Ensemble" },
      { plugin: "mid-side-eq", preset: "Master Air on Sides" },
      { plugin: "trance-gate", preset: "Classic Trance 1/16" },
      { plugin: "reverb", preset: "Ambient Infinite Wash" },
      { plugin: "master-clipper", preset: "Loud Club Master (Clipper Forward)" },
    ],
    prompt:
      "Build an EDM drop chain for my synth bus, every plugin starting at Amount 0.0 and saved as a preset. 1) Four-band compressor Drop Puncher (crossovers 120 Hz / 1.5 kHz / 6 kHz, low 6 dB at 8:1, release locked to 1/8). 2) Sidechain pumper \"EDM Pump 1/8\" (1/8-note release, 6:1, -6 dB range, detector HPF 150 Hz) with the kick track as the sidechain source. 3) Four-voice ensemble \"Super Ensemble\" (0.8 Hz, depth 0.6, width 130%, mono below 100 Hz). 4) Mid-side EQ with +2.5 dB side shelf at 11 kHz and side HPF 200 Hz. 5) Step gate \"Trance Gate\" (1/16, alternating pattern, 55% length). 6) Long reverb \"Infinite Wash\" (12 s, 60 ms pre-delay, 60% wet) on a send. 7) Clipper-forward loud stage at -4 dB soft clip plus a -1 dBTP ceiling.",
  },
  {
    id: "lofi-bedroom",
    name: "Lo-Fi Bedroom Beat",
    target: "Whole beat bus",
    vibe: "Dusty, warm, nostalgic, vinyl-noisy",
    steps: [
      { plugin: "vinyl-lofi", preset: "Lo-Fi Hip-Hop Beat" },
      { plugin: "bandpass-filter", preset: "Lo-Fi Band Limit" },
      { plugin: "tape-saturation", preset: "Lo-Fi Tape Age" },
      { plugin: "tape-delay", preset: "Lo-Fi Cassette Echo" },
      { plugin: "spring-reverb", preset: "Lo-Fi Bedroom Spring" },
      { plugin: "master-limiter-lufs", preset: "Streaming -14 LUFS" },
    ],
    prompt:
      "Build a lo-fi bedroom-pop chain for my beat bus, all Amounts starting at 0.0 and each plugin saved as a preset. 1) \"Vinyl Beat\" (wow 0.35 at 0.4 Hz, crackle 0.45, dust 0.3, rolloff 8 kHz). 2) Band-limit filter (HPF 200 Hz, LPF 7 kHz, drive 0.3). 3) Aged tape stage (drive 0.5, age 0.8, wow 0.35, rolloff 7 kHz, hiss 0.25). 4) Cassette echo (1/8 time, feedback 0.45, age 0.75, wet LPF 4 kHz). 5) Bedroom spring reverb (short tank, drip 0.9, noise 0.3). 6) Master limiter to -14 LUFS with a -1.0 dBTP ceiling.",
  },
  {
    id: "cinematic",
    name: "Cinematic / Trailer Score",
    target: "Orchestral and sub bus, master",
    vibe: "Huge space, controlled sub, dynamics intact",
    steps: [
      { plugin: "bus-glue-vca", preset: "Cinematic cues / Trailer" },
      { plugin: "low-end-manager", preset: "Cinematic Sub Management" },
      { plugin: "convolution", preset: "Church / Cathedral" },
      { plugin: "sub-harmonic", preset: "Cinematic Low Rumble" },
      { plugin: "riser-bloom", preset: "Impact + Sub Drop" },
      { plugin: "limiter", preset: "Classical / Dynamic Master" },
    ],
    prompt:
      "Add a cinematic chain to my orchestral bus and master, all Amounts at 0.0, saved as presets. 1) \"Trailer Glue\" VCA (3:1, 60 ms attack, 1 s release, sidechain HPF 60 Hz). 2) \"Cinema Low\" low-end manager (sub HPF 22 Hz, mono below 80 Hz, -2 dB duck, 400 ms release). 3) Convolution reverb from a stone-cathedral IR (40 ms pre-delay, 38% wet, wet HPF 180 Hz). 4) \"Cinematic Rumble\" sub-harmonic generator (+6 dB, 40 Hz crossover, 2.5 s decay). 5) \"Impact\" — impact hit plus a -12 semitone sub drop with 2 s decay. 6) Dynamic master limiter, -1.5 dBTP ceiling, 0.5 dB GR max so the dynamics survive.",
  },
  {
    id: "acoustic",
    name: "Acoustic / Singer-Songwriter",
    target: "Vocal + guitar stems",
    vibe: "Natural, open, believable performance",
    steps: [
      { plugin: "de-reverb", preset: "Keep Some Air (Vocal Bed)" },
      { plugin: "eq", preset: "Acoustic Guitar Body" },
      { plugin: "compressor", preset: "Acoustic Guitar Even-Out" },
      { plugin: "pitch-wobble-stabilizer", preset: "Gentle Note Centering" },
      { plugin: "robotic-humanizer", preset: "Breath & Phrase Life" },
      { plugin: "reverb", preset: "Dry Room / Intimate" },
      { plugin: "master-limiter-lufs", preset: "Streaming -14 LUFS" },
    ],
    prompt:
      "Build a natural acoustic chain and save each plugin as a preset, Amounts starting at 0.0. VOCAL: gentle de-reverb \"Keep Air\" (-4 dB max, 15% of the original reverb left in); \"Wobble Stabilizer\" pitch centreing (±30 cents, response 120 ms, vibrato keep 100%); \"Phrase Life\" humaniser (breath +2 dB, phrase drift on, 1.5 dB level variation); dry room reverb (0.4 s, 8 ms pre-delay, 10% wet). GUITAR: EQ preset Acoustic Body (HPF 85 Hz, -2.5 dB at 180 Hz, +1.5 dB at 2.4 kHz and 9 kHz) then \"Strum Even-Out\" compressor (2.5:1, -20 dB, 12 ms attack, 260 ms release, sidechain HPF 100 Hz). MASTER: -14 LUFS limiter, -1 dBTP, transparent style.",
  },
  {
    id: "mastering-chain",
    name: "Mastering Chain (Stream Ready)",
    target: "Master / mixdown track",
    vibe: "Loud, clean, mono-safe, true to the mix",
    steps: [
      { plugin: "mud-harsh-cutter", preset: "Master Two-Band Fix" },
      { plugin: "shimmer-remover", preset: "Pre-Master Cleanup" },
      { plugin: "eq", preset: "Master Gentle Polish" },
      { plugin: "master-clipper", preset: "Pre-Limiter Shave" },
      { plugin: "stereo-widener", preset: "Safe Master Width" },
      { plugin: "master-limiter-lufs", preset: "Streaming -14 LUFS" },
    ],
    prompt:
      "Build a mastering chain on my master track, every Amount starting at 0.0, each saved as a preset with auto gain-match so A/B is honest. 1) \"Master Rescue\" two-band dynamic cutter (mud -1.5 dB at 260 Hz, harsh -1.5 dB at 4.2 kHz, capped). 2) \"Pre-Master Clean\" shimmer remover (6–12 kHz, 4.5 dB, gain-matched). 3) Wide mastering EQ Master Polish (+1 dB at 60 Hz, -1.5 dB at 250 Hz, +1.5 dB shelf at 11 kHz, never more than 2 dB). 4) \"Pre-Clip\" clipper (-2.5 dB soft clip, 4x oversampling). 5) \"Safe Width\" widener (115%, 200 Hz and up, mono below 120 Hz, correlation floor 0.2). 6) LUFS limiter to -14 LUFS with a -1.0 dBTP true-peak ceiling and short-term metering. Add a mono-fold-down and phone-speaker check button at the end.",
  },
  {
    id: "vocal-fx-throw",
    name: "Vocal FX Throw (Dub / Hyperpop)",
    target: "Vocal send / FX track",
    vibe: "Experimental, processed, weird on purpose",
    steps: [
      { plugin: "tone-a-bitcrusher", preset: "Vocal Telephone Crush" },
      { plugin: "ring-mod-vocoder", preset: "Ring Mod Dalek" },
      { plugin: "pingpong-filter-delay", preset: "Dub Feedback Runaway" },
      { plugin: "granular-freeze", preset: "Infinite Freeze Pad" },
      { plugin: "auto-pan", preset: "Random Movement" },
    ],
    prompt:
      "Build a vocal FX send chain for weird throws, all Amounts at 0.0 and saved as presets. 1) \"Phone Crush\" bitcrusher (10-bit, 11 kHz, band 500 Hz–3 kHz). 2) Ring modulator at 120 Hz with envelope follow. 3) \"Dub Runaway\" tape delay (1/4 dotted, feedback 0.85, drive 0.4, wet LPF 3.5 kHz, Freeze button). 4) \"Freeze Pad\" granular freeze (180 ms grains, density 0.8). 5) Random auto-pan (1/2-note steps, 70% depth). Blend the send under the dry vocal so the words stay intelligible.",
  },
  {
    id: "podcast-vo",
    name: "Voiceover / Podcast Chain",
    target: "Spoken word track",
    vibe: "Intelligible, consistent, broadcast clean",
    steps: [
      { plugin: "spectral-denoise", preset: "Gentle Floor Tidy (6 dB)" },
      { plugin: "breath-mouth", preset: "Gentle Podcast Clean" },
      { plugin: "eq", preset: "Vocal Clarity Carve" },
      { plugin: "compressor", preset: "Broadcast / Podcast Voice" },
      { plugin: "de-esser", preset: "Spoken Word / Voiceover" },
      { plugin: "level-rider", preset: "Podcast Loudness Rider" },
      { plugin: "master-limiter-lufs", preset: "Podcast / VO -16 LUFS" },
    ],
    prompt:
      "Build a spoken-word chain, all Amounts starting at 0.0, saved as presets. 1) Gentle denoise (-6 dB, high smoothing, transient guard 0.6). 2) Breath and mouth noise clean (breaths -5 dB, clicks -8 dB, HPF 90 Hz). 3) EQ Vocal Clarity (HPF 90 Hz, -3.5 dB at 220 Hz, +2.5 dB at 5 kHz, +2 dB at 12 kHz). 4) Broadcast compressor (80 Hz detector HPF, 4:1, -21 dB, 8 ms attack, 120 ms release, auto makeup). 5) De-esser for VO (5–9 kHz, 5 dB, split mode). 6) Level rider to -16 LUFS (800 ms smoothing, ±6 dB, gate on). 7) Limiter to -16 LUFS with a -1.5 dBTP ceiling.",
  },
  {
    id: "stem-blend",
    name: "Stem Blend / Separation Repair",
    target: "All separated stems",
    vibe: "Make separated stems sound like one recording again",
    steps: [
      { plugin: "stereo-stabilizer", preset: "Underwater Phase Repair" },
      { plugin: "transient-restorer", preset: "Post-Separation Drum Fix" },
      { plugin: "declick", preset: "Separation Stitcher" },
      { plugin: "gated-reflection", preset: "Short Snap Ambience" },
      { plugin: "bus-glue-vca", preset: "Drum Group Glue" },
      { plugin: "utility", preset: "Gain Stage & Headroom" },
    ],
    prompt:
      "Build a chain for repairing separated stems so they blend like one recording, every Amount at 0.0 and saved as presets. 1) \"Phase Repair\" mid-side phase repair (0.8 strength, 300 Hz–8 kHz, width 95%). 2) \"Separation Punch\" transient restorer (+6 dB, 80 Hz–9 kHz, phase align on). 3) \"Stitcher\" de-clicker for boundary clicks (wide-band, sensitivity 0.55). 4) \"Snap Ambience\" non-linear ambience (60 ms hold, 30 ms release, 14% wet) to give back lost room. 5) \"Group Glue VCA\" (4:1, 10 ms attack, 100 ms release, 1.5 dB GR). 6) Utility gain-stage (auto trim so peaks sit at -12 dBFS, leaving headroom). Remind me to mute the original source track once the stems are in, so I am not mixing the same audio twice.",
  },
];

/* ------------------------------------------------------------------ */
/* Triage: what do you hear?                                           */
/* ------------------------------------------------------------------ */

export interface Triage {
  id: string;
  symptom: string;
  detail: string;
  plugin: string;
  preset: string;
  why: string;
}

export const TRIAGE: Triage[] = [
  {
    id: "shimmer",
    symptom: "Glassy shimmer / metallic sheen",
    detail: "A shiny unstable layer around vocals, cymbals and reverb tails.",
    plugin: "shimmer-remover",
    preset: "Vocal Glass (3 dynamic bands)",
    why: "Dynamic bands only cut the glass when it spikes. A static low-pass kills the vocal's air along with it.",
  },
  {
    id: "hiss",
    symptom: "Steady hiss or noise floor",
    detail: "Constant noise in the gaps between notes.",
    plugin: "spectral-denoise",
    preset: "Hiss Down 10 dB",
    why: "Learns a profile from a quiet passage. Keep it under 12 dB or you get watery edges.",
  },
  {
    id: "watery",
    symptom: "Underwater / swishy sound",
    detail: "Usually after aggressive denoise or de-reverb.",
    plugin: "phase-smear-repair",
    preset: "Underwater Vocal Fix",
    why: "It is phase smear, not noise. Denoising it again makes it worse — rebuild the transients instead.",
  },
  {
    id: "wobble",
    symptom: "Pitch drift on held notes",
    detail: "Seasick drift that is not vibrato.",
    plugin: "pitch-wobble-stabilizer",
    preset: "Gentle Note Centering",
    why: "Tight ±30 cent range with vibrato keep at 100% so real expression survives.",
  },
  {
    id: "reverb-baked",
    symptom: "Reverb baked into the stem",
    detail: "Suno prints space into every generation.",
    plugin: "de-reverb",
    preset: "Vocal Dry 50%",
    why: "Run Remove Effects first for 2 dry lanes, then finish the job here. Two gentle passes beat one heavy pass.",
  },
  {
    id: "robotic",
    symptom: "Vocal sounds plastic / robotic",
    detail: "Hard consonants, detached synthetic edge.",
    plugin: "robotic-humanizer",
    preset: "Subtle Humanise",
    why: "The fingerprint lives in formant, phase and micro-timing regularity — nudge those three, not the timbre.",
  },
  {
    id: "sibilance",
    symptom: "Harsh S and T sounds",
    detail: "Spitting consonants, fizzy top end.",
    plugin: "sibilance-fizz",
    preset: "Two-Stage Vocal Clean",
    why: "Sibilance is narrow and dynamic, fizz is broadband and constant — split the job between two bands.",
  },
  {
    id: "tones",
    symptom: "Constant whistle or drone",
    detail: "One fixed tone parked under the music.",
    plugin: "fixed-tone-notcher",
    preset: "Auto-Find and Kill",
    why: "Narrow notches (Q 22) at -14 dB remove the tone and nothing else.",
  },
  {
    id: "clicks",
    symptom: "Clicks, pops, crackle",
    detail: "Digital ticks at clip boundaries and drop-outs.",
    plugin: "declick",
    preset: "Full Mix Two-Stage",
    why: "De-click single-band first, then de-crackle high-band — the classic RX two-stage pass.",
  },
  {
    id: "mono",
    symptom: "Falls apart in mono",
    detail: "Elements vanish when you fold down.",
    plugin: "stereo-stabilizer",
    preset: "Mono Compatibility Fix",
    why: "Repair phase before widening, mono everything below 120 Hz, and watch the correlation meter.",
  },
  {
    id: "mud",
    symptom: "Muddy low-mids",
    detail: "Thick, cardboard, no definition.",
    plugin: "mud-harsh-cutter",
    preset: "Mix Rescue (Both Bands)",
    why: "180–350 Hz is where AI mixes pile up. A dynamic band only cuts it when it actually gets crowded.",
  },
  {
    id: "harsh",
    symptom: "Fatiguing harshness at 3–5 kHz",
    detail: "Painful on headphones after a few minutes.",
    plugin: "mud-harsh-cutter",
    preset: "Full Mix Harsh Tame",
    why: "Dynamic cut in the ear-fatigue zone keeps presence while removing the sting.",
  },
  {
    id: "soft-drums",
    symptom: "Drums have no punch",
    detail: "Everything sounds soft and blurred.",
    plugin: "transient-restorer",
    preset: "Kit Punch Rebuild",
    why: "Separation destroys attack information. Rebuild it in the 1–6 kHz band rather than boosting globally.",
  },
  {
    id: "stems-blend",
    symptom: "Stems sound like separate songs",
    detail: "Parts don't feel played together.",
    plugin: "bus-glue-vca",
    preset: "Drum Group Glue",
    why: "1–2 dB of group compression plus one shared room reverb is what makes separated parts a band.",
  },
  {
    id: "flat",
    symptom: "Vocal is flat and lifeless",
    detail: "Technically fine, emotionally dead.",
    plugin: "robotic-humanizer",
    preset: "Dead-Vocal Revival",
    why: "Timing, formant, level and air all need a little human irregularity, not just more compression.",
  },
  {
    id: "lows",
    symptom: "Low end fights itself",
    detail: "Two things claiming 50–80 Hz.",
    plugin: "low-end-manager",
    preset: "Full Low-End Cleanup",
    why: "Mono below 100 Hz, HPF the sub at 28 Hz, duck the bass under the kick, notch the one boomy resonance.",
  },
  {
    id: "loop",
    symptom: "Loop clicks at the seam",
    detail: "A tick every time the clip repeats.",
    plugin: "tail-loop-smoother",
    preset: "Perfect 2-Bar Loop",
    why: "Set the length in bars with a 60 ms equal-power crossfade and a short tail fade.",
  },
  {
    id: "breath",
    symptom: "Loud breaths and mouth clicks",
    detail: "The fastest giveaway in a generated vocal.",
    plugin: "breath-mouth",
    preset: "Breath -8 dB",
    why: "Reduce by 6–10 dB, never remove — a vocal with no breaths sounds dead.",
  },
  {
    id: "dull",
    symptom: "Dull or veiled after cleanup",
    detail: "Cleanup worked but now it sounds small.",
    plugin: "air-exciter",
    preset: "Post-Dry Air",
    why: "Every restoration stage costs top end. Excite 6–9 kHz rather than shelving above 12 kHz.",
  },
  {
    id: "loud",
    symptom: "Loud but squashed and pumping",
    detail: "Limiter is doing all the work.",
    plugin: "master-clipper",
    preset: "Pre-Limiter Shave",
    why: "Clip 2–3 dB of peaks first with 4x oversampling, then let the limiter do only 1–2 dB.",
  },
];

/* ------------------------------------------------------------------ */
/* Engineer's workflow notes (from Suno docs + community testing)      */
/* ------------------------------------------------------------------ */

export const WORKFLOW = [
  {
    title: "Studio has no VST/AU support",
    body: "Your plugin folder stays in your DAW. The seven factory effects (Compressor, EQ, Reverb, Convolution, Delay, Distortion, Gate) plus whatever you describe to the chat bar are the entire toolbox. Generated plugins behave exactly like factory ones — presets, automation and MIDI Learn all work.",
  },
  {
    title: "Diagnose first, process second",
    body: "A normal mastering chain can make a track louder, wider and brighter — and push metallic shimmer, robotic vocal texture and brittle AI highs forward with it. Clean the source first, then master the cleaner version.",
  },
  {
    title: "Split before you mix",
    body: "Right-click the clip → Get Stems → Advanced Split, and type the instrument names you want. Naming parts by ear returns higher-fidelity stems than auto-detection. Then insert all.",
  },
  {
    title: "Mute the source track",
    body: "Mixing the original stereo file alongside its own stems doubles everything. Mute the source as soon as the stems land on their own tracks.",
  },
  {
    title: "Remove Effects gives you dry lanes",
    body: "Right-click any clip → Remove Effects returns two dry lanes with the generation's baked-in reverb and compression stripped out. Follow with De-Reverb if you need fully dry, then add your own space back.",
  },
  {
    title: "EQ before compression on muddy parts",
    body: "If you compress a muddy part, the compressor reacts to the mud. Cut the lows first, compress second.",
  },
  {
    title: "Reverb on two or three tracks max",
    body: "Everything through one reverb drowns. Keep kick, bass and 808 dry, send the rest.",
  },
  {
    title: "Automate instead of re-generating",
    body: "Right-click any knob → Automate, then draw the curve on the timeline. Use clip fades (Ctrl+F on a selection) where automation is overkill — fades are per clip, automation runs the whole track.",
  },
  {
    title: "Amount is always 0.0 out of the box",
    body: "Every plugin here is written with an Amount control defaulting to 0.0 — fully transparent, zero gain change, zero colour. Push it only as far as you can hear a benefit, then A/B with a loudness-matched bypass.",
  },
  {
    title: "Export clean, finish elsewhere",
    body: "Premier exports unlimited 32-bit / 48 kHz multitracks. Studio is a writing and arranging environment, not a mastering suite — clean the source here, then master outside it.",
  },
];
