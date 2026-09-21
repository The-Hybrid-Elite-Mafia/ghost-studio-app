import type { Plugin } from "../types";

export const spaceA: Plugin[] = [
  {
    id: "reverb",
    name: "Reverb",
    kind: "Built-in",
    category: "Space",
    icon: "🏛️",
    target: "Vocals, drums, anything that needs a room",
    oneLiner:
      "Factory algorithmic reverb: size, decay, dampening, pre-delay, mix. Synthetic space with full control.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Size", value: "0.0 (smallest)" },
      { name: "Decay", value: "0.0 s" },
      { name: "Dampening", value: "0.0" },
      { name: "Pre-delay", value: "0.0 ms" },
    ],
    tip: "Reverb on 2–3 tracks max — never on kick, bass or 808. Pre-delay of 20–40 ms keeps the vocal in front of its own reverb, and dampening (rolling off the tail's top end) is what stops AI vocal reverb sounding glassy.",
    presets: [
      {
        name: "Pop Vocal Plate",
        params: { Amount: 42, Mix: "22% wet", Size: "plate", Decay: "1.8 s", "Pre-delay": "28 ms", Dampening: "6 kHz" },
        prompt:
          'Build "Pop Plate" — a reverb preset for a lead vocal. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, HPF/LPF on the wet signal. Preset "Pop Vocal Plate": plate character, 1.8 s decay, 28 ms pre-delay, dampening at 6 kHz, wet HPF 200 Hz so the tail never gets muddy.',
      },
      {
        name: "Dry Room / Intimate",
        params: { Amount: 26, Mix: "10% wet", Size: "small room", Decay: "0.4 s", "Pre-delay": "8 ms", Dampening: "5 kHz" },
        prompt:
          'Make "Dry Room" — a tiny, dark room reverb that keeps a vocal close and personal. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening. Preset: small room, 0.4 s decay, 8 ms pre-delay, dampening 5 kHz, 10% wet.',
      },
      {
        name: "Drum Room Glue",
        params: { Amount: 48, Mix: "18% wet", Size: "medium room", Decay: "1.1 s", "Pre-delay": "0 ms", Dampening: "4 kHz" },
        prompt:
          'Create "Drum Room" — a room reverb for the kit bus that adds real-space depth. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, sidechain HPF. Preset: medium room, 1.1 s decay, 0 ms pre-delay, dampening 4 kHz, 18% wet.',
      },
      {
        name: "Hall / Cinematic",
        params: { Amount: 60, Mix: "35% wet", Size: "large hall", Decay: "3.4 s", "Pre-delay": "45 ms", Dampening: "7 kHz" },
        prompt:
          'Build "Concert Hall" — a large hall reverb for cinematic and orchestral AI material. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, Stereo width. Preset: large hall, 3.4 s decay, 45 ms pre-delay, dampening 7 kHz, wide stereo.',
      },
      {
        name: "Ambient Infinite Wash",
        params: { Amount: 72, Mix: "60% wet", Size: "infinite", Decay: "12 s", "Pre-delay": "60 ms", Dampening: "8 kHz" },
        prompt:
          'Make "Infinite Wash" — a long ambient reverb that never quite dies, for pads and ambient beds. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, Freeze. Preset: infinite size, 12 s decay, 60 ms pre-delay, 60% wet, optional freeze button.',
      },
      {
        name: "Snare Big 80s",
        params: { Amount: 66, Mix: "40% wet", Size: "large plate", Decay: "2.2 s", "Pre-delay": "15 ms", Dampening: "9 kHz" },
        prompt:
          'Create "80s Snare" — a big bright plate snare reverb with a short pre-delay so it slams. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, Diffusion. Preset: large plate, 2.2 s decay, 15 ms pre-delay, dampening 9 kHz (bright), high diffusion.',
      },
      {
        name: "Ambience for Separated Stems",
        params: { Amount: 36, Mix: "12% wet", Size: "matching room", Decay: "0.9 s", "Pre-delay": "12 ms", Dampening: "5.5 kHz" },
        prompt:
          'Build "Stem Ambience" — a room reverb to give back the space that stem separation stripped out, matched across all stems. Controls: Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, Link group. Preset: 0.9 s decay, 12 ms pre-delay, dampening 5.5 kHz, link group "main" so every stem instance shares settings.',
      },
      {
        name: "Reverse Reverb Throw",
        params: { Amount: 58, Mix: "50% wet", Mode: "reverse", Decay: "2.5 s", "Pre-delay": "0 ms", Length: "1 bar" },
        prompt:
          'Make "Reverse Swell" — a reverse reverb that blooms into the next section. Controls: Amount (0.0 default), Mode, Decay, Length in bars, Mix, Dampening. Preset: reverse mode, 2.5 s decay, 1 bar length, 50% wet.',
      },
      {
        name: "Ear Candy Shimmer Tail",
        params: { Amount: 64, Mix: "45% wet", Decay: "5 s", Pitch: "+12 st", Dampening: "10 kHz", Regen: "55%" },
        prompt:
          'Create "Shimmer Tail" — a reverb with a pitch-shifted (+12 semitone) regeneration loop for ethereal vocal and pad tails. Controls: Amount (0.0 default), Decay, Pitch shift, Regeneration, Dampening, Mix. Preset: 5 s decay, +12 st, 55% regeneration, 45% wet.',
      },
    ],
  },
  {
    id: "convolution",
    name: "Convolution Reverb (IR)",
    kind: "Built-in",
    category: "Space",
    icon: "🏟️",
    target: "Anything that needs a real space",
    oneLiner:
      "Factory impulse-response reverb — loads a sampled acoustic fingerprint of a real room, hall, plate or cab.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "IR", value: "none" },
      { name: "Decay trim", value: "0.0 %" },
      { name: "Dampening", value: "0.0" },
      { name: "Pre-delay", value: "0.0 ms" },
    ],
    tip: "Convolution is the most transparent way to re-space AI material — and the best place to hide Suno's baked-in reverb. Pick an IR shorter than the reverb you are replacing, dry the source with Remove Effects first, then convolve.",
    presets: [
      {
        name: "Vocal Booth (dry-ish)",
        params: { Amount: 30, Mix: "8% wet", IR: "small vocal booth", "Decay trim": "-40%", "Pre-delay": "6 ms" },
        prompt:
          'Build "Vocal Booth" — a convolution preset using a small vocal-booth impulse response. Controls: Amount (0.0 default), IR selection, Mix, Decay trim, Pre-delay, Dampening, Wet EQ. Preset "Vocal Booth (dry-ish)": booth IR, decay trimmed -40%, 6 ms pre-delay, 8% wet, wet LPF 8 kHz.',
      },
      {
        name: "Live Room (band feel)",
        params: { Amount: 44, Mix: "16% wet", IR: "live tracking room", "Decay trim": "-10%", "Pre-delay": "10 ms" },
        prompt:
          'Make "Live Room" — a convolution reverb from a live tracking room IR so separated stems feel like they were played together. Controls: Amount (0.0 default), IR, Mix, Decay trim, Pre-delay, Dampening. Preset: tracking-room IR, -10% decay trim, 10 ms pre-delay, 16% wet.',
      },
      {
        name: "Church / Cathedral",
        params: { Amount: 62, Mix: "38% wet", IR: "stone cathedral", "Decay trim": "0%", "Pre-delay": "40 ms" },
        prompt:
          'Create "Cathedral" — a convolution reverb from a stone cathedral IR for cinematic vocals and choirs. Controls: Amount (0.0 default), IR, Mix, Decay trim, Pre-delay, Dampening, Wet HPF. Preset: cathedral IR, 40 ms pre-delay, 38% wet, wet HPF 180 Hz.',
      },
      {
        name: "Vintage Plate IR",
        params: { Amount: 48, Mix: "24% wet", IR: "EMT-style plate", "Decay trim": "-15%", "Pre-delay": "24 ms" },
        prompt:
          'Build "Plate IR" — convolution using an EMT-140-style plate impulse response. Controls: Amount (0.0 default), IR, Mix, Decay trim, Pre-delay, Dampening. Preset: plate IR, -15% decay trim, 24 ms pre-delay, 24% wet, slight dampening above 9 kHz.',
      },
      {
        name: "Spring Tank IR",
        params: { Amount: 54, Mix: "30% wet", IR: "guitar amp spring", "Decay trim": "0%", Drive: "0.2" },
        prompt:
          'Make "Spring Tank" — convolution from an amp spring-tank IR with a little drive. Controls: Amount (0.0 default), IR, Mix, Drive, Decay trim, Dampening. Preset: spring IR, 30% wet, drive 0.2.',
      },
      {
        name: "Stairwell Slap",
        params: { Amount: 56, Mix: "28% wet", IR: "concrete stairwell", "Decay trim": "-25%", "Pre-delay": "2 ms" },
        prompt:
          'Create "Stairwell" — a short concrete-stairwell IR for that slap-back concrete slap on vocals and snares. Controls: Amount (0.0 default), IR, Mix, Decay trim, Pre-delay, Dampening. Preset: stairwell IR, -25% decay trim, 2 ms pre-delay, 28% wet.',
      },
      {
        name: "Custom IR from My Audio",
        params: { Amount: 50, IR: "capture from clip", Mix: "25% wet", "Decay trim": "auto" },
        prompt:
          'Build "IR Capture" — a convolution reverb that can load any audio clip in my project as an impulse response, with automatic length trimming and normalisation. Controls: Amount (0.0 default), IR source clip, Trim, Normalise, Mix, Pre-delay. Preset "Custom IR from My Audio": capture the last 2 s of the room-tone clip, normalise, decay trim auto, 25% wet.',
      },
      {
        name: "Cab / Speaker IR Loader",
        params: { Amount: 64, IR: "guitar cab 4x12", Mix: "100% wet", Mic: "57 off-axis" },
        prompt:
          'Make "Cab IR" — a convolution loader for guitar-cabinet impulse responses so a DI or amp-sim stem gets a real speaker. Controls: Amount (0.0 default), IR, Mic position, Mix, HPF, LPF, Phase. Preset: 4x12 cab IR, 57 off-axis, 100% wet, LPF 7 kHz, HPF 90 Hz.',
      },
    ],
  },
  {
    id: "plate-reverb",
    name: "Vintage Plate Emulator",
    kind: "Chat-built",
    category: "Space",
    icon: "🪩",
    target: "Vocals, snare, anything lead",
    oneLiner:
      "Dense, bright, fast-attack plate model with separate bloom and diffusion controls — the classic lead-vocal space.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Decay", value: "0.0 s" },
      { name: "Diffusion", value: "0.0" },
      { name: "Dampening", value: "0.0" },
    ],
    tip: "A plate is the safest reverb for an AI vocal: its density masks small pitch wobbles and its brightness lifts the voice forward instead of pushing it away.",
    presets: [
      {
        name: "Lead Vocal Plate 1.8s",
        params: { Amount: 44, Mix: "22%", Decay: "1.8 s", Diffusion: "0.8", Dampening: "6.5 kHz", "Wet HPF": "220 Hz" },
        prompt:
          'Build "Plate 1.8" — a vintage plate emulator with Bloom and Diffusion controls. Controls: Amount (0.0 default), Decay, Diffusion, Bloom, Dampening, Wet HPF/LPF, Mix. Preset "Lead Vocal Plate 1.8s": 1.8 s decay, diffusion 0.8, bloom slow, dampening 6.5 kHz, wet HPF 220 Hz, 22% wet.',
      },
      {
        name: "Short Plate 0.9s (Thickener)",
        params: { Amount: 38, Mix: "18%", Decay: "0.9 s", Diffusion: "0.9", Dampening: "5 kHz", "Wet HPF": "300 Hz" },
        prompt:
          'Make "Short Plate" — a sub-second plate used as a thickener rather than a space. Controls: Amount (0.0 default), Decay, Diffusion, Dampening, Wet HPF, Mix. Preset: 0.9 s, diffusion 0.9, dampening 5 kHz, wet HPF 300 Hz, 18% wet.',
      },
      {
        name: "Bright Snare Plate",
        params: { Amount: 62, Mix: "35%", Decay: "1.4 s", Diffusion: "1.0", Dampening: "10 kHz", "Pre-delay": "12 ms" },
        prompt:
          'Create "Snare Plate" — a bright, dense, short pre-delay plate for snare. Controls: Amount (0.0 default), Decay, Diffusion, Pre-delay, Dampening, Mix. Preset: 1.4 s, diffusion 1.0, 12 ms pre-delay, dampening 10 kHz, 35% wet.',
      },
      {
        name: "Dark Plate (Ballad)",
        params: { Amount: 40, Mix: "26%", Decay: "2.6 s", Diffusion: "0.7", Dampening: "4.5 kHz", "Wet HPF": "260 Hz" },
        prompt:
          'Build "Dark Plate" — a longer, darker plate for ballads that hides sibilance and shimmer. Controls: Amount (0.0 default), Decay, Diffusion, Dampening, Wet HPF, Mix, Mod depth. Preset: 2.6 s, diffusion 0.7, dampening 4.5 kHz, wet HPF 260 Hz, mod depth low.',
      },
      {
        name: "Wide Stereo Plate",
        params: { Amount: 50, Mix: "30%", Decay: "2 s", Width: "140%", Decorrelation: "on", Diffusion: "0.85" },
        prompt:
          'Make "Wide Plate" — a plate with decorrelated left/right decay for a huge stereo image that stays mono-compatible. Controls: Amount (0.0 default), Decay, Width, Decorrelation, Diffusion, Mix. Preset: 2 s decay, width 140%, decorrelation on, 30% wet.',
      },
      {
        name: "Plate with Duck (Vocal Clears Itself)",
        params: { Amount: 54, Mix: "34%", Decay: "2.2 s", Duck: "-6 dB", Release: "400 ms", Trigger: "dry vocal" },
        prompt:
          'Create "Ducked Plate" — a plate reverb that ducks while the vocal is singing and blooms in the gaps. Controls: Amount (0.0 default), Decay, Duck depth, Duck release, Trigger source, Mix. Preset: 2.2 s decay, -6 dB duck, 400 ms release, triggered by the dry vocal, 34% wet.',
      },
      {
        name: "Plate on Stems (Matched)",
        params: { Amount: 42, Mix: "20%", Decay: "1.6 s", Diffusion: "0.8", Link: "all instances" },
        prompt:
          'Build "Linked Plate" — a plate whose settings link across every instance so all separated stems share one acoustic space. Controls: Amount (0.0 default), Decay, Diffusion, Dampening, Link group, Mix. Preset: 1.6 s decay, diffusion 0.8, link group "main", 20% wet.',
      },
      {
        name: "Lo-Fi Plate (Band-Limited)",
        params: { Amount: 56, Mix: "40%", Decay: "1.5 s", "Wet HPF": "400 Hz", "Wet LPF": "5.5 kHz", Noise: "0.2" },
        prompt:
          'Make "Lo-Fi Plate" — a band-limited plate with a hint of noise for vintage-sounding vocal throws. Controls: Amount (0.0 default), Decay, Wet HPF, Wet LPF, Noise, Drive, Mix. Preset: 1.5 s, 400 Hz–5.5 kHz, noise 0.2, drive 0.25, 40% wet.',
      },
    ],
  },
  {
    id: "spring-reverb",
    name: "Spring Reverb",
    kind: "Chat-built",
    category: "Space",
    icon: "🌀",
    target: "Guitar, dub, surf, lo-fi",
    oneLiner:
      "Boingy mechanical spring model with drive, tank size and drip. Character, not realism.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Mix", value: "0.0% wet" },
      { name: "Tank", value: "0.0 (short)" },
      { name: "Drive", value: "0.0" },
      { name: "Drip", value: "0.0" },
    ],
    tip: "Springs are an AI-artifact disguise: their metallic character makes generated vocals sound like a stylistic choice instead of an error.",
    presets: [
      {
        name: "Surf Guitar Spring",
        params: { Amount: 60, Mix: "35%", Tank: "long", Drive: "0.35", Drip: "0.7", Decay: "2.4 s" },
        prompt:
          'Build "Surf Spring" — a long-tank spring reverb with strong drip for surf and rockabilly guitar. Controls: Amount (0.0 default), Tank size, Drive, Drip, Decay, Mix, wet LPF. Preset "Surf Guitar Spring": long tank, drive 0.35, drip 0.7, 2.4 s decay, 35% wet.',
      },
      {
        name: "Dub Vocal Spring Throw",
        params: { Amount: 66, Mix: "45%", Tank: "medium", Drive: "0.5", Drip: "0.5", "Wet LPF": "4.5 kHz" },
        prompt:
          'Make "Dub Spring" — a driven spring for dub-style vocal throws, band-limited wet. Controls: Amount (0.0 default), Tank, Drive, Drip, Wet LPF, Mix, Feedback. Preset: medium tank, drive 0.5, drip 0.5, wet LPF 4.5 kHz, 45% wet.',
      },
      {
        name: "Lo-Fi Bedroom Spring",
        params: { Amount: 48, Mix: "26%", Tank: "short", Drive: "0.25", Drip: "0.9", Noise: "0.3" },
        prompt:
          'Create "Bedroom Spring" — a short, drippy, noisy spring for lo-fi bedroom pop. Controls: Amount (0.0 default), Tank, Drive, Drip, Noise, Mix. Preset: short tank, drive 0.25, drip 0.9, noise 0.3, 26% wet.',
      },
      {
        name: "Amp-Style Spring (pre-cab)",
        params: { Amount: 44, Mix: "22%", Tank: "short", Drive: "0.6", Position: "pre-cab" },
        prompt:
          'Build "Amp Spring" — a spring placed before a cab IR so it breaks up like a real amp verb. Controls: Amount (0.0 default), Tank, Drive, Position, Mix. Preset: short tank, drive 0.6, position pre-cab, 22% wet.',
      },
      {
        name: "Retro Keyboard / Organ",
        params: { Amount: 50, Mix: "28%", Tank: "medium", Drive: "0.2", Drip: "0.6" },
        prompt:
          'Make "Organ Spring" — a medium spring for electric piano and organ, subtle and warm. Controls: Amount (0.0 default), Tank, Drive, Drip, Decay, Mix. Preset: medium tank, drive 0.2, drip 0.6, 28% wet.',
      },
      {
        name: "Percussive Slap Spring",
        params: { Amount: 58, Mix: "30%", Tank: "short", Decay: "0.7 s", Drip: "0.8", Drive: "0.3" },
        prompt:
          'Create "Slap Spring" — a very short, bright spring that behaves like a slapback on snares and percussion. Controls: Amount (0.0 default), Tank, Decay, Drip, Drive, Mix. Preset: short tank, 0.7 s decay, drip 0.8, drive 0.3, 30% wet.',
      },
      {
        name: "Psych Infinite Spring",
        params: { Amount: 70, Mix: "55%", Tank: "long", Feedback: "0.6", Drive: "0.45", Decay: "6 s" },
        prompt:
          'Build "Psych Spring" — a self-oscillating spring with feedback for psychedelic washes. Controls: Amount (0.0 default), Tank, Feedback, Drive, Decay, Dampening, Mix, Freeze. Preset: long tank, feedback 0.6, drive 0.45, 6 s decay, 55% wet.',
      },
      {
        name: "Spring on Whole Mix (Subtle)",
        params: { Amount: 28, Mix: "8%", Tank: "short", Drive: "0.15", Drip: "0.3" },
        prompt:
          'Make "Mix Spring" — a barely audible spring on the master for a vintage live-off-the-floor feel. Controls: Amount (0.0 default), Tank, Drive, Drip, Mix. Preset: short tank, drive 0.15, drip 0.3, 8% wet.',
      },
    ],
  },
];
