# Titanic plan-informed geometry QA — 2026-11-01

Status: passed for the inspected local geometry/UI scope. Accuracy limits below remain explicit.

## Result
- Finer independently authored liner loft; recessed fore/aft wells; distinct end decks and upper-deck setbacks.
- Inquiry-based 192ft forward screen, real rectangular openings, open aft promenade and an irregular inboard house.
- Circular hull openings versus rectangular B-deck windows; structural rails, roof lips and approximate skylight/dome.
- Original split ranges, attachment offsets, tracks, burial/collapse keys, confidence shares and historical JSON retained. Titanic does not receive Britannic's shallow-water crust colonies.
- Smooth bridge/deck detail view during timeline 80–88, with dated collapse focus taking precedence and the original overview restored outside the window. Callouts identify the selected structures.

## Verification
- Unit suite: 76/76 in UTC and 76/76 in Asia/Seoul. Includes dimensions, finite loft topology, source nonmutation, well depth, screen boundary, split-contour continuity and ray passage through a real window opening.
- Gate 1: both examples PASS, zero errors/warnings. Source JSON unchanged; Titanic 70%, Britannic 29% sourced (original time-model statistics only).
- Full Titanic Gate 2 PASS: 95/95 shots. Run began before per-material batching and the final detail-camera addition. The geometry itself was unchanged by batching; the added camera was checked separately below.
- Detail-camera entry/hold/exit: PASS 39/39 states across 375, 768 and 1440 px, with projected target >=60% in frame, area >=2% and the deep-wreck eye underwater.
- Fixed-layout regression PASS: 30/30 states across both styles and the three widths.
- Britannic regression PASS: 13/13 quick Gate 2 shots. Original Britannic form tests remain passing after shared hull/deckhouse helper changes.
- Actual in-app browser at 375x900, 768x1000 and 1440x1000: intact, colour/blueprint, seabed detail and language switching. Detail-view context can crop the distant bow, while the selected bridge/deck remains visible. No errors/warnings observed in the inspected browser session.
- Shared-copy synchronization, syntax and whitespace checks pass. No new dependency or external image/font added. HTML rebuilt with gate2=pass.
- Local browser screenshots: `../.out/titanic-plan-browser/`; camera measurements `../.out/titanic-plan-camera.json`; fixed layout `../.out/titanic-plan-layout.json`. Evidence is Git excluded.

## Evidence boundaries
Historical/modern plan provenance and the exact mapping are in `../research/titanic-form-notes.md`. This is a plan-informed interpretation, not measured CAD or a surveyed wreck mesh. Individual offsets/windows/roof coordinates remain estimated. Original model confidence percentages do not include added presentation meshes. Original temporal/model Gate 1 does not certify the separate display layer; dedicated geometry and browser tests cover that layer.

Ecology feasibility is documented separately in `../research/titanic-ecology-assessment.md`; no new fish/coral models or population simulation were implemented. Physical devices, screen readers, export encoding and quantitative performance remain unverified. SVG overlays remain outside canvas-only exports.

Follow-up: the subsequent user-requested ecology implementation is recorded in `titanic-ecology-qa.md`; the no-new-fauna statement above describes this earlier geometry-only run.
