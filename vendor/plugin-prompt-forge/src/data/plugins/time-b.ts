import type { Plugin } from "../types";

export const timeB: Plugin[] = [
  {
    id: "flanger",
    name: "Flanger",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "✈️",
    target: "Guitars, drums, vocals, FX",
    oneLiner:
      "Short modulated delay with feedback and a through-zero option — from subtle jet to full metallic sweep.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Rate", value: "0.0 Hz" },
      { name: "Depth", value: "0.0" },
      { name: "Feedback", value: "0.0" },
      { name: "Delay", value: "0.0 ms" },
    ],
    tip: "Flanging is a superb disguise for AI cymbals and hats — it smears the exact frequencies where shimmer lives. Keep the rate slow on drums or it will pump the groove.",
    presets: [
      {
        name: "Classic Jet Plane",
        params: { Amount: 58, Mix: "40%", Rate: "0.25 Hz", Depth: "0.6", Feedback: "0.7", Delay: "3 ms" },
        prompt:
          'Build "Jet Flanger" — a flanger with rate, depth, feedback, manual delay and a through-zero mode. Controls: Amount (0.0 default), Rate, Depth, Feedback, Delay, Mode (normal / through-zero), Mix. Preset "Classic Jet Plane": rate 0.25 Hz, depth 0.6, feedback 0.7, 3 ms delay, normal mode, 40% mix.',
      },
      {
        name: "Subtle Drum Soften",
        params: { Amount: 36, Mix: "20%", Rate: "0.15 Hz", Depth: "0.25", Feedback: "0.2", Band: "5–14 kHz" },
        prompt:
          'Make "Cymbal Soften" — a band-limited flanger that blurs harsh AI cymbals without touching the kit body. Controls: Amount (0.0 default), Rate, Depth, Feedback, Band edges, Mix. Preset: rate 0.15 Hz, depth 0.25, feedback 0.2, band 5–14 kHz, 20% mix.',
      },
      {
        name: "Psychedelic Guitar Sweep",
        params: { Amount: 66, Mix: "50%", Rate: "0.5 Hz", Depth: "0.8", Feedback: "0.85", Mode: "through-zero" },
        prompt:
          'Create "Psych Flange" — a through-zero flanger with high feedback for psychedelic guitar. Controls: Amount (0.0 default), Rate, Depth, Feedback, Mode, Mix. Preset: rate 0.5 Hz, depth 0.8, feedback 0.85, through-zero mode, 50% mix.',
      },
      {
        name: "Vocal Ghost Layer",
        params: { Amount: 48, Mix: "28%", Rate: "0.1 Hz", Depth: "0.35", Feedback: "0.3", "Wet HPF": "250 Hz" },
        prompt:
          'Build "Ghost Vocal" — a slow flanger on a duplicated vocal path for an ethereal backing layer. Controls: Amount (0.0 default), Rate, Depth, Feedback, Wet HPF, Mix. Preset: rate 0.1 Hz, depth 0.35, feedback 0.3, wet HPF 250 Hz, 28% mix.',
      },
      {
        name: "Metal Rhythm Thickener",
        params: { Amount: 54, Mix: "35%", Rate: "0.35 Hz", Depth: "0.5", Feedback: "0.5", "Mono-below": "200 Hz" },
        prompt:
          'Make "Rhythm Flange" — a subtle flanger for heavy rhythm guitars that keeps the low end tight. Controls: Amount (0.0 default), Rate, Depth, Feedback, Mono-below, Mix. Preset: rate 0.35 Hz, depth 0.5, feedback 0.5, mono below 200 Hz, 35% mix.',
      },
      {
        name: "Automated Build Sweep",
        params: { Amount: 62, Mix: "45%", Rate: "0 → 8 Hz", Depth: "0.7", Automate: "8 bars", Sync: "tempo" },
        prompt:
          'Create "Flange Build" — a flanger whose rate and mix are automated over 8 bars into a drop. Controls: Amount (0.0 default), Rate, Depth, Feedback, Mix, automation range. Preset: rate from 0 to 8 Hz, mix from 0.0 to 45%, depth 0.7, over 8 bars.',
      },
      {
        name: "Barber-Pole Risers",
        params: { Amount: 60, Mix: "42%", Rate: "0.8 Hz", Depth: "0.9", Feedback: "0.9", Mode: "infinite" },
        prompt:
          'Build "Barber Pole" — an infinite-riseflanger for transitions that appears to rise forever. Controls: Amount (0.0 default), Rate, Depth, Feedback, Mode, Mix. Preset: rate 0.8 Hz, depth 0.9, feedback 0.9, infinite mode, 42% mix.',
      },
      {
        name: "Hats & Shaker Movement",
        params: { Amount: 44, Mix: "26%", Rate: "1/4 note", Depth: "0.4", Feedback: "0.25", Sync: "tempo" },
        prompt:
          'Make "Hat Flange" — a tempo-synced flanger for hats and shakers, subtle stereo movement. Controls: Amount (0.0 default), Rate (sync), Depth, Feedback, Width, Mix. Preset: rate 1/4 note, depth 0.4, feedback 0.25, 26% mix.',
      },
    ],
  },
  {
    id: "phaser",
    name: "Phaser",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "🛸",
    target: "Guitars, keys, pads, vocal FX",
    oneLiner:
      "Multi-stage all-pass phaser with centre frequency, stages, feedback and stereo spread.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Rate", value: "0.0 Hz" },
      { name: "Depth", value: "0.0" },
      { name: "Stages", value: "4" },
      { name: "Feedback", value: "0.0" },
    ],
    tip: "Phasers notch frequencies as they sweep — which makes them accidentally good at suppressing a fixed resonant whistle in AI material. Slow the rate right down (0.05–0.1 Hz) and it becomes a moving notch filter.",
    presets: [
      {
        name: "Classic 4-Stage Sweep",
        params: { Amount: 52, Mix: "40%", Rate: "0.4 Hz", Depth: "0.6", Stages: "4", Feedback: "0.4" },
        prompt:
          'Build "4-Stage Phaser" — a phaser with rate, depth, centre frequency, stage count and feedback. Controls: Amount (0.0 default), Rate, Depth, Centre, Stages, Feedback, Mix. Preset "Classic 4-Stage Sweep": rate 0.4 Hz, depth 0.6, 4 stages, feedback 0.4, 40% mix.',
      },
      {
        name: "Slow Funk Guitar",
        params: { Amount: 48, Mix: "35%", Rate: "0.15 Hz", Depth: "0.5", Stages: "8", Feedback: "0.3" },
        prompt:
          'Make "Funk Phaser" — a slow, deep 8-stage phaser for clean rhythm guitar. Controls: Amount (0.0 default), Rate, Depth, Stages, Feedback, Mix. Preset: rate 0.15 Hz, depth 0.5, 8 stages, feedback 0.3, 35% mix.',
      },
      {
        name: "Pad Movement (Subtle)",
        params: { Amount: 34, Mix: "22%", Rate: "0.08 Hz", Depth: "0.4", Stages: "6", Spread: "90°" },
        prompt:
          'Create "Pad Drift" — a very slow stereo phaser that keeps pads alive without being obvious. Controls: Amount (0.0 default), Rate, Depth, Stages, Spread, Mix. Preset: rate 0.08 Hz, depth 0.4, 6 stages, spread 90 degrees, 22% mix.',
      },
      {
        name: "Moving Notch (Artifact Killer)",
        params: { Amount: 44, Mix: "30%", Rate: "0.05 Hz", Depth: "0.3", Stages: "12", Band: "2–9 kHz" },
        prompt:
          'Build "Notch Drift" — a phaser used as a moving notch filter over 2–9 kHz to break up fixed resonant whistles in AI stems. Controls: Amount (0.0 default), Rate, Depth, Stages, Band edges, Mix. Preset: rate 0.05 Hz, depth 0.3, 12 stages, band 2–9 kHz, 30% mix.',
      },
      {
        name: "Rhodes / Keys Shimmer",
        params: { Amount: 42, Mix: "28%", Rate: "0.5 Hz", Depth: "0.35", Stages: "4", Tone: "LPF 8 kHz" },
        prompt:
          'Make "Keys Phaser" — a gentle phaser for electric piano and clav. Controls: Amount (0.0 default), Rate, Depth, Stages, Tone LPF, Mix. Preset: rate 0.5 Hz, depth 0.35, 4 stages, wet LPF 8 kHz, 28% mix.',
      },
      {
        name: "Vocal Robot Sweep",
        params: { Amount: 60, Mix: "45%", Rate: "1 Hz", Depth: "0.7", Stages: "8", Feedback: "0.6" },
        prompt:
          'Create "Robot Sweep" — a deep, fast phaser for robotic vocal FX. Controls: Amount (0.0 default), Rate, Depth, Stages, Feedback, Mix. Preset: rate 1 Hz, depth 0.7, 8 stages, feedback 0.6, 45% mix.',
      },
      {
        name: "Envelope Phaser",
        params: { Amount: 56, Mix: "40%", Source: "envelope", Depth: "0.6", Attack: "10 ms", Release: "300 ms" },
        prompt:
          'Build "Env Phaser" — a phaser whose sweep follows the input envelope instead of an LFO. Controls: Amount (0.0 default), Source (LFO/envelope), Depth, Attack, Release, Stages, Mix. Preset: envelope source, depth 0.6, attack 10 ms, release 300 ms, 40% mix.',
      },
      {
        name: "Step-Sequenced Phaser",
        params: { Amount: 58, Mix: "42%", Mode: "step", Steps: "16", "Rate": "1/8", Depth: "0.6" },
        prompt:
          'Make "Step Phaser" — a phaser whose centre frequency jumps through a 16-step sequence, tempo-synced. Controls: Amount (0.0 default), Mode, Steps, Rate, Depth, Randomise, Mix. Preset: 16 steps at 1/8 notes, depth 0.6, 42% mix, randomise button.',
      },
    ],
  },
  {
    id: "doubler",
    name: "Doubler / Thickener",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "👥",
    target: "Lead vocals, harmonies, guitars",
    oneLiner:
      "Micro-pitch and micro-timing doubling with per-voice detune, delay, pan and level. Fake a real double.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Voices", value: "0" },
      { name: "Detune", value: "0.0 cents" },
      { name: "Delay", value: "0.0 ms" },
      { name: "Width", value: "0.0%" },
    ],
    tip: "Real doubles are 10–25 ms late and 5–12 cents off, panned wide. This also breaks up the statistical regularity that makes an AI vocal sound synthetic — it is a cleaning tool, not just a fattener.",
    presets: [
      {
        name: "Wide Vocal Double",
        params: { Amount: 50, Mix: "35%", Voices: "2", Detune: "8 cents", Delay: "18 ms", Width: "100%" },
        prompt:
          'Build "Wide Double" — a vocal doubler with independent detune, delay, pan and level per voice. Controls: Amount (0.0 default), Voices, per-voice Detune, Delay, Pan, Level, Width, Mix. Preset "Wide Vocal Double": 2 voices, detune +8/-8 cents, delay 18/22 ms, hard panned, 35% mix.',
      },
      {
        name: "Tight Stadium Thicken",
        params: { Amount: 42, Mix: "25%", Voices: "2", Detune: "4 cents", Delay: "10 ms", Width: "70%" },
        prompt:
          'Make "Tight Thicken" — a close-panned, small-delay doubler for a denser lead vocal. Controls: Amount (0.0 default), Voices, Detune, Delay, Pan, Width, Mix. Preset: 2 voices, ±4 cents, 10 ms, width 70%, 25% mix.',
      },
      {
        name: "Choir Stack (4 voices)",
        params: { Amount: 60, Mix: "45%", Voices: "4", Detune: "12 cents", Delay: "25 ms", Width: "130%" },
        prompt:
          'Create "Choir Stack" — a four-voice doubler for turning one AI vocal into a choir. Controls: Amount (0.0 default), Voices, per-voice Detune/Delay/Pan, Width, Mix. Preset: 4 voices, ±12 cents spread across the stack, 25 ms average delay, width 130%, 45% mix.',
      },
      {
        name: "Rap Ad-lib Doubler",
        params: { Amount: 56, Mix: "40%", Voices: "2", Detune: "0 cents", Delay: "35 ms", Pan: "hard L/R" },
        prompt:
          'Build "Ad-lib Double" — a doubler with no pitch change, only timing and panning, so ad-libs stay in tune. Controls: Amount (0.0 default), Voices, Detune, Delay, Pan, Mix. Preset: 2 voices, 0 cents, 35 ms, hard panned, 40% mix.',
      },
      {
        name: "Guitar Double (Haas)",
        params: { Amount: 46, Mix: "30%", Voices: "2", Detune: "0 cents", Delay: "22 ms", Width: "100%" },
        prompt:
          'Make "Haas Double" — a pure Haas-style timing doubler for guitars, no pitch shift. Controls: Amount (0.0 default), Voices, Delay, Pan, Mono-compat check, Mix. Preset: 2 voices, 22 ms delay, hard panned, 30% mix, with a mono-compatibility warning.',
      },
      {
        name: "Formant Shift Double",
        params: { Amount: 52, Mix: "28%", Voices: "2", Formant: "-/+ 6%", Delay: "15 ms" },
        prompt:
          'Create "Formant Double" — a doubler that shifts formants instead of pitch, so the double sounds like a different person. Controls: Amount (0.0 default), Voices, Formant shift, Detune, Delay, Pan, Mix. Preset: 2 voices, ±6% formant, 15 ms, 28% mix.',
      },
      {
        name: "Thickener for Thin AI Vocal",
        params: { Amount: 54, Mix: "32%", Voices: "3", Detune: "6 cents", Delay: "12 ms", "Low Boost": "+2 dB @ 180 Hz" },
        prompt:
          'Make "Thin Fix" — a doubler plus a small low-mid lift, for AI vocals that sound thin and small. Controls: Amount (0.0 default), Voices, Detune, Delay, Low boost, Width, Mix. Preset: 3 voices, ±6 cents, 12 ms, +2 dB at 180 Hz, 32% mix.',
      },
      {
        name: "Octave Shimmer Double",
        params: { Amount: 58, Mix: "34%", Voices: "2", Octave: "+12 st", Detune: "5 cents", Pan: "wide" },
        prompt:
          'Build "Octave Double" — a doubler that adds an octave-up or octave-down ghost voice. Controls: Amount (0.0 default), Voices, Octave, Detune, Pan, Level, Mix. Preset: 2 voices at +12 st, 5 cents detune, wide pan, 34% mix.',
      },
    ],
  },
  {
    id: "granular-freeze",
    name: "Granular Freeze & Texture",
    kind: "Chat-built",
    category: "Time & Modulation",
    icon: "❄️",
    target: "Ambient pads, transitions, sound design",
    oneLiner:
      "Grain-based freeze, smear and texture generator — hold a moment of audio forever, or turn any stem into a cloud.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Grain Size", value: "0.0 ms" },
      { name: "Density", value: "0.0" },
      { name: "Position", value: "0.0" },
      { name: "Pitch", value: "0.0 st" },
    ],
    tip: "Grain size 80–250 ms and high density gives smooth clouds; tiny grains (10–40 ms) turn metallic. Freeze is also a great way to build an ambient bed that hides a bad generation.",
    presets: [
      {
        name: "Infinite Freeze Pad",
        params: { Amount: 64, Mix: "55%", "Grain Size": "180 ms", Density: "0.8", Mode: "freeze", Pitch: "0 st" },
        prompt:
          'Build "Freeze Pad" — a granular freeze with grain size, density, position, pitch and blend controls, plus a Freeze button. Controls: Amount (0.0 default), Grain size, Density, Position, Pitch, Mode, Mix. Preset "Infinite Freeze Pad": grain 180 ms, density 0.8, freeze mode, 55% mix.',
      },
      {
        name: "Ambient Cloud Wash",
        params: { Amount: 58, Mix: "45%", "Grain Size": "250 ms", Density: "0.9", Drift: "0.4", LPF: "6 kHz" },
        prompt:
          'Make "Cloud Wash" — a granular texture generator that turns any stem into an ambient bed. Controls: Amount (0.0 default), Grain size, Density, Drift, LPF, Mix. Preset: grain 250 ms, density 0.9, drift 0.4, wet LPF 6 kHz, 45% mix.',
      },
      {
        name: "Stutter Grains",
        params: { Amount: 62, Mix: "40%", "Grain Size": "60 ms", Density: "0.6", "Rate Sync": "1/16", Random: "on" },
        prompt:
          'Create "Grain Stutter" — a tempo-synced granular stutters for glitch and IDM textures. Controls: Amount (0.0 default), Grain size, Rate sync, Randomise, Density, Mix. Preset: grain 60 ms, 1/16 rate, randomise on, 40% mix.',
      },
      {
        name: "Pitch-Shifted Bloom",
        params: { Amount: 60, Mix: "48%", "Grain Size": "150 ms", Pitch: "+7 st", "Sweep Time": "4 bars" },
        prompt:
          'Build "Bloom" — a granular pitch shifter that sweeps from 0 to +7 semitones across 4 bars for a riser. Controls: Amount (0.0 default), Grain size, Pitch start, Pitch end, Sweep time, Mix. Preset: grain 150 ms, +7 st over 4 bars, 48% mix.',
      },
      {
        name: "Reverse Granular",
        params: { Amount: 56, Mix: "42%", "Grain Size": "200 ms", Mode: "reverse", "Grain Rate": "1/8" },
        prompt:
          'Make "Reverse Grains" — a granular processor playing reversed grains for a backwards ambient effect. Controls: Amount (0.0 default), Grain size, Mode, Grain rate, Density, Mix. Preset: grain 200 ms, reverse mode, 1/8 grain rate, 42% mix.',
      },
      {
        name: "Metallic Micro-Grain",
        params: { Amount: 52, Mix: "36%", "Grain Size": "18 ms", Density: "0.7", Feedback: "0.4" },
        prompt:
          'Create "Micro Metal" — a tiny-grain granular for bell-like and metallic textures. Controls: Amount (0.0 default), Grain size, Density, Feedback, Pitch, Mix. Preset: grain 18 ms, density 0.7, feedback 0.4, 36% mix.',
      },
      {
        name: "Vocal Texture Layer",
        params: { Amount: 48, Mix: "30%", "Grain Size": "120 ms", Drift: "0.5", "Wet HPF": "400 Hz" },
        prompt:
          'Build "Vocal Cloud" — a granular texture derived from the vocal, band-limited, to sit behind the dry lead. Controls: Amount (0.0 default), Grain size, Density, Drift, Wet HPF, Mix. Preset: grain 120 ms, drift 0.5, wet HPF 400 Hz, 30% mix.',
      },
      {
        name: "Loop-Seamless Grain",
        params: { Amount: 50, Mix: "34%", "Grain Size": "160 ms", "Loop Length": "2 bars", "Crossfade": "auto" },
        prompt:
          'Make "Seamless Loop" — a granular crossfade that makes any AI clip loop perfectly across a set bar length. Controls: Amount (0.0 default), Grain size, Loop length, Crossfade, Position, Mix. Preset: grain 160 ms, loop 2 bars, auto crossfade, 34% mix.',
      },
    ],
  },
];
