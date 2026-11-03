# Approved visual quality baseline

User approval:2026-11-02, “이 정도 수준으로 진행해보자.”

Reference: Britannic fracture art pass, `trials/britannic-art-pass-2026-11-02/refined.html` in the development repository; review evidence in `docs/reviews/2026-11-02-britannic-fracture-art-pass.md`. Trial files are local and are not required to install the skill. Reproduce the current Britannic tier with `scripts/build-quality.mjs` and `references/quality-tier.md`.

This approves the visual direction and level of detail for continued Elapse work. It does not approve factual estimates as measurements, real-device performance, all existing examples, or publication.

## Production standard

The 2026-11-03 WTC revision adds shaped airframe sections/airfoils, merged engine/cockpit detail, chamfered tower corners, anti-aliased glazing/columns and a reversible irregular opening with interior fragments. Boeing dimensions and NIST descriptions inform the envelope and facade pattern; detailed contours, damage and placements remain illustrative estimates.

Use cached, independently authored material-data tiles and sixteen-variant flame/smoke atlases. Keep instanced particles, merged repeated geometry and texture uploads in the preparation stage. Do not introduce per-frame texture generation, heavy volume raymarching or individual transparent-object draw calls without comparing performance. Apply the same material/lighting standard with each subject's own surfaces and dated states; do not transplant aircraft, fire or damage into unrelated scenes.

Renderer checks also cover finite buffers, the measured airframe envelope, reverse-scrubbing geometry restoration, stable repeated-render population counts and hiding effects in blueprint mode. Compare isolated GPU traces with retained before pages; distinguish cold/transient stalls, steady frame intervals, draw calls and actual physical-device evidence.

- Show meaningful thickness, joints and internal construction at inspection distance; a silhouette or wire grid alone is insufficient.
- Damage should express bent, torn and missing material with varied geometry rather than a regular rectangular opening. Keep explanatory cutaways visibly distinct from recorded damage.
- Subdue repetitive surface noise and oversized decorative growth so the structure reads clearly. Use material differences and local shading to support depth.
- Provide a context view and a useful close-up of the important change. Keep description, date and measurements in stable information slots.
- Use public evidence for real structural features; mark independently authored shapes, coordinates and motion as estimates. Never transplant a subject's fracture pattern or equipment into a different subject solely to reuse the look.
- Verify screenshots at375/768/1440px, style/history/inspection transitions, geometry validity and applicable gates. Treat visual review separately from automatic checks, scientific fidelity and physical-device performance.

## Adoption

Use this as the reference for subsequent requested subjects and revisions. The Britannic-specific tier is not automatically available to every subject. Keep existing examples and user state until a subject-specific replacement has been researched, implemented and checked. This approval does not itself trigger rewriting all examples, changing publication settings, pushing Git or deploying Pages.
