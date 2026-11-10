# Opera / WTC rendering release review — 2026-11-10

Status: **passed** for the scoped local UI/rendering review. Public release is verified separately against the pushed main revision and served bytes. This is an agent review, not a surveyed-geometry or human accessibility certification.

## Changes

- Sydney full construction timeline shares the approved art pass: finer bounded shell tessellation, generated ceramic detail, low directional light, derivative-filtered harbour water, and independently estimated hall timber/trim.
- Water's approximate building reflection is multiplied by shell construction progress. Blueprint uses original water/fill, disables appearance hooks/maps and restores them on return. The historical model JSON and people records are unchanged; the 1979 organ and 2022 renewal remain distinct.
- WTC full timeline and impact study: half-float scene target where supported, two quarter-resolution bloom targets, selective warm highlight extraction, separable blur, edge antialias and a single ACES/output transform. Blueprint bypasses postprocessing; narrow initial viewports/software GPUs use direct rendering without targets. A diagnostic `render=direct` option bypasses the postprocess.
- Full WTC replaces coarse lower forks with 19 estimated tridents per face and applies a restrained original palette to instanced context. Facade profiles/coordinates are estimates. Authored fire radiance is not a measured temperature. No changes to event times, people records, victims, trajectories or historical mechanics.
- Shader/material warmup precedes requested autoplay and restores the original requested state. Reduced motion continues to prevent autoplay. New bounded DOM metrics make performance inspectable without hidden runtime calls.
- The gallery now lists 17 demos, including the Opera same-camera comparison. Five-language links retain the gallery selection. Fixed an existing Japanese metadata count of15.

## Actual browser verification

Native in-app Chromium, ANGLE Metal AMD Radeon Pro5300. Browser tools only; no headless/CDP gate script was executed in this run.

- Sydney hall/scene and WTC scene: **30 effective CSS viewport/language combinations**, widths375/768/1440, languages en/ko/ja/zh/es. Verified actual `innerWidth`, locale/selection, visible canvas and no document horizontal overflow. Evidence: `opera-wtc-browser-evidence.json`.
- Screenshots inspected at all three sizes for Sydney and at375/768/1440 for WTC; WTC tablet locale/layout also checked. Gallery:15 additional viewport/language cases,17 cards and0 incorrectly localized demo links. Representative study screenshots inspected at375 and desktop during playback. Spanish long labels wrap; scene controls remain usable.
- Sydney: construction chapter jump, playback/pause, hall→overview, colour→blueprint→colour, keyboard Home in hall and preservation of selected stop. Surface shader error found during the first integration was fixed by newline boundaries around preprocessor directives; a fresh renderer showed no console errors/warnings.
- WTC: north impact8.05, south impact12.7, south collapse28.55, north collapse47.25, WTC7 collapse53.1 and rebuilding100. Each retained its sourced event text, shot and full render path. Blueprint reported `lastFrame:direct` and colour restored full rendering.
- Both representative studies: five language changes at375, no overflow; the Opera comparison produced two real images. Fresh375 WTC study reported `mode:bypass`,0targets as expected. Resizing an existing desktop renderer is not a cold mobile start.
- Prior Opera study review also covers375/768/1440, five languages, keyboard, comparison, speed and three same-camera shots; see the adjacent `2026-11-10-opera-fable` review. Its earlier measurements are historical evidence, not new public performance measurements.

### Playback measurements

| Case | Samples | Median interval | P95 interval | >50ms intervals |
|---|---:|---:|---:|---:|
| WTC full, desktop, moving toward south collapse |406|16.7ms|18.3ms|0|
| Sydney full, desktop, design→early shells |590|16.7ms|18.2ms|1|
| WTC impact study, desktop, fire→smoke |507|16.6ms|20.1ms|0|

Intervals are actual local playback samples, not a universal FPS guarantee. CPU submission is not GPU elapsed time. Hidden tabs and setup warmup are excluded from interval statistics; one-time shader compilation still adds startup latency. Physical phone GPU performance, cold-cache network speed and thermal throttling are **unverified**. Postprocessing is a selective lighting/edge improvement, not a photoreal reconstruction.

## Automated / source checks

- Elapse unit suite:161 passed in UTC,161 passed in Asia/Seoul.
- Shared narrative/default-language checks:3 passed.
- Gate1 Sydney:0errors/0warnings; WTC:0errors/0warnings. Source-share38%/65% measures model items, not historical accuracy.
- Rebuilt8 public timelines and4 studies from the current modules. The supplemental research JSON was not published as an extra demo.
- `git diff --check`: clean. Historical model/evidence JSON unchanged. Eiffel autoplay and Titanic scene startup smoke checks passed after the shared mount change; WTC and Sydney records↔scene return retained the selected historical position.

## Evidence and limits

Surface/geometry fact references were read as facts only; no source images, scans or meshes were copied:

- [Smithsonian: World Trade Center cladding fragment](https://americanhistory.si.edu/collections/object/nmah_1182954): aluminum-alloy cladding around the closely spaced steel perimeter.
- [9/11 Memorial & Museum: tridents](https://www.911memorial.org/connect/blog/wtcs-steel-tridents-are-returning-ground-zero-updated): structural character and cladding.
- [NIST NCSTAR1-3A](https://nvlpubs.nist.gov/nistpubs/Legacy/NCSTAR/ncstar1-3a.pdf):59 perimeter columns per face. Trident branch heights, detailed profiles and coordinates here remain authored estimates.
- Sydney sources and120mm tiles /18renewal reflectors are documented in the prior art-pass review and existing source model.

No P0/P1/P2 issue remained in the scoped inspected states. Unchanged export/video paths, complete assistive-technology behavior, physical mobile hardware and every frame of all other examples were not retested. Follow-up public URL/byte verification is reported with delivery; no claim of a forensic or photoreal result.
