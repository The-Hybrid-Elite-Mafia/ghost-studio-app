# Studio pages update — September 7, 2026

The working Ghost DAW remains the app entry point. Three added navigation tabs open HEM ATM, Prompt Encyclopedia and Lyrics Creator. The original studio, transport and plugin workshop remain mounted while another page is open. Hash navigation supports returning to a page without reloading the session. Typing on the new pages does not trigger the studio’s musical keyboard or transport shortcuts.

## Supplied applications

| Upload | What was found | Integration |
|---|---|---|
| Gpt1.zip | Complete HEM ATM React/TypeScript app, including build configuration | HEM ATM page; all original internal routes and Studio add-on retained |
| Forgpt.zip | The same 38 shared code files, byte for byte, with six fewer build/configuration files | Consolidated into the complete Gpt1 copy |
| Forgpt2.zip | Standalone HTML/CSS/JavaScript prompt encyclopedia | Separate Prompt Encyclopedia page |

HEM ATM includes its 200 vocal profiles, production lab, comparisons, saved styles, Suno Studio reference, cheat sheet, production guide, genre/beat/vocal style explorer, builder and bundled Studio add-on. Existing HEM browser-storage keys are retained. Browser storage belongs to an origin; saved data from another program/site does not automatically appear at the Ghost local address.

The second encyclopedia contains 201 records: vocals 51, instruments 43, artifacts 51, processing 21, effects 20 and mastering 15. Both its original source and original built HTML have these counts. The advertised total of 240 and instrument count of 82 did not match the files. No entries were discarded. Displayed category counts now come from the data.

These uploads contain production reference prompts, not executable audio DSP or a connection to Suno. Equipment recommendations, artist associations and claims in their imported reference text are not independently verified measurements. Their copy buttons copy text; they do not install processors. The existing DAW workshop handles audio processing.

Repairs include awaited clipboard results with a checked fallback, visible copy failure instead of false success, keyboard-accessible prompt disclosure and accurate encyclopedia counts. HEM is bundled with its CSS and Studio add-on, so no package installation is needed on the Windows user’s computer. Optional web fonts and YouTube listening previews still require internet access.

## Lyrics and Ghost chat

The writer supports new songs and revisions with source lyrics, protected lines, requested fixes and sections to extend. Brief fields cover title, audience, emotion, story, reference, sound, instruments, vocal character, tempo, key, language, duration, perspective and rhyme preference. No deliberate rhyme is the default; natural rhyme and a custom scheme can be selected.

The writing instructions call for Nashville co-writing craft across genres: specific scenes, believable turns, natural contractions, singable stresses and room to breathe. They reject filler and forced rhymes and do not claim the assistant is human. User-provided autobiographical details are preserved instead of inventing a new personal history. Voice/noise defaults continue the user’s clean-production preferences. Creative output needs editorial judgment; this is not a guarantee that every generated line is good or every protected line is obeyed. Missing protected lines and length overruns are flagged.

The service requests a structured song package. The app formats the complete supplied **SUNO v5.5 MASTER FRAMEWORK**: Song Brief, Style String, Voice/Persona, Structure, Tags, Language/Writing Style, Negative Prompt, Editing Notes, Remix/Remaster and all four deliverables. An additional instrumental prompt copy box is retained. The lyric field contains just tagged lyrics, not the whole framework. Lyrics/style/negative/production/instrumental boxes are editable, count characters and copy independently. The complete framework also copies/downloads as text.

The last working draft and ten generated drafts persist locally, including a partially edited blank output field. `.ghostlyrics.json` exports can be reopened without a model call. Rewrite source text remains beside the generated result. Browsers can clear storage, so portable draft downloads matter.

Direct requests to Ghost such as “Write lyrics about leaving home” route to this writer and return the full framework in chat. “Rewrite my lyrics” uses the source in Lyrics Creator or the current draft; if neither is available, Ghost asks for source text before submitting a generation.

The endpoint uses the existing saved key, pinned model and shared usage ledger. Lyric responses allow 6,000 output tokens; ordinary chat remains at 600. Both use the same monthly estimate and daily request limit, exact input/schema counting, reservations and no automatic retries. Failed model responses preserve the previous draft. Reference browsing and local drafting do not call the model. The structured lyric route currently requires the OpenAI provider; the optional Ollama route continues to support ordinary conversation.

## Verification and scope

- HEM production build and TypeScript checks passed.
- The full generated DAW boots in jsdom. Navigation, hash routes, retained engine/session objects, mounted reference frames, chat routing, create/rewrite, duplicate-submit protection, source preservation, draft persistence/reopening and clipboard failure were exercised.
- All 201 encyclopedia records render across six categories; filtering, disclosure and both clipboard outcomes were checked.
- All nine HEM top-level routes render. All 200 vocal profiles are present, a selected profile saves to the expected browser key and appears on Saved Styles, and its detail route opens.
- Provider, local HTTP service and private launcher tests pass with fixture credentials. Lyric tests cover JSON schema, canonical framework, input limits, shared spend/daily counters and incomplete/failed responses without retries. No paid generation was submitted.
- Nine audio processing/source-handling files match the prior source release byte for byte: audio, DSP, pack definitions, cleanup, worklet, bridge, rendering, composition core and compiled worklet bundle. The existing clean-audio test was rerun. Plugin presets remain zero/neutral and bypassed on insertion.

DOM tests use stubbed graphics and do not verify actual browser layout, sound, mobile touch, clipboard permission prompts or embedded video. This update was not run on Windows or against the user’s live key. No separately hosted site was deployed or modified. This is the updated downloadable app package.

## Rebuilding

With Node.js and npm installed, run `npm ci` in `integrations/hem-atm`. Back in `ghost-daw`, run `node build-pages.mjs`, then `node build.mjs`. Run `node test-pages.mjs`, `node test-lyrics.mjs` and the existing service tests. `python package-release.py` creates the source and Windows archives and the standalone HTML beside the project. The Windows archive carries the bundled pages and requires no npm installation.
