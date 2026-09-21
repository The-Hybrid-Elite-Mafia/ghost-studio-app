import type { Plugin } from "../types";

export const eqA: Plugin[] = [
  {
    id: "eq",
    name: "EQ (6-Band)",
    kind: "Built-in",
    category: "EQ & Filters",
    icon: "🎛️",
    target: "Any track or master",
    oneLiner:
      "Factory six-band parametric EQ with per-band gain, frequency, Q and shelf/pass filters. Studio's tonal workhorse.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Band 1–6 Gain", value: "0.0 dB (all)" },
      { name: "Frequency", value: "default" },
      { name: "Q", value: "0.0 (wide)" },
      { name: "Output", value: "0.0 dB" },
    ],
    tip: "Cut before you boost, and subtract 3–6 dB at 200–400 Hz on anything that sounds 'AI thick'. Solo the band, sweep for the ugly note, then narrow the Q. Mute the source track once its stems are in — mixing both doubles everything.",
    presets: [
      {
        name: "Vocal Clarity Carve",
        params: { "HPF": "90 Hz", "Cut 220 Hz": "-3.5 dB", "Cut 3.2 kHz": "-2 dB", "Boost 5 kHz": "+2.5 dB", "Air 12 kHz": "+2 dB" },
        prompt:
          'Build a six-band EQ preset called "Vocal Clarity" for an AI lead vocal. Controls: Amount (0.0 default), six bands with freq/gain/Q, HPF and LPF, output trim. Preset: HPF 90 Hz, -3.5 dB at 220 Hz Q1.2 (mud), -2 dB at 3.2 kHz Q2 (nasal), +2.5 dB at 5 kHz Q1.4 (presence), +2 dB shelf at 12 kHz (air), output auto-matched.',
      },
      {
        name: "Kick + Bass Pocket",
        params: { Amount: 40, "Cut 45 Hz": "-3 dB", "Boost 65 Hz": "+2 dB", "Cut 300 Hz": "-4 dB", "Boost 3 kHz": "+3 dB" },
        prompt:
          'Make "Kick Pocket" — an EQ preset that separates kick from bass. Controls: Amount (0.0 default), six bands, HPF. Preset: -3 dB at 45 Hz Q2 (rumble), +2 dB at 65 Hz Q1.6 (thump), -4 dB at 300 Hz Q1.4 (boxiness), +3 dB at 3 kHz Q1.8 (beater click).',
      },
      {
        name: "Acoustic Guitar Body",
        params: { Amount: 34, "HPF": "85 Hz", "Cut 180 Hz": "-2.5 dB", "Boost 2.4 kHz": "+1.5 dB", "Boost 9 kHz": "+1.5 dB" },
        prompt:
          'Create "Acoustic Body" — an EQ preset for AI acoustic guitar. Controls: Amount (0.0 default), six bands, HPF. Preset: HPF 85 Hz, -2.5 dB at 180 Hz Q1.4, +1.5 dB at 2.4 kHz Q1 (pick definition), +1.5 dB high shelf at 9 kHz (string air).',
      },
      {
        name: "Drum Bus Brighten",
        params: { Amount: 38, "HPF": "35 Hz", "Boost 3.5 kHz": "+2 dB", "Cut 8 kHz": "-2 dB", "Boost 14 kHz": "+2.5 dB" },
        prompt:
          'Build "Drum Shine" — an EQ for the whole kit bus. Controls: Amount (0.0 default), six bands, HPF, LPF. Preset: HPF 35 Hz, +2 dB at 3.5 kHz Q1 (attack), -2 dB at 8 kHz Q2 (harsh hat edge), +2.5 dB shelf at 14 kHz (cymbal air).',
      },
      {
        name: "Master Gentle Polish",
        params: { Amount: 26, "Cut 250 Hz": "-1.5 dB", "Boost 60 Hz": "+1 dB", "Boost 11 kHz": "+1.5 dB", Q: "wide" },
        prompt:
          'Create "Master Polish" — a very wide, gentle mastering EQ. Controls: Amount (0.0 default), six bands, output trim, auto gain match. Preset: +1 dB shelf at 60 Hz, -1.5 dB at 250 Hz Q0.7, +1.5 dB shelf at 11 kHz. Never more than 2 dB anywhere.',
      },
      {
        name: "Rap Vocal Forward",
        params: { Amount: 44, "HPF": "110 Hz", "Cut 400 Hz": "-3 dB", "Boost 1.2 kHz": "+1.5 dB", "Boost 6 kHz": "+3 dB" },
        prompt:
          'Make "Rap Forward" — an EQ that pushes a rap vocal in front of an 808-heavy beat. Controls: Amount (0.0 default), six bands, HPF. Preset: HPF 110 Hz, -3 dB at 400 Hz Q1.3, +1.5 dB at 1.2 kHz Q1 (intelligibility), +3 dB at 6 kHz Q1.5 (edge).',
      },
      {
        name: "Telephone / Lo-Fi Band",
        params: { Amount: 70, "HPF": "450 Hz", "LPF": "3.4 kHz", "Boost 1.5 kHz": "+4 dB", "Cut 800 Hz": "-2 dB" },
        prompt:
          'Build "Telephone" — an EQ preset that band-limits a track like a phone call. Controls: Amount (0.0 default), HPF, LPF, mid boost, mid dip, Mix for parallel. Preset: HPF 450 Hz, LPF 3.4 kHz, +4 dB at 1.5 kHz Q1.6, -2 dB at 800 Hz, mix 100%.',
      },
      {
        name: "Underwater / Muffled Fix",
        params: { Amount: 52, "Boost 2 kHz": "+3 dB", "Boost 5 kHz": "+2.5 dB", "Boost 10 kHz": "+3 dB", "Cut 350 Hz": "-2 dB" },
        prompt:
          'Make "Un-Muffle" — an EQ preset for stems that came out of separation sounding dull or veiled. Controls: Amount (0.0 default), six bands, output trim. Preset: -2 dB at 350 Hz, +3 dB at 2 kHz Q0.9, +2.5 dB at 5 kHz, +3 dB shelf at 10 kHz. Only lift until the veil lifts — stop before it gets fizzy.',
      },
      {
        name: "Bass Mono-Safe Cut",
        params: { Amount: 30, "HPF": "30 Hz", "Cut 90 Hz": "-2 dB", "Boost 700 Hz": "+1.5 dB", "Boost 2.5 kHz": "+2 dB" },
        prompt:
          'Create "Bass Definition" — an EQ for bass and 808 stems so they translate on small speakers. Controls: Amount (0.0 default), six bands, HPF, mono-below switch. Preset: HPF 30 Hz, -2 dB at 90 Hz Q1.5, +1.5 dB at 700 Hz Q1.2 (growl), +2 dB at 2.5 kHz Q1.6 (note attack), mono below 120 Hz.',
      },
    ],
  },
  {
    id: "surgical-eq",
    name: "Surgical Resonance EQ",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "🔬",
    target: "Stems, separated vocals, master",
    oneLiner:
      "Up to 12 ultra-narrow dynamic notches plus a resonance finder. Hunts and kills the single worst frequency in a stem.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Notches", value: "0.0 dB (12 × off)" },
      { name: "Q", value: "0.0 (wide)" },
      { name: "Detector", value: "off" },
    ],
    tip: "Stem separation leaves behind comb-like resonances at the frequencies the separator guessed wrong. Narrow notches (Q 8–16) of 3–5 dB fix it without the 'filtered' sound of a wide cut.",
    presets: [
      {
        name: "Ring-Out Hunter",
        params: { Amount: 50, Notches: "6 × -4 dB", Q: "12", Detector: "auto-find", Range: "80 Hz–14 kHz" },
        prompt:
          'Build "Resonance Hunter" — a surgical EQ with a resonance finder that auto-detects the loudest narrow peaks and notches them. Controls: Amount (0.0 default), number of notches, Q, Max cut, Range, Listen (solo the removed signal). Preset "Ring-Out Hunter": 6 notches, Q 12, -4 dB max cut each, 80 Hz–14 kHz range.',
      },
      {
        name: "Separation Comb Fix",
        params: { Amount: 45, Notches: "4 × -3.5 dB", Q: "9", Mode: "dynamic", Detector: "phase smear" },
        prompt:
          'Make "Comb Repair" — a surgical EQ with dynamic notches aimed at the comb-filter ringing left behind by stem separation. Controls: Amount (0.0 default), Notch count, Q, Max cut, dynamic threshold, Listen. Preset: 4 notches, Q 9, -3.5 dB, dynamic mode so only the resonant moments are cut.',
      },
      {
        name: "Whistle & Ping Notcher",
        params: { Amount: 60, Notches: "2 × -12 dB", Q: "20", Mode: "static", Range: "2–9 kHz" },
        prompt:
          'Create "Whistle Notcher" — two very narrow, very deep notches for the piercing tones AI generates on bright synth leads. Controls: Amount (0.0 default), Notch freq ×2, Q, Depth, Range, Listen. Preset: Q 20, -12 dB, range 2–9 kHz, static mode.',
      },
      {
        name: "Low-Mid Box Killer",
        params: { Amount: 48, Notches: "3 × -4 dB", Q: "6", Range: "160–420 Hz", Detector: "auto" },
        prompt:
          'Build "Box Killer" — three auto-found notches between 160 and 420 Hz to remove the cardboard tone in AI drums and guitars. Controls: Amount (0.0 default), Notch count, Q, Max cut, Range, Listen. Preset: 3 notches, Q 6, -4 dB each, range 160–420 Hz.',
      },
      {
        name: "Harsh 3k Spike Tamer",
        params: { Amount: 54, Notches: "2 × -5 dB", Q: "8", Range: "2.5–4.5 kHz", Mode: "dynamic" },
        prompt:
          'Make "3k Spike Tamer" — dynamic notches in the ear-fatigue zone for vocals that are present but painful. Controls: Amount (0.0 default), Notches, Q, Max cut, Attack, Release, Range. Preset: 2 notches in 2.5–4.5 kHz, Q 8, -5 dB, 5 ms attack, 120 ms release.',
      },
      {
        name: "Sub Rumble Clean",
        params: { Amount: 40, HPF: "28 Hz (24 dB/oct)", Notches: "2 × -6 dB", Q: "5", Range: "30–60 Hz" },
        prompt:
          'Create "Rumble Clean" — a steep high-pass plus two notches for inaudible sub rumble that eats headroom. Controls: Amount (0.0 default), HPF freq and slope, Notch count, Q, Depth. Preset: HPF 28 Hz at 24 dB/oct, 2 notches at 30–60 Hz, Q 5, -6 dB.',
      },
      {
        name: "Presence Restore Post-Dereverb",
        params: { Amount: 44, Notches: "3 × -3 dB", Boosts: "2 × +2.5 dB", Range: "1–8 kHz" },
        prompt:
          'Build "Presence Restore" — a surgical EQ to run after de-reverb: notches out the smeared 300–600 Hz residue and restores 2–6 kHz definition. Controls: Amount (0.0 default), Notches, Boosts, Q, Range, Listen. Preset: 3 notches -3 dB, 2 boosts +2.5 dB, range 1–8 kHz.',
      },
      {
        name: "Master Resonance Tame",
        params: { Amount: 30, Notches: "5 × -2 dB", Q: "14", Mode: "dynamic", Range: "full" },
        prompt:
          'Make "Master Tame" — a mastering-grade resonance suppressor with 5 dynamic notches and a 2 dB cap so it never changes the character. Controls: Amount (0.0 default), Notch count, Q, Max cut, Mode, Listen. Preset: 5 notches, Q 14, -2 dB, dynamic mode, full range.',
      },
    ],
  },
  {
    id: "dynamic-eq",
    name: "Dynamic EQ",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "📈",
    target: "Vocals vs instruments, mix bus, sibilance",
    oneLiner:
      "An EQ band that only cuts or boosts when that frequency gets loud. Frequency-selective compression with musical results.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Band Gain", value: "0.0 dB (all bands)" },
      { name: "Threshold", value: "off" },
      { name: "Ratio", value: "1:1" },
      { name: "Attack/Release", value: "0.0 ms" },
    ],
    tip: "Use dynamic EQ instead of static EQ whenever the problem only happens sometimes — a vocal that gets honky on high notes, hats that sting on accents, a guitar that booms on open chords.",
    presets: [
      {
        name: "Vocal vs Guitar Ducking",
        params: { Amount: 46, Band: "1.5–3 kHz", Cut: "-4 dB", Threshold: "-22 dB", Attack: "8 ms", Release: "150 ms" },
        prompt:
          'Build "Vocal Space" — a dynamic EQ that ducks a guitar or pad band 1.5–3 kHz whenever the vocal is present. Controls: Amount (0.0 default), Band, Max cut, Threshold, Attack, Release, External sidechain input. Preset: -4 dB max cut, threshold -22 dB, 8 ms attack, 150 ms release, sidechain from the vocal track.',
      },
      {
        name: "Dynamic Mud Control",
        params: { Amount: 50, Band: "180–320 Hz", Cut: "-4.5 dB", Threshold: "-18 dB", Attack: "20 ms", Release: "180 ms" },
        prompt:
          'Make "Dynamic Mud" — a dynamic band at 180–320 Hz that only compresses when the low-mids pile up in the chorus. Controls: Amount (0.0 default), Band, Max cut, Threshold, Ratio, Attack, Release. Preset: -4.5 dB max, threshold -18 dB, 5:1 ratio, 20 ms attack, 180 ms release.',
      },
      {
        name: "Dynamic Harshness Control",
        params: { Amount: 52, Band: "2.5–5 kHz", Cut: "-5 dB", Threshold: "-20 dB", Attack: "2 ms", Release: "90 ms" },
        prompt:
          'Create "Dynamic Harsh" — a dynamic band for the 2.5–5 kHz zone so a vocal can be bright without being painful. Controls: Amount (0.0 default), Band, Max cut, Threshold, Attack, Release, Lookahead. Preset: -5 dB max, threshold -20 dB, 2 ms attack with 3 ms lookahead, 90 ms release.',
      },
      {
        name: "Dynamic Air Boost",
        params: { Amount: 40, Band: "10–16 kHz", Boost: "+4 dB", Threshold: "-30 dB", Attack: "40 ms", Release: "400 ms" },
        prompt:
          'Build "Smart Air" — a dynamic boost band at 10–16 kHz that only adds air when the mix gets quiet, so the chorus does not turn to glass. Controls: Amount (0.0 default), Band, Max boost, Threshold, Attack, Release. Preset: +4 dB max boost, threshold -30 dB, 40 ms attack, 400 ms release.',
      },
      {
        name: "Kick Masking Relief",
        params: { Amount: 56, Band: "55–75 Hz", Cut: "-5 dB", Sidechain: "kick", Attack: "1 ms", Release: "80 ms" },
        prompt:
          'Make "Kick Relief" — a dynamic EQ band at 55–75 Hz on the bass track, triggered by the kick, so the low end never fights. Controls: Amount (0.0 default), Band, Max cut, Sidechain source, Attack, Release. Preset: -5 dB max, 1 ms attack, 80 ms release, sidechain from the kick.',
      },
      {
        name: "Hat & Cymbal Sting",
        params: { Amount: 48, Band: "7–11 kHz", Cut: "-4 dB", Threshold: "-16 dB", Attack: "0.5 ms", Release: "60 ms" },
        prompt:
          'Create "Cymbal Sting" — a dynamic band for the drum bus that catches only the accented hat and cymbal hits. Controls: Amount (0.0 default), Band, Max cut, Threshold, Attack, Release, Ratio. Preset: 7–11 kHz, -4 dB max, threshold -16 dB, 0.5 ms attack, 60 ms release, 4:1 ratio.',
      },
      {
        name: "Piano Note Boom",
        params: { Amount: 42, Band: "90–160 Hz", Cut: "-6 dB", Threshold: "-14 dB", Attack: "5 ms", Release: "250 ms" },
        prompt:
          'Build "Note Boom" — a dynamic band that catches the boomy resonances on hard piano chords without dulling soft playing. Controls: Amount (0.0 default), Band, Max cut, Threshold, Attack, Release. Preset: 90–160 Hz, -6 dB max, threshold -14 dB, 5 ms attack, 250 ms release.',
      },
      {
        name: "Master Dynamic Polish",
        params: { Amount: 28, "Low Band": "-2 dB", "High Band": "-2.5 dB", Threshold: "-10 dB", Release: "auto" },
        prompt:
          'Make "Master Dynamic" — a two-band dynamic EQ for the master: one dynamic low shelf and one dynamic high shelf, each capped at 2.5 dB. Controls: Amount (0.0 default), Band freqs, Max change, Threshold, Release, Listen. Preset: 90 Hz and 9 kHz bands, threshold -10 dB, auto release.',
      },
    ],
  },
  {
    id: "tilt-eq",
    name: "Tilt EQ & Tone Shifter",
    kind: "Chat-built",
    category: "EQ & Filters",
    icon: "📐",
    target: "Quick balancing, stems, master",
    oneLiner:
      "One knob that pivots the whole spectrum around a centre frequency. Darker/brighter without touching anything else.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Tilt", value: "0.0 dB/oct" },
      { name: "Pivot", value: "800 Hz" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "A tilt is the fastest way to make a separated stem match the rest of the mix — and it is far more natural than boosting shelves, because the change is continuous across the whole spectrum.",
    presets: [
      {
        name: "Brighten Dull Stem",
        params: { Amount: 42, Tilt: "+2.5 dB/oct", Pivot: "1 kHz", Mix: "100%" },
        prompt:
          'Build "Brighten" — a tilt EQ with a single Tilt knob and a Pivot frequency. Controls: Amount (0.0 default), Tilt, Pivot, Mix, auto gain match. Preset "Brighten Dull Stem": +2.5 dB/oct, pivot 1 kHz, full wet.',
      },
      {
        name: "Darken Harsh Stem",
        params: { Amount: 46, Tilt: "-3 dB/oct", Pivot: "1.2 kHz", Mix: "100%" },
        prompt:
          'Make "Darken" — the same tilt EQ pulling down for harsh, fizzy or glassy AI material. Controls: Amount (0.0 default), Tilt, Pivot, Mix. Preset: -3 dB/oct, pivot 1.2 kHz, full wet.',
      },
      {
        name: "Radio Tilt + Band",
        params: { Amount: 66, Tilt: "+4 dB/oct", Pivot: "600 Hz", "Band Limit": "500 Hz–3.5 kHz", Mix: "80%" },
        prompt:
          'Create "Radio Tilt" — a tilt plus band limiter for lo-fi vocal throws and transition effects. Controls: Amount (0.0 default), Tilt, Pivot, HPF, LPF, Mix. Preset: +4 dB/oct, pivot 600 Hz, 500 Hz–3.5 kHz, 80% wet.',
      },
      {
        name: "Vintage Warmth Tilt",
        params: { Amount: 38, Tilt: "-2 dB/oct", Pivot: "700 Hz", Warmth: "+1.5 dB @ 150 Hz" },
        prompt:
          'Build "Vintage Tilt" — a downward tilt plus a small low-mid bump for a warmer, older-sounding master. Controls: Amount (0.0 default), Tilt, Pivot, Warmth, Mix. Preset: -2 dB/oct, pivot 700 Hz, +1.5 dB at 150 Hz.',
      },
      {
        name: "Sub vs Air Balance",
        params: { Amount: 34, "Low Tilt": "+2 dB/oct below 120 Hz", "High Tilt": "+1.5 dB/oct above 8 kHz", Mid: "flat" },
        prompt:
          'Make "Ends Up" — a dual tilt that lifts the sub and the air while leaving mids untouched. Controls: Amount (0.0 default), Low tilt, Low pivot, High tilt, High pivot, Mix. Preset: +2 dB/oct below 120 Hz, +1.5 dB/oct above 8 kHz.',
      },
      {
        name: "Stem Match / Reference",
        params: { Amount: 40, Tilt: "auto", Pivot: "1 kHz", Target: "reference track", "Max Tilt": "-/+ 4 dB/oct" },
        prompt:
          'Create "Stem Match" — a tilt EQ that analyses a reference track and computes the tilt needed to match its spectral balance. Controls: Amount (0.0 default), Auto tilt, Pivot, Max tilt, Match strength, Bypass A/B. Preset: pivot 1 kHz, max ±4 dB/oct, 70% match strength.',
      },
      {
        name: "Automation Reveal Sweep",
        params: { Amount: 58, Tilt: "-6 dB/oct", Pivot: "400 Hz", Automate: "intro → drop" },
        prompt:
          'Build "Reveal Tilt" — a tilt EQ for transitions, automated from dark and muffled to fully open across the intro. Controls: Amount (0.0 default), Tilt, Pivot, Mix, automation. Preset: start at -6 dB/oct, ramp to 0.0 across 8 bars into the drop, pivot 400 Hz.',
      },
      {
        name: "Vocal-vs-Bed Tilt",
        params: { Amount: 30, Tilt: "-1.5 dB/oct", Pivot: "2 kHz", Mix: "100%" },
        prompt:
          'Create "Bed Tame" — a small downward tilt applied to instrumental beds so vocals cut through without any EQ carving. Controls: Amount (0.0 default), Tilt, Pivot, Mix. Preset: -1.5 dB/oct, pivot 2 kHz, full wet.',
      },
    ],
  },
];
