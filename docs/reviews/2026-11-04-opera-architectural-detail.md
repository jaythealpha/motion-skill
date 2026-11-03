# Sydney Opera House architectural detail — 2026-11-04

Status: passed for the bounded illustrated model and desktop browser QA. Not a surveyed building model, structural/acoustic/accessibility certification, physical-device acceptance or human art approval.

## Scope and preservation

Replace only Opera's previously generic curved sails/box hall with subject-specific equal-radius spherical patches, paired overlapping sails, rib courses/cladding thickness, sloping glass and mullions, a terraced granite podium and a useful auditorium cutaway. Show foundations/podium, rib erection, cladding and glazed fit-out separately; preserve original event IDs, dates, five people's records and three scoped record facts. Existing seven other model JSONs were byte-compared with HEAD and preserved. Their HTMLs and three scene studies were rebuilt only because standalone import maps embed all engine modules. Existing installation folders and unrelated untracked draft documents were left untouched.

## Evidence boundaries

Government heritage description supports interlocking roof groups, slightly splayed hall axes, south-facing stages, precast ribs, tiles and podium finishes. Venue specification Jan2024 pp3,7–8,13–14 informs materials, stage dimensions,18 overhead reflectors and22 wall reflectors. It is a later reference for the renewed2022 interior, not a2024 timeline event. Museums of History NSW dates organ completion30 May1979; it is not rendered as complete in1973. Full source URLs, access limitations and disagreements are documented in `elapse/research/sydney-notes.md` and the example's source list. Exact sphere patch cuts,75m working radius, individual members/seat positions, pane pattern, temporary works and construction increments are estimates. No plans/photos/meshes were copied or embedded.

## Verification

- Unit suite:153 tests pass in UTC and153 in Asia/Seoul. New tests sample both halves of all spherical patches and check finite coordinates, equal-radius consistency, envelope and separate organ chronology. Locale unit tests3 pass; shared copies synchronized; `git diff --check` clean.
- Full Gate2:49 shots pass (chapters/events, colour/blueprint, camera angles, responsive screens and playback speeds). Water and projection are correctly not applicable.
- Focused Opera QA:81 cases pass at375/768/1440px, including reverse-seeking, stable info slots,8 selectable inspection stops, historical time lock, unbuilt stops disabled and explanatory roof cutaway.
- Five-language demo QA:15 viewport/locale combinations pass. Records QA:79 cases pass, including no-JS/WebGL-failure reader fallbacks and scene/records navigation. Labels English by default; Korean/Japanese/Chinese/Spanish retained.
- Inspected screenshots: wide exterior, construction ribs and cladding, exposed ribs, glazing, auditorium, organ and renewal. Fixed black ceramic tiles by uploading the cached authored data texture. Fixed organ obstruction by excluding acoustic reflectors from that explanatory close-up; isolated renewal view hides overhead cutaway ribs. Existing card/date/measurement slots remain fixed and long descriptions scroll inside their card.
- Browser geometry check:342 geometry-bearing objects,0 non-finite attribute values. Thirty reverse seeks preserve321 mesh objects and3103 instances. This checks population stability, not a comprehensive memory-leak audit.
- Isolated90-frame GPU playback sample: median16.7ms,p9517.4ms,266 draw calls,364812 triangles on AMD Radeon Pro5300 / ANGLE Metal at1440px. This is one local GPU sample, not a universal or physical-mobile performance claim.
- Isolated fresh-folder build:12/12 byte-identical outputs, including generator→Opera evidence compiler,7 existing Elapse models,3 scene studies and1 Unfold example. No existing user installation was overwritten.

Screenshots and machine results are retained locally in `trials/opera-detail-2026-11-04/`. No P0/P1/P2 functional or responsive issues found within these checks. Architectural detail remains an independently authored interpretation. Physical iOS/Android, screen-reader audit, surveyed geometry and expert structural approval remain unverified.
