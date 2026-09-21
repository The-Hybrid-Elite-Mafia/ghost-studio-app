import { useState } from "react";
import { ALL_PLUGINS, CHAIN_RECIPES, TRIAGE, WORKFLOW, findPlugin } from "../data";
import { cx, useCopy } from "../lib/ui";

/* ---------------------------- Chain drawer ---------------------------- */

export interface ChainItem {
  pluginId: string;
  pluginName: string;
  presetName: string;
}

export function ChainDrawer({
  open,
  onClose,
  items,
  setItems,
}: {
  open: boolean;
  onClose: () => void;
  items: ChainItem[];
  setItems: (i: ChainItem[]) => void;
}) {
  const [target, setTarget] = useState("LEAD VOCAL");
  const { copied, copy } = useCopy();

  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const text =
    items.length === 0
      ? ""
      : `Add this effect chain to my ${target} track in this order. Build each plugin from scratch, save it as a preset with the name in brackets, and set every Amount control to 0.0 so the chain is fully transparent until I push it.\n\n${items
          .map(
            (s, i) =>
              `${i + 1}) ${s.pluginName} — [${s.presetName}]${findPlugin(s.pluginId) ? ` (${findPlugin(s.pluginId)!.kind})` : ""}`,
          )
          .join("\n")}\n\nAuto gain-match each stage so bypassing one does not change the level, and give every plugin a delta / listen-to-residual option where it makes sense.`;

  return (
    <div
      className={cx(
        "fixed inset-0 z-50 transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        onClick={onClose}
        className={cx(
          "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        className={cx(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b0d13] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Chain builder
            </h2>
            <p className="text-xs text-slate-500">{items.length} plugin(s) in order</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            Close
          </button>
        </header>

        <div className="border-b border-white/10 p-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Target track
          </label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#151824] px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400/50"
            placeholder="LEAD VOCAL, DRUM BUS, MASTER…"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-slate-500">
              Add plugins with the <span className="font-bold text-slate-300">+ Chain</span> button
              on any card, or load a ready-made recipe from the Chains tab.
            </p>
          )}
          <ol className="space-y-2">
            {items.map((s, i) => (
              <li
                key={`${s.pluginId}-${s.presetName}-${i}`}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12141c] p-3"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-[11px] text-slate-400">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-100">{s.pluginName}</p>
                  <p className="truncate text-[11px] text-emerald-300/80">[{s.presetName}]</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    className="rounded bg-white/5 px-1.5 text-[10px] text-slate-400 hover:bg-white/10"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    className="rounded bg-white/5 px-1.5 text-[10px] text-slate-400 hover:bg-white/10"
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => setItems(items.filter((_, k) => k !== i))}
                  className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                >
                  ✕
                </button>
              </li>
            ))}
          </ol>
        </div>

        <footer className="space-y-2 border-t border-white/10 p-4">
          {items.length > 0 && (
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-black/50 p-3 font-mono text-[10px] leading-relaxed text-slate-400">
              {text}
            </pre>
          )}
          <div className="flex gap-2">
            <button
              disabled={!items.length}
              onClick={() => copy(text, "chain")}
              className="flex-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-30"
            >
              {copied === "chain" ? "Chain prompt copied ✓" : "Copy chain prompt"}
            </button>
            <button
              disabled={!items.length}
              onClick={() => setItems([])}
              className="rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-30"
            >
              Clear
            </button>
          </div>
        </footer>
      </aside>
    </div>
  );
}

/* ---------------------------- Triage modal ---------------------------- */

export function TriageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  const { copied, copy } = useCopy();
  if (!open) return null;
  const hit = TRIAGE.find((t) => t.id === active);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d13]">
        <header className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Artifact triage — what do you hear?
            </h2>
            <p className="text-xs text-slate-500">Diagnose first. Process second.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            Close
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2">
            {TRIAGE.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  active === t.id
                    ? "bg-emerald-500 text-emerald-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10",
                )}
              >
                {t.symptom}
              </button>
            ))}
          </div>

          {hit && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#12141c] p-4">
              <p className="text-xs leading-relaxed text-slate-400">{hit.detail}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-black/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Recommended plugin
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {findPlugin(hit.plugin)?.icon} {findPlugin(hit.plugin)?.name}
                  </p>
                  <p className="text-xs text-emerald-300">Preset: {hit.preset}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{hit.why}</p>
                </div>
                <div className="rounded-xl bg-black/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Chat-bar prompt
                  </div>
                  <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-300">
                    {findPlugin(hit.plugin)?.presets.find((p) => p.name === hit.preset)?.prompt}
                  </pre>
                </div>
              </div>
              <button
                onClick={() =>
                  copy(
                    findPlugin(hit.plugin)?.presets.find((p) => p.name === hit.preset)?.prompt ??
                      "",
                    hit.id,
                  )
                }
                className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-400"
              >
                {copied === hit.id ? "Copied ✓" : "Copy this prompt"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Recipes tab ---------------------------- */

export function Recipes() {
  const { copied, copy } = useCopy();
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Producer-built chains, each as one paste-into-the-chat-bar prompt. The chat bar reads your
        session, builds the plugins, sets the parameters and adds them in order.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {CHAIN_RECIPES.map((r) => {
          const key = `recipe-${r.id}`;
          return (
            <article
              key={r.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117]/90"
            >
              <div className="border-b border-white/5 p-4">
                <h3 className="text-sm font-bold text-white">{r.name}</h3>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">
                  {r.target}
                </p>
                <p className="mt-1 text-xs text-emerald-300/80">{r.vibe}</p>
              </div>
              <div className="p-4">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {r.steps.map((s, i) => (
                    <span
                      key={`${s.plugin}-${i}`}
                      className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-slate-400"
                    >
                      {i + 1}. {findPlugin(s.plugin)?.name ?? s.plugin} · {s.preset}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => copy(r.prompt, key)}
                  className="w-full rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
                >
                  {copied === key ? "Chain prompt copied ✓" : "Copy full chain prompt"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------- Prompt builder ---------------------------- */

const CATEGORIES_LIST = [
  "Dynamics",
  "EQ & Filters",
  "Space",
  "Time & Modulation",
  "Tone & Drive",
  "AI Artifact Cleanup",
  "Imaging & Utility",
  "Mastering",
  "Creative FX",
];

const CONTROL_PRESETS: Record<string, string> = {
  Dynamics: "Amount (0–100, starts 0.0), Threshold, Ratio, Attack, Release, Knee, Makeup with auto gain-match, Mix for parallel",
  "EQ & Filters": "Amount (starts 0.0), band frequency, band gain, Q, HPF, LPF, Output trim, Listen",
  Space: "Amount (0.0 default), Mix, Size, Decay, Pre-delay, Dampening, Wet HPF/LPF, Freeze",
  "Time & Modulation": "Amount (starts 0.0), Time (synced or ms), Feedback, Modulation depth, Tone, Mix",
  "Tone & Drive": "Amount (0.0 default), Drive, Bias, Tone, Mix for parallel, Output trim",
  "AI Artifact Cleanup": "Amount (0.0 default), Detection band, Reduction, Attack, Release, Mix, Listen to residual",
  "Imaging & Utility": "Amount (starts 0.0), Width, Band, Mono-below, Correlation readout, Mono listen",
  Mastering: "Amount (0.0 default), Threshold, Ceiling, Release, Style, Oversampling, Meters, Gain match",
  "Creative FX": "Amount (starts 0.0), Division, Pattern, Length, Shape, Mix, Sync",
};

export function Builder() {
  const [name, setName] = useState("Shimmer Off");
  const [cat, setCat] = useState("AI Artifact Cleanup");
  const [target, setTarget] = useState("lead vocal stem");
  const [does, setDoes] = useState(
    "kills the metallic AI shimmer around 6-12 kHz using dynamic bands that only cut when glassy energy spikes",
  );
  const [controls, setControls] = useState(CONTROL_PRESETS["AI Artifact Cleanup"]);
  const { copied, copy } = useCopy();

  const prompt = `Build a plugin called "${name || "New Plugin"}" — a ${cat.toLowerCase()} device for ${target || "any track"}. What it must do: ${does || "…"}. Controls: ${controls}. The Amount control must default to 0.0 and the plugin must be completely transparent at that setting — no gain change, no colour, no latency difference. Save ${8} presets to its dropdown covering different material, and give every preset a name I will recognise. Add a Listen-to-residual / delta option where it makes sense so I can hear exactly what it removes, and auto gain-match so bypassing the plugin does not change the loudness.`;

  const fields: { label: string; value: string; set: (v: string) => void; area?: boolean }[] = [
    { label: "Plugin name", value: name, set: setName },
    { label: "Category", value: cat, set: setCat },
    { label: "Target track / stem", value: target, set: setTarget },
    { label: "What it must do", value: does, set: setDoes, area: true },
    { label: "Controls (comma separated)", value: controls, set: setControls, area: true },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-[#0f1117]/90 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Forge your own plugin prompt
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Same structure as the library: name, purpose, control list, Amount 0.0 default, 8 named
          presets and a residual listen.
        </p>
        <div className="mt-4 space-y-3">
          {fields.map((f) => (
            <div key={f.label}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {f.label}
              </label>
              {f.area ? (
                <textarea
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#151824] px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400/50"
                />
              ) : f.label === "Category" ? (
                <select
                  value={f.value}
                  onChange={(e) => {
                    f.set(e.target.value);
                    setControls(CONTROL_PRESETS[e.target.value] ?? "");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#151824] px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400/50"
                >
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#151824] px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400/50"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f1117]/90 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Chat-bar prompt</h3>
        <pre className="mt-3 max-h-[26rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-[11px] leading-relaxed text-slate-300">
          {prompt}
        </pre>
        <button
          onClick={() => copy(prompt, "builder")}
          className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
        >
          {copied === "builder" ? "Copied ✓" : "Copy prompt"}
        </button>
        <div className="mt-4 rounded-xl border border-white/5 bg-black/30 p-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">Tip: </span>
          if the chat bar wants to clarify something, hit{" "}
          <span className="font-mono">Adjust Something First</span> and change one control at a time.
          Ask it to rename controls, change how a parameter behaves, or take the whole effect in a new
          direction — it revises the same plugin instead of building a new one.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- How-to tab ---------------------------- */

export function HowTo() {
  const stats = [
    { label: "Plugins", value: ALL_PLUGINS.length },
    { label: "Presets", value: ALL_PLUGINS.reduce((n, p) => n + p.presets.length, 0) },
    { label: "Copy-ready prompts", value: ALL_PLUGINS.reduce((n, p) => n + p.presets.length, 0) },
    { label: "Built-in devices covered", value: 7 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-[#0f1117]/90 p-4 text-center"
          >
            <div className="text-2xl font-black text-emerald-400">{s.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f1117]/90 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          How to use these prompts
        </h3>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-400">
          <li>
            <span className="font-semibold text-slate-200">1. Split first.</span> Right-click the
            clip → Get Stems → Advanced Split and type the instrument names you want. Naming parts by
            ear returns higher-fidelity stems than auto-detection.
          </li>
          <li>
            <span className="font-semibold text-slate-200">2. Mute the source.</span> Never mix the
            original stereo file alongside its own stems — that doubles everything.
          </li>
          <li>
            <span className="font-semibold text-slate-200">3. Dry it.</span> Remove Effects returns
            two dry lanes; run De-Reverb after if you need fully dry, then add your own space back.
          </li>
          <li>
            <span className="font-semibold text-slate-200">4. Paste the prompt.</span> Open the chat
            bar, paste, then hit <span className="font-mono">Build It!</span> — or{" "}
            <span className="font-mono">Adjust Something First</span> to change a control. Ask it to
            rename knobs or take the effect in a new direction and it revises the same plugin.
          </li>
          <li>
            <span className="font-semibold text-slate-200">5. Push Amount slowly.</span> Every
            plugin here ships at Amount 0.0 — fully transparent. Push until you hear the benefit,
            then loudness-match an A/B.
          </li>
          <li>
            <span className="font-semibold text-slate-200">6. Automate the move.</span> Right-click
            any knob → Automate and draw the curve. Use clip fades (Ctrl+F) where automation is
            overkill.
          </li>
          <li>
            <span className="font-semibold text-slate-200">7. Save it.</span> Finished plugins save
            to your library and drag onto any track in any project.
          </li>
        </ol>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {WORKFLOW.map((w) => (
          <div
            key={w.title}
            className="rounded-2xl border border-white/10 bg-[#0f1117]/90 p-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {w.title}
            </h4>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{w.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
