# Britannic directing pass — 2026-11-01

Status: passed (local browser-viewport and automated checks; limits below).

## Scope
Improve the original flooding, capsize/descent and seabed scenes. Existing five chapters, timing, compartment levels, roll/trim/heading, crumpled bow, funnel paths, growth and source confidence remain in the model. No new break-up or predicted collapse was invented. Britannic's descent is part of its existing capsize chapter.

## Implemented
- Daylight turquoise waves, damage-point spray and surface rings.
- Flooding inflow particles tied to existing compartment levels in x-ray mode.
- Deck-facing roll camera, surface foam, underwater bubbles and post-contact sediment at bow impact and final settling.
- Underwater camera for the shallow wreck, aspect-aware subject fitting and deck-side seabed exploration views.
- Seeded neutral seabed grain and sparse suspended particles. These are illustrative texture/lighting, not site mapping.
- Slow passages around explosion, rolling and funnel collapse, multiplied by the existing speed options. Timeline scrubbing remains reversible; video uses the same time map.
- Cards and gauges below the canvas, keyboard timeline labels and reduced-motion autoplay guard, shared with Titanic.
- Blueprint omits the added illustrative effects. Manual camera remains available.

## Verification
- Gate 1 PASS: zero errors/warnings; original confidence share remains 29% sourced.
- Unit tests: 67/67 in UTC and 67/67 in Asia/Seoul.
- Initial full Gate 2: 71/71 shots passed. Final full Gate 2 also PASS: 71/71 shots, including the final seabed camera and texture. Reviewed key.png and contact.png. No remaining P0/P1/P2 found in these checks.
- Titanic regression: 19/19 quick Gate 2 shots passed using the current shared engine. Its delivered HTML is preserved.
- In-app browser: 375x812, 768x1024 and 1440x900. Inspected flooding, rolling/waterline, post-contact sediment, descent and seabed. At 375px, document and viewport widths both equal 375; no horizontal overflow. Context may extend beyond a close-up of a selected piece, while the target stays visible.
- Confirmed keyboard timeline movement, speed selection and blueprint switching. Browser error/warning log empty.
- Source Titanic and Britannic JSON files are byte-identical to Git HEAD; no change to historical data or source classifications.
- Saved browser evidence: ../.out/britannic-browser/mobile-flooding.png, mobile-seabed.png and desktop-descent.png.
- Syntax and diff whitespace checks pass.

## Boundaries
Existing model is only 29% sourced; the rest remains marked estimated/disputed. No new historical research or physics solver was introduced. No people or lifeboats drawn. Physical devices, screen readers, export encoding and measured performance remain unverified.
