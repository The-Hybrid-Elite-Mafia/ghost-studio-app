export type Kind = "Built-in" | "Chat-built";

export interface ParamSpec {
  name: string;
  value: number | string;
}

export interface Preset {
  name: string;
  params: Record<string, number | string>;
  prompt: string;
}

export interface Plugin {
  id: string;
  name: string;
  kind: Kind;
  category: string;
  icon: string;
  target: string;
  oneLiner: string;
  /** Factory / cold-open state. Amount is always 0.0 = fully transparent. */
  defaults: ParamSpec[];
  presets: Preset[];
  tip: string;
  /** What AI artifact this fixes, if any. */
  artifact?: string;
}

export const CATEGORIES = [
  "Dynamics",
  "EQ & Filters",
  "Space",
  "Time & Modulation",
  "Tone & Drive",
  "AI Artifact Cleanup",
  "Imaging & Utility",
  "Mastering",
  "Creative FX",
] as const;

export const CATEGORY_META: Record<string, { color: string; blurb: string }> = {
  Dynamics: {
    color: "from-rose-500 to-orange-500",
    blurb: "Level control, glue, ducking, transient shaping, de-essing.",
  },
  "EQ & Filters": {
    color: "from-amber-400 to-yellow-600",
    blurb: "Tonal carving, resonance hunting, air, sub reinforcement.",
  },
  Space: {
    color: "from-sky-500 to-cyan-400",
    blurb: "Rooms, plates, springs, halls — plus removing Suno's baked-in reverb.",
  },
  "Time & Modulation": {
    color: "from-violet-500 to-fuchsia-500",
    blurb: "Delays, chorus, flange, phase, doubling, granular.",
  },
  "Tone & Drive": {
    color: "from-orange-600 to-red-600",
    blurb: "Saturation, tape, tube, crush, vinyl, amps.",
  },
  "AI Artifact Cleanup": {
    color: "from-emerald-500 to-teal-400",
    blurb: "Shimmer, hiss, clicks, underwater smear, wobble, robotic vocals.",
  },
  "Imaging & Utility": {
    color: "from-blue-500 to-indigo-500",
    blurb: "Width, mono-making, pan movement, gain staging, phase repair.",
  },
  Mastering: {
    color: "from-fuchsia-600 to-purple-600",
    blurb: "Clippers, limiters, LUFS targets, reference matching.",
  },
  "Creative FX": {
    color: "from-lime-500 to-emerald-600",
    blurb: "Gates, stutters, risers, vocoders, tape stops.",
  },
};
