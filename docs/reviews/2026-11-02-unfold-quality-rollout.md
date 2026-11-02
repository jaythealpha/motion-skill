# Unfold quality rollout and public demo release — 2026-11-02

## Scope

Five existing phones receive a comparable visual-finish pass to Elapse: material-specific physically lit metal/polymer/PCB, clear-coated lenses, procedural micrograin/illustrative circuit/label marks and smoother bevels/curves. Source images, CAD meshes and new external assets are not used. The existing source confidence share is not raised. These details are explicitly estimated. This is a visual enhancement, not a new teardown or hardware validation.

All five original HTML/JSON files are preserved in `trials/unfold-quality-rollout-2026-11-02/before`. `preservation.json` verifies that every original non-metadata field is unchanged: product, part IDs, bounding boxes, geometry parameters, source links, steps and fastening. Mobile/identified software renderers use lightweight Phong finishes, retaining the procedural marks and geometry; other GPUs use Standard/Physical materials. Automated software screenshots do not establish hardware PBR performance.

The renderer tessellates existing surfaces more smoothly without moving part bounds or changing paths/fold transforms. No fictitious electrical components, fasteners or serial numbers are introduced.

## Rendering and behaviour

High quality defaults in model normalization and is explicit in all packaged examples. `?quality=standard` selects the original toon/tessellation path without changing the stored source model. Blueprint/manual retain ink guides; idle colour outlines are reduced, active part outlines retained. The fold spine restores the correct blueprint fill/edges. Screen textures and lit-screen rules remain unchanged.

The first S24 full Gate2 run failed fast playback:8.2 bar units moved instead of approximately16.7. This failure is retained in the log. High-detail tessellation was reduced from3 bevel/20 curve segments to2/12. The existing animation loop also discarded elapsed time beyond0.5s per delayed frame; playback now uses actual nonnegative elapsed time sampled consistently with performance.now() rather than mixing frame timestamps and sampling timestamps, so a slow frame does not silently change the selected speed. This corrects the clock; it does not establish physical-device FPS.

## Elapse release

Commit83ae71c was pushed to main and GitHub Pages reported built at that commit. All7 public Elapse HTML artifacts returned successfully and their SHA-256 hashes match the previously verified local artifacts (`trials/elapse-quality-rollout-2026-11-02/public-verification.json`). Local certificate problems in Python's urllib were bypassed by using system-trust curl; TLS verification was not disabled.

## Verification

Results and screenshots are recorded in `trials/unfold-quality-rollout-2026-11-02/`. Final local verification completed on2026-11-03. Publication is checked separately below.

Physical-device frame rate, thermals, hardware engineering acceptance and previously documented model/source inconsistencies remain outside this visual pass. Smoother geometry and plausible surface marks do not make an official repair manual.

### Startup measurement correction

Flip8's initial fast-speed probe saw0 movement because autoplay could finish during expensive page/shader startup before the measurement began. URL autoplay now renders its initial frame before starting the clock. The speed checker explicitly resets to10 and starts playback after the page has loaded and rendered, then uses the same2-second elapsed-time expectation and unchanged tolerance. This prevents an already-ended timeline being misreported as a speed failure; it does not relax the selected-speed requirement. A separate deliberately delayed-frame test checks that elapsed time is not discarded.

### Clock probe phase alignment

Duo's second run exposed another sampling defect: JavaScript observed a stale bar value while waiting for a slow software-rendered frame. The final probe samples the bar at actual playback tick boundaries over at least2 seconds, using independent performance.now timestamps. It requires multiple ticks, times out without them, and retains the same expected rate/tolerance. It does not count rendered FPS as a pass criterion or claim hardware performance. The old0.5s clamp would still fail under delayed ticks. This timing measurement correction is distinct from the earlier runtime and material fixes.

### Headless scheduling and evidence bounds

S24's second attempt reached the print stage but exceeded the650-second trial-process deadline. Its task-only Chrome was stopped after its headless/profile identity was verified; user browsers were preserved. Shared headless tooling now requests background timer/renderer/occlusion-throttling prevention, synchronized to both skills. Actual process arguments were checked (`headless-config.json`); no elapsed-rate tolerance was relaxed. This is a testing-environment configuration, not a claim of improved physical-device FPS. The shared `.mjs` helper is not embedded in demo HTML and does not alter the already deployed Elapse artifacts.

The75-state responsive pass records SwiftShader for all cases and verifies the lightweight finish, not hardware PBR. No shader-console errors or horizontal overflow were found. The delayed-tick probe moved11.965 versus11.9667 expected. Direct review includes375px Duo/Flip,768px iPhone17Pro,1440px S24 and Fold8 knolling views.

## Final local delivery —2026-11-03

-5/5 models Gate1 pass; latest full Gate2 counts:S24 53, iPhone17Pro53, Duo58, Fold8 58, Flip8 58 (280 total). Latest-log mapping and final HTML hashes are in delivery-manifest.json. S24 and Duo used at most3 full attempts; failed/timeout logs remain separate, not counted as completed checks.
-Responsive high/standard and colour/blueprint/layout checks:75 states at375/768/1440px pass. Shader errors0, horizontal overflow0; delayed-frame clock assertion passes. Full gates cover screens, fold states, four speeds and print output. New actual-frame sampling still requires at least2 seconds and multiple frames, with unchanged rate tolerance.
-43 Unfold tests pass;110 Elapse tests pass in each of UTC and Asia/Seoul. Shared-copy consistency and diff whitespace checks pass. The original non-metadata model data is preserved for all5 phones. Final rebuild adds pass metadata and the same verified rendering implementation; the Fold8 bundle also includes the common initial-render-before-autoplay fix exercised by the other final gates.
-Direct screenshot review:all5 subjects represented across mobile/tablet/desktop; Flip8 printed step reviewed. Existing layout/controls and source-confidence labels retained. Estimated surface detail and prior product/source limitations remain visible.
-Complete local artifacts:5/5; unresolved requested artifact failures:0. Failed historical attempts are superseded, not erased. Physical-device FPS, thermals, hardware PBR performance, specialist engineering accuracy and comprehensive accessibility audit remain unverified. No official repair-manual claim is made.
