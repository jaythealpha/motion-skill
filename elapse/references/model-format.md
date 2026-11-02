# The time model (model.json)

The model is everything the page knows. You write it, most easily from a small generator script, and Gate 1 checks it. The engine reads only this file.

## Frames and units

- **World:** metres, z up. The sea surface is z = 0 and the seabed is z = −`environment.seaDepth`.
- **Ship frame** (a hull's own frame): x runs forward from midships, y to port, z up from the keel.
- **Poses:** `{ pos:[x,y,z], trim, list, heading }`, angles in degrees.
  - `pos` is where the piece's frame origin sits in the world.
  - `trim` > 0 puts the bow (+x) down.
  - `list` > 0 puts starboard (−y) down.
  - `heading` turns about z.
- **Times** (`at`, `start`, `end`, `until`):
  - Either an ISO date-time with **no zone** (`"1912-04-14T23:40"`), read as written: ship's time, the same on every machine.
  - Or a decimal year (`1985.67`).
  - A key or event outside every chapter is an error.

## Top level

| Field | What |
|---|---|
| `subject` | `{ name:{ko,en}, kind:'ship', built, dims:{ loa, beam, depth, draft }, sourceIds }`. `depth` is the moulded depth the hull's `params.depth` uses. |
| `features` | `{ lights, compartments, break, projection, projectionChapters?, xrayChapters? }`. Turn on only what the record supports. `projectionChapters` defaults to the last chapter; `xrayChapters` (where x-ray opens by default) to the first. |
| `chapters[]` | `{ id, name:{ko,en}, start, end, bar:[from,to], unit:'minute'\|'year' }`. They cover bar 0–100 with no gap, in real-time order. Inside a chapter, time is proportional to the bar. |
| `pieces[]` | What is drawn (below). |
| `tracks[]` | `{ piece, prop, interp?:'linear'\|'smooth', keys:[{ at, v, sourceIds\|confidence }] }`. |
| `events[]` | Cards on the bar (below). |
| `camera[]` | `{ at, target: pieceId \| [x,y,z], yaw, pitch, dist }`. Between keys everything blends; a piece target is followed as it moves. |
| `cameraSubject` | The piece ids that make up "the subject" (e.g. bow and stern). Used when a camera key aims at a point, and for the depth gauge. |
| `environment` | `{ seaDepth, sky:'night'\|'day', seabed:{ size, relief }, growth?:{ kind:'rusticles'\|'crust'\|'none', color? } }`. The seabed is drawn at least as large as the route and the wreck; `size` can enlarge it. |
| `wreck` | `{ separation?:{ between:[a,b], metres, tol }, heading?:{ between:[a,b], deg, tol }, poses?:[{ piece, trim?, list?, heading?, tol }] }`. These are the recorded final layout and attitudes, checked at bar 100. |
| `refs` | `{ ko:{ name:'롯데월드타워', height:555 }, en:{ name:'Eiffel Tower', height:330 } }` for the depth gauge. |
| `branches[]` | `{ id:'b', name:{ko,en}, from: bar, tracks:[...] }`. From `from` on, branch b's tracks replace the base tracks of the same piece and prop. The value starts from the base value there, so nothing jumps. Not used for ships. |
| `sources[]` | `{ id, title, url, publisher?, year? }`. These are links only. |
| `meta` | Holds these fields:<br>• `interpretation:{ko,en}`: what you took the request to mean<br>• `about:{ko,en}`: the memorial note<br>• `limitations:[{ko,en}]`<br>• `baseName?`: the name of path A when there are branches<br>• `gate2`: set by the build |

## Confidence (every piece, track key and event)

| Class | How you mark it | When |
|---|---|---|
| **sourced** | `sourceIds: ['s3']` | A public source states it. |
| **estimated** | `confidence: 'estimated'` | You inferred it: from proportions, a simulation, a sister ship. |
| **disputed** | `confidence: 'disputed'` plus `alternatives:{ko,en}` | Sources disagree. Show the leading view and name the others. |
| **projection** | `confidence: 'projection'` | A prediction. Every key and event inside a projection chapter must be this. |

The shares on the page count each piece and event once and each track once (split by its keys), so more keys for a smooth motion do not change them.

## Pieces

`{ id, name:{ko,en}, template, params, parent?, offset?, on?, passesThrough?, embed?, appear?, sourceIds|confidence, notes? }`

- **`parent`:** a piece follows its parent (plus its `offset`, in the parent's frame) until the first key of its own pose track. After that it uses its own track. This is how a ship breaks: the bow and stern hulls ride on the `ship` group, then each gets its own pose keys from the break time.
- **`on`:** the hull the piece stands on. Gate 1 checks its bottom is within 0.5 m of that hull's deck.
- **`passesThrough`:** pieces it really goes through (a funnel through a deckhouse roof).
- **`embed`:** how far (m) it may sink into the seabed (a buried bow). Children inherit it.
- **`rotate`:** `{ trim, list, heading }` turns a piece on its parent about its offset point (a bent bow).
- **`appear`:** a time before which the piece is not drawn (the separate bow and stern hulls, debris thrown out at the break).
- **Collapses carry children:** whatever rides on a collapsing piece is drawn crushed, sagged, tipped or vanished with it.

| Template | `params` |
|---|---|
| `group` | (none): a frame for children, e.g. the whole ship before it breaks |
| `hull` | <ul><li>`offsets:{ waterlines:[z…], stations:[{ x, hb:[…] }] }`: half-breadths per waterline</li><li>`depth`, `draft`</li><li>`sheer:{ fwd, aft }`</li><li>`stem:'straight'\|'raked'` (`stemRake`)</li><li>`stern:'cruiser'\|'counter'\|'transom'` (`sternOverhang`; a counter starts at `counterFrom` and is fully out `counterRise` above it)</li><li>`range?:[x0,x1]` cuts a section (bow or stern half); `cap:'flat'\|'jagged'` shapes the cut end</li><li>`paint:{ topside, bottom, boot, bootHeight, bands?:[{ z0, z1, color, from?, to?, side?:'port'\|'stbd' }] }`: bands are heights at midships that follow the sheer, limited along the hull by `from`/`to` (ship x) and to one side; use them for liveries and the damage area</li><li>`windows:[{ z, from, to, spacing }]`</li></ul> |
| | No offsets table to hand? `import { linerOffsets } from '<skill>/engine/hullform.js'` builds one from `{ loa, beam, depth, draft, parallel, bilgeRadius, aftFullness }`. Mark the hull form estimated. |
| `deckhouse` | `l, b, h, r` (corner radius), `windows` (rows), `windowSpacing?`, `color?` |
| `funnel` | `a, b` (elliptic half-axes), `h`, `rake` (deg aft), `top` (height of the dark top band), `color?`, `topColor?` |
| `mast` | `h, d, rake` |
| `davit` | `h, reach` |
| `railing` | `l, h` |
| `bulkhead` | `x, top, floor?`. It is shaped like the parent hull's section at x and shown in x-ray. |
| `compartment` | `x0, x1, floor?, top?`. Its water comes from a `water` track. |
| `iceberg` | `l, b, above, below, seed` |
| `debris` | `l, b, h, seed, color?` |
| `boiler` | `d, l` |
| `box` / `cylinder` | `l, b, h` / `d, h` |
| `seabed` | (none): the seabed comes from `environment` |

## Tracks

| prop | `v` | Note |
|---|---|---|
| `pose` | `{ pos, trim, list, heading }` | `interp:'smooth'` curves the path through the keys (use it for descents). |
| `water` | metres above the keel at the compartment's centre | It may not fall before the break. It may rise above a neighbouring bulkhead's `top` only after an `overflow` event across that bulkhead. |
| `lights` | 0–1 | It must be 0 from the `lightsOut` event on. |
| `rust` | 0–1 | `piece: '*'` applies to every piece without its own rust track. |

Before its first key a track holds the first value; after its last key, the last. Angles between two keys always turn the short way (under 180°), so a spin is written as steps under 180° each: 100 → 250 → 400 → 550, not 100 → 460.

## Events

`{ id, kind, at, until?, piece?, from?, to?, mode?, title:{ko,en}, text:{ko,en}, detail?:{ko,en}, alternatives?:{ko,en}, sourceIds|confidence }`

| kind | Meaning |
|---|---|
| `collision`, `note`, `discovery` | A card only. |
| `overflow` | Water spills from compartment `from` into `to`. The gauge highlights both. |
| `inflow` | Water enters compartment `piece` from outside above its bulkheads (open portholes, a hatch). Lets its water rise past a bulkhead top. |
| `lightsOut` | The power fails. |
| `break` | The hull breaks. Give the bow and stern pose tracks that start at this time. |
| `collapse` | `piece` collapses over [`at`, `until`] in `mode` `drop` (falls to the seabed), `sag`, `crush`, `vanish` or `topple` (falls over aft about its foot, like a mast onto the deck). |

Set `card: false` on an event that only moves a piece (a funnel falling during the break) so it does not cover the card that matters. A card shows from its time until the next event or 4 bar units later.
- **간단히** shows `title` and `text`.
- **자세히** adds `detail`, the sources and `alternatives`.

Keep `text` to one or two sentences, and put the numbers in `detail`.

## Generic ship inspection and pacing

`stops` optionally declares inspection targets independently of the subject name:

```json
"stops": [
  {"id":"hull-study","name":{"ko":"선체","en":"Hull"},
   "parts":["my-hull"],"yaw":315,"pitch":3,"trimX":[0,1]}
]
```

Each stop needs a unique id, a bilingual-name object (at least one language), existing nonempty piece ids and finite yaw/pitch (pitch −80…80). `trimX` is optional, increasing fractions in 0…1; it crops the first piece's local x bounds for framing, not geometry. Pick angles from the actual final pose and verify the target stays underwater. Without `stops`, existing tuned ships retain their stops and unfamiliar ships receive an overview of hull pieces. An explicit empty array disables inspection. Inspection opens the midpoint of the latest non-projection year chapter when starting from a sinking/projection chapter, and restores the previous time/view on exit. Building stops keep their existing schema.

`chapters[].playbackRate` optionally sets 0.1…2 times the viewer's selected speed for ship timelines. It overrides the built-in ship director's pacing for that chapter; dedicated building directors keep their existing pacing. Use existing `camera[]` keys for framing. These observation settings are illustrative, not historical evidence, and do not add to the sourced share. Effects and measured wreck geometry still require separate implementation/research.

### Optional quality rendering metadata

`meta.renderQuality: "high"` selects the opt-in Britannic rendering layer by default. URL `quality=standard` overrides it. `cutaway=1` opens an explicitly explanatory bridge roof cutaway; it does not add a historical collapse event. `mode=explore&stop=<valid stop id>` starts a model-declared inspection target. Unknown stop ids fall back to the normal default. `build-quality.mjs` produces a companion model with independently authored quality stops, source links and limitations while leaving its input model unchanged.

`stops[].trimY` and `trimZ` use the same optional0…1 fraction contract as `trimX`, clipping the first target piece's local bounds for inspection framing only. They do not remove geometry. The Britannic `breach` inspection uses these crops to show the torn plate edge closely.
