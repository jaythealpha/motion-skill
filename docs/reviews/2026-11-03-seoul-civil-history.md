# Seoul structural-history additions — 2026-11-03

## Result and scope

Added two independently authored, offline Elapse examples: `sampoong` (29 June–19 July1995) and `seongsu-bridge` (21 October1994–3 July1997). Six inspection stops each, five bundled languages (English default), colour/blueprint, fixed information slots, timeline scrubbing, quarter/half-speed presets and slower critical passages. Gallery grows from12 to14 cards; prior card indices and all twelve existing HTML/ten JSON examples are preserved.

Sampoong separates slabs, columns, facade panels and rooftop plant; failed layers descend into a residual subgrade site. The adjacent wing is context, not a safety judgement. Column/slab inspection removes selected outer layers. No invented department-store reconstruction or dated debris-clearance completion. Seongsu shows the48m suspended segment inside the120m reference span, under-deck trusses, cantilever arms, suspension details and bearings; only that segment drops. Subsequent replacement affects all illustrated upper works and ends at the four-lane1997 reopening, before later widening.

Source facts and limitations: [research notes](../../elapse/research/seoul-civil-notes.md). Every detailed position, roof plant, slab/column grid, facade pattern, fracture, joint profile, water level and motion is an estimate. The model is not surveyed CAD, a structural solver or a safety manual. No people, vehicles, source photos/scans, external meshes, paid generation or runtime asset fetching.

## Implementation

- `civil-model.js`: independent history/state evaluator and validation; bridge is explicitly `subject.kind: bridge`. No fake Eiffel height keys or ship compartments.
- `civil-form.js`: original instanced slab/column/facade/fragments; I-section truss members, joint plates and bolts, support geometry; cached instanced dust/mist and original water treatment. Distant upper works consolidated by material without losing staged replacement.
- `civil-render.js`: continuous camera framing, coalesced pointer/wheel rendering, fixed-date inspection, cached material budgets. Axial manual bridge views receive a minimum readable framing distance adjustment.
- `civil-ui.js`: bounded, five-language presentation data within the existing fixed UI slots.
- `seoul-civil-gen.mjs`: reproducible source models and authored language packs.
- Existing source models, identifiers, saved preferences and twelve old self-contained HTML pages are unchanged. Existing installed skill folders are not overwritten.

## Verification evidence

- Gate1: both models pass with zero errors/warnings. Source-item shares50% /45%; these are item classifications, not measured historical/physical accuracy.
- Final motion/framing Gate2: Sampoong47 shots; Seongsu46 shots. The first final Seongsu run caught a1.1% axial-view area; the camera was fixed without weakening assertions, the three angle regressions passed and the full46-shot rerun passed.
- A subsequent presentation-only wording correction labels the08:00 /07:30 opening and07:41 aftermath bounds as scene context rather than recorded event times. The delivered pages were rebuilt and their additional interaction/language checks run afterward; this distinction prevents the93 earlier captures being represented as byte-identical to that wording revision.
- `check-civil-history.mjs`:41 delivered-page checks: six subject/viewport interaction runs,30 language runs, four short native-GPU timing runs and reduced-motion autoplay. Checks include scrubbing, disabled history in Explore, available stops, restored date/manual view, reversible transforms, finite geometry, six speed options, blueprint particle suppression, scene-context labels and browser errors.
- Additional visible Chrome flow: Sampoong timeline → warning chapter → column cutaway; Seongsu1997 replacement inspection, including its sixth dated stop. The cutaway's degenerate black strips were fixed by removing all three dimensions of hidden instances, then screenshots rechecked.
- Node tests:167 pass (Elapse, Unfold and shared locale checks), zero failed/skipped. The nine new civil tests cover invalid evidence/dimensions/endpoints/translation contracts, rewind and slow/fast traversal. `git diff --check` passes.
- Isolated skill-folder build:both examples pass Gate1 and produce byte-identical delivery HTML outside the repository. This checks packaging/build completeness, not a new AI research session. All22 previously tracked JSON/HTML example files are byte-identical to the pre-task revision.
- Full demo locale regression:210 cases (14 pages×5 languages×3 widths), zero issues. Gallery:15 cases plus keyboard focus, language persistence, URL precedence, storage-blocked and no-script fallback pass.
- Full gallery/demo locale and public delivery results are recorded in `trials/seoul-civil-2026-11-03/`; see the accompanying design QA. Public verification is performed separately after publication, not inferred from local rendering.

## Native-GPU sample

Isolated headless Chrome; AMD Radeon Pro5300 via ANGLE Metal;1440×1100; DPR2.100 warm frame intervals per scene, no second headless browser or unit tests ran concurrently with valid samples. Existing visible browser tabs were static.

| Scene | p50 | p95 | Frames >50ms | Draw calls |
|---|---:|---:|---:|---:|
| Sampoong warning t15 |16.6ms|18.2ms|0|35|
| Sampoong collapse t43 |16.7ms|18.1ms|0|36|
| Seongsu before t15 |16.6ms|18.4ms|0|43|
| Seongsu fall t43 |16.6ms|18.1ms|0|49|

These short local timing samples are not a physical-mobile benchmark, long-run leak test or a universal frame-rate guarantee. Translation is authored in five languages; comprehensive native-speaker review remains unverified. Final aesthetic acceptance and forensic motion accuracy are not established by automated checks.
