import type { Plugin } from "../types";

export const timeA: Plugin[] = [
  {
    id: "delay",
    name: "Delay",
    kind: "Built-in",
    category: "Time & Modulation",
    icon: "🔁",
    target: "Vocals, leads, throws, percussion",
    oneLiner:
      "Factory delay with tempo and time-based controls, feedback, filters and mix.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Time", value: "0.0 ms" },
      { name: "Feedback", value: "0.0" },
      { name: "Sync", value: "off" },
      { name: "Wet Filter", value: "flat" },
    ],
    tip: "Delay time as a note division (1/8 dotted, 1/4) keeps echoes musical; 1/16 or a slapback of 60–90 ms adds size without hearing a second event. Filter the wet signal — 200 Hz HPF and 6 kHz LPF stops echoes stacking into mud.",
    presets: [
      {
        name: "Vocal 1/8 Dotted",
        params: { Amount: 46, Mix: "18%", Time: "1/8 dotted", Feedback: "0.3", "Wet HPF": "250 Hz", "Wet LPF": "6 kHz" },
        prompt:
          'Build "Vocal 1/8D" — a tempo-synced delay preset for lead vocals. Controls: Amount (0.0 default), Time (sync or ms), Feedback, Wet HPF/LPF, Ping-pong on/off, Mix. Preset "Vocal 1/8 Dotted": 1/8 dotted time, feedback 0.3, wet HPF 250 Hz, wet LPF 6 kHz, 18% mix.',
      },
      {
        name: "Slapback 80 ms",
        params: { Amount: 40, Mix: "20%", Time: "80 ms", Feedback: "0.05", "Wet LPF": "5 kHz" },
        prompt:
          'Make "Slapback" — a single short echo that adds size without being heard as a delay. Controls: Amount (0.0 default), Time, Feedback, Wet LPF, Mix. Preset: 80 ms, feedback 0.05, wet LPF 5 kHz, 20% mix.',
      },
      {
        name: "Throw / Transition Echo",
        params: { Amount: 68, Mix: "0% → automate", Time: "3/16", Feedback: "0.55", Automate: "last word of phrase" },
        prompt:
          'Create "Throw" — a delay I can automate to fire only on the last word of a phrase before a section change. Controls: Amount (0.0 default, automatable), Time, Feedback, Mix, Sync, Wet filters. Preset: 3/16 time, feedback 0.55, automate the Mix from 0.0 to 60% on the final word.',
      },
      {
        name: "Ping-Pong Wide",
        params: { Amount: 54, Mix: "25%", Time: "1/4", Feedback: "0.4", Mode: "ping-pong", Width: "130%" },
        prompt:
          'Build "Ping-Pong Wide" — a stereo alternating delay with a width control. Controls: Amount (0.0 default), Time, Feedback, Mode, Width, Wet filters, Mix. Preset: 1/4 time, feedback 0.4, ping-pong mode, width 130%, 25% mix.',
      },
      {
        name: "Rap Ad-lib Chorus Echo",
        params: { Amount: 58, Mix: "28%", Time: "1/8", Feedback: "0.45", "Wet LPF": "4.5 kHz", Pan: "alternate" },
        prompt:
          'Make "Ad-lib Echo" — a filtered, panning delay for ad-libs and background vocal stabs. Controls: Amount (0.0 default), Time, Feedback, Wet LPF, Pan mode, Mix. Preset: 1/8 time, feedback 0.45, wet LPF 4.5 kHz, alternate panning, 28% mix.',
      },
      {
        name: "Dub Feedback Runaway",
        params: { Amount: 76, Mix: "45%", Time: "1/4 dotted", Feedback: "0.85", Drive: "0.4", "Wet LPF": "3.5 kHz" },
        prompt:
          'Create "Dub Runaway" — a high-feedback dub delay with drive and self-oscillation on demand. Controls: Amount (0.0 default), Time, Feedback, Drive, Wet LPF, Freeze, Mix. Preset: 1/4 dotted, feedback 0.85, drive 0.4, wet LPF 3.5 kHz, 45% mix, plus a Freeze button.',
      },
      {
        name: "Ambient Long Bloom",
        params: { Amount: 66, Mix: "40%", Time: "1/2", Feedback: "0.7", Mod: "0.3", "Wet LPF": "7 kHz" },
        prompt:
          'Build "Long Bloom" — a slow, modulated long delay for ambient pads and post-rock guitar. Controls: Amount (0.0 default), Time, Feedback, Mod depth, Wet LPF, Mix, Kill-dry switch. Preset: 1/2 time, feedback 0.7, mod depth 0.3, 40% mix, kill-dry on.',
      },
      {
        name: "Rhythmic Multi-Tap",
        params: { Amount: 62, Mix: "30%", Taps: "4", Pattern: "1/16, 1/8, 1/4, 1/2", "Per-tap pan": "on" },
        prompt:
          'Make "Multi-Tap" — a four-tap delay with independent time, level and pan per tap. Controls: Amount (0.0 default), Taps, per-tap Time/Level/Pan, Feedback, Mix. Preset "Rhythmic Multi-Tap": taps at 1/16, 1/8, 1/4 and 1/2, levels 60/45/35/25%, alternating pan, 30% mix.',
      },
    ],
  },
  {
    id: "tape-delay",
    name: "Tape Delay (w/ Wobble)",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "📼",
    target: "Vocals, guitar, dub, lo-fi",
    oneLiner:
      "Tape-echo emulation with wow/flutter, tape saturation, age and a wobble that drifts instead of clicking.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Time", value: "0.0 ms" },
      { name: "Feedback", value: "0.0" },
      { name: "Wobble", value: "0.0" },
      { name: "Age", value: "0.0" },
    ],
    tip: "Wobble is the artefact-hider here: it makes pitch instability sound intentional, which is exactly what an AI vocal needs. Keep wobble slow (0.3–0.8 Hz) and shallow or it becomes a vibrato effect.",
    presets: [
      {
        name: "Warm Tape Echo",
        params: { Amount: 50, Mix: "24%", Time: "1/8 dotted", Feedback: "0.35", Wobble: "0.25", Age: "0.3" },
        prompt:
          'Build "Tape Echo" — a tape delay with wow/flutter, tape drive and age controls. Controls: Amount (0.0 default), Time, Feedback, Wobble rate, Wobble depth, Drive, Age, Mix. Preset "Warm Tape Echo": 1/8 dotted, feedback 0.35, wobble 0.3 Hz at depth 0.25, drive 0.3, age 0.3, 24% mix.',
      },
      {
        name: "Dub Wobble Echo",
        params: { Amount: 68, Mix: "40%", Time: "1/4", Feedback: "0.7", Wobble: "0.6", Drive: "0.5" },
        prompt:
          'Make "Dub Wobble" — a heavily wobbling tape delay for dub and reggae throws. Controls: Amount (0.0 default), Time, Feedback, Wobble rate/depth, Drive, Wet LPF, Mix. Preset: 1/4 time, feedback 0.7, wobble 0.6 Hz depth 0.5, drive 0.5, wet LPF 4 kHz, 40% mix.',
      },
      {
        name: "Lo-Fi Cassette Echo",
        params: { Amount: 58, Mix: "32%", Time: "1/8", Feedback: "0.45", Age: "0.75", "Wet LPF": "4 kHz" },
        prompt:
          'Create "Cassette Echo" — an aged tape delay band-limited to 4 kHz for lo-fi hip-hop. Controls: Amount (0.0 default), Time, Feedback, Age, Wet LPF, Hiss, Mix. Preset: 1/8 time, feedback 0.45, age 0.75, wet LPF 4 kHz, hiss 0.2, 32% mix.',
      },
      {
        name: "Slapback Tape (Rockabilly)",
        params: { Amount: 46, Mix: "26%", Time: "95 ms", Feedback: "0.1", Drive: "0.45", Wobble: "0.15" },
        prompt:
          'Build "Rockabilly Slap" — a single tape slapback with slight wow. Controls: Amount (0.0 default), Time, Feedback, Drive, Wobble, Mix. Preset: 95 ms, feedback 0.1, drive 0.45, wobble depth 0.15, 26% mix.',
      },
      {
        name: "Space Echo Multi-Head",
        params: { Amount: 64, Mix: "36%", Heads: "3", Spacing: "1/8, 1/4, 3/8", Feedback: "0.55", Spring: "on" },
        prompt:
          'Make "Space Echo" — a multi-head tape delay where each head has its own time, level and pan. Controls: Amount (0.0 default), Heads, per-head time/level/pan, Feedback, Spring reverb on/off, Wobble, Mix. Preset: 3 heads at 1/8, 1/4 and 3/8, feedback 0.55, spring on, 36% mix.',
      },
      {
        name: "Analog Drift (Slow)",
        params: { Amount: 44, Mix: "18%", Time: "1/4 dotted", Feedback: "0.3", Wobble: "0.12", "Drift Rate": "0.15 Hz" },
        prompt:
          'Build "Analog Drift" — a tape delay with a very slow pitch drift so long echoes wander gently. Controls: Amount (0.0 default), Time, Feedback, Drift rate, Drift depth, Mix. Preset: 1/4 dotted, feedback 0.3, drift 0.15 Hz at depth 0.3, 18% mix.',
      },
      {
        name: "Tape Stop Echo",
        params: { Amount: 70, Mix: "35%", Time: "1/8", Feedback: "0.5", "Stop Time": "1 bar", Sync: "tempo" },
        prompt:
          'Create "Tape Stop Echo" — a tape delay with a motor stop/ramp button that slows the echo to a halt over a set time. Controls: Amount (0.0 default), Time, Feedback, Stop time, Stop direction, Mix. Preset: 1/8 time, feedback 0.5, 1-bar stop, 35% mix.',
      },
      {
        name: "Vocal Width Echo (mono-safe)",
        params: { Amount: 48, Mix: "20%", Time: "1/8", Feedback: "0.28", Width: "stereo wet, mono dry", "Wet HPF": "300 Hz" },
        prompt:
          'Make "Mono-Safe Echo" — a delay with a dry mono path and a stereo wet path so the vocal stays centred while the echoes widen. Controls: Amount (0.0 default), Time, Feedback, Width mode, Wet HPF/LPF, Mix. Preset: 1/8 time, feedback 0.28, wet HPF 300 Hz, mono dry, 20% mix.',
      },
    ],
  },
  {
    id: "pingpong-filter-delay",
    name: "Ping-Pong Filter Delay",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "🏓",
    target: "Leads, vocals, percussion, synths",
    oneLiner:
      "Alternating stereo delay where each repeat runs through its own filter — echoes get darker (or brighter) as they go.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Time", value: "0.0 ms" },
      { name: "Feedback", value: "0.0" },
      { name: "Filter", value: "flat" },
    ],
    tip: "Filter-per-repeat is the single best trick for making AI delay tails sound designed rather than generated. Negative feedback mode (echoes get brighter) is great for risers.",
    presets: [
      {
        name: "Darkening Echo",
        params: { Amount: 54, Mix: "26%", Time: "1/8", Feedback: "0.45", "Filter Per Repeat": "-1.5 kHz", Mode: "ping-pong" },
        prompt:
          'Build "Darkening Echo" — a ping-pong delay where each successive repeat is filtered darker. Controls: Amount (0.0 default), Time, Feedback, Filter per repeat, Direction (darker/brighter), Mode, Mix. Preset "Darkening Echo": 1/8 time, feedback 0.45, each repeat LPF drops 1.5 kHz, ping-pong mode, 26% mix.',
      },
      {
        name: "Brightening Riser Echo",
        params: { Amount: 62, Mix: "34%", Time: "1/16", Feedback: "0.6", "Filter Per Repeat": "+2 kHz", HPF: "300 Hz" },
        prompt:
          'Make "Bright Riser" — a fast ping-pong delay whose repeats get brighter and wider, for build-ups. Controls: Amount (0.0 default), Time, Feedback, Filter direction, HPF, Width, Mix. Preset: 1/16, feedback 0.6, each repeat HPF rises, 300 Hz floor, 34% mix.',
      },
      {
        name: "Filtered Throw (vocal)",
        params: { Amount: 58, Mix: "30%", Time: "3/16", Feedback: "0.5", "Wet Band": "800 Hz–4 kHz" },
        prompt:
          'Create "Filtered Throw" — a band-limited ping-pong delay for vocal throws between sections. Controls: Amount (0.0 default), Time, Feedback, Wet band edges, Pan mode, Mix. Preset: 3/16, feedback 0.5, wet band 800 Hz–4 kHz, 30% mix.',
      },
      {
        name: "LFO Filter Echo",
        params: { Amount: 60, Mix: "32%", Time: "1/4", Feedback: "0.5", "LFO Rate": "1/2", "LFO Depth": "0.4" },
        prompt:
          'Build "LFO Echo" — a ping-pong delay whose wet filter sweeps on an LFO. Controls: Amount (0.0 default), Time, Feedback, LFO rate, LFO depth, Filter base, Mix. Preset: 1/4 time, feedback 0.5, 1/2-note LFO at 0.4 depth, 32% mix.',
      },
      {
        name: "Percussion Bounce",
        params: { Amount: 52, Mix: "24%", Time: "1/16", Feedback: "0.35", Pan: "hard alternate", "Wet HPF": "400 Hz" },
        prompt:
          'Make "Perc Bounce" — a hard-panning short delay for shakers, hats and percussion that turns one hit into a groove. Controls: Amount (0.0 default), Time, Feedback, Pan mode, Wet HPF, Mix. Preset: 1/16, feedback 0.35, hard alternate pan, wet HPF 400 Hz, 24% mix.',
      },
      {
        name: "Guitar Slap + Ping",
        params: { Amount: 50, Mix: "22%", Time: "120 ms", Feedback: "0.3", "Second Tap": "1/4", Drive: "0.3" },
        prompt:
          'Create "Slap + Ping" — a slapback with a second tempo-synced ping for rock and indie guitar. Controls: Amount (0.0 default), Slap time, Second tap, Feedback, Drive, Mix. Preset: 120 ms slap, second tap 1/4, feedback 0.3, drive 0.3, 22% mix.',
      },
      {
        name: "Reverse Ping (Pre-echo)",
        params: { Amount: 56, Mix: "28%", Time: "1/8", Feedback: "0.4", Mode: "reverse", Width: "120%" },
        prompt:
          'Build "Reverse Ping" — a delay whose echoes play backwards before the note, for ambient pre-echo. Controls: Amount (0.0 default), Time, Feedback, Mode, Width, Mix. Preset: 1/8, feedback 0.4, reverse mode, width 120%, 28% mix.',
      },
      {
        name: "Sidechained Echo (Clears for Vocal)",
        params: { Amount: 56, Mix: "30%", Time: "1/8 dotted", Feedback: "0.45", Duck: "-8 dB", Release: "350 ms" },
        prompt:
          'Make "Ducked Echo" — a ping-pong delay that ducks under the vocal and blooms between phrases. Controls: Amount (0.0 default), Time, Feedback, Duck depth, Duck release, Trigger source, Mix. Preset: 1/8 dotted, feedback 0.45, -8 dB duck, 350 ms release, triggered by the lead vocal.',
      },
    ],
  },
  {
    id: "chorus",
    name: "Chorus / Ensemble",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "🌊",
    target: "Vocals, guitars, synths, bass (careful)",
    oneLiner:
      "Multi-voice modulated delay for width and thickness, with rate, depth, voices, spread and a mono-bass guard.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Rate", value: "0.0 Hz" },
      { name: "Depth", value: "0.0" },
      { name: "Voices", value: "1" },
      { name: "Spread", value: "0.0%" },
    ],
    tip: "Chorus on an AI vocal is a cheap fix for pitch wobble — but it also blurs consonants. Use short depth, 2 voices, 25–35% mix, and keep the bass path mono below 120 Hz.",
    presets: [
      {
        name: "80s Vocal Chorus",
        params: { Amount: 46, Mix: "32%", Rate: "0.6 Hz", Depth: "0.3", Voices: "2", Spread: "90%" },
        prompt:
          'Build "80s Chorus" — a two-voice chorus with rate, depth, spread and mono-below guard. Controls: Amount (0.0 default), Rate, Depth, Voices, Spread, Mono-below, Mix. Preset "80s Vocal Chorus": rate 0.6 Hz, depth 0.3, 2 voices, spread 90%, mono below 120 Hz, 32% mix.',
      },
      {
        name: "Subtle Vocal Thickener",
        params: { Amount: 32, Mix: "18%", Rate: "0.3 Hz", Depth: "0.15", Voices: "2", Spread: "60%" },
        prompt:
          'Make "Thickener" — a barely-there chorus that adds width to a vocal without warbling. Controls: Amount (0.0 default), Rate, Depth, Voices, Spread, Mix. Preset: rate 0.3 Hz, depth 0.15, 2 voices, 60% spread, 18% mix.',
      },
      {
        name: "Nirvana-Style Guitar Chorus",
        params: { Amount: 58, Mix: "45%", Rate: "1.2 Hz", Depth: "0.5", Voices: "2", Tone: "LPF 6 kHz" },
        prompt:
          'Create "Grunge Chorus" — a deeper chorus for clean electric guitar. Controls: Amount (0.0 default), Rate, Depth, Voices, Tone LPF, Mix. Preset: rate 1.2 Hz, depth 0.5, 2 voices, wet LPF 6 kHz, 45% mix.',
      },
      {
        name: "Super Synth Ensemble",
        params: { Amount: 64, Mix: "50%", Rate: "0.8 Hz", Depth: "0.6", Voices: "4", Spread: "130%" },
        prompt:
          'Build "Super Ensemble" — a four-voice ensemble for string machines and supersaws. Controls: Amount (0.0 default), Rate, Depth, Voices, Spread, Mono-below, Mix. Preset: rate 0.8 Hz, depth 0.6, 4 voices, spread 130%, mono below 100 Hz, 50% mix.',
      },
      {
        name: "Bass Chorus (Top Only)",
        params: { Amount: 44, Mix: "30%", Rate: "0.4 Hz", Depth: "0.35", Band: "300 Hz–4 kHz" },
        prompt:
          'Make "Bass Top Chorus" — a band-limited chorus that only affects 300 Hz–4 kHz so the sub stays tight and mono. Controls: Amount (0.0 default), Rate, Depth, Band edges, Mix. Preset: rate 0.4 Hz, depth 0.35, band 300 Hz–4 kHz, 30% mix.',
      },
      {
        name: "Warble Lo-Fi Chorus",
        params: { Amount: 54, Mix: "40%", Rate: "0.2 Hz", Depth: "0.7", Drift: "random", Tone: "LPF 7 kHz" },
        prompt:
          'Create "Warble" — a slow, deep, randomly drifting chorus that mimics a worn cassette. Controls: Amount (0.0 default), Rate, Depth, Drift mode, Tone, Mix. Preset: rate 0.2 Hz, depth 0.7, random drift, wet LPF 7 kHz, 40% mix.',
      },
      {
        name: "Pitch-Fix Masker",
        params: { Amount: 40, Mix: "24%", Rate: "0.5 Hz", Depth: "0.25", Voices: "3", "Random Phase": "on" },
        prompt:
          'Build "Wobble Masker" — a chorus designed to hide small pitch wobble in an AI vocal, with random-phase voices so it never sounds like a chorus. Controls: Amount (0.0 default), Rate, Depth, Voices, Random phase, Mix. Preset: rate 0.5 Hz, depth 0.25, 3 voices, random phase on, 24% mix.',
      },
      {
        name: "Vibrato (No Wet Blend)",
        params: { Amount: 56, Mix: "100%", Rate: "5.5 Hz", Depth: "0.35", Voices: "1", Wave: "sine" },
        prompt:
          'Create "Tape Vibrato" — the same engine in vibrato mode: 100% wet, no blend, for pitch movement. Controls: Amount (0.0 default), Rate, Depth, Voices, Wave shape, Mix. Preset: rate 5.5 Hz, depth 0.35, single voice, sine, mix 100%.',
      },
    ],
  },
];
