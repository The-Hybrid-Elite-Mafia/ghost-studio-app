import type { Plugin } from "../types";

export const imagingA: Plugin[] = [
  {
    id: "stereo-widener",
    name: "Stereo Widener",
    kind: "Chat-built",
    category: "Imaging & Utility",
    icon: "↔️",
    target: "Pads, guitars, backing vocals, master",
    oneLiner:
      "Mid-side and Haas widening with a mono-below guard and correlation monitor — big image that survives mono.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Width", value: "100%" },
      { name: "Band", value: "full" },
      { name: "Mono Below", value: "off" },
      { name: "Haas", value: "0.0 ms" },
    ],
    tip: "Widen 200 Hz and up, keep everything below 120 Hz mono, and check the correlation meter never goes negative. Widening separated stems often exposes phase smear — repair phase first, then widen.",
    presets: [
      {
        name: "Safe Master Width",
        params: { Amount: 34, Width: "115%", Band: "200 Hz+", "Mono Below": "120 Hz", "Correlation Floor": "0.2" },
        prompt:
          'Build "Safe Width" — a mid-side widener with a mono-below guard and a correlation floor. Controls: Amount (0.0 default), Width, Band start, Mono-below, Correlation floor, Mono listen. Preset "Safe Master Width": width 115%, band 200 Hz and up, mono below 120 Hz, correlation floor 0.2.',
      },
      {
        name: "Huge Pads (no phase loss)",
        params: { Amount: 62, Width: "150%", Band: "300 Hz+", "Decorrelate": "on", "Mono Below": "150 Hz" },
        prompt:
          'Make "Huge Pads" — a heavy widener with decorrelation so it stays phase-coherent in mono. Controls: Amount (0.0 default), Width, Decorrelation, Band start, Mono-below, Mono listen. Preset: width 150%, decorrelation on, band 300 Hz+, mono below 150 Hz.',
      },
      {
        name: "Backing Vocal Spread",
        params: { Amount: 50, Width: "130%", Band: "1–12 kHz", "Centre Keep": "on" },
        prompt:
          'Create "BV Spread" — a widener for stacked backing vocals that keeps the centre clear. Controls: Amount (0.0 default), Width, Band, Centre keep, Mono listen. Preset: width 130%, band 1–12 kHz, centre keep on.',
      },
      {
        name: "Haas Guitar Double",
        params: { Amount: 46, Haas: "18 ms", Pan: "hard L/R", "Mono-compat Check": "on" },
        prompt:
          'Build "Haas Wide" — a Haas-effect widener with a delay/pan pair and a mono-compatibility check. Controls: Amount (0.0 default), Haas delay, Pan, Mono check, Mix. Preset: 18 ms delay, hard L/R, mono check on, 60% mix.',
      },
      {
        name: "Narrow It (Focus)",
        params: { Amount: 40, Width: "80%", Band: "full", "Centre Focus": "on" },
        prompt:
          'Make "Narrow" — a width reducer for elements that are too wide and diluting the mix. Controls: Amount (0.0 default), Width, Band, Centre focus. Preset: width 80%, full band, centre focus on.',
      },
      {
        name: "Width Automation Build",
        params: { Amount: 58, Width: "100% → 160%", Automate: "8 bars", Sync: "tempo" },
        prompt:
          'Create "Width Build" — a widener whose Width parameter is automatable, so the image opens across a build. Controls: Amount (0.0 default), Width, Automation range, Band, Mono-below. Preset: width from 100% to 160% over 8 bars, mono below 120 Hz throughout.',
      },
      {
        name: "Side-Only Excite Wide",
        params: { Amount: 44, "Side Boost": "+3 dB @ 6 kHz", Width: "125%", Band: "3 kHz+" },
        prompt:
          'Build "Side Air" — a widener that boosts only the side channel above 3 kHz, so the image widens without changing the centre. Controls: Amount (0.0 default), Side boost, Side band, Width, Mono listen. Preset: +3 dB side shelf at 6 kHz, width 125%.',
      },
      {
        name: "Phone-Speaker Safe Wide",
        params: { Amount: 40, Width: "120%", Band: "800 Hz–8 kHz", "Mono Below": "300 Hz" },
        prompt:
          'Make "Phone Wide" — a widener band-limited to 800 Hz–8 kHz so width survives on mono phone speakers. Controls: Amount (0.0 default), Width, Band, Mono-below, Mono listen. Preset: width 120%, band 800 Hz–8 kHz, mono below 300 Hz.',
      },
    ],
  },
  {
    id: "auto-pan",
    name: "Auto-Pan / Movement",
    kind: "Chat-built",
    category: "Imaging & Utility",
    icon: "🎠",
    target: "Percussion, arps, pads, FX",
    oneLiner:
      "LFO or envelope-driven panning with rate sync, depth, shape and stereo spread control.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Rate", value: "0.0 Hz" },
      { name: "Depth", value: "0.0" },
      { name: "Shape", value: "sine" },
      { name: "Centre", value: "C" },
    ],
    tip: "Tempo-sync the rate to a note division, not Hz — free-running pans drift against the groove and sound broken. Keep depth under 60% on anything rhythmic or the beat lurches.",
    presets: [
      {
        name: "Synced 1/8 Sway",
        params: { Amount: 44, Rate: "1/8", Depth: "55%", Shape: "sine", Sync: "tempo" },
        prompt:
          'Build "Auto Pan" — an auto-panner with rate (Hz or synced), depth, shape, offset and spread. Controls: Amount (0.0 default), Rate, Depth, Shape, Offset, Sync, Spread. Preset "Synced 1/8 Sway": 1/8 rate, 55% depth, sine shape, tempo synced.',
      },
      {
        name: "Slow Ambient Sweep",
        params: { Amount: 52, Rate: "0.08 Hz", Depth: "80%", Shape: "triangle" },
        prompt:
          'Make "Slow Sweep" — a very slow, deep pan for pads and ambient textures. Controls: Amount (0.0 default), Rate, Depth, Shape, Offset. Preset: rate 0.08 Hz, depth 80%, triangle shape.',
      },
      {
        name: "Percussion Ping-Pong",
        params: { Amount: 58, Rate: "1/4", Depth: "100%", Shape: "square", Sync: "tempo" },
        prompt:
          'Create "Ping-Pong Pan" — a hard square-wave pan locked to the tempo for percussion throws. Controls: Amount (0.0 default), Rate, Depth, Shape, Sync, Smooth. Preset: 1/4 rate, 100% depth, square shape with 5 ms smoothing.',
      },
      {
        name: "Random Movement",
        params: { Amount: 48, Mode: "random", "Step Rate": "1/2", Depth: "70%", Seed: "per loop" },
        prompt:
          'Build "Random Pan" — a randomised panner with a step rate and a per-loop seed. Controls: Amount (0.0 default), Mode, Step rate, Depth, Seed, Smoothing. Preset: random mode, 1/2-note steps, 70% depth, new seed each loop.',
      },
      {
        name: "Envelope Pan (Hits Move)",
        params: { Amount: 54, Mode: "envelope", Depth: "80%", Attack: "5 ms", Release: "250 ms" },
        prompt:
          'Make "Hit Pan" — an envelope-following panner that throws each hit to one side and returns. Controls: Amount (0.0 default), Mode, Depth, Attack, Release, Direction. Preset: envelope mode, depth 80%, 5 ms attack, 250 ms release.',
      },
      {
        name: "Tremolo Panner",
        params: { Amount: 56, Rate: "1/16", Depth: "100%", Shape: "sine", Mode: "amplitude" },
        prompt:
          'Create "Tremolo" — the same engine in amplitude mode instead of pan. Controls: Amount (0.0 default), Rate, Depth, Shape, Mode (pan/amplitude), Sync. Preset: 1/16 rate, 100% depth, sine, amplitude mode.',
      },
      {
        name: "Rotary Speaker Sim",
        params: { Amount: 62, "Fast Rate": "6.5 Hz", "Slow Rate": "0.8 Hz", Depth: "90%", "Horn/Trombone": "on" },
        prompt:
          'Build "Rotary" — a Leslie-style simulator with fast/slow speeds, ramp time and separate horn and drum motion. Controls: Amount (0.0 default), Fast rate, Slow rate, Ramp, Depth, Mode switch, Mix. Preset: fast 6.5 Hz, slow 0.8 Hz, 1 s ramp, 90% depth.',
      },
      {
        name: "Width Pattern Sequencer",
        params: { Amount: 50, Mode: "pattern", Steps: "16", "Rate": "1/16", Depth: "80%" },
        prompt:
          'Make "Pan Pattern" — a step-sequenced pan with a 16-step pattern I can draw. Controls: Amount (0.0 default), Steps, Rate, Depth, Pattern editor, Randomise. Preset: 16 steps at 1/16, depth 80%, alternating wide/narrow pattern.',
      },
    ],
  },
  {
    id: "mid-side-eq",
    name: "Mid-Side EQ",
    kind: "Chat-built",
    category: "Imaging & Utility",
    icon: "⚖️",
    target: "Master, pads, full stems",
    oneLiner:
      "Independent EQ for the centre and the sides — clean the mono core, open the stereo edges.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mid Gain", value: "0.0 dB" },
      { name: "Side Gain", value: "0.0 dB" },
      { name: "Side HPF", value: "off" },
      { name: "Mode", value: "M/S" },
    ],
    tip: "The mastering secret weapon: cut mud in the mid channel (where the vocal and bass live), add air to the sides only. Never boost the sides below 200 Hz — that is where mono collapse comes from.",
    presets: [
      {
        name: "Master Air on Sides",
        params: { Amount: 38, "Side Shelf": "+2.5 dB @ 11 kHz", "Mid Flat": "0 dB", "Side HPF": "200 Hz" },
        prompt:
          'Build "M/S Air" — a mid-side EQ with independent bands for centre and sides. Controls: Amount (0.0 default), Mid bands, Side bands, Side HPF, Mode (M/S / L/R), Mono listen. Preset "Master Air on Sides": +2.5 dB side shelf at 11 kHz, mid untouched, side HPF 200 Hz.',
      },
      {
        name: "Mid Mud Cut",
        params: { Amount: 44, "Mid Cut": "-3 dB @ 250 Hz", "Side Flat": "0 dB", Q: "1.2" },
        prompt:
          'Make "Mid Mud" — a mid-channel cut at 250 Hz so the centre (vocal, bass, kick) cleans up while the stereo image stays untouched. Controls: Amount (0.0 default), Mid frequency, Mid gain, Q, Side HPF. Preset: -3 dB at 250 Hz, Q 1.2, mid channel only.',
      },
      {
        name: "Wide Guitars, Tight Vocal",
        params: { Amount: 46, "Side Boost": "+2 dB @ 3 kHz", "Mid Cut": "-1.5 dB @ 3 kHz" },
        prompt:
          'Create "Vocal Focus" — a mid-side EQ that boosts 3 kHz on the sides while dipping it in the centre, so guitars get bright and the vocal stays clean. Controls: Amount (0.0 default), Mid band, Side band, Q, Mix. Preset: side +2 dB at 3 kHz, mid -1.5 dB at 3 kHz.',
      },
      {
        name: "Side Fizz Cut",
        params: { Amount: 50, "Side Cut": "-4 dB @ 9 kHz", "Side HPF": "250 Hz" },
        prompt:
          'Build "Side Tame" — a side-channel cut in the fizz zone, for mixes that are harsh at the edges but fine in the centre. Controls: Amount (0.0 default), Side frequency, Side gain, Side HPF, Mono listen. Preset: -4 dB at 9 kHz on sides only, side HPF 250 Hz.',
      },
      {
        name: "Low-End Centre Lock",
        params: { Amount: 30, "Side HPF": "150 Hz", "Mid Low Shelf": "+1 dB @ 80 Hz" },
        prompt:
          'Make "Low Lock" — a mid-side EQ that high-passes the sides at 150 Hz and adds a small centre low shelf, tightening the bottom. Controls: Amount (0.0 default), Side HPF, Mid low shelf, Mode, Mono listen. Preset: sides HPF 150 Hz, mid +1 dB shelf at 80 Hz.',
      },
      {
        name: "L/R Independent EQ",
        params: { Amount: 42, Mode: "L/R", "L Cut": "-2 dB @ 4.5 kHz", "R Boost": "+1.5 dB @ 6 kHz" },
        prompt:
          'Create "L/R Balance" — the same EQ in left/right mode for correcting an unbalanced AI stereo file. Controls: Amount (0.0 default), L bands, R bands, Mode, Balance. Preset: L -2 dB at 4.5 kHz, R +1.5 dB at 6 kHz.',
      },
      {
        name: "Automation: Narrow Verse Wide Chorus",
        params: { Amount: 40, Width: "90% → 140%", Automate: "section", "Side HPF": "200 Hz" },
        prompt:
          'Build "Section Width" — a mid-side EQ whose width is automatable so verses are narrow and choruses are wide. Controls: Amount (0.0 default), Width, Automation, Side HPF, Mid bands. Preset: width 90% in verses, 140% in choruses, sides HPF 200 Hz.',
      },
      {
        name: "Mono Fold-Down Check",
        params: { Amount: 0.0, Mode: "monitor", "Fold": "mono", "Side Solo": "on" },
        prompt:
          'Make "M/S Monitor" — an analysis-only mid-side monitor with mono fold-down, side solo and mid solo buttons, so I can hear exactly what the centre and sides contain. Controls: Amount (0.0 default), Mode, Fold, Side solo, Mid solo.',
      },
    ],
  },
  {
    id: "utility",
    name: "Utility (Gain / Pan / Phase)",
    kind: "Chat-built",
    category: "Imaging & Utility",
    icon: "🧮",
    target: "Every track",
    oneLiner:
      "Gain trim, pan, phase invert, channel swap, DC offset removal and mono summing — the boring stuff that saves mixes.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Gain", value: "0.0 dB" },
      { name: "Pan", value: "C" },
      { name: "Phase L / R", value: "normal" },
      { name: "Swap", value: "off" },
    ],
    tip: "Gain-stage before you compress: leave 6 dB of headroom on every stem so the plugins have somewhere to work. Generated material often carries a DC offset that eats limiter headroom invisibly.",
    presets: [
      {
        name: "Gain Stage & Headroom",
        params: { Amount: 30, Gain: "-6.0 dB", "Peak Target": "-12 dBFS", "Auto Trim": "on" },
        prompt:
          'Build "Gain Stage" — a utility with gain trim, auto-peak targeting and a headroom readout. Controls: Amount (0.0 default), Gain, Peak target, Auto trim, Phase, Swap, Pan. Preset "Gain Stage & Headroom": auto trim so peaks land at -12 dBFS, gain display in dB.',
      },
      {
        name: "Phase & Polarity Fix",
        params: { Amount: 40, "Phase L": "invert", "Phase R": "normal", "Listen": "sum" },
        prompt:
          'Make "Polarity Fix" — a utility with independent L/R polarity invert and a summed listen, for stems that cancel when stacked. Controls: Amount (0.0 default), Phase L, Phase R, Swap, Listen mode. Preset: L inverted, R normal, listen = sum.',
      },
      {
        name: "DC Offset & Rumble Clean",
        params: { Amount: 50, "DC Remove": "on", "Rumble HPF": "24 Hz (18 dB/oct)", Gain: "0.0 dB" },
        prompt:
          'Create "DC & Rumble" — a utility that removes DC offset and filters inaudible rumble below 24 Hz. Controls: Amount (0.0 default), DC remove, Rumble HPF, Slope, Gain. Preset: DC remove on, HPF 24 Hz at 18 dB/oct.',
      },
      {
        name: "Channel Swap & Balance",
        params: { Amount: 34, Swap: "on", Balance: "+1.5 dB right", Pan: "C" },
        prompt:
          'Build "Swap & Balance" — a utility with L/R swap, balance trim and pan. Controls: Amount (0.0 default), Swap, Balance, Pan, Width. Preset: swap on, balance +1.5 dB right, pan centre.',
      },
      {
        name: "Mono Sum (Check or Use)",
        params: { Amount: 46, Mode: "mono", "Bass Only": "off", "Phase Check": "on" },
        prompt:
          'Make "Mono Sum" — a mono summing switch with an optional bass-only mode, for checking or for a deliberate mono mix. Controls: Amount (0.0 default), Mode, Bass-only below, Phase check, Balance. Preset: full mono, phase check indicator on.',
      },
      {
        name: "Loudness Match (A/B Honest)",
        params: { Amount: 40, "Target": "-14 LUFS", "Auto Match": "on", "Bypass": "instant" },
        prompt:
          'Create "Loudness Match" — a utility that level-matches whatever is downstream so my bypass A/B comparisons are honest. Controls: Amount (0.0 default), Target LUFS, Auto match, Bypass mode, Delta listen. Preset: target -14 LUFS, auto match on, instant bypass.',
      },
      {
        name: "Stereo Balance Meter + Trim",
        params: { Amount: 26, Balance: "auto", "Meter": "L/R + correlation", "Auto Correct": "on" },
        prompt:
          'Build "Balance Doctor" — a utility with L/R and correlation meters plus an auto-correct that trims the balance to centre. Controls: Amount (0.0 default), Auto correct, Meter detail, Trim range. Preset: auto correct on, ±3 dB trim range.',
      },
      {
        name: "Fade In / Fade Out",
        params: { Amount: 30, "Fade In": "0 ms", "Fade Out": "2000 ms", Curve: "exponential" },
        prompt:
          'Make "Fades" — a utility with fade-in and fade-out times and curve shapes, so I can end a section musically without drawing automation. Controls: Amount (0.0 default), Fade in, Fade out, Curve, Sync. Preset: 0 ms in, 2 s out, exponential curve.',
      },
    ],
  },
];
