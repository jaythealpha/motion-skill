# Sampoong representative study design QA

Status: **superseded visual iteration**. The functional checks below describe the first study; the user subsequently rejected its visual detail. They do not establish artistic acceptance. See `../civil-detail/design-qa.md` for the updated local detail pass.

Reference: existing Elapse study controls, the Seoul Institute June1995 exterior photograph, Seoul's aftermath image and the structural concepts in Gardner/Huh/Chung2002. Evidence boundaries are in `elapse/research/sampoong-study-notes.md`; this is not photogrammetry, recovered as-built plans or a physical failure simulation.

## Actual coverage

-375/768/1440px:18 scene/viewport states and60 language/state/viewport cases (en/ko/ja/zh/es × four stages × three widths). No horizontal/text overflow, nonfinite geometry or valid-scene console errors was found.
-84 total browser checks: the78 cases above, controls/rewind, a warm render timing run, reduced-motion autoplay, two cold viewport loads and an intentionally disabled-WebGL fallback check. The injected renderer failure correctly shows a labelled error and an enabled Retry control; it is not counted as a successfully rendered3D scene.
-Five pure-motion/language tests pass: ordered contact rather than slab overtaking, sequential support/loss, reversible seeking, actual slow playback and complete authored five-language text/error states.
-Visible Chrome flow: local HTTP page opened, restarted and played to the residual state; final camera revision reloaded atp=.43 and retained as the review tab.
-Controls verified: section/exterior, restart/play/pause, full-timeline language link, deterministic backward scrubbing. Reduced-motion suppresses autoplay. Semantic buttons/combobox/range labels, visible keyboard-focus rules and error messaging are present. Full screen-reader and native-language editorial reviews remain unverified.
-Evidence screenshots/results: `trials/sampoong-study-2026-11-03/final-delivery/`. The initial prototype screenshots are retained separately under `first/` and `second/`; they are not final-delivery evidence.

## Corrections from direct screen inspection

-Removed the camera's overshoot that made the model too small; final projected focus-box area is about20% desktop /35% narrow, with100% inside the viewport at the checked pose.
-Changed the former window-ribbon exterior to broad pink fields, vertical glazing and stepped core/roof forms. Added original materials, panel joints, round columns/drop panels and separate roof equipment.
-Limited dust during the readable cascade, shifted to a lighter mineral palette and delayed broad near-ground dispersion. Added independent concrete/glazing/rebar pieces and nonuniform residual slab poses.
-Fixed the information panel, record date, floor status rows and controls in stable layout regions. Automatic cutaway is explicitly distinguished from the actual exterior; the observation time bar is not presented as a measured event clock.

## Applied performance configuration

Native headless Chrome / ANGLE Metal / AMD Radeon Pro5300. Valid timing ran without other headless browser jobs or unit tests.120 warm intervals at1440×1050. The actual canvas area was1202×680 CSS pixels; renderer DPR2 and2404×1360 buffer were explicitly checked on a fresh page load. p50=16.7ms, p95=17.5ms; zero intervals over50ms;61 draw calls. A separate warm DPR1 run also passed; it is not mislabelled as DPR2 evidence.

The375px cold load selected the lightweight material path with renderer DPR1.5 and517×840 buffer. This is desktop browser emulation, **not** a physical-phone performance benchmark or long-run stability result.

No open P0/P1/P2 was identified in the checked local scope. Remaining limits: schematic context masses, estimated plan/profile coordinates and choreographed rather than measured fracture. Final artistic acceptance and historical-motion validation remain separate from this QA result. No public deployment or whole-timeline replacement is part of this representative-scene delivery.
