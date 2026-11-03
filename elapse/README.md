# Elapse

A chaptered time bar for a real subject. Shipwreck examples cover: from the accident through the sinking to the wreck's decay on the seabed. The page is a single offline HTML file. Historical structure templates also include Eiffel, Notre-Dame, WTC, Sampoong and Seongsu Bridge.

New Seoul examples: `examples/sampoong.html` and `examples/seongsu-bridge.html`; six locked-date inspection stops each, five languages (English default). Detailed geometry and failure motion are illustrative. See `research/seoul-civil-notes.md` for reference dimensions, conflicting times and historical endpoints.

- `SKILL.md`: how Claude uses it
- `references/`: the model format and the research guide
- `engine/`: the page (three.js renderer, UI) and the pure modules Gate 1 shares (chapters, tracks, geometry, checks)
- `shared/`: copied from the repository's `shared/` by `scripts/sync-shared.mjs` (do not edit here)
- `scripts/`: `build.mjs`, `check_model.mjs` (Gate 1), `shoot.mjs` (Gate 2)
- `examples/`: finished models and pages
- `tests/`: `npm test` runs them in two time zones

Licence: MIT. The facts in the examples come from the sources linked in each page; no source text or images are included.

### Titanic directing pass

Titanic's full timeline now includes aspect-aware side framing, waves and contact spray, flooding inflow, descent bubbles, landing sediment and collapse close-ups. These deterministic effects explain the existing time model; they do not add historical evidence or simulate fluid/structural physics. Critical passages play more slowly within the selected speed. Cards sit below the canvas on this example. Blueprint and manual camera controls remain available. See `representative/full-timeline-qa.md` for verification boundaries.

### Britannic directing pass

Britannic uses daylight water, flooding particles, a deck-facing roll camera, bubbles, post-contact sediment and shallow-seabed exploration views. Descent remains inside the existing capsize chapter. Its original model and 29% sourced share are retained; no future collapse chapter was added. Critical passages use the existing speed choice with local slowdowns. See `representative/britannic-timeline-qa.md` for checks and limits.

See [변경 기록](CHANGELOG.md) for the combined Titanic/Britannic update and verification limits.

Bundles three.js 0.180.0 (MIT); its authors’ notice is retained in [shared/vendor/LICENSE-three.txt](shared/vendor/LICENSE-three.txt).

### Exploration mode

On Titanic and Britannic, choose **모드 → 탐사 / Mode → Explore**. Historical time is locked while you visit the wreck, bow, bridge/decks and stern, orbit/zoom and change survey-light strength. Titanic also offers coral/sponge/fish stops and a separate fauna/snow play/pause clock in the eligible observation window. Reduced motion freezes that clock. Return to Timeline restores the previous date and view, paused. The intensity and ecological animation are illustrative, not environmental measurements or yearly population data.

Direct demo: `examples/titanic.html?t=85&mode=explore`. Run `node scripts/check_exploration.mjs [outputDirectory]` for the focused browser checks.

### Historical building construction

`examples/eiffel-tower.html` adds a separate building lens: 1887–1889 foundations, legs, first and second platforms, upper tower and completion, plus construction-specific gauges and structural inspection. Official milestone dates are separate from estimated geometry/intermediate assembly. The300m main-structure study omits historical flagpole/top fittings and modern antennas. It is not surveyed CAD or a structural safety model. Read `references/building-format.md` and `representative/eiffel-qa.md`. Notre-Dame damage/restoration is the second supported building template; other buildings need a separate template.

## Notre-Dame fire and restoration

`examples/notre-dame.html` covers the pre-fire structure, evening2019fire and estimated spire motion, damaged roof/vaults, stabilisation, timber/spire rebuilding and the December2024 reopening. Seven structural stops, view lighting, orbit/zoom, source labels and an explicit roof-hidden vault cutaway share the existing UI. Read `research/notredame-notes.md` and `representative/notredame-qa.md`. Reopening does not imply all conservation ended. Geometry, fire and intermediate works are illustrative.

Validation: `node scripts/check_model.mjs examples/notre-dame.json`; `node scripts/shoot.mjs examples/notre-dame.html out-shots`; `node scripts/check_notredame.mjs examples/notre-dame.html out-focused`. No external assets are fetched by the built page.

## World Trade Center site history

`examples/world-trade-center.html` adds the2001 aircraft impacts, twin-tower collapses, separateWTC7 event, recovery and selected memorial/rebuilding milestones through11June2018. Seven dated inspection stops share orbit/zoom, view light and historical restoration. Geometry, generic aircraft, smoke/dust and full-collapse motion are independent estimates, not NIST simulation or measured trajectories. No people, victims or invented name lists are drawn. A completed2 WTC/current full campus is not implied.

Read `research/wtc-notes.md` and `representative/wtc-qa.md`. Run Gate1, full `shoot.mjs` and `check_wtc.mjs`. The new template keeps original tower sites distinct from new buildings and disables not-yet-built inspection stops.

WTC observation update: the full timeline includes separate North/South impact framing, South/North/7 WTC descent-to-dust camera sequences, procedural facade detail and generic aircraft, plus 0.25× / 0.5× slow viewing. From the repository root, run `node elapse/scripts/check_wtc_directed.mjs` to check critical frames at three widths. These are authored explanatory sequences, not a physics reconstruction.
