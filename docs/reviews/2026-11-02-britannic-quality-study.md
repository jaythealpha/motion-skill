# Britannic quality study — 2026-11-02

Status: first material/lighting prototype implemented and reviewed locally. Not a finished photorealistic reconstruction or a complete high-detail asset pipeline.

## Implemented

Opt-in `?quality=high` for Britannic only, active in colour, non-x-ray wreck scenes at bar >=62. `?study=quality` exposes existing/high comparison links. Default renderer and repository demo HTML are preserved.

- MeshStandard PBR materials instead of the base toon finish on eligible main surfaces.
- Independently authored procedural patina, micrograin and derivative-based surface-normal variation; no downloaded texture assets.
- Instanced hull rivets and curved horizontal plate seams following existing hull geometry. Spacing/positions are illustrative, not measured construction data.
- Tone mapping, reduced ambient illumination, camera-mounted observation light and underwater distance fog.
- Seeded suspended particles and a procedural sediment surface. Particles are static illustrative dressing, not a fluid simulation.
- Same timeline, poses, existing deck geometry, evidence labels, camera and story controls for comparison. No changes to the existing historical model.
- Dedicated GPU shader compilation errors enter the page error collection. Fixed an initial reserved GLSL identifier that made surfaces disappear. Final captures show the surfaces restored.

## Checks and evidence

All artifacts: `trials/britannic-quality-2026-11-02/` (ignored local trial).

- Final comparison: `review/view-t_90_quality_high_study_quality.png` and `review/view-t_90_quality_standard_study_quality.png`, same t=90 and camera, 2x capture.
- `check.mjs`: 24 browser states (375×812,768×1024,1440×900 × colour/blueprint ×0,62,90,100); no recorded JS/GPU errors or horizontal overflow. X-ray and exploration entry/exit tested as well. `results.json` records actual results. This is a focused check, not a new full timeline Gate 2.
- Full-page `quality-375.png`, `quality-768.png`, `quality-1440.png` visually inspected. The close-up intentionally extends beyond canvas edges; information panels remain separate and readable.
- Elapse unit tests:107 pass per timezone (UTC and Asia/Seoul). Shared-copy check and diff whitespace check pass.
- Native in-app browser opened at `study.html?t=90&quality=high&study=quality`, comparison links visible.

Scoped UI QA: passed for comparison layout and mode transitions. Visual quality is a review prototype; no assertion of dramatic/photorealistic improvement. Exhaustive accessibility, frame-rate, physical-device memory/performance and long-running GPU stability are unverified.

## Evidence boundary and remaining work

The [USM catalogue](https://digitalcommons.usm.maine.edu/oml-morse-collection-gallery/2657/) was rechecked: it identifies a longitudinal/deck plan dated 27 February1914. A catalogue entry is not a measured offsets table. Existing hull/deck interpretation and source caveats in `elapse/research/britannic-form-notes.md` are retained. No new scanned plan, archaeological mesh, species record or ownership claim was added or verified by this task.

A substantial next increase in structural fidelity still requires a separately authored, source-bounded damaged-wreck mesh, detailed equipment models and inspected art assets. This iteration did not produce that mesh, revise the crumpled bow, add physically accurate shadows/volumetric transport, implement mobile asset LOD, or add a GLB/texture asset-bundle importer. It remains a single offline HTML proof of the optional rendering layer. Those omissions must not be presented as completed features.

Public Pages, installed skill copies and git history were not modified by this trial; no push/deploy was performed.


Subsequent work: the completed geometry/detail tier and final evidence are documented in [2026-11-02-britannic-quality-complete.md](2026-11-02-britannic-quality-complete.md). This file retains the earlier prototype history.
