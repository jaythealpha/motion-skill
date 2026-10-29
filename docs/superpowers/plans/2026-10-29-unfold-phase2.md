# Unfold Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Unfold with foldable phones (hinge, bending inner display, cover display, fold motion, viewer fold slider), one story for every phone (finished → burst → assemble → finished), a speed picker, photo input in the workflow, and two new examples (iPhone Duo, Galaxy Z Fold 8).

**Architecture:** The time bar gets three segments: intro [0, 8] (turn over / unfold over 0–4, burst over 4–8), assembly [8, 92] and finale [92, 100]. A new pure module, `fold.js`, gives the fold kinematics: B-half rigid transform and bend-zone deformation for a fold angle θ. Both the renderer and Gate 1 use it. `storyPose(model, t)` replaces `finalePose` and returns flip, fold angle, which screen is lit, and burst progress. Parts keep their poses relative to the phone. The renderer applies the story transform to half groups.

**Tech Stack:** As v1: ES modules, three.js 0.180 (vendored), Node `node:test`, headless Chrome over CDP.

**Spec:** `docs/specs/2026-10-29-unfold-phase2-design.md` (v1: `docs/specs/2026-10-28-unfold-design.md`)

## Global Constraints

- Bar segments: intro 0–8 (0–4 turn over or unfold, 4–8 burst), assembly 8–92, finale 92–100. 0 and 100 look the same (the finished phone).
- The burst is short and simultaneous, never a one-by-one reverse disassembly. It obeys the no-pass-through rule: parts rise first (+z), then spread. Gate 1 checks the burst in both layouts.
- Speeds for 0→100: very slow ≈ 60 s, slow ≈ 36 s, normal ≈ 24 s (default), fast ≈ 12 s. URL `speed=xslow|slow|normal|fast`, keys `[` and `]`.
- Fold slider: foldables only, θ 0°(open)–180°(closed), `fold=` URL param. Enabled only at t = 0 or t = 100; otherwise it follows the bar and is disabled. Screens: θ ≥ 150° → cover screen lit; θ ≤ 120° → inner screen lit.
- B = the half that carries the cover display. Folded dims live in `product.foldedDims`; Gate 1 takes `--official-folded W,L,T` (±0.5 mm). Foldables aim at 50–100 parts.
- Manual depth starts at bar 8.
- Photo input: identify the model from visible cues, falling back to the maker's latest flagship. State the cues in `meta.interpretation`. Never embed the photo. A non-phone photo is declined in chat.
- All v1 rules hold: offline single file, Korean default, sourced vs estimated, facts-only licence, unattended gates (≤ 3 rounds each).

## Review Focus

1. **Scrubbing across the intro and finale in both directions, and switching layout at t = 5:** poses stay a pure function of t, with no stuck flip or fold. Test: `story.test.mjs › pure across segments`.
2. **A foldable whose fold line is not at the centre (asymmetric halves), or a part with no `half`:** the half is derived from the bbox centre, and the folded box matches B mirrored about the bend. Test: `fold.test.mjs › asymmetric fold`, `model.test.mjs › half derived`.
3. **Fold slider moved, then the bar dragged into assembly, then back to 100:** the bar takes over; at 100 the slider is enabled again at the bar's fold (180°). Checked by the interaction run in Task 6.
4. **Speed changed while playing:** playback continues from the same t at the new rate with no jump. Interaction run in Task 6.
5. **A bar (non-foldable) phone:** no fold slider, the intro turns it over, and S24 passes both gates. Covered in Task 7's regression run.

---

## Shared interfaces

- `fold.js`:
  - `foldInfo(model) -> null | { axis:'x'|'y', at, gap, L /*bend length = π·gap/2*/, T /*open thickness*/ }`
  - `halfOf(model, part) -> 'a'|'b'|'hinge'` (explicit `part.half`, else by bbox centre against the fold line, `hinge` when the bbox straddles it by > 2 mm on both sides)
  - `bendPoint(fi, u, z, θ) -> [u', z']`: u = coordinate across the fold axis (x for axis y), z = model z, θ in degrees. A = identity. B = the rigid continuation. Bend zone = circular arc of length L, curving toward −z.
  - `bTransform(fi, θ) -> (u, z) => [u', z']`, rigid for half B
  - `foldedBox(fi, box, half, θ) -> box` (AABB of the transformed corners; hinge parts via bendPoint on a 5×5 sample)
- `timeline.js`:
  - `INTRO_END = 8`, `BURST_START = 4`, `ASM_END = 92` (replaces `FINALE_T`)
  - `storyPose(model, t) -> { flip:0..1, fold:0..180, screen:'main'|'inner'|'cover'|null, burst:0..1 }`
  - `stepWindows` covers [8, 92]
  - `tl.pose(id, t)` = zero for t < 4, burst for 4–8, v1 assembly after 8
  - `tl.stepAt(t)`: null outside [8, 92]
  - `tl.segment(t) -> 'intro'|'assembly'|'finale'`
- `render.js`: `R.setFoldOverride(θ|null)`; story transforms applied to groups `halfA`, `halfB` and `hinge` under `pivot`. `bend` parts are deformed on the CPU when θ changes, and their edges are rebuilt then.
- `ui.js`: speed picker `data-k="speed"` (`xslow|slow|normal|fast`); fold slider `.uf-fold input[type=range]`.

---

### Task 1: Story timeline (intro, burst, finale) and speed

**Files:**
- Modify: `unfold/engine/timeline.js`, `unfold/engine/render.js` (use `storyPose`), `unfold/engine/ui.js` (segment labels, manual starts at 8, speed picker), `unfold/engine/i18n.js`
- Test: `unfold/tests/timeline.test.mjs` (update), `unfold/tests/story.test.mjs` (new)

- [ ] **Failing tests:**
  - `windows cover 8..92`
  - `pure across segments`: for t in [0, 1, 3.9, 4, 6, 7.99, 8, 50, 92, 95, 100], pose(t) deep-equals pose(t), and storyPose likewise
  - `t=0 and t=100 are the finished phone` (every pose zero, flip = 1, screen = 'main' for a bar phone)
  - `burst rises before it spreads (knoll)`: at t = 4.5 each non-base part has |dx| + |dy| < 0.5 and dz > 0
  - `stepAt is null in intro and finale`
- [ ] **Implement.** Bar phone story: flip 1→0 over 0–4, screen 'main' while flip > 0.9; finale flip 0→1 over 92–98, screen 'main' at ≥ 98.
  - Burst in the stack layout: vertical to the stack start.
  - Burst in the knoll layout: three phases over 4–8. Phase 1 (4–5.4) rises to the part's stack start, so parts stay in disjoint z bands. Phase 2 (5.4–6.8) moves in xy at that height to above the mat spot. Phase 3 (6.8–8) comes straight down to the mat. Screws: their heads move in phase 2.
- [ ] **UI:**
  - speed picker
  - `speed` URL param
  - `[` and `]` keys
  - playback rate = 100 / duration[speed]
  - "여는 장면" / "닫는 장면" in the now label
  - in manual depth, step ends `[8, ...ends, 100]` and play stops at each
  - video uses the current speed
- [ ] `npm test` → all pass.

### Task 2: Fold kinematics and validation

**Files:** Create `unfold/engine/fold.js` and `unfold/tests/fold.test.mjs`. Modify `unfold/engine/model.js` (fold fields, half, foldedDims, part range 50–100 for `kind:'foldable'`) and `unfold/scripts/check_model.mjs` (`--official-folded`, folded collisions, folded dims, burst check).

- [ ] **Failing tests:**
  - `open is identity`: bendPoint(fi, u, z, 0) = [u, z]
  - `closed mirrors B`: θ = 180 maps B's (at + L/2 + d, z) to (at − L/2 − d, −2L/π − z)
  - `bend is continuous`: bendPoint at the zone edges equals the B transform at the B edge (|Δ| < 1e-6) for θ ∈ {30, 90, 150}
  - `asymmetric fold`: at ≠ w/2 still yields folded w = max(at − L/2, w − at − L/2) + bend radius
  - `half derived` (model test)
  - `folded collision detected` and `folded dims checked` (check_model tests, with fixture `tests/fixtures/fold-mini.json`)
- [ ] **Implement.** Gate 1 adds the following:
  - **Folded check:** at θ = 180, every pair across A and B whose folded boxes overlap is an error. Hinge parts and attached pairs are exempt.
  - **Folded dims:** the AABB of all folded boxes against `--official-folded` (or `product.foldedDims` when no flag is given) must be within ±0.5 mm.
  - **Burst:** at 60 samples over t ∈ [4, 8], all moving pairs are checked in both layouts (exemptions as in v1).

### Task 3: Hinge and flexible display shapes, fold rendering

**Files:** Modify `unfold/engine/shapes.js` (templates `hinge`, `flexdisplay`, `display` with `face:'back'`) and `unfold/engine/render.js` (half groups, story transforms, CPU bend of hinge-half meshes with edge rebuild, folded framing, screen materials inner/cover).

- [ ] Templates:
  - `hinge {r}`: a barrel along the axis, with gear and link plates at both ends, wings marked `userData.side = 'a'|'b'`.
  - `flexdisplay {bezel, holes}`: a panel tessellated along u in 1 mm columns inside the bend zone, with a screen face on −z.
  - `display {face:'back'}`: the screen on +z.
- [ ] Render:
  - pivot contains halfA, halfB and hinge
  - halfB transform = `bTransform(θ)` as a matrix about the fold axis
  - hinge wings follow their side; the barrel follows θ/2
  - hinge-half mesh vertices pass through bendPoint when θ changes (base positions cached)
  - framing blends the open and folded home boxes by θ / 180
  - screen lit per `storyPose.screen` or the fold-slider rule
- [ ] **Verify:** build `fold-mini.json` and shoot t = 0, 2, 4, 6, 50, 95, 100 plus the fold slider at 90 at t = 100. Inspect: the bend is smooth, the halves never cross, and the cover screen is lit when closed.

### Task 4: Fold slider UI

**Files:** Modify `unfold/engine/ui.js`, `unfold/engine/i18n.js`, `unfold/scripts/shoot.mjs`.

- [ ] A slider shown only when `foldInfo(model)` is set. It is enabled at t ∈ {0, 100} and otherwise mirrors `storyPose.fold`.
  - Input → `R.setFoldOverride(θ)`.
  - Any bar change → override cleared.
  - `fold=` URL param (applies when t is 0 or 100).
- [ ] **Gate 2 additions:**
  - shots at t = 2, 6 and 95 (intro and finale)
  - for foldables: `fold=90&t=100` and `fold=0&t=0`
  - a speed check: play at normal for 2 s and expect Δt ≈ 8.3 ± 3

### Task 5: Examples: iPhone Duo and Galaxy Z Fold 8

**Files:** Create `unfold/examples/iphone-duo.json/.html` and `unfold/examples/galaxy-z-fold8.json/.html` from `research/*.json` (shape templates, half, key parts with desc, Korean copy, limitations).

- [ ] For each model: Gate 1 with `--official` and `--official-folded` → PASS (≤ 3 rounds; leftovers go to limitations). Then build, run Gate 2, inspect → PASS.

### Task 6: Interaction run

- [ ] Extend the CDP interaction script:
  - change speed mid-play (no jump in t)
  - fold slider at 100 → 90°, drag the bar to 50 (slider disabled, override gone), back to 100 (slider enabled at 180)
  - `[` and `]`
  - manual play from 8 → stops at the first step end

### Task 7: Regression, docs, review, reinstall

- [ ] S24 regression:
  - S24 passes Gate 1 and Gate 2 under the new story
  - `npm test` passes
- [ ] Docs:
  - SKILL.md: photo input step, foldable modelling (fold, half, foldedDims, hinge and flexdisplay), the new bar segments, speeds
  - references/model-format.md and research.md: foldable fields and the coordinate system for foldables (open, inner display down, B = cover side)
- [ ] A fresh reviewer on the most capable model reviews the phase-2 diff; fix the findings.
- [ ] Reinstall to `~/.claude/skills/unfold` and deliver the three examples.
