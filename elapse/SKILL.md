---
name: elapse
description: Build a Sampoong Department Store collapse/aftermath study (1995), a Seongsu Bridge collapse/replacement study (1994–1997), a World Trade Center9/11/recovery/rebuilding study (2001–2018), an offline Notre-Dame fire/restoration timeline (2019–2024), a chaptered construction timeline for the Eiffel Tower (1887–1889), or turn a shipwreck into one self-contained HTML page with a chaptered time bar that runs from the accident through the sinking to the wreck's decay on the seabed. For example, RMS Titanic from the iceberg to its projected collapse. The page shows water filling the watertight compartments in an x-ray view, the lights failing, the hull breaking, the pieces falling to the seabed with a depth gauge, rusticles and dated collapses over the years, and projections clearly marked. Every scene is marked sourced, estimated, disputed or projection. Claude researches inquiry records, analyses and expedition reports, writes a time model, and must pass two automatic gates before delivering. Use whenever someone wants to see how a ship sank, what happened to a wreck over time, "what happened to the Titanic / Lusitania / Britannic", a sinking timeline, or how a wreck changed from discovery to now, even if they don't name the skill. English UI by default, with Korean, Japanese, Simplified Chinese and Spanish.
---

# Elapse

For **Sampoong / 삼풍백화점** or **Seongsu Bridge / 성수대교**, start from `research/seoul-civil-gen.mjs` and read `research/seoul-civil-notes.md` plus `references/building-format.md`. Use the dedicated civil template; retain approximate/conflicting event times, estimated geometry, five languages and the historical endpoint. Do not depict people. The sourced Seongsu route16 bus / six-vehicle event can be illustrated: retain the recorded order and distinguish all estimated coordinates, durations, angles and vehicle damage from facts. Seongsu supports an independently clocked normal-traffic illustration before collapse and after reopening; mark every vehicle shape, count, spacing and speed estimated. Hide the independent normal-traffic loop during collapse/replacement without implying evacuation; the separate historically anchored vehicle-event layer remains during failure/aftermath. Do not invent a rebuilt department store, or reduce the whole Seongsu upper-structure replacement to a48m patch. Six Sampoong / seven Seongsu inspection stops (including a close traffic view), locked history, quarter/half playback and staged failure views are included. These are authored educational animations, not forensic simulation or surveyed plans.

Elapse makes one HTML page about how something changes over time. This version covers **shipwrecks**, **historical buildings** (Eiffel construction, Notre-Dame fire/restoration, World Trade Center site history, Sampoong collapse/aftermath), and **Seongsu Bridge collapse/replacement**. The time bar is cut into **chapters**, each with its own unit. For Titanic:

| Chapter | Real time | Bar | Unit |
|---|---|---|---|
| 충돌 | 23:39 → 23:41 | 0–6 | minutes |
| 침수 | 23:41 → 02:15 | 6–38 | minutes |
| 두 동강 | 02:15 → 02:20 | 38–47 | minutes |
| 하강 | 02:20 → 02:30 | 47–56 | minutes |
| 해저 | 1912 → now | 56–90 | years |
| 앞으로 (예측) | now → 2100 | 90–100 | years |

One storyline runs through the bar: **how the water changed the ship.** The night scenes explain why the wreck looks as it does today. The viewer can:
- pick the playback speed
- turn on **x-ray** to see the bulkheads and the water inside
- switch between colour and blueprint, and simple and detailed cards
- read a card at every event, each marked with how sure it is
- enter **Explore** on any ship with hull geometry or explicit `stops`: lock the historical date, visit existing bow/bridge/stern structures, orbit/zoom and adjust virtual survey light. Titanic also supports an independent fauna/snow clock in its eligible observation window; leaving Explore restores the prior historical time and view.

**You** supply the subject as a *time model* (JSON) built from public records. Two gates check your work, because nobody reviews it before the person sees it.

The skill folder (`<skill>` below) holds:
- the engine (`engine/`) and the bundled shared code and three.js (`shared/`)
- the scripts (`scripts/`) and the references
- finished examples in `examples/`, each a `.json` and an `.html`:
  - `titanic`: a night sinking, flooding by compartment, a break into two, a deep wreck, projections. Its generator is `research/titanic-gen.mjs`, its notes `research/titanic-notes.md`; copy both patterns.
  - `britannic`: a daytime sinking in one piece with a crumpled bow, in shallow water (120 m), capsizing onto her side. It shows hull paint bands (the hospital ship's green band and red crosses, the mine damage), water entering through open portholes (`inflow`), a shallow-water growth crust and a final-attitude check (`wreck.poses`). Generator `research/britannic-gen.mjs`.

## Facts, people and memory

Read `references/remembrance-format.md` before authoring historical-event content. The purpose is to preserve what happened, concrete help/preparation and lessons, with evidence and uncertainty. Supply optional version-1 `remembrance` with scoped values and all five languages. Keep personal action times at the precision supported by evidence. Never invent a name, rescue count, dialogue, motive or route; do not equate a company's evacuation count with a solo rescue total. Separate survivor recollection, institutional accounts, investigation findings and editorial reflection. Include collective care and preparation; do not rank heroism or animate death totals. Non-disaster subjects may use construction/research/restoration records rather than a memorial narrative.

The Titanic/Britannic examples include help and care records alongside their legacy discovery/survey records. Follow their distinctions between testimony, library-published extracts and contemporary press; never move a Titanic recollection into a Britannic narrative merely because a person survived both. A reported count of people picked up alive is not automatically a final-survivor total.

Notre-Dame’s examples distinguish emergency response, heritage safeguarding, scientific assessment and restoration crafts. Keep transferred-object batches separate; temporary stabilization supports are not permanent rebuilt components. A retrospective’s publication date is not the day every worker acted. Preserve the existing reopening record and its distinction between ceremonies and public access.

Packaged generators load `research/records/*.json` through `withRemembrance`. Such pages default to the reader, render English content without scripts, and lazily initialize the optional 3D view. `?view=scene`, explicit `?t=…` and Explore/play links retain the old scene entry. A related scene is context, not a re-enactment of a person's exact actions. Gate 1 and build validate records; verify five-language reader behavior, no-JS/WebGL-failure fallback and scene return as well as normal scene QA. Do not claim model-item source shares measure historical accuracy.

## Rules that always hold

- **Work unattended.** Do not stop to ask the person questions mid-way. If the request is ambiguous (sister ships, two ships of one name), take the most likely reading, say which in `meta.interpretation`, and carry on.
- **Refuse recent or contested sinkings.** Do not build:
  - a sinking within **50 years** of today
  - a **warship incident whose cause is politically disputed**

  Examples: Sewol (2014), Cheonan (2010). Instead, say in chat, briefly and plainly, that families are still living with it and the investigations and disputes continue, so Elapse does not make it. Then stop. Don't push alternatives.
- **Respect.** Never draw people or lifeboats; draw the davits only. No dramatisation. State the death toll in one plain sentence in `meta.about`, with the range when sources differ. Add the site's legal protection if any.
- **Mark every fact.** Every piece, track key and event is `sourced` (`sourceIds`), `estimated`, `disputed` (with `alternatives`) or `projection`. Never present a guess as sourced. The source-share calculation measures model items, not historical accuracy. Record-enabled pages show evidence and reconstruction guidance; other pages retain the below-50% warning. Never inflate the shares.
- **Licence.** Take facts only (sizes, times, counts, order, names). Write every sentence yourself. Never embed or download photos, scans, sonar images or video frames. Sources appear as links only.
- **Gates loop at most 3 rounds each.** Whatever still fails goes into `meta.limitations` (shown on the page), and you say so when you deliver.
- **Requirements.** Node 18+ for Gate 1 and the build; Node 22+ plus Chrome or Chromium for Gate 2 (no npm packages). When Gate 2 can't run, it prints `GATE2 SKIPPED` with the reason. Build with `--gate2 skipped` and say so. Gate 1 always runs.

## Workflow

Work in a folder of your own: notes, generator, `model.json`, `out.html` and the shots folder together. A generator imports the engine helpers from the skill by absolute path:
```js
const SK = '<skill>';   // e.g. /Users/you/.claude/skills/elapse
const { linerOffsets } = await import(`${SK}/engine/hullform.js`);
const { deckHeightAt, halfBreadthAt } = await import(`${SK}/engine/geom.js`);
// where a piece is at a moment (a funnel coming away): evaluate a draft of the model
const { normalizeModel } = await import(`${SK}/engine/model.js`), { evaluate } = await import(`${SK}/engine/tracks.js`);
const { timeToBar } = await import(`${SK}/engine/chapters.js`);
const s = evaluate(normalizeModel(draft), timeToBar(normalizeModel(draft), '1916-11-21T09:04'));
s.pieces.get('funnel-1').matrix   // its world matrix then (column-major 4×4)
```

1. **Understand the request.**
   - **Check the refusal rule first.** If it applies, refuse as above and stop.
   - **Eiffel Tower construction:** follow the building branch below; do not create hulls or fake ship dimensions.
   - **World Trade Center9/11/rebuilding:** follow its separate building branch below; the recent-sinking refusal concerns sinkings.
   - **Notre-Dame fire/restoration:** follow its building branch below. The recent-sinking refusal is specific to sinkings, not building conservation.
   - **Other non-ship subjects:** explain that the current templates cover shipwrecks, Eiffel construction and Notre-Dame restoration. A new building template needs separate research, geometry and checks.
   - **Pin down the ship.**
     - The tuned range is steel powered ships from 1880 on: liners, cargo ships, warships.
     - Sailing ships, wooden ships and raised wrecks (Vasa, Mary Rose) can be made, but say in `meta.interpretation` and at delivery that they are outside the tuned range.
   - **Choose the features the record supports:**
     - `lights`: a night sinking with a known power failure
     - `compartments`: flooding known compartment by compartment
     - `break`: the hull broke apart
     - `projection`: there are dated or ranged collapse predictions. With none (or only undated ones), turn it off, end the bar at today, and mention any undated view in a card.

     Say why in `meta.interpretation`.
   - **Choose the chapters (1–6).** A wreck with no recorded decay can end with its visits and discoveries. Give the accident minutes and the decades on the seabed each their own chapter. Split a long night so that short moments (a ten-second collision, a two-minute break) get enough bar to be seen; give the most important stretch the most bar. Titanic uses six: 충돌, 침수, 두 동강, 하강, 해저, 앞으로.
2. **Research.** Read `references/research.md`. Collect four things:
   - the ship's dimensions, form, superstructure and subdivision
   - the accident timeline with flooding, angles, break and power
   - the descent and the wreck layout
   - the dated states of the wreck and the projections

   Write `research/<ship>-notes.md` as you go: what is sourced, what conflicts, what you estimated and from what.
3. **Write the model.**
   - Read `references/model-format.md` and copy the structure of the closest example. Write a **generator script** (`research/<ship>-gen.mjs`) that writes `model.json`. You will change numbers many times.
   - **The ship:** a `ship` group holds the hull piece or pieces. If it broke, use two hulls with `range` halves meeting at the break and `cap: 'jagged'`.
   - **Superstructure:** it sits `on` the hull.
   - **Compartments and bulkheads:** they ride on the hull half they belong to.
   - **Before a break,** pieces ride on their parent. Draw the whole hull as one piece and give the bow, middle and stern hulls `appear` at the break, with a `vanish` collapse (`card: false`) on the whole hull at that moment, so no seams show before it. From the break on, the bow and stern get their own pose tracks, whose first key is exactly where they were. Superstructure crossing a break is split so each part rides with its section; whatever rides on a piece is crushed or tipped with it.
   - **A bent or crumpled section without a break** (Britannic's bow) uses the same hull swap with no `break` event. A child piece can be turned on its parent with `rotate: { trim, list, heading }`.
   - **What made it sink matters, not just bulkheads:** water entering from outside above a bulkhead (open portholes, a hatch) is an `inflow` event on that compartment.
   - **Look:** hull `paint.bands` draw liveries, stripes and the damage area (they follow the hull's curve). `environment.growth` picks rusticles (deep, cold), `crust` (shallow, warm) or `none`. Pick depth-gauge `refs` near the site's depth (a 120 m wreck: a 250 m building, not a 555 m tower).
   - **The hull's top deck** is the deck the published moulded depth reaches; decks above it are deckhouses.
   - **The final attitude** (on her side, bow to the south) goes in `wreck.poses`.
   - **Key density:** write keys where something is recorded or the motion changes; a track counts once in the shares however many keys it has.
   - **X-ray:** set `features.xrayChapters` to the chapters where the compartments matter (Titanic: the flooding chapter).
   - **Several things at one moment** (the break, funnels falling): give the minor ones `card: false` so the main card stays on screen.
   - **Camera:** for a shallow wreck keep the eye underwater on the seabed chapters (a low pitch or a short distance); Gate 2 fails a shot that looks at an underwater subject from above the sea. The seabed is drawn to cover the whole route. Hold a target with two keys before switching to another, so the blend never loses both.
     Write keys that follow the piece that matters (the bow on its way down). Use a point for wide wreck views. Leave room for the iceberg if it is in frame. Keep `cameraSubject` to the main pieces.
   - **Iceberg:** place it beside the ship's track, never in its path.
   - **Burial:** give buried pieces an `embed` depth from the record.
   - **Card wording:** Provide English, Korean, Japanese, Simplified Chinese and Spanish in each user-visible bilingual field. English is the default. Keep each card one or two short sentences; numbers go in `detail`.
4. **Gate 1 (data).** Run `node <skill>/scripts/check_model.mjs model.json --official LOA,BEAM,DEPTH` until it prints `GATE1 PASS`. It checks:
   - schema and references, and chapters (cover the bar, in time order)
   - every confidence mark, with projection chapters all marked `projection`
   - the hull size (±0.5%)
   - water (never falls before the break, crosses a bulkhead only after an overflow)
   - no piece goes into the seabed beyond its `embed`
   - the final wreck layout (`wreck`)
   - seating on the deck, overlaps, lights and features

   Fix the data, not the checker.
5. **Build, then Gate 2 (pictures).**
   - All subjects use fixed information slots outside the canvas. Do not restore overlay cards for a new ship.
   - New ships automatically get a hull overview; set `stops` for researched areas and observation angles (see model format). Use `stops: []` when inspection is unsupported. This does not generate detailed geometry or evidence.
   - `chapters[].playbackRate` sets a model-specific speed multiplier (0.1–2) without a new subject-name branch. Camera keys remain model data. Dedicated water/fire/ecological effects are still subject-specific; do not claim they transfer automatically.
   - Run `node <skill>/scripts/check_layout.mjs out.html layout.json`: 375×667, 375×812, 768×1024 and 1440×900, both styles, five times. Information slots must remain fixed and must not intersect.

   ```
   node <skill>/scripts/build.mjs model.json out.html
   node <skill>/scripts/shoot.mjs out.html out-shots
   ```
   Gate 2 shoots every chapter's start, middle and end, every event, both styles, x-ray on and off, three angles, English, the panels, three phone shots and the playback speeds. It fails on:
   - script errors, a blank canvas, horizontal scroll, text overflow, a card or gauge outside the stage
   - the camera losing what it follows (less than 60% of it on screen, or under 2% of the stage)
   - lit windows not showing before the power fails or still showing after (`lights`)
   - no water in x-ray after the first overflow (`compartments`)
   - the projection badge missing (`projection`)

   Iterate with `--quick` (a few shots) and finish with a full run. Automatic gates are structural checks, not visual approval. Inspect the full-size 375×812 and short-phone screenshots for occlusion/readability as well as the contact sheet. Then **look** at `out-shots/key.png` and `contact.png`, and open doubtful shots at full size. For a close look, run `node <skill>/scripts/shoot.mjs out.html views --only "t=30&yaw=200&pitch=10&zoom=0.6&xray=1" --scale 2` (you can repeat `--only`). Check:
   - the ship is recognisably that ship (funnels, colours, superstructure)
   - the overflow is visible in x-ray
   - the break and the landing match the record
   - the wreck shows the right damage
   - no people anywhere

   Fix and repeat. Then rebuild with `--gate2 pass` (or `fail` / `skipped`) so the page records it.
6. **Deliver.** Hand over `out.html`, which works offline and on phones; keep `model.json` beside it. In a few lines, tell the person:
   - what you built and how you read the request
   - the chapters
   - the sourced share
   - the main limitations
   - how to use it:
     - drag the bar or press play, and pick the speed
     - chapter buttons jump to each chapter
     - 투시 shows the compartments
     - 컬러/도면 and 간단히/자세히 change the view
     - 이 장소에 대하여 holds the memorial note

   Mention the respect rule you followed (no people drawn).

## Page parameters (for screenshots and links)

`?t=0..100` `&chapter=N` `&style=color|blueprint` `&xray=0|1` `&depth=simple|detail` `&lang=en|ko|ja|zh|es` `&speed=xslow|slow|normal|fast` (1× / 2× / 3× / 5×; default 2×) `&yaw=&pitch=&zoom=` `&auto=0` `&play=1` `&panel=sources|about` `&branch=a|b`

## When something else fits better

- How a product goes together, or an exploded view of a phone → **unfold**.
- A playful, hand-drawn object you press buttons on → **colorfigures**.
- A data chart of ship losses → a charting skill.

## Bundled exploration mode

The example renderer supports `?mode=explore`. Starting in a sinking/projection chapter opens a documented illustrative wreck-view date; starting in a historical wreck chapter retains that date. History playback, chapter navigation and full-timeline video recording are disabled during exploration. Image capture remains available. Return to Timeline restores the prior date/style/camera and stays paused. The new fauna/snow clock is separate from calendar years, stops with its own pause button, and respects reduced motion. Britannic supports structural/camera/light inspection, not the Titanic-specific fauna animation. Light strength is an illustrative viewing preference, not measured expedition lighting.

`node scripts/check_exploration.mjs [outputDirectory]` checks the bundled examples at 375/768/1440px, independent clocks, view restoration, intensity, zoom control and reduced motion. Building-history examples require a separate subject presentation layer; they are not implemented by relabelling ship parts.

## Building branch — Eiffel Tower (1887–1889)

Read `references/building-format.md` and `research/eiffel-notes.md`. Use `research/eiffel-gen.mjs` as the source-model pattern. Keep official milestone dates separate from estimated member geometry and intermediate construction. Main-structure height300m does not reproduce the complete historical flagpole/top-fittings height; no modern antennas or modern night lights. The site and subgrade view are illustrative, not surveyed.

Use `subject.kind=building` and `geometry.type=eiffel-1889`; the renderer, gauges, monthly date labels and Gate1 follow a building-specific branch. Reuse the common time bar, speed choices, cards, source marking, colour/blueprint and exploration view. Run Gate1, the full general Gate2, and the focused `check_building.mjs`. Inspect stage and macro views at all three responsive sizes. Do not present a stage height ratio as a labour/progress percentage, or this mesh as a verified structural/assembly plan.

## Building branch — Notre-Dame (2019–2024)

Read `research/notredame-notes.md`; use `research/notredame-gen.mjs`. `subject.kind=building`, `geometry.type=notredame-2019`, `restoration.template=roof-spire-2019-2024` select a dedicated geometry/state renderer, not Eiffel height growth. Minute chapters use Paris local wall-clock values; later stages use months. Official records supply dated milestones. Roof loss, smoke/fire, approximate spire motion, damaged vault openings, supports and intermediate restoration are estimates. Never label the short collapse-animation interval as a measured physical duration. Keep surviving twin towers and rose windows. Do not infer cause or draw people. The final date is the December2024 reopening, not all conservation ending.

Seven exploration stops lock the chosen historical time. Vault inspection deliberately hides roof/spire layers for a labelled cutaway; it is not a visitor-access claim. Keep ship controls absent. Run Gate1, full Gate2 and `scripts/check_notredame.mjs`. Check reversible intact/damaged/rebuilt geometry and all stops at375/768/1440px; inspect screenshots. Other buildings still require independent templates.

## Building branch — World Trade Center (2001–2018)

Read `research/wtc-notes.md`; use `research/wtc-gen.mjs`. `geometry.type=wtc-2001-2018` and `restoration.template=wtc-site-history` select independent old/new geometry and dated site states. Source the two impacts, separate tower collapses, separateWTC7 fire/collapse, recovery and reopening milestones from memorial/NIST/owner records. No inferred trajectories, attack controls, harm to people or invented names. Full collapse/aircraft/fire/dust and two-minute motion windows are **illustrative**, not NIST models, physics or real durations. Keep this distinction visible in cards, captions and limitations.

Use New York local wall-clock values; seconds labels preserveWTC7’s17:20:52 record. Original tower footprints remain when buildings are lost; new One WTC is not either original tower. Memorial/One/Oculus inspection availability must follow dates. Stop at the2018 milestone; do not infer today’s whole campus or invent a completed2 WTC. Run Gate1, full Gate2 and `scripts/check_wtc.mjs` across375/768/1440px. Check damage order, reversal, absent/future structures, fixed slots and view restoration. Other subjects require their own researched templates.

For WTC critical scenes, retain `wtc-direction.js` authored shot windows and `wtc-effects.js` procedural layers. Automatic camera must yield to manual/exploration views. Include `scripts/check_wtc_directed.mjs` coverage of approach/impact/smoke and upper/mid/ground collapse stages at375/768/1440px. Generic context blocks are not surveyed buildings. Preserve the visible distinction between official event times and estimated motion.

## Optional Britannic quality tier

This is an independently authored damaged-wreck interpretation, not a photogrammetric survey. It supports the existing Britannic template only; never promise it for an arbitrary new subject.

```
node <skill>/scripts/build-quality.mjs <skill>/examples/britannic.json britannic-quality.html
node <skill>/scripts/check_model.mjs britannic-quality.model.json --official 269.1,28.65,19.66
node <skill>/scripts/shoot.mjs britannic-quality.html quality-shots
node <skill>/scripts/check_quality.mjs britannic-quality.html quality-views
```

Open `?t=90&mode=explore&stop=bow&cutaway=1&study=quality`. The page offers existing/high comparison and six inspection targets. The roof/forward-shell cutaway is explicitly explanatory; do not describe it as observed roof collapse. Cutaway/quality links reload the page. `quality=standard` overrides the companion model's high default.

- Damage, frames, deck plates, estimated bridge instruments, foredeck gear and three propellers supplement the existing model. Individual coordinates, plate tears, blade profiles/pitch and instrument positions remain estimates. Sources are expedition text/facts, no downloaded photos or traced modern meshes.
- Mobile and detected software renderers use fewer repeated rivets/growth details, cheaper material normals and no high-resolution shadow pass. This is an asset tier, not guaranteed real-device FPS.
- Inspect full-size screenshots of the break, bridge, foredeck and stern at all three widths. Also check mode transitions, below-wreck camera position, render errors, performance and source caveats. Automatic Gate 2 alone is not visual approval.
- The generated companion model resets Gate 2 to unknown. Record pass only after running its checks. A quality label is not a claim of measured CAD accuracy or photorealism.

## Approved visual direction

For subsequent Elapse subjects and revisions, follow `references/visual-quality-baseline.md`: the user approved the Britannic fracture art-pass detail level on2026-11-02. Preserve this level of structural readability, restrained materials, context/close-up views and fixed information slots. Implement subject-specific evidence and geometry rather than copying Britannic damage into unrelated examples. Visual approval does not establish measured accuracy or physical-device performance.

The packaged Titanic, Britannic, Eiffel, Notre-Dame and WTC examples opt into subject-specific high-detail tiers with `meta.renderQuality: "high"`; their research generators retain that setting. See `references/quality-tier.md`. New geometry must use the subject's own structural references and dated visibility/transform groups. The shared material treatment alone is not sufficient evidence of matching the approved detail standard.

### Locales and playback quality

Populate user-facing `{en, ko, ja, zh, es}` fields without changing sourced facts or identifiers. English is the fresh-install default. The gallery language is passed by `?lang=` and remembered locally; an explicit URL wins. Translate titles, parts, steps, events, limitations and inspection descriptions, not only controls. Never call a translation API during playback. Review domain terminology and preserve source titles as bibliographic originals. Verify all five locales at 375, 768 and 1440 px, and retain time/view/speed when switching language. The renderer uses full materials on native GPUs and a lighter material/pixel budget for software rendering or narrow mobile viewports. Measure real animation intervals separately from draw calls; do not claim physical-device FPS from headless software tests.

Before building a newly generated model, run `node <skill>/shared/check-locales.mjs model.json`. Fix missing translations until it prints `LOCALES PASS`; the normalizer and the raw research-style fields are both checked. This check supplements the data and screen gates. It does not assess translation accuracy.
