# Building-history lens: Eiffel construction template

The first supported building renderer is `geometry.type: "eiffel-1889"`. Do not use its mesh for a different building. Other buildings require their own researched geometry, renderer dispatch and checks.

- `subject.kind: "building"`, bilingual name, dimensions `{width:125, depth:125, height:300}` in metres. Height is the study's main-structure reference, not the complete historical flagpole/top-fittings envelope or modern antenna height.
- `geometry.type: "eiffel-1889"` selects the independent procedural template.
- `chapters`: contiguous `bar:[a,b]` covering 0–100, contiguous ISO date bounds and `unit:"month"`. Monthly labels preserve the year. The initial January boundary is a presentation interval, not a claim of work on January 1.
- `pieces`: explanatory component IDs/names with explicit confidence and source links. They are not a one-to-one inventory of every iron part.
- `events`: dated `note` records with bilingual title/text and confidence/source IDs. Major dates are sourced separately from estimated geometry.
- `construction.heightKeys`: dated, nondecreasing illustrative height anchors from 0 to300m. Intermediate height is linear interpolation, not measured daily work or percent of total labour. Platform/arch/scaffold reveal schedules are illustrative and documented in the research notes.
- `stops`: component ID, bilingual name, estimated local metre `box:{min,max}`, `availableFrom` bar value, yaw/pitch. Unbuilt stops are disabled. Overview uses the current constructed envelope.
- `sources`: unique IDs and HTTPS URLs. No source photos, scans, meshes or text are embedded.
- `meta`: interpretation, scope, about and bilingual limitations. Mark estimated member coordinates, facade details, temporary works and subgrade exposure explicitly.

See `research/eiffel-gen.mjs`, `examples/eiffel-tower.json`, `engine/building-model.js`, `engine/eiffel-form.js`, `engine/building-render.js` and `engine/building-ui.js`.

Gate1 dispatches to building schema, chronological, confidence and nominal member-node-envelope checks; ship hull/flooding/seating checks do not certify a building. `node scripts/check_building.mjs path/to/eiffel.html outputDirectory` checks construction stages, styles, fixed slots, exploration availability and return at 375/768/1440px. Standard `shoot.mjs` runs the general Gate2 checks. No automatic gate certifies structural engineering safety, surveyed morphology or lifting sequence.

## Notre-Dame damage/restoration template

`geometry.type:"notredame-2019"`, `restoration.template:"roof-spire-2019-2024"`, and nominal dimensions `{width:48,depth:128,height:96}` select the second building renderer. Width, twin-tower69m and spire96m are official references;128m is an estimated model extent. This branch does not accept Eiffel height keys. It supports minute and month chapters and ends at `2024-12-08T23:59`, the reopening-day milestone. See `research/notredame-notes.md` for access limits and source mapping.

Seven estimated stop boxes share existing confidence/timeline/exploration contracts. `notredame-model.js` computes reversible damage, timber, lead covering, vault repair and scaffolds; independent geometry in `notredame-form.js` keeps roof and stone structure distinct. `notredame-render.js` implements view framing and a labelled roof-hidden vault cutaway. `check_notredame.mjs` tests states, fixed slots and seven stops. These checks do not certify morphology, structural stability, combustion or actual conservation sequences.

## WTC site-history template

`geometry.type:wtc-2001-2018`, `restoration.template:wtc-site-history`, nominal study envelope360×400m and One WTC tip541.3m select a separate renderer. These are not Eiffel height keys. Minute chapters display seconds in New York local wall-clock convention; later chapters are monthly. Mandatory dated impact/collapse events are checked and endpoint is2018-06-11T23:59. Read `research/wtc-notes.md` for record resolution and estimates.

`wtc-model.js` evaluates old tower loss, WTC7, recovery, pools and separate new buildings. Stops include same-site original tower footprints and dated new structures. Unavailable future stops are disabled. `wtc-form.js` is independent schematic geometry; full-collapse and aircraft motion are not investigative/physical validation. `check_wtc.mjs` checks state transitions, fixed slots and inspection at three widths.

## Seoul civil-history templates

`geometry.type: "sampoong-1995"` with `subject.kind: "building"`, or `"seongsu-1994-1997"` with `subject.kind: "bridge"`. Both route through the common structure UI; they never acquire Eiffel construction keys or ship water compartments. `geometry.estimated: true` is mandatory. Use `research/seoul-civil-gen.mjs` and its evidence notes as the complete five-language example. `civil-model.js` defines authored presentation motion, `civil-form.js` the independent forms, and `civil-render.js` the shared structure camera/input shell.

`presentation` requires five-language caption, timezoneText, motionNote, inspectionText, inspectionHint, dimensionLabel, dimensionNote, sceneLabel, estimateNote; five phase names; dimensionValue. All pieces are estimated, even with reference links. Sampoong ends1995-07-19; Seongsu ends1997-07-03. Seongsu retains48m suspended /120m reference span /19.4m original width /1160.8m context length. Do not turn these into a current widened bridge or a single48m repair patch. Don't invent measured basement/column coordinates for Sampoong. Explore hides exterior layers explicitly; it never restores lost geometry after collapse.

### Detailed civil renderer

Sampoong uses `sampoongStudyForm` through the pure `sampoongProgress(t)` adapter, keeping model dates unchanged. Explore slab/column/basement stops request an explicitly explanatory section. Seongsu normal traffic has an independent clock; its historical six-vehicle event uses deterministic functions of the dated bar. The event's route16 bus follows recorded order (held edge, overturn, contact with fallen deck); every intermediate coordinate, angle, duration, livery and deformation is estimated. Do not conflate the normal traffic loop with the actual vehicle inventory. Chinese display labels use CH while standard locale data remains zh.


## Sydney Opera House new-topic example

`geometry.type:"sydney-opera-house"`, `subject.kind:"building"`, `geometry.estimated:true` selects an independent podium/shell/hall renderer. Dimensions120×180×67m are explicitly approximate model extents, not certified source dimensions. There are no Eiffel height keys. Chapters1957–2023 use monthly presentation; records retain date/month precision. Intermediate podium/shell/fit-out reveal is estimated and reversible. Never describe the procedural shell profiles as a measured common-sphere reconstruction.

`presentation` follows the structure UI packs; five stops cover overview, podium, shells, hall and renewal. Hall/renewal inspection hides shells for an explicit explanatory cutaway;18 illustrative reflectors appear only after the2022 renewal. See `research/sydney-notes.md` for factual scope. Run `build-topic.mjs`, `check-topic.mjs`, `check_opera.mjs` and the full `shoot.mjs`; the new-topic profile separately checks contributors and numeric evidence. Preserve earlier templates and their record IDs.
