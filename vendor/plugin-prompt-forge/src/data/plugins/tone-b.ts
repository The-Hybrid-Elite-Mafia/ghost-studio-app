import type { Plugin } from "../types";

export const toneB: Plugin[] = [
  {
    id: "vinyl-lofi",
    name: "Vinyl & Dust Lo-Fi",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "💿",
    target: "Lo-fi hip-hop, bedroom pop, whole beats",
    oneLiner:
      "Wow, dust, crackle, surface noise, groove wobble and a band limit — a record player in a plugin.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Wow", value: "0.0" },
      { name: "Crackle", value: "0.0" },
      { name: "Dust", value: "0.0" },
      { name: "Rolloff", value: "0.0" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Vinyl texture is the most reliable way to make AI material feel nostalgic rather than synthetic — and the noise layer conveniently masks the generated noise floor. Put it on the whole beat, not just one stem.",
    presets: [
      {
        name: "Lo-Fi Hip-Hop Beat",
        params: { Amount: 52, Wow: "0.35", Crackle: "0.45", Dust: "0.3", Rolloff: "8 kHz", "Rumble LPF": "12 kHz" },
        prompt:
          'Build "Vinyl Beat" — a vinyl emulation with wow, crackle, dust, surface noise and band limiting. Controls: Amount (0.0 default), Wow depth, Wow rate, Crackle density, Dust, HF rolloff, Rumble, Mix. Preset "Lo-Fi Hip-Hop Beat": wow 0.35 at 0.4 Hz, crackle 0.45, dust 0.3, rolloff 8 kHz, 52% amount.',
      },
      {
        name: "Bedroom Pop Warm",
        params: { Amount: 38, Wow: "0.2", Crackle: "0.25", Dust: "0.2", Rolloff: "10 kHz" },
        prompt:
          'Make "Bedroom Vinyl" — a light vinyl layer that warms a mix without hiding the vocal. Controls: Amount (0.0 default), Wow, Crackle, Dust, Rolloff, Mix. Preset: wow 0.2, crackle 0.25, dust 0.2, rolloff 10 kHz, 38% amount.',
      },
      {
        name: "Deep Dust Crate Dig",
        params: { Amount: 74, Wow: "0.6", Crackle: "0.8", Dust: "0.7", Rolloff: "6.5 kHz", "Rumble LPF": "8 kHz" },
        prompt:
          'Create "Crate Dig" — a heavily worn record: deep wow, dense crackle, heavy rolloff. Controls: Amount (0.0 default), Wow, Crackle, Dust, Rolloff, Rumble, Skip, Mix. Preset: wow 0.6, crackle 0.8, dust 0.7, rolloff 6.5 kHz, rumble LPF 8 kHz.',
      },
      {
        name: "Pitch Wobble Record",
        params: { Amount: 58, Wow: "0.7", "Wow Rate": "0.3 Hz", Drift: "random", Crackle: "0.3" },
        prompt:
          'Build "Wobbly Record" — a vinyl model focused on pitch instability, like a warped record. Controls: Amount (0.0 default), Wow depth, Wow rate, Drift mode, Crackle, Mix. Preset: wow 0.7 at 0.3 Hz with random drift, crackle 0.3.',
      },
      {
        name: "Skip & Loop Fault",
        params: { Amount: 64, Skip: "on", "Skip Interval": "2 bars", Crackle: "0.5", Wow: "0.3" },
        prompt:
          'Make "Record Skip" — a vinyl model that repeats a short section every few bars, like a scratched record. Controls: Amount (0.0 default), Skip on/off, Skip interval, Skip length, Crackle, Mix. Preset: skip on, every 2 bars, 1/8-note skip length, crackle 0.5.',
      },
      {
        name: "Ambient Vinyl Room",
        params: { Amount: 44, Crackle: "0.6", Dust: "0.4", Rolloff: "12 kHz", Reverb: "small room" },
        prompt:
          'Create "Vinyl Room" — crackle and dust on their own, no pitch wobble, for ambient and jazz textures. Controls: Amount (0.0 default), Crackle, Dust, Rolloff, Reverb, Mix. Preset: crackle 0.6, dust 0.4, rolloff 12 kHz, small room reverb on the noise layer only.',
      },
      {
        name: "Vocal Through a Record",
        params: { Amount: 60, Wow: "0.45", Crackle: "0.35", Band: "300 Hz–6 kHz", Mix: "70%" },
        prompt:
          'Make "Recorded Vocal" — a band-limited vinyl effect for vocals that should sound like they came off a sample. Controls: Amount (0.0 default), Wow, Crackle, Band edges, Mix. Preset: wow 0.45, crackle 0.35, band 300 Hz–6 kHz, 70% mix.',
      },
      {
        name: "Transition Needle Drop",
        params: { Amount: 56, Mode: "needle drop", Length: "1 bar", Crackle: "0.7", Wow: "0.5" },
        prompt:
          'Build "Needle Drop" — a one-bar vinyl spin-in effect for transitions, automatable per section. Controls: Amount (0.0 default), Mode, Length, Crackle, Wow, Mix. Preset: needle-drop mode, 1 bar, crackle 0.7, wow 0.5.',
      },
    ],
  },
  {
    id: "cassette",
    name: "Cassette / 4-Track",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "📻",
    target: "Vocals, whole mix, lo-fi",
    oneLiner:
      "Tape-hiss, azimuth smear, head bump, drop-outs and speed drift — the sound of a beaten Type II cassette.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Speed", value: "0.0 %" },
      { name: "Hiss", value: "0.0" },
      { name: "Dropouts", value: "0.0" },
      { name: "Azimuth", value: "0.0" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Azimuth smear (a tiny L/R timing and HF mismatch) is what makes cassette sound 'expensive' — and it is also a stereo-image randomiser that breaks the perfect symmetry of AI mixes.",
    presets: [
      {
        name: "4-Track Demo Vocal",
        params: { Amount: 50, Speed: "-2 %", Hiss: "0.35", Dropouts: "0.25", Azimuth: "0.3", Rolloff: "7 kHz" },
        prompt:
          'Build "4-Track Demo" — a cassette emulation with speed, hiss, drop-outs, azimuth smear and rolloff. Controls: Amount (0.0 default), Speed, Hiss, Dropouts, Azimuth, Rolloff, Mix. Preset "4-Track Demo Vocal": speed -2%, hiss 0.35, dropouts 0.25, azimuth 0.3, rolloff 7 kHz.',
      },
      {
        name: "Chrome Tape Master",
        params: { Amount: 34, Speed: "0 %", Hiss: "0.1", "Head Bump": "+1.5 dB @ 80 Hz", Rolloff: "14 kHz" },
        prompt:
          'Make "Chrome Tape" — a good-quality cassette used as a mastering colour. Controls: Amount (0.0 default), Speed, Hiss, Head bump, Rolloff, Mix. Preset: speed 0, hiss 0.1, head bump +1.5 dB at 80 Hz, rolloff 14 kHz.',
      },
      {
        name: "Warped Walkman",
        params: { Amount: 68, Speed: "-4 %", Drift: "0.5", Hiss: "0.4", Dropouts: "0.5" },
        prompt:
          'Create "Warped Walkman" — a dying cassette: slow speed, pitch drift, drop-outs. Controls: Amount (0.0 default), Speed, Drift, Hiss, Dropouts, Mix. Preset: speed -4%, drift 0.5, hiss 0.4, dropouts 0.5.',
      },
      {
        name: "Slowed + Reverb",
        params: { Amount: 58, Speed: "-8 %", Hiss: "0.2", Reverb: "hall 3 s", LPF: "9 kHz" },
        prompt:
          'Build "Slowed + Reverb" — a one-knob slowed-and-reverb effect: pitch and speed down, long hall, dark top. Controls: Amount (0.0 default), Speed, Hiss, Reverb decay, LPF, Mix. Preset: speed -8%, hiss 0.2, 3 s hall, LPF 9 kHz.',
      },
      {
        name: "Nightcore / Sped Up",
        params: { Amount: 56, Speed: "+15 %", "Pitch Lock": "off", Hiss: "0.1", LPF: "13 kHz" },
        prompt:
          'Make "Sped Up" — a speed/pitch-up effect with a bright-but-limited top. Controls: Amount (0.0 default), Speed, Pitch lock, Hiss, LPF, Mix. Preset: speed +15%, pitch lock off, hiss 0.1, LPF 13 kHz.',
      },
      {
        name: "Tape Dropouts (Glitch)",
        params: { Amount: 62, Dropouts: "0.8", "Dropout Rate": "1/2", Hiss: "0.3" },
        prompt:
          'Create "Tape Dropouts" — rhythmic tape signal loss, tempo-synced. Controls: Amount (0.0 default), Dropouts, Dropout rate, Depth, Hiss, Mix. Preset: dropouts 0.8, rate 1/2 note, depth -8 dB, hiss 0.3.',
      },
      {
        name: "Azimuth Stereo Randomiser",
        params: { Amount: 42, Azimuth: "0.6", "L/R Offset": "0.8 ms", Hiss: "0.15" },
        prompt:
          'Make "Azimuth Drift" — a cassette model whose azimuth mismatch breaks the perfect L/R symmetry of an AI mix. Controls: Amount (0.0 default), Azimuth, L/R offset, Hiss, Rolloff, Mix. Preset: azimuth 0.6, L/R offset 0.8 ms, hiss 0.15, full wet.',
      },
      {
        name: "Voice Memo / Answering Machine",
        params: { Amount: 64, Speed: "-1 %", Hiss: "0.5", Band: "400 Hz–3.5 kHz", "Beep": "on" },
        prompt:
          'Build "Voice Memo" — a low-fi cassette/answering-machine effect for intro and skit vocals. Controls: Amount (0.0 default), Speed, Hiss, Band edges, Beep, Mix. Preset: speed -1%, hiss 0.5, band 400 Hz–3.5 kHz, beep at the end.',
      },
    ],
  },
  {
    id: "amp-sim",
    name: "Amp & Cab Simulator",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "🎸",
    target: "Guitar, bass, synths, vocal FX",
    oneLiner:
      "Preamp, tone stack, power-amp sag and a speaker IR loader — a guitar rig in one plugin.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Gain", value: "0.0" },
      { name: "Bass / Mid / Treble", value: "0.0 dB" },
      { name: "Presence", value: "0.0" },
      { name: "Cab", value: "bypass" },
    ],
    tip: "Amp sims fix 'plastic' AI guitars fast: the cab IR removes the fizz, the tone stack removes the honk. Always HPF 80–120 Hz and LPF 6–8 kHz — real amps do not reproduce the extremes.",
    presets: [
      {
        name: "Clean Sparkle",
        params: { Amount: 36, Gain: "0.15", Bass: "+1 dB", Mid: "0 dB", Treble: "+2 dB", Cab: "1x12" },
        prompt:
          'Build "Amp Sim" — a guitar amp with gain, 3-band tone stack, presence, sag and a cab IR loader. Controls: Amount (0.0 default), Gain, Bass, Mid, Treble, Presence, Sag, Cab IR, Mic position, Mix. Preset "Clean Sparkle": gain 0.15, bass +1, mid 0, treble +2, presence 0.3, 1x12 cab, 57 on-axis.',
      },
      {
        name: "Crunch Rhythm",
        params: { Amount: 54, Gain: "0.45", Bass: "-1 dB", Mid: "+2 dB", Treble: "+1 dB", Cab: "4x12" },
        prompt:
          'Make "Crunch Amp" — a medium-gain rhythm tone. Controls: Amount (0.0 default), Gain, Tone stack, Presence, Sag, Cab IR, HPF, LPF. Preset: gain 0.45, bass -1, mid +2, treble +1, presence 0.4, 4x12 cab, HPF 100 Hz, LPF 7 kHz.',
      },
      {
        name: "High-Gain Lead",
        params: { Amount: 76, Gain: "0.85", Bass: "-3 dB", Mid: "+3 dB", Treble: "+2 dB", Cab: "4x12 V30" },
        prompt:
          'Create "Lead Amp" — a high-gain lead tone with tightened low end. Controls: Amount (0.0 default), Gain, Tone stack, Presence, Tight (gate/HPF), Cab IR. Preset: gain 0.85, bass -3, mid +3, treble +2, presence 0.6, tight HPF 120 Hz, 4x12 V30 cab.',
      },
      {
        name: "Bass Amp + DI Blend",
        params: { Amount: 50, Gain: "0.3", Bass: "+2 dB", Mid: "+1 dB", Treble: "-2 dB", "DI Blend": "40%" },
        prompt:
          'Build "Bass Amp" — a bass amp with cab and a DI blend control. Controls: Amount (0.0 default), Gain, Tone stack, Cab IR, DI blend, HPF. Preset: gain 0.3, bass +2, mid +1, treble -2, DI blend 40%, HPF 40 Hz.',
      },
      {
        name: "Synth Through a Guitar Rig",
        params: { Amount: 62, Gain: "0.5", Mid: "+3 dB", Treble: "+1 dB", Cab: "2x12" },
        prompt:
          'Make "Synth Rig" — an amp sim tuned for synths so leads get real speaker character. Controls: Amount (0.0 default), Gain, Tone stack, Cab IR, Mix. Preset: gain 0.5, mid +3, treble +1, 2x12 cab, 60% mix.',
      },
      {
        name: "Vocal Megaphone Amp",
        params: { Amount: 68, Gain: "0.55", Mid: "+5 dB", Treble: "+2 dB", Band: "500 Hz–4 kHz" },
        prompt:
          'Create "Megaphone Amp" — a small-bandwidth amp sim for distorted vocal throws. Controls: Amount (0.0 default), Gain, Tone stack, Band edges, Mix. Preset: gain 0.55, mid +5, treble +2, band 500 Hz–4 kHz, 100% mix.',
      },
      {
        name: "Fizzy Cab Tame",
        params: { Amount: 44, Gain: "0.4", Treble: "-3 dB", Presence: "-2 dB", LPF: "6.5 kHz" },
        prompt:
          'Make "Fizz Tame" — an amp sim preset specifically to remove the fizzy high end AI guitars generate. Controls: Amount (0.0 default), Gain, Treble, Presence, LPF, Cab IR choice. Preset: gain 0.4, treble -3, presence -2, LPF 6.5 kHz, darker cab IR.',
      },
      {
        name: "Direct Vocal Through a Stack",
        params: { Amount: 72, Gain: "0.75", Mid: "+4 dB", "Tight": "on", Cab: "4x12" },
        prompt:
          'Build "Vocal Stack" — a full high-gain stack for screamed and industrial vocals. Controls: Amount (0.0 default), Gain, Tone stack, Tight HPF, Cab IR, Mix. Preset: gain 0.75, mid +4, tight HPF 150 Hz, 4x12 cab, 100% wet.',
      },
    ],
  },
  {
    id: "console-color",
    name: "Console / Bus Colour",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "🧰",
    target: "Group buses, master",
    oneLiner:
      "Analogue console emulation: transformer,drive, crosstalk, push and a lift in the low mids. One knob of 'real studio'.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Drive", value: "0.0" },
      { name: "Transformers", value: "off" },
      { name: "Crosstalk", value: "0.0" },
      { name: "Output Trim", value: "0.0 dB" },
    ],
    tip: "Console colour is the cheapest fix for 'everything sounds like it came from the same file' — because it did. Put a small amount on each group bus with slightly different drive settings and the mix instantly gains depth.",
    presets: [
      {
        name: "Gentle Console Glue",
        params: { Amount: 32, Drive: "0.2", Transformers: "on", Crosstalk: "0.1", "Output Trim": "auto" },
        prompt:
          'Build "Console Colour" — an analogue console emulation with drive, transformer mode, crosstalk and output trim. Controls: Amount (0.0 default), Drive, Transformers, Crosstalk, Low-mid lift, Output trim, auto gain match. Preset "Gentle Console Glue": drive 0.2, transformers on, crosstalk 0.1, low-mid lift +0.5 dB.',
      },
      {
        name: "Pushed Desk (Drums)",
        params: { Amount: 58, Drive: "0.55", Transformers: "on", Crosstalk: "0.2", "Output Trim": "-1 dB" },
        prompt:
          'Make "Pushed Desk" — a harder-driven console stage for drum buses. Controls: Amount (0.0 default), Drive, Transformers, Crosstalk, Output trim. Preset: drive 0.55, transformers on, crosstalk 0.2, output trim -1 dB.',
      },
      {
        name: "Per-Bus Different Colour",
        params: { Amount: 28, Drive: "0.15", "Colour Seed": "per track", Crosstalk: "0.05" },
        prompt:
          'Create "Bus Variety" — a console colour plugin with a randomisable drive seed so each bus gets a subtly different character. Controls: Amount (0.0 default), Drive, Colour seed, Crosstalk, Mix. Preset: drive 0.15, colour seed per track name, crosstalk 0.05.',
      },
      {
        name: "Vocal Preamp Warmth",
        params: { Amount: 44, Drive: "0.35", Transformers: "on", "Low-mid Lift": "+1 dB @ 200 Hz" },
        prompt:
          'Build "Vocal Pre" — a console preamp stage for vocals. Controls: Amount (0.0 default), Drive, Transformers, Low-mid lift, HPF, Mix. Preset: drive 0.35, transformers on, +1 dB at 200 Hz, HPF 90 Hz.',
      },
      {
        name: "Master Trim + Colour",
        params: { Amount: 22, Drive: "0.12", Transformers: "on", "Ceiling": "-1 dBTP" },
        prompt:
          'Make "Master Desk" — a mastering-safe console stage with a true-peak ceiling and auto gain match. Controls: Amount (0.0 default), Drive, Transformers, Ceiling, Output trim. Preset: drive 0.12, transformers on, ceiling -1 dBTP, auto gain match on.',
      },
      {
        name: "Vintage British Console",
        params: { Amount: 48, Drive: "0.4", "Character": "British", "Mid Sweep": "700 Hz", Crosstalk: "0.15" },
        prompt:
          'Create "British Desk" — a console colour with a switchable mid sweep for the classic rock character. Controls: Amount (0.0 default), Drive, Character, Mid sweep frequency, Mid gain, Crosstalk. Preset: drive 0.4, British character, 700 Hz sweep, +2 dB.',
      },
      {
        name: "Neve-Style Warm Group",
        params: { Amount: 40, Drive: "0.3", "Character": "warm", "Low Shelf": "+1.5 dB @ 100 Hz" },
        prompt:
          'Build "Warm Group" — a warm transformer console stage for instrument groups. Controls: Amount (0.0 default), Drive, Character, Low shelf, HF air, Mix. Preset: drive 0.3, warm character, +1.5 dB shelf at 100 Hz, +0.5 dB air.',
      },
      {
        name: "Digital Clean (No Colour)",
        params: { Amount: 30, Drive: "0.0", Transformers: "off", "Headroom": "+6 dB", "Trim": "auto" },
        prompt:
          'Make "Clean Gain" — a transparent utility from the same family: pure gain and headroom staging with zero colour, for gain-matching between plugins. Controls: Amount (0.0 default), Gain, Headroom, Auto trim, Phase invert. Preset: drive 0, +6 dB headroom, auto trim on.',
      },
    ],
  },
];
