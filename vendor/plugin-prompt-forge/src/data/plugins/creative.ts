import type { Plugin } from "../types";

export const creative: Plugin[] = [
  {
    id: "trance-gate",
    name: "Trance Gate / Rhythm Gate",
    kind: "Chat-built",
    category: "Creative FX",
    icon: "🚧",
    target: "Pads, vocals, supersaws, risers",
    oneLiner:
      "Tempo-synced step gate with a drawable pattern, length control and filter per step.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Division", value: "1/16" },
      { name: "Pattern", value: "all open" },
      { name: "Length", value: "100%" },
    ],
    tip: "Gates are the cheapest way to make a static AI pad feel produced. Draw a pattern with a hole on the kick and the pad will breathe with the beat automatically.",
    presets: [
      {
        name: "Classic Trance 1/16",
        params: { Amount: 62, Mix: "80%", Division: "1/16", Length: "55%", Shape: "sharp" },
        prompt:
          'Build "Trance Gate" — a tempo-synced step gate with a drawable 16-step pattern, step length, shape smoothing and mix. Controls: Amount (0.0 default), Division, Pattern, Length, Shape, Mix, Sync. Preset "Classic Trance 1/16": 1/16 division, alternating on/off pattern, 55% step length, sharp shape, 80% mix.',
      },
      {
        name: "Vocal Chop Gate",
        params: { Amount: 56, Mix: "70%", Division: "1/8", Pattern: "custom", Length: "60%" },
        prompt:
          'Make "Vocal Gate" — a gate pattern for sustained vocals so they turn into rhythmic chops. Controls: Amount (0.0 default), Division, Pattern, Length, Smooth, Mix. Preset: 1/8 division, pattern with gaps on beats 2 and 4, 60% length, 70% mix.',
      },
      {
        name: "Slow Swell Gate",
        params: { Amount: 48, Mix: "60%", Division: "1/4", Length: "85%", Shape: "soft" },
        prompt:
          'Create "Swell Gate" — a slow gate with soft edges for pads that pulse rather than stutter. Controls: Amount (0.0 default), Division, Length, Shape, Mix. Preset: 1/4 division, 85% length, soft shape, 60% mix.',
      },
      {
        name: "Glitch Random Gate",
        params: { Amount: 66, Mix: "75%", Division: "1/32", Random: "on", "Density": "0.5" },
        prompt:
          'Build "Glitch Gate" — a randomised gate for IDM and glitch textures. Controls: Amount (0.0 default), Division, Random density, Re-seed, Smooth, Mix. Preset: 1/32 division, 0.5 density, re-seed button, 75% mix.',
      },
      {
        name: "Filter Gate Combo",
        params: { Amount: 58, Mix: "80%", Division: "1/16", "Per-step Filter": "on", "Filter Range": "1–12 kHz" },
        prompt:
          'Make "Filter Gate" — a step gate where each step also has its own filter cutoff. Controls: Amount (0.0 default), Division, Pattern, Per-step filter, Filter range, Mix. Preset: 1/16 steps, filter sweeping 1–12 kHz across the pattern, 80% mix.',
      },
      {
        name: "Sidechain-Style Pump Gate",
        params: { Amount: 60, Mix: "100%", Division: "1/4", Length: "70%", Trigger: "kick" },
        prompt:
          'Create "Pump Gate" — a gate triggered by the kick that behaves like sidechain compression but with a hard shape. Controls: Amount (0.0 default), Division, Length, Trigger source, Shape, Mix. Preset: 1/4 division, 70% length, triggered by the kick, 100% mix.',
      },
      {
        name: "Amen-Style Chop Gate",
        params: { Amount: 64, Mix: "85%", Division: "1/16", Pattern: "breakbeat", Length: "70%" },
        prompt:
          'Build "Break Gate" — a gate pattern based on a breakbeat rhythm for turning pads and vocals into a groove. Controls: Amount (0.0 default), Division, Pattern, Length, Mix. Preset: 1/16, breakbeat pattern, 70% length, 85% mix.',
      },
      {
        name: "Reverse Gate (Pre-Hit Swell)",
        params: { Amount: 58, Mix: "70%", Mode: "reverse", Division: "1/4", Length: "120%" },
        prompt:
          'Make "Reverse Gate" — a gate that swells backwards into each hit instead of cutting after it. Controls: Amount (0.0 default), Mode, Division, Length, Mix. Preset: reverse mode, 1/4 division, 120% length, 70% mix.',
      },
    ],
  },
  {
    id: "stutter-chop",
    name: "Stutter / Chop Editor",
    kind: "Chat-built",
    category: "Creative FX",
    icon: "🎛️",
    target: "Vocals, drums, transitions",
    oneLiner:
      "Real-time repeat, reverse, pitch and gate chopping on a tempo grid — edit audio like a DJ, no cutting required.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Division", value: "1/16" },
      { name: "Repeat", value: "1" },
      { name: "Pitch", value: "0.0 st" },
    ],
    tip: "Keep the dry signal blended underneath (mix 60–80%) — full-wet stutters on a whole mix lose the song. Trigger the stutter on a bar boundary so it lands musically.",
    presets: [
      {
        name: "Vocal Stutter Throw",
        params: { Amount: 60, Mix: "75%", Division: "1/16", Repeat: "4", "Pitch": "0 st" },
        prompt:
          'Build "Stutter" — a real-time chopper with repeat count, reverse, pitch per step, gate and mix. Controls: Amount (0.0 default), Division, Repeat, Reverse, Pitch, Gate, Mix. Preset "Vocal Stutter Throw": 1/16 division, 4 repeats, no pitch change, 75% mix.',
      },
      {
        name: "Halftime Reverse Chop",
        params: { Amount: 56, Mix: "80%", Division: "1/8", Mode: "reverse", Repeat: "2" },
        prompt:
          'Make "Reverse Chop" — a reversed repeat chopper for transition fills. Controls: Amount (0.0 default), Division, Mode, Repeat, Pitch, Mix. Preset: 1/8 division, reverse mode, 2 repeats, 80% mix.',
      },
      {
        name: "Pitch-Rise Stutter",
        params: { Amount: 64, Mix: "85%", Division: "1/16", Repeat: "8", "Pitch Step": "+1 st" },
        prompt:
          'Create "Rise Stutter" — a stutter whose pitch rises one semitone per repeat, for build-ups. Controls: Amount (0.0 default), Division, Repeat, Pitch step, Gate, Mix. Preset: 1/16, 8 repeats, +1 semitone per repeat, 85% mix.',
      },
      {
        name: "Granular Drill",
        params: { Amount: 58, Mix: "70%", Division: "1/32", Mode: "granular", Random: "on" },
        prompt:
          'Build "Drill" — a granular stutter for fast, glitchy vocal and drum textures. Controls: Amount (0.0 default), Division, Mode, Randomise, Gate, Mix. Preset: 1/32 division, granular mode, randomise on, 70% mix.',
      },
      {
        name: "Beat Repeat (Drum Fill)",
        params: { Amount: 54, Mix: "65%", Division: "1/8", Repeat: "3", "Decay": "on" },
        prompt:
          'Make "Beat Repeat" — a decaying repeat for drum fills, like a classic beat-repeat plugin. Controls: Amount (0.0 default), Division, Repeat, Decay amount, Filter, Mix. Preset: 1/8, 3 repeats, -3 dB per repeat, wet LPF 8 kHz, 65% mix.',
      },
      {
        name: "Half-Speed Chop",
        params: { Amount: 52, Mix: "70%", Division: "1/4", "Speed": "0.5x", Repeat: "2" },
        prompt:
          'Create "Half Chop" — a half-speed repeat chopper for halftime sections. Controls: Amount (0.0 default), Division, Speed, Repeat, Mix. Preset: 1/4 division, 0.5x speed, 2 repeats, 70% mix.',
      },
      {
        name: "Sequenced Chop Pattern",
        params: { Amount: 60, Mix: "80%", Steps: "16", Editor: "repeat/reverse/pitch per step" },
        prompt:
          'Build "Chop Sequencer" — a 16-step chopper where each step has its own repeat count, reverse flag, pitch and gate. Controls: Amount (0.0 default), Steps, per-step editor, Randomise, Mix. Preset: 16 steps at 1/16, editor visible, 80% mix.',
      },
      {
        name: "Vocal Slicer (Formant per Slice)",
        params: { Amount: 62, Mix: "75%", Division: "1/8", "Formant Step": "+/- 8%", Random: "on" },
        prompt:
          'Make "Vocal Slicer" — a chopper that also shifts formant per slice, so one vocal line becomes a rhythmic phrase of different characters. Controls: Amount (0.0 default), Division, Formant range, Randomise, Gate, Mix. Preset: 1/8 slices, ±8% formant, randomise on, 75% mix.',
      },
    ],
  },
  {
    id: "riser-bloom",
    name: "Riser / Reverse Bloom",
    kind: "Chat-built",
    category: "Creative FX",
    icon: "🚀",
    target: "Transitions, drops, section changes",
    oneLiner:
      "Generates risers, downsweepers and reverse swells from the audio on the track — transitions from your own material.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Length", value: "0.0 bars" },
      { name: "Pitch Sweep", value: "0.0 st" },
      { name: "Filter", value: "flat" },
    ],
    tip: "A riser built from the song's own vocals always sounds more intentional than a generated whoosh. Reverse the last bar, pitch it up 12 semitones, filter it down and you have a transition for free.",
    presets: [
      {
        name: "8-Bar Vocal Riser",
        params: { Amount: 62, Mix: "70%", Length: "8 bars", "Pitch Sweep": "+12 st", "Filter Start": "400 Hz" },
        prompt:
          'Build "Riser" — a transition generator that builds a riser from the audio on the track. Controls: Amount (0.0 default), Length in bars, Pitch sweep, Filter start/end, Noise layer, Mix, Sync. Preset "8-Bar Vocal Riser": 8 bars, +12 semitone sweep, filter opening from 400 Hz to 18 kHz, 70% mix.',
      },
      {
        name: "Reverse Crash Bloom",
        params: { Amount: 54, Mix: "65%", Length: "1 bar", Mode: "reverse", "Fade In": "400 ms" },
        prompt:
          'Make "Reverse Bloom" — a reversed swell of the source audio placed before a hit. Controls: Amount (0.0 default), Length, Mode, Fade in, Filter, Mix. Preset: 1 bar, reverse mode, 400 ms fade-in, 65% mix.',
      },
      {
        name: "Downlifter / Drop Out",
        params: { Amount: 58, Mix: "60%", Length: "2 bars", "Pitch Sweep": "-24 st", "Filter End": "300 Hz" },
        prompt:
          'Create "Downlifter" — a downward pitch and filter sweep for the moment after a drop. Controls: Amount (0.0 default), Length, Pitch sweep, Filter end, Mix. Preset: 2 bars, -24 semitones, filter closing to 300 Hz, 60% mix.',
      },
      {
        name: "Noise Sweep Layer",
        params: { Amount: 56, Mix: "50%", Length: "4 bars", "Noise Type": "white", "Filter Sweep": "200 Hz–16 kHz" },
        prompt:
          'Build "Noise Sweep" — a filtered noise riser layer generated inside the plugin. Controls: Amount (0.0 default), Length, Noise type, Filter sweep, Resonance, Mix. Preset: 4 bars, white noise, 200 Hz–16 kHz sweep, resonance 0.4, 50% mix.',
      },
      {
        name: "Impact + Sub Drop",
        params: { Amount: 66, Mix: "75%", "Impact": "on", "Sub Drop": "-12 st", "Decay": "2 s" },
        prompt:
          'Make "Impact" — an impact hit plus a sub drop generated from the track, for section starts. Controls: Amount (0.0 default), Impact on/off, Sub drop range, Decay, Drive, Mix. Preset: impact on, -12 semitone sub drop, 2 s decay, drive 0.3.',
      },
      {
        name: "Tape Stop",
        params: { Amount: 60, Mix: "80%", "Stop Time": "1 bar", "Pitch Bend": "on", "Re-Start": "on" },
        prompt:
          'Create "Tape Stop" — a motor-stop effect with pitch bend and a ramped restart. Controls: Amount (0.0 default), Stop time, Pitch bend, Restart time, Mix. Preset: 1-bar stop, pitch bend on, 1/4-note restart, 80% mix.',
      },
      {
        name: "Filter Automate Build",
        params: { Amount: 54, Mix: "100%", "Filter Start": "300 Hz", "Filter End": "open", Length: "8 bars" },
        prompt:
          'Build "Filter Build" — an automatable filter that closes everything down and opens it across a build, tempo-synced. Controls: Amount (0.0 default), Filter start, Filter end, Length, Resonance, Curve, Mix. Preset: 300 Hz to open over 8 bars, resonance 0.2, exponential curve.',
      },
      {
        name: "Silence & Re-Entry",
        params: { Amount: 50, Mix: "100%", "Mute Length": "1/2", "Re-Entry Fade": "20 ms" },
        prompt:
          'Make "Cut & Return" — a transition tool that mutes everything for a set length then brings it back with a short fade, for impact before a drop. Controls: Amount (0.0 default), Mute length, Re-entry fade, Pre-cut, Sync. Preset: mute 1/2 note, 20 ms re-entry fade, tempo synced.',
      },
    ],
  },
  {
    id: "ring-mod-vocoder",
    name: "Ring Mod / Vocoder",
    kind: "Chat-built",
    category: "Creative FX",
    icon: "🤖",
    target: "Vocals, FX, synths",
    oneLiner:
      "Ring modulation and a band-based vocoder with an internal or external carrier — robots, daemons and talkboxes.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Mode", value: "ring mod" },
      { name: "Frequency", value: "0.0 Hz" },
      { name: "Bands", value: "0" },
    ],
    tip: "Vocoding your own vocal over the song's own chords keeps it musical; ring-mod is best in small doses blended under the dry voice. Always keep a dry path so the words stay intelligible.",
    presets: [
      {
        name: "Classic Robot Vocal",
        params: { Amount: 58, Mix: "70%", Mode: "vocoder", Bands: "16", Carrier: "internal saw" },
        prompt:
          'Build "Vocoder" — a band vocoder with band count, carrier source (internal or external), formant shift and mix. Controls: Amount (0.0 default), Mode, Bands, Carrier, Formant, Sibilance boost, Mix. Preset "Classic Robot Vocal": vocoder mode, 16 bands, internal saw carrier, sibilance boost on, 70% mix.',
      },
      {
        name: "Talk-Box Style",
        params: { Amount: 54, Mix: "80%", Mode: "vocoder", Bands: "24", Carrier: "external synth" },
        prompt:
          'Make "Talk Box" — a vocoder using an external synth track as the carrier. Controls: Amount (0.0 default), Bands, Carrier source, Formant, Envelope, Mix. Preset: 24 bands, carrier from the synth track, 80% mix.',
      },
      {
        name: "Ring Mod Dalek",
        params: { Amount: 66, Mix: "70%", Mode: "ring mod", Frequency: "120 Hz", "Env Follow": "on" },
        prompt:
          'Create "Ring Mod" — a ring modulator with frequency, mix and an envelope follower. Controls: Amount (0.0 default), Mode, Frequency, Envelope follow, Mix. Preset: ring mod at 120 Hz, envelope follow on, 70% mix.',
      },
      {
        name: "Subtle Metal sheen",
        params: { Amount: 34, Mix: "25%", Mode: "ring mod", Frequency: "1.2 kHz", Blend: "under dry" },
        prompt:
          'Build "Metal Sheen" — a very quiet ring mod blended under a dry vocal to add an alien edge. Controls: Amount (0.0 default), Frequency, Blend, Mix. Preset: 1.2 kHz, 25% mix.',
      },
      {
        name: "Harmonic Vocoder (Choral)",
        params: { Amount: 52, Mix: "45%", Mode: "vocoder", Bands: "32", Carrier: "pad track" },
        prompt:
          'Make "Choral Vocoder" — a high-band-count vocoder using a pad as carrier, for a synth-choir sound. Controls: Amount (0.0 default), Bands, Carrier, Formant, Mix. Preset: 32 bands, carrier from the pad track, 45% mix.',
      },
      {
        name: "Frequency Shifter",
        params: { Amount: 56, Mix: "40%", Mode: "shift", "Shift": "+180 cents", "Feedback": "0.3" },
        prompt:
          'Create "Freq Shift" — a frequency shifter with feedback for metallic, inharmonic movement. Controls: Amount (0.0 default), Shift amount, Feedback, Mix. Preset: +180 cents shift, feedback 0.3, 40% mix.',
      },
      {
        name: "Whisper / Breath Vocoder",
        params: { Amount: 50, Mix: "60%", Mode: "vocoder", Carrier: "noise", Bands: "20" },
        prompt:
          'Build "Whisper Vocoder" — a vocoder with a noise carrier so the vocal becomes a breathy whisper choir. Controls: Amount (0.0 default), Bands, Carrier (noise), Formant, Mix. Preset: noise carrier, 20 bands, 60% mix.',
      },
      {
        name: "Robot Harmony Stack",
        params: { Amount: 60, Mix: "65%", Mode: "vocoder", Voices: "3", "Pitch Interval": "+5 / -4 st" },
        prompt:
          'Make "Robot Stack" — a vocoder that generates pitched harmony carriers from the dry vocal, for a robot choir. Controls: Amount (0.0 default), Voices, Pitch intervals, Bands, Mix. Preset: 3 voices at +5 and -4 semitones, 24 bands, 65% mix.',
      },
    ],
  },
];
