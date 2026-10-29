# Elapse Phase 1 (Titanic) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Elapse, a new installable skill that turns a sunken ship into one offline HTML page with a chaptered time bar. It runs from the moment of the accident, through the sinking, to the wreck's decay on the seabed. The first example is RMS Titanic; HMHS Britannic follows as a field trial. The same work extracts a `shared/` core that Unfold switches to.

**Architecture:**
- **The time model:** Claude writes it as JSON with chapters, pieces, keyframed tracks, events, camera keys and optional branches.
- **Pure modules:** they turn a bar position t into a state:
  - `chapters.js`: bar ↔ real time
  - `tracks.js`: the state at t
  - `geom.js`: hull loft, boxes, water planes
  - `checks.js`: physical checks

  Gate 1 and the page use the same modules.
- **The page:** a three.js renderer (perspective camera, toon/blueprint styles, x-ray mode, night sky, sea, seabed) and a UI shell. Gate 2 drives the page in headless Chrome through the shared CDP core.

**Tech Stack:** ES modules, three.js 0.180.0 (vendored, moved to `shared/vendor`), Node `node:test`, headless Chrome over CDP (no npm packages). Same stack as Unfold.

**Spec:** `docs/specs/2026-10-29-elapse-design.md`. Sibling skill: `unfold/` (specs `docs/specs/2026-10-28-unfold-design.md`, `2026-10-29-unfold-phase2-design.md`).

## Global Constraints

- **No git:** the repo was not under git when this plan ran, so there are no commit steps. Before touching `unfold/`, Task 1 copies it to `.backup/unfold-2026-10-29/`.
- **One file, offline:** one self-contained HTML file with nothing fetched from the network. Korean UI by default, English too. Node 18+ for Gate 1 and the build; Node 22+ and Chrome/Chromium for Gate 2. When Gate 2 can't run it prints `GATE2 SKIPPED` with the reason.
- **Unattended:** the skill never asks mid-way. Each gate gets at most 3 rounds of fixes; whatever still fails goes into `meta.limitations` (shown on the page) and is said at delivery.
- **No people:** no people, no lifeboats, no film-like dramatisation. Davits are drawn; boats are not.
- **Licence:** facts only (sizes, times, numbers, order, names). Every sentence is self-written. No photos, scans, video frames or plan images; sources appear as links only.
- **Confidence classes:** every piece, track key and event is one of:
  - `sourced`: has `sourceIds`
  - `estimated`
  - `disputed`: also needs `alternatives`
  - `projection`: every key and event in a projection chapter
- **Titanic chapters (starting values):**

  | Chapter | Real time | Bar | Unit |
  |---|---|---|---|
  | 그날 밤 | 1912-04-14 23:39 → 04-15 02:20 | 0–45 | minute |
  | 하강 | 02:20 → landing | 45–55 | minute |
  | 해저 | → the build year | 55–90 | year |
  | 앞으로 (추정) | the build year → projected collapse | 90–100 | year |

  Inside a chapter, time is proportional to the bar. Other ships may use 1–5 chapters.
- **Optional features:** `lights`, `compartments`, `break`, `projection`. Checks tied to a feature run only when the model enables it.
- **Speeds for 0→100:** xslow 60 s, slow 36 s, normal 24 s (default), fast 12 s. Keys `[` and `]`.
- **Depth references:** ko 롯데월드타워 555 m, en Eiffel Tower 330 m.
- **Times:** shown in ship's time and labelled so. Year chapters show the year only.
- **Deep seabed:** drawn lit, with an on-screen note that it was lit to be visible.
- **X-ray:** on by default in the first chapter (the accident chapter), off elsewhere. URL `xray=0|1` overrides it.
- **Official size:** length overall, beam and moulded depth within ±0.5% (relative).
- **Scope:**
  - Tuned range: steel powered ships from 1880 on. Sailing ships, wooden ships and raised wrecks are made but flagged as out of range.
  - Refused in chat, politely, with nothing built: sinkings within 50 years of the build year, and warship incidents whose cause is politically disputed (e.g. Sewol 2014, Cheonan 2010).
- **Units and frames:** world units are metres, z up, sea surface z = 0, seabed z = −`environment.seaDepth`. The ship frame is x forward from midships, y to port, z up from the keel.
- **URL params:** `t`, `style=color|blueprint`, `xray=0|1`, `depth=simple|detail`, `lang=ko|en`, `speed=xslow|slow|normal|fast`, `yaw`, `pitch`, `zoom`, `auto=0`, `play=1`, `panel=sources|about`, `branch=a|b`, `chapter=N`.
- **Install:** `~/.claude/skills/elapse`. Unfold's install is replaced only after all its tests and gates pass, after copying the old install to `~/.claude/skills/.backup/unfold-2026-10-29/`.

## Review Focus

1. **A time without a zone, on a machine in Seoul:** `"1912-04-14T23:39"` must mean the same instant on every machine, because JS parses zone-less ISO strings as local time. Test: `chapters.test.mjs › parseAt is zone-independent` (Task 2).
2. **A ship with none of the optional features** (one daylight chapter, sinks in one piece, shallow water, no projection): Gate 1 passes, the page hides the compartment gauge, the lights and the projection badge, and Gate 2's feature checks are skipped. Tests: `check_model.test.mjs › plain ship passes` (Task 4) and the `plain-ship` quick shoot (Task 7).
3. **Scrubbing backwards across the break or a collapse:** the state is a pure function of t, with no piece stuck broken or collapsed. Test: `tracks.test.mjs › pure across break and collapse` (Task 2).
4. **A heading key going 350° → 10°:** it turns 20° the short way, not 340°. Test: `tracks.test.mjs › heading shortest arc` (Task 2).
5. **The camera during a 3,800 m descent of a 270 m ship:** the target follows the falling piece and near/far planes keep it drawn. Test: `camera.test.mjs › target follows piece through descent` (Task 5), plus Gate 2's frame check on every descent shot (Task 7).

---

## Shared interfaces

- **`shared/cdp.mjs`:**
  - `findChrome() -> string|null`
  - `openBrowser({ tag }) -> Promise<{ S(method, params), evaluate(expr), nextLoad(ms), sleep(ms), cleanup(), bail(msg, code) }>`. Prints `GATE2 SKIPPED (...)` and exits 2 when there is no Chrome or no WebSocket. Has a 15-minute deadline.
  - `shooter({ S, evaluate, nextLoad, base, outDir, check, scale }) -> { shot(name, params, { w, h, mobile }) -> Promise<result>, shots: result[] }`
  - `writeSheets({ S, nextLoad, sleep, outDir, title, shots, key: string[] })` writes `contact.png` and `key.png`.
- **`shared/toon.js`:** `gradientMap(THREE)`, `INK`, `ACCENT`, `BP` (blueprint palette), `edgeMaterials(THREE)`. These are the objects that are in Unfold's `render.js` today.
- **`shared/speeds.js`:**
  - `SPEEDS = { xslow: 60, slow: 36, normal: 24, fast: 12 }`
  - `advance(t, dtSec, speed) -> t`, clamped to 100
  - `stepSpeed(speed, dir) -> speed`
- **`shared/confidence.js`:**
  - `CLASSES = ['sourced', 'estimated', 'disputed', 'projection']`
  - `classOf(item) -> class|null`: explicit `confidence` wins, otherwise `sourceIds` → `'sourced'`, otherwise null
  - `badge(cls, L) -> html`
- **`shared/inline.mjs`:** `importMap({ root, prefix }) -> { imports }`. It inlines `<root>/shared/vendor` three.js, `<root>/shared/*.js` as `shared/<f>`, and `<root>/engine/*.js` as `<prefix>/<f>`, rewriting `./x.js` → `<prefix>/x.js` and `../shared/x.js` → `shared/x.js`.
- **`scripts/sync-shared.mjs`** (repo root): `node scripts/sync-shared.mjs [--check]`
  - copies `shared/**` (except `shared/tests`) into `unfold/shared/` and `elapse/shared/`
  - prefixes each `.js`/`.mjs` copy with `// Copied from shared/<path> by scripts/sync-shared.mjs. Edit shared/, not this copy.`; vendor files are copied byte for byte
  - `--check` exits 1 listing any stale or missing copy
- **Elapse `engine/chapters.js`:**
  - `parseAt(at: string|number) -> ms`: a zone-less ISO string counts as UTC; a number is a decimal year
  - `chapterAt(model, t) -> index`
  - `barToTime(model, t) -> ms`
  - `timeToBar(model, at) -> t|NaN`
  - `formatTime(model, t, lang) -> string`
- **Elapse `engine/tracks.js`:**
  - `evaluate(model, t, branch = 'a') -> State`
  - State = `{ t, chapter, time, lights, broken, pieces: Map<id, { pos:[x,y,z], trim, list, heading, rust, collapse: null|{ mode, p } }>, water: Map<compId, h>, happened: Event[] }`
- **Elapse `engine/math.js`:**
  - `poseMatrix({ pos, trim, list, heading }) -> number[16]` = T(pos)·Rz(heading)·Ry(trim, bow-down positive)·Rx(list, starboard-down positive)
  - `mul(a, b)`, `apply(m, [x,y,z])`
  - `lerpAngle(a, b, f)`
  - `catmull(p0, p1, p2, p3, f)`
- **Elapse `engine/geom.js`:**
  - `hullMesh(params) -> { positions: Float32Array, indices: Uint32Array }`
  - `deckHeightAt(params, x) -> z`
  - `halfBreadthAt(params, x, z) -> y`
  - `pieceBox(piece, model) -> { min, max }`: local, offset applied
  - `worldBox(box, matrix) -> { min, max }`
  - `waterPlane(shipMatrix, comp, h) -> { n:[x,y,z], d }`: in the ship frame
  - `clampToPlane(positions, plane) -> positions`: moves vertices above the plane down along local z onto it
- **Elapse `engine/checks.js`:**
  - `runChecks(model, { official }) -> { errors: Issue[], warnings: Issue[] }`
  - Issue = `{ where, msg }`
- **Elapse page hooks:** `window.__elapse = { ready, errors, model, st, R }`
  - `R.frame() -> { area, inside }`: area = the clipped screen fraction of the subject pieces' projected box; inside = the share of that box on screen
  - `R.probe() -> { warm, water }`: pixel counts in the subject box
  - `R.state`

---

### Task 1: `shared/` core, sync, and Unfold on it

**Files:**
- Create: `shared/{cdp.mjs, toon.js, speeds.js, confidence.js, inline.mjs, vendor/three.core.min.js, vendor/three.module.min.js}`
- Create: `scripts/sync-shared.mjs`
- Create: `shared/tests/{speeds,confidence,sync}.test.mjs`
- Modify: `unfold/scripts/build.mjs` (use `importMap`), `unfold/scripts/shoot.mjs` (use `openBrowser`, `shooter`, `writeSheets`; keep every Unfold-specific shot and check), `unfold/engine/render.js` (import `../shared/toon.js`), `unfold/engine/ui.js` (`export { SPEEDS } from '../shared/speeds.js'`; use `advance`, `stepSpeed`)
- Delete: `unfold/vendor/` once `unfold/shared/vendor/` exists

- [ ] **Back up the source:** `cp -R unfold .backup/unfold-2026-10-29`
- [ ] **Failing tests:**
  - `speeds › advance covers the bar in the preset time`: `advance(0, 24, 'normal') === 100` and `advance(50, 6, 'fast') === 100`
  - `speeds › stepSpeed clamps`: `stepSpeed('fast', 1) === 'fast'`
  - `confidence › classOf`: `{confidence:'disputed', sourceIds:['s1']}` → `'disputed'`, `{sourceIds:['s1']}` → `'sourced'`, `{}` → `null`
  - `sync › --check flags a stale copy`: copy into a temp tree, edit one copy, and expect exit 1 naming that file
- [ ] **Implement** the shared modules by moving the existing code out of Unfold's `shoot.mjs`, `render.js` and `ui.js` unchanged in behaviour, then run `node scripts/sync-shared.mjs`.
- [ ] **Regression** (all must hold, else restore `unfold/` from the backup and continue with Elapse only):
  - `cd unfold && npm test` → 42 pass
  - each of the 5 examples: Gate 1 PASS (with their official dims as in `unfold/SKILL.md` examples), rebuild, Gate 2 PASS, and the same lit/fold/speed/print lines as before
  - `node scripts/sync-shared.mjs --check` → exit 0

### Task 2: Time model core: model, chapters, tracks, branches

**Files:**
- Create: `elapse/package.json` (`"type": "module"`, `"test": "node --test"`, MIT)
- Create: `elapse/engine/{model.js, chapters.js, tracks.js, math.js}`
- Test: `elapse/tests/{chapters,tracks,model}.test.mjs`, `elapse/tests/fixtures/{mini-ship.json, branch.json}`

**Interfaces:**
- Produces:
  - `model.js`:
    - `TEMPLATES = ['group','hull','deckhouse','funnel','mast','davit','railing','bulkhead','compartment','iceberg','debris','boiler','seabed','box','cylinder']`
    - `PROPS = ['pose','water','lights','rust']`
    - `EVENT_KINDS = ['note','collision','overflow','lightsOut','break','collapse','discovery']`
    - `COLLAPSE_MODES = ['drop','sag','crush','vanish']`
    - `FEATURES = ['lights','compartments','break','projection']`
    - `DIM_TOL = 0.005`
    - `normalizeModel(raw)`: bilingual names, features default false, `branches` default `[]`, `pieces[].offset` default `[0,0,0]`
    - `sourcedShare(model)`: over pieces, track keys and events
    - `validateModel(model) -> { errors, warnings }`: schema and references only
  - `chapters.js`, `tracks.js`, `math.js` as in Shared interfaces.
- **Model shape:** it is pinned here, and Task 9 documents it in `references/model-format.md`.
  - `subject { name, kind:'ship', built, dims:{ loa, beam, depth, draft }, sourceIds }`
  - `features { lights, compartments, break, projection, projectionChapters?: chapterId[] }`
  - `chapters[] { id, name, start, end, bar:[a,b], unit:'minute'|'year' }`
  - `pieces[] { id, name, template, params, parent?, offset?, on?, passesThrough?, embed?, sourceIds|confidence, notes? }`
  - `tracks[] { piece|'*', prop, interp:'linear'|'smooth', keys:[{ at, v, sourceIds|confidence }] }`
    - pose `v = { pos, trim, list, heading }`
    - water `v = h` (m above the keel, at the compartment's centre)
    - lights and rust `v` = 0..1
  - `events[] { id, kind, at, until?, piece?, from?, to?, mode?, title, text, detail?, alternatives?, sourceIds|confidence }`
  - `camera[] { at, target: pieceId|[x,y,z], yaw, pitch, dist }`, plus `cameraSubject: pieceId[]`
  - `environment { seaDepth, sky:'night'|'day', seabed:{ size, relief } }`
  - `wreck { separation:{ between:[a,b], metres, tol }, heading?:{ between:[a,b], deg, tol } }`
  - `refs { ko:{name,height}, en:{name,height} }`
  - `branches[] { id:'b', name, from, tracks[] }`
  - `sources[] { id, title, url, publisher, year }`
  - `meta { interpretation, limitations[], about, gate2 }`
- **Evaluation rules:**
  - A piece follows its `parent` (composed with `offset`) until the first key of its own pose track. From then on it uses its own track.
  - `'*'` rust applies to every piece without its own rust track.
  - A collapse event gives that piece `collapse = { mode, p }` with p = progress over [at, until].
  - `broken` = a break event has happened.
  - In branch `b`, from bar `from` onwards, a branch track replaces the base track for the same (piece, prop). Its value runs from the base value at `from` to the branch keys.

- [ ] **Failing tests:**
  - `chapters › parseAt is zone-independent`: `parseAt('1912-04-14T23:39') === Date.UTC(1912,3,14,23,39)`. Run the file under `TZ=Asia/Seoul` and `TZ=UTC` (add both to `package.json` `test` as `TZ=UTC node --test && TZ=Asia/Seoul node --test`).
  - `chapters › bar↔time round trip`: in mini-ship, `timeToBar(m, barToTime(m, t))` is within 1e-6 of t for t in [0, 12.5, 45, 55, 72, 100]
  - `chapters › proportional inside a chapter`: with night 23:39→02:20 on [0,45], 01:00 maps to `45 * 81/161`
  - `chapters › formatTime`: ko `'4월 15일 01:00'` and year chapters `'1996년'`; en `'Apr 15, 01:00'` and `'1996'`
  - `tracks › pure across break and collapse`: for t in [40, 44.9, 45, 50, 80, 99, 50, 44.9, 40], `evaluate(m,t)` deep-equals a fresh evaluation
  - `tracks › parent until own track`: before the stern's first pose key, the stern's world matrix equals ship pose · offset (1e-6); after it, it is the stern's own key
  - `tracks › heading shortest arc`: keys 350→10, midpoint heading = 0 (mod 360)
  - `tracks › water clamps between keys and holds after the last`
  - `tracks › branch b overrides after from only`: in branch.json at t < from, b equals a; at `from`, b's value equals a's; after, it follows the b keys
  - `model › rejects unknown template, prop, event kind, collapse mode, and a piece parent that does not exist`
- [ ] **Implement.** Keys are converted to bar positions once, at normalise time, through `timeToBar`, and kept on the key as `_t`.
- [ ] `cd elapse && npm test` → all pass.

### Task 3: Geometry: hull loft, boxes, water planes

**Files:**
- Create: `elapse/engine/geom.js`
- Test: `elapse/tests/geom.test.mjs`

**Interfaces:**
- **Consumes:** `math.js`.
- **Hull params:**
  - `{ offsets:{ waterlines:number[], stations:[{ x, hb:number[] }] }, depth, draft, sheer:{ fwd, aft }, stem:'straight'|'raked'|'bulbous', stern:'cruiser'|'counter'|'transom', range?:[x0,x1], cap?:'flat'|'jagged', paint:{ topside, bottom, boot, bootHeight }, windows?:[{ z, from, to, spacing }] }`
  - `hb[i]` is the half-breadth at `waterlines[i]`.
  - Stations are lofted with Catmull-Rom along x, at ≥ 4 subdivisions per gap. Deck height = `depth` plus sheer, a parabola rising to `fwd`/`aft` at the ends.
- **Box rules** for the other templates are pinned in each template's params:
  - deckhouse `{ l, b, h, r, windows }`
  - funnel `{ a, b, h, rake, top }` (elliptic a×b)
  - mast `{ h, d, rake }`
  - bulkhead `{ x, top }`
  - compartment `{ x0, x1, floor }`
  - iceberg `{ l, b, above, below, seed }`
  - debris `{ l, b, h, seed }`
  - boiler `{ d, l }`
  - box `{ l, b, h }`
  - cylinder `{ d, h }`

- [ ] **Failing tests:**
  - `geom › hull extents match the offsets`: from a 5-station test hull, the box of `hullMesh` spans x [−100,100], max |y| = the largest hb, and z [0, depth + max sheer]
  - `geom › range cuts the hull`: `range:[0,100]` gives min x = 0, and the cap is closed (every edge shared by exactly 2 triangles)
  - `geom › deckHeightAt rises with sheer`: midship = depth; ends = depth + fwd and depth + aft
  - `geom › waterPlane level ship`: identity pose, h = 5 → n = [0,0,1], d = 5
  - `geom › waterPlane trimmed 10° bow down`: n tilts toward +x by 10°; the point (xc,0,h) lies on the plane
  - `geom › clampToPlane`: every output vertex is at or below the plane; vertices already below are unchanged
  - `geom › worldBox` of a unit box rotated 90° about z
- [ ] **Implement.** Paint is assigned per vertex group (topside, boot, bottom) by z against `draft` and `bootHeight`. Windows are separate strip quads tagged `userData.role = 'window'` by the renderer, so this module returns their rectangles: `hullWindows(params) -> [{x0,x1,z0,z1,side}]`.
- [ ] `npm test` → all pass.

### Task 4: Gate 1: physical checks and the CLI

**Files:**
- Create: `elapse/engine/checks.js`, `elapse/scripts/check_model.mjs`
- Test: `elapse/tests/check_model.test.mjs`
- Fixtures: `elapse/tests/fixtures/{plain-ship.json, water-no-overflow.json, below-seabed.json, wreck-far.json, projection-sourced.json, disputed-no-alt.json, deckhouse-floating.json, zone-order.json}`

**Interfaces:**
- **CLI:** `node scripts/check_model.mjs model.json [--official LOA,BEAM,DEPTH] [--json]`
  - Prints `GATE1 PASS|FAIL errors=N warnings=N sourced=P%`, then one line per issue, `  ERROR where · msg`.
  - Exit 0 on pass, 1 on errors, 64 on usage.
- **Checks** (each runs only when the named feature is on, else always):
  - **chapters:** cover [0,100] with no gap or overlap; times ordered within and across chapters
  - **confidence:** every piece, key and event has a class; every key and event inside a `projection` chapter (the chapter's `id` is listed in `features.projectionChapters`, default the last chapter when `features.projection`) is `projection`; `disputed` needs `alternatives`
  - **dims:** hull pieces' union vs `--official` and `subject.dims` within `DIM_TOL`
  - **water** (`compartments`):
    - h never decreases before the break
    - h may exceed the `top` of the bulkhead shared with a neighbour only after an `overflow` event between those two compartments
  - **seabed:** every piece's world box bottom ≥ −seaDepth − `embed` (default 0.5 m), sampled at 400 bar positions
  - **wreck** (`break` or `wreck` present): separation at t = 100 within tol; heading difference within tol when given
  - **seating:** a piece with `on: hullId` has its bottom within 0.5 m of `deckHeightAt` across its x span
  - **overlap:** before the break, AABBs of pieces sharing the same `on` do not overlap by > 0.05 m unless `passesThrough`
  - **lights** (`lights`): a `lightsOut` event exists, and the lights track is 0 after it
  - **branches:** branch tracks name existing pieces, and `from` is in (0,100)
  - **features:** every enabled feature has its data (lights track, compartments, a break event, a projection chapter)

- [ ] **Failing tests:**
  - `plain ship passes`: plain-ship has one daylight chapter, no features, sinks whole, 120 m deep, and gives `GATE1 PASS`
  - each failing fixture gives `GATE1 FAIL` with an error line naming its check (`water`, `seabed`, `wreck`, `confidence`, `confidence`, `seating`, `chapters`)
  - mini-ship passes; `--official` 2% off fails `dims`
- [ ] **Implement**, reusing `validateModel` first. The physical checks run only when schema errors are 0.
- [ ] `npm test` → all pass.

### Task 5: Renderer: pieces, environment, water, decay, camera

**Files:**
- Create: `elapse/engine/{shapes.js, env.js, camera.js, render.js}`
- Test: `elapse/tests/camera.test.mjs`
- Scratch check: build mini-ship with Task 6's build once that exists. Until then, use a scratch HTML in the scratchpad that imports the modules.

**Interfaces:**
- **Consumes:** `geom.js`, `tracks.js`, `shared/toon.js`.
- **Produces:**
  - `buildPiece(THREE, piece, model) -> THREE.Group`: meshes tagged with `userData.role` (`hull`, `window`, `bulkhead`, `compartment`, `structure`)
  - `buildEnvironment(THREE, model) -> { group, update(state, camera) }`
  - `cameraAt(model, t, state) -> { target, yaw, pitch, dist }`: interpolates keys, and a piece-id target is that piece's world box centre. With no keys, it frames the union of `cameraSubject` pieces.
  - `createRenderer(canvas, model, opts) -> R`:
    - `R.set({ t, branch, style, xray })`
    - `R.frame()`, `R.probe()`, `R.dataURL()`, `R.resize()`
    - `R.state = { auto, yaw, pitch, zoom }`
    - drag/wheel/pinch orbit as in Unfold
- **Pinned look:**
  - **Hull:** topside `#1c1d20`, bottom `#8e2b1f`, boot `#f2efe6`; deckhouses `#f4f1ea`; funnels `#d9a441` with `#16171a` tops; edges `INK`
  - **Water:** in x-ray `#3d8bff` at opacity 0.75. The sea surface is `#0e2338` at opacity 0.55 at night and `#2a6f9e` at 0.45 by day. Underwater fog colour runs from `#0b2a40` to `#03070c` by camera depth.
  - **Windows:** emissive `#ffd27a` times the lights value
  - **Rust:** the material colour lerps toward `#8a3b12` by `rust`. Rusticles are an InstancedMesh of downward cones on the hull's lower faces, with count = round(rust × 600) per hull piece.
  - **X-ray:** hull, deckhouses and funnels at opacity 0.16 with no depth write; bulkheads and compartments visible; water volumes = compartment boxes passed through `clampToPlane` with `waterPlane(ship, comp, h)`.
  - **Collapse:**
    - `drop`: lerp to seabed contact with a 6° tilt
    - `sag`: scale the middle third down by 40%
    - `crush`: scale z by 0.45 plus seeded jitter
    - `vanish`: scale to 0
  - **Sky:** 1,500 seeded stars and no moon at night; a gradient by day.
  - **Seabed:** a seeded relief mesh `environment.seabed.size` metres square, centred on the wreck pieces at t = 100. Debris is drawn from `debris` pieces only.
  - **Camera:** perspective, fov 35°; near = dist/200 and far = dist × 40, updated every frame.
  - **Blueprint:** fills `BP.fill`, edges `BP.line`, water `BP.accent` at 0.5.

- [ ] **Failing tests** (camera is pure):
  - `camera › target follows piece through descent`: in mini-ship at t = 46, 50, 54, the target z equals the bow piece's world box centre z (1e-6)
  - `camera › auto-frame with no keys`: dist grows when the subject box grows
- [ ] **Implement.** `R.frame()` projects the 8 corners of the union of `cameraSubject` world boxes. `R.probe()` reads the canvas (`preserveDrawingBuffer: true`) at 1/4 size inside that box. It counts warm pixels (r > 200, g > 160, b < 150) and water pixels (b > 180, b − r > 80).
- [ ] **Visual check:** shoot mini-ship at t = 0, 30, 50, 80 in both styles and with x-ray on and off, then look at the shots. They should show a ship, water in the compartments in x-ray, the descent in frame, and rust. `npm test` → all pass.

### Task 6: Page UI, i18n, main, build

**Files:**
- Create: `elapse/engine/{ui.js, i18n.js, main.js}`, `elapse/scripts/build.mjs`

**Interfaces:**
- **Consumes:** `createRenderer`, `chapters.js`, `shared/{speeds,confidence}.js`.
- **Produces:**
  - `mountElapse(root, model, params)`
  - build CLI `node scripts/build.mjs model.json out.html [--gate2 pass|skipped|fail]`: the model goes in `<script type="application/json" id="elapse-model">`, the import map comes from `importMap({ root, prefix:'elapse' })`, and `<meta name="generator" content="Elapse">` is set. The build refuses network URLs (as Unfold's does).
- **Layout** (CSS prefix `.el-`, same visual family as Unfold's `.uf-`):
  - **Header:** title, interpretation, and trust chips (sourced / estimated / disputed / projection shares). A warning band shows when the sourced share is below 50%.
  - **Controls:** 스타일 (컬러/도면), 투시 (on/off), 깊이 (간단히/자세히), KO/EN.
  - **Stage:**
    - the canvas
    - the event card (`.el-card`)
    - gauges (`.el-gauges`): clock and compartment levels in a minute chapter with `compartments`; depth with tower ticks (`refs`) while any pose has z < −50; the year in year chapters
    - the projection badge `.el-proj`, shown whenever `chapterAt` is a projection chapter
    - the illustrative-light note `.el-lightnote`, shown when the camera is deeper than 200 m
    - auto/reset view buttons
  - **Bar:**
    - play button and speed select
    - range 0–100 with chapter bands (alternating tint, chapter name above) and event ticks
    - the now label (`formatTime` plus "(선박 시각)" / "(ship's time)" in minute chapters)
    - chapter buttons; `chapter=N` jumps to the start of chapter N
  - **Branch switch:** `.el-branch` A/B, only when `branches.length`.
  - **Actions:** 이미지 저장, 영상 저장 (MediaRecorder as Unfold), 출처, 이 장소에 대하여.
  - **Panels:**
    - sources: links only
    - about: `meta.about`, `meta.limitations`, `meta.interpretation`, and the Gate 2 status
- **Event cards:** the card shows the latest event with bar position ≤ t, until the next event or +4 bar.
  - Simple depth: title and text.
  - Detail depth adds `detail`, the sources, and `alternatives` under "다른 학설".
  - Every card carries `badge(classOf(event))`.
  - An `overflow` event also pulses the two compartments in the gauge.
- [ ] **Build mini-ship and open it** with `shoot.mjs --only` from Task 7, or a scratch CDP shot. Then scrub with `t=` values and check the cards, gauges, chapter bands and both languages. No errors in `window.__elapse.errors`.

### Task 7: Gate 2: `shoot.mjs`

**Files:**
- Create: `elapse/scripts/shoot.mjs`

**Interfaces:**
- **Consumes:** `shared/cdp.mjs`, page hooks.
- **CLI:** `node scripts/shoot.mjs page.html outDir [--quick] [--only "q"]... [--scale N]`. It prints `GATE2 PASS|FAIL|SKIPPED` and exits 0/1/2.
- **Shots:**
  - the start and end of every chapter (end = end − 0.3), and every event's bar position
  - color and blueprint at t = 0, 25, 50, 75, 100
  - x-ray on and off at three points of chapter 1 when `compartments` is on
  - three free angles
  - `lang=en`, `panel=sources`, `panel=about`
  - three phone shots at 375×812
  - `--quick` keeps the chapter starts and ends, plus one phone shot
- **Per-shot checks:**
  - **Unfold's generic checks:** errors, blank canvas, horizontal scroll, text overflow, element outside stage. The selectors cover `.el-card`, `.el-gauges`, `.el-now` and `.el-card h3`.
  - **Frame:** every stage shot needs `R.frame().inside ≥ 0.6` and `area ≥ 0.03`. Panel shots are exempt.
- **Feature checks:**
  - `lights`: `probe().warm > 40` at the lightsOut bar − 1 and `≤ 5` at + 1, with x-ray off and style color.
  - `compartments`: `probe().water > 60` at the first overflow event + 1 with x-ray on.
  - `projection`: `.el-proj` visible in a projection chapter shot and hidden at t = 0.
- **Speed:** slow, normal and fast, as in Unfold.
- **Sheets:** `writeSheets` with key shots: the start of chapter 1, the first overflow (x-ray), the break, mid-descent, the seabed at its chapter start, the last event, a phone shot, and en.
- [ ] **Run on mini-ship** → `GATE2 PASS`. **Run `--quick` on plain-ship** → `GATE2 PASS` with the feature checks skipped and saying so (`skip lights (feature off)`).

### Task 8: Titanic example

**Files:**
- Create: `elapse/research/titanic-notes.md` (facts, sources, conflicts), `elapse/research/titanic-gen.mjs` (writes the model), `elapse/examples/titanic.json`, `elapse/examples/titanic.html`
- [ ] **Research** the following, writing notes as you go:
  - **Official dims:** LOA, beam, moulded depth, draft and gross tonnage.
  - **Hull form:** an Olympic-class offsets table built from published dimensions and form coefficients, with what is estimated marked.
  - **Deck structures and funnels:** positions, rakes, and the 4th funnel being a dummy.
  - **The 16 compartments and 15 bulkheads:** positions and top decks.
  - **Collision:** timeline, damage extent per compartment, and the flooding sequence by compartment and time (inquiries and modern analyses).
  - **Trim and list over time;** the lights out (~02:18).
  - **The break:** location and angle, as a disputed event with alternatives.
  - **Descent and landing:** the bow's planing descent and burial depth (`embed`), the stern's rotation and implosion, and the debris field including double-bottom pieces and boilers.
  - **Wreck layout:** bow–stern separation and headings.
  - **Discovery and dives:** 1985 discovery, 1986 dives, the foremast collapse, the 2010 sonar map and bacterium, the 2019 captain's quarters, the 2022 scan, the 2024 bow railing.
  - **Collapse projections** as a range.
  - **The memorial note:** deaths (as ranges by source) and the international protection.
- [ ] **Write the generator and the model.** Chapters as in Global Constraints. Use `cameraSubject` for the ship or the wreck pieces. The 4 events of spec §4 have the pinned card wording intent (e.g. "4칸까지는 버틸 수 있게 설계됐다. 뚫린 건 5~6칸이었다." with exact numbers from research).
- [ ] **Gate 1** with `--official` from the research → PASS (≤ 3 rounds).
- [ ] **Build, then Gate 2** → PASS (≤ 3 rounds). **Look** at `key.png`, `contact.png`, and `--only` close-ups of the bow at the overflow, the break, and the bow on the seabed. Check against spec §2 failure criteria:
  - it reads as Titanic
  - the overflow is visible
  - the bow is intact and the stern wrecked
  - no people
  - projection is marked
- [ ] **Rebuild** with `--gate2 pass`.

### Task 9: SKILL.md, references, install

**Files:**
- Create: `elapse/SKILL.md`, `elapse/README.md`, `elapse/LICENSE` (MIT, as Unfold), `elapse/references/model-format.md` (the Task 2 shape with every field, template params from Task 3, events, features, branches), `elapse/references/research.md` (where to find inquiry records, expedition reports, how to mark disputed and projection, the licence rule)
- Modify: `unfold/SKILL.md` "When something else fits better" adds Elapse
- **SKILL.md:**
  - **Frontmatter `description`:** what it makes; triggers (shipwreck, how a ship sank, how a wreck changed over time, "what happened to X"); that it is Korean by default.
  - **Workflow:** spec §9 steps 1–6. Step 1 is the refusal rule, then the out-of-range note, then choosing the features. Then research, the model via a generator script, Gate 1, build, Gate 2 with looking at `key.png`, and delivery (what, chapters, sourced share, limitations, how to use, the respect rule).
  - **Page parameters**, and **when another skill fits** (Unfold for teardown, colorfigures for playful objects).
- [ ] **Run checks:**
  - `node scripts/sync-shared.mjs --check` → 0
  - `cd elapse && npm test` → all pass
- [ ] **Install:**
  - `cp -R elapse ~/.claude/skills/elapse`
  - If Task 1's switch held: `cp -R ~/.claude/skills/unfold ~/.claude/skills/.backup/unfold-2026-10-29`, then replace `~/.claude/skills/unfold` with `unfold/`
- [ ] **Smoke test from the installed copy:** run Gate 1 and build on `examples/titanic.json` inside `~/.claude/skills/elapse`, and on one Unfold example inside the installed Unfold.

### Task 10: Field trial: Britannic

- [ ] **Dispatch a fresh agent** with only: "use the installed elapse skill to make HMHS Britannic; work unattended; log every friction to `trials/britannic/FRICTION.md`; output in `trials/britannic/`". Do not give it this plan or the spec.
- [ ] **Read FRICTION.md and the output.** Fix the skill, docs or engine for each real friction, then re-run the affected tests and gates. The Britannic case is a daylight sinking, in one piece, at about 120 m.
- [ ] **Add the example:** copy the trial's model to `elapse/examples/britannic.json`, rebuild with gates, and add it to SKILL.md's example list. Reinstall.

### Task 11: Final review

- [ ] **Dispatch a reviewer subagent** (most capable model) over `shared/`, `elapse/`, `scripts/sync-shared.mjs` and the Unfold diff against `.backup/unfold-2026-10-29`. It should check spec coverage, the Review Focus items, and the licence and respect rules in the shipped text.
- [ ] **Fix confirmed findings**, re-run all tests (shared, elapse, unfold), all gates for every example of both skills, and `sync-shared --check`. Then reinstall both skills.
- [ ] **Update memory** `elapse-skill-project.md` with what shipped.
