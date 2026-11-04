# Opera House follow-up — design QA

Status: passed for the bounded illustrative model and tested browser flows.

Scope: the existing Opera exterior/interior and construction/inspection flow. Preserve event/chapter dates, all5 people's records and3 scoped numeric facts, the120×180×67m approximate envelope,8 inspection IDs, five languages and existing UI slots. Other subjects' authored models and existing user installations remain unchanged. Evidence and estimates are detailed in `elapse/research/sydney-notes.md`.

## Corrections

- The previous mirrored great-circle ridge calculations left an unintended gap of up to21.12m in the largest model patch. Use a shared centre-plane small-circle ridge and level springing edges; interpolate across the75m working-radius sphere. Both75m sphere and70m ridge radii remain model assumptions, not surveyed measurements. Tests now check joined ridges as well as radius/bounds. Close free panel edges and remove duplicated centre ribs/caps.
- Curved seat centres no longer sit on straight treads. One estimated coordinate model drives tread outlines, seat position/orientation and chair supports. Added arms and solid balcony fronts. An open central timber ceiling section improves visibility instead of a screen-wide series of concrete arches.
- ARM's own renewal project description supports horseshoe stage lifts, diffusing box fronts and eastern-side access to the Northern Foyer lift. Show the illustrative risers/diffuser treatment only in the renewal state. Correct the previous west-side path; exact routing, lift position and profiles are still estimates, not public visitor directions or operating instructions.
- Reframe the hall within the existing component/slot layout. Keep the3D scene explanatory, with no real people, photographic assets, copied plans or acoustic/accessibility certification.

## Checks and direct inspection

-156 unit tests pass in UTC and156 in Asia/Seoul; locale unit tests3 pass. New regressions cover ridge coincidence, level springing, chair support on the matching tread, orientation toward the stage and riser envelope. Shared copies synchronized; whitespace diff check clean.
- Focused Chrome checks90/90 at375,768,1440px: colour/blueprint, forward/reverse history, fixed card/gauge positions,8 stops, disabled unbuilt stops, locked date and1973/1979/2023 organ/renewal visibility.
- Full Gate2 passes49 shots, including chapters/events, angles, mobile/tablet and all existing speed presets. Water/projection checks are correctly inapplicable.
- Five-language browser QA15/15. Source/record browser QA79/79, including reader/scene transitions and no-JS/WebGL-failure fallbacks.
- Directly inspected wide roofs, roof/rib close-ups, hall cutaway and renewal at1440px, and hall/glazing at375px. The connected roof, matched treads and clearer hall view resolve the identified P1/P2 issues within the declared illustrative scope. No new inputs/error states or layout redesign were introduced.
- Detailed browser probe:346 geometry-bearing objects,0 non-finite values;325 meshes and6444 instances stable over30 reverse seeks. This is a population-stability check, not a full heap-leak audit.
-90-frame isolated GPU playback: median16.7ms,p9517.4ms,266 draw calls,353544 triangles on AMD Radeon Pro5300 / ANGLE Metal at1440px. Physical iOS/Android and universal frame-rate guarantees remain unverified.
- Fresh isolated-folder builds12/12 byte-identical: Opera generator/evidence compilation,7 existing Elapse examples,3 scene studies,1 Unfold example. Existing7 model JSONs are preserved; other HTMLs are rebuilt solely to synchronize their embedded import maps.

Evidence: local screenshots and JSON reports under `trials/opera-refinement-2026-11-04/`. Expert/surveyed architectural accuracy, physical-device acceptance and screen-reader audit remain unverified. No P0/P1/P2 functional or responsive issue remains in the checked flows; this does not certify architectural or structural correctness.
