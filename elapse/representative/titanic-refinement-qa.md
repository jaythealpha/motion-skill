# Titanic ecology refinement — 2026-11-01

Status: passed for this inspected local scope. No P0/P1/P2 issue remains in the inspected flow; evidence limits remain below.

## Findings and implemented corrections

| Finding | Priority | Correction | Evidence |
|---|---|---|---|
| Macro organism view retained an unrelated historical-event card | P2 | Contextual coral/sponge/fish card with estimated badge, study window and source; historical card returns in Context | Flow steps 1–3 below; dedicated ecology check |
| Macro host steel looked uniformly smooth | P3 | Seeded procedural irregular staining and fine tonal grain on the bow-rail and stern-house colour materials in the observation window | Prior and updated 1440px coral images visually compared together |
| Coral used many separate tiny meshes | P3 | Merge by material without changing transformed vertices/normals; 212 meshes become four for the two colonies | Runtime diagnostic `coralMeshes === 4`; visual comparison |
| Macro camera far clip was overwritten by the normal scene fit | P3 | Retain a shorter far range after fitting, while normal scene range remains unchanged | Macro framing checks; in-app screenshots |

No new animal types, species identification, measured colony coordinates, abundance or growth rates were introduced. Source JSON, dates, tracks, dimensions, source percentages, blueprint and existing fixed slots are preserved. Weathering is an independently authored visual estimate, not a photographed/measured corrosion map. The original study and access limits remain in `../research/titanic-ecology-notes.md`.

## Inspected flow
1. **Context — healthy.** Historical event card, source and year are visible. The existing bridge/deck camera remains the contextual scene.
   ![01 Context](/Users/jay/motion-skill/elapse/.out/refinement-browser/01-context.png)
2. **Organism close-up — corrected and healthy.** Matching explanation and source replace the unrelated historical card; estimate wording remains explicit. Canvas accessible name identifies the focused subject. Keyboard focus remains on the selected button. Tab/Enter was also exercised in the in-app browser.
   ![02 Coral](/Users/jay/motion-skill/elapse/.out/refinement-browser/02-coral.png)
3. **Return to Context — healthy.** Original historical card and camera return without moving the information slots.
   ![03 Return](/Users/jay/motion-skill/elapse/.out/refinement-browser/03-return.png)

All three macro subjects were inspected in the in-app browser. Screenshots cover 375×1000, 768×1000 and 1440×1000, including English mobile text. The previous 1440px screenshot and new 1440px screenshot were inspected together to compare layout preservation, surface changes and card content. No new design direction or external assets were introduced.

## Checks
- Unit suite: 80/80 UTC and 80/80 Asia/Seoul.
- Gate 1: Titanic and Britannic PASS, zero errors/warnings; original model JSON unchanged.
- Fixed layout: PASS 30 states, both styles at all three widths.
- Dedicated ecology: final material PASS 12/12 frames at three widths, plus historical-card restoration, macro-card matching, exclusions, pause/play, reduced motion, keyboard focus and merged-mesh count. Evidence: `../.out/ecology-refinement-final/`.
- Full Titanic Gate 2: PASS 95/95 shots; key/contact sheets inspected. Evidence: `../.out/titanic-refinement-gate2/`.
- Britannic quick Gate 2: PASS 13/13 shots; contact sheet inspected.
- Both offline HTML examples rebuilt with `--gate2 pass`. No failed final checks. Four scoped corrections implemented and verified; physical-device/FPS validation not executed.
- Syntax, shared-copy synchronization and whitespace checks pass. No new dependencies or external media.

## Evidence limits
The procedural marks are not an accurate material/degradation simulation. Mesh-count reduction is verified, but FPS/performance improvement is not measured. Physical devices, screen readers, taxonomic shape accuracy, video encoding and the existing canvas-only export omission of SVG annotations remain unverified. New canvas subject labels improve semantic context but do not prove screen-reader usability. This review is scoped to the actual local flow above.
