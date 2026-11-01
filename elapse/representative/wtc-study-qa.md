# WTC impact scene study

Date:2026-11-02. Scope: one standalone South Tower impact representative scene, from aircraft approach through impact, facade damage and smoke. The existing full timeline HTML, tower-collapse sequence and other examples are preserved. This is a reviewable directing/geometry study, not rollout to the full project.

## Changes

- Independent aircraft with96-segment lathed fuselage, swept extruded wings, horizontal/vertical stabilisers, two rounded engine nacelles/intake fans, cockpit and passenger glazing. No airline branding or copied CAD.
- Source dimensional reference only: Boeing767-200 approximate48.51m length and47.57m span. The authored mesh, bank, approach, impact location and motion are estimates. Primary reference: https://www.boeing.com/content/dam/boeing/v2/airports/acaps/767_REV_K.pdf (official indexed dimension excerpt; no scan embedded).
- Commission account of the South Tower event: https://911commission.gov/report/911Report_Ch9.htm . The scene displays approximately09:03 and no computed speed or exact collision-duration claim.
- 1024×2048 procedural facade atlas, mipmapping/anisotropy, corrected vertical UV projection on all tower/context faces, selected physical facade edges and mechanical bands. Earlier rotated side-face UVs caused broad moire stripes; corrected.
- Camera starts near the aircraft, eases toward a fixed struck-face view and stays on that face during the effects. The upper tower is deliberately cropped in this close-up.
- Procedural alpha-textured fire and110 layered smoke sprites, falling nonhuman fragments and local warm light replace coarse opaque polyhedra. All effects are illustrative. Context buildings are explicitly generic estimated massing, not a geolocated Manhattan reconstruction.
- Fixed information overlays,0.25×/0.5×/1×/2× controls, automatic slower contact passage, scrubbing/reverse restoration, pause/replay and three beat buttons. Reduced-motion preference prevents autoplay and stops playback on a preference change.

## Verification

Final evidence directory: `../.out/wtc-study-delivery/`.
Automated custom scene check:21 frames across375/768/1440px and seven progress checkpoints; exception/overflow checks plus actual slow-passage advancement. Visual review includes approach, impact and smoke views. Native browser checks beat controls, slider and speed selection; final screenshots accompany this report.

Status: passed for the tested representative scene; no remaining P0/P1/P2 issue identified in these states. JavaScript syntax and build pass. The first draft had an array-entry unpacking error at startup; it was corrected before acceptance. Failed/earlier captures are separate. Full historical-model Gate1/standard ship Gate2 do not apply to this standalone scene; no historical data model or old full timeline was rebuilt.

No measured FPS, real-device, exhaustive screen-reader or physically validated fire/aircraft/collapse claim. Generated textures/geometry are original; no source media is downloaded or embedded. No people/victims are depicted. The requested tower-collapse/full-timeline improvements remain outside this first representative scene and are not reported complete. No publication/push or global skill installation occurred.
