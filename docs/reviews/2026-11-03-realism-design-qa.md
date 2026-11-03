# Realism revision — design QA

Status: **passed for the tested rendering and interface changes**. This does not certify photographic fidelity, surveyed geometry, physical fire/impact mechanics or human aesthetic acceptance.

The existing design system and controls are retained. The reference is the existing approved subject art direction and the retained before HTML, with the user's requested additional WTC realism. No new UI direction, framework or user-input workflow was introduced.

## Compared at matching states

- WTC study: aircraft approach p=.30, impact p=.58 and smoke p=.86 at 375, 768 and 1440 px. Full-size review confirmed thick/swept airfoils and engine silhouette, glass/metal facade separation, filtered column detail, irregular luminous flame, shaded smoke and a depth-bearing opening. The explanatory time scale and estimated context remain labelled.
- WTC timeline and historical buildings: full event/style tests and inspection transitions preserve dated visibility and camera context. Notre-Dame's new flame/smoke batches follow its original fire state and disappear in blueprint mode.
- Shipwrecks: historical poses, water/light states, original data and underwater framing remain intact. Material treatment is specific to the subject; Britannic growth remains stable under repeated renders.
- Phones: assembly/closed endpoints, both layouts, material boundaries, lit displays, labels and print pages remain usable. Five phone examples passed their full gates; high/standard/style/layout checks passed at all three widths.

## Interface and regression checks

The 180-case matrix checks language, preserved progress, canvas/subject framing, Korean text leaks outside Korean, horizontal overflow, caption/control overlap and script errors. The 240-state Elapse and 75-state Unfold checks cover inspection/history restoration, colour/blueprint, layout and standard rendering. Existing five-language accessible labels, touch targets, focus, reduced-motion behavior and fixed information slots are preserved; this turn does not claim new comprehensive screen-reader or physical-device validation.

All ten original JSON models are byte-identical. There are no newly invented source dates, dimensions, confidence percentages or facts. Aircraft contours, damage shape, context, material microdetail and effects remain illustrative. No photos, scans, outside meshes, livery or people are added.

No known P0/P1/P2 issue remains in the tested changes. Performance evidence includes repeated steady native-GPU traces and retained transient long frames; see [the detailed report](2026-11-03-realism-pass.md). Public deployment verification is a separate final step and is recorded in the completion report.
