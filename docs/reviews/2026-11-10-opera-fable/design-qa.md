# Sydney Opera House · Fable 5.2 representative study

Status: **passed for the tested local browser paths**. No known P0/P1/P2 issue remains
in those paths. This does not certify surveyed geometry, photorealism, physical-phone
performance, acoustic accuracy or every GPU's behavior.

## Delivered

- `elapse/examples/opera-art-study.html`: self-contained 36-second study (1,082,959 bytes).
- Three authored camera shots: harbour approach, ceramic/shell close-up, Concert Hall.
- Original/improved switch and same-camera still comparison. Comparison pauses playback;
  moving playback renders one scene per frame with one WebGL renderer.
- Five languages; English without a query. Explicit `lang` preserves time, version and speed.
- 0.25/0.5/1/2x speeds, seek, reset, keyboard controls, visible keyboard focus.
- `operaForm(root)` retains its existing resolution by default. The extra resolution is
  opt-in, bounded, and disabled on the small/software tier.
- Original timeline HTML/JSON, records and source dates are unchanged. No robot edits,
  merge, commit, push or public deployment was performed.

## Fable and review work

Fable `claude-fable-5-2` wrote the new art-pass module from a new-function specification
and public facts. Estimated CLI API cost: **USD 1.730282**. Source files were not sent:
full-source transfer was rejected by automatic approval, and a different specification-only
request was approved. The model output hash and integrated hash are in `fable-provenance.json`.

Codex inspected the code, integrated it, and visually reviewed the actual browser output.
Review corrections included the roof camera, excessive timber bump/noise, glazing reflection,
an explicitly estimated hall backdrop/section finish, interior light/shadow balance,
comparison whitespace, canvas keyboard filtering/focus and portable original-page links.
The 18 existing overhead reflector meshes are preserved; finishing coordinates are estimates.

## Browser evidence

Local in-app Chromium, ANGLE Metal / AMD Radeon Pro 5300. Temporary viewport overrides
were reset after QA. Browser zoom changed during the session; effective CSS widths were
read from the page, not inferred from requested window pixels.

- Actual CSS 375x812, 768x1024, 1440x1000: inspected rendered screenshots, no horizontal
  overflow. Evidence: `mobile-375.jpg`, `mobile-hall-375.jpg`, `tablet-768.jpg`,
  `comparison-1440.jpg` beside this report.
- **15/15 locale/layout cases:** five languages at each CSS width. Time was preserved;
  desktop additionally checked speed preservation and the original link's language.
- Both comparison images loaded with matching native dimensions. Comparison paused playback
  and returned to the scene. Large empty letterbox areas were removed.
- Play/pause, reset, three shot buttons, seeking, quarter speed, version keys 1/2, Space,
  arrow seeking, Tab/Shift-Tab focus and the original-language link were exercised.
- Canvas keyboard focus is a 3px blue outline. Normal final-page console warnings/errors: **0**.
- Scene metrics record no renderer errors. Static build audit finds 14 inline modules, no
  remote script/style dependency; served HTML bytes equal the generated file.

## Animation performance

Same renderer/page/GPU and matched CSS 1440x1000, DPR 1.1, canvas1148x640. Frame intervals
are measured from actual requestAnimationFrame playback, separately from CPU render time.
Counts differ because seeks/pauses occurred; this is a local interactive sample, not a lab
benchmark or physical-device result. Bounded rolling samples are reported by shot.

| Shot | Original median / p95 ms | Improved median / p95 ms | Original / improved samples |
|---|---|---|---|
| Harbour | 16.7 / 18.3 | 16.7 / 18.4 | 719 / 900 |
| Shells | 16.7 / 18.4 | 16.6 / 18.5 | 780 / 372 |
| Hall | 16.6 / 18.5 | 16.7 / 18.3 | 660 / 275 |

One >50ms interval occurred in the final improved interactive run; do not claim zero
stutters. Overall rolling render-call medians were1.1ms original and1.4ms improved;
these CPU timings are not frame rate. Earlier heavier art-pass iterations had visible
frame regressions and were not accepted. Fixes removed duplicate light loops and stacked
procedural-noise layers, reduced six water waves to four, bounded shell tessellation,
and moved shader compilation/GPU setup before playback. Paused views retain full image
resolution; no motion-time resolution reduction was used in the final pass.

The measured geometry/texture population stayed bounded while switching and seeking.
The final endpoint uses58/59 draw calls depending on the light/view state. Local detailed
reports are in ignored `trials/opera-fable-study/`, including `opera-final-performance.json`,
locale JSON files, console output and the build audit.

## Checks

- Baseline Elapse tests:158 passed in UTC and158 in Asia/Seoul.
- Final Elapse tests:161 passed in UTC and161 in Asia/Seoul (322 successful executions).
- Three new tests cover finite/responsive camera framing, deterministic endpoint/shot states,
  and complete five-language keys. Existing shared-ridge and historical state tests pass.
- Build and JavaScript syntax checks pass; `git diff --check` passes.
- The unrelated Unfold suite and general ship/building Gate2 matrix were not rerun: no shared
  library or timeline renderer entrypoint was changed. This companion is not labelled a full
  historic-timeline Gate2 rerun.

## Sources and limits

Public source text was retrieved on2026-11-10; no source pictures/meshes were downloaded.
- https://www.sydneyoperahouse.com/our-story/the-spherical-solution
- https://armarchitecture.com.au/projects/sydney-opera-house-concert-hall-renewal/

120mm ceramic tile descriptions and18 renewal reflectors are sourced. Shell cuts, the
working radius, tile placement, joinery, lighting, water reflection and camera are authored
estimates. The backdrop is an explanatory interior finish, not a measured reconstruction.
Historical context remains November2023; no new historical event/date was invented.

Unverified: physical phones/tablets, forced GPU/context loss, manual OS reduced-motion
preference changes, translation by a native-language reviewer. Reduced-motion pause,
loading/error UI, retry and no-JS evidence link are implemented; their exceptional environment
paths were not forcibly exercised. No public deployment is included.

## Reproduce / review

Worktree: `/Users/jay/.codex/worktrees/opera-fable-study/motion-skill`
Branch: `codex/opera-fable-study`, based on main`dbaa0a7`.

From that worktree:

```sh
node elapse/scripts/build-opera-study.mjs
npm --prefix elapse test
python3 -m http.server 8766 --bind 127.0.0.1
```

Compare: http://127.0.0.1:8766/elapse/examples/opera-art-study.html?lang=ko&p=0.8055556&compare=1

Play: http://127.0.0.1:8766/elapse/examples/opera-art-study.html?lang=ko&play=1
