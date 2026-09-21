# Hybrid Elite Mafia Creative Studio / Ghost Studio

Complete existing source export for the private repository `The-Hybrid-Elite-Mafia/ghost-studio-app`.

- Saved app version: **40**
- Source commit: `dd3b036676c65e7e398fd97e7bf2b6e40cc290e9`
- Export date: 2026-09-21
- Application code, artwork, DSP, manifests, lockfiles and existing generated front-end documents are unchanged. No build or feature changes were performed for this export.

## Requirements

Use Node.js **22.13 or later**, npm, Bash and GNU coreutils (including `timeout`). On Windows, use **WSL2 with Ubuntu** for the commands below; the existing build scripts use Bash. Internet access is needed to install dependencies.

## Install and run locally

Unzip the archive, then open a terminal in its `ghost-studio-app` folder:

```bash
npm ci
cp .env.example .dev.vars
npm run dev
```

Open the local URL printed by Vite. Use a fresh random 32-byte hexadecimal `GHOST_SECRET_KEY` in the ignored `.dev.vars` file for local server setup. Generate one privately with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Do not commit its output. Cloudflare local development uses `.dev.vars`; `.env.example` is a template and is not itself loaded as a secret. Production secrets must be configured through the hosting provider.

Local preview does **not** recreate the managed Sites authentication gateway or production data. Protected radio/API routes may require the original managed hosting environment. Do not bypass the owner checks or inject trusted authentication headers from browser code to make them work locally.

## Build and run the production build

```bash
npm run build
npm start
```

`prebuild` regenerates the DAW HTML, illustrated manual HTML and plugin prompt guide from their source. The verified build script runs Vinext and creates `dist/`. `npm start` invokes `vinext start`; production Cloudflare deployment still requires the bindings and authentication gateway below. These commands are provided for future use; they were not run during this export.

## Hosting requirements

This is a server-backed application, not a GitHub Pages static site. GitHub stores the source; uploading it does not deploy the app or transfer its database.

The existing app uses Cloudflare Workers through Vite/Vinext, a D1 binding named `DB`, an R2 binding named `BUCKET`, and a server secret named `GHOST_SECRET_KEY`. Schema migrations are included in `drizzle/`. Production requires the trusted Sites sign-in gateway and its authenticated identity headers. The server-only owner allowlist is retained in `lib/api-owner.mjs`.

`.openai/hosting.json` retains the original non-secret project identifier and binding names because the existing build imports it. It does not contain access credentials. Preserve it when continuing with the existing Site. Deploying on another provider requires separate hosting/authentication integration, which is outside this unchanged source export.

Users enter OpenAI API keys through the authenticated Ghost connection screen. There is no application-wide `OPENAI_API_KEY` environment variable in the current implementation. Saved API keys, encryption secrets, login sessions, production database contents and uploaded radio media are intentionally not exported. Do not replace the encryption key on an existing deployment without planning for already-encrypted credentials.

## Project layout

- `app/`: application routes, radio player and authenticated server APIs.
- `studio/`: DAW, 3D console, audio engine, DSP, plugin chains, lyrics tools and manual sources.
- `public/`: artwork, bundled worklet, reference pages and illustrated manual assets.
- `vendor/plugin-prompt-forge/`: complete plugin prompt guide sources, artwork and its original manifest/lockfile.
- `lib/`, `db/`, `drizzle/`, `worker/`: backend services, schema, migrations and Worker entry.
- `scripts/`, `build/`: existing build and maintenance tools.
- `tests/`: automated checks and browser test sources.

The main app builds the prompt guide from the root dependencies. Both existing package lockfiles are included unchanged.

## Tests and schema changes

```bash
npm test
npm run db:generate
```

`npm test` builds first, then runs Node test files. Browser test files require a suitable separate browser harness. Inspect generated migrations before applying them to a database. Local build, playback, login and paid API requests were not exercised during this export.

## Add to your private GitHub repository

Extract the ZIP and upload the **contents** of `ghost-studio-app` into the repository root. Keep the repository private. Include the supplied `.gitignore` and `.env.example`; never add `.dev.vars`, real `.env` files, credentials, dependency folders or caches. No GitHub workflow was added or executed.

`README-SITES-ORIGINAL.md` preserves the previous hosting notes for historical context; some descriptions there predate the current routes. `EXPORT-MANIFEST.json` records source hashes for verification.
