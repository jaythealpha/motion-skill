# Britannic quality tier

This tier is an independently authored model, not a scanned wreck or surveyed CAD. It renders existing historical poses with a separate damaged skin and additional equipment. Baseline files and source annotations remain available.

## Reproduce

Run `node scripts/build-quality.mjs examples/britannic.json /absolute/output/quality.html` from the skill directory. It writes `quality.html` and `quality.model.json`, leaves the input unchanged, and resets Gate2 to unknown. Run Gate1, full `shoot.mjs`, `check_quality.mjs` and full-size screenshot review. Node/Chrome requirements are the same as the normal skill.

Open `quality.html?t=90&mode=explore&stop=bow&cutaway=1&study=quality`. `stop` can be wreck, bow, breach, bridge, foredeck or stern. Comparison links retain the current time and chosen inspection target; they reload the page. `quality=standard` overrides high quality. Colour-only wreck rendering activates at bar62. Blueprint and x-ray retain the existing schematic rendering.

## Implemented assets

- Distinct damage geometry at the existing forward break: lower cut faces opened, nearby skin deformed, rolled sheet edges, internal frames and deck plates. Existing upper deck connection and historical matrices retained. The exact opening and member dimensions are estimated.
- Curved panel seams, instanced rivets, rough metal patina and surface normals.
- Estimated bridge telegraphs/telemotor and foredeck capstans, winches, chain runs.
- Three propellers, with 3-blade wing screws and a 4-blade centre screw. Source-reported diameters23.9ft and16.6ft; locations, blade contours, pitch, shafts and rudder geometry are estimated.
- A separate bridge roof cutaway removes selected roof triangles only when requested. It is an explanatory inspection view, not an assertion of historical roof collapse.
- Observation spotlight, ambient/fill light, underwater fog and seeded static particles; sediment patch positioned at the actual model's final ship location, with softened boundaries.
- Desktop hardware shadow map1024; mobile/software fallback disables that pass, reduces repeated hardware/growth instances and simplifies surface-normal shading. No external textures, photos, video or meshes are downloaded. The offline HTML remains sufficient.

## Evidence actually read

- [Nick Hope, Britannic98](https://www.bubblevision.com/underwater-videos/HMHS-Britannic.htm): first-person1998 account describes a large break ahead of the bridge, foredeck capstans/chains/winches, bridge telegraphs and telemotor, and the three propellers. It does not provide a measured three-dimensional layout. The author's statements about specific causes/species are not adopted here as new model facts.
- [Atlantic Wreck Salvage,2019 expedition account](https://dvtenacious.com/h-m-h-s-britannics-lost-bell/): propeller count, blade counts and diameter descriptions. Exact blade profiles and coordinates were not transcribed.
- [Alexander Sotirou, Project Britannic2012](https://divernet.com/scuba-diving/general-wrecks/project-britannic/): expedition report supports the general wreck attitude/environment; existing historical orientation model is retained rather than silently changed.
- Existing period-plan interpretation is documented in `../research/britannic-form-notes.md`. No source scan, photograph or modern mesh is copied into the tier.

These observations are from different dates. Added details are labelled estimated, are not a census for the displayed year and do not inflate the historical model's sourced share. No people, remains or lifeboats are drawn. The model is not a navigation/dive route, conservation survey or physical simulation. Performance of a headless software renderer must not be reported as physical-device FPS acceptance.


## Fracture art pass

The forward detail now uses merged thick sheet meshes with front/back faces and closed tear rims, nonuniform buckled deck remnants and I-section beams with missing/bent ends. Small hanging pipe remnants supplement the structural opening. Tear contours and the inspection cutaway boundary vary by height instead of forming a rectangular hole. The `breach` stop provides a tighter view using `trimX`, `trimY` and `trimZ`; all crop axes are validated as increasing fractions within0…1.

Large crust colonies are reduced in scale and brightness in quality mode, and surface grain is subdued so geometry remains readable. These choices are visual estimates, not new archaeological findings. Structural geometry is merged/instanced where practical; this does not guarantee physical-device FPS.

The user approved this art-pass visual direction on2026-11-02. See `visual-quality-baseline.md` for the reusable production/review standard and the boundaries of that approval.

## Packaged subject tiers

The same visual standard is now applied with subject-specific geometry to all packaged Elapse timelines (`meta.renderQuality: "high"`):

- Titanic uses its own bow/stern cut coordinates, rusty material ageing, open ends, bent internal members and two fracture inspection targets. It does not use Britannic's bow-first hinge geometry.
- Eiffel construction uses estimated built-up iron profiles, joint plates and platform edge details. Its published envelope and erection chronology are unchanged; individual profiles/fastenings are not measured originals.
- Notre-Dame uses stone-course shading, arch-surround blocks, roof seam ribs and timber joint details. These ride on the existing dated roof/timber/masonry groups and disappear/reappear with loss/restoration. No sculpture/people or new causal claim is added.
- WTC adds physical facade members, estimated slab/steel rubble and dated rooftop detail. Analytic, anti-aliased facade shading reduces distant texture moire. Individual inspection isolates the target from neighbouring buildings to prevent occlusion; the timeline retains the dated site. Existing separate impacts, collapses, rebuilding and memorial availability remain authoritative; the additions are not a NIST structural model.
- Both scene studies share the relevant updated subject assets/materials. Historical times and illustrative time scales remain separate.

Keep new details attached to their subject's own visibility, clipping and transformation groups. Blueprint and x-ray must remain usable. Full gates, subject-focused checks and full-size screenshot review are required before marking a regenerated example as checked. Do not claim that a new arbitrary topic automatically receives surveyed high-detail assets.
