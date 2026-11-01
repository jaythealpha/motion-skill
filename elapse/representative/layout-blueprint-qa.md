# Stable information slots and blueprint detail — 2026-11-01

## Change
- Both ship examples keep the explanation card, time/year, compartment levels and depth/ship length in fixed slots. Unavailable levels/depth retain their reserved space and a textual inactive state.
- The latest recorded explanation persists with its own event date, distinct from the current timeline year. Identical event content is not reinserted every frame, preserving reading/scroll position.
- Fixed heights at each responsive breakpoint prevent long explanations or directing notes moving the playback bar. Long text scrolls in keyboard-focusable regions.
- Reduced mobile canvas height and a closer Britannic seabed overview reduce unused space without adding invented contextual data.
- Britannic blueprint retains the added structural windows, rails, deck seams, vents and davit bracing. Organic/weathering effects remain colour-only.
- Blueprint overlay adds source-part leader labels, dimensions from the existing model, a faint reference grid and a camera focal-plane scale ruler. This is a perspective reference scale, not an orthographic engineering drawing.
- Projection warnings now occupy the time/year slot, retaining their existing predicted/historical distinction.

## Browser evidence
- Actual in-app browser: Britannic and Titanic at 375, 768 and 1440 px; colour/blueprint toggling and prediction badge checked. No browser errors/warnings observed in the inspected Britannic state.
- Britannic five sampled timeline values (0,40,65,90,100), three widths: explanation, three gauge slots and playback bar had identical document coordinates and sizes. Document width equals viewport width at all three widths.
- Evidence: `../.out/fixed-layout-browser/{desktop,mobile,tablet}.png` and `layout-measurements.json` (local, Git excluded).
- Automated regression command: `node elapse/scripts/check_layout.mjs elapse/examples/britannic.html out.json` (run from repository root). It checks both styles, three widths and five timeline states; fails for movement >0.5 px, missing slots or horizontal overflow.

## Accuracy and limits
Historical model JSON is unchanged. New microdetail positions remain illustrative estimates, explicitly labelled. The sourced-share percentages still describe the existing time model, not the extra presentation geometry. Britannic received the structural-detail layer; Titanic retains its existing simplified underlying hull geometry. Neither is a measured CAD reconstruction.
SVG leader labels/grid/scale are browser overlays and are not part of canvas-only PNG/video export. Physical-device, screen-reader and quantitative performance tests were not performed.

## Completed checks
- Both examples: automated fixed-layout regression PASS, 30/30 states each (60/60 total).
- Existing unit suite: 67/67 in UTC and 67/67 in Asia/Seoul.
- Gate 1: both PASS, zero errors/warnings; historical JSON unchanged.
- Quick Gate 2: Britannic 13/13, Titanic 19/19 PASS.
- Shared-source synchronization and diff whitespace checks PASS.
- Full Britannic Gate 2 PASS: 71/71 shots, including both styles, x-ray, language, panels, mobile and all playback speeds.
- Local design QA: passed for this fixed-layout/detail scope; no P0/P1/P2 issues found in inspected states. Underlying simplified geometry and export-overlay limits remain as documented above.
