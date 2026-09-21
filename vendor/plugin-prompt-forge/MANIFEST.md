# Plugin Prompt Forge — complete project manifest

Every file below exists in this workspace exactly as built during the conversation.
Nothing has been rewritten or regenerated for packaging.

## ► The deliverable (drop on any web host)

| File | Size | What it is |
|---|---|---|
| `dist/index.html` | 540.64 KB | **The complete, self-contained application.** All JS, CSS and all 67 plugins / 531 prompts are inlined. Open it directly in a browser or upload it to your site. No other file is needed to run it. |

## ► Source project (to rebuild or edit later)

```
index.html                     Vite HTML entry (title + meta description)
package.json                   dependencies + scripts  (npm install && npm run build)
vite.config.ts                 Vite + Tailwind + singlefile plugin config
tsconfig.json                  TypeScript config
INTEGRATION.md                 How to add the app to your website
MANIFEST.md                    This file

src/main.tsx                   React entry point
src/index.css                  Tailwind import + base styles
src/App.tsx                    App shell: header, tabs, filters, library grid
src/utils/cn.ts                (template helper, unused)
src/lib/ui.ts                  cx(), useCopy(), useLocalState(), buildChainPrompt()

src/components/PluginCard.tsx  Plugin card with default-state panel, preset dropdown, copy/chain/fav
src/components/Panels.tsx      ChainDrawer, TriageModal, Recipes, Builder, HowTo

src/data/types.ts              Plugin / Preset types, CATEGORIES, CATEGORY_META
src/data/index.ts              ALL_PLUGINS aggregate, CHAIN_RECIPES (12), TRIAGE (20), WORKFLOW notes

src/data/plugins/dynamics-a.ts Compressor, Sidechain Compressor, Gate, Multiband, Brickwall Limiter
src/data/plugins/dynamics-b.ts Transient Shaper, De-Esser, Parallel NY Comp, Bus Glue VCA, Level Rider
src/data/plugins/eq-a.ts       EQ (6-band), Surgical Resonance EQ, Dynamic EQ, Tilt EQ
src/data/plugins/eq-b.ts       Air Exciter, Sub Harmonic, Bandpass/Creative Filter, Mud & Harsh Cutter
src/data/plugins/space-a.ts    Reverb, Convolution (IR), Vintage Plate, Spring Reverb
src/data/plugins/space-b.ts    De-Reverb, AI Shimmer Remover, Spectral De-Noiser, De-Click/De-Crackle, Gated Reverb
src/data/plugins/time-a.ts     Delay, Tape Delay, Ping-Pong Filter Delay, Chorus/Ensemble
src/data/plugins/time-b.ts     Flanger, Phaser, Doubler, Granular Freeze
src/data/plugins/tone-a.ts     Distortion, Tape Saturation, Tube Warmth, Bitcrusher
src/data/plugins/tone-b.ts     Vinyl & Dust Lo-Fi, Cassette/4-Track, Amp & Cab Sim, Console Colour
src/data/plugins/cleanup-a.ts  Phase Smear Repair, Pitch Wobble Stabilizer, Robotic Humanizer, Sibilance & Fizz
src/data/plugins/cleanup-b.ts  Fixed-Tone Notcher, Stereo & Phase Stabilizer, Tail & Loop Smoother, Breath & Mouth
src/data/plugins/cleanup-c.ts  Artifact Analyser, Transient Blur Restorer, De-Plasticiser
src/data/plugins/imaging-a.ts  Stereo Widener, Auto-Pan, Mid-Side EQ, Utility
src/data/plugins/imaging-b.ts  Master Clipper, LUFS Master Limiter, EQ Match, Low-End Manager
src/data/plugins/creative.ts   Trance Gate, Stutter/Chop, Riser/Reverse Bloom, Ring Mod/Vocoder
```

## Rebuild

```bash
npm install
npm run build      # regenerates dist/index.html
```

## Making a zip yourself

```bash
zip -r plugin-prompt-forge.zip dist src index.html package.json vite.config.ts tsconfig.json INTEGRATION.md MANIFEST.md
```
