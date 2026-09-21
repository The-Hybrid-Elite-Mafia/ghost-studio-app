import { useEffect, useMemo, useState } from "react";
import { ALL_PLUGINS, CATEGORIES, CATEGORY_META, PRESET_COUNT, TRIAGE } from "./data";
import type { Plugin } from "./data/types";
import PluginCard from "./components/PluginCard";
import {
  Builder,
  ChainDrawer,
  HowTo,
  Recipes,
  TriageModal,
  type ChainItem,
} from "./components/Panels";
import { cx, useLocalState } from "./lib/ui";

type Tab = "library" | "chains" | "triage" | "builder" | "howto";

const TABS: { id: Tab; label: string }[] = [
  { id: "library", label: "Plugin library" },
  { id: "chains", label: "Chain recipes" },
  { id: "triage", label: "Artifact triage" },
  { id: "builder", label: "Prompt builder" },
  { id: "howto", label: "How to use" },
];

export default function App() {
  const [motion, setMotion] = useLocalState<boolean>("spf:motion", !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [tab, setTab] = useState<Tab>("library");
  const [page,setPage]=useState(0);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [kind, setKind] = useState<"All" | "Built-in" | "Chat-built">("All");
  const [favOnly, setFavOnly] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);

  const [favs, setFavs] = useLocalState<string[]>("spf:favs", []);
  const [chain, setChain] = useLocalState<ChainItem[]>("spf:chain", []);

  const favSet = useMemo(() => new Set(favs), [favs]);
  const chainKeys = useMemo(() => new Set(chain.map((c) => `${c.pluginId}::${c.presetName}`)), [chain]);

  const toggleFav = (key: string) =>
    setFavs(favs.includes(key) ? favs.filter((f) => f !== key) : [...favs, key]);

  const addChain = (pluginId: string, pluginName: string, presetName: string) => {
    const key = `${pluginId}::${presetName}`;
    setChain(
      chainKeys.has(key)
        ? chain.filter((c) => `${c.pluginId}::${c.presetName}` !== key)
        : [...chain, { pluginId, pluginName, presetName }],
    );
  };

  useEffect(() => {
    if (new URLSearchParams(location.search).get("embedded") !== "rack") return;
    let frame = 0;
    const sendSize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => {
      const element = document.querySelector(".forge-room");
      const height = element ? element.getBoundingClientRect().height : document.body.scrollHeight;
      window.parent.postMessage({ type: "rack-forge-height", height: Math.ceil(height + 8) }, location.origin);
    }); };
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== window.parent) return;
      if (event.data?.type === "rack-forge-viewport") {
        const { top, height } = event.data;
        if (Number.isFinite(top) && top >= 0 && top < 150000 && Number.isFinite(height) && height >= 200 && height <= 10000) {
          document.documentElement.style.setProperty("--rack-modal-top", top + "px");
          document.documentElement.style.setProperty("--rack-modal-height", height + "px");
        }
        return;
      }
      if (event.data?.type !== "rack-forge-open") return;
      if (event.data.category === "All" || (CATEGORIES as readonly string[]).includes(event.data.category)) setCategory(event.data.category);
      if (TABS.some(t => t.id === event.data.tab)) setTab(event.data.tab);
      setQuery(""); setFavOnly(false); setKind("All");
    };
    window.addEventListener("message", receive);
    const observer = new ResizeObserver(sendSize);
    const element = document.querySelector(".forge-room");
    if (element) observer.observe(element);
    document.documentElement.classList.add("rack-embedded");
    window.parent.postMessage({ type: "rack-forge-ready" }, location.origin);
    sendSize();
    return () => { window.removeEventListener("message", receive); observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: ALL_PLUGINS.length };
    for (const c of CATEGORIES) m[c] = ALL_PLUGINS.filter((p) => p.category === c).length;
    return m;
  }, []);

  const filtered: Plugin[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_PLUGINS.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (kind !== "All" && p.kind !== kind) return false;
      if (favOnly) {
        const any = p.presets.some((pr) => favSet.has(`${p.id}::${pr.name}`));
        if (!any) return false;
      }
      if (!q) return true;
      const hay = [
        p.name,
        p.category,
        p.kind,
        p.target,
        p.oneLiner,
        p.tip,
        p.artifact ?? "",
        ...p.presets.map((pr) => `${pr.name} ${pr.prompt} ${Object.values(pr.params).join(" ")}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, category, kind, favOnly, favSet]);

  useEffect(()=>{setPage(0);setSelectedId(null)},[query,category,kind,favOnly]);
  const pages=Math.max(1,Math.ceil(filtered.length/8));
  const currentPage=Math.min(page,pages-1);
  const visible=filtered.slice(currentPage*8,currentPage*8+8);
  const selected=visible.find(p=>p.id===selectedId)||visible[0];
  return (
    <div className={cx("forge-room min-h-screen text-slate-200 antialiased", !motion && "motion-off")}>
      <div className="studio-marquee"><p>THE HYBRID ELITE MAFIA</p><h1>GHOST STUDIOS</h1><span>PLUGIN PROMPT FORGE</span></div>
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      {/* header */}
      <header className="forge-header relative z-40">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-base shadow-lg shadow-emerald-500/20">
                🎛️
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-black uppercase tracking-[0.18em] text-white">
                  Plugin Prompt Forge
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
                  Design your chain · shape your sound
                </p>
              </div>
            </div>

            <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setTab("library");
                  }}
                  placeholder={`Search ${PRESET_COUNT} prompts — shimmer, de-reverb, 808, sidechain, LUFS, tape, vocal…`}
                  className="w-full rounded-xl border border-white/10 bg-[#12141c] py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
              </div>
            </div>

            <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
              <button
                onClick={() => setTriageOpen(true)}
                className="rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                🔍 Triage
              </button>
              <button
                onClick={() => setChainOpen(true)}
                className="relative rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400"
              >
                Chain
                <span className="ml-1.5 rounded-md bg-emerald-950/30 px-1.5 py-0.5 font-mono text-[10px]">
                  {chain.length}
                </span>
              </button>
            </div>
          </div>

          <div className="forge-utilities"><a href="/" target="_blank" rel="noopener">← Back to studio</a><button aria-pressed={motion} onClick={() => setMotion(!motion)}>Panel lights: {motion ? "Moving" : "Still"}</button></div><nav className="mt-3 flex flex-wrap items-center gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  "rounded-lg px-3 py-1.5 text-xs font-bold transition",
                  tab === t.id
                    ? "bg-white text-slate-900"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200",
                )}
              >
                {t.label}
              </button>
            ))}
            <span className="ml-auto hidden font-mono text-[11px] text-slate-600 sm:block">
              {ALL_PLUGINS.length} plugins · {PRESET_COUNT} presets · every Amount defaults to 0.0
            </span>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6">
        <section className="forge-intro"><div><p className="console-caption">YOUR SOUND. YOUR SETTINGS.</p><h2>Build the idea. Copy the chain.</h2><p>{ALL_PLUGINS.length} effect concepts · {PRESET_COUNT} preset prompts. This page creates text instructions; it does not process audio or install plugins. Generated effects and exact controls depend on the receiving app.</p></div><div className="neutral-badge"><i /> START NEUTRAL<strong>0.0</strong><span>Audition before applying</span></div></section>

        {tab === "howto" && <HowTo />}
        {tab === "builder" && <Builder />}
        {tab === "chains" && <Recipes />}
        {tab === "triage" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Pick the artifact you hear. Each one maps to a plugin, a preset and the reasoning
              behind the settings.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {["shimmer", "hiss", "watery", "reverb-baked", "robotic", "wobble", "sibilance", "mud", "soft-drums", "lows", "loud", "mono"].map(
                (id) => (
                  <button
                    key={id}
                    onClick={() => setTriageOpen(true)}
                    className="rounded-2xl border border-white/10 bg-[#0f1117]/90 p-4 text-left transition hover:border-emerald-400/40"
                  >
                    <p className="text-sm font-semibold text-white">
                      {TRIAGE.find((t) => t.id === id)?.symptom}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {TRIAGE.find((t) => t.id === id)?.detail}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold text-emerald-300">
                      → {TRIAGE.find((t) => t.id === id)?.preset}
                    </p>
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {tab === "library" && (
          <div className="forge-library flex flex-col gap-6">
            {/* sidebar */}
            <aside className="category-console">
              <div className="category-inner">
                <div className="category-grid">
                  {(["All", ...CATEGORIES] as string[]).map((c) => (
                    <button
                      key={c}
                      aria-pressed={category === c}
                      onClick={() => setCategory(c)}
                      className={cx(
                        "category-tile flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition",
                        category === c
                          ? "bg-white/10 text-white ring-1 ring-white/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                      )}
                    >
                      <span className="category-name"><span className="category-dial" aria-hidden="true"><i /></span>
                        {c !== "All" && (
                          <span
                            className={cx(
                              "h-2 w-2 rounded-full bg-gradient-to-br",
                              CATEGORY_META[c]?.color,
                            )}
                          />
                        )}
                        {c}
                      </span>
                      <span className="font-mono text-[10px] text-slate-600">{counts[c] ?? 0}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-[#0f1117]/90 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Device type
                  </div>
                  <div className="flex gap-1.5">
                    {(["All", "Built-in", "Chat-built"] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setKind(k)}
                        className={cx(
                          "flex-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition",
                          kind === k
                            ? "bg-emerald-500 text-emerald-950"
                            : "bg-white/5 text-slate-400 hover:bg-white/10",
                        )}
                      >
                        {k === "Chat-built" ? "Chat" : k}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setFavOnly((f) => !f)}
                    className={cx(
                      "w-full rounded-lg px-2 py-1.5 text-[11px] font-bold transition",
                      favOnly
                        ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                        : "bg-white/5 text-slate-400 hover:bg-white/10",
                    )}
                  >
                    ★ Favourites only ({favs.length})
                  </button>
                </div>

                {category !== "All" && CATEGORY_META[category] && (
                  <p className="mt-3 rounded-xl border border-white/10 bg-[#0f1117]/90 p-3 text-[11px] leading-relaxed text-slate-500">
                    {CATEGORY_META[category].blurb}
                  </p>
                )}
              </div>
            </aside>

            {/* grid */}
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {filtered.length} plugin{filtered.length === 1 ? "" : "s"} ·{" "}
                  {filtered.reduce((n, p) => n + p.presets.length, 0)} presets
                </p>
                {(query || category !== "All" || kind !== "All" || favOnly) && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setCategory("All");
                      setKind("All");
                      setFavOnly(false);
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    Reset filters
                  </button>
                )}
              </div>
              <div className="plugin-picker" aria-label="Choose a plugin">
                {visible.map(p=><button key={p.id} aria-pressed={selected?.id===p.id} onClick={()=>setSelectedId(p.id)}>{p.name}</button>)}
              </div>
              <nav className="catalog-pages" aria-label="Plugin pages"><button disabled={currentPage===0} onClick={()=>{setPage(currentPage-1);setSelectedId(null)}}>← Previous</button><span aria-live="polite">{filtered.length?currentPage*8+1:0}–{Math.min((currentPage+1)*8,filtered.length)} of {filtered.length}</span><button disabled={currentPage===pages-1} onClick={()=>{setPage(currentPage+1);setSelectedId(null)}}>Next →</button></nav>
              <div className="plugin-detail">
                {(selected?[selected]:[]).map((p, i) => (
                  <PluginCard
                    key={p.id}
                    plugin={p}
                    index={i}
                    isFav={(k) => favSet.has(k)}
                    toggleFav={toggleFav}
                    inChain={(k) => chainKeys.has(k)}
                    addChain={addChain}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
                  Nothing matches that search. Try “shimmer”, “sidechain”, “de-reverb”, “808”,
                  “master”.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="forge-footer"><strong>Hybrid Elite Mafia × Ghost Studios</strong><p>Prompt reference library. Settings are starting points, not measured recommendations for your song. Some supplied concepts are experimental; no claim of guaranteed artifact removal.</p></footer>

      <ChainDrawer
        open={chainOpen}
        onClose={() => setChainOpen(false)}
        items={chain}
        setItems={setChain}
      />
      <TriageModal open={triageOpen} onClose={() => setTriageOpen(false)} />
    </div>
  );
}
