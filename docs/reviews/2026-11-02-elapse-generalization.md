# Elapse common UI and inspection regression — 2026-11-02

Status: implementation and scoped browser checks complete. No publication or installed-copy replacement.

## Changes

- All topics use the existing fixed cinematic information layout, independent of the subject-specific director. Description, date, water-level and depth slots are outside the canvas.
- Generic ships gain hull overview inspection. Optional `stops` defines part targets, angles and local-x framing; an explicit empty array disables it. Gate 1 validates references, unique ids, angles and crop fractions.
- Inspection uses an actual non-projection year chapter instead of hardcoded 85/90 positions, and restores the previous time/view on exit.
- Optional ship chapter `playbackRate` (0.1–2) configures pacing independently of subject-name branches. Model camera keys remain the camera contract. Existing dedicated building directors are unchanged.
- Missing compartment evidence is stated in the fixed gauge. Unsupported independent fauna motion remains disabled with an explanatory message.
- Gate 2 now rejects intersecting information widgets, adds a short-phone capture and a tablet capture, and accounts for declarative pacing when checking speeds.
- Layout regression tests widths AND heights, stable geometry over time and intersecting widgets. Skill instructions and format reference document the contract and require full-size screenshot review.

## Evidence

Artifacts: `trials/elapse-generalization-2026-11-02/` (local, ignored).
The earlier first-install trial and its failure screenshots were preserved unchanged.

- `npm test --prefix elapse`: 107 tests per timezone, UTC and Asia/Seoul, all pass.
- `node scripts/sync-shared.mjs --check`: pass.
- Lusitania Gate 1: zero errors/warnings, unchanged sourced share 14%.
- Lusitania full Gate 2: 54 screenshots pass, all four speed presets checked.
- `layout.json`: 40 states (375×667, 375×812, 768×1024, 1440×900 × two styles × five times); stable slots and no intersections/overflow.
- `generic-results.json`: 48 layout states across Lusitania, Titanic, Britannic, Eiffel Tower, Notre-Dame and WTC; six inspection entry/return flows pass, history controls locked and targets in frame.
- Full-page Lusitania screenshots at 375/768/1440 inspected; the previous mobile description/clock collision is resolved. Mobile content scrolls vertically; information stays in reserved slots.
- Native in-app browser: new local page opened and inspection selected; locked date, hull overview, lamp control and disabled timeline visibly confirmed.

## Design QA

Scoped status: passed for the reported card/gauge overlap, fixed positions and generic inspection flow. Existing layout and styles reused. No known P0/P1/P2 in this scoped flow. This is not approval of the generic ship's geometric fidelity or of all screenshots of every pre-existing example. Basic labels, focus CSS, disabled controls and scrollable description region preserved; exhaustive assistive-technology and physical-device testing not performed.

## Limits

No new historical facts, source images, measured hull plans or wreck survey meshes were added. Lusitania's generic wreck geometry remains approximate; no claim of detailed archaeological reconstruction. Dedicated event effects/ecology still require subject-specific work. Generic effects were not automatically generalized. Explicit-stop validation has unit coverage; the browser unfamiliar-ship test exercises the automatic overview. No cold-agent/Claude Code discovery test, performance benchmark or real-device verification. Public Pages and existing installed skills unchanged. Repository example HTML files were preserved; six updated builds are isolated in the trial directory.

Counts: six HTML builds successful; 54 full-Gate2 captures, 40 layout states, 48 cross-topic layout states and six inspection round trips successful. Failed final checks: zero. Remaining detailed wreck geometry: deferred by the approved sequence.
