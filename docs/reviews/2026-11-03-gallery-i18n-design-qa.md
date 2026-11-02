# Public gallery localization — design QA

Status: passed for the scoped gallery change. No known P0/P1/P2 issue remains in reviewed states.

## Result and scope

The gallery now offers English, Korean, Japanese, Simplified Chinese and Spanish. First-time visits default to English regardless of the browser's preferred language. Explicit URL selection takes priority over the saved browser selection, then English. Existing preferences outside the new gallery key are not modified.

All gallery copy is translated: page title/description, header, navigation labels, notices, section summaries,12 card titles/descriptions/tags/actions, footer and accessible language status. Proper product names remain recognizable. The language picker is native HTML, labelled,44px high, described by the language-coverage note, keyboard focusable and visibly outlined. Document language and metadata change with selection. A blocked storage API does not stop selection; URL state remains available. With scripts disabled the English gallery,12 links and an explanatory notice remain available; the language control is disabled.

Scope is the gallery. Ten full timelines support English/Korean; two existing scene studies are Korean-only. Unsupported demo languages are not claimed: Japanese/Chinese/Spanish gallery links open English timelines, and Korean-only studies are labelled and linked as Korean. Individual demo HTML/model data, sources, geometry and motion are unchanged. Original12 demo paths and order were compared against the before-copy and preserved.

## Browser verification

`node scripts/check-gallery.mjs` passes15 combinations:5 locales ×375/768/1440 CSS pixels. It compares every translated gallery field and card, metadata, document language, selector state, overflow, runtime/resource errors and demo language links. Additional checks pass for English first-visit default with Korean browser locale, preference persistence, URL precedence, Chinese alias, invalid locale fallback, blocked storage and no-script English fallback. Tab focus and focus outline were exercised. Chrome's actual native select was also changed to Japanese through its browser UI and the resulting Japanese page inspected.

Direct screenshots reviewed: Spanish375px viewport, Chinese375px viewport, Japanese768px full page and the gallery's full-page locale series. Existing grid, type scale, colours, card order and controls were preserved. Long Spanish text wraps; CJK text remains legible; no horizontal overflow or known cropped controls. Evidence: `trials/gallery-i18n-2026-11-03/qa/`.

The automated/native popup Arrow-key attempts did not expose a reliable option-change event in this automation environment. They are not counted as verified physical keyboard selection. Final automated coverage explicitly tests Tab navigation/focus; native option selection was separately verified through the browser's select control. A full screen-reader/OS keyboard audit and native-speaker editorial review are unverified. No custom key handler was added to work around the test environment.

## Checks and counts

- Implemented and checked:5 gallery locales,12 cards per locale,15 locale/viewport combinations.
- Native select and preference/error paths:pass as described above; no runtime/resource errors in final checks.
- Node syntax checks and `git diff --check`:pass. No package dependencies, backend, authentication or paid translation API added.
- Individual 3D examples were not regenerated or re-tested because their files/runtime are unchanged. Public deployment is verified separately after push; it is not inferred from local checks.
