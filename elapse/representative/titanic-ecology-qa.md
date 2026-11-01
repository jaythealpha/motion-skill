# Titanic ecology QA — 2026-11-01

Status: passed for the inspected local implementation/UI scope. No P0/P1/P2 issue remains in that inspected scope; scientific and device limits below remain explicit.

## Change and preservation
Added observation-inspired small coral, sponge and rattail-type models, two virtual survey lights and settling particles. Context and three macro views let the camera show small organisms without exaggerating their physical scale. Original model JSON, dated events, split/burial tracks and confidence shares are unchanged. Source research and all estimated geometry are separated in `../research/titanic-ecology-notes.md`.

## Verification record
- Unit tests: 80/80 UTC and 80/80 Asia/Seoul, including observation-window exclusions, deterministic bounded fish motion, downward particle wrapping and metric ruler sizing.
- Gate 1: Titanic PASS (0 errors / 0 warnings, 70% sourced); Britannic PASS (0 / 0, 29%). Percentages refer to the original temporal model, not added ecology meshes.
- Dedicated ecology check: PASS 12 frames (context/coral/sponge/fish × 375/768/1440 px), >=60% target in view, >=2% stage area, no horizontal overflow or page-reported errors. Also fauna/light toggles, blueprint/x-ray exclusion, historical/future exclusion, pause/play and reduced motion pass.
- Full Titanic Gate 2: PASS 95/95 shots, with key/contact sheets and the modern dated-collapse shot visually inspected. The last focused-control persistence and compact mobile-caption edits were then verified on the final rebuilt HTML with the dedicated 12-frame ecology test and actual browser; they do not alter geometry, tracks or default camera. One earlier exploratory Gate 2 run was intentionally interrupted for a visual refinement, not counted as a completed run.
- Existing detail-camera regression: PASS 39/39 states, three widths across entry/hold/exit.
- Fixed-slot layout regression: PASS 30 states, both styles × 3 widths × 5 timeline positions. Explanation, year, water levels, depth and playback retain their positions.
- Britannic quick Gate 2: PASS 13 shots, contact and key sheets visually inspected. No Titanic ecological objects or controls added to Britannic.
- Actual in-app browser: 375×1000, 768×1000 and 1440×1000. All three macro subjects and context inspected; colour/blueprint and Korean/English switching checked. Found and corrected English mobile annotation overlap with camera buttons. Keyboard Tab/Enter operates ecology selection and retains focus on the selected control after updating. Console errors/warnings: none observed in the inspected in-app session.
- Evidence files: `../.out/ecology-final-ui/`, `../.out/titanic-ecology-gate2-final/`, `../.out/titanic-ecology-browser/`, `../.out/titanic-ecology-layout.json`, `../.out/britannic-ecology-regression/`. These are Git-excluded local evidence.

Final HTMLs rebuilt with `--gate2 pass`. Shared-copy check, syntax checks and `git diff --check` pass. No new dependency. No production deployment, Git push or global skill-install mutation.

## Limits
Species-level morphology, individual colony locations, size, abundance and paths are estimated. The 1986–2022 observation context is not a year-by-year population reconstruction. No full-text/photo review of the primary paper was possible (direct PDF/publisher access 403); accessible author record and indexed body passages support group-level choices and habitat distinctions. No source images/scans embedded. Physical devices, screen-reader experience, quantitative FPS/performance and video encoding remain unverified. SVG explanatory annotations remain outside canvas-only exports. Existing historical timeline playback is user-controlled; reduced motion freezes the newly added ecological motion.
