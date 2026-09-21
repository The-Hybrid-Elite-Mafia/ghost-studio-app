import { useState } from "react";
import type { Plugin, Preset } from "../data/types";
import { CATEGORY_META } from "../data/types";
import { cx, useCopy } from "../lib/ui";

interface Props {
  plugin: Plugin;
  index: number;
  isFav: (key: string) => boolean;
  toggleFav: (key: string) => void;
  inChain: (key: string) => boolean;
  addChain: (pluginId: string, pluginName: string, presetName: string) => void;
}

export default function PluginCard({
  plugin,
  index,
  isFav,
  toggleFav,
  inChain,
  addChain,
}: Props) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const { copied, copy } = useCopy();
  const meta = CATEGORY_META[plugin.category];
  const preset: Preset = plugin.presets[sel];
  const favKey = `${plugin.id}::${preset.name}`;

  return (
    <article
      id={`plugin-${plugin.id}`}
      className="hardware-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117]/90 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
    >
      <div
        className={cx(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70",
          meta?.color ?? "from-slate-500 to-slate-300",
        )}
      />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cx(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl shadow-lg",
              meta?.color ?? "from-slate-600 to-slate-800",
            )}
          >
            <span>{plugin.icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-white">
                {plugin.name}
              </h3>
              <span
                className={cx(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  plugin.kind === "Built-in"
                    ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30"
                    : "bg-fuchsia-500/15 text-fuchsia-300 ring-1 ring-fuchsia-400/30",
                )}
              >
                {plugin.kind === "Built-in" ? "Effect reference" : "Design concept"}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                {plugin.category}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{plugin.oneLiner}</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-600">
              Target: {plugin.target} · slot #{index + 1}
            </p>
          </div>
        </div>

        {/* default state */}
        <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Neutral starting specification
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
              Amount 0.0
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {plugin.defaults.map((d) => (
              <span
                key={d.name}
                className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-slate-400"
              >
                <span className="text-slate-500">{d.name}</span>{" "}
                <span className={d.value === 0.0 ? "text-emerald-300" : "text-slate-200"}>
                  {d.value}
                </span>
              </span>
            ))}
          </div>
        </div>

        {plugin.artifact && (
          <p className="mt-3 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] p-3 text-xs leading-relaxed text-emerald-200/90">
            <span className="font-semibold">Artifact: </span>
            {plugin.artifact}
          </p>
        )}

        {/* preset dropdown */}
        <div className="mt-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Preset prompts ({plugin.presets.length})
          </label>
          <div className="relative">
            <select
              value={sel}
              onChange={(e) => setSel(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#151824] px-3 py-2.5 pr-10 text-sm text-slate-100 outline-none transition hover:border-white/20 focus:border-emerald-400/50"
            >
              {plugin.presets.map((p, i) => (
                <option key={p.name} value={i}>
                  {i + 1}. {p.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              ▾
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Preset settings
            </div>
            <dl className="space-y-1.5">
              {Object.entries(preset.params).map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-2">
                  <dt className="truncate font-mono text-[11px] text-slate-500">{k}</dt>
                  <dd className="shrink-0 font-mono text-[11px] font-semibold text-slate-200">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-300">Starting-point note: </span>
              {plugin.tip}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copy(preset.prompt, favKey)}
                className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
              >
                {copied === favKey ? "Copied ✓" : "Copy chat-bar prompt"}
              </button>
              <button
                onClick={() =>
                  addChain(plugin.id, plugin.name, preset.name)
                }
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-bold transition",
                  inChain(favKey)
                    ? "bg-white/10 text-slate-300"
                    : "bg-white/5 text-slate-200 hover:bg-white/10",
                )}
              >
                {inChain(favKey) ? "In chain ✓" : "+ Chain"}
              </button>
              <button
                onClick={() => toggleFav(favKey)}
                aria-label="Favourite preset"
                className={cx(
                  "rounded-xl px-3 py-2 text-xs font-bold transition",
                  isFav(favKey)
                    ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                    : "bg-white/5 text-slate-400 hover:bg-white/10",
                )}
              >
                {isFav(favKey) ? "★" : "☆"}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="mt-3 w-full rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
        >
          {open ? "Hide all presets" : `Show all ${plugin.presets.length} prompts`}
        </button>

        {open && (
          <div className="mt-3 space-y-2">
            {plugin.presets.map((p, i) => {
              const key = `${plugin.id}::${p.name}`;
              return (
                <div
                  key={p.name}
                  className="rounded-xl border border-white/5 bg-black/30 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSel(i)}
                      className="text-left text-xs font-semibold text-slate-200 hover:text-emerald-300"
                    >
                      {i + 1}. {p.name}
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => copy(p.prompt, key)}
                        className="rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:bg-white/10"
                      >
                        {copied === key ? "Copied ✓" : "Copy"}
                      </button>
                      <button
                        onClick={() => toggleFav(key)}
                        className={cx(
                          "rounded-lg px-2 py-1 text-[11px] font-semibold hover:bg-white/10",
                          isFav(key) ? "text-amber-300" : "text-slate-500",
                        )}
                      >
                        {isFav(key) ? "★" : "☆"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Object.entries(p.params).map(([k, v]) => (
                      <span
                        key={k}
                        className="rounded border border-white/5 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                      >
                        {k} {v}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-500">
                    {p.prompt}
                  </p>
                </div>
              );
            })}
            <button
              onClick={() =>
                copy(
                  plugin.presets
                    .map((p, i) => `--- ${i + 1}. ${p.name} ---\n${p.prompt}`)
                    .join("\n\n"),
                  `${plugin.id}-all`,
                )
              }
              className="w-full rounded-xl bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 hover:bg-white/10"
            >
              {copied === `${plugin.id}-all` ? "All copied ✓" : `Copy all ${plugin.presets.length} prompts`}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
