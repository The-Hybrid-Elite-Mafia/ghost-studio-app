# Ghost DAW — mobile hosting

This is the current Ghost DAW with authenticated online chat and lyrics. Open the published website from a phone or computer; Windows does not need to stay on. Audio and project files remain on the current device. To transfer a project between devices, export and import it using Projects.

The protected connection dialog accepts the existing OpenAI API key, encrypts it using AES-GCM with a per-user authenticated context, and stores only encrypted credentials in D1. The server-side `GHOST_SECRET_KEY` is a Sites secret. Never commit or expose it, an OpenAI key, or a Git source credential. Saving a connection does not make a model request; Test Ghost makes one explicit request. Removing a key only removes it from this application.

The fixed GPT-5.6 Luna model uses a shared chat/lyrics allowance of 100 requests per UTC day and a $5 monthly conservative usage estimate. Chat output is capped at 600 tokens and lyric output at 6,000; input is capped at 10,000. These limits cover only this online application, not other API use. Each generation is reserved in D1 before submission. Unknown outcomes retain their full reservation; there are no automatic retries. Unexpected model, service tier, or unbounded usage pauses further generation. Usage reservations and locks are durable across Worker restarts. Prices were checked against OpenAI model documentation on 2026-09-07; update the model, price assumptions and tests together when changing them.

## Source and build

`studio/` contains the preserved standalone DAW front end and bundled HEM ATM and Prompt Encyclopedia pages. Connection UI changes are separate from audio processing; audio, DSP, worklet, effect definitions, and the existing lyric framework are retained. Manual inserts remain neutral and bypassed. The Worker serves the bundled document at `/` and authenticated same-origin API endpoints under `/api`.

Run `npm run db:generate` after schema changes, inspect and commit the generated Drizzle migration, and run `node --test tests/cloud.test.mjs tests/openai-request.test.mjs`. Use the Sites build and package helpers documented by the Sites skills for deployment; `prebuild` regenerates the DAW document. Keep `.openai/hosting.json` bound to its existing project ID. Deployment is private to the owner unless the user explicitly changes the audience.

Fixture tests exercise cryptography, account isolation, authentication, cross-origin rejection, shared durable limits, ambiguous-request reservations, and both API output contracts without a real API key or paid model calls. No real phone, browser playback/listening, or live OpenAI response is claimed by these tests. The first live verification happens when the owner taps Test Ghost after privately saving their key.

## Mobile connection troubleshooting

The first mobile production tests returned HTTP 503 from `/api/ghost` before any generation reservation, in roughly 0.6–0.7 seconds. The original catch combined all fetch exceptions into an ambiguous timeout message and did not retain the underlying diagnostic. These logs establish the failing stage, but do not establish the original exception or validate the saved OpenAI key.

Connection revision `mobile-connection-2` uses an explicit native fetch receiver, an AbortController deadline cleared after each request, and manual redirect handling that never forwards credentials. Sanitized server logs distinguish runtime errors, transport errors, real timeouts, HTTP errors, and response-body failures. Only safe stage/code/status details are returned to the UI. Keys, request bodies, user lyrics and raw upstream error payloads are not logged. Existing encrypted keys and usage records are retained.

Tests cover these cases with controlled fixtures and the built Worker in process. A separate local workerd/Miniflare experiment could not run because network approval was cancelled; no production-browser access or live authenticated OpenAI test was performed. Confirm the actual connection with the owner’s Test Ghost action and correlate any failure with native Sites Worker logs.
