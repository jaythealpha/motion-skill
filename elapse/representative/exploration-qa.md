# Exploration mode QA — 2026-11-01

Status: passed for the inspected local scope. No P0/P1/P2 issue remains in that scope; physical and scientific limits remain below.

## Scope
Titanic and Britannic gain Timeline / Explore choices. Explore locks historical time, presents named structural stops and virtual-light strength, supports orbit/zoom and button zoom, and restores the previous date/style/camera on exit, paused. Starting from a sinking or future-projection chapter selects a historical wreck-view date; otherwise it retains the current historical wreck date. This is a wreck inspection mode, not a surveyed expedition or structural simulation.

Titanic additionally supports coral/sponge/fish stops and an independent fauna/marine-snow clock within the existing 1986–2022 observation context. Britannic has structural/light inspection only, with its ecological-motion control disabled and explained. Reduced motion freezes the independent clock. Changing to blueprint/x-ray hides the ecology and disables survey illumination where appropriate. Navigation and full-timeline video recording are disabled while historical time is locked; PNG remains available with its existing canvas-only limitations.

Source JSON, dates, dimensions, model IDs, confidence shares, geometry and unrelated repository edits are preserved. No new biological or historical claims are introduced. Mode configuration and camera stops live in `engine/exploration.js`; existing independent installed copies were not overwritten.

## Findings corrected during implementation
- The first pure-helper test exposed missing raw-model projection defaults. The helper now follows the model normalizer's final-chapter fallback; final tests pass.
- Restored a locked-date label that disappeared when rebuilding the independent-motion controls.
- Removed duplicate organism navigation in Explore; all structural/organism stops are in one labelled select.
- Zoom buttons explicitly hand camera control to the user, avoiding auto-fit cancelling the requested zoom.
- Britannic stern inspection uses an estimated stern slice of the existing hull, instead of naming the whole hull the stern.
- Added a fallback virtual survey lamp outside Titanic's fauna-observation window, without enabling unsupported historical fauna.
- Updated macro-card return instructions to refer to Timeline when in Explore.

## Verification
- Unit suite: 84/84 UTC and 84/84 Asia/Seoul, including four new exploration source-preservation/date-default tests.
- Gate 1: both source models pass with zero errors/warnings; original 70%/29% sourced shares retained.
- Focused exploration: 33 frames (7 Titanic stops and 4 Britannic stops × 375/768/1440 px). Target >=60% in frame and >=2% area, underwater camera, no horizontal overflow or page-reported errors. Independent clock advances while t remains unchanged; pause/reduced motion, blocked historical play, intensity, zoom and date/style restoration tested. Final fallback-light check outside the fauna window also passes. Final focused run exits 0: `../.out/exploration-release/results.json`.
- Normal timeline fixed slots: 30/30 states pass across both styles and all three widths.
- Full Titanic Gate 2: 95/95 shots pass, including old playback, light failure, flooding, projections and responsive views.
- Britannic quick regression: 13/13 shots pass.
- Actual in-app browser: 375/768/1440 px Titanic, KO/EN, organism and structural stops, light choices, independent pause and Timeline restoration. Britannic exploration also inspected in-app. No console warnings/errors observed in inspected sessions. Saved evidence: `../.out/exploration-browser/`, `../.out/exploration-release/`, `../.out/titanic-exploration-gate2/`, `../.out/britannic-exploration-regression/`.
- Both HTMLs are built with `--gate2 pass`. Titanic key/contact and Britannic contact sheets were inspected, alongside actual in-app views.
- Shared-copy, syntax and whitespace checks pass. No dependency, external media, production deployment or Git push.

## Limits
Physical devices, screen-reader experience, FPS and video encoding are unverified. Existing SVG overlays remain outside canvas-only exports. Part placement, inspection subregions, illumination and ecological motion remain illustrative estimates. New building/9·11 examples are proposals only, described in `docs/specs/2026-11-01-elapse-buildings-proposal.md`; no building template, event model or collapse simulation has been implemented.
