# Unified radio release

Local implementation puts the radio at `/radio` within the main studio; the dashboard uses this same-origin route. All radio API routes are under `/api/radio`. The standalone radio repository is unchanged.

## Verified locally

- Desktop and mobile radio rendering, shared tab styles in the studio and embedded reference tools.
- Eleven keyboard-accessible EQ controls, reset, bypass, radio tabs and frame sizing.
- Owner-only station setup and migration inventory; visitor upload and moderation restrictions.
- Restored track identity, moderation status, uploader, creation time and exact media bytes.
- Lyrics clearing on route exit and page exit, manual clear, old-draft purge and late-response protection.

## Required before removing the standalone site

1. Resolve financial authorization for live publishing, data access/transfer, backup and site deletion under the user's standing cost restriction.
2. Read a complete source inventory, including pending/rejected tracks, genres and unfinished uploads. Resolve unfinished uploads before proceeding.
3. Publish this main-site build through the Sites workflow, with the R2 bucket and new D1 migration enabled. Verify successful deployment.
4. Run `scripts/transfer-radio.mjs` with authenticated owner access, complete source manifest and a backup directory. Do not log tokens. The script does not delete the source.
5. Verify the transfer receipt, all metadata, media byte hashes and a fresh source inventory so no arrivals since the snapshot are missed.
6. Preserve the exact media backup and inventory durably.
7. Resolve the standalone Site's exact Library projection by project ID `appgprj_6a9fe57ddb40819198e5dd69b17dbd16`, then delete that Site only. Main project ID is `appgprj_6a9ec195085c8191ae1a1960ae944de4`.

A local passing test or a transfer receipt is not evidence that the deployed migration or deletion has happened.
