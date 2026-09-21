# Ghost Studios Plugin Prompt Forge
Source supplied by the owner; adapted into a cyan-lit, dimensional interface.

Live page: /plugin-prompts.html. Linked from the studio navigation in its own tab so a loaded song is not interrupted. No iframe or second page scroll container.

Rebuild from this directory:

    npm ci
    npm run build
    cp dist/index.html ../../public/plugin-prompts.html

Then build and publish the parent Site. The generated HTML includes its scripts, styles, image and catalog. The committed public HTML is the release artifact; the parent Site does not install this nested project's dependencies.

Favorites and prompt chains are stored in the current browser. This is a text prompt tool, not DSP, audio generation or an API client. Presets describe starting points and do not alter the DAW. Some owner-supplied restoration concepts are experimental and have not been verified against a receiving application's capabilities.

Panel lights use slow opacity changes with fixed dimensions. Motion can be turned off and follows reduced-motion preferences. Category dials are buttons for selecting categories, not audio parameter knobs.
