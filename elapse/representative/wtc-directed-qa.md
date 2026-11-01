# WTC full-timeline observation update

Date: 2026-11-02

## Result

Integrated the impact study's detailed generic aircraft, forward engine placement, procedural 1024×2048 facade atlas and soft particle textures into the complete 2001–2018 timeline. North and South impacts have independent observation framing. South, North and 7 WTC collapses follow upper movement, descent and ground dust with separate authored camera windows. WTC7 uses a separate roof/penthouse and clipped lower envelope instead of scaling its entire form vertically. Context blocks have procedural facades and setbacks; they are generic massing, not surveyed Manhattan buildings.

Critical intervals slow playback automatically. WTC-specific 0.25× and 0.5× controls supplement the existing speeds. Manual camera and dated exploration remain available. Information slots retain their fixed dimensions.

## Evidence

- Gate1: PASS, zero errors/warnings, sourced share65% (source tagging, not geometry accuracy).
- Unit tests:105/105 in UTC and105/105 in Asia/Seoul.
- Full Gate2:55 screenshots and four playback-speed checks PASS before the final dust size/opacity adjustment.
- WTC focused regression:135 frames PASS (timeline, both styles, fixed slots, dated exploration).
- Final directed-scene checks:54/54 frames PASS at375,768,1440px after dust adjustment: approaches, impacts, smoke and three collapse progress/settling stages. No reported runtime errors, horizontal overflow or failed camera bounds in those states.
- Notre-Dame common-UI regression:117/117 timeline and exploration frames PASS across the same three widths.
- Direct IAB observation: updated controls and South Tower mid-collapse scene confirmed visually.
- Screenshots reviewed: North impact, South impact, South descent, North ground-dust stage, WTC7 descent, and375px impact.
- Final directed screenshots/results: `../.out/wtc-directed-scenes/`; preview: `wtc-directed-preview.png`.

## Interpretation limits

Official event times remain unchanged. Two-minute collapse windows, camera paths, approach paths, fire, smoke, dust and fragments are authored observation effects, not actual duration, surveyed geometry or validated physical/NIST simulation. No people or human remains are depicted. Generic aircraft and surrounding blocks remain estimates. Endpoint remains the2018 milestone. No claim of measured FPS, physical-device acceptance or engineering accuracy is made.

## Additional detail / private-repository delivery

2026-11-02: added estimated rooftop parapets, ventilation banks/louvers and exposed floor-grid/core/columns at the moving collapse boundary. The model generator and on-page limitations identify these as illustrative, not construction drawings. Final directed coverage54/54 at375/768/1440px passes after this addition. A staged-files-only checkout passes all105 tests in each timezone and rebuilds the WTC HTML without untracked local dependencies.

Final full Gate2 after rooftop/cut detail:55/55 shots and four real-time speed checks PASS (`.out/wtc-push-gate2`).
