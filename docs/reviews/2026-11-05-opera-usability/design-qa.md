# Opera House inspection usability and detail

Status: passed for the checked desktop browser and emulated viewport flows. Physical touch devices, expert architectural review and a full screen-reader audit remain unverified.

## Scope and findings

The public hall view revealed three usability problems: Reset view selected the whole site instead of resetting the current inspection camera; changing colour/blueprint discarded the selected stop; side walls could obscure the auditorium after orbiting. Blueprint also showed unrelated inspection anchors over the hall and recoloured the water as a pale background. Preserve existing layout, record/chapter/event data,8 inspection IDs and five languages. Other models' authored geometry and existing user-installed skill folders are unchanged.

## Changes

- Preserve the selected Opera stop and historical date when resetting or changing style; restore keyboard focus to the style control after its DOM is rebuilt. Scope these UI changes to Opera.
- Recompute the explanatory near-wall cutaway from the current camera on every render, rather than only timeline updates. Keep the opposite wall/context and restore normal visibility outside the cutaway. The five-language help/limitations explicitly describe roof and near-wall hiding.
- Add canvas keyboard focus, arrow orbit, +/− zoom and Home reset. Capture initial two-pointer distance immediately and handle pointer cancellation. Native desktop input was exercised; first-pinch arithmetic and bounds are unit-tested, not claimed tested on a physical phone.
- Darken blueprint water for readable contrast and restrict inspection guide lines to the selected area. Keep all anchors in the whole-site overview.
- Replace thick open sphere fragments with thin closed, originally authored magenta reflector panels. Their exact shapes/thickness/placement remain illustrative. ARM's project description supports petal-shaped magenta reflectors; it is not a measured contour source.

## Verification

-158 unit tests pass in UTC and158 in Asia/Seoul; locale unit tests3 pass. Shared copies synchronized; whitespace diff check clean.
- Full Gate2 passes49 screenshots, including dates/chapters, styles, camera angles, phone/tablet and existing playback speeds.
- Focused automated browser suite105/105 at375/768/1440px. Includes15 new cases for target-preserving reset/style switches, style keyboard focus and current-camera near-wall/opposite-wall visibility. Prior date, geometry-state, stable-card/gauge, unbuilt-stop and8-stop checks retained.
- Five-language browser checks15/15. People-record/fallback checks79/79; original record values/dates, event list and chapters were compared with HEAD and preserved.
- Native IAB checks: reproduced the old reset-to-overview problem; verified corrected reset and colour/blueprint selection persistence; used arrow/Shift+arrow and Home; inspected opposite-side orbit screenshots and focus indication. Inspected375/768/1440px screenshots, mobile page width375px and tab-focusable canvas. Viewport override restored. Local native captures retained under `trials/opera-usability-2026-11-05/`.
- Surface probe3/3:347 geometry-bearing objects with0 non-finite values;18 reflector meshes; each edge on the shared panel mesh belongs to two triangles (closed/manifold). Estimated panel vertical extent0.412m is a model characteristic, not a sourced component measurement.326 meshes/6444 instances remain stable after30 reverse seeks; this is population stability, not a complete heap-leak audit.
- Isolated90-frame measurements at1440px on AMD Radeon Pro5300 / ANGLE Metal: construction median16.6ms,p9517.6ms,266 draw calls/353544 triangles; hall orbit median16.7ms,p9517.5ms,56 draw calls/112724 triangles. These are local frame-interval samples, not universal or physical-mobile performance guarantees.

- Isolated fresh-folder reproduction12/12 is byte-identical: Opera generator/evidence compilation,7 existing Elapse scenes,3 scene studies and1 Unfold example. Existing installed skill folders were not overwritten.

## Result and limits

No P0/P1/P2 functional or responsive issue remains in the inspected flows. The model remains an independently authored architectural interpretation. The dynamic wall cutaway and manufacturing-like panel contours do not certify real structural, acoustic or accessibility accuracy. No new photos, meshes, source-media copies or external dependencies are introduced.

Machine results/screenshots are local in `trials/opera-usability-2026-11-05/`; repeatable probes ship as `elapse/scripts/check_opera.mjs` and `check_opera_surface.mjs`. Public deployment is verified separately after push.
