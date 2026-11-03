# Five demo languages, rendering and playback — 2026-11-03

## Scope and evidence boundaries

The gallery, ten full timelines (five Unfold, five Elapse) and both scene studies support English, Korean, Japanese, Simplified Chinese and Spanish. English is the fresh-visit default. A supported explicit URL overrides stored preferences; the gallery forwards the selected language to every demo and the two study pages retain it in their full-timeline links. Changing language retains time, view, speed and inspection state.

Narratives, part names, assembly steps, limitations, controls, figure annotations and accessible labels are bundled in the standalone HTML. There are no runtime translation requests. Source bibliographic titles and manufacturer/model identifiers may remain in their original language. Existing English/Korean facts, IDs, numbers, geometry, timestamps and source links are preserved. This was checked against the ten pre-change JSON files; additional fields are translations only. The legacy `name_en` / `name_ko` normalization path also retains `_ja`, `_zh`, `_es` variants.

Most new narrative translations were generated at build time from the project's public English copy. Critical UI terms and a 254-entry component glossary were authored or corrected locally. A translation provider's rate-limit interruption was confined to build-time work; the remaining glossary was completed without adding a runtime dependency. Comprehensive native-speaker editorial review remains unverified. These are not new source-backed teardown or historical validations.

## Rendering changes

- A shared original environment/backdrop supplies reflections and subject-specific lighting for the product studio, buildings and marine scenes. No downloaded photographs, meshes or textures are included.
- WTC context has estimated setbacks, rooftop service details, additional distant massing and painted streets. It is not a surveyed reconstruction of Manhattan. The mapped tower facade is brighter. Fine geometric ribs switch off below 5 CSS pixels of projected spacing and return above 6 pixels, removing the wavy interference visible in the mobile impact study while retaining resolvable close-up geometry.
- WTC timeline fire/smoke/dust uses three instanced billboard batches instead of 295 separate sprites; the representative impact study uses two batches instead of 146 sprites. Existing particle positions and timing formulas are retained. No people or victims are depicted.
- Ship and building renderers fit their subject continuously instead of expanding camera distance in 12% and 8% steps. Initial manual-camera URLs without explicit camera coordinates also frame their subject; explicitly chosen views remain under user control. This fixes the blank mobile Titanic wreck overview. Elapse wheel/orbit events queue rendering once per animation frame rather than rendering on every input event.
- During continuous playback, geometry and the time bar still update each animation frame. Repeated explanatory HTML and drawing updates are limited to 12.5 Hz; event/chapter/language/forced changes update immediately. Localized date formatters are cached.
- Native desktop GPUs retain the heavier material/reflection path. Narrow viewports and detected software renderers use lighter materials. Pixel-ratio ceilings are 2 for ordinary GPUs, 1.5 for narrow screens and 1 for software rendering. This is an explicit quality/performance tradeoff, not a claim of equal pixel output.

## Performance evidence

The same 1440×900 browser window with device pixel ratio 2 was measured during four seconds of WTC playback from t=18, speed=slow. The headless browser's native AMD Radeon Pro 5300 Metal backend and its SwiftShader software backend are reported separately. Short traces do not establish whole-timeline FPS or physical mobile performance.

The final isolated native-GPU pair ran without concurrent unit tests or other headless jobs. Median frame interval was 16.7 ms before and after; p95 was 16.7 ms before and 16.8 ms after. There were zero frames over 50 ms in either four-second trace. Draw calls at the sampled scene fell from 158 to 35, and gauge DOM updates fell from 240 to 47. This demonstrates lower per-frame work, not an increase in measured native-GPU FPS or a guarantee against stalls elsewhere.

In a separate WTC camera sweep of 601 samples, the largest relative distance step fell from 8.18% to 0.95%; steps above 3% fell from nine to zero. The p95 step increased from 0.17% to 0.70% because movement is distributed continuously instead of accumulating into occasional jumps. All five Elapse renderers coalesced 100 wheel events into one render in the targeted input test.

A software-renderer stress trace improved from about 283 ms median / 2850 ms p95 to about 183 ms / 283 ms after the pixel/material budget and batching. The slower software path remains far below smooth playback, and its pixel ratio was reduced from 2 to 1. Do not describe that result as mobile-device FPS or as complete elimination of stutter.

The batching, shadow and pixel-budget decisions follow the primary three.js guidance on [drawing many objects](https://threejs.org/manual/pages/optimize-lots-of-objects.html), [high-DPI rendering cost](https://threejs.org/manual/pages/responsive.html) and [shadow-map passes](https://threejs.org/manual/pages/shadows.html).

## Validation status

Local validation passed. Local evidence, before/after captures and intermediate failures are retained in `trials/immersive-five-locales-2026-11-03/` (not published). Pages delivery is recorded separately after deployment.

- 180 delivery locale/viewport cases: 12 demos × 5 languages × 375/768/1440 px passed startup, language propagation, retained progress, subject framing, overflow and console checks. A subsequent 105-case Elapse/study pass verified the mobile toolbar/caption layout fix.
- All ten original data models passed Gate 1 with zero errors/warnings.
- All ten full-demo Gate 2 runs passed, producing 611 captures. After substantive camera and facade changes, Titanic, Britannic and WTC passed full reruns with 97, 73 and 57 captures respectively. Later changes to copy, translation protection and keyboard focus were checked separately; these capture counts are not a claim that every final byte was used in every earlier run.
- Unfold 43 unit tests passed; Elapse 112 passed in UTC and again in Asia/Seoul; 3 additional locale-contract tests passed.
- Fifteen gallery locale/viewport combinations passed, including selected-language links, keyboard focus, persistence, explicit URL priority, blocked storage and the English no-script fallback.
- Four representative offline page types passed startup and preference tests. Both studies retained playback, progress and speed during language changes. Reduced-motion preferences suppress automatic playback. Actual Space-key activation on both full-demo language buttons changes language, retains focus and does not accidentally start playback.
- All five Elapse examples passed actual Explore/Timeline button flows, state retention, fixed information-slot bounds and coalesced wheel input checks. Fresh isolated copies of both skills passed their locale audits and standalone builds without relying on the parent checkout.
- Source shared-file synchronization and diff-whitespace checks passed.

Browser review found two additional correctness issues and verified their fixes: mobile Spanish camera controls covered the figure caption, so narrow layouts now put those controls below the canvas; automatic browser translation overwrote app-selected Japanese with Korean, so generated documents now use the standard [`translate="no"` attribute](https://html.spec.whatwg.org/multipage/dom.html#the-translate-attribute). Native Chrome subsequently retained the app's authored English and entered Explore correctly. Browser preferences were not changed.

Remaining acceptance boundaries: comprehensive native-language editing, real-device mobile performance, official repair/manual approval and surveyed/photoreal asset fidelity are not established by these tests. The result remains a detailed educational 3D illustration; a claim of photorealism would be unsupported.
