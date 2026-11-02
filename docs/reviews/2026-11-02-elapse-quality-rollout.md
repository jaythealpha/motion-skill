# Elapse example quality rollout — 2026-11-02

## Scope and preservation

The approved Britannic fracture art pass is the visual direction. This rollout applies a comparable, subject-specific level of authored geometry/material detail to five packaged timelines and two scene studies. It does not turn all subjects into the same wreck model or claim measured CAD fidelity.

Previous seven HTML files and five JSON models are preserved under `trials/elapse-quality-rollout-2026-11-02/before/`. `model-preservation.json` compares all original top-level fields except metadata, source annotations and declared inspection stops; all five retain the same historical chapters, events, dimensions, poses, environment and geometry inputs. Unfold examples are unchanged. No publication, deployment or push is part of this delivery.

## Implemented

| Example | Subject-specific detail |
|---|---|
| Titanic | PBR surface treatment and rust ageing; separately opened bow/stern cut faces; thick torn sheets, bent internal members and torn lips; two dedicated fracture inspection stops. Uses its own existing cut coordinates and motion. |
| Britannic | Packages the approved damaged skin, thick irregular fracture rims, bent beams/decks/pipes, equipment and six inspection targets in the canonical example. |
| Eiffel Tower | Built-up iron profiles within the existing beam envelope, joint plates and platform stanchions/rails; new detail follows existing construction groups and clipping. |
| Notre-Dame | Estimated arch/cornice blocks, stone-course treatment, roof panel seam ribs and reconstructed timber joint details; attached to original dated masonry/roof/timber groups. |
| World Trade Center | Physical vertical facade members, anti-aliased analytic facade shading, estimated steel/slab rubble and rooftop service detail tied to dated building groups. Individual inspection isolates the selected structure from neighbouring buildings that could occlude it; the timeline retains the full dated site. |
| Titanic break study | Uses the updated Titanic geometry/material rendering. |
| WTC impact study | Updated physical facade members and anti-aliased surface treatment. Existing aircraft, effects and event sequence retained. |

High quality is declared in the packaged models and their research generators. Additional modules are bundled in the single offline HTML through the existing import-map build; no runtime asset download, new npm dependency, paid generation, source scan, photo or third-party mesh is introduced. Blueprint and x-ray modes remain available.

## Corrections found during verification

- ACES tone mapping desaturated Titanic's emissive windows enough to fail the existing warm-window Gate2 check. Window point material now opts out of tone mapping; the checker was not weakened. The initial failed log is retained.
- Close-up screenshot review found WTC context massing obscuring the memorial inspection view. The initial context-only fix was insufficient: a dated rebuilt building also blocked the memorial. Individual inspection now isolates the selected structure from neighbouring buildings; return restores the full timeline scene.
- Notre-Dame arch blocks were adjusted to follow the existing quadratic arch contour rather than a straight V through the glazing.
- The distant WTC facade texture produced moire; analytic window shading uses derivative-based anti-aliasing and distant averaging.

## Factual and licence boundaries

All added structural/material details are independently authored estimates; historical data, source confidence shares and time tracks are not upgraded to sourced by adding geometry. WTC detail is not a structural failure simulation; ships are not survey models. Existing source links and third-party notices remain in the offline builds. No people or remains are depicted.

An existing Titanic height-datum ambiguity is now explicit: the model's 22.3m depth is an upper/B-deck modelling reference, while research notes describe approximately 19.7m moulded depth to C deck. This rollout preserves coordinates and poses rather than silently relabelling or rescaling the ship. Gate1 consistency is not independent confirmation of the original datum.

## Verification evidence

Final results are recorded in `trials/elapse-quality-rollout-2026-11-02/check-results.json` and `final-check-results.json`; screenshots/logs are beside those files. All seven requested HTML artifacts are regenerated and locally verified. The first failed Titanic Gate2 attempt is preserved as a superseded failure; the corrected attempt passes.

Physical mobile devices, hardware FPS/thermal behaviour, archaeological/engineering expert sign-off and updated public Pages delivery are unverified. Headless browser timings do not establish device performance or final visual acceptance.

### Completed checks

- Gate1: all five packaged models pass.
- Full Gate2: Titanic97, Britannic73, Eiffel50, Notre-Dame54, WTC57 shots pass (331 shots total). Titanic's first attempt failed on emissive windows; the corrected second full attempt passes with80 warm pixels before power loss and0 after. Logs retain both attempts.
- Focused responsive checks: Eiffel60, Notre-Dame117, WTC135, directed WTC54, ship inspection36, ecology12 and WTC study21 frames pass. Each applicable check covers375/768/1440px; ecology also verifies toggles, pause and reduced motion. Notre-Dame focused checks use the adjusted arch detail. WTC's final broad check separately covers the later context-occlusion correction.
- Unit/data tests:110 pass in UTC and110 in Asia/Seoul;0 failures. Shared-copy consistency and `git diff --check` pass.
- Screenshot review includes Eiffel1440 first platform, Notre-Dame1440 buttress and375 post-fire state, WTC1440 timeline/inspection, Titanic/Britannic key sheets and Titanic375 fracture detail. The obstructed WTC inspection screenshot was treated as a real defect despite its passing automated framing metrics.

### Final delivery status

- All7 examples /3 widths /240 chronological, style, inspection and representative-scene states pass in `verified-qa/results.json`.
- After the final WTC neighbour-isolation correction, its135 focused frames and39 broad states pass again (`checks/wtc-final-focused.log`, `wtc-final-qa/results.json`). Direct375/1440 screenshot review confirms the memorial footprint is no longer blocked. The2010 state precedes memorial completion; it intentionally shows footprints rather than the finished2011 pools.
- Two additional Titanic fracture close-up shots pass. Final rebundling changes Gate2 metadata and includes the same verified runtime source; `delivery-manifest.json` records final hashes/sizes.
- Completed:5 timelines +2 studies. Unresolved requested artifacts:0. Published/deployed in this turn:0. Real devices/hardware performance and specialist accuracy acceptance: not executed.
- Local demo gallery was opened in the browser. New authored detail remains an estimated explanatory reconstruction; this is not photorealistic survey output or a guarantee for arbitrary future topics.
