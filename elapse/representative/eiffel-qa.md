# Eiffel construction and inspection QA

Date: 2026-11-01. Local browser evidence only; no deployment or physical-device approval.

## Scope and result

Status: passed for the Eiffel educational building template. Six construction chapters and six inspection stops are implemented. Unsupported building types are rejected. Notre-Dame and World Trade Center examples are not implemented.

- Gate 1: no errors or warnings; sourced share 43%. This is the proportion of tagged items, not a geometric accuracy score.
- Elapse unit suite: 90/90 in UTC and 90/90 in Asia/Seoul.
- Full Eiffel Gate 2: 48 screenshots/checkpoints passed, including milestones, both styles, language and speed controls. Evidence: `../.out/eiffel-gate2/`.
- Focused building check: 60 frames passed across 375, 768 and 1440 px. Includes both styles, seven timeline checkpoints, all six inspection stops, fixed information-card positions, return-date preservation, disabled unbuilt stops and absence of ship ecology controls. Evidence: `../.out/eiffel-focused/results.json`.
- Manual browser: construction in progress, completed overview, first platform, English mobile blueprint, lighting, zoom, reset and return to Timeline checked. Screenshots: `../.out/eiffel-browser/`.
- Manual browser console: no captured warnings or errors. Keyboard-labelled native selects and buttons are present; reset canvas accessible name corrected to building/inspection wording. Exhaustive screen-reader and real-device testing not performed.
- Standalone copied-skill Gate 1/build succeeded without original-repository paths in output. Shared-file synchronization and whitespace checks passed. This is not proof of unattended research or installation across every OS.
- Ship regression: Titanic quick Gate 2 19/19 and Britannic quick Gate 2 13/13 passed in sequential local Chrome runs. The earlier parallel attempts timed out and were interrupted; their separate failed evidence folders are not accepted results. Final output folders: `../.out/titanic-building-final/` and `../.out/britannic-building-final/`.

## Visual and interaction findings

Fixed the mobile date typography and drawing-note width to prevent controls colliding with captions. Desktop lower annotation is bounded to 390 px rather than covering the whole stage. Information cards keep their slots as date, stage and drawing style change. Exploration locks historical time, disables unavailable stops and restores the previous timeline date/view. Open lattice buildings do not expose the ship x-ray or biological-motion controls.

Representative views were inspected at 375, 768 and 1440 px. No remaining P0/P1/P2 issue identified in these tested states. User-selected close-up framing intentionally crops surrounding members; Reset restores overview. SVG annotation overlays are not included in canvas-only image/video exports (existing export limitation).

## Evidence limits

Official SETE history supplies construction milestones; reference dimensions distinguish the 300 m main structure from historical flagpole fittings and present-day antennas. Lattice curves, individual members, foundations, pavilions, temporary works, RGB paint and intermediate assembly are independently generated approximations. Subgrade is deliberately exposed for explanation. Height ratio is labelled as geometry, not work completion percentage. No stress analysis, lifting sequence validation, measured CAD, surveyed facade or certified engineering/manual claim is made.

No source photos/scans were downloaded or copied. Source links and research boundaries are in `../research/eiffel-notes.md`. This update does not publish or push the repository or synchronize globally installed skill copies.
