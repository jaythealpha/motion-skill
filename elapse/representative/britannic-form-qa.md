# Britannic plan-informed geometry QA — 2026-11-01

Scope: finer displayed hull, deck setbacks and openings, preserving the original historical time model and preceding local publication-preparation edits.

## Design QA
Status: passed for inspected visual/interaction states, subject to the historical-accuracy limits below. No P0/P1/P2 UI issues found in the inspected views.
- Actual in-app browser at 375x900, 768x1000 and 1440x1000. Blueprint seabed close-up is readable with fixed information slots; labels/reference header remain inside the canvas.
- Intact 3/4 view inspected in both styles at 1440px. Comparison uses the same basic silhouette/period deck hierarchy; no pixel-match claim against the source plan.
- Colour → x-ray on → off works; source/accuracy explanation and three links appear in About. Fixed-layout regression passes both styles, three widths, five times (30/30 states).
- Local screenshots: `../.out/britannic-plan-browser/` (Git excluded).

## Data versus display geometry
- Original Britannic and Titanic JSON files remain unchanged. Gate 1: both pass with zero errors/warnings, original sourced shares 29% / 70% retained.
- New visual hull length/beam, finite topology, deck envelope bounds, nonmutation, unchanged attachment offsets and an actual clear window opening are checked in `tests/britannic-form.test.mjs`.
- Unit suite: 71/71 in UTC and 71/71 in Asia/Seoul.
- Shared copies synchronization and whitespace checks pass.
- Sources, feature mapping and unverified dimensions: `../research/britannic-form-notes.md`.

## Interpretation limits
This is a period-plan-informed visual reconstruction, not an authenticated 1916 engineering model or surveyed wreck. The accessible 1914 reproduction supports qualitative deck outlines, while the hull's sections and all individual window coordinates remain approximate. The hospital-ship equipment and historical events remain as before. Modern copyrighted reconstruction contours were not transcribed; source images/scans are not bundled. No humans or lifeboats are drawn. Physical devices, screen readers, export encoding and quantitative performance remain unverified. Browser overlay labels/ruler are not included in canvas-only exports.

## Render checks
- Full Britannic Gate 2 PASS: 71/71 screenshots, both styles, x-ray, events, three angles, English, panels, mobile and all playback speed checks. This run began before the last stern easing adjustment; later frames used the updated bundle.
- Final stern geometry recheck PASS: all chapter starts/ends, mobile, water and speed (13/13 quick Gate 2 shots). The last subsequent UI adjustment adds only an opaque backing to the SVG reference header, checked manually in the browser.
- Titanic common-engine regression PASS: 19/19 quick Gate 2 shots. Both HTML examples rebuilt with gate2=pass.
- No browser warning/error observed in the inspected in-app session. No new external image/font/network dependency added.
