import type { Plugin } from "../types";

export const cleanupB: Plugin[] = [
  {
    id: "fixed-tone-notcher",
    name: "Fixed-Tone / Whistle Notcher",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "📻",
    target: "Full mix, synth stems, vocals",
    oneLiner:
      "Finds and cancels the constant pure tones and drones that AI generation leaves parked under the music.",
    artifact: "Fixed tones — a faint whistle or drone at one frequency that never changes, most audible on headphones in quiet passages.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Notch Depth", value: "0.0 dB" },
      { name: "Frequency", value: "0.0 Hz" },
      { name: "Q", value: "0.0 (wide)" },
      { name: "Auto-Find", value: "off" },
    ],
    tip: "Loop the quietest 4 bars, solo the delta (what it removes) and raise Amount until you hear only the tone. Never notch wider than Q 25 — past that you take music with it.",
    presets: [
      {
        name: "Auto-Find and Kill",
        params: { Amount: 56, "Auto-Find": "on", "Notch Depth": "-14 dB", Q: "22", "Max Notches": "3" },
        prompt:
          'Build "Tone Killer" — an auto-detecting fixed-tone notcher that finds constant tones and cancels them. Controls: Amount (0.0 default), Auto-find, Max notches, Notch depth, Q, Delta listen. Preset "Auto-Find and Kill": auto-find on, up to 3 notches, -14 dB depth, Q 22.',
      },
      {
        name: "Manual Whistle Notch",
        params: { Amount: 62, Frequency: "7.2 kHz", "Notch Depth": "-18 dB", Q: "30" },
        prompt:
          'Make "Whistle Notch" — a single manually placed ultra-narrow notch with a sweep helper. Controls: Amount (0.0 default), Frequency, Notch depth, Q, Sweep listen, Delta listen. Preset: 7.2 kHz, -18 dB, Q 30.',
      },
      {
        name: "Low Drone Cancel",
        params: { Amount: 48, Frequency: "55 Hz", "Notch Depth": "-10 dB", Q: "12", "Band Limit": "20–200 Hz" },
        prompt:
          'Create "Drone Cancel" — a low-band fixed-tone notcher for the drones AI adds under bass parts. Controls: Amount (0.0 default), Frequency, Depth, Q, Band limit, Delta listen. Preset: 55 Hz, -10 dB, Q 12, band limited to 20–200 Hz.',
      },
      {
        name: "Harmonic Series Killer",
        params: { Amount: 54, Fundamental: "1.2 kHz", Harmonics: "4", "Notch Depth": "-12 dB", Q: "25" },
        prompt:
          'Build "Harmonic Killer" — a notcher that cancels a fundamental and its first four harmonics when a fixed tone has overtones. Controls: Amount (0.0 default), Fundamental, Harmonic count, Depth, Q, Delta listen. Preset: 1.2 kHz fundamental, 4 harmonics, -12 dB, Q 25.',
      },
      {
        name: "Quiet-Passage Only",
        params: { Amount: 50, Trigger: "level", "Below": "-30 dB", "Notch Depth": "-16 dB", Q: "20" },
        prompt:
          'Make "Quiet Only" — a tone notcher that only acts when the mix drops below a threshold, so it never touches loud sections. Controls: Amount (0.0 default), Trigger level, Notch depth, Q, Delta listen. Preset: trigger below -30 dB, -16 dB depth, Q 20.',
      },
      {
        name: "Vocal Fizz Tone",
        params: { Amount: 52, Band: "3–9 kHz", "Notch Depth": "-12 dB", Q: "18", "Auto-Find": "on" },
        prompt:
          'Create "Vocal Tone Off" — an auto-finding notcher limited to 3–9 kHz for the whistles that appear on AI vocals. Controls: Amount (0.0 default), Band, Auto-find, Depth, Q, Delta listen. Preset: band 3–9 kHz, auto-find on, -12 dB, Q 18.',
      },
      {
        name: "Stereo Pair Notch",
        params: { Amount: 56, Mode: "per-channel", "L Freq": "6.4 kHz", "R Freq": "6.9 kHz", "Notch Depth": "-14 dB" },
        prompt:
          'Build "Stereo Notch" — two independent notches, one per channel, for tones that differ left to right. Controls: Amount (0.0 default), L frequency, R frequency, Depth, Q, Delta listen. Preset: L 6.4 kHz, R 6.9 kHz, -14 dB, Q 22.',
      },
      {
        name: "Constant-Tone Report",
        params: { Amount: 0.0, Mode: "analyse", "Report": "list of tones", "Auto-fix": "off" },
        prompt:
          'Make "Tone Report" — an analysis-only mode that scans a track, lists every constant tone with its frequency and level, and does nothing unless I enable auto-fix. Controls: Amount (0.0 default), Auto-fix, Report detail, Delta listen. Preset: analyse mode, report with frequency and level for each tone.',
      },
    ],
  },
  {
    id: "stereo-stabilizer",
    name: "Stereo & Phase Stabilizer",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🧲",
    target: "Full mix, separated stems, wide synths",
    oneLiner:
      "Monitors mono compatibility, cancels out-of-phase content and repairs comb-filtered stereo images.",
    artifact: "Smeared or collapsing stereo image — elements that vanish in mono, hollow phasey sides, or a mix that feels wider than it is tall.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Phase Repair", value: "0.0" },
      { name: "Mono Below", value: "off" },
      { name: "Width", value: "100%" },
      { name: "Correlation", value: "display only" },
    ],
    tip: "Check mono on every mix — AI material collapses in mono far more often than recorded material. Repair phase first, then set width; repairing after widening destroys the image again.",
    presets: [
      {
        name: "Mono Compatibility Fix",
        params: { Amount: 48, "Phase Repair": "0.6", "Mono Below": "120 Hz", Width: "100%", "Correlation Guard": "on" },
        prompt:
          'Build "Mono Fix" — a stereo and phase stabiliser with a correlation meter, phase repair, mono-below and width. Controls: Amount (0.0 default), Phase repair, Mono-below, Width, Correlation guard, Mono listen. Preset "Mono Compatibility Fix": phase repair 0.6, mono below 120 Hz, width 100%, correlation guard on.',
      },
      {
        name: "Underwater Phase Repair",
        params: { Amount: 55, "Phase Repair": "0.8", Band: "300 Hz–8 kHz", Width: "95%" },
        prompt:
          'Make "Phase Repair" — a mid-side phase repair for stems that sound hollow or swishy after separation. Controls: Amount (0.0 default), Phase repair, Band, Width, Mono listen. Preset: phase repair 0.8, band 300 Hz–8 kHz, width 95%.',
      },
      {
        name: "Narrow the Sides (Vocal)",
        params: { Amount: 44, Width: "70%", Band: "1–6 kHz", "Centre Focus": "on" },
        prompt:
          'Create "Vocal Centre" — a mid-side tool that narrows a specific band so the vocal sits in the centre. Controls: Amount (0.0 default), Width, Band, Centre focus, Mono-below. Preset: width 70%, band 1–6 kHz, centre focus on.',
      },
      {
        name: "Bass Mono Below",
        params: { Amount: 30, "Mono Below": "100 Hz", "Slope": "24 dB/oct", Width: "100%" },
        prompt:
          'Build "Bass Mono" — a frequency-selective mono maker for everything below a set cutoff. Controls: Amount (0.0 default), Mono-below, Slope, Width, Phase mode. Preset: mono below 100 Hz, 24 dB/oct slope, linear phase.',
      },
      {
        name: "Width Tame (Over-Wide Mix)",
        params: { Amount: 40, Width: "85%", "Correlation Floor": "-0.2", Band: "full" },
        prompt:
          'Make "Width Tame" — a width reducer with a correlation floor so the image never inverts. Controls: Amount (0.0 default), Width, Correlation floor, Band, Mono listen. Preset: width 85%, correlation floor -0.2.',
      },
      {
        name: "Side-Only Repair",
        params: { Amount: 52, "Side Repair": "0.7", "Side HPF": "250 Hz", "Side LPF": "12 kHz" },
        prompt:
          'Create "Side Repair" — a mid-side stabiliser that only processes the side channel: repaired, band-limited sides. Controls: Amount (0.0 default), Side repair, Side HPF, Side LPF, Mono listen. Preset: side repair 0.7, sides 250 Hz–12 kHz.',
      },
      {
        name: "Crosstalk & Bleed Fix",
        params: { Amount: 50, "Crosstalk Cut": "-6 dB", Band: "full", "Centre Keep": "on" },
        prompt:
          'Make "Bleed Fix" — a stereo tool that reduces inter-channel crosstalk in separated stems so parts stop doubling. Controls: Amount (0.0 default), Crosstalk cut, Band, Centre keep, Delta listen. Preset: -6 dB crosstalk cut, centre keep on.',
      },
      {
        name: "Imaging Check (Analysis Only)",
        params: { Amount: 0.0, Mode: "analyse", "Meters": "correlation, balance, width", "Mono Toggle": "on" },
        prompt:
          'Build "Image Check" — an analysis-only stereo meter with correlation, balance and width readouts plus a mono toggle, so I can see problems before fixing them. Controls: Amount (0.0 default, always analysing), Mono toggle, Meter detail, Correlation history. Preset: analysis mode with correlation history graph.',
      },
    ],
  },
  {
    id: "tail-loop-smoother",
    name: "Tail & Loop Smoother",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "♾️",
    target: "Loops, clips, sample library builds",
    oneLiner:
      "Trims generated tails, matches loop seams and crossfades clip boundaries so nothing clicks or stutters.",
    artifact: "Clicks at loop points, abrupt endings, tails that cut mid-swell and the dead air Suno leaves at the head of a generation.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Trim", value: "0.0 ms" },
      { name: "Crossfade", value: "0.0 ms" },
      { name: "Loop Length", value: "off" },
      { name: "Tail Fade", value: "0.0 ms" },
    ],
    tip: "Set loop length in bars, not milliseconds, and use an equal-power crossfade of 20–80 ms. For clip boundaries, 5–15 ms is enough — longer crossfades smear transients.",
    presets: [
      {
        name: "Perfect 2-Bar Loop",
        params: { Amount: 54, "Loop Length": "2 bars", Crossfade: "60 ms", "Snap": "bar", "Tail Fade": "30 ms" },
        prompt:
          'Build "Loop Perfect" — a loop smoother with bar-length detection, snap, crossfade and tail fade. Controls: Amount (0.0 default), Loop length in bars, Crossfade, Snap, Tail fade, Detect tempo. Preset "Perfect 2-Bar Loop": 2 bars, 60 ms equal-power crossfade, snap to bar, 30 ms tail fade.',
      },
      {
        name: "Clean Clip Head & Tail",
        params: { Amount: 40, "Head Trim": "auto", "Tail Fade": "120 ms", "Silence Gate": "-50 dB" },
        prompt:
          'Make "Head & Tail" — an auto-trimmer that removes dead air at the start of a generation and fades the tail cleanly. Controls: Amount (0.0 default), Head trim, Tail fade, Silence gate, Snap. Preset: auto head trim, 120 ms tail fade, silence gate -50 dB.',
      },
      {
        name: "Clip Boundary Crossfade",
        params: { Amount: 46, Crossfade: "12 ms", Curve: "equal power", Mode: "per boundary" },
        prompt:
          'Create "Boundary Blend" — an automatic short crossfade at every clip boundary on a track. Controls: Amount (0.0 default), Crossfade length, Curve, Mode, Fade shape. Preset: 12 ms, equal-power curve, per boundary.',
      },
      {
        name: "Tail Ring-Out",
        params: { Amount: 58, "Tail Length": "2 s", "Fade Shape": "exponential", "Tail Reverb": "match" },
        prompt:
          'Build "Ring Out" — a tail tool that extends or shortens the natural decay after the last note. Controls: Amount (0.0 default), Tail length, Fade shape, Tail reverb match, Trim. Preset: 2 s tail, exponential fade, matched to the source decay.',
      },
      {
        name: "Seamless Sample for Library",
        params: { Amount: 50, "Loop Length": "4 bars", Crossfade: "40 ms", "Normalise": "-1 dBFS", "Export": "WAV 24-bit" },
        prompt:
          'Make "Library Loop" — a loop smoother plus normalise and export settings so I can build a sample pack from generations. Controls: Amount (0.0 default), Loop length, Crossfade, Normalise target, Export format. Preset: 4 bars, 40 ms crossfade, normalise to -1 dBFS, export 24-bit WAV.',
      },
      {
        name: "Reverse Tail into Hit",
        params: { Amount: 60, Mode: "reverse tail", "Tail Length": "1 bar", "Fade In": "200 ms" },
        prompt:
          'Create "Reverse Tail" — takes the decay after a hit, reverses it and places it before the hit as a swell. Controls: Amount (0.0 default), Tail length, Fade in, Pan, Mix. Preset: 1 bar tail, 200 ms fade-in, full wet.',
      },
      {
        name: "Stutter Seam Repair",
        params: { Amount: 56, Mode: "seam", Sensitivity: "0.6", "Patch Length": "80 ms", "Patch Type": "spectral" },
        prompt:
          'Build "Seam Repair" — detects and patches the stutter or jump artifacts that appear inside generated clips. Controls: Amount (0.0 default), Sensitivity, Patch length, Patch type, Delta listen. Preset: seam mode, sensitivity 0.6, 80 ms spectral patch.',
      },
      {
        name: "Tempo-Synced Slice Smoother",
        params: { Amount: 52, "Slice Grid": "1/16", Crossfade: "8 ms", "Snap": "grid" },
        prompt:
          'Make "Slice Smooth" — crossfades every slice on a tempo grid so chopped AI audio never clicks. Controls: Amount (0.0 default), Slice grid, Crossfade, Snap, Fade curve. Preset: 1/16 grid, 8 ms crossfade, snap to grid.',
      },
    ],
  },
  {
    id: "breath-mouth",
    name: "Breath & Mouth Noise Control",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "😮‍💨",
    target: "Lead vocals, spoken word",
    oneLiner:
      "Detects breaths, clicks and mouth noise separately from the vocal and lets you duck, remove or replace them.",
    artifact: "Loud AI breaths, lip smacks and mouth clicks between phrases — the fastest giveaway in a generated vocal.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Breath Level", value: "0.0 dB" },
      { name: "Sensitivity", value: "0.0" },
      { name: "Mouth Click", value: "0.0 dB" },
      { name: "Replace", value: "off" },
    ],
    tip: "Reduce breaths by 6–10 dB rather than removing them — a vocal with no breaths sounds dead and robotic. Keep the attack slow enough that consonants are untouched.",
    presets: [
      {
        name: "Breath -8 dB",
        params: { Amount: 52, "Breath Level": "-8 dB", Sensitivity: "0.55", "Attack": "20 ms", Release: "150 ms" },
        prompt:
          'Build "Breath Control" — a breath detector with level, sensitivity, attack, release and a replace option. Controls: Amount (0.0 default), Breath level, Sensitivity, Attack, Release, Replace with room tone. Preset "Breath -8 dB": -8 dB on detected breaths, sensitivity 0.55, 20 ms attack, 150 ms release.',
      },
      {
        name: "Breath Removal Only",
        params: { Amount: 72, "Breath Level": "-30 dB", Sensitivity: "0.7", "Replace": "room tone" },
        prompt:
          'Make "Breath Off" — full breath removal, replacing them with room tone so the gaps are not digital silence. Controls: Amount (0.0 default), Breath level, Sensitivity, Replace, Room tone source. Preset: -30 dB, sensitivity 0.7, replace with the track\'s own room tone.',
      },
      {
        name: "Mouth Click & Smack",
        params: { Amount: 58, "Click Depth": "-12 dB", Band: "1–8 kHz", Sensitivity: "0.6" },
        prompt:
          'Create "Mouth Off" — a mouth-noise remover for lip smacks and clicks, band-limited so the vocal body is untouched. Controls: Amount (0.0 default), Click depth, Band, Sensitivity, Delta listen. Preset: -12 dB, band 1–8 kHz, sensitivity 0.6.',
      },
      {
        name: "Gentle Podcast Clean",
        params: { Amount: 44, "Breath Level": "-5 dB", "Click Depth": "-8 dB", Sensitivity: "0.45" },
        prompt:
          'Build "VO Clean" — a gentle breath and mouth noise clean for narration. Controls: Amount (0.0 default), Breath level, Click depth, Sensitivity, HPF, Delta listen. Preset: breaths -5 dB, clicks -8 dB, sensitivity 0.45, HPF 90 Hz.',
      },
      {
        name: "Breath Boost (Emotional)",
        params: { Amount: 48, "Breath Level": "+4 dB", Sensitivity: "0.5", "Air": "+1.5 dB" },
        prompt:
          'Make "Breath Up" — the same detector used to raise breaths for an intimate, emotional vocal. Controls: Amount (0.0 default), Breath level, Air shelf, Sensitivity. Preset: breaths +4 dB, +1.5 dB air shelf at 11 kHz, sensitivity 0.5.',
      },
      {
        name: "Harmony Stack Clean",
        params: { Amount: 50, "Breath Level": "-10 dB", "Click Depth": "-10 dB", "Stack Link": "all tracks" },
        prompt:
          'Create "Stack Clean" — a breath and mouth noise cleaner that shares its detection across all harmony tracks so they duck together. Controls: Amount (0.0 default), Breath level, Click depth, Stack link, Delta listen. Preset: breaths -10 dB, clicks -10 dB, stack link "harmonies".',
      },
      {
        name: "Live-Take Feel",
        params: { Amount: 40, "Breath Level": "-3 dB", "Random Keep": "on", "Amplitude Humanise": "1 dB" },
        prompt:
          'Make "Live Take" — a light clean plus random keep, so some breaths survive and the vocal feels performed rather than generated. Controls: Amount (0.0 default), Breath level, Random keep probability, Amplitude humanise. Preset: breaths -3 dB, keep 60% of breaths randomly, 1 dB level variation.',
      },
      {
        name: "Silence Between Phrases",
        params: { Amount: 54, "Gap Gate": "-45 dB", "Minimum Gap": "120 ms", "Replace": "room tone" },
        prompt:
          'Build "Phrase Gaps" — a tool that cleans the gaps between vocal phrases and fills them with matching room tone. Controls: Amount (0.0 default), Gap gate, Minimum gap, Replace source, Fade length. Preset: gate -45 dB, minimum gap 120 ms, replace with room tone, 10 ms fades.',
      },
    ],
  },
];
