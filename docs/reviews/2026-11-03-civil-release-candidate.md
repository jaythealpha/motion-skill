# Civil detail release candidate —2026-11-03

This is the pre-publication QA snapshot. Public Pages delivery is verified after commit/push in the task execution log; a local result is not presented as production evidence.

## Changes

- The Sampoong full timeline uses the same detailed form as the representative study, through a monotonic chapter-to-observation adapter. Dates remain unchanged. Recessed glazing, entrance/roof services, round columns, slab/drop-panel geometry, fracture detail and local roof/rebar transforms are shared. The estimated rendering envelope was updated to151×56×28m rather than displaying the old template bounds. New source links and the explanatory automatic cutaway are disclosed.
- Seongsu normal traffic has its own clock. A separate route16 bus / six-vehicle event follows the reported held-edge → overturn → contact-with-already-fallen-deck sequence. Vehicle dimensions, paint, coordinates, duration, pitch and deformation are estimated. No people are drawn. The event vehicles disappear at the replacement chapter's display boundary, not an asserted recovery date. See `elapse/research/seongsu-vehicle-notes.md`.
- Chinese controls show CH; locale data/HTML tags keep standard zh/zh-Hans. Both old zh URLs and ch aliases work. Five languages, English default and gallery-to-demo language continuation remain.
- All15 demos were rebuilt. Other subjects receive shared original cached normal tiles and native-desktop2048 shadow maps/contact/reflection changes; existing custom models and dates are retained. This does not claim a new forensic or photoreal reconstruction of every subject. Mobile/lightweight shadows remain disabled.
- The gallery now links the detailed Sampoong study. Cache revisions accompany gallery/demo links; the study forwards the selected language and revision to the full timeline. README, demo guide, skill instructions and source/generator notes are updated.

## Verified locally

- Unit suites: Elapse134 in UTC +134 in Asia/Seoul; Unfold43; shared/locale11. **322 passes**. No tests disabled.
- Canonical model checks: both civil models Gate1 pass,0 errors/warnings. Generator replay in an isolated destination exactly reproduces both canonical models. The other10 JSON examples are byte-identical to HEAD.
- Full demo language/render sweep: **225 cases**,15 demos ×375/768/1440px ×5 languages;0 unexpected errors/issues. Chinese display-label checks included. Screenshot review included Sampoong failure, Seongsu overturn/descent and narrow layouts.
- Civil history: **41 checks** across both full timelines, styles, inspection stops, seek/rewind, date/manual-view restoration, locale display and short native-GPU timing. During the check the independent traffic clock is explicitly frozen for deterministic transform comparison.
- Bus event: **45 checks** across14 history points ×3 widths plus rewind at each width. A raised sign caused a small inverted-body contact overlap in the initial candidate; correcting its actual plane orientation resolved it. Final contact/finite geometry gates pass. These are geometric checks, not proof of real disaster dynamics.
- Normal traffic: **48 checks**; actual instance movement, freeze/resume, stable historical date, structural-inspection freeze, normal/event availability, three close-up widths, five languages, reduced-motion default and timing pass.
- Gallery:15 language/viewport cases plus keyboard focus, saved language, explicit URL precedence, ch/zh-CN aliases, blocked storage and no-JavaScript English fallback pass. The fallback assertion was updated for the intentionally added fifteenth card.
- Shared copies and `git diff --check` pass. No npm dependency was added. New detailed modules are included in the self-contained HTML import maps and skill folders; original photos/scans/third-party meshes are not bundled.

## Performance evidence and limits

Native headless Chrome / ANGLE Metal / Radeon Pro5300, rendererDPR2. The civil timing samples at375/768/1440 functional coverage are separate from performance evidence. Warm1440px civil samples:p50≈16.7ms,p95≈17.3–17.5ms;Sampoong's failure sample had1/100 intervals>50ms, other three samples0/100. Normal traffic:p95≈17.3ms,0/180 intervals>50ms,57 draws. No other headless job/unit suite overlapped those timing runs. This does not establish sustained60fps, real-phone performance or a performance result for all other subjects.

No open P0/P1/P2 found in the checked local release scope. Source/geometry accuracy remains bounded by the research notes. Full assistive-technology review, physical devices, native-language editorial acceptance and final artistic acceptance remain unverified. The two unrelated untracked planning/research drafts are excluded from the release commit.
