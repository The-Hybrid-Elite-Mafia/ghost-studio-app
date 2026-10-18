# HEM Ghost Studio for Windows

The Windows desktop version of the Hybrid Elite Mafia Creative Studio (Ghost Studio). It installs like any other program, gets a desktop icon, and runs without a website or sign-in.

Everything from the website is included: Home dashboard, Full DAW, Plugin Workshop, Lyrics Creator, Music Library (HEM ATM), Prompt Encyclopedia, 3D Rack, Illustrated Manual, Plugin Prompt Forge and the Radio station.

## How it works

- The app starts a small server on `127.0.0.1` (this PC only) and opens the studio in its own window. The server answers only that window: each launch sets a secret cookie in the window, and requests without it are refused.
- The server runs **the website's own API code** (`lib/cloud-http.mjs`, `app/api/radio/**`). The Cloudflare parts are replaced with local versions:
  - Database (D1) → `ghost-studio.sqlite` in `%APPDATA%\HEM Ghost Studio`, using sql.js.
  - Media storage (R2) → files in `Documents\Hybrid Elite Mafia\Ghost Studio\Station`.
  - Sign-in → the desktop app has one user, the studio owner.
- **Ghost chat and Lyrics Creator** use your own OpenAI API key, entered in *Ghost connection*. The key is encrypted (AES-GCM) in the local database. The lock for it is kept in `ghost-secret.bin`, protected by your Windows account (DPAPI). The website's limits still apply: estimated $5 a month and 100 requests a day.
- Bootstrap and all fonts are bundled, so the pages look right with no internet. Only Ghost chat, lyrics writing and YouTube previews need internet.
- Your projects, drafts and settings saved in the studio use the window's browser storage. They stay in `%APPDATA%\HEM Ghost Studio` and survive upgrades. Uninstalling does not delete them.

## Build

```
npm ci                      # in the repository root
cd desktop
npm ci
node build.mjs              # builds the studio, then desktop/out
node --test tests/*.test.mjs
npx electron-builder --win nsis --x64 --publish never   # on Windows: desktop/release/HEM-Ghost-Studio-Setup-<version>.exe
```

The GitHub workflow **Ghost Studio Windows installer** (`.github/workflows/desktop-windows.yml`) does all of this. It runs only when started by hand. It runs the studio tests and the desktop tests, packages the installer, opens every page in the packaged app (`--smoke-test`), and publishes a release.

## Files

| File | What it does |
|---|---|
| `main.cjs` | Desktop window, the local secret, link handling, menu, the smoke test |
| `build.mjs` | Builds `out/`: pages, bundled fonts and Bootstrap, the station page, the server bundle |
| `src/server/` | Local server: `d1.mjs` (database), `r2.mjs` (media files), `routes.mjs` (the website's API routes), `app-server.mjs` (HTTP, security) |
| `src/radio/` | Desktop entry for the station page (same React component as the website) |
| `tests/server.test.mjs` | Security, pages, Ghost connection/chat/lyrics (OpenAI faked), full station upload/play/delete/restart |
