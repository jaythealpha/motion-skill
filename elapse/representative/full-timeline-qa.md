# Titanic full-timeline directing — 2026-11-01

Status: passed (local automated and browser-viewport checks; limits below).

## Scope and preservation
The six original chapters, source links, confidence classifications, timestamps, flood levels, pose tracks and collapse geometry remain unchanged. Model JSON is unchanged. At the time of this Titanic pass, Britannic and phone examples were not rebuilt or modified. The subsequent Britannic pass is documented separately in britannic-timeline-qa.md. This is a presentation upgrade, not new historical or physical evidence.

## Implemented
- Broadside collision framing, procedural waves, contact spray and surface foam.
- Flooding x-ray retains the compartment water geometry, with moving inflow particles tied to its measured model levels.
- Break-up spray, rings and a side camera based on the representative study.
- Underwater bubbles and landing sediment triggered after each existing landing event, not before.
- Close views of existing collapse events and brown sediment clouds; projection badge retained for future states.
- Deterministic effects derived from timeline position, so backwards scrubbing does not retain particles from the future.
- Slower playback at contact, separation, landing and collapse, multiplied by the existing speed choice; video recording uses the same timing rule.
- Titanic cards and gauges below the canvas, preserving the subject view on phones. Automatic camera fitting across aspect ratios; manual rotation/zoom retained.
- Effects disabled in blueprint mode. No people or lifeboats added.

## Verification
- Gate 1: PASS, zero errors/warnings; sourced share 70%.
- Unit tests: 66/66 in UTC and 66/66 in Asia/Seoul.
- Full Gate 2: PASS, 95 shots, including all chapters/events, both styles, x-ray, angles, panels, languages, phone views, lighting, water, projections and four speeds. The speed check integrates the intentional time map with its original tolerance; constant-rate checks remain for other ships.
- Initial full run found three undersized collapse targets and a constant-rate speed expectation. Repaired actual close-up camera distance/target using the drawn, collapsed bounds, and updated the speed expectation to the new playback contract. Final run has zero failing shots.
- Inspected key.png and contact.png; also directly inspected collision, flooding, separation, descent/landing and collapse in the in-app browser.
- In-app browser: 375x812, 768x1024 and 1440x900. At 375px, document width equals viewport width (375). No browser warnings/errors observed. Scene cards are below the canvas.
- Final mobile follow-up found an English projection-badge overlap. Moved the mobile badge below the view controls and rechecked English at 375 and 768; no overlap. Localized the new accessibility labels. These final CSS/label changes were verified in a separate generated review page, then included in the canonical HTML.
- Used timeline keyboard navigation, speed selection, playback, chapter navigation and blueprint toggles. Physical-device touch and screen-reader output remain unverified.
- Source model is byte-identical to Git HEAD. Embedded model matches source except the build-time gate status. At that verification point Britannic and Unfold had no diff; Britannic was subsequently improved in its own pass.
- Evidence: ../.out/titanic-cinematic-verified/{key,contact}.png; ../.out/titanic-cinematic-browser/{desktop-collision,mobile-collapse,mobile-en-projection}.png.
- Final build: examples/titanic.html with gate2=pass; syntax and git diff whitespace checks pass.

## Limits
Water, foam, bubbles and sediment are illustrative. No fluid solver, fracture solver or corrosion prediction model was introduced. Existing estimated/disputed motion and projected collapses retain those classifications. Physical phones, screen-reader output, video encoding/download and measured rendering performance remain unverified.
