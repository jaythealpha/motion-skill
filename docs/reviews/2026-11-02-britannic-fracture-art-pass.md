# Britannic fracture art pass —2026-11-02

## Result and preserved baseline

New local deliverable: `trials/britannic-art-pass-2026-11-02/refined.html` with its companion model. Open at `?t=90&mode=explore&stop=breach&cutaway=1&study=quality`.
The previous standalone page was copied unchanged to `before.html`; the prior delivery folder is preserved. Repository example HTML and public Pages were not replaced.

## Visual changes

- Replaced the intact cylindrical wire cage with bent/broken I-section members, missing lengths and sagged cross-members.
- Rebuilt the internal deck remnants as buckled meshes with irregular edges and local holes rather than intact rectangular shelves.
- Added front/back sheet faces and closed tear rims (illustrative45mm thickness), folded torn skin, and hanging pipe remnants. Creases were made more angular after the first visual comparison.
- Replaced straight rupture and inspection-cut boundaries with height-varying contours. The explicit cutaway remains labelled explanatory.
- Reduced oversized bright crusts, subdued high-frequency speckling, and added broader patina, streak variation and local cavity/edge darkening. Age-dependent growth visibility is retained instead of imposing a fixed modern colony count.
- Merged sheet geometry and instanced structural members. This reduces some draw submissions but is not a performance/FPS guarantee.
- Added a sixth `breach` inspection target. Validated `trimY` and `trimZ` complement existing trimX for close-up framing; invalid reversed crops are rejected before camera use.

All added plate contours, member positions, damage extents, material distributions and thicknesses are artistic estimates, not newly measured archaeological facts. No new historical claim, source image/scan or external art asset was added. Source share remains29%; original story dates and poses are preserved.

## Verification

- Gate1 on refined companion: pass, zero errors/warnings.
- Elapse tests:110 pass in UTC and Asia/Seoul; crop-axis rejection test added.
- `final-shots/results.json` on after.html:18 inspection frames plus36 timeline/style transitions at375×812,768×1024 and1440×900; no recorded JS/GPU errors, horizontal overflow or information-slot intersections. Mesh position/normal values and index ranges also checked.
- Final angular-crease refinement was then captured separately in `detail/`: close-up with cutaway and context view without cutaway,2x capture; both pass. `verified/` rechecks the refined page at all three widths.
- Full Gate2 on refined.html:73 captures pass, including both styles, x-ray/water checks, phone/tablet views and all four speed presets. The final page and companion model were stamped pass only after this run.
- Final `verified/results.json`:18 inspection frames and36 transitions on the angular-crease refinement, plus mesh-index/finite-value checks.
- Shared-module copy check and whitespace checks pass.
- Native in-app browser opened at the refined close-up; six choices, preserved date and explicit cutaway label visibly confirmed.
- Full-size screenshots were reviewed: repeated bright blobs and coarse speckling were reduced, and torn plates/structural sections are readable at a closer camera. This is an improvement pass, not a photorealistic acceptance claim.

## Boundaries

Local browser render behaviour is verified; physical-device sustained performance, thermals and exhaustive assistive-technology coverage are not. Headless software-renderer frame timings remain variable and cannot be treated as GPU timing or real-device FPS. The visual layer is not surveyed CAD or a physical collapse simulation. No public push/deploy or installed-copy overwrite was performed.

Scoped status: visual/functional checks passed for this art pass. Final failed checks:0. Old and new pages remain separately reviewable; photorealistic or survey-level acceptance is not asserted.
