---
name: elapse
description: Turn a shipwreck into one self-contained HTML page with a chaptered time bar that runs from the accident through the sinking to the wreck's decay on the seabed. For example, RMS Titanic from the iceberg to its projected collapse. The page shows water filling the watertight compartments in an x-ray view, the lights failing, the hull breaking, the pieces falling to the seabed with a depth gauge, rusticles and dated collapses over the years, and projections clearly marked. Every scene is marked sourced, estimated, disputed or projection. Claude researches inquiry records, analyses and expedition reports, writes a time model, and must pass two automatic gates before delivering. Use whenever someone wants to see how a ship sank, what happened to a wreck over time, "what happened to the Titanic / Lusitania / Britannic", a sinking timeline, or how a wreck changed from discovery to now, even if they don't name the skill. Korean UI by default.
---

# Elapse

Elapse makes one HTML page about how something changes over time. This version covers **shipwrecks**. The time bar is cut into **chapters**, each with its own unit. For Titanic:

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

**You** supply the subject as a *time model* (JSON) built from public records. Two gates check your work, because nobody reviews it before the person sees it.

The skill folder (`<skill>` below) holds:
- the engine (`engine/`) and the bundled shared code and three.js (`shared/`)
- the scripts (`scripts/`) and the references
- finished examples in `examples/`, each a `.json` and an `.html`:
  - `titanic`: a night sinking, flooding by compartment, a break into two, a deep wreck, projections. Its generator is `research/titanic-gen.mjs`, its notes `research/titanic-notes.md`; copy both patterns.
  - `britannic`: a daytime sinking in one piece with a crumpled bow, in shallow water (120 m), capsizing onto her side. It shows hull paint bands (the hospital ship's green band and red crosses, the mine damage), water entering through open portholes (`inflow`), a shallow-water growth crust and a final-attitude check (`wreck.poses`). Generator `research/britannic-gen.mjs`.

## Rules that always hold

- **Work unattended.** Do not stop to ask the person questions mid-way. If the request is ambiguous (sister ships, two ships of one name), take the most likely reading, say which in `meta.interpretation`, and carry on.
- **Refuse recent or contested sinkings.** Do not build:
  - a sinking within **50 years** of today
  - a **warship incident whose cause is politically disputed**

  Examples: Sewol (2014), Cheonan (2010). Instead, say in chat, briefly and plainly, that families are still living with it and the investigations and disputes continue, so Elapse does not make it. Then stop. Don't push alternatives.
- **Respect.** Never draw people or lifeboats; draw the davits only. No dramatisation. State the death toll in one plain sentence in `meta.about`, with the range when sources differ. Add the site's legal protection if any.
- **Mark every fact.** Every piece, track key and event is `sourced` (`sourceIds`), `estimated`, `disputed` (with `alternatives`) or `projection`. Never present a guess as sourced. The page shows the shares and warns below 50% sourced. That is fine and honest, so don't inflate it.
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
   - **Not a ship:** say in chat that Elapse covers shipwrecks for now, and stop.
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
   - **Card wording:** Korean first. Keep each card one or two short sentences; numbers go in `detail`.
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

   Iterate with `--quick` (a few shots) and finish with a full run. Then **look** at `out-shots/key.png` and `contact.png`, and open doubtful shots at full size. For a close look, run `node <skill>/scripts/shoot.mjs out.html views --only "t=30&yaw=200&pitch=10&zoom=0.6&xray=1" --scale 2` (you can repeat `--only`). Check:
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

`?t=0..100` `&chapter=N` `&style=color|blueprint` `&xray=0|1` `&depth=simple|detail` `&lang=ko|en` `&speed=xslow|slow|normal|fast` `&yaw=&pitch=&zoom=` `&auto=0` `&play=1` `&panel=sources|about` `&branch=a|b`

## When something else fits better

- How a product goes together, or an exploded view of a phone → **unfold**.
- A playful, hand-drawn object you press buttons on → **colorfigures**.
- A data chart of ship losses → a charting skill.
