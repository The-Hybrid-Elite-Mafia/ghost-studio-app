import type { Plugin } from "../types";

export const spaceB: Plugin[] = [
  {
    id: "de-reverb",
    name: "De-Reverb / Tail Dryer",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🧯",
    target: "Separated vocals, dry stems for mixing",
    oneLiner:
      "Adaptive reverb suppression that learns the tail and subtracts it. Runs after Remove Effects for fully dry vocals.",
    artifact: "Suno bakes reverb into every generation. Studio's Remove Effects gives you 2 dry lanes — this takes it the rest of the way.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Reduction", value: "0.0 dB" },
      { name: "Sensitivity", value: "0.0" },
      { name: "Smoothing", value: "0.0 (off)" },
      { name: "Frequency Range", value: "full" },
    ],
    tip: "Never go to 100% — aggressive de-reverb is what creates the watery, underwater sound. Two passes at 40–50% sound better than one pass at 100%, and always follow it with a small air exciter because de-reverb dulls the voice.",
    presets: [
      {
        name: "Vocal Dry 50%",
        params: { Amount: 50, Reduction: "-8 dB max", Sensitivity: "0.5", Smoothing: "medium", Range: "full" },
        prompt:
          'Build "Tail Dryer" — an adaptive de-reverb that learns the reverb tail on a vocal stem and subtracts it. Controls: Amount (0.0 default), Reduction, Sensitivity, Smoothing, Frequency range, Dry/Wet, Listen (solo what it removed). Preset "Vocal Dry 50%": -8 dB max reduction, sensitivity 0.5, medium smoothing, 50% amount, full range.',
      },
      {
        name: "Two-Pass Heavy Dry",
        params: { Amount: 72, Reduction: "-14 dB max", Sensitivity: "0.6", Smoothing: "low", Passes: "2" },
        prompt:
          'Make "Heavy Dry" — a two-pass de-reverb for vocals drenched in baked-in reverb. Controls: Amount (0.0 default), Reduction, Sensitivity, Smoothing, Passes, Listen. Preset "Two-Pass Heavy Dry": two internal passes at -14 dB max each, sensitivity 0.6, low smoothing. Warn me if artifacts appear and suggest reducing Passes.',
      },
      {
        name: "Drum Room Tightener",
        params: { Amount: 55, Reduction: "-9 dB", Sensitivity: "0.55", Range: "120 Hz–6 kHz", Release: "fast" },
        prompt:
          'Create "Drum Dry" — a de-reverb focused on the 120 Hz–6 kHz band so a washy AI kit becomes tight and close. Controls: Amount (0.0 default), Reduction, Sensitivity, Frequency range, Release, Listen. Preset "Drum Room Tightener": -9 dB, band 120 Hz–6 kHz, fast release so cymbals keep their wash.',
      },
      {
        name: "Guitar Amp Dry-Up",
        params: { Amount: 48, Reduction: "-7 dB", Sensitivity: "0.5", Range: "200 Hz–8 kHz", Mix: "100%" },
        prompt:
          'Build "Guitar Dry" — de-reverb for a separated guitar stem that came back with room and spring verb baked in. Controls: Amount (0.0 default), Reduction, Sensitivity, Frequency range, Mix, Listen. Preset: -7 dB, range 200 Hz–8 kHz, 100% dry output.',
      },
      {
        name: "Pre-Mix Stem Prep",
        params: { Amount: 44, Reduction: "-6 dB", Sensitivity: "0.45", Match: "across stems", Presets: "per stem type" },
        prompt:
          'Make "Stem Prep" — a de-reverb with per-stem-type presets (vocal, drums, bass, guitar, keys) so a whole separated session can be dried consistently. Controls: Amount (0.0 default), Stem type, Reduction, Sensitivity, Match group, Listen. Preset "Pre-Mix Stem Prep": vocal -8 dB, drums -6 dB, guitar -5 dB, keys -4 dB, all sharing one match group.',
      },
      {
        name: "Keep Some Air (Vocal Bed)",
        params: { Amount: 30, Reduction: "-4 dB", Sensitivity: "0.4", "Wet Blend": "15%" },
        prompt:
          'Create "Keep Air" — a gentle de-reverb that only thins the tail while leaving a little natural space. Controls: Amount (0.0 default), Reduction, Sensitivity, Wet blend, Listen. Preset: -4 dB max, wet blend 15% of the original reverb left in.',
      },
      {
        name: "Spoken Word Full Dry",
        params: { Amount: 80, Reduction: "-18 dB", Sensitivity: "0.7", Smoothing: "low", Range: "full" },
        prompt:
          'Build "Full Dry" — maximum de-reverb for voiceover and podcast AI audio where any tail is unwanted. Controls: Amount (0.0 default), Reduction, Sensitivity, Smoothing, Listen, Artifact guard. Preset: -18 dB max, sensitivity 0.7, low smoothing, artifact guard that eases off if it hears watery residue.',
      },
      {
        name: "De-Reverb + Air Recovery",
        params: { Amount: 60, Reduction: "-11 dB", "Air Recovery": "+2 dB @ 11 kHz", "Presence Recovery": "+1.5 dB @ 3 kHz" },
        prompt:
          'Make "Dry & Alive" — a de-reverb with built-in air and presence recovery so drying does not dull the source. Controls: Amount (0.0 default), Reduction, Air recovery shelf, Presence recovery band, Mix, Listen. Preset: -11 dB reduction, +2 dB at 11 kHz, +1.5 dB at 3 kHz.',
      },
    ],
  },
  {
    id: "shimmer-remover",
    name: "AI Shimmer Remover",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🪞",
    target: "Vocals, cymbals, bright synths, reverb tails",
    oneLiner:
      "Dynamic multi-band suppressor aimed at the glassy 5–12 kHz shimmer layer that makes AI music sound synthetic.",
    artifact: "Metallic shimmer — a glassy, unstable layer around vocals, cymbals and reverb tails. Clean the source BEFORE mastering, or a limiter will just make it louder.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Band", value: "6–12 kHz" },
      { name: "Reduction", value: "0.0 dB" },
      { name: "Attack", value: "0.0 ms" },
      { name: "Release", value: "0.0 ms" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Shimmer is unstable and moving — a static low-pass kills the vocal's air along with it. Use three dynamic bands that only cut when glassy energy spikes, keep the reduction 4–6 dB, and solo the residual to check you are removing shimmer and not cymbals.",
    presets: [
      {
        name: "Vocal Glass (3 dynamic bands)",
        params: { Amount: 55, "Band 1": "5.8–8 kHz", "Band 2": "8–11.5 kHz", Reduction: "-5.5 dB", Attack: "8 ms", Release: "90 ms" },
        prompt:
          'Build a plugin called "Shimmer Off" that kills metallic AI shimmer around the vocal. Controls: Amount (0.0 default), three band edges, per-band Reduction, Attack, Release, Mix, Listen to residual. It must use DYNAMIC bands that only cut glassy resonances when they spike — never a static low-pass. Save preset "Vocal Glass (3 dynamic bands)": bands 5.8–8 kHz and 8–11.5 kHz, 5.5 dB max reduction, 8 ms attack, 90 ms release, Amount 55.',
      },
      {
        name: "Full Mix Sheen Tame",
        params: { Amount: 42, Band: "6.5–13 kHz", Reduction: "-4 dB", Attack: "12 ms", Release: "140 ms", "Residual solo": "on" },
        prompt:
          'Make "Sheen Tame" — a gentler full-mix shimmer suppressor. Controls: Amount (0.0 default), Band, Reduction, Attack, Release, Residual solo, Mix. Preset: 6.5–13 kHz, 4 dB max cut, 12 ms attack, 140 ms release, Amount 42. It must not dull the cymbals — only the unstable glassy layer.',
      },
      {
        name: "Cymbal-Friendly Mode",
        params: { Amount: 48, Band: "9–14 kHz", Reduction: "-3.5 dB", Threshold: "-14 dB", Release: "60 ms" },
        prompt:
          'Create "Cymbal Safe" — a shimmer remover with a high threshold so real cymbal transients pass and only the sustained glassy layer gets cut. Controls: Amount (0.0 default), Band, Threshold, Reduction, Attack, Release, Listen. Preset: 9–14 kHz, threshold -14 dB, 3.5 dB cut, 60 ms release.',
      },
      {
        name: "Reverb Tail Shimmer Cut",
        params: { Amount: 58, Band: "7–12 kHz", Reduction: "-6 dB", Trigger: "tail only", Hold: "250 ms" },
        prompt:
          'Build "Tail Shimmer" — a shimmer remover that only acts on reverb tails, so it cleans the ringing decay but never the dry signal. Controls: Amount (0.0 default), Band, Reduction, Trigger mode (tail only), Hold, Listen. Preset: 7–12 kHz, 6 dB cut, tail-only trigger with 250 ms hold.',
      },
      {
        name: "Bright Synth De-Glass",
        params: { Amount: 52, Band: "4.5–10 kHz", Reduction: "-5 dB", Attack: "6 ms", Release: "70 ms", "Notch Q": "8" },
        prompt:
          'Make "Synth De-Glass" — for supersaws and bright synth stems, combining 3 dB of dynamic cut with narrow notches on the worst resonances. Controls: Amount (0.0 default), Band, Reduction, Notch Q, Notch depth, Attack, Release. Preset: 4.5–10 kHz, 5 dB dynamic cut, 2 notches at Q 8, -4 dB each.',
      },
      {
        name: "Pre-Master Cleanup",
        params: { Amount: 46, Band: "6–12 kHz", Reduction: "-4.5 dB", Ceiling: "-1 dBTP", Order: "before limiter" },
        prompt:
          'Create "Pre-Master Clean" — a shimmer remover designed to sit before the limiter in a mastering chain, with auto gain-match so loudness stays the same when I A/B. Controls: Amount (0.0 default), Band, Reduction, Gain match, Ceiling, Listen. Preset: 6–12 kHz, 4.5 dB, gain match on, Amount 46.',
      },
      {
        name: "Shimmer Off + Air Keep",
        params: { Amount: 54, Reduction: "-5 dB", "Air Keep": "+1.5 dB @ 13 kHz", Band: "6–12 kHz" },
        prompt:
          'Build "Shimmer Off + Air Keep" — shimmer suppression with a static air shelf above 13 kHz so the vocal stays open after the cleanup. Controls: Amount (0.0 default), Band, Reduction, Air keep shelf, Attack, Release, Mix. Preset: 5 dB reduction, +1.5 dB shelf at 13 kHz, Amount 54.',
      },
      {
        name: "Heavy Clean (Salvage Mode)",
        params: { Amount: 78, Band: "5–13 kHz", Reduction: "-9 dB", Smoothing: "high", "Residual solo": "on" },
        prompt:
          'Make "Salvage Mode" — an aggressive shimmer remover for badly generated material, accepting a darker result. Controls: Amount (0.0 default), Band, Reduction, Smoothing, Listen to residual, LPF fallback. Preset: 5–13 kHz, 9 dB max reduction, high smoothing, Amount 78. Add a warning that above 70% I should re-generate instead.',
      },
    ],
  },
  {
    id: "spectral-denoise",
    name: "Spectral De-Noiser",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🤫",
    target: "Any stem, room tone, silence",
    oneLiner:
      "Learns a noise profile from a silent passage and subtracts it, with transient protection and artefact limiting.",
    artifact: "Steady hiss / generated noise floor. Note: denoise does nothing for shimmer — shimmer is woven into the music, not a steady floor.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Reduction", value: "0.0 dB" },
      { name: "Threshold", value: "0.0" },
      { name: "Smoothing", value: "0.0" },
      { name: "Transient Guard", value: "0.0 (off)" },
    ],
    tip: "Capture the noise profile from the quietest 2 seconds in the track. Keep reduction under 12 dB — past that you get watery, swirling edges. Raise transient guard so drum hits are not smeared.",
    presets: [
      {
        name: "Hiss Down 10 dB",
        params: { Amount: 50, Reduction: "-10 dB", Threshold: "auto", Smoothing: "medium", "Transient Guard": "0.4" },
        prompt:
          'Build "Hiss Down" — a spectral de-noiser that learns a noise profile and subtracts it. Controls: Amount (0.0 default), Reduction, Threshold, Smoothing, Transient guard, Learn button, Listen to residual. Preset "Hiss Down 10 dB": -10 dB reduction, auto threshold, medium smoothing, transient guard 0.4, Amount 50.',
      },
      {
        name: "Gentle Floor Tidy (6 dB)",
        params: { Amount: 34, Reduction: "-6 dB", Smoothing: "high", "Transient Guard": "0.6" },
        prompt:
          'Make "Floor Tidy" — a very gentle, high-smoothing denoise for material that only has a slight floor. Controls: Amount (0.0 default), Reduction, Smoothing, Transient guard, Learn. Preset: -6 dB, smoothing high, guard 0.6, Amount 34.',
      },
      {
        name: "Drum-Safe Denoise",
        params: { Amount: 46, Reduction: "-9 dB", "Transient Guard": "0.9", Attack: "0 ms", Release: "80 ms" },
        prompt:
          'Create "Drum Safe" — a denoise with maximum transient protection so kick and snare never get smeared. Controls: Amount (0.0 default), Reduction, Transient guard, Attack, Release, Learn, Listen. Preset: -9 dB, guard 0.9, 0 ms attack, 80 ms release, Amount 46.',
      },
      {
        name: "Vocal Noise Gate + Denoise",
        params: { Amount: 54, Reduction: "-12 dB", "Gate Floor": "-48 dB", Smoothing: "medium", Range: "150 Hz–14 kHz" },
        prompt:
          'Build "Vocal Clean" — a denoise plus an in-gap gate for vocal stems, working 150 Hz–14 kHz. Controls: Amount (0.0 default), Reduction, Gate floor, Smoothing, Frequency range, Learn. Preset: -12 dB reduction, gate floor -48 dB, medium smoothing, Amount 54.',
      },
      {
        name: "Aggressive Salvage",
        params: { Amount: 76, Reduction: "-18 dB", Smoothing: "low", "Watery Guard": "on" },
        prompt:
          'Make "Salvage Denoise" — an aggressive setting for badly generated audio, with a watery-artifact guard that backs off automatically when it hears swirling. Controls: Amount (0.0 default), Reduction, Smoothing, Watery guard, Listen. Preset: -18 dB, low smoothing, watery guard on, Amount 76. Warn me if the result sounds underwater.',
      },
      {
        name: "Room Tone Match",
        params: { Amount: 40, Reduction: "-7 dB", Profile: "from reference clip", "Continuous Learn": "on" },
        prompt:
          'Create "Room Match" — a denoise that continuously learns the floor from a reference clip so all stems share one noise character. Controls: Amount (0.0 default), Profile source, Reduction, Continuous learn, Smoothing. Preset: profile from the room-tone clip, -7 dB, continuous learn on, Amount 40.',
      },
      {
        name: "Hum & Mains Removal",
        params: { Amount: 58, Mode: "harmonic", "Fundamental": "50 Hz", Harmonics: "5", Notch: "-20 dB" },
        prompt:
          'Build "Hum Kill" — a harmonic hum remover with a selectable 50/60 Hz fundamental and up to 8 harmonics. Controls: Amount (0.0 default), Fundamental, Harmonic count, Notch depth, Q, Adaptive on/off. Preset: 50 Hz fundamental, 5 harmonics, -20 dB notch, Q 12, Amount 58.',
      },
      {
        name: "Silence Trimmer + Denoise",
        params: { Amount: 50, Reduction: "-10 dB", "Silence Gate": "-45 dB", "Trim Head/Tail": "on" },
        prompt:
          'Make "Silence Clean" — a denoise that also trims leading and trailing silence to a set length. Controls: Amount (0.0 default), Reduction, Silence threshold, Trim length, Smoothing. Preset: -10 dB reduction, silence threshold -45 dB, 100 ms trim, Amount 50.',
      },
    ],
  },
  {
    id: "declick",
    name: "De-Click / De-Crackle",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🩹",
    target: "Vocals, full mix, separated stems",
    oneLiner:
      "Click, pop, crackle and drop-out repair with single-band or wide-band detection — the RX workflow, rebuilt for Studio.",
    artifact: "Clicks, pops, digital crackle and drop-outs from generation and separation. RX users run De-click (single-band) then De-crackle (high band).",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Sensitivity", value: "0.0" },
      { name: "Click Width", value: "0.0 ms" },
      { name: "Mode", value: "single-band" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Do it in two stages like the RX workflow: De-click in single-band mode first (it is the most surgical), then De-crackle in high-band mode for the granular sizzle. Listen to the residual — if you hear music in it, back off.",
    presets: [
      {
        name: "Click Repair (single-band)",
        params: { Amount: 52, Sensitivity: "0.5", "Click Width": "3 ms", Mode: "single-band", Mix: "100%" },
        prompt:
          'Build "Click Repair" — a de-clicker with single-band and wide-band modes. Controls: Amount (0.0 default), Sensitivity, Click width, Mode, Mix, Listen to removed signal. Preset "Click Repair (single-band)": sensitivity 0.5, 3 ms click width, single-band mode, Amount 52.',
      },
      {
        name: "High-Band Crackle",
        params: { Amount: 58, Sensitivity: "0.6", Mode: "high-band", Band: "4–16 kHz", "Crackle Depth": "-9 dB" },
        prompt:
          'Make "Crackle Off" — a de-crackler aimed at the 4–16 kHz band for granular sizzle in AI stems. Controls: Amount (0.0 default), Sensitivity, Band, Crackle depth, Mode, Listen. Preset: high-band mode, 4–16 kHz, -9 dB crackle depth, sensitivity 0.6.',
      },
      {
        name: "Plosive Pop Fix",
        params: { Amount: 56, Mode: "plosive", Band: "30–250 Hz", "Pop Depth": "-12 dB", Attack: "1 ms" },
        prompt:
          'Create "Pop Fix" — a plosive remover that only works in 30–250 Hz when a P or B spike is detected. Controls: Amount (0.0 default), Mode, Band, Pop depth, Attack, Listen. Preset: plosive mode, 30–250 Hz, -12 dB, 1 ms attack, Amount 56.',
      },
      {
        name: "Drop-Out & Stutter Fill",
        params: { Amount: 64, Mode: "drop-out", "Fill Length": "80 ms", "Fill Type": "spectral", Sensitivity: "0.7" },
        prompt:
          'Build "Drop-Out Fix" — a repair module that detects short drop-outs and stutters and fills them spectrally. Controls: Amount (0.0 default), Mode, Fill length, Fill type, Sensitivity, Listen. Preset: drop-out mode, 80 ms max fill, spectral fill, Amount 64.',
      },
      {
        name: "Vinyl Crackle Add (Inverse)",
        params: { Amount: 60, Mode: "add", "Crackle Density": "0.5", "Surface Noise": "0.3", LPF: "12 kHz" },
        prompt:
          'Make "Add Crackle" — the same engine in reverse, generating vinyl crackle and surface noise for lo-fi. Controls: Amount (0.0 default), Mode, Crackle density, Surface noise, LPF, Mix. Preset: add mode, density 0.5, surface noise 0.3, LPF 12 kHz.',
      },
      {
        name: "Separation Stitcher",
        params: { Amount: 54, Sensitivity: "0.55", Mode: "wide-band", "Boundary Clicks": "on", Listen: "on" },
        prompt:
          'Create "Stitcher" — a de-clicker tuned to the click and phase-pop artifacts that appear at stem-separation boundaries. Controls: Amount (0.0 default), Sensitivity, Mode, Boundary detection, Listen. Preset: wide-band mode, boundary clicks on, sensitivity 0.55, Amount 54.',
      },
      {
        name: "Vocal Consonant Repair",
        params: { Amount: 46, Mode: "single-band", Band: "2–8 kHz", Sensitivity: "0.45", "Smoothing": "medium" },
        prompt:
          'Make "Consonant Repair" — a de-clicker band-limited to 2–8 kHz that removes the digital spitting on S and T sounds. Controls: Amount (0.0 default), Mode, Band, Sensitivity, Smoothing, Listen. Preset: single-band, 2–8 kHz, sensitivity 0.45, medium smoothing, Amount 46.',
      },
      {
        name: "Full Mix Two-Stage",
        params: { Amount: 50, Stage: "click then crackle", "Total Reduction": "-12 dB", Listen: "on" },
        prompt:
          'Build "Two-Stage Clean" — one plugin that runs De-click in single-band mode and then De-crackle in high-band mode in series, with a single Amount and a residual listen. Controls: Amount (0.0 default), Stage 1 sensitivity, Stage 2 sensitivity, Listen, Mix. Preset "Full Mix Two-Stage": stage 1 sensitivity 0.5, stage 2 sensitivity 0.6, total -12 dB, Amount 50.',
      },
    ],
  },
  {
    id: "gated-reflection",
    name: "Gated / Non-Linear Reverb",
    kind: "Chat-built",
    category: "Space",
    icon: "⏹️",
    target: "Snare, toms, vocal throws",
    oneLiner:
      "Reverb with an envelope instead of a decay — huge, then instantly gone. Pure 80s and trap utility.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Hold", value: "0.0 ms" },
      { name: "Release", value: "0.0 ms" },
      { name: "Size", value: "0.0" },
    ],
    tip: "Non-linear reverb hides generation artifacts beautifully: because there is no tail, there is nothing to shimmer. Trigger it from the dry hit so the gate lands in time.",
    presets: [
      {
        name: "80s Gated Snare",
        params: { Amount: 68, Mix: "40%", Size: "large", Hold: "180 ms", Release: "8 ms", Trigger: "dry snare" },
        prompt:
          'Build "Gated Snare" — a non-linear reverb with an envelope instead of a decay, triggered by the dry hit. Controls: Amount (0.0 default), Size, Hold, Release, Trigger source, Mix, Dampening. Preset "80s Gated Snare": large size, 180 ms hold, 8 ms release, trigger from the dry snare, 40% wet.',
      },
      {
        name: "Reverse-Gate Suck",
        params: { Amount: 64, Mix: "38%", Mode: "reverse envelope", Hold: "250 ms", Release: "60 ms" },
        prompt:
          'Make "Reverse Gate" — a non-linear reverb that swells backwards into the hit. Controls: Amount (0.0 default), Mode, Hold, Release, Trigger, Mix. Preset: reverse envelope, 250 ms hold, 60 ms release, 38% wet.',
      },
      {
        name: "Trap Snare Slap",
        params: { Amount: 56, Mix: "28%", Size: "medium", Hold: "90 ms", Release: "20 ms", "Wet HPF": "300 Hz" },
        prompt:
          'Create "Trap Slap" — a short gated verb for trap snares that adds space without blur. Controls: Amount (0.0 default), Size, Hold, Release, Wet HPF, Mix. Preset: medium size, 90 ms hold, 20 ms release, wet HPF 300 Hz, 28% wet.',
      },
      {
        name: "Tom Burst",
        params: { Amount: 60, Mix: "34%", Size: "large", Hold: "300 ms", Release: "40 ms", Tuning: "auto" },
        prompt:
          'Build "Tom Burst" — a long gated reverb for tom fills that cuts off hard on the downbeat. Controls: Amount (0.0 default), Size, Hold, Release, Trigger, Mix. Preset: large size, 300 ms hold, 40 ms release, trigger from the last tom hit.',
      },
      {
        name: "Vocal Punch Gate",
        params: { Amount: 52, Mix: "26%", Size: "plate", Hold: "140 ms", Release: "25 ms", Trigger: "dry vocal" },
        prompt:
          'Make "Vocal Punch Gate" — a gated plate that fattens individual vocal phrases without a tail behind the mix. Controls: Amount (0.0 default), Size, Hold, Release, Trigger, Duck, Mix. Preset: plate size, 140 ms hold, 25 ms release, triggered by the dry vocal, 26% wet.',
      },
      {
        name: "Rhythmic Verb Pattern",
        params: { Amount: 62, Mix: "36%", Pattern: "1/16 gate", Size: "large", Sync: "tempo" },
        prompt:
          'Create "Verb Pattern" — a gated reverb whose envelope follows a tempo-synced gate pattern. Controls: Amount (0.0 default), Pattern, Sync division, Size, Release, Mix. Preset: 1/16 pattern with accents on 1 and the "and" of 2, large size, 36% wet.',
      },
      {
        name: "Non-Linear Impact",
        params: { Amount: 70, Mix: "45%", Size: "huge", Hold: "500 ms", Release: "100 ms", Pitch: "-12 st" },
        prompt:
          'Build "Impact Verb" — a huge non-linear reverb with a downward pitch bend for trailer hits. Controls: Amount (0.0 default), Size, Hold, Release, Pitch, Mix. Preset: huge size, 500 ms hold, 100 ms release, -12 semitone pitch, 45% wet.',
      },
      {
        name: "Short Snap Ambience",
        params: { Amount: 38, Mix: "14%", Size: "small", Hold: "60 ms", Release: "30 ms" },
        prompt:
          'Make "Snap Ambience" — a very short non-linear ambience that adds body to dry separated stems without any tail. Controls: Amount (0.0 default), Size, Hold, Release, Mix, Width. Preset: small size, 60 ms hold, 30 ms release, 14% wet.',
      },
    ],
  },
];
