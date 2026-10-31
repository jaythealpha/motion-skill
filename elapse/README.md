# Elapse

A chaptered time bar for a real subject. This version covers shipwrecks: from the accident through the sinking to the wreck's decay on the seabed. The page is a single offline HTML file.

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
