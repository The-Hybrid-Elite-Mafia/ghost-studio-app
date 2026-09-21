import type { Plugin } from "../types";

export const dynamicsB: Plugin[] = [
  {
    id: "transient-shaper",
    name: "Transient Shaper",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "⚡",
    target: "Drums, percussion, plucks, rap vocals",
    oneLiner:
      "Attack and sustain envelope control with no threshold to set. Make things hit harder or sit further back instantly.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Attack", value: "0.0 (neutral)" },
      { name: "Sustain", value: "0.0 (neutral)" },
      { name: "Release", value: "0.0 ms" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "The cheat code for AI drums: Suno kits often have soft stick attacks but long fake-sounding tails. Push Attack +6, pull Sustain -4 and the kit suddenly sounds recorded.",
    presets: [
      {
        name: "Punch Kit",
        params: { Amount: 55, Attack: "+6 dB", Sustain: "-3 dB", Release: "60 ms", Mix: "100%" },
        prompt:
          'Build "Punch Kit" — a transient shaper with independent Attack and Sustain controls and no threshold. Controls: Amount (0.0 default), Attack, Sustain, Release, Mix, sidechain HPF. Preset "Punch Kit": attack +6 dB, sustain -3 dB, 60 ms release, full wet. At Amount 0.0 it must pass audio bit-transparent.',
      },
      {
        name: "Snare Crack",
        params: { Amount: 70, Attack: "+9 dB", Sustain: "-6 dB", Release: "35 ms", Mix: "100%" },
        prompt:
          'Make "Snare Crack" — a snare-focused transient designer that adds the stick and trims the ring. Controls: Amount (starts 0.0), Attack, Sustain, Release, Mix, band focus (1–6 kHz). Preset: attack +9 dB, sustain -6 dB, 35 ms release, band focus 1–6 kHz.',
      },
      {
        name: "Push Back (Sit Behind Vocal)",
        params: { Amount: 40, Attack: "-4 dB", Sustain: "+2 dB", Release: "180 ms", Mix: "100%" },
        prompt:
          'Create "Push Back" — the reverse transient shaper: softens attacks and lengthens sustain so an element moves behind the lead vocal. Controls: Amount (0.0 default), Attack, Sustain, Release, Mix. Preset: attack -4 dB, sustain +2 dB, 180 ms release.',
      },
      {
        name: "808 Attack Definition",
        params: { Amount: 50, Attack: "+5 dB", Sustain: "0 dB", Release: "120 ms", Band: "1.5–4 kHz" },
        prompt:
          'Build "Sub Definition" — a band-limited transient shaper that only adds attack in the 1.5–4 kHz zone so the 808 cuts on phone speakers without changing the sub. Controls: Amount (0.0 default), Attack, Sustain, Release, Band start, Band end. Preset: attack +5 dB, sustain 0, 120 ms release, band 1.5–4 kHz.',
      },
      {
        name: "Vocal Consonant Clarity",
        params: { Amount: 44, Attack: "+4 dB", Sustain: "-2 dB", Release: "90 ms", Band: "2–8 kHz" },
        prompt:
          'Make "Consonant Clarity" — a high-band transient shaper for vocals that sharpens T, K and S sounds without de-essing them into mush. Controls: Amount (0.0 default), Attack, Sustain, Release, Band range, Mix. Preset: attack +4 dB, sustain -2 dB, 90 ms release, band 2–8 kHz, mix 80%.',
      },
      {
        name: "Acoustic Pick Softener",
        params: { Amount: 36, Attack: "-5 dB", Sustain: "+1 dB", Release: "220 ms", Band: "full" },
        prompt:
          'Create "Pick Softener" for AI acoustic guitar — rounds off harsh pick attacks and keeps the body. Controls: Amount (0.0 default), Attack, Sustain, Release, Mix. Preset: attack -5 dB, sustain +1 dB, 220 ms release, mix 100%.',
      },
      {
        name: "Envelope Automation Bloom",
        params: { Amount: 62, Attack: "+8 dB", Sustain: "+4 dB", Release: "400 ms", Automate: "verse→chorus" },
        prompt:
          'Build "Bloom Shaper" — a transient shaper whose Amount is automatable so the part grows from verse to chorus. Controls: Amount (0.0 default, automatable), Attack, Sustain, Release, Mix. Preset: attack +8 dB, sustain +4 dB, 400 ms release, and draw the Amount curve from 0.0 in verse 1 to 62 in the final chorus.',
      },
      {
        name: "Lo-Fi Digitized Attack",
        params: { Amount: 66, Attack: "-8 dB", Sustain: "-6 dB", Release: "20 ms", Bitcrush: "12-bit" },
        prompt:
          'Make "Dull It" — a transient shaper plus gentle bitcrush that gives a modern AI beat a sampled-from-vinyl, slightly rounded feel. Controls: Amount (starts 0.0), Attack, Sustain, Release, Bit depth, Mix. Preset: attack -8 dB, sustain -6 dB, 20 ms release, 12-bit, mix 70%.',
      },
    ],
  },
  {
    id: "de-esser",
    name: "De-Esser",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "🐍",
    target: "Lead vocals, backups, spoken word",
    oneLiner:
      "Split-band or dynamic sibilance control. The single fastest way to make an AI vocal sound like a real recording.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Band", value: "5.5–8 kHz" },
      { name: "Reduction", value: "0.0 dB" },
      { name: "Threshold", value: "0.0" },
      { name: "Mode", value: "split (no sidechain artefact)" },
    ],
    tip: "Suno vocals hiss in a narrow, slightly moving band. Use split-band (not wideband) so the vocal never sounds lispy, and let the detection band drift between 5.5 and 9 kHz rather than sitting on one frequency.",
    presets: [
      {
        name: "Pop Vocal Split-Band",
        params: { Amount: 45, Band: "5.5–8.5 kHz", Reduction: "-4.5 dB", Attack: "0.5 ms", Release: "40 ms", Mode: "split" },
        prompt:
          'Build "Pop De-Ess" — a split-band de-esser for a lead vocal. Controls: Amount (0.0 default), detection band start and end, Reduction, Attack, Release, Mode (split or wideband). Preset "Pop Vocal Split-Band": band 5.5–8.5 kHz, 4.5 dB max reduction, 0.5 ms attack, 40 ms release, split mode so only the sibilance band is attenuated.',
      },
      {
        name: "Harsh Sibilance 8k Killer",
        params: { Amount: 68, Band: "7–11 kHz", Reduction: "-7 dB", Attack: "0.3 ms", Release: "25 ms", Mode: "dynamic EQ" },
        prompt:
          'Make "Sibilance Killer" for very bright AI vocals: dynamic band centred on S and T sounds. Controls: Amount (starts 0.0), Band, Reduction, Attack, Release, Lookahead, Mode. Preset: 7–11 kHz, 7 dB max reduction, 0.3 ms attack with 3 ms lookahead, 25 ms release, dynamic-EQ mode.',
      },
      {
        name: "Male Vocal Warm Rescue",
        params: { Amount: 38, Band: "4.8–7 kHz", Reduction: "-3 dB", Attack: "1 ms", Release: "60 ms", Mode: "split" },
        prompt:
          'Create "Warm De-Ess" for deeper male AI vocals where sibilance sits lower. Controls: Amount (0.0 default), Band, Reduction, Attack, Release, Mode. Preset: band 4.8–7 kHz, 3 dB reduction, 1 ms attack, 60 ms release, split mode, soft knee.',
      },
      {
        name: "Rap Fizz & Consonant Control",
        params: { Amount: 60, Band: "6–12 kHz", Reduction: "-6 dB", Attack: "0.2 ms", Release: "18 ms", Lookahead: "4 ms" },
        prompt:
          'Build "Fizz Control" — a fast de-esser plus a fizz band for rap vocals full of sharp consonants. Controls: Amount (0.0 default), Band 1, Band 2, Reduction, Attack, Release, Lookahead. Preset: band 1 at 6–9 kHz (-6 dB), band 2 at 10–12 kHz (-3 dB), 0.2 ms attack, 4 ms lookahead, 18 ms release.',
      },
      {
        name: "Spoken Word / Voiceover",
        params: { Amount: 52, Band: "5–9 kHz", Reduction: "-5 dB", Attack: "0.8 ms", Release: "90 ms", Mode: "split" },
        prompt:
          'Make "VO De-Ess" — a de-esser tuned for spoken word and podcast AI voice. Controls: Amount (0.0 default), Band, Reduction, Attack, Release, Mode, HPF on detector. Preset: band 5–9 kHz, 5 dB reduction, 0.8 ms attack, 90 ms release, detector HPF 200 Hz.',
      },
      {
        name: "Backup Vocal Tame",
        params: { Amount: 48, Band: "5.5–10 kHz", Reduction: "-3.5 dB", Attack: "1 ms", Release: "70 ms", Mode: "split" },
        prompt:
          'Create "BV Tame" — a gentler de-esser for background vocals and harmonies so they support instead of spitting. Controls: Amount (0.0 default), Band, Reduction, Attack, Release, Mix. Preset: band 5.5–10 kHz, 3.5 dB reduction, 1 ms attack, 70 ms release, mix 100%.',
      },
      {
        name: "Cymbal & Hat Harshness",
        params: { Amount: 56, Band: "8–14 kHz", Reduction: "-4 dB", Attack: "2 ms", Release: "120 ms", Mode: "dynamic EQ" },
        prompt:
          'Build "Hat Soother" — the same de-esser idea pointed at the drum bus: dynamic cut only in the 8–14 kHz zone when hats get spiky. Controls: Amount (0.0 default), Band, Reduction, Attack, Release, Threshold. Preset: band 8–14 kHz, 4 dB max cut, 2 ms attack, 120 ms release.',
      },
      {
        name: "Air Keep / Sib Cut",
        params: { Amount: 50, Band: "6.5–9.5 kHz", Reduction: "-5 dB", Air: "+2 dB @ 12 kHz", Mode: "mid-side" },
        prompt:
          'Make "Air Keep" — a mid-side de-esser that cuts sibilance in the centre while adding 2 dB of shelf air at 12 kHz on the sides. Controls: Amount (0.0 default), Band, Reduction, Air shelf, Mode, Mix. Preset: band 6.5–9.5 kHz, 5 dB cut, +2 dB air shelf, mid-side mode.',
      },
    ],
  },
  {
    id: "parallel-ny-comp",
    name: "Parallel NY Compressor",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "🥁",
    target: "Drum bus, vocals, full mix",
    oneLiner:
      "Dedicated wet/dry parallel smash with its own EQ and phase alignment — the classic New York drum trick.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Ratio", value: "1:1" },
      { name: "Attack", value: "0.0 ms" },
      { name: "Release", value: "0.0 ms" },
      { name: "Tone", value: "flat" },
    ],
    tip: "Because Suno stems are a single print, phase is already baked in — a Mix knob beats routing two tracks. HPF the parallel path at 150 Hz and LPF at 8 kHz so you only add body and air, not mud.",
    presets: [
      {
        name: "NY Drum Wall",
        params: { Amount: 60, Mix: "35% wet", Ratio: "15:1", Attack: "20 ms", Release: "90 ms", Tone: "HPF 150 / LPF 8k" },
        prompt:
          'Build "NY Wall" — a parallel compressor with its own Mix knob, internal HPF and LPF, and auto phase alignment. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone (HPF/LPF), Phase align. Preset "NY Drum Wall": ratio 15:1, attack 20 ms, release 90 ms, HPF 150 Hz, LPF 8 kHz, 35% wet blend.',
      },
      {
        name: "Vocal Thickener",
        params: { Amount: 48, Mix: "25% wet", Ratio: "10:1", Attack: "2 ms", Release: "70 ms", Tone: "HPF 250 / LPF 6k" },
        prompt:
          'Make "Vocal Thick" — a parallel chain that doubles the body of a thin AI vocal without touching the lead edge. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone, Drive. Preset: ratio 10:1, attack 2 ms, release 70 ms, HPF 250 Hz, LPF 6 kHz, 25% wet, light drive.',
      },
      {
        name: "Mix Bus Weight",
        params: { Amount: 34, Mix: "18% wet", Ratio: "4:1", Attack: "30 ms", Release: "auto", Tone: "HPF 200" },
        prompt:
          'Create "Bus Weight" — a subtle parallel bus compressor that adds low-mid weight and sustain to a whole mix. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone, Auto gain match. Preset: ratio 4:1, 30 ms attack, auto release, HPF 200 Hz, 18% wet.',
      },
      {
        name: "Trap 808 Smash",
        params: { Amount: 66, Mix: "40% wet", Ratio: "20:1", Attack: "0.5 ms", Release: "150 ms", Tone: "LPF 4k" },
        prompt:
          'Build "808 Smash" — a parallel limiter for 808s that brings up the harmonic top so the sub is audible on small speakers. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone, Drive, Mix-phase. Preset: ratio 20:1, 0.5 ms attack, 150 ms release, LPF 4 kHz, 40% wet.',
      },
      {
        name: "Room Bleed Restore",
        params: { Amount: 52, Mix: "30% wet", Ratio: "8:1", Attack: "60 ms", Release: "400 ms", Tone: "HPF 100 / LPF 5k" },
        prompt:
          'Make "Room Restore" — a slow-attack parallel compressor that recreates the room wash that stem separation stripped out. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone. Preset: ratio 8:1, 60 ms attack, 400 ms release, HPF 100 Hz, LPF 5 kHz, 30% wet.',
      },
      {
        name: "Guitar Density",
        params: { Amount: 58, Mix: "45% wet", Ratio: "12:1", Attack: "10 ms", Release: "60 ms", Tone: "HPF 180 / LPF 7k" },
        prompt:
          'Create "Guitar Density" — a parallel smash for a wall-of-guitars chorus. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone, Drive. Preset: ratio 12:1, 10 ms attack, 60 ms release, HPF 180 Hz, LPF 7 kHz, 45% wet, plus 30% drive.',
      },
      {
        name: "Piano Sustain Lift",
        params: { Amount: 42, Mix: "28% wet", Ratio: "6:1", Attack: "40 ms", Release: "600 ms", Tone: "HPF 120 / LPF 9k" },
        prompt:
          'Build "Piano Lift" — a long-release parallel compressor that brings up piano pedal wash and resonance. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone. Preset: ratio 6:1, 40 ms attack, 600 ms release, HPF 120 Hz, LPF 9 kHz, 28% wet.',
      },
      {
        name: "Cinematic Impact Slam",
        params: { Amount: 78, Mix: "55% wet", Ratio: "20:1", Attack: "0.1 ms", Release: "1.2 s", Tone: "HPF 40 / LPF 12k" },
        prompt:
          'Make "Impact Slam" — a parallel slammer for trailer hits and braams. Controls: Amount (0.0 default), Mix, Ratio, Attack, Release, Tone, Sidechain trigger. Preset: ratio 20:1, 0.1 ms attack, 1.2 s release, HPF 40 Hz, LPF 12 kHz, 55% wet, triggered by the impact itself.',
      },
    ],
  },
  {
    id: "bus-glue-vca",
    name: "Bus Glue VCA",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "🔗",
    target: "Drum bus, instrument groups, master",
    oneLiner:
      "VCA-style group compressor with ratio, thrust and a mix control. Makes separately generated stems feel like one band.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Ratio", value: "1.5:1" },
      { name: "Thrust", value: "0.0 (flat detector)" },
      { name: "Attack", value: "0.0 ms" },
      { name: "Release", value: "0.0 ms" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Group glue is the fix for 'stems that were separated then stacked back up' — the parts stop sounding like 6 different songs. Aim for 1–2 dB of GR on the whole group, never more.",
    presets: [
      {
        name: "Drum Group Glue",
        params: { Amount: 44, Ratio: "4:1", Attack: "10 ms", Release: "100 ms", Thrust: "low", Mix: "90%" },
        prompt:
          'Build "Group Glue VCA" — a group compressor with a Thrust control that tilts the detector toward lows, mids or highs. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix, auto makeup. Preset "Drum Group Glue": ratio 4:1, attack 10 ms, release 100 ms, thrust = low (kick leads), 1.5 dB GR, mix 90%.',
      },
      {
        name: "Vocal Stack Glue",
        params: { Amount: 46, Ratio: "3:1", Attack: "15 ms", Release: "180 ms", Thrust: "mid", Mix: "100%" },
        prompt:
          'Make "Stack Glue" for 6–12 background vocal tracks. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix, auto makeup. Preset: ratio 3:1, attack 15 ms, release 180 ms, thrust = mid so words lead the compression, auto makeup on.',
      },
      {
        name: "Synth Bus Glue",
        params: { Amount: 38, Ratio: "2.5:1", Attack: "25 ms", Release: "240 ms", Thrust: "flat", Mix: "100%" },
        prompt:
          'Create "Synth Glue" — a gentle VCA for pads, keys and arps so the synth bus moves as one instrument. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix. Preset: ratio 2.5:1, 25 ms attack, 240 ms release, flat thrust, 1 dB GR.',
      },
      {
        name: "Rock Mix Bus",
        params: { Amount: 40, Ratio: "4:1", Attack: "30 ms", Release: "0.3 s", Thrust: "low", Mix: "85%" },
        prompt:
          'Build "Rock Bus" — a mix-bus compressor for band-style AI material. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix, Sidechain HPF. Preset: ratio 4:1, 30 ms attack, 300 ms release, thrust low, sidechain HPF 120 Hz, 85% wet for 1–2 dB GR.',
      },
      {
        name: "Strings & Brass Section",
        params: { Amount: 32, Ratio: "2:1", Attack: "40 ms", Release: "500 ms", Thrust: "mid", Mix: "100%" },
        prompt:
          'Make "Section Glue" for strings and brass — slow, musical, barely audible. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix. Preset: ratio 2:1, 40 ms attack, 500 ms release, thrust mid, 1 dB GR on tutti passages only.',
      },
      {
        name: "Bass + Sub Lock",
        params: { Amount: 54, Ratio: "6:1", Attack: "5 ms", Release: "160 ms", Thrust: "low", Mix: "100%" },
        prompt:
          'Create "Low Lock" — a compressor for the combined bass and sub bus so kick, 808 and bassline feel like one low end. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix, Sidechain input. Preset: ratio 6:1, 5 ms attack, 160 ms release, thrust low, optional external sidechain from the kick.',
      },
      {
        name: "Cinematic cues / Trailer",
        params: { Amount: 48, Ratio: "3:1", Attack: "60 ms", Release: "1 s", Thrust: "low", Mix: "100%" },
        prompt:
          'Build "Trailer Glue" — a slow, deep VCA for orchestral trailer cues. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix, Sidechain HPF. Preset: ratio 3:1, 60 ms attack, 1 s release, thrust low, sidechain HPF 60 Hz so the swell breathes but the sub stays solid.',
      },
      {
        name: "Vocal Ride Replacement",
        params: { Amount: 58, Ratio: "8:1", Attack: "20 ms", Release: "300 ms", Thrust: "mid", Mix: "70%" },
        prompt:
          'Make "Auto Ride" — a heavy-RMS compressor with a blend that behaves like hand-riding a vocal fader. Controls: Amount (0.0 default), Ratio, Attack, Release, Thrust, Mix, Target level. Preset: ratio 8:1, 20 ms attack, 300 ms release, thrust mid, 70% wet, target level match so quiet phrases come up instead of loud ones going down.',
      },
    ],
  },
  {
    id: "level-rider",
    name: "Level Rider",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "🛗",
    target: "Vocals, bass, any fader you hate riding",
    oneLiner:
      "Slow gain-riding automation engine with target, smoothing and a 0.0 default so it never moves until you tell it to.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Target", value: "0.0 dB offset" },
      { name: "Smoothing", value: "0.0 (fast)" },
      { name: "Max Ride", value: "0.0 dB" },
      { name: "Hold", value: "0.0 ms" },
    ],
    tip: "Ride before you compress. A rider that moves in 200–400 ms does the fader work, then a 3:1 compressor handles the last 2 dB. Never let the two fight over the same time-scale.",
    presets: [
      {
        name: "Vocal Ride 1",
        params: { Amount: 50, Target: "0 dB", Smoothing: "300 ms", "Max Ride": "-/+ 4 dB", Hold: "150 ms" },
        prompt:
          'Build "Vocal Rider 1" — an automatic fader that keeps a vocal at a constant perceived level. Controls: Amount (0.0 default), Target level, Smoothing time, Max ride, Hold, Bypass on loud words. Preset "Vocal Ride 1": 300 ms smoothing, ±4 dB max ride, 150 ms hold so consonants do not trigger it.',
      },
      {
        name: "Bass Level Lock",
        params: { Amount: 56, Target: "0 dB", Smoothing: "500 ms", "Max Ride": "-/+ 3 dB", Hold: "250 ms" },
        prompt:
          'Make "Bass Lock" — a slow rider that evens out uneven AI bass notes. Controls: Amount (0.0 default), Target, Smoothing, Max ride, Hold, sidechain HPF at 60 Hz. Preset: 500 ms smoothing, ±3 dB ride, 250 ms hold, detector low-passed at 250 Hz.',
      },
      {
        name: "Podcast Loudness Rider",
        params: { Amount: 64, Target: "-16 LUFS", Smoothing: "800 ms", "Max Ride": "-/+ 6 dB", Hold: "300 ms" },
        prompt:
          'Create "Podcast Rider" — a long-term level rider for spoken word with a LUFS target. Controls: Amount (0.0 default), Target LUFS, Smoothing, Max ride, Hold, Gate. Preset: target -16 LUFS, 800 ms smoothing, ±6 dB, 300 ms hold, gate so silence is not boosted.',
      },
      {
        name: "Chorus Lift Automation",
        params: { Amount: 44, Target: "+1.5 dB", Smoothing: "1 bar", "Max Ride": "-/+ 3 dB", Sync: "tempo" },
        prompt:
          'Build "Section Lift" — a rider that raises the level of every chorus by a set amount, tempo-synced to the bar. Controls: Amount (0.0 default), Target, Smoothing in bars, Max ride, Sync. Preset: target +1.5 dB, smoothing 1 bar, ±3 dB range, synced so the lift lands on the downbeat.',
      },
      {
        name: "Dialogue over Music Bed",
        params: { Amount: 60, Target: "-18 LUFS", Smoothing: "600 ms", "Max Ride": "-/+ 8 dB", Duck: "on" },
        prompt:
          'Make "Duck Bed Rider" — a rider that pulls a music bed down when dialogue is present and eases it back up. Controls: Amount (0.0 default), Target, Smoothing, Max ride, Duck depth, Release. Preset: target -18 LUFS for dialogue, 600 ms smoothing, ±8 dB on the bed, 10 dB duck, 700 ms release.',
      },
      {
        name: "Live-Feel Humanizer",
        params: { Amount: 30, Target: "0 dB", Smoothing: "1.5 s", "Max Ride": "-/+ 2 dB", Drift: "on" },
        prompt:
          'Create "Human Drift" — a rider that adds tiny long-term level drift so a perfectly consistent AI vocal breathes like a real performance. Controls: Amount (0.0 default), Drift amount, Drift rate, Smoothing, Max ride. Preset: drift rate 1/4 bar, drift amount 1 dB, 1.5 s smoothing, ±2 dB.',
      },
      {
        name: "Drum Loop Even-Out",
        params: { Amount: 48, Target: "0 dB", Smoothing: "250 ms", "Max Ride": "-/+ 3 dB", Loop: "2 bars" },
        prompt:
          'Make "Loop Leveller" — a rider that evens out a two-bar AI drum loop so bar 1 and bar 2 match. Controls: Amount (0.0 default), Loop length, Smoothing, Max ride, Target. Preset: loop 2 bars, 250 ms smoothing, ±3 dB, target 0 dB.',
      },
      {
        name: "Master RMS Nudge",
        params: { Amount: 26, Target: "-14 LUFS", Smoothing: "2 s", "Max Ride": "-/+ 1.5 dB", Ceiling: "-1 dBTP" },
        prompt:
          'Create "Master Nudge" — a very slow master rider that holds the whole track near a target LUFS without limiting. Controls: Amount (0.0 default), Target LUFS, Smoothing, Max ride, True-peak ceiling. Preset: target -14 LUFS, 2 s smoothing, ±1.5 dB, ceiling -1 dBTP.',
      },
    ],
  },
];
