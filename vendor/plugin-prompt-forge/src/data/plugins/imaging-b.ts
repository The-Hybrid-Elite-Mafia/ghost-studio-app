import type { Plugin } from "../types";

export const imagingB: Plugin[] = [
  {
    id: "master-clipper",
    name: "Master Clipper",
    kind: "Chat-built",
    category: "Mastering",
    icon: "✂️",
    target: "Master bus, drum bus",
    oneLiner:
      "Hard/soft clipping stage that shaves peaks before the limiter so the limiter has nothing left to fight.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Threshold", value: "0.0 dB" },
      { name: "Clip Type", value: "soft" },
      { name: "Oversampling", value: "0x" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "The modern mastering move: clipper (2–3 dB of peak shaving) then limiter (1–2 dB of gain). Oversample 4x or you get aliasing that sounds exactly like AI shimmer. Never clip more than 3 dB — past that it is distortion.",
    presets: [
      {
        name: "Pre-Limiter Shave",
        params: { Amount: 40, Threshold: "-2.5 dB", "Clip Type": "soft", Oversampling: "4x", Mix: "100%" },
        prompt:
          'Build "Pre-Clip" — a mastering clipper with soft/hard modes, oversampling and a gain-reduction readout. Controls: Amount (0.0 default), Threshold, Clip type, Oversampling, Mix, GR display. Preset "Pre-Limiter Shave": threshold -2.5 dB, soft clip, 4x oversampling, 100% wet.',
      },
      {
        name: "Drum Bus Clip (Punch)",
        params: { Amount: 52, Threshold: "-3 dB", "Clip Type": "hard", Attack: "0 ms", Oversampling: "2x" },
        prompt:
          'Make "Drum Clip" — a hard clipper on the drum bus that flattens only snare and kick peaks. Controls: Amount (0.0 default), Threshold, Clip type, Oversampling, Mix. Preset: threshold -3 dB, hard clip, 2x oversampling.',
      },
      {
        name: "Loud Club Master (Clipper Forward)",
        params: { Amount: 66, Threshold: "-4 dB", "Clip Type": "soft", "Post Limiter": "1 dB", Oversampling: "4x" },
        prompt:
          'Create "Loud Clip" — a clipper-forward mastering stage for loud club masters, with a small limiter after it. Controls: Amount (0.0 default), Threshold, Clip type, Oversampling, Post limiter ceiling. Preset: -4 dB clip, soft, 4x oversampling, limiter ceiling -1 dBTP.',
      },
      {
        name: "Transparent Peak Control",
        params: { Amount: 26, Threshold: "-1 dB", "Clip Type": "soft", Oversampling: "8x" },
        prompt:
          'Build "Peak Clip" — a transparent safety clipper with maximum oversampling, for catching the occasional peak. Controls: Amount (0.0 default), Threshold, Clip type, Oversampling, Mix. Preset: -1 dB threshold, soft clip, 8x oversampling.',
      },
      {
        name: "Lo-Fi Clip Colour",
        params: { Amount: 70, Threshold: "-6 dB", "Clip Type": "hard", Oversampling: "off", Mix: "70%" },
        prompt:
          'Make "Crunch Clip" — an intentionally ugly hard clip for lo-fi and phonk, oversampling off on purpose. Controls: Amount (0.0 default), Threshold, Clip type, Oversampling, Mix, Tone. Preset: -6 dB, hard clip, oversampling off, 70% mix.',
      },
      {
        name: "Bass Clip (Even Sustain)",
        params: { Amount: 46, Threshold: "-3.5 dB", "Clip Type": "soft", Band: "40–200 Hz" },
        prompt:
          'Create "Bass Clip" — a band-limited clipper that evens out bass peaks so the sub stays consistent. Controls: Amount (0.0 default), Threshold, Clip type, Band, Mix. Preset: -3.5 dB, soft clip, band 40–200 Hz.',
      },
      {
        name: "Clipper + GR Report",
        params: { Amount: 40, Threshold: "-2 dB", "Clip Type": "soft", "GR Report": "on" },
        prompt:
          'Build "Clip Report" — a clipper that reports how many dB it clipped and at what frequency, so I know when I am pushing too far. Controls: Amount (0.0 default), Threshold, Clip type, GR report, Delta listen. Preset: -2 dB threshold, report on.',
      },
      {
        name: "Soft Sat Clip (Analog Style)",
        params: { Amount: 36, Threshold: "-2 dB", "Clip Type": "soft", "Knee": "wide", Oversampling: "4x" },
        prompt:
          'Make "Sat Clip" — a very soft, wide-knee clipper that behaves like analogue tape rather than a digital brick. Controls: Amount (0.0 default), Threshold, Clip type, Knee, Oversampling, Mix. Preset: -2 dB, soft, wide knee, 4x oversampling.',
      },
    ],
  },
  {
    id: "master-limiter-lufs",
    name: "LUFS Master Limiter",
    kind: "Chat-built",
    category: "Mastering",
    icon: "📊",
    target: "Master bus",
    oneLiner:
      "True-peak limiter with a LUFS target, short-term metering and streaming-platform presets baked in.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Target", value: "0.0 LUFS (off)" },
      { name: "Ceiling", value: "0.0 dBTP" },
      { name: "Release", value: "0.0 (auto)" },
      { name: "Style", value: "transparent" },
    ],
    tip: "Suno Studio has no mastering-grade metering, so this plugin is your meter as much as your limiter. Target -14 LUFS for streaming, -9 to -8 for club/hip-hop, and always -1.0 dBTP ceiling for anything lossy-encoded.",
    presets: [
      {
        name: "Streaming -14 LUFS",
        params: { Amount: 38, Target: "-14 LUFS", Ceiling: "-1.0 dBTP", Release: "auto 150 ms", Style: "transparent" },
        prompt:
          'Build "LUFS Limiter" — a true-peak limiter with an integrated LUFS target, short-term meter and streaming presets. Controls: Amount (0.0 default), Target LUFS, Ceiling dBTP, Release, Style, Oversampling, Meters. Preset "Streaming -14 LUFS": target -14, ceiling -1.0 dBTP, auto release, 4x oversampling.',
      },
      {
        name: "Club / Rap -8 LUFS",
        params: { Amount: 68, Target: "-8 LUFS", Ceiling: "-0.8 dBTP", Release: "60 ms", Style: "loud" },
        prompt:
          'Make "Club Loud" — a loud limiter for club, trap and hip-hop masters. Controls: Amount (0.0 default), Target LUFS, Ceiling, Release, Style, Oversampling. Preset: target -8 LUFS, ceiling -0.8 dBTP, 60 ms release, punchy style.',
      },
      {
        name: "Ambient / Dynamic -18 LUFS",
        params: { Amount: 22, Target: "-18 LUFS", Ceiling: "-1.5 dBTP", Release: "auto slow", Style: "transparent" },
        prompt:
          'Create "Dynamic Master" — a barely-there limiter for ambient, cinematic and jazz masters where dynamics matter. Controls: Amount (0.0 default), Target LUFS, Ceiling, Release, Style. Preset: target -18 LUFS, ceiling -1.5 dBTP, slow auto release.',
      },
      {
        name: "Podcast / VO -16 LUFS",
        params: { Amount: 46, Target: "-16 LUFS", Ceiling: "-1.5 dBTP", Release: "auto", Style: "voice" },
        prompt:
          'Build "Voice Master" — a limiter with a voice-oriented style for podcast and narration. Controls: Amount (0.0 default), Target LUFS, Ceiling, Release, Style, HPF. Preset: target -16 LUFS, ceiling -1.5 dBTP, voice style, HPF 80 Hz.',
      },
      {
        name: "Short-Term Catch (Chorus Only)",
        params: { Amount: 50, Target: "-11 LUFS ST", Ceiling: "-1 dBTP", Release: "fast", Style: "punchy" },
        prompt:
          'Make "Chorus Catch" — a limiter working on short-term loudness so only loud sections get grabbed. Controls: Amount (0.0 default), Target LUFS (short-term), Ceiling, Release, Style. Preset: short-term target -11 LUFS, fast release, punchy style.',
      },
      {
        name: "Two-Stage (Clipper + Limiter)",
        params: { Amount: 56, Clip: "-3 dB", Target: "-9 LUFS", Ceiling: "-1 dBTP", Style: "loud" },
        prompt:
          'Create "Loud Chain" — a single plugin with a clipper stage feeding a LUFS limiter, so I get loud without pumping. Controls: Amount (0.0 default), Clip threshold, Target LUFS, Ceiling, Style, Oversampling. Preset: clip -3 dB, target -9 LUFS, ceiling -1 dBTP.',
      },
      {
        name: "Reference Compare",
        params: { Amount: 30, Target: "match reference", "Reference Load": "on", Ceiling: "-1 dBTP" },
        prompt:
          'Build "Reference Match" — a limiter that can load a reference track and match its loudness for honest comparison, then master to the same level. Controls: Amount (0.0 default), Reference clip, Match strength, Ceiling, A/B. Preset: reference loaded, loudness matched, A/B on.',
      },
      {
        name: "Mono / Phone Check Stage",
        params: { Amount: 34, Target: "-14 LUFS", "Mono Check": "on", "Phone Band": "300 Hz–3.5 kHz" },
        prompt:
          'Make "Phone Check" — a limiter with a mono and phone-speaker simulation built in, so I can check translation without leaving Studio. Controls: Amount (0.0 default), Target LUFS, Ceiling, Mono check, Phone band, Solo. Preset: target -14 LUFS, mono check toggle, phone band 300 Hz–3.5 kHz.',
      },
    ],
  },
  {
    id: "eq-match",
    name: "EQ Match / Reference Curve",
    kind: "Chat-built",
    category: "Mastering",
    icon: "🧭",
    target: "Master bus, stems, matching two generations",
    oneLiner:
      "Analyses a reference track and builds the EQ curve needed to match its tonal balance — with a strength control.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Match Strength", value: "0.0 %" },
      { name: "Resolution", value: "0.0 (coarse)" },
      { name: "Max Change", value: "0.0 dB" },
      { name: "Reference", value: "none" },
    ],
    tip: "Never run at 100% match — 40–70% keeps your track sounding like itself while borrowing the reference's balance. Match on the loudest comparable section of both tracks, not the whole file.",
    presets: [
      {
        name: "Match a Commercial Reference",
        params: { Amount: 48, "Match Strength": "60%", "Max Change": "±4 dB", Resolution: "1/3 octave" },
        prompt:
          'Build "EQ Match" — an EQ matcher that analyses a reference clip and applies the difference curve to my track. Controls: Amount (0.0 default), Match strength, Max change, Resolution, Reference clip, Delta listen. Preset "Match a Commercial Reference": 60% strength, ±4 dB max change, 1/3-octave resolution.',
      },
      {
        name: "Match Two Generations",
        params: { Amount: 42, "Match Strength": "70%", Source: "clip A", Target: "clip B" },
        prompt:
          'Make "Take Match" — an EQ matcher that makes two generations of the same song sound tonally identical, for stitching sections together. Controls: Amount (0.0 default), Source clip, Target clip, Match strength, Max change. Preset: 70% strength, ±3 dB max change.',
      },
      {
        name: "Match My Own Catalogue",
        params: { Amount: 40, "Match Strength": "50%", Reference: "previous release" },
        prompt:
          'Create "House Sound" — an EQ matcher with a saveable reference profile, so every new track matches the tonal balance of my existing catalogue. Controls: Amount (0.0 default), Reference profile, Match strength, Max change, Save/load profile.',
      },
      {
        name: "Gentle Spectrum Tilt Match",
        params: { Amount: 30, "Match Strength": "40%", Resolution: "1 octave", "Max Change": "±3 dB" },
        prompt:
          'Build "Tilt Match" — a low-resolution matcher that only matches the broad tilt rather than fine detail, for a more natural result. Controls: Amount (0.0 default), Match strength, Resolution, Max change, Delta listen. Preset: 40% strength, 1-octave resolution, ±3 dB.',
      },
      {
        name: "Stem Match (Blend Consistency)",
        params: { Amount: 36, "Match Strength": "55%", Reference: "lead vocal stem", "Apply To": "backing vocals" },
        prompt:
          'Make "Stem Match" — an EQ matcher that makes a backing vocal or doubled stem match the lead vocal\'s tone. Controls: Amount (0.0 default), Reference stem, Target stem, Match strength, Max change. Preset: 55% strength, apply to the backing vocal track.',
      },
      {
        name: "Match + Loudness",
        params: { Amount: 44, "Match Strength": "60%", "Loudness Match": "on", "Target LUFS": "-14" },
        prompt:
          'Create "Full Match" — an EQ matcher plus loudness matcher so the comparison is fair in both tone and level. Controls: Amount (0.0 default), Match strength, Loudness match, Target LUFS, A/B. Preset: 60% tone match, loudness match to -14 LUFS.',
      },
      {
        name: "Curve Editor (Hand Draw)",
        params: { Amount: 40, Mode: "manual", "Bands": "12", "Max Change": "±6 dB" },
        prompt:
          'Build "Curve Editor" — a 12-band drawing EQ for hand-drawing a spectral curve, with the analyser showing my track and the reference overlaid. Controls: Amount (0.0 default), Bands, Max change, Curve drawing, Overlay analyser. Preset: 12 bands, ±6 dB, overlay on.',
      },
      {
        name: "Match Off (Analysis Only)",
        params: { Amount: 0.0, Mode: "analyse", "Report": "difference curve + notes" },
        prompt:
          'Make "Curve Report" — an analysis-only mode that shows me the difference curve between my track and the reference, with plain-language notes on what to change, without applying anything. Controls: Amount (0.0 default), Reference clip, Report detail, Overlay. Preset: analysis mode, report with frequency-by-frequency notes.',
      },
    ],
  },
  {
    id: "low-end-manager",
    name: "Low-End Manager",
    kind: "Chat-built",
    category: "Mastering",
    icon: "🥁",
    target: "Master bus, bass/kick group",
    oneLiner:
      "One plugin for the whole bottom end: mono-below, resonance control, kick/bass ducking and a sub high-pass.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mono Below", value: "off" },
      { name: "Sub HPF", value: "0.0 Hz" },
      { name: "Duck", value: "0.0 dB" },
      { name: "Resonance Cut", value: "0.0 dB" },
    ],
    tip: "Most AI mixes have a low end that fights itself: two things claiming 50–80 Hz. Mono below 100 Hz, high-pass the sub at 28 Hz, duck the bass 3 dB under the kick, and notch any single boomy resonance.",
    presets: [
      {
        name: "Full Low-End Cleanup",
        params: { Amount: 48, "Mono Below": "100 Hz", "Sub HPF": "28 Hz", Duck: "-3 dB", "Resonance Cut": "-4 dB" },
        prompt:
          'Build "Low Manager" — a low-end manager with mono-below, sub high-pass, kick-triggered ducking, resonance suppression and a low-end spectrum meter. Controls: Amount (0.0 default), Mono-below, Sub HPF, Duck depth, Duck release, Resonance cut, Sidechain source, Meter. Preset "Full Low-End Cleanup": mono below 100 Hz, sub HPF 28 Hz, duck -3 dB with 120 ms release, resonance cut -4 dB.',
      },
      {
        name: "Kick vs Bass Duck",
        params: { Amount: 56, Duck: "-4 dB", Release: "90 ms", "Sidechain": "kick", "Detector HPF": "50 Hz" },
        prompt:
          'Make "Kick/Bass Duck" — a ducking module for the bass bus triggered by the kick. Controls: Amount (0.0 default), Duck depth, Release, Sidechain source, Detector HPF, Lookahead. Preset: -4 dB, 90 ms release, detector HPF 50 Hz, 3 ms lookahead.',
      },
      {
        name: "Sub Resonance Notch",
        params: { Amount: 44, "Resonance Cut": "-6 dB", "Search Range": "30–120 Hz", Q: "8" },
        prompt:
          'Create "Sub Notch" — an auto-finding resonance suppressor for the 30–120 Hz zone, for the one boomy note ruining the low end. Controls: Amount (0.0 default), Search range, Depth, Q, Auto-find, Delta listen. Preset: -6 dB, range 30–120 Hz, Q 8, auto-find on.',
      },
      {
        name: "Sub Control for Small Speakers",
        params: { Amount: 50, "Sub HPF": "35 Hz", "Harmonic Top": "+2 dB @ 700 Hz", "Mono Below": "120 Hz" },
        prompt:
          'Build "Small Speaker" — a low-end manager tuned so a sub-heavy mix still reads on phone speakers. Controls: Amount (0.0 default), Sub HPF, Harmonic top, Mono-below, Mix. Preset: sub HPF 35 Hz, +2 dB at 700 Hz, mono below 120 Hz.',
      },
      {
        name: "Cinematic Sub Management",
        params: { Amount: 52, "Sub HPF": "22 Hz", "Mono Below": "80 Hz", Duck: "-2 dB", Release: "400 ms" },
        prompt:
          'Make "Cinema Low" — a low-end manager for trailer and orchestral material with a very low sub floor and slow ducking. Controls: Amount (0.0 default), Sub HPF, Mono-below, Duck depth, Duck release, Meter. Preset: sub HPF 22 Hz, mono below 80 Hz, duck -2 dB, 400 ms release.',
      },
      {
        name: "808 Sustain Control",
        params: { Amount: 46, Duck: "-3 dB", "Sustain Trim": "-2 dB", "Mono Below": "100 Hz" },
        prompt:
          'Create "808 Control" — a low-end manager for 808-heavy mixes that trims over-long tails and keeps the sub mono. Controls: Amount (0.0 default), Duck depth, Sustain trim, Mono-below, HPF, Meter. Preset: duck -3 dB under the kick, sustain trim -2 dB, mono below 100 Hz.',
      },
      {
        name: "Low-End Meter (Analysis)",
        params: { Amount: 0.0, Mode: "analyse", "Meter": "spectrum + correlation 20–200 Hz" },
        prompt:
          'Build "Low Meter" — an analysis-only low-end meter: 20–200 Hz spectrum, per-note energy, mono correlation in that band, and a warning when two elements fight for the same frequency. Controls: Amount (0.0 default), Mode, Band, Report. Preset: analysis mode, band 20–200 Hz.',
      },
      {
        name: "Mono Bass Only",
        params: { Amount: 30, "Mono Below": "140 Hz", "Slope": "24 dB/oct", "Phase": "linear" },
        prompt:
          'Make "Mono Bass" — a single-purpose mono maker for the low end with linear-phase crossovers so nothing smears. Controls: Amount (0.0 default), Mono-below, Slope, Phase mode, Meter. Preset: mono below 140 Hz, 24 dB/oct, linear phase.',
      },
    ],
  },
];
