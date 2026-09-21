import type { Plugin } from "../types";

export const cleanupA: Plugin[] = [
  {
    id: "phase-smear-repair",
    name: "Phase Smear / Underwater Repair",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🌊",
    target: "Separated stems, denoised audio, dereverbed vocals",
    oneLiner:
      "Rebuilds transient focus and phase coherence lost to separation, denoising and heavy spectral processing.",
    artifact: "The watery, underwater, 'swishy' sound you get after aggressive denoise or de-reverb. It is phase smear, not noise — denoising it again makes it worse.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Focus", value: "0.0" },
      { name: "Band", value: "full" },
      { name: "Transient Boost", value: "0.0 dB" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Fix this with transient focus, not with more denoise. Transient boost in the 2–6 kHz zone plus a phase-align pass restores the attack that smear destroys. If it is still swishy, re-generate or re-separate — do not stack more processing.",
    presets: [
      {
        name: "Underwater Vocal Fix",
        params: { Amount: 55, Focus: "0.6", "Transient Boost": "+4 dB", Band: "1.5–7 kHz", Mix: "80%" },
        prompt:
          'Build "Underwater Fix" — a phase-smear repair plugin with transient focus, a transient boost band, phase-align and mix. Controls: Amount (0.0 default), Focus, Transient boost, Band edges, Phase align, Mix. Preset "Underwater Vocal Fix": focus 0.6, transient boost +4 dB, band 1.5–7 kHz, phase align on, 80% mix.',
      },
      {
        name: "Post-Denoise Swish Remover",
        params: { Amount: 48, Focus: "0.5", "Transient Boost": "+3 dB", Smoothing: "high", Band: "2–9 kHz" },
        prompt:
          'Make "Swish Off" — a repair stage to run after a denoiser, restoring attack and killing the swishy residue. Controls: Amount (0.0 default), Focus, Transient boost, Smoothing, Band, Mix. Preset: focus 0.5, +3 dB transient boost, high smoothing, band 2–9 kHz.',
      },
      {
        name: "Drum Punch Recovery",
        params: { Amount: 58, Focus: "0.75", "Transient Boost": "+6 dB", Band: "80 Hz–8 kHz", Attack: "0.5 ms" },
        prompt:
          'Create "Punch Recovery" — a transient-focus repair for drum stems that came out of separation soft and smeared. Controls: Amount (0.0 default), Focus, Transient boost, Band, Attack, Release, Mix. Preset: focus 0.75, +6 dB transient boost, band 80 Hz–8 kHz, 0.5 ms attack.',
      },
      {
        name: "Bass Focus Tightener",
        params: { Amount: 46, Focus: "0.55", "Transient Boost": "+3 dB", Band: "40–250 Hz", "Phase Align": "on" },
        prompt:
          'Build "Bass Focus" — a low-band transient focus for bass stems that sound rounded and phase-smeared. Controls: Amount (0.0 default), Focus, Transient boost, Band, Phase align, Mix. Preset: focus 0.55, +3 dB, band 40–250 Hz, phase align on.',
      },
      {
        name: "De-Reverb Aftermath Repair",
        params: { Amount: 52, Focus: "0.5", "Transient Boost": "+3.5 dB", "Air Recovery": "+2 dB @ 12 kHz" },
        prompt:
          'Make "Aftermath" — a repair stage for vocals that got dull and smeary after de-reverb. Controls: Amount (0.0 default), Focus, Transient boost, Air recovery, Presence recovery, Mix. Preset: focus 0.5, +3.5 dB transient boost, +2 dB air at 12 kHz, +1.5 dB at 3 kHz.',
      },
      {
        name: "Whole-Mix Focus",
        params: { Amount: 34, Focus: "0.4", "Transient Boost": "+2 dB", Mix: "70%" },
        prompt:
          'Create "Mix Focus" — a gentle whole-mix transient focus for material that sounds soft and unfocused overall. Controls: Amount (0.0 default), Focus, Transient boost, Mix. Preset: focus 0.4, +2 dB transient boost, 70% mix.',
      },
      {
        name: "Smear Only in the Top",
        params: { Amount: 50, Focus: "0.6", Band: "6–14 kHz", "Transient Boost": "+3 dB", "Residual Listen": "on" },
        prompt:
          'Make "Top Focus" — a band-limited smear repair for the 6–14 kHz zone where denoisers do the most damage. Controls: Amount (0.0 default), Focus, Band, Transient boost, Residual listen. Preset: focus 0.6, band 6–14 kHz, +3 dB boost.',
      },
      {
        name: "Restoration Bypass (A/B)",
        params: { Amount: 40, "A/B Match": "loudness", "Delta Listen": "on", Bypass: "instant" },
        prompt:
          'Build "Restoration A/B" — a repair stage with instant bypass, loudness-matched A/B and a delta (difference) listen so I can hear exactly what the repair is doing. Controls: Amount (0.0 default), A/B match, Delta listen, Focus, Transient boost. Preset: loudness-matched A/B on, delta listen on, focus 0.5.',
      },
    ],
  },
  {
    id: "pitch-wobble-stabilizer",
    name: "Pitch Wobble Stabilizer",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🎯",
    target: "Lead vocals, sustained notes, strings",
    oneLiner:
      "Detects unintended pitch drift and holds the note centre while leaving intentional vibrato alone.",
    artifact: "The slightly-off, seasick pitch drift on held notes — not vibrato, just instability. Suno vocals drift most at the end of long phrases.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Strength", value: "0.0" },
      { name: "Range", value: "0.0 semitones" },
      { name: "Vibrato Keep", value: "100% (untouched)" },
      { name: "Response", value: "0.0 ms" },
    ],
    tip: "Set the correction range tight (±30 cents) and keep vibrato keep at 100% so real expression survives. Response around 60–120 ms sounds like a good singer; anything faster sounds like autotune.",
    presets: [
      {
        name: "Gentle Note Centering",
        params: { Amount: 42, Strength: "0.4", Range: "±30 cents", "Vibrato Keep": "100%", Response: "120 ms" },
        prompt:
          'Build "Wobble Stabilizer" — a pitch-stability processor that corrects drift while preserving vibrato. Controls: Amount (0.0 default), Strength, Correction range in cents, Vibrato keep, Response time, Formant preserve. Preset "Gentle Note Centering": strength 0.4, ±30 cents, vibrato keep 100%, response 120 ms, formant preserve on.',
      },
      {
        name: "Long-Note Hold",
        params: { Amount: 55, Strength: "0.6", Range: "±40 cents", "Vibrato Keep": "100%", Response: "200 ms" },
        prompt:
          'Make "Long Note Hold" — a slower correction aimed at the drift at the end of sustained notes. Controls: Amount (0.0 default), Strength, Range, Vibrato keep, Response, Sustain focus. Preset: strength 0.6, ±40 cents, response 200 ms, sustain focus on so only notes longer than 500 ms are corrected.',
      },
      {
        name: "Modern Pop Tight",
        params: { Amount: 68, Strength: "0.85", Range: "±60 cents", "Vibrato Keep": "60%", Response: "45 ms" },
        prompt:
          'Create "Pop Tight" — a faster, more obvious pitch correction for a modern pop vocal. Controls: Amount (0.0 default), Strength, Range, Vibrato keep, Response, Glide. Preset: strength 0.85, ±60 cents, vibrato keep 60%, response 45 ms, small glide.',
      },
      {
        name: "Hard Tune (Stylistic)",
        params: { Amount: 85, Strength: "1.0", Range: "±200 cents", "Vibrato Keep": "0%", Response: "8 ms" },
        prompt:
          'Build "Hard Tune" — an intentionally robotic hard-tune effect, retune speed fast and range wide. Controls: Amount (0.0 default), Strength, Range, Vibrato keep, Response, Scale/scale-lock. Preset: strength 1.0, ±200 cents, response 8 ms, scale-locked to the song key.',
      },
      {
        name: "Choir & Backing Blend",
        params: { Amount: 48, Strength: "0.5", Range: "±25 cents", "Vibrato Keep": "100%", Response: "150 ms" },
        prompt:
          'Make "Stack Tune" — a gentle corrector for stacked harmonies so they lock together without sounding tuned. Controls: Amount (0.0 default), Strength, Range, Vibrato keep, Response, Link to key. Preset: strength 0.5, ±25 cents, response 150 ms, vibrato keep 100%.',
      },
      {
        name: "Instrument Intonation",
        params: { Amount: 44, Strength: "0.45", Range: "±35 cents", Source: "monophonic", Response: "100 ms" },
        prompt:
          'Create "Intonation Fix" — the same engine for monophonic instruments: strings, brass, wind, synth leads. Controls: Amount (0.0 default), Strength, Range, Response, Source mode, Scale. Preset: strength 0.45, ±35 cents, monophonic source mode, response 100 ms.',
      },
      {
        name: "Warble Add (Inverse)",
        params: { Amount: 60, "Drift Depth": "12 cents", "Drift Rate": "0.4 Hz", Random: "on" },
        prompt:
          'Build "Warble Add" — the same engine used in reverse, adding slow random pitch drift so a too-perfect AI vocal feels human. Controls: Amount (0.0 default), Drift depth, Drift rate, Randomise, Mix. Preset: drift 12 cents at 0.4 Hz, randomised, 50% mix.',
      },
      {
        name: "Wow-Only Stabilizer",
        params: { Amount: 50, Band: "200 Hz–5 kHz", Strength: "0.5", Range: "±20 cents", "Vibrato Keep": "100%" },
        prompt:
          'Make "Wow Off" — a band-limited pitch stabiliser that only fixes the slow wow (0.5–3 Hz) and ignores faster vibrato. Controls: Amount (0.0 default), Band, Strength, Range, Wow rate window, Vibrato keep. Preset: band 200 Hz–5 kHz, strength 0.5, ±20 cents, wow window 0.5–3 Hz.',
      },
    ],
  },
  {
    id: "robotic-humanizer",
    name: "Robotic Vocal Humanizer",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🫀",
    target: "Lead and backing vocals",
    oneLiner:
      "Breaks the statistical regularity of a synthetic voice with micro-timing, formant and amplitude humanisation.",
    artifact: "Plastic tone, hard consonants and a detached synthetic edge — the AI fingerprint that survives re-export, normalising and even a full master.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Micro-Timing", value: "0.0 ms" },
      { name: "Formant Drift", value: "0.0 %" },
      { name: "Amplitude Humanise", value: "0.0 dB" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "The fingerprint lives in formant, phase and micro-timing regularity — so process those three, not the timbre. Keep changes tiny (2–6 ms, 2–5% formant) or the vocal stops sounding like the same singer.",
    presets: [
      {
        name: "Subtle Humanise",
        params: { Amount: 40, "Micro-Timing": "4 ms", "Formant Drift": "3%", "Amplitude Humanise": "1 dB", Mix: "60%" },
        prompt:
          'Build "Humanizer" — a vocal humaniser with micro-timing randomisation, formant drift and amplitude humanisation. Controls: Amount (0.0 default), Micro-timing range, Formant drift, Amplitude humanise, Random seed, Mix. Preset "Subtle Humanise": 4 ms micro-timing, 3% formant drift, 1 dB amplitude variation, 60% mix.',
      },
      {
        name: "Consonant Soften",
        params: { Amount: 50, "Consonant Soften": "-3 dB", "T-Attack": "rounded", Band: "3–9 kHz" },
        prompt:
          'Make "Consonant Soften" — a dynamic band that rounds off the over-hard consonants AI voices generate. Controls: Amount (0.0 default), Consonant soften, Attack shape, Band, Sensitivity. Preset: -3 dB max on transients in 3–9 kHz, rounded attack shape, sensitivity 0.5.',
      },
      {
        name: "Breath & Phrase Life",
        params: { Amount: 46, "Breath Level": "+2 dB", "Phrase Drift": "on", "Amplitude Humanise": "1.5 dB" },
        prompt:
          'Create "Phrase Life" — a humaniser that restores breath level and long-phrase amplitude drift. Controls: Amount (0.0 default), Breath level, Phrase drift, Amplitude humanise, Mix. Preset: breath +2 dB, phrase drift on, 1.5 dB amplitude variation.',
      },
      {
        name: "Formant Character Shift",
        params: { Amount: 54, "Formant Shift": "-4%", "Timbre Keep": "on", Mix: "70%" },
        prompt:
          'Build "Formant Shift" — a formant-only shifter that changes vocal character without changing pitch. Controls: Amount (0.0 default), Formant shift, Timbre keep, Mix. Preset: formant -4%, timbre keep on, 70% mix.',
      },
      {
        name: "Double-Blind Fingerprint Break",
        params: { Amount: 62, "Micro-Timing": "7 ms", "Formant Drift": "6%", "Phase Dither": "on", Mix: "80%" },
        prompt:
          'Make "Fingerprint Break" — an aggressive humaniser that breaks up formant, phase and micro-timing regularities while keeping the performance recognisable. Controls: Amount (0.0 default), Micro-timing, Formant drift, Phase dither, Amplitude humanise, Mix. Preset: 7 ms timing, 6% formant, phase dither on, 80% mix.',
      },
      {
        name: "Harmony Thickener (Real Feel)",
        params: { Amount: 58, Voices: "3", "Micro-Timing": "12 ms", "Formant Drift": "5%" },
        prompt:
          'Create "Human Stack" — a humaniser plus doubler that builds a 3-voice stack with real per-voice timing and formant variation. Controls: Amount (0.0 default), Voices, per-voice timing, formant drift, pan, Mix. Preset: 3 voices, 12 ms spread, 5% formant drift, wide pan.',
      },
      {
        name: "Vibrato Humanise",
        params: { Amount: 48, "Vibrato Depth": "+15%", "Vibrato Drift": "on", "Rate Drift": "on" },
        prompt:
          'Make "Vibrato Life" — a vibrato humaniser that adds depth and rate drift so sustained notes stop sounding generated. Controls: Amount (0.0 default), Vibrato depth, Rate drift, Delay before onset, Mix. Preset: depth +15%, rate drift on, 200 ms onset delay.',
      },
      {
        name: "Dead-Vocal Revival",
        params: { Amount: 64, "Micro-Timing": "8 ms", "Formant Drift": "6%", "Amplitude Humanise": "2 dB", "Air": "+2 dB" },
        prompt:
          'Build "Revival" — a full humanise chain for flat, lifeless AI vocals: timing, formant, level and air. Controls: Amount (0.0 default), Micro-timing, Formant drift, Amplitude humanise, Air shelf, Mix. Preset: 8 ms, 6%, 2 dB, +2 dB air shelf at 11 kHz, 80% mix.',
      },
    ],
  },
  {
    id: "sibilance-fizz",
    name: "Sibilance & Fizz Tamer",
    kind: "Chat-built",
    category: "AI Artifact Cleanup",
    icon: "🧊",
    target: "Vocals, hats, full mix",
    oneLiner:
      "Two-stage sibilance and fizz control: dynamic cut for S/T sounds, plus a narrow fizz-band suppressor.",
    artifact: "The harsh, fizzy top end AI vocals and cymbals generate. Different from shimmer: fizz is broadband hiss sitting on top of every consonant.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Sib Cut", value: "0.0 dB" },
      { name: "Fizz Cut", value: "0.0 dB" },
      { name: "Threshold", value: "off" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Split the job: sibilance is narrow and dynamic (5.5–9 kHz), fizz is broadband and constant (8–14 kHz). Cut sibilance dynamically and fizz statically, then restore 1–2 dB of air at 12 kHz to stop it sounding dull.",
    presets: [
      {
        name: "Two-Stage Vocal Clean",
        params: { Amount: 52, "Sib Cut": "-5 dB", "Fizz Cut": "-3.5 dB", Band: "5.5–14 kHz", "Air Keep": "+1.5 dB" },
        prompt:
          'Build "Sib & Fizz" — a two-stage tamer: a dynamic sibilance band and a static fizz band, with an air-keep shelf. Controls: Amount (0.0 default), Sib band, Sib cut, Fizz band, Fizz cut, Air keep, Mix, Listen. Preset "Two-Stage Vocal Clean": sib 5.5–9 kHz -5 dB dynamic, fizz 9–14 kHz -3.5 dB static, +1.5 dB air keep at 12 kHz.',
      },
      {
        name: "Rap Fizz Kill",
        params: { Amount: 64, "Sib Cut": "-6 dB", "Fizz Cut": "-5 dB", Band: "6–14 kHz", Lookahead: "4 ms" },
        prompt:
          'Make "Fizz Kill" — an aggressive version for rap vocals full of sharp consonants and generated fizz. Controls: Amount (0.0 default), Sib cut, Fizz cut, Band, Lookahead, Attack, Release. Preset: sib -6 dB, fizz -5 dB, band 6–14 kHz, 4 ms lookahead.',
      },
      {
        name: "Hat Fizz Suppress",
        params: { Amount: 48, "Fizz Cut": "-4 dB", Band: "8–15 kHz", Mode: "dynamic", Release: "80 ms" },
        prompt:
          'Create "Hat Fizz" — a fizz suppressor for the drum bus aimed at granular-sounding hats. Controls: Amount (0.0 default), Fizz cut, Band, Mode, Threshold, Release. Preset: -4 dB, band 8–15 kHz, dynamic mode, threshold -16 dB, 80 ms release.',
      },
      {
        name: "Bright Vocal Rescue",
        params: { Amount: 58, "Sib Cut": "-7 dB", "Fizz Cut": "-4 dB", Band: "5–13 kHz", "Presence Keep": "+1 dB @ 4 kHz" },
        prompt:
          'Build "Bright Rescue" — for vocals that are painfully bright but still need presence. Controls: Amount (0.0 default), Sib cut, Fizz cut, Band, Presence keep, Mix. Preset: sib -7 dB, fizz -4 dB, band 5–13 kHz, +1 dB keep at 4 kHz.',
      },
      {
        name: "Dark But Not Dull",
        params: { Amount: 46, "Sib Cut": "-4 dB", "Fizz Cut": "-3 dB", "Air Restore": "+2.5 dB @ 13 kHz" },
        prompt:
          'Make "Dark Not Dull" — a sibilance and fizz tamer with an air restore so the result is smooth and still open. Controls: Amount (0.0 default), Sib cut, Fizz cut, Air restore shelf, Mix. Preset: sib -4, fizz -3, +2.5 dB shelf at 13 kHz.',
      },
      {
        name: "Spoken Word Clarity",
        params: { Amount: 54, "Sib Cut": "-5 dB", "Fizz Cut": "-4 dB", Band: "5–12 kHz", "HPF": "90 Hz" },
        prompt:
          'Create "VO Clean" — a sibilance/fizz tamer plus HPF for voiceover and narration. Controls: Amount (0.0 default), Sib cut, Fizz cut, Band, HPF, Mix. Preset: sib -5, fizz -4, band 5–12 kHz, HPF 90 Hz.',
      },
      {
        name: "Full-Mix Top Tidy",
        params: { Amount: 34, "Fizz Cut": "-2.5 dB", Band: "9–15 kHz", Mode: "static", Mix: "100%" },
        prompt:
          'Make "Top Tidy" — a very gentle broadband fizz reduction for a whole mix, capped so it never dulls. Controls: Amount (0.0 default), Fizz cut, Band, Mode, Mix, Listen. Preset: -2.5 dB, 9–15 kHz, static mode, full wet.',
      },
      {
        name: "Mastering Safety Stage",
        params: { Amount: 28, "Sib Cut": "-2 dB", "Fizz Cut": "-2 dB", "Ceiling": "-1 dBTP", "Gain Match": "on" },
        prompt:
          'Build "Top Safety" — a mastering-stage sibilance and fizz limiter with loudness-matched A/B. Controls: Amount (0.0 default), Sib cut, Fizz cut, Ceiling, Gain match, Listen. Preset: sib -2, fizz -2, ceiling -1 dBTP, gain match on.',
      },
    ],
  },
];
