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
