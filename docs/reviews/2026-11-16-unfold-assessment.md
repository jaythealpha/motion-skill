# Unfold — current state assessment (2026-11-16)

Scope: read-only assessment, no code changes. Five packaged examples captured with `unfold/scripts/shoot.mjs --only` (headless Chrome, ANGLE Metal / AMD Radeon Pro 5300, 1280×860) at t = 0, 48 (mid-disassembly, stacked and "on the mat"), 100, and blueprint.

## Summary by device

| Device | Parts / steps | Sourced share (page badge) | What the captures show | Priority |
|---|---|---|---|---|
| Galaxy S24 | 56 / 14 | 48% | Clean finished phone. At t=48 the stack occupies only about a third of the stage: parts are small, with large empty margins. The mat layout reads well. Parts are flat boxes with simple colour. | Medium (framing, materials) |
| iPhone 17 Pro | 69 / 17 | 77% | Finished phone reads well (orange frame, screen). Same mid-disassembly framing issue. | Medium |
| iPhone Duo | 97 / 15 | 94% | The device exists: Apple newsroom announced it in September 2026 and it went on sale on 23 October 2026. The example's internal part sources were **not** re-verified in this assessment. Exploded stack reads, but black display panels dominate and labels can overlap. | Medium (verify part sources) |
| Galaxy Z Fold8 | 72 / 12 | 44% | Exploded stack framing as above; long labels are truncated with an ellipsis ("Main logic board (Snapdragon 8 El…"). Known open issue: the source conflict on battery access direction (DEMOS.md). | High (fact conflict) |
| Galaxy Z Flip8 | 57 / 10 | 18% | Mostly estimated. **Suspected geometry defect:** at t=0 and t=100 (folded), a beige hinge-cover block sticks out above and beyond the folded body at the back edge. Needs checking against the fold model and gates. | High (defect, sourcing) |

## Common improvement opportunities

1. **Mid-disassembly framing:** the auto camera fits the full exploded envelope, so individual parts are small on desktop. Options: step-focused framing (frame the current step's parts plus context) or a tighter envelope. This needs care so the existing Gate 2 frame checks still pass.
2. **Materials:** a shared art pass (studio lighting, glass with edge highlights, anodised aluminium / titanium frame, circuit-board substrate and component colours, flex cables) would raise all five at once. One Fable 5.2 specification-only module is expected to cover the shared part.
3. **Labels:** truncated long labels at 1280 px; consider wrapping to two lines or showing the full name on focus.
4. **Facts:** Fold8 battery-access conflict and Flip8 sourcing should be resolved before visual polish, so the visuals don't present estimates as confirmed.

## Not done in this assessment

No code changes, no Gate 2 runs, no phone captures, no performance measurement, no source re-verification of internal parts.

Sources: [Apple Newsroom — Apple unveils iPhone Duo](https://www.apple.com/newsroom/2026/09/apple-unveils-iphone-duo/), [iPhone Duo arrives at Apple Store locations worldwide](https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/).
