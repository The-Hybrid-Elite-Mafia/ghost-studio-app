import type { Plugin } from "../types";

export const toneA: Plugin[] = [
  {
    id: "distortion",
    name: "Distortion",
    kind: "Built-in",
    category: "Tone & Drive",
    icon: "🔥",
    target: "Anything that needs grit",
    oneLiner:
      "Factory drive with drive, fold, asymmetry and mix — from gentle saturation to wavefolding destruction.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Drive", value: "0.0" },
      { name: "Fold", value: "0.0" },
      { name: "Asymmetry", value: "0.0" },
      { name: "Mix", value: "100% dry" },
      { name: "Output", value: "0.0 dB" },
    ],
    tip: "Push Drive for saturation, Fold for harsher harmonic textures, and blend with Mix — parallel distortion almost always beats full-wet. On a bass stem, drive 0.2 with mix 40% adds the top end that makes an 808 audible on phones.",
    presets: [
      {
        name: "Gentle Vocal Grit",
        params: { Amount: 34, Drive: "0.2", Fold: "0.0", Asymmetry: "0.2", Mix: "45%" },
        prompt:
          'Build "Vocal Grit" — a distortion with drive, fold, asymmetry and mix for a touch of vocal edge. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, Tone LPF, Mix. Preset "Gentle Vocal Grit": drive 0.2, fold 0, asymmetry 0.2, mix 45% (parallel), Amount 34.',
      },
      {
        name: "Guitar Crunch",
        params: { Amount: 56, Drive: "0.55", Fold: "0.1", Asymmetry: "0.4", Tone: "LPF 6.5 kHz" },
        prompt:
          'Make "Crunch" — a medium-gain guitar distortion. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, Tone LPF, HPF, Mix. Preset: drive 0.55, fold 0.1, asymmetry 0.4, tone LPF 6.5 kHz, HPF 100 Hz.',
      },
      {
        name: "Full Metal Rip",
        params: { Amount: 78, Drive: "0.9", Fold: "0.5", Asymmetry: "0.5", Tone: "HPF 120 / LPF 8k" },
        prompt:
          'Create "Metal Rip" — a high-gain distortion for heavy rhythm guitars and metal. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, HPF, LPF, Mix. Preset: drive 0.9, fold 0.5, asymmetry 0.5, HPF 120 Hz, LPF 8 kHz.',
      },
      {
        name: "808 Harmonic Top",
        params: { Amount: 44, Drive: "0.3", Fold: "0.0", Asymmetry: "0.35", Band: "300 Hz–4 kHz", Mix: "40%" },
        prompt:
          'Build "808 Top" — a band-limited distortion that adds harmonics to a sub so it reads on small speakers. Controls: Amount (0.0 default), Drive, Asymmetry, Band edges, Mix. Preset: drive 0.3, asymmetry 0.35, band 300 Hz–4 kHz, 40% mix.',
      },
      {
        name: "Drum Bus Fat Mode",
        params: { Amount: 48, Drive: "0.4", Fold: "0.05", Asymmetry: "0.3", Mix: "35%", "Sidechain HPF": "150 Hz" },
        prompt:
          'Make "Drum Fat" — a parallel distortion on the drum bus with a sidechain HPF so only the mids distort. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, Mix, Sidechain HPF. Preset: drive 0.4, asymmetry 0.3, mix 35%, detector HPF 150 Hz.',
      },
      {
        name: "Lo-Fi Wavefold Destroy",
        params: { Amount: 82, Drive: "0.7", Fold: "0.85", Asymmetry: "0.6", Mix: "70%", LPF: "7 kHz" },
        prompt:
          'Create "Wavefold" — an aggressive fold-based distortion for lo-fi and glitch destruction. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, LPF, Mix. Preset: drive 0.7, fold 0.85, asymmetry 0.6, LPF 7 kHz, 70% mix.',
      },
      {
        name: "Vocal Throw Telephone Growl",
        params: { Amount: 70, Drive: "0.65", Fold: "0.3", Asymmetry: "0.5", Band: "500 Hz–3.2 kHz", Mix: "100%" },
        prompt:
          'Build "Phone Growl" — a band-limited driven distortion for lo-fi vocal throws. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, Band edges, Mix. Preset: drive 0.65, fold 0.3, band 500 Hz–3.2 kHz, mix 100%.',
      },
      {
        name: "Synth Bass Growl",
        params: { Amount: 60, Drive: "0.6", Fold: "0.25", Asymmetry: "0.45", Mix: "50%", "Mono-below": "100 Hz" },
        prompt:
          'Make "Bass Growl" — a distortion for synth bass with a mono sub path. Controls: Amount (0.0 default), Drive, Fold, Asymmetry, Mono-below, Mix. Preset: drive 0.6, fold 0.25, asymmetry 0.45, mono below 100 Hz, 50% mix.',
      },
    ],
  },
  {
    id: "tape-saturation",
    name: "Tape Saturation",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "🎞️",
    target: "Vocals, drums, master",
    oneLiner:
      "Soft-clip tape model with bias, compression, wow/flutter and age. Glue and warmth without obvious distortion.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Drive", value: "0.0" },
      { name: "Bias", value: "0.0" },
      { name: "Compression", value: "0.0" },
      { name: "Wow / Flutter", value: "0.0" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Tape on the master bus is the friendliest way to make AI material feel recorded rather than generated. Bias low for warmth, high for brightness; keep drive under 0.3 on a full mix.",
    presets: [
      {
        name: "Master Bus Warmth",
        params: { Amount: 30, Drive: "0.22", Bias: "0.3", Compression: "0.2", Wow: "0.05", Mix: "100%" },
        prompt:
          'Build "Tape Warmth" — a tape saturation model with drive, bias, compression, wow/flutter and mix. Controls: Amount (0.0 default), Drive, Bias, Compression, Wow rate, Wow depth, Mix. Preset "Master Bus Warmth": drive 0.22, bias 0.3, compression 0.2, wow depth 0.05, full wet, Amount 30.',
      },
      {
        name: "Vocal Tape Smooth",
        params: { Amount: 42, Drive: "0.3", Bias: "0.2", Compression: "0.35", "HF Soften": "-1.5 dB @ 9 kHz" },
        prompt:
          'Make "Vocal Tape" — a tape stage that smooths digital edges on a lead vocal. Controls: Amount (0.0 default), Drive, Bias, Compression, HF soften, Mix. Preset: drive 0.3, bias 0.2, compression 0.35, HF soften -1.5 dB at 9 kHz.',
      },
      {
        name: "Drum Bus Tape Punch",
        params: { Amount: 50, Drive: "0.45", Bias: "0.5", Compression: "0.4", "Transient Lift": "+2 dB" },
        prompt:
          'Create "Drum Tape" — a tape stage for the kit bus that lifts transients while softening the top. Controls: Amount (0.0 default), Drive, Bias, Compression, Transient lift, Mix. Preset: drive 0.45, bias 0.5, compression 0.4, transient lift +2 dB.',
      },
      {
        name: "Lo-Fi Tape Age",
        params: { Amount: 66, Drive: "0.5", Age: "0.8", Wow: "0.35", "HF Rolloff": "7 kHz", Hiss: "0.25" },
        prompt:
          'Build "Aged Tape" — an old, worn tape emulation with rolloff, wow and hiss. Controls: Amount (0.0 default), Drive, Age, Wow depth, HF rolloff, Hiss, Mix. Preset: drive 0.5, age 0.8, wow 0.35, rolloff 7 kHz, hiss 0.25.',
      },
      {
        name: "Bass Saturation (Small-Speaker Fix)",
        params: { Amount: 54, Drive: "0.5", Bias: "0.4", Band: "250 Hz–3 kHz", Mix: "50%" },
        prompt:
          'Make "Bass Sat" — a band-limited tape stage that adds 250 Hz–3 kHz harmonics so bass translates on phones. Controls: Amount (0.0 default), Drive, Bias, Band edges, Mix. Preset: drive 0.5, bias 0.4, band 250 Hz–3 kHz, 50% mix.',
      },
      {
        name: "Guitar Amp-in-a-Box Warm",
        params: { Amount: 58, Drive: "0.55", Bias: "0.6", Compression: "0.5", Tone: "LPF 6 kHz" },
        prompt:
          'Create "Tape Amp" — a tape-driven warm overdrive for guitar and keys. Controls: Amount (0.0 default), Drive, Bias, Compression, Tone, Mix. Preset: drive 0.55, bias 0.6, compression 0.5, tone LPF 6 kHz.',
      },
      {
        name: "Shimmer Disguise (Tape Dark)",
        params: { Amount: 52, Drive: "0.35", Bias: "0.15", "HF Rolloff": "9 kHz", Compression: "0.3" },
        prompt:
          'Make "Tape Dark" — a tape stage tuned to hide AI shimmer: soft HF rolloff plus compression so glassy highs lose their edge. Controls: Amount (0.0 default), Drive, Bias, HF rolloff, Compression, Mix. Preset: drive 0.35, bias 0.15, rolloff 9 kHz, compression 0.3.',
      },
      {
        name: "Cinematic Tape Bloom",
        params: { Amount: 46, Drive: "0.4", Compression: "0.55", "Attack": "slow", Release: "1 s", Wow: "0.1" },
        prompt:
          'Build "Tape Bloom" — a slow-attack tape compressor stage for cinematic material that swells into loud passages. Controls: Amount (0.0 default), Drive, Compression, Attack, Release, Wow, Mix. Preset: drive 0.4, compression 0.55, slow attack, 1 s release, wow 0.1.',
      },
    ],
  },
  {
    id: "tube-warmth",
    name: "Tube Warmth",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "💡",
    target: "Vocals, bass, keys, master",
    oneLiner:
      "Even-harmonic valve model with bias, sag and a presence tilt. The most forgiving colour you can add.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Drive", value: "0.0" },
      { name: "Bias", value: "0.0" },
      { name: "Sag", value: "0.0" },
      { name: "Presence", value: "0.0 dB" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Tube harmonics are 2nd-order (musical) rather than 3rd-order (harsh), which makes them the right choice for AI vocals that already sound slightly edgy. Push drive, then pull presence to compensate.",
    presets: [
      {
        name: "Vocal Valve Warm",
        params: { Amount: 40, Drive: "0.3", Bias: "0.4", Sag: "0.2", Presence: "-1 dB", Mix: "70%" },
        prompt:
          'Build "Valve Warm" — a tube saturation model with drive, bias, sag and presence. Controls: Amount (0.0 default), Drive, Bias, Sag, Presence, Mix. Preset "Vocal Valve Warm": drive 0.3, bias 0.4, sag 0.2, presence -1 dB, 70% mix.',
      },
      {
        name: "Bass Tube Thickness",
        params: { Amount: 52, Drive: "0.45", Bias: "0.5", Sag: "0.35", "Low Boost": "+1.5 dB @ 90 Hz" },
        prompt:
          'Make "Tube Bass" — a tube stage for bass and 808 that adds girth and a little growl. Controls: Amount (0.0 default), Drive, Bias, Sag, Low boost, Mix. Preset: drive 0.45, bias 0.5, sag 0.35, +1.5 dB at 90 Hz.',
      },
      {
        name: "Keys / Rhodes Glow",
        params: { Amount: 38, Drive: "0.25", Bias: "0.35", Sag: "0.15", Tone: "LPF 9 kHz" },
        prompt:
          'Create "Keys Glow" — a light tube stage for electric piano, organ and clav. Controls: Amount (0.0 default), Drive, Bias, Sag, Tone, Mix. Preset: drive 0.25, bias 0.35, sag 0.15, tone LPF 9 kHz.',
      },
      {
        name: "Crunchy Rock Vocal",
        params: { Amount: 60, Drive: "0.6", Bias: "0.3", Sag: "0.4", Presence: "+1.5 dB @ 4 kHz" },
        prompt:
          'Build "Rock Vocal Drive" — a harder tube drive for indie and rock lead vocals. Controls: Amount (0.0 default), Drive, Bias, Sag, Presence, Mix. Preset: drive 0.6, bias 0.3, sag 0.4, presence +1.5 dB at 4 kHz, 60% mix.',
      },
      {
        name: "Master Valve Glue",
        params: { Amount: 26, Drive: "0.18", Bias: "0.3", Sag: "0.15", Mix: "100%" },
        prompt:
          'Make "Master Valve" — a very light tube stage for the master bus. Controls: Amount (0.0 default), Drive, Bias, Sag, Presence, Mix, auto gain match. Preset: drive 0.18, bias 0.3, sag 0.15, full wet, Amount 26.',
      },
      {
        name: "Overdriven Harmonica / Blues Vocal",
        params: { Amount: 72, Drive: "0.8", Bias: "0.25", Sag: "0.5", Band: "300 Hz–6 kHz" },
        prompt:
          'Create "Blues Drive" — an overdriven tube stage band-limited for gritty vocals and harmonica. Controls: Amount (0.0 default), Drive, Bias, Sag, Band edges, Mix. Preset: drive 0.8, bias 0.25, sag 0.5, band 300 Hz–6 kHz, 80% mix.',
      },
      {
        name: "Soft Clip Safety (Sag Only)",
        params: { Amount: 34, Drive: "0.1", Sag: "0.6", "Ceiling": "-1 dBTP", Mix: "100%" },
        prompt:
          'Build "Sag Guard" — a tube model used only for its soft-clip behaviour: catches peaks gently instead of hard limiting. Controls: Amount (0.0 default), Drive, Sag, Ceiling, Mix. Preset: drive 0.1, sag 0.6, ceiling -1 dBTP, full wet.',
      },
      {
        name: "Harmonic Humaniser",
        params: { Amount: 46, Drive: "0.32", Bias: "drift", "Harmonic Drift": "on", Sag: "0.25" },
        prompt:
          'Make "Harmonic Humaniser" — a tube stage whose bias slowly drifts, breaking the perfect regularity of AI harmonics. Controls: Amount (0.0 default), Drive, Bias, Harmonic drift rate, Sag, Mix. Preset: drive 0.32, drift rate 0.05 Hz, sag 0.25, 60% mix.',
      },
    ],
  },
  {
    id: "bitcrusher",
    name: "Bitcrusher / Sample Reducer",
    kind: "Chat-built",
    category: "Tone & Drive",
    icon: "🕹️",
    target: "Drums, vocals FX, lo-fi, glitch",
    oneLiner:
      "Bit depth and sample-rate reduction with filter compensation and mix — digital decay on demand.",
    defaults: [
      { name: "Amount", value: 0.0 },
      { name: "Bit Depth", value: "24 (off)" },
      { name: "Sample Rate", value: "48 kHz (off)" },
      { name: "Noise", value: "0.0" },
      { name: "Mix", value: "100% dry" },
    ],
    tip: "Bit crushing also masks AI artifacts — a 12-bit drum loop reads as 'sampled from an old record'. Keep the crush band-limited (LPF 8–10 kHz) so it does not turn into white noise.",
    presets: [
      {
        name: "12-Bit Sampler Drums",
        params: { Amount: 48, "Bit Depth": "12", "Sample Rate": "22 kHz", LPF: "9 kHz", Mix: "80%" },
        prompt:
          'Build "12-Bit Sampler" — a bitcrusher with bit depth, sample rate, LPF and mix, tuned to sound like a vintage sampler. Controls: Amount (0.0 default), Bit depth, Sample rate, LPF, Drive, Mix. Preset "12-Bit Sampler Drums": 12-bit, 22 kHz, LPF 9 kHz, drive 0.2, 80% mix.',
      },
      {
        name: "8-Bit Console Chip",
        params: { Amount: 66, "Bit Depth": "8", "Sample Rate": "16 kHz", Drive: "0.3", Mix: "100%" },
        prompt:
          'Make "Chip Tune" — an 8-bit crush for chiptune and game-style textures. Controls: Amount (0.0 default), Bit depth, Sample rate, Drive, Mix. Preset: 8-bit, 16 kHz, drive 0.3, 100% mix.',
      },
      {
        name: "Subtle Digital Grit",
        params: { Amount: 30, "Bit Depth": "16", "Sample Rate": "32 kHz", Mix: "40%" },
        prompt:
          'Create "Digital Grit" — a barely-there crush for adding slight digital edge to clean material. Controls: Amount (0.0 default), Bit depth, Sample rate, Mix. Preset: 16-bit, 32 kHz, 40% mix.',
      },
      {
        name: "Vocal Telephone Crush",
        params: { Amount: 58, "Bit Depth": "10", "Sample Rate": "11 kHz", Band: "500 Hz–3 kHz", Mix: "100%" },
        prompt:
          'Build "Phone Crush" — a band-limited bitcrush for telephone-style vocal throws. Controls: Amount (0.0 default), Bit depth, Sample rate, Band edges, Mix. Preset: 10-bit, 11 kHz, band 500 Hz–3 kHz, 100% mix.',
      },
      {
        name: "Glitch Dropouts",
        params: { Amount: 70, "Bit Depth": "random", "Rate Mod": "1/16", Random: "on", Mix: "60%" },
        prompt:
          'Make "Glitch Crush" — a randomly modulated bitcrusher for glitch dropouts and digital errors. Controls: Amount (0.0 default), Bit depth, Rate mod, Randomise, Hold, Mix. Preset: random bit depth, 1/16 rate modulation, 60% mix.',
      },
      {
        name: "Downsampled Rave Stab",
        params: { Amount: 62, "Bit Depth": "11", "Sample Rate": "14 kHz", Drive: "0.5", "Wet HPF": "200 Hz" },
        prompt:
          'Create "Rave Stab" — a crushed, driven band-limited effect for rave stabs and hoover sounds. Controls: Amount (0.0 default), Bit depth, Sample rate, Drive, Wet HPF, Mix. Preset: 11-bit, 14 kHz, drive 0.5, wet HPF 200 Hz, 100% mix.',
      },
      {
        name: "Quantised Vocal Robot",
        params: { Amount: 64, "Bit Depth": "7", "Sample Rate": "8 kHz", "Formant Hold": "on", Mix: "100%" },
        prompt:
          'Build "Robot Crush" — a heavy crush with formant hold so a robotic vocal stays intelligible. Controls: Amount (0.0 default), Bit depth, Sample rate, Formant hold, Mix. Preset: 7-bit, 8 kHz, formant hold on, 100% mix.',
      },
      {
        name: "Nyquist Aliaser (Creative)",
        params: { Amount: 74, "Sample Rate": "6 kHz", "Anti-Alias": "off", LPF: "12 kHz", Mix: "50%" },
        prompt:
          'Make "Aliaser" — a downsampled effect with anti-aliasing deliberately off so it produces musical fold-back. Controls: Amount (0.0 default), Sample rate, Anti-alias on/off, LPF, Mix. Preset: 6 kHz, anti-alias off, LPF 12 kHz, 50% mix.',
      },
    ],
  },
];
