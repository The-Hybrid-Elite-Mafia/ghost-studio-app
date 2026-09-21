import type { Plugin } from "../types";

export const cleanupC: Plugin[] = [
  {
    id: "artifact-analyser",
    name: "Artifact Analyser (Diagnose First)",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🔍",
    target: "Any generation before you process it",
    oneLiner:
      "Scans a clip, names what it hears — shimmer, hiss, wobble, smear, tones, clicks — and suggests which plugin and preset to run.",
    artifact: "Use this BEFORE any cleanup. Diagnose first, process second — most AI cleanup fails because people guess the wrong problem.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mode", value: "analyse only" },
      { name: "Report", value: "summary" },
      { name: "Auto-fix", value: "off" },
    ],
    tip: "Run this on every generation before you touch a knob. Ask it to name each artifact with a frequency range and a severity score, then fix only the top two — stacking six cleanup plugins always sounds worse than fixing two.",
    presets: [
      {
        name: "Full Diagnostic Sweep",
        params: { Amount: 0.0, Mode: "analyse", Report: "artifact list + severity", "Auto-fix": "off" },
        prompt:
          'Build "Artifact Analyser" — a diagnostic plugin that scans the selected clip and reports which AI artifacts it detects: metallic shimmer, hiss, pitch wobble, phase smear, fixed tones, clicks, robotic vocal texture and smeared reverb. For each, give a frequency range, a severity score out of 10 and which plugin and preset I should use. Mode: analyse only, no processing. Controls: Amount (0.0 default), Mode, Report detail, Auto-fix (off by default).',
      },
      {
        name: "Vocal-Only Diagnostic",
        params: { Amount: 0.0, Mode: "analyse", Source: "vocal", Report: "top 3 fixes" },
        prompt:
          'Make "Vocal Diagnose" — an analyser that only looks at vocal-specific artifacts: sibilance, shimmer, wobble, robotic texture, breath noise and plastic formants. It should return the top three fixes in priority order with recommended Amount values. Controls: Amount (0.0 default), Source focus, Report detail, Auto-fix.',
      },
      {
        name: "Pre-Master Check",
        params: { Amount: 0.0, Mode: "analyse", Stage: "pre-master", Report: "loudness + artifacts" },
        prompt:
          'Create "Pre-Master Check" — an analyser for the master stage that reports integrated LUFS, true peak, dynamic range, mono compatibility AND whether any metallic shimmer or brittle highs will be pushed forward by limiting. Controls: Amount (0.0 default), Report detail, Targets (LUFS / dBTP), Auto-fix.',
      },
      {
        name: "Auto-Fix Top Two",
        params: { Amount: 45, Mode: "auto-fix", "Max Stages": "2", Report: "what it did" },
        prompt:
          'Build "Auto Clean" — an analyser that diagnoses and then applies only the two highest-priority fixes automatically, with a report of what it changed and a delta listen. Controls: Amount (0.0 default), Max stages, Mode, Delta listen, Report. Preset: max 2 stages, report after processing, Amount 45.',
      },
      {
        name: "Residual Solo Monitor",
        params: { Amount: 40, Mode: "delta", "Monitor": "removed signal only", Mix: "delta" },
        prompt:
          'Make "Delta Monitor" — a utility that plays only what my cleanup chain removed, so I can tell instantly whether I am removing artifacts or music. Controls: Amount (0.0 default), Monitor mode (delta / result / both), Mix. Preset: delta mode, monitor the removed signal only.',
      },
      {
        name: "Artifact Timeline Map",
        params: { Amount: 0.0, Mode: "map", "Output": "markers on timeline", Report: "per-section" },
        prompt:
          'Create "Artifact Map" — an analyser that places markers on the timeline wherever it detects an artifact, labelled by type and severity, so I can jump straight to the bad bars. Controls: Amount (0.0 default), Marker types, Minimum severity, Auto-fix.',
      },
      {
        name: "Loudness & Spectrum Report",
        params: { Amount: 0.0, Mode: "report", "Meters": "LUFS, crest, spectral tilt" },
        prompt:
          'Build "Spectrum Report" — an analysis plugin that reports integrated and short-term LUFS, true peak, crest factor, stereo correlation and spectral tilt, and compares them to my chosen targets. Controls: Amount (0.0 default), Target LUFS, Target true peak, Report detail. Preset: targets -14 LUFS / -1 dBTP.',
      },
      {
        name: "Compare Two Takes",
        params: { Amount: 0.0, Mode: "compare", "Inputs": "clip A vs clip B", Report: "which is cleaner" },
        prompt:
          'Make "Take Compare" — an analyser that compares two generations of the same section and tells me which has fewer artifacts, with a spectral difference readout. Controls: Amount (0.0 default), Input A, Input B, Report detail. Preset: compare mode, report artifact counts for each take.',
      },
    ],
  },
  {
    id: "transient-restorer",
    name: "Transient Blur Restorer",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🔨",
    target: "Drums, percussion, plucked instruments",
    oneLiner:
      "Rebuilds the attack information that generation, separation and denoising destroy — the difference between soft and punchy.",
    artifact: "Soft, blurred transients — the whole kit sounds like it is played with mittens on. Caused by separation and spectral processing, not by the source.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Attack", value: "0.0 dB" },
      { name: "Band", value: "full" },
      { name: "Threshold", value: "0.0" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Restore transients in a band, not globally — boosting the whole spectrum makes things harsh. For a kit, band 1–6 kHz at +4 dB with a 1 ms attack does more than any compressor.",
    presets: [
      {
        name: "Kit Punch Rebuild",
        params: { Amount: 56, Attack: "+5 dB", Band: "1–6 kHz", Threshold: "-24 dB", "Attack Time": "1 ms" },
        prompt:
          'Build "Punch Rebuild" — a transient restorer with band-limited attack synthesis. Controls: Amount (0.0 default), Attack, Band edges, Threshold, Attack time, Mix. Preset "Kit Punch Rebuild": +5 dB in the 1–6 kHz zone, threshold -24 dB, 1 ms attack, Amount 56.',
      },
      {
        name: "Vocal Consonant Restore",
        params: { Amount: 46, Attack: "+3 dB", Band: "2.5–8 kHz", Threshold: "-28 dB", Release: "60 ms" },
        prompt:
          'Make "Consonant Restore" — a transient restorer that brings back crisp consonants after heavy vocal processing. Controls: Amount (0.0 default), Attack, Band, Threshold, Release, Mix. Preset: +3 dB, band 2.5–8 kHz, threshold -28 dB, 60 ms release.',
      },
      {
        name: "Snare Crack Synthesis",
        params: { Amount: 64, Attack: "+7 dB", Band: "180 Hz–1.2 kHz", Layer: "on", Threshold: "-20 dB" },
        prompt:
          'Create "Crack Layer" — a transient restorer that synthesises a body-band crack and layers it under a soft snare. Controls: Amount (0.0 default), Attack, Band, Layer on/off, Threshold, Mix. Preset: +7 dB, band 180 Hz–1.2 kHz, layer on, threshold -20 dB.',
      },
      {
        name: "Percussion Definition",
        params: { Amount: 50, Attack: "+4 dB", Band: "4–11 kHz", Release: "40 ms" },
        prompt:
          'Build "Perc Definition" — a high-band transient restorer for shakers, hats and tambourines. Controls: Amount (0.0 default), Attack, Band, Release, Mix. Preset: +4 dB, band 4–11 kHz, 40 ms release.',
      },
      {
        name: "Acoustic Natural Attack",
        params: { Amount: 34, Attack: "+2 dB", Band: "1–5 kHz", "Sustain": "-1 dB" },
        prompt:
          'Make "Natural Attack" — a subtle restorer for acoustic guitar and piano, with a small sustain reduction. Controls: Amount (0.0 default), Attack, Band, Sustain, Mix. Preset: +2 dB, band 1–5 kHz, sustain -1 dB.',
      },
      {
        name: "Softening (Sit Back)",
        params: { Amount: 42, Attack: "-5 dB", Band: "2–8 kHz", Sustain: "+1.5 dB" },
        prompt:
          'Create "Sit Back" — the inverse: softens attacks to push an element behind the lead vocal. Controls: Amount (0.0 default), Attack, Band, Sustain, Mix. Preset: attack -5 dB, band 2–8 kHz, sustain +1.5 dB.',
      },
      {
        name: "Post-Separation Drum Fix",
        params: { Amount: 60, Attack: "+6 dB", Band: "80 Hz–9 kHz", "Phase Align": "on" },
        prompt:
          'Build "Separation Punch" — a transient restorer with phase alignment, for drum stems that lost their attack in stem separation. Controls: Amount (0.0 default), Attack, Band, Phase align, Threshold, Mix. Preset: +6 dB, band 80 Hz–9 kHz, phase align on.',
      },
      {
        name: "Automation: Verse Soft, Chorus Punchy",
        params: { Amount: 50, Attack: "+5 dB", Automate: "section based", Mix: "100%" },
        prompt:
          'Make "Section Punch" — a transient restorer whose Amount is automatable, so verses stay soft and choruses hit. Controls: Amount (0.0 default, automatable), Attack, Band, Mix. Preset: Amount 20 in verses, 60 in choruses, attack +5 dB, band 1–6 kHz.',
      },
    ],
  },
  {
    id: "deplasticiser",
    name: "De-Plasticiser (Fingerprint Breaker)",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🧬",
    target: "Vocals, full mix, any generated audio",
    oneLiner:
      "Adds microscopic, controlled irregularity — timing, phase and harmonic drift — so generated audio stops sounding statistically perfect.",
    artifact: "The underlying 'plastic' quality: not a specific artifact, just regularity. Survives every export, bounce and master.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Micro-Timing", value: "0.0 ms" },
      { name: "Harmonic Drift", value: "0.0" },
      { name: "Phase Dither", value: "0.0" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Work at 20–40% — past that you hear the process. Randomise the seed every time you render so two exports are never identical, and always A/B at matched loudness.",
    presets: [
      {
        name: "Subtle De-Plastic",
        params: { Amount: 30, "Micro-Timing": "2 ms", "Harmonic Drift": "0.2", "Phase Dither": "0.15", Mix: "60%" },
        prompt:
          'Build "De-Plasticiser" — a plugin that breaks the statistical regularity of generated audio using micro-timing variation, harmonic drift and phase dither. Controls: Amount (0.0 default), Micro-timing range, Harmonic drift, Phase dither, Random seed, Mix. Preset "Subtle De-Plastic": 2 ms timing, 0.2 harmonic drift, 0.15 phase dither, 60% mix.',
      },
      {
        name: "Vocal Naturaliser",
        params: { Amount: 42, "Micro-Timing": "4 ms", "Formant Drift": "3%", "Amplitude Humanise": "1 dB" },
        prompt:
          'Make "Vocal Naturaliser" — a fingerprint breaker tuned for vocals, with formant drift and level variation on top of the timing dither. Controls: Amount (0.0 default), Micro-timing, Formant drift, Amplitude humanise, Seed, Mix. Preset: 4 ms, 3% formant, 1 dB level, Amount 42.',
      },
      {
        name: "Instrument Warm Irregularity",
        params: { Amount: 36, "Harmonic Drift": "0.35", "Bias Drift": "0.05 Hz", Mix: "70%" },
        prompt:
          'Create "Warm Drift" — a harmonic drift generator for synths and keys, like slightly unstable analogue circuitry. Controls: Amount (0.0 default), Harmonic drift, Bias drift rate, Phase dither, Mix. Preset: drift 0.35, bias drift 0.05 Hz, 70% mix.',
      },
      {
        name: "Timing Groove Humanise",
        params: { Amount: 48, "Micro-Timing": "8 ms", "Groove Feel": "laid back", "Grid Keep": "drums only" },
        prompt:
          'Build "Groove Humanise" — a timing irregularity generator with a feel control, so quantised AI parts gain a real performance feel. Controls: Amount (0.0 default), Micro-timing, Feel, Grid keep, Seed, Mix. Preset: 8 ms range, laid-back feel, grid kept on drums.',
      },
      {
        name: "Stereo Asymmetry Add",
        params: { Amount: 40, "L/R Offset": "0.6 ms", "Azimuth Drift": "0.3", "Correlation Floor": "0.3" },
        prompt:
          'Make "Asymmetry" — a stereo irregularity generator that breaks the perfect L/R symmetry of AI mixes, with a correlation floor so mono safety is maintained. Controls: Amount (0.0 default), L/R offset, Azimuth drift, Correlation floor, Mix. Preset: 0.6 ms offset, drift 0.3, floor 0.3.',
      },
      {
        name: "Master Fingerprint Pass",
        params: { Amount: 24, "Harmonic Drift": "0.15", "Phase Dither": "0.1", "Ceiling": "-1 dBTP" },
        prompt:
          'Create "Master Pass" — a mastering-safe fingerprint breaker with a very low Amount and a true-peak ceiling. Controls: Amount (0.0 default), Harmonic drift, Phase dither, Ceiling, Mix, Gain match. Preset: drift 0.15, dither 0.1, ceiling -1 dBTP, gain match on.',
      },
      {
        name: "Per-Section Variation",
        params: { Amount: 38, "Seed": "per section", "Micro-Timing": "4 ms", Automate: "on" },
        prompt:
          'Build "Section Variation" — a fingerprint breaker that re-randomises its seed every section, so no two parts of the song sound like the same render. Controls: Amount (0.0 default), Seed mode, Micro-timing, Harmonic drift, Mix. Preset: seed per section, 4 ms timing, drift 0.25.',
      },
      {
        name: "Render Randomiser",
        params: { Amount: 34, "Seed": "new each render", Mix: "50%", "Bypass Render": "off" },
        prompt:
          'Make "Render Randomiser" — a plugin that generates a new random seed each time it renders, so every export of the same project is subtly unique. Controls: Amount (0.0 default), Seed mode, Mix, Re-seed button. Preset: new seed per render, 50% mix.',
      },
    ],
  },
];
