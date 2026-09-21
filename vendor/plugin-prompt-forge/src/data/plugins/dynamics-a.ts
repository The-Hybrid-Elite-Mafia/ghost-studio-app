import type { Plugin } from "../types";

export const dynamicsA: Plugin[] = [
  {
    id: "compressor",
    name: "Compressor",
    kind: "Built-in",
    category: "Dynamics",
    icon: "🎚️",
    target: "Any track",
    oneLiner:
      "Compressor design reference. Threshold, ratio, knee, attack, release, gain, plus sidechain input for ducking.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Threshold", value: "0 dBFS" },
      { name: "Ratio", value: "1.0 : 1" },
      { name: "Attack", value: "20 ms (inactive at Amount 0.0)" },
      { name: "Release", value: "0.0 (auto / off)" },
      { name: "Knee", value: "0.0 (hard)" },
      { name: "Makeup", value: "0.0 dB" },
    ],
    tip: "Engineer order: EQ the mud out FIRST, then compress — otherwise the compressor reacts to the mud. Drop the threshold until you see 2–4 dB of movement on the loud phrases and stop before it sounds squeezed.",
    presets: [
      {
        name: "Pop Lead Vocal Leveler",
        params: { Amount: 45, Threshold: "-18 dB", Ratio: "3:1", Attack: "18 ms", Release: "140 ms auto", Knee: "Soft", Makeup: "auto" },
        prompt:
          'Build a plugin called "Pop Vocal Leveler" — an optical-style compressor for a lead vocal. Controls: Amount (0–100, starts 0.0), Threshold, Ratio, Attack, Release, Knee, Makeup with auto gain-match. Default state must be perfectly transparent at Amount 0.0. Save preset "Pop Lead Vocal Leveler": threshold -18 dB, ratio 3:1, attack 18 ms so consonants stay crisp, release 140 ms tied to the phrase, soft knee, 3–4 dB GR on loud lines only.',
      },
      {
        name: "Rap Vocal In-Your-Face",
        params: { Amount: 62, Threshold: "-22 dB", Ratio: "6:1", Attack: "4 ms", Release: "90 ms", Knee: "Hard", Makeup: "+3 dB" },
        prompt:
          'Make me a fast FET-style vocal compressor called "Rap Slam". Controls: Amount (starts 0.0), Threshold, Ratio, Attack, Release, Knee, Makeup. Preset "Rap Vocal In-Your-Face": threshold -22 dB, ratio 6:1, attack 4 ms to grab transients, release 90 ms so it breathes between bars, hard knee, +3 dB makeup. Keep it dense but never pumping on the 808.',
      },
      {
        name: "Drum Bus Punch",
        params: { Amount: 40, Threshold: "-14 dB", Ratio: "4:1", Attack: "25 ms", Release: "110 ms", Knee: "Medium", Mix: "85% wet" },
        prompt:
          'Build "Drum Punch Comp" — a bus compressor that keeps kick and snare transient while levelling the kit. Controls: Amount (0.0 default), Threshold, Ratio, Attack, Release, Knee, Mix for parallel. Preset "Drum Bus Punch": threshold -14 dB, ratio 4:1, slow-ish 25 ms attack to let the hit through, 110 ms release locked to the tempo, 85% wet mix so the transient stays huge.',
      },
      {
        name: "Glue / Mix Bus 2:1",
        params: { Amount: 30, Threshold: "-10 dB", Ratio: "2:1", Attack: "30 ms", Release: "auto", Knee: "Very soft", GR: "1–2 dB" },
        prompt:
          'Create a gentle mix-bus glue compressor called "Glue VCA 2:1". Controls: Amount (starts 0.0), Threshold, Ratio, Attack, Release, Knee, auto gain-match. Preset "Glue / Mix Bus 2:1": ratio 2:1, threshold set for 1–2 dB of reduction on the chorus only, 30 ms attack, program-dependent auto release, very soft knee. Zero colour at Amount 0.0.',
      },
      {
        name: "808 / Sub Sustain",
        params: { Amount: 55, Threshold: "-26 dB", Ratio: "8:1", Attack: "2 ms", Release: "220 ms", Knee: "Hard", HPF: "off" },
        prompt:
          'Build "Sub Sustain" — a slow-release compressor that fattens 808 and sub bass tails so they last the whole bar. Controls: Amount (0.0 default), Threshold, Ratio, Attack, Release, Knee, optional sidechain HPF so it does not chase the kick. Preset "808 / Sub Sustain": threshold -26 dB, ratio 8:1, 2 ms attack, 220 ms release, hard knee, sidechain high-pass at 90 Hz so only the note body gets squeezed.',
      },
      {
        name: "Acoustic Guitar Even-Out",
        params: { Amount: 38, Threshold: "-20 dB", Ratio: "2.5:1", Attack: "12 ms", Release: "260 ms", Knee: "Soft", Makeup: "auto" },
        prompt:
          'Make an acoustic-guitar leveler called "Strum Even-Out". Controls: Amount (starts 0.0), Threshold, Ratio, Attack, Release, Knee, Makeup, plus a gentle sidechain HPF at 100 Hz. Preset "Acoustic Guitar Even-Out": 2.5:1 ratio, -20 dB threshold, 12 ms attack, 260 ms release, soft knee — it should smooth pick spikes without dulling the string transient.',
      },
      {
        name: "Sidechain Duck (Vocal over Bed)",
        params: { Amount: 70, Threshold: "-24 dB", Ratio: "10:1", Attack: "1 ms", Release: "180 ms", Range: "-6 dB", Detector: "external" },
        prompt:
          'Build a ducking compressor called "VO Duck" that uses an external sidechain so the music bed dips under the lead vocal. Controls: Amount (0.0 default), Threshold, Ratio, Attack, Release, Range, Sidechain Source. Preset "Sidechain Duck": 1 ms attack, 180 ms release, -6 dB range, 10:1 ratio, external detector from the vocal track. Nothing happens until Amount is pushed above 0.0.',
      },
      {
        name: "Parallel NY Smash",
        params: { Amount: 80, Threshold: "-30 dB", Ratio: "20:1", Attack: "0.5 ms", Release: "60 ms", Mix: "30% wet", HPF: "120 Hz" },
        prompt:
          'Create "NY Smash" — a parallel drum crusher. Controls: Amount (starts 0.0), Threshold, Ratio, Attack, Release, Mix, sidechain HPF. Preset "Parallel NY Smash": threshold -30 dB, 20:1 ratio, 0.5 ms attack, 60 ms release, 120 Hz HPF on the detector, and a Mix knob so I can blend 30% of the smashed signal under the dry kit.',
      },
      {
        name: "Broadcast / Podcast Voice",
        params: { Amount: 66, Threshold: "-21 dB", Ratio: "4:1", Attack: "8 ms", Release: "120 ms", Knee: "Soft", HPF: "80 Hz" },
        prompt:
          'Build a broadcast voice chain compressor called "Radio Voice Comp". Controls: Amount (0.0 default), Threshold, Ratio, Attack, Release, Knee, Makeup, sidechain HPF. Preset "Broadcast / Podcast Voice": 80 Hz HPF on the detector, ratio 4:1, threshold -21 dB, 8 ms attack, 120 ms release, soft knee, auto makeup so the level stays put for a whole session.',
      },
    ],
  },
  {
    id: "sidechain-compressor",
    name: "Sidechain Compressor",
    kind: "Built-in",
    category: "Dynamics",
    icon: "🫀",
    target: "Bass, pads, pads under kick",
    oneLiner:
      "Same factory compressor with an external detector — pick another track as the trigger and the target ducks in time.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Sidechain Source", value: "none" },
      { name: "Threshold", value: "0 dBFS" },
      { name: "Ratio", value: "1.0 : 1" },
      { name: "Release", value: "0.0 ms" },
      { name: "Range", value: "0.0 dB" },
    ],
    tip: "Set release as a note division, not milliseconds: at 124 BPM a 1/8-note release (~242 ms) gives that clean EDM suck. Filter the detector (80–150 Hz HPF) or the compressor will react to the bass instead of the kick.",
    presets: [
      {
        name: "EDM 1/8 Pump",
        params: { Amount: 60, Ratio: "6:1", Release: "1/8 note", Attack: "0.5 ms", Range: "-6 dB", "Detector HPF": "150 Hz" },
        prompt:
          'Build a sidechain pumper called "EDM Pump 1/8" that ducks the pad whenever the kick hits. Controls: Amount (0.0 default), Sidechain Source, Ratio, Attack, Release as a note division, Range, Detector HPF. Preset "EDM 1/8 Pump": release = 1/8 note, attack 0.5 ms, ratio 6:1, -6 dB range, detector high-passed at 150 Hz so only the kick low-end triggers it.',
      },
      {
        name: "Future Bass 1/4 Suck",
        params: { Amount: 72, Ratio: "12:1", Release: "1/4 note", Attack: "0.1 ms", Range: "-10 dB", "Detector HPF": "120 Hz" },
        prompt:
          'Make "Future Suck" — an aggressive sidechain for future-bass supersaws. Controls: Amount (starts 0.0), Sidechain Source, Ratio, Release in note divisions, Range, Attack, Detector HPF. Preset "Future Bass 1/4 Suck": release = 1/4 note, ratio 12:1, attack 0.1 ms, -10 dB range, detector HPF 120 Hz. Add a tiny hold so the dip stays open through the whole chord.',
      },
      {
        name: "Deep House Gentle Breathing",
        params: { Amount: 34, Ratio: "2.5:1", Release: "1/4 dotted", Attack: "8 ms", Range: "-3 dB", "Detector HPF": "200 Hz" },
        prompt:
          'Create "House Breath" — a barely-there sidechain for deep house pads. Controls: Amount (0.0 default), Ratio, Release (note divisions), Attack, Range, Detector HPF. Preset "Deep House Gentle Breathing": ratio 2.5:1, release = dotted 1/4, attack 8 ms, -3 dB range, detector HPF 200 Hz. It should feel like the room inhaling, not like a plug-in working.',
      },
      {
        name: "Bass Dodges Kick",
        params: { Amount: 50, Ratio: "8:1", Release: "90 ms", Attack: "0.5 ms", Range: "-5 dB", "Detector HPF": "60 Hz", Lookahead: "3 ms" },
        prompt:
          'Build "Bass Dodge" so the sub bass gets out of the kick\'s way without the whole mix pumping. Controls: Amount (starts 0.0), Ratio, Release, Attack, Range, Detector HPF, Lookahead. Preset "Bass Dodges Kick": detector HPF 60 Hz (kick body only), 3 ms lookahead, attack 0.5 ms, release 90 ms, range -5 dB, ratio 8:1.',
      },
      {
        name: "Trance Gate-Style Chopping",
        params: { Amount: 85, Ratio: "20:1", Release: "1/16", Attack: "0.1 ms", Range: "-18 dB", Detector: "trigger clip" },
        prompt:
          'Make "Trance Chop" — a hard sidechain that chops a sustained pad on a 1/16 grid. Controls: Amount (0.0 default), Ratio, Release, Attack, Range, Trigger Source, Hold. Preset "Trance Gate-Style Chopping": ratio 20:1, release 1/16, attack 0.1 ms, -18 dB range, hold 30% of the division so each chop sounds deliberate.',
      },
      {
        name: "Rap 808 Tuck",
        params: { Amount: 44, Ratio: "4:1", Release: "120 ms", Attack: "2 ms", Range: "-4 dB", "Detector HPF": "70 Hz" },
        prompt:
          'Create "808 Tuck" for rap mixes: the 808 dips 4 dB under every kick then snaps back. Controls: Amount (starts 0.0), Ratio, Release, Attack, Range, Detector HPF. Preset values: ratio 4:1, detector HPF 70 Hz, attack 2 ms, release 120 ms, range -4 dB. Keep the tail fat — this is a tuck, not a carve.',
      },
      {
        name: "Cinematic Trailer Swell",
        params: { Amount: 58, Ratio: "6:1", Release: "2 bars", Attack: "250 ms", Range: "-8 dB", "Detector HPF": "40 Hz" },
        prompt:
          'Build "Trailer Swell" — a long-release sidechain that lets braams and risers bloom between downbeats. Controls: Amount (0.0 default), Ratio, Release in bars, Attack, Range, Detector HPF. Preset "Cinematic Trailer Swell": ratio 6:1, release = 2 bars, slow 250 ms attack, -8 dB range, detector HPF 40 Hz.',
      },
      {
        name: "Riser Pre-Drop Vacuum",
        params: { Amount: 90, Ratio: "20:1", Release: "1 bar", Attack: "1 ms", Range: "-24 dB", Automate: "drop bar" },
        prompt:
          'Make "Pre-Drop Vacuum" — a sidechain I can automate to pull everything down for one bar before the drop. Controls: Amount (starts 0.0), Ratio, Release, Attack, Range, Detector HPF. Preset "Riser Pre-Drop Vacuum": ratio 20:1, 1 ms attack, 1-bar release, -24 dB range. Amount should be automatable so I can ramp it 0.0 → 90 across the riser.',
      },
    ],
  },
  {
    id: "gate",
    name: "Gate",
    kind: "Built-in",
    category: "Dynamics",
    icon: "🚪",
    target: "Drums, room mics, noise, breath",
    oneLiner:
      "Factory noise gate with threshold, attack, hold, release and range. Cuts bleed, hiss and the space between hits.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Threshold", value: "-inf dB" },
      { name: "Attack", value: "0.0 ms" },
      { name: "Hold", value: "0.0 ms" },
      { name: "Release", value: "0.0 ms" },
      { name: "Range", value: "0.0 dB" },
    ],
    tip: "Use Range (-12 to -20 dB) instead of full mute — a hard-closed gate on AI drums sounds robotic and eats the cymbal wash. Slow the attack a touch on toms so the stick attack survives.",
    presets: [
      {
        name: "Tighten AI Drums",
        params: { Amount: 55, Threshold: "-26 dB", Attack: "1 ms", Hold: "40 ms", Release: "70 ms", Range: "-16 dB" },
        prompt:
          'Build a gate called "Drum Tightener" that cleans the ring and bleed out of an AI-generated kit. Controls: Amount (0.0 default), Threshold, Attack, Hold, Release, Range. Preset "Tighten AI Drums": threshold -26 dB, attack 1 ms, hold 40 ms, release 70 ms, range -16 dB — tighten without a clicky close.',
      },
      {
        name: "Snap Kick Cleanup",
        params: { Amount: 62, Threshold: "-22 dB", Attack: "0.1 ms", Hold: "20 ms", Release: "45 ms", Range: "-22 dB", Lookahead: "1 ms" },
        prompt:
          'Make "Kick Snap Gate" — a fast gate that removes low-end wash after each kick so the 808 has room. Controls: Amount (starts 0.0), Threshold, Attack, Hold, Release, Range, Lookahead. Preset: threshold -22 dB, attack 0.1 ms with 1 ms lookahead so no transient is shaved, hold 20 ms, release 45 ms, range -22 dB.',
      },
      {
        name: "Tone Shaper for Toms",
        params: { Amount: 48, Threshold: "-28 dB", Attack: "6 ms", Hold: "80 ms", Release: "180 ms", Range: "-12 dB" },
        prompt:
          'Create "Tom Shaper" — a slow-attack gate that makes toms fatter by leaving the stick attack and trimming the sustain. Controls: Amount (0.0 default), Threshold, Attack, Hold, Release, Range. Preset: attack 6 ms, hold 80 ms, release 180 ms, threshold -28 dB, range -12 dB.',
      },
      {
        name: "Hiss Gate on Silence",
        params: { Amount: 70, Threshold: "-52 dB", Attack: "2 ms", Hold: "150 ms", Release: "400 ms", Range: "-40 dB", Floor: "off" },
        prompt:
          'Build "Silence Sweeper" — a very low-threshold gate that only acts when nothing is playing, so AI hiss and generated floor noise disappear in the gaps. Controls: Amount (starts 0.0), Threshold, Attack, Hold, Release, Range, Detector HPF. Preset: threshold -52 dB, attack 2 ms, hold 150 ms, release 400 ms (no clicks), range -40 dB, detector HPF 300 Hz so it ignores quiet tail ends of notes.',
      },
      {
        name: "Rhythmic Trance Gate",
        params: { Amount: 88, Threshold: "-30 dB", Attack: "0.2 ms", Hold: "1/16", Release: "5 ms", Range: "-60 dB", Sync: "tempo" },
        prompt:
          'Make "Trance Gate" — a tempo-synced rhythmic gate with pattern shapes. Controls: Amount (0.0 default), Sync division, Pattern, Attack, Release, Range, Threshold. Preset "Rhythmic Trance Gate": 1/16 pattern with accents on the downbeat, attack 0.2 ms, release 5 ms, range -60 dB, tempo synced.',
      },
      {
        name: "Vocal Breath Tamer",
        params: { Amount: 40, Threshold: "-38 dB", Attack: "3 ms", Hold: "30 ms", Release: "120 ms", Range: "-8 dB" },
        prompt:
          'Create "Breath Tamer" — a gentle gate that only pulls breaths and mouth noise down, never mutes them. Controls: Amount (starts 0.0), Threshold, Attack, Hold, Release, Range, sidechain HPF. Preset: threshold -38 dB, range -8 dB, attack 3 ms, hold 30 ms, release 120 ms, detector HPF 500 Hz so low vocal energy does not open it.',
      },
      {
        name: "Gated Reverb Snare",
        params: { Amount: 75, Threshold: "-20 dB", Attack: "1 ms", Hold: "180 ms", Release: "8 ms", Range: "-80 dB" },
        prompt:
          'Build "80s Gated Snare" — a gate placed after a big reverb to chop the tail. Controls: Amount (0.0 default), Threshold, Attack, Hold, Release, Range, Reverse trigger. Preset: threshold -20 dB, attack 1 ms, hold 180 ms, release 8 ms, range -80 dB, triggered by the dry snare so the reverb slams shut.',
      },
      {
        name: "Dusty Percussion Slicer",
        params: { Amount: 65, Threshold: "-34 dB", Attack: "0.5 ms", Hold: "1/32", Release: "30 ms", Range: "-30 dB", Sync: "tempo" },
        prompt:
          'Make "Perc Slicer" — a tempo-synced gate for shakers, hats and congas that turns a static loop into a chopped groove. Controls: Amount (starts 0.0), Sync division, Pattern, Attack, Hold, Release, Range. Preset: 1/32 pattern, alternating mutes, attack 0.5 ms, hold one 1/32, release 30 ms, range -30 dB.',
      },
    ],
  },
  {
    id: "multiband-compressor",
    name: "Multiband Compressor",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "🧱",
    target: "Mix bus, full stems, vocals",
    oneLiner:
      "Three or four bands, each with its own compressor. Fix one problem zone without squashing the whole track.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Crossovers", value: "0.0 Hz offset" },
      { name: "Band GR", value: "0.0 dB (all)" },
      { name: "Attack/Release", value: "0.0 (off)" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "The classic AI-mix fix: the low band carries generated mud, the high band carries generated glass. Compress each separately and the track instantly sounds 'produced'. Keep crossovers at 180 Hz / 2.2 kHz / 7 kHz as a starting map.",
    presets: [
      {
        name: "Mix Bus 3-Band Glue",
        params: { Amount: 35, Bands: "180 Hz / 2.2 kHz", Low: "2 dB @ 4:1", Mid: "1.5 dB @ 3:1", High: "2 dB @ 4:1", Release: "auto" },
        prompt:
          'Build "3-Band Bus Glue" — a three-band compressor for the master bus with crossovers at 180 Hz and 2.2 kHz. Controls: Amount (0.0 default), crossover points, per-band threshold/ratio/attack/release, per-band gain, Mix. Preset "Mix Bus 3-Band Glue": low band 2 dB GR at 4:1, mid 1.5 dB at 3:1, high 2 dB at 4:1, program-dependent release, phase-linear crossovers.',
      },
      {
        name: "Muddy Low-Mid Tamer",
        params: { Amount: 55, Crossover: "250 Hz", Band: "low-mid", GR: "-4 dB max", Ratio: "5:1", Attack: "20 ms", Release: "150 ms" },
        prompt:
          'Create "Mud Band Compressor" — a single-band multiband that only squeezes 120–320 Hz when it gets crowded. Controls: Amount (starts 0.0), Band start, Band end, Threshold, Ratio, Attack, Release, Range. Preset "Muddy Low-Mid Tamer": 120–320 Hz, 5:1 ratio, 4 dB max reduction, 20 ms attack, 150 ms release.',
      },
      {
        name: "Brittle High Band Smoother",
        params: { Amount: 50, Band: "5–16 kHz", GR: "-3.5 dB", Ratio: "4:1", Attack: "3 ms", Release: "80 ms", Knee: "soft" },
        prompt:
          'Make "Glass Smoother" — a multiband that compresses only the top band to soften harsh AI cymbals and vocal sibilance. Controls: Amount (0.0 default), Band start, Band end, Threshold, Ratio, Attack, Release, Range. Preset: 5–16 kHz band, 4:1 ratio, 3.5 dB max GR, 3 ms attack, 80 ms release.',
      },
      {
        name: "Vocal 4-Band Clarity",
        params: { Amount: 45, Bands: "160 / 900 / 4.5 kHz", Low: "2 dB", LowMid: "3 dB", HighMid: "2.5 dB", Air: "1.5 dB" },
        prompt:
          'Build "Vocal 4-Band" for AI vocal stems: crossovers at 160 Hz, 900 Hz and 4.5 kHz. Controls: Amount (0.0 default), 3 crossovers, per-band GR, per-band release, Mix. Preset "Vocal 4-Band Clarity": 2 dB low, 3 dB low-mid (presence), 2.5 dB high-mid (edge control), 1.5 dB air band. Keep vocal character intact at Amount 0.0.',
      },
      {
        name: "EDM Drop Punch",
        params: { Amount: 68, Bands: "120 / 1.5 / 6 kHz", Low: "6 dB @ 8:1", Mid: "3 dB", High: "4 dB", Release: "tempo" },
        prompt:
          'Make "Drop Puncher" — a four-band compressor for EDM drops. Controls: Amount (starts 0.0), crossovers, per-band GR, tempo-synced release, Mix. Preset: 120 Hz / 1.5 kHz / 6 kHz crossovers, low band 6 dB at 8:1, mid 3 dB, high 4 dB, release locked to 1/8 note.',
      },
      {
        name: "Acoustic Natural Dynamics",
        params: { Amount: 26, Bands: "200 / 3 kHz", Low: "1.5 dB", Mid: "1 dB", High: "1 dB", Knee: "very soft" },
        prompt:
          'Create "Natural Dynamics" — an almost-invisible two-band compressor for acoustic, jazz and classical AI material. Controls: Amount (0.0 default), crossovers, per-band GR, knee, Mix. Preset: crossovers 200 Hz and 3 kHz, 1–1.5 dB GR per band, very soft knee, slow release. Should sound like nothing at all.',
      },
      {
        name: "De-Ess + De-Harsh Combo",
        params: { Amount: 58, Bands: "2.8–5.5 kHz / 7–11 kHz", Band1: "-4 dB", Band2: "-3 dB", Attack: "1 ms", Release: "60 ms" },
        prompt:
          'Build "Harsh & Sibilance Multiband" with two narrow dynamic bands: 2.8–5.5 kHz for harshness and 7–11 kHz for sibilance. Controls: Amount (0.0 default), band edges, per-band reduction, attack, release, look-ahead. Preset: band 1 -4 dB, band 2 -3 dB, 1 ms attack with 5 ms look-ahead, 60 ms release.',
      },
      {
        name: "Lo-Fi Radio Multiband",
        params: { Amount: 72, Bands: "300 Hz / 3.4 kHz", Low: "heavy", Mid: "forward", High: "clipped", Mix: "70%" },
        prompt:
          'Make "Bandwidth Crush" — a multiband that emulates a narrow broadcast chain: heavy low-band squeeze, forward mid band, clipped high band. Controls: Amount (0.0 default), crossovers, per-band drive, per-band GR, Mix. Preset: crossovers 300 Hz and 3.4 kHz, Mix 70% wet for parallel use.',
      },
    ],
  },
  {
    id: "limiter",
    name: "Brickwall Limiter",
    kind: "Chat-built",
    category: "Dynamics",
    icon: "🧱",
    target: "Master, drum bus, any peak control",
    oneLiner:
      "True-peak ceiling with look-ahead and release control. Catch peaks without audibly crushing the song.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Ceiling", value: "0.0 dB" },
      { name: "Threshold", value: "0 dBFS" },
      { name: "Release", value: "0.0 (auto)" },
      { name: "Lookahead", value: "0.0 ms" },
    ],
    tip: "True-peak ceiling at -1.0 dBTP for anything going to streaming/lossy encoding. If you need more than 3–4 dB of limiting, fix the mix first — clipper before limiter is the modern move.",
    presets: [
      {
        name: "Streaming Safe -14 LUFS",
        params: { Amount: 40, Ceiling: "-1.0 dBTP", Threshold: "-1.5 dB GR", Release: "auto 120 ms", Lookahead: "5 ms", Style: "transparent" },
        prompt:
          'Build "Streaming Limiter" — a transparent true-peak limiter for the master. Controls: Amount (0.0 default), Ceiling, Threshold, Release, Lookahead, Style (transparent/punchy/loud). Preset "Streaming Safe -14 LUFS": ceiling -1.0 dBTP, 5 ms lookahead, auto release around 120 ms, no more than 1.5 dB GR.',
      },
      {
        name: "Club / Spotify Loud -8 LUFS",
        params: { Amount: 72, Ceiling: "-0.8 dBTP", Threshold: "-4 dB GR", Release: "60 ms", Lookahead: "2 ms", Style: "loud" },
        prompt:
          'Make "Club Loud" — a punchy limiter for loud club and hip-hop masters. Controls: Amount (starts 0.0), Ceiling, Threshold, Release, Lookahead, Style, Oversampling. Preset: ceiling -0.8 dBTP, 2 ms lookahead, 60 ms release, up to 4 dB GR, 4x oversampling to stop inter-sample clipping.',
      },
      {
        name: "Drum Bus Peak Catcher",
        params: { Amount: 30, Ceiling: "-0.5 dBTP", Threshold: "-1 dB GR", Release: "40 ms", Lookahead: "1 ms", Style: "punchy" },
        prompt:
          'Create "Peak Catcher" — a limiter for the drum bus that only stops the occasional snare spike. Controls: Amount (0.0 default), Ceiling, Threshold, Release, Lookahead. Preset: ceiling -0.5 dBTP, 1 ms lookahead, 40 ms release, 1 dB GR max — invisible unless something jumps.',
      },
      {
        name: "Vocal Peak Guard",
        params: { Amount: 34, Ceiling: "-3 dBFS", Threshold: "-2 dB GR", Release: "150 ms", Lookahead: "3 ms", Style: "transparent" },
        prompt:
          'Build "Vocal Guard" — a safety limiter for a vocal stem so no plosive or generated peak clips the chain downstream. Controls: Amount (starts 0.0), Ceiling, Threshold, Release, Lookahead. Preset: ceiling -3 dBFS, 3 dB headroom, 3 ms lookahead, 150 ms release.',
      },
      {
        name: "Lo-Fi Crush Limiter",
        params: { Amount: 85, Ceiling: "-0.2 dBTP", Threshold: "-10 dB GR", Release: "25 ms", Style: "crushed", Oversample: "off" },
        prompt:
          'Make "Crush Limiter" — an intentionally ugly limiter for lo-fi and phonk that squeezes 10 dB and lets the artifacts in. Controls: Amount (0.0 default), Ceiling, Threshold, Release, Oversampling on/off. Preset: ceiling -0.2 dBTP, 25 ms release, oversampling off on purpose.',
      },
      {
        name: "Classical / Dynamic Master",
        params: { Amount: 18, Ceiling: "-1.5 dBTP", Threshold: "-0.5 dB GR", Release: "auto slow", Lookahead: "10 ms", Style: "transparent" },
        prompt:
          'Create "Dynamic Master Limiter" for orchestral and cinematic AI material — almost nothing but safety. Controls: Amount (0.0 default), Ceiling, Threshold, Release, Lookahead, Style. Preset: ceiling -1.5 dBTP, 10 ms lookahead, slow auto release, 0.5 dB GR ceiling.',
      },
      {
        name: "Rap Vocal Loud Front",
        params: { Amount: 64, Ceiling: "-1 dBTP", Threshold: "-5 dB GR", Release: "50 ms", Lookahead: "1 ms", Style: "aggressive" },
        prompt:
          'Make "Vocal Front" — an aggressive limiter that pushes a rap vocal into the front of the mix. Controls: Amount (starts 0.0), Ceiling, Threshold, Release, Lookahead, Mix. Preset: ceiling -1 dBTP, 50 ms release, 5 dB GR on the loudest bars, with a Mix knob so I can parallel-limit 60%.',
      },
      {
        name: "Guitar Amp Safety",
        params: { Amount: 45, Ceiling: "-6 dBFS", Threshold: "-3 dB GR", Release: "80 ms", Lookahead: "2 ms", Style: "punchy" },
        prompt:
          'Build "Amp Safety" — a limiter before an amp/distortion stage so spikes do not make the distortion fart out. Controls: Amount (0.0 default), Ceiling, Threshold, Release, Lookahead. Preset: ceiling -6 dBFS (headroom into the drive), 2 ms lookahead, 80 ms release.',
      },
    ],
  },
];
