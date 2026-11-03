# WTC-led realism revision — 2026-11-03

## Scope and visual work

The user requested a more realistic WTC representative scene while retaining smoother playback, followed by the same visual standard across the remaining examples. All twelve packaged HTML pages are regenerated. The ten JSON models remain byte-identical, preserving facts, dimensions, dates, IDs, confidence shares, translations and source links.

- Aircraft: independently modelled fuselage sections, thick airfoils, dihedral, tail surfaces, recessed engine intakes/fan detail, cockpit glazing and painted panel/window details. Four merged material batches replace many separate meshes. It has no airline livery. Boeing's 767-200 length/span inform the envelope; section contours and details are estimates.
- Towers: chamfered corners, glass/aluminum roughness separation, derivative-filtered facade detail, revised column spacing and mechanical-floor band positions. An irregular real opening replaces the impact's flat dark decal, with internal floor/member fragments. It restores the intact geometry when scrubbed backward. The contour and interior arrangement are illustrative, not a damage survey. Existing collapse clipping and dates remain authoritative.
- Flame/smoke/dust: sixteen independently authored atlas variants contain coherent density, irregular edges and baked internal illumination. Instanced billboards retain two batches in the study and three in the WTC timeline. They are not a volumetric fluid or impact simulation. Repeated study context and flying debris are instanced.
- Other subjects: Notre-Dame uses the same instanced flame/smoke treatment in its existing dated fire state; Eiffel, Notre-Dame and Titanic use subject-appropriate metal/stone/wood/rust material detail. Britannic receives the material update plus a correction preventing growth instance counts from repeatedly shrinking on redraw. All five Unfold examples receive periodic metal/polymer surface data, glass response and studio reflection refinements. Blueprint/x-ray, fixed information slots, language propagation and the reduced-motion behavior are retained.
- Material data and textures are cached; the architectural scenes explicitly pre-upload their textures during preparation. No per-frame texture synthesis, extra full-screen postprocessing pass, paid generation or runtime asset download is introduced.

## Sources and boundaries

[NIST's structural overview](https://tsapps.nist.gov/publication/get_pdf.cfm?lang=en&pub_id=910105) describes the 59-column exterior faces, nominal column/window spacing, mechanical-floor pairs and beveled corners. [Boeing's airport-planning reference](https://www.boeing.com/content/dam/boeing/v2/airports/acaps/767_REV_K.pdf) supplies the airframe envelope. Only those dimensional/structural facts inform the independently authored assets. No source photograph, plan scan, video frame or proprietary mesh is embedded. Existing study disclaimers continue to distinguish illustrative aircraft/effect motion from real flight speeds and impact mechanics. No people or victims are depicted.

This improves a procedural educational reconstruction. It is not photographic capture, surveyed aircraft/building CAD, a NIST structural analysis or a fire-spread reconstruction. Real-device mobile performance and final aesthetic acceptance remain separate from automated checks.

## Verification

Local rendering and interaction checks passed. Evidence is stored under `trials/realism-pass-2026-11-03/`; trial files are not packaged or published.

| Check | Actual result |
|---|---|
| Original models | All ten JSON files byte-identical to retained before files |
| Units | Unfold 43; Elapse 112 in UTC and 112 in Asia/Seoul; shared 8; locale contract 3 passed |
| Full Gate 2 | All ten examples passed, 611 captured scenes total |
| Languages / widths | All twelve demos × five languages × 375/768/1440 px: 180 cases, zero issues |
| Elapse inspection / transitions | 240 states passed across the seven pages |
| Unfold high/standard, layouts/styles | 75 states plus delayed-frame clock check passed |
| WTC study | 21 phase/width states and slow playback passed |
| Renderer-specific checks | Airframe measured from final buffers: 48.5 m length, 47.57 m span; four merged material batches; finite attributes; reversible opening; two instanced atlases; stable Britannic growth counts; Notre-Dame fire hidden in blueprint and restored in colour |
| Independent skill folders | Both fresh copies passed locale audits and standalone HTML generation with their bundled modules |

Full-size and contact-sheet review covered the subject states, phone endpoints/assembly/manuals, wrecks, buildings and all three WTC study widths. The final shader cache correction distinguishes tower-facade and generic mapped programs; this prevents different shader sources sharing a cache identity. All twelve pages were rebuilt afterward and the renderer contract plus nine new WTC study captures passed. The earlier 611-scene and 180-case runs are evidence for the preceding rendering revision, not a claim that every captured byte includes that final cache-identity-only correction.

## Performance observations

Same AMD Radeon Pro 5300 Metal backend, 1440×1000 viewport and DPR 2. The retained standalone before pages are compared with the new pages; no unit tests or second headless browser ran concurrently with the valid timing pairs. The early `wtc-after` diagnostic overlapped a native browser page load and is excluded from the comparison.

Three paired representative-study samples each used 1.5 seconds of playback warmup followed by two seconds of measured playback from the same progress value. Both versions had 16.7 ms median and 16.7–16.8 ms p95 intervals. All six samples had zero frames above 50 ms. Study draw calls fell from **260 to 39**, retaining detailed airframe/effect appearance with fewer geometry submissions.

The four-second WTC full-timeline comparison retained 16.7 ms median / 16.8 ms p95 intervals and zero frames above 50 ms in the final prepared trace. Its draw calls rose from 35 to 41 because the two openings now have interior geometry. This is not a claim that every scene has fewer draw calls.

Separate warmed two-second pairs for Galaxy S24, Britannic and Notre-Dame all remained within 16.7–16.8 ms median/p95 intervals, with zero frames above 50 ms. Britannic triangles at the sample rose from 779,231 to 809,631 because the growth population no longer vanishes during repeated draws; its draw calls were 187 before and 185 after. Notre-Dame draw calls fell from 215 to 195. Unfold exposes no renderer statistics through its current controller, so its draw-call/triangle counts are recorded as unavailable rather than inferred; its actual WebGL backend and frame intervals were measured.

Initial four-second traces varied: representative-study long-frame counts were 0–2 in the valid before/after runs, and an intermediate full-timeline trace had two long frames. Those observations are retained. Warming up and a 60 Hz refresh cap do not establish unlimited headroom, all-timeline smoothness, cold-start equivalence or physical-mobile performance. No claim is made that stutter is eliminated.

Public delivery is checked separately after publication by build revision, HTTP 200/local SHA-256 equality for the gallery files and all twelve HTML pages, and a public browser flow. Those delivery results are recorded with the local evidence and in the completion report; local render tests do not stand in for a successful deployment.
