# Elapse facts, people and memory — delivery review

Date: 2026-11-03. **Local design QA: passed.** Scope is the new reader and directly affected scene navigation. This is a browser/code/content review against the existing Elapse design, not an independent historical investigation, native-language approval, physical-device test or measured performance certification.

## Result

Seven full timelines now start with readable records, with optional 3D context. Twelve records contain thirteen shared factual values, source types/locations/access dates, editorial reflection and explicit unknowns. WTC includes Crowther, Rescorla, collective response and distinct commemoration scopes. Sampoong includes Park Seung-hyeon and warnings/civic help. Seongsu separates survivor recollection, the central48m section and maintenance responsibilities. Four other subjects begin with documented research/construction/restoration milestones; they are not complete personal histories.

Source review: museum accounts and collection records, Commission§9.4, Korean historical chronology and authored archival essays, a ministry-published survivor interview, Seoul institutional records, WHOI, the Eiffel operator, French Government and a published expedition account. Each overlay retains its source URL, locator, type and checked date. No source images/audio/scans are redistributed. Numerics are shared across languages. Reported377hours is identified as the chronology's statement;2977/6/2983 have distinct populations;48m is a central span section, not bridge length or drop height. Unknown personal minutes/routes/totals remain unknown. Reflection is a separate section, not a quotation or documented motive.

## Actual verification

| Check | Result | Evidence / scope |
|---|---|---|
| Reader browser checks | 200/200 passed | `trials/remembrance-2026-11-03/reader-qa-final-links/results.json`; all12 records ×5 languages ×375/768/1440 =180 cases, plus20 navigation/fallback/motion cases |
| Existing demos | 225/225 passed | `trials/remembrance-2026-11-03/scene-qa/results.json`;15 full/study demos ×5 languages ×3 widths, canvas framing, localization, progress and page errors |
| Gate1 | 7/7 passed | All final Elapse models; bridge/building branches include the record contract |
| Elapse unit tests | 139/139 in each zone | `npm test --prefix elapse`, UTC and Asia/Seoul |
| Unfold regression tests | 43/43 passed | `npm test --prefix unfold`; its source/geometry untouched |
| Shared/locales | 11/11 passed | `node --test shared/tests/*.test.mjs scripts/test-locales.mjs` |
| Folder install/rebuild | 11/11 byte-identical | `scripts/check-installed-remembrance.mjs`: seven Elapse timelines, three studies, one Unfold example from unique temporary folder copies; all seven Elapse Gate1 runs pass |
| Shared files / whitespace | passed | `node scripts/sync-shared.mjs --check`, `git diff --check` |
| Existing model preservation | 7/7 identical apart from additive metadata | Semantic comparison to1469167: geometry, tracks, IDs, original event dates and authored text preserved |

The225-case scene sweep ran before the final sourced48m fact addition; the final reader200-case sweep includes it. No runtime or scene geometry changed in that addition. The publication check will exercise the final published15 demos and verify delivered bytes.

## UI / accessibility review and fixes

Existing Elapse white/gray cards, typography and blue accents were retained. Viewed actual captures at375px (Korean Seongsu/Sampoong and other locales),768px (Japanese WTC scope and other locales),1440px (Korean WTC and other locales). All record/locale/width screenshots are retained under the reader QA directory.

- Fixed list numbers shrinking into two lines; fixed-width number columns preserve01–04.
- Put concrete actions before numeric fact rows so people are not introduced as scores.
- Kept record selection stable while history changes. Scene links occupy a separate fixed-role navigation area; no automatic record replacement.
- Corrected observation-boundary/date-only/approximate scene-card labels without moving historical events. Original time-zone-neutral scene evaluation stays unchanged.
- Removed the prominent model-share percentage from record-enabled scene headers. The source panel explains it is item composition, not historical accuracy.
- Native public-browser review also found toolbar URLs retaining English after localization. Corrected native/new-tab links to preserve language, record, revision and available historical context; added this assertion to every reader case.
- Real anchor links, labelled native select, visible focus outlines,44px targets, source links and semantic headings. Browser Tab/focus behavior checked. No color-only state, newly added autoplay, or reader animation.
- Reading pauses historical playback, survey motion and independently clocked bridge traffic. Global scene keyboard shortcuts cannot restart hidden playback. Returning restores historical progress/camera, and traffic resumes only in eligible periods.
- English records and evidence are emitted as ordinary HTML. With scripts disabled, the tested WTC page retains all four records and factual values. Forced WebGL failure retains localized content, an explicit error and source links. This is separate from a normal successful3D run.
- No horizontal overflow across tested widths/languages. Original source titles/locators remain source metadata rather than institution-approved translations.

No open P0/P1/P2 found in the reviewed scope. Screen-reader traversal, physical phones, independent historical review and native-speaker translation review remain unverified. Existing3D is still an estimated educational reconstruction; these changes neither certify its physical accuracy nor claim a frame-rate improvement.

## Reproduce and publish

Use `scripts/check-remembrance.mjs <output-dir> [public-base]`, `scripts/check-demo-locales.mjs <output-dir> [public-base]` and `scripts/check-installed-remembrance.mjs`. Set `QA_REVISION` for cache-busted public checks. Publish through the existing `main /` GitHub Pages source; verify its built commit and compare served bytes for the gallery and all15 demos. These release checks are distinct from the local results above.

Unrelated pre-existing drafts (`2026-11-02-fresh-topic-field-test.md`, `2026-11-01-elapse-buildings-proposal.md`) are intentionally excluded from this change.
