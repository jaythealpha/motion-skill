# Britannic seabed detail study — 2026-11-01

Status: passed (local browser checks and automated gates; limits below).

## Scope
A representative bridge/deck/gantry close-up at timeline 90, with the original overview retained elsewhere. No changes to the source time model, sinking tracks, wreck attitude or historical events. Existing publication-preparation document edits are preserved separately.

## Added visual detail
- Estimated hull porthole patterns: three-dimensional rims and dark inner faces.
- Deckhouse window panes and frames, two-height railings, stanchions and fine deck seams.
- Schematic vent pipes; gantry cross-bracing, outreach arms, hanging cable and winch drum.
- Funnel seam bands and lip rings on the existing detached funnel geometry.
- Seeded colonies of generic marine encrustation, with count increasing with the existing rust track. No species or surveyed placement is implied.
- Rough standard materials, age-driven procedural staining, and mottled hull vertex colours.
- Soft contact darkening projected onto the existing seabed relief. It is illustrative shading, not a physically calculated shadow.
- A camera that moves from the overview into the existing bridge/gantry envelope, then returns to the overview. Close-up context may extend outside the viewport; the selected structures remain framed.
- Colour dressing appears outside x-ray in seabed chapters. Structural rods, window rims/panes and truss details now also appear in blueprint throughout the timeline; organisms, procedural weathering and contact darkening remain colour-only. X-ray retains the base explanatory geometry. This supersedes the initial colour-only detail rule.

## Evidence and interpretation
The [2012 expedition organiser's account](https://divernet.com/scuba-diving/general-wrecks/project-britannic/) describes the sandy bottom, starboard-side wreck attitude, bridge-area equipment, davits and marine-organism/sediment sampling. It supports those broad categories, not the coordinates, counts, weathering pattern or species in this illustration. No source photographs, scans or source prose were embedded.

All added positions, patterns and organism distribution are marked estimated in the on-screen directing note. The existing confidence share is for the original time model; the added presentation meshes are not counted as newly sourced model parts. This is not a surveyed mesh, engineering reconstruction or biological simulation.

## Verification
- Existing 67 unit tests pass in UTC and Asia/Seoul.
- Gate 1 PASS, zero errors/warnings. Source JSON byte-identical to Git HEAD. Existing 29% sourced share retained.
- Actual in-app browser inspection at 375x812, 768x1024 and 1440x900. At 375px, document width and viewport both equal 375.
- Checked colour → blueprint, x-ray on/off, timeline Home → back to 90. The old sailing appearance returns, and the detailed scene returns without accumulating changes. Browser errors/warnings: none observed.
- Local evidence: ../.out/britannic-detail-browser/{desktop,mobile}.png (Git excluded).
- Full Gate 2 PASS: 71/71 shots. Contact sheet reviewed. Titanic quick regression PASS: 19/19. Final HTML rebuilt with gate2=pass. Syntax and diff whitespace checks pass.

## Limits
New details are illustrative estimates; no actual part-level dimensions were newly verified. The focus is the bridge/deck region, not a complete high-resolution survey of every part of the wreck. Physical devices, screen readers, video export and quantitative performance remain unverified.
