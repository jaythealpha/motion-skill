# Researching a product for Unfold

## Sources, best first

1. **Maker's official spec page**: when a model is no longer current, its page may redirect to the new lineup. Try Apple's support tech-specs pages or another region's page. The spec page gives outer dimensions (w × l × t mm), weight, battery, display, cameras. These dimensions are what Gate 1 checks against (`--official`). Cross-check with one reputable spec database (e.g., GSMArena).
2. **Repair guides and teardowns** (iFixit guides for the exact model; if there is no full teardown, the individual part guides together usually give the whole order): removal order, part names, screw counts and lengths per step, press connectors and where they sit, adhesives, clips, pull tabs.
3. **Teardown videos and reputable write-ups** (PBKreviews, JerryRigEverything, repair shops, tech press reports of them): layout facts such as board sandwiches, vapour chambers, glued parts.
4. **Regulatory internal photos** (FCC ID pages): layout, if reachable.
5. **Proportions:** what no source states, estimate against known sizes (the phone's outline, the battery, the screen) and mark it `estimated`.

Try the US and a second regional spec page if one fails. Record every source in `sources[]` with what it is evidence for (`covers`). Repair guides are long, and a page fetch may truncate them, so ask only for the removal steps, screw counts and lengths.

**Note the build direction:** does the teardown start at the back glass (back-access) or by lifting the screen (front-access)? It decides how the model lies (see model-format.md).

## Licence

Teardown sites are often non-commercial (iFixit: CC BY-NC-SA), and Unfold pages may be used commercially. Take **facts only**: numbers, counts, order, names, fastening. Write every sentence in your own words. Never copy their text, and never download or embed their photos. Sources appear on the page as links.

## Coordinate system (all mm)

The product lies **screen down**. `x` runs across the width, 0 at the left edge **as seen from the back**. `y` runs along the length, 0 at the bottom edge (the USB-C end). `z` runs through the thickness, 0 at the front glass and increasing toward the back. A part's position is its box `[x0, y0, z0, x1, y1, z1]`. Side keys that sit on the right when you face the screen therefore have small `x`.

**Foldables:** the phone lies **open, inner (folding) screen down**:
- x runs across the open width, 0 at the left edge seen from the back.
- **Book fold:** the fold line runs along y at x = `at`.
- **Clamshell** (Flip): the fold line runs across at y = `at`. Half B, with the cover screen, is the top half (high y). Its rear cameras sit just above the hinge on the back of B.
- Half B is the half with the cover screen.
- Record the open and folded official sizes. The `gap` and `spine` follow from them (see model-format.md).
- Record which half each part is in. Note which battery cell sits in which half if a source says so.

A typical phone z stack: display 0–1.3, midplate about 1.3–2.0, boards and battery about 2–6.6, wireless coil, then adhesive and back glass up to `t`. Lens rings may stand proud of `t`.

## What to record per part

- the name in English and Korean, and a category
- the count (one entry per screw type per step, with its count)
- the box, and the real outline (to choose a template and its parameters)
- what it is fixed to (`attachedTo`) and how (`fastening`: screw spec and count, adhesive, press connector, clip)
- the assembly step (assembly = the reverse of disassembly; step 1 is the base)
- `sourceIds`, and `confidence`: `verified` only when a source states or clearly shows the fact

## Predecessor evidence

When the exact model has no teardown yet, an earlier model's facts may stand in.
- A part counts as **verified** only if a source says that part carried over (e.g. "same shell as the Flip7").
- Otherwise mark the part estimated. It may still list the predecessor's source in `sourceIds`, as supporting evidence.
- Name the predecessor in `meta.limitations`.

## Conflicts and gaps

When sources disagree (e.g., 2 vs 3 screws), pick the reading that agrees with the most other evidence, such as the screw total in the most thorough guide. Note the conflict in `meta.limitations`. When nothing documents a part's position, place it where the type usually sits, mark it estimated, and say so in the limitations. Do not drop documented parts to make the layout easier.

Aim for 40–80 parts on a phone: screw groups, board-to-board connectors, flex cables, shield cans, adhesive films, brackets, coil, speakers, motor, mics, cameras, flash, SIM, port, buttons, boards, battery, frame, display, back.
