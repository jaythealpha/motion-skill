# Demo design QA — 2026-11-03

Status: **passed for the implemented interface and rendering changes**. The aesthetic target of near-photographic fidelity is not an acceptance claim.

Scope: the existing gallery, five Unfold pages, five Elapse timelines and two representative studies. The existing layout, original subject geometry, data IDs, source links and historical/product facts were preserved. No new design direction, framework or downloaded visual assets were introduced.

## Browser evidence

The 180-case delivery matrix covers every demo in English, Korean, Japanese, Simplified Chinese and Spanish at widths 375, 768 and 1440 px. Screenshots were captured and inspected, including contact sheets across all three widths. Automated checks include subject framing as well as canvas existence, language, retained progress, overflow and script failures. The 15-case gallery matrix covers the same languages and widths. After the mobile control change, another 105 cases cover the seven Elapse pages and studies.

Before/after review identified and fixed these blocking issues:

| Issue | Severity | Fix and verification |
|---|---|---|
| Titanic wreck outside the mobile initial manual view | P1 | Initial view fits the subject unless explicit coordinates are supplied; the 375 px wreck capture contains both sections. |
| Camera controls cover the Spanish figure caption | P2 | Controls use their own row below the canvas at narrow widths; screenshot review and caption-overlap assertions pass. |
| Wavy tower facade interference | P2 | Isolated mapped facade versus ribs; projected-spacing LOD removes unresolved ribs, with hysteresis. Mobile study capture is clear. |
| Browser translation overrides the selected app language | P1 | `translate="no"` on gallery and generated documents; native Chrome preserves authored copy after language selection. |
| Space on a focused language button toggles playback | P2 | Body-only playback shortcut; native key events change language without playback and retain focus. |
| Repeated UI replacement and discontinuous camera fit during playback | P2 | UI refresh budget, cached date formatters and continuous fitting; 601-sample sweep has no distance jumps above 3%. |

## Interface checks

- Existing fonts, panel placement and visual hierarchy retained; information slots stay fixed across sampled timeline states.
- Five native-language choices, English fresh default, explicit URL priority, persistent selection and gallery-to-demo propagation work. Studies keep progress and speed when switching language during playback.
- Main segmented controls have 44 px minimum touch targets, visible keyboard focus and native-language accessible labels. Keyboard navigation and Space activation were exercised. Reduced-motion preferences prevent automatic playback.
- Pages remain standalone and work offline. Gallery storage failures fall back without blocking language selection. No-script gallery displays English links and an explicitly disabled picker.
- Error monitoring found no script failures in the passing matrices. No backend, authentication or remote data request was added to playback.

No known P0, P1 or P2 issue remains in the tested changes. P3/acceptance boundaries: full screen-reader coverage, native-language editorial review, physical-device interaction/performance and photographic/surveyed asset fidelity remain unverified. These are educational procedural 3D illustrations. Four-second desktop traces do not establish whole-timeline or mobile FPS. See [rendering and performance evidence](2026-11-03-five-locales-rendering.md).

## Public delivery

Revision `6ba0b2a` completed GitHub Pages deployment. The gallery's three files and all twelve standalone HTML files returned HTTP 200 and matched the local SHA-256 values. The deployed pages passed all 180 language/viewport cases. Native Chrome confirmed Japanese gallery-to-WTC navigation, English selection, Explore entry, Timeline return and chapter selection. Final evidence-label terminology corrections passed a separate 75-case phone layout check, with direct review of the corrected Japanese mobile capture; public delivery of those regenerated files is verified in the completion report. No claim is made that the earlier screenshots contain later copy edits.
