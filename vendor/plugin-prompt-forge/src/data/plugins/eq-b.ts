import type { Plugin } from "../types";

export const eqB: Plugin[] = [
  {
    id: "air-exciter",
    name: "Air Exciter / Harmonic Enhancer",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "✨",
    target: "Vocals, master, dull stems",
    oneLiner:
      "Generates new high harmonics instead of just boosting shelf EQ — brightness without the fizz or the harshness.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Drive", value: "0.0" },
      { name: "Crossover", value: "6 kHz" },
      { name: "Air", value: "0.0 dB" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Air is where AI artifacts live. Excite in the 6–9 kHz band (definition) rather than above 12 kHz (glass), and always A/B at matched loudness — exciters trick your ears into thinking louder is better.",
    presets: [
      {
        name: "Vocal Air Lift",
        params: { Amount: 40, Drive: "0.35", Crossover: "7 kHz", Air: "+3 dB", Mix: "70%" },
        prompt:
          'Build "Air Lift" — a harmonic exciter for vocals that generates 2nd and 3rd order harmonics above a crossover. Controls: Amount (0.0 default), Drive, Crossover, Air, Harmonic order, Mix, Listen. Preset "Vocal Air Lift": drive 0.35, crossover 7 kHz, +3 dB air, mix 70%.',
      },
      {
        name: "Master Sheen (Safe)",
        params: { Amount: 28, Drive: "0.2", Crossover: "5.5 kHz", Air: "+2 dB", Ceiling: "-1 dBTP" },
        prompt:
          'Make "Master Sheen" — a gentle mastering exciter with a true-peak safety ceiling. Controls: Amount (0.0 default), Drive, Crossover, Air, Ceiling, Mix. Preset: drive 0.2, crossover 5.5 kHz, +2 dB air, ceiling -1 dBTP, 50% mix.',
      },
      {
        name: "Drum Snap Enhancer",
        params: { Amount: 50, Drive: "0.45", Crossover: "3.5 kHz", Snap: "+3 dB", Mix: "80%" },
        prompt:
          'Create "Drum Snap" — an exciter band-limited to 3.5–9 kHz so kick and snare attacks cut through a dense AI mix. Controls: Amount (0.0 default), Drive, Band start, Band end, Amount of enhancement, Mix. Preset: drive 0.45, band 3.5–9 kHz, +3 dB, 80% mix.',
      },
      {
        name: "Tape-Style Warm Excite",
        params: { Amount: 44, Drive: "0.55", Order: "2nd", Crossover: "1.2 kHz", Bias: "low", Mix: "60%" },
        prompt:
          'Build "Warm Excite" — a low-order harmonic generator tuned like tape bias for material that needs weight, not sparkle. Controls: Amount (0.0 default), Drive, Harmonic order, Crossover, Bias, Mix. Preset: drive 0.55, 2nd order only, crossover 1.2 kHz, bias low, 60% mix.',
      },
      {
        name: "Presence for Small Speakers",
        params: { Amount: 52, Drive: "0.4", Band: "2–5 kHz", Boost: "+3 dB", Mono: "off" },
        prompt:
          'Make "Phone Check" — an exciter focused on the 2–5 kHz band so a mix keeps its shape on phone speakers. Controls: Amount (0.0 default), Drive, Band, Boost, Mix. Preset: drive 0.4, band 2–5 kHz, +3 dB, mix 75%.',
      },
      {
        name: "Acoustic String Air",
        params: { Amount: 34, Drive: "0.25", Crossover: "9 kHz", Air: "+2.5 dB", Mix: "65%" },
        prompt:
          'Create "String Air" — a very high crossover exciter for acoustic guitar and piano, adding finger noise and hammer air only. Controls: Amount (0.0 default), Drive, Crossover, Air, Mix. Preset: drive 0.25, crossover 9 kHz, +2.5 dB, 65% mix.',
      },
      {
        name: "Analog Sizzle for Hip-Hop",
        params: { Amount: 58, Drive: "0.6", Crossover: "6 kHz", Sizzle: "+4 dB", Tilt: "+1 dB/oct" },
        prompt:
          'Build "Sizzle" — a hip-hop exciter that adds high-frequency sizzle over an 808 without touching the sub. Controls: Amount (0.0 default), Drive, Crossover, Sizzle, Tilt, HPF on detector, Mix. Preset: drive 0.6, crossover 6 kHz, +4 dB sizzle, detector HPF 150 Hz, mix 70%.',
      },
      {
        name: "Exciter for Vocals After Dereverb",
        params: { Amount: 46, Drive: "0.3", Crossover: "8 kHz", Air: "+2 dB", Recovery: "on" },
        prompt:
          'Make "Post-Dry Air" — an exciter to run after de-reverb, which always dulls a vocal. Controls: Amount (0.0 default), Drive, Crossover, Air, Mix, Recovery tilt. Preset: drive 0.3, crossover 8 kHz, +2 dB air, +1 dB recovery tilt at 3 kHz, mix 60%.',
      },
    ],
  },
  {
    id: "sub-harmonic",
    name: "Sub Harmonic Generator",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "🔊",
    target: "Kick, 808, bass, master",
    oneLiner:
      "Synthesises an octave below the source and locks it in phase. Adds weight that survives phone-speaker playback.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Octave", value: "0.0 dB" },
      { name: "Crossover", value: "60 Hz" },
      { name: "Phase", value: "0.0°" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Always mono the generated sub below 100 Hz and high-pass the original at 30 Hz. Generated sub content on AI material is where muddiness and phase cancellation start.",
    presets: [
      {
        name: "808 Weight Boost",
        params: { Amount: 50, Octave: "+4 dB", Crossover: "55 Hz", Phase: "0°", Mono: "below 100 Hz" },
        prompt:
          'Build "Sub Weight" — a sub-harmonic generator that adds a synthesised octave below the source, phase-locked. Controls: Amount (0.0 default), Octave level, Crossover, Phase, Mono-below, Mix, Listen. Preset "808 Weight Boost": +4 dB octave, crossover 55 Hz, phase 0°, mono below 100 Hz.',
      },
      {
        name: "Kick Sub Layer",
        params: { Amount: 58, Octave: "+5 dB", Crossover: "70 Hz", Attack: "0 ms", Tune: "+0 st" },
        prompt:
          'Make "Kick Sub" — a generated sine sub layered under the kick, following its envelope. Controls: Amount (0.0 default), Octave level, Tune, Envelope attack, Decay, Phase, Mix. Preset: +5 dB, tune 0 semitones, 0 ms attack, decay 180 ms, phase 0°.',
      },
      {
        name: "Cinematic Low Rumble",
        params: { Amount: 62, Octave: "+6 dB", Crossover: "40 Hz", Decay: "2.5 s", Phase: "0°" },
        prompt:
          'Create "Cinematic Rumble" — a long-decay sub-harmonic generator for trailer impacts. Controls: Amount (0.0 default), Octave, Crossover, Attack, Decay, Phase, Mix. Preset: +6 dB, crossover 40 Hz, 20 ms attack, 2.5 s decay.',
      },
      {
        name: "Trap 808 Tail Fill",
        params: { Amount: 55, Octave: "+4.5 dB", Crossover: "60 Hz", Sustain: "on", Glide: "follow" },
        prompt:
          'Build "808 Tail" — a sub generator with a sustain stage so 808 notes ring the full bar even if the source decays early. Controls: Amount (0.0 default), Octave, Crossover, Sustain time, Glide mode, Phase. Preset: +4.5 dB, crossover 60 Hz, sustain until note-off, glide follows source pitch.',
      },
      {
        name: "Master Low End Glue",
        params: { Amount: 24, Octave: "+2 dB", Crossover: "45 Hz", Phase: "linear", Mono: "below 90 Hz" },
        prompt:
          'Make "Master Low Glue" — a very subtle sub generator for the master bus, phase-linear so nothing cancels. Controls: Amount (0.0 default), Octave, Crossover, Phase mode, Mono-below, Mix. Preset: +2 dB, crossover 45 Hz, linear phase, mono below 90 Hz.',
      },
      {
        name: "Acoustic Bass Thickener",
        params: { Amount: 36, Octave: "+2.5 dB", Crossover: "80 Hz", Phase: "180°", Mix: "50%" },
        prompt:
          'Create "Upright Weight" — a subtle sub octave for upright or fingered bass stems. Controls: Amount (0.0 default), Octave, Crossover, Phase, Mix. Preset: +2.5 dB, crossover 80 Hz, phase 180° (try both and pick the fatter result), 50% mix.',
      },
      {
        name: "Live Drum Reinforce",
        params: { Amount: 48, Octave: "+3.5 dB", Crossover: "65 Hz", Tune: "-0 st", Gate: "on" },
        prompt:
          'Build "Kick Reinforce" — a gated sub generator that only fires on kick hits so the rest of the kit stays clean. Controls: Amount (0.0 default), Octave, Crossover, Tune, Gate threshold, Attack, Release. Preset: +3.5 dB, crossover 65 Hz, gate threshold -24 dB, attack 0 ms, release 120 ms.',
      },
      {
        name: "Sub Drop Effect",
        params: { Amount: 66, Octave: "+6 dB", Sweep: "-12 st", Time: "1 bar", Sync: "tempo" },
        prompt:
          'Make "Sub Drop" — a sub-harmonic generator whose pitch sweeps down an octave over one bar for transitions. Controls: Amount (0.0 default), Octave, Sweep range, Sweep time, Sync, Mix. Preset: +6 dB, -12 semitone sweep, 1 bar, tempo synced.',
      },
    ],
  },
  {
    id: "bandpass-filter",
    name: "Bandpass / Creative Filter",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "📡",
    target: "FX throws, transitions, lo-fi texture",
    oneLiner:
      "Resonant multi-mode filter with LFO and envelope followers. From subtle sweeps to full radio-bandwidth destruction.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Cutoff", value: "0.0 (open)" },
      { name: "Resonance", value: "0.0" },
      { name: "LFO", value: "0.0 depth" },
      { name: "Env", value: "0.0 depth" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Filters are the safest place to be extreme on AI material — a hard band-limit hides artifacts that a boost would expose. Automate cutoff, not volume, for transitions.",
    presets: [
      {
        name: "Radio VOX",
        params: { Amount: 68, Mode: "bandpass", Cutoff: "1.6 kHz", Res: "0.3", "Band": "500 Hz–3.2 kHz", Mix: "100%" },
        prompt:
          'Build "Radio VOX" — a bandpass filter with resonance for telephone and megaphone vocal effects. Controls: Amount (0.0 default), Mode, Cutoff, Resonance, Band edges, Drive, Mix. Preset "Radio VOX": band 500 Hz–3.2 kHz, resonance 0.3, drive 0.4, full wet.',
      },
      {
        name: "Filter Sweep Build",
        params: { Amount: 60, Mode: "LP", Cutoff: "200 Hz → 18 kHz", Res: "0.15", Time: "8 bars", Sync: "tempo" },
        prompt:
          'Make "Build Sweep" — a low-pass filter that opens from 200 Hz to 18 kHz over 8 bars, tempo-synced. Controls: Amount (0.0 default), Mode, Start cutoff, End cutoff, Sweep time, Resonance, Mix. Preset: resonance 0.15, 8-bar sweep, full wet, curve exponential.',
      },
      {
        name: "Auto Filter (Envelope Follow)",
        params: { Amount: 52, Mode: "LP", Cutoff: "2 kHz", "Env Depth": "0.5", Attack: "5 ms", Release: "200 ms" },
        prompt:
          'Create "Auto Filter" — an envelope-following filter where the cutoff tracks the input level. Controls: Amount (0.0 default), Mode, Base cutoff, Env depth, Attack, Release, Resonance. Preset: base 2 kHz, env depth 0.5, attack 5 ms, release 200 ms.',
      },
      {
        name: "LFO Wobble Filter",
        params: { Amount: 64, Mode: "LP", Cutoff: "1.2 kHz", "LFO Rate": "1/8", "LFO Depth": "0.6", Res: "0.35" },
        prompt:
          'Build "Wobble Filter" — an LFO-modulated low-pass for dubstep-style wobble on bass and pads. Controls: Amount (0.0 default), Mode, Cutoff, LFO rate (tempo synced), LFO depth, Resonance, LFO shape. Preset: cutoff 1.2 kHz, 1/8 rate, depth 0.6, resonance 0.35, sine LFO.',
      },
      {
        name: "Notch Sweep / Jet Pass",
        params: { Amount: 56, Mode: "notch", Cutoff: "1 kHz", Res: "0.7", "LFO Rate": "1/4", Depth: "0.4" },
        prompt:
          'Make "Jet Pass" — a resonant notch sweeping for a whooshing transition effect. Controls: Amount (0.0 default), Mode, Cutoff, Resonance, LFO rate, Depth, Mix. Preset: notch mode, cutoff 1 kHz, resonance 0.7, 1/4 LFO, 0.4 depth, full wet.',
      },
      {
        name: "Lo-Fi Band Limit",
        params: { Amount: 58, Mode: "LP+HP", HPF: "200 Hz", LPF: "7 kHz", Drive: "0.3", Mix: "100%" },
        prompt:
          'Create "Lo-Fi Band" — a combined HP/LP band limit for bedroom-pop and lo-fi textures. Controls: Amount (0.0 default), HPF, LPF, Resonance, Drive, Mix. Preset: HPF 200 Hz, LPF 7 kHz, drive 0.3, full wet.',
      },
      {
        name: "Formant-Style Sweep",
        params: { Amount: 50, Mode: "3-band formant", Sweep: "A → E", Time: "1/2", Mix: "80%" },
        prompt:
          'Build "Formant Sweep" — three parallel bandpass filters tuned to vowel formants, sweeping between shapes. Controls: Amount (0.0 default), Vowel A, Vowel B, Sweep time, Resonance, Mix. Preset: sweep A→E over a 1/2 note, resonance 0.5, 80% wet.',
      },
      {
        name: "Sidechain-Triggered Filter",
        params: { Amount: 62, Mode: "LP", Cutoff: "1.5 kHz", Trigger: "kick", Recovery: "1/8", Res: "0.2" },
        prompt:
          'Make "Kick-Open Filter" — a filter held closed that snaps open on every kick hit and closes again after a 1/8 note. Controls: Amount (0.0 default), Trigger source, Open cutoff, Closed cutoff, Recovery, Resonance. Preset: trigger = kick track, open 12 kHz, closed 1.5 kHz, recovery 1/8 note.',
      },
    ],
  },
  {
    id: "mud-harsh-cutter",
    name: "Mud & Harshness Cutter",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "🧽",
    target: "Any muddy or fizzy AI stem",
    oneLiner:
      "Two purpose-built dynamic bands: one for low-mid mud, one for high-mid harshness. The 'make it sound produced' button.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mud Cut", value: "0.0 dB" },
      { name: "Harsh Cut", value: "0.0 dB" },
      { name: "Thresholds", value: "off" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "AI mixes almost always fail in the same two places: 180–350 Hz (mud) and 3–6 kHz (harshness). Fix those two bands dynamically and 80% of the 'generated' sound disappears.",
    presets: [
      {
        name: "Mix Rescue (Both Bands)",
        params: { Amount: 46, "Mud": "-4 dB @ 240 Hz", "Harsh": "-3.5 dB @ 3.6 kHz", Mode: "dynamic", Mix: "100%" },
        prompt:
          'Build "Mix Rescue" — a two-band dynamic cutter with a MUD band and a HARSH band, each with its own threshold. Controls: Amount (0.0 default), Mud freq, Mud cut, Harsh freq, Harsh cut, Thresholds, Attack, Release, Mix, Listen. Preset "Mix Rescue": mud -4 dB at 240 Hz Q1.4, harsh -3.5 dB at 3.6 kHz Q2, dynamic mode, 20 ms attack, 160 ms release.',
      },
      {
        name: "Vocal Mud Only",
        params: { Amount: 42, Mud: "-3.5 dB @ 280 Hz", Harsh: "0 dB", Mode: "dynamic", Q: "1.2" },
        prompt:
          'Make "Vocal Mud" — just the low-mid dynamic band, tuned for vocals that sound thick but not harsh. Controls: Amount (0.0 default), Mud freq, Mud cut, Threshold, Attack, Release, Q. Preset: -3.5 dB at 280 Hz, threshold -18 dB, 25 ms attack, 200 ms release, Q 1.2.',
      },
      {
        name: "Full Mix Harsh Tame",
        params: { Amount: 50, Harsh: "-4 dB @ 4 kHz", Mud: "0 dB", Mode: "dynamic", Lookahead: "3 ms" },
        prompt:
          'Create "Harsh Tame" — only the high-mid dynamic band for a full mix that fatigues the ears. Controls: Amount (0.0 default), Harsh freq, Cut, Threshold, Attack, Release, Lookahead. Preset: -4 dB at 4 kHz, Q 2, threshold -12 dB, 3 ms lookahead, 120 ms release.',
      },
      {
        name: "Static Cut (No Detection)",
        params: { Amount: 38, Mud: "-3 dB @ 200 Hz", Harsh: "-2 dB @ 5 kHz", Mode: "static", Q: "wide" },
        prompt:
          'Build "Static Rescue" — the same two bands but in static mode with wide Q, for material that is uniformly muddy or harsh. Controls: Amount (0.0 default), Mud freq/cut, Harsh freq/cut, Q, Mix. Preset: -3 dB at 200 Hz Q0.8, -2 dB at 5 kHz Q1, full wet.',
      },
      {
        name: "Drum Box Removal",
        params: { Amount: 48, Mud: "-5 dB @ 320 Hz", Harsh: "-2.5 dB @ 2.8 kHz", Mode: "dynamic", Q: "1.6" },
        prompt:
          'Make "Box Off" — a mud/harsh cutter tuned for a drum bus that sounds like it was recorded in a cardboard box. Controls: Amount (0.0 default), Mud freq, Mud cut, Harsh freq, Harsh cut, Q, Mode. Preset: -5 dB at 320 Hz Q1.6, -2.5 dB at 2.8 kHz, dynamic mode.',
      },
      {
        name: "Master Two-Band Fix",
        params: { Amount: 24, Mud: "-1.5 dB @ 260 Hz", Harsh: "-1.5 dB @ 4.2 kHz", Mode: "dynamic", Ceiling: "-1 dBTP" },
        prompt:
          'Create "Master Rescue" — a mastering-safe version of the cutter with both bands capped at 1.5 dB. Controls: Amount (0.0 default), Band freqs, Max cut, Threshold, Mix, Output trim. Preset: 260 Hz and 4.2 kHz, 1.5 dB cap, dynamic mode, output auto-matched.',
      },
      {
        name: "Lo-Fi Mud On Purpose",
        params: { Amount: 60, Mud: "+5 dB @ 250 Hz", Harsh: "-6 dB @ 6 kHz", LPF: "9 kHz", Mix: "85%" },
        prompt:
          'Build "Cassette Mud" — the cutter inverted: boost the mud, cut the highs, for intentional lo-fi. Controls: Amount (0.0 default), Mud gain, Harsh cut, LPF, Drive, Mix. Preset: +5 dB at 250 Hz, -6 dB at 6 kHz, LPF 9 kHz, drive 0.35, 85% wet.',
      },
      {
        name: "Stem Match Cut",
        params: { Amount: 40, Mud: "auto", Harsh: "auto", Reference: "imported stem", "Max Cut": "-4 dB" },
        prompt:
          'Make "Auto Cut" — the mud and harsh bands auto-tuned by analysing a reference stem or full mix. Controls: Amount (0.0 default), Auto-detect, Max cut, Match strength, Listen, Bypass. Preset: max cut -4 dB per band, 60% match strength.',
      },
    ],
  },
];
