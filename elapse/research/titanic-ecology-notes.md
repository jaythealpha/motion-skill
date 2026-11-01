# Titanic deep ecology — implementation evidence, 2026-11-01

## Source boundary
- [Cleland et al. (2025)](https://doi.org/10.1016/j.dsr.2025.104544), with [author publication record](https://www.research.ed.ac.uk/en/publications/megafauna-of-the-rms-titanic-shipwreck-and-a-nearby-seamount-ridg/). The author record and publisher search-index body excerpts were accessible. Direct publisher/full PDF access returned 403; this is not a full-paper/image review. The [corrigendum](https://doi.org/10.1016/j.dsr.2025.104555) is not used to derive growth rates; no quantitative growth claim is implemented.
- Published observations distinguish the wreck from Seamount U, approximately 40 km away. Bow-rail coral observations support a small branching coral interpretation. Sponge records are sparse, including stern and an earlier boat-deck observation; Geodia ridge colonies are not placed on the wreck. Rattail-type fish are associated with soft sediment. Exact species identification is not claimed for the models.
- [1994 field-research abstract](https://archives.datapages.com/data/atlantic-geology-journal/data/030/030002/pdfs/154.pdf) provides independent context for corals, sponges and rattails near the wreck.
- [NOAA light penetration](https://oceanservice.noaa.gov/facts/light_travel.html) supports excluding sunlight at this depth. Lights here are virtual survey lights, not a recreation of a particular vehicle or expedition.

## Implemented interpretation — estimated display layer
- Two small branching coral models attached to the drawn bow railing; two small unidentified encrusting sponges attached to a stern roof; three generic rattail-like fish over sediment. These counts are chosen for legibility, not surveyed abundance.
- Approximate coral height 12 cm, sponge width 10 cm, fish length 50 cm. All sizes, exact coordinates, branches, pores, fins, colours and motion paths are authored approximations, not measured biological reconstructions. The cm/m ruler measures the illustrative geometry, not a source specimen.
- Fixed observation-inspired assemblage visible only in the 1986–2022 date window, colour view, x-ray off. This window is the study's retrospective observation context, not proof that these particular organisms coexisted in every displayed year. It is explicitly labelled on screen. No creatures added to 1912 sinking or future projections. No annual population, colonisation or growth model.
- Inspect choices: context / coral / sponge / fish. Animals keep their small model size; camera moves close instead of inflating them. The default scene camera and historical events are retained.
- Two soft virtual survey spotlights; basic illustrative lighting remains an alternate option. Seeded settling particles replace ambient particles in this window, while dated structural-collapse dust remains intact. Density, speed and light intensity are explanatory art direction, not optical measurements.
- Fish and marine snow use accumulated playback seconds. Pausing freezes them; camera/style changes do not advance them. Reduced motion freezes the new ecology animation. Historical timeline animation remains under explicit user playback control.
- Biology and lighting toggle independently. Controls retain their layout and become disabled outside the eligible window. Blueprint remains structural.

## Preservation and limits
Original time-model JSON, event dates, source/confidence statistics, geometry IDs, split tracks and burial/collapse keys are unchanged. Display-layer approximations do not increase the original 70% sourced statistic. No photos, videos, scans or third-party mesh assets are embedded; no dependency added. SVG explanatory overlays remain outside canvas-only image/video exports, as before. Physical-device performance, taxonomic morphology and ecological abundance have not been validated by a marine biologist.

Verification record: `../representative/titanic-ecology-qa.md`.

## Refinement follow-up
The next UI/detail pass adds contextual macro explanations, accessible canvas subject labels and procedural staining/grain on the two macro host structures. Surface patterns are estimated presentation, not field-measured corrosion. Coral meshes are merged by material with their geometry retained; the macro camera keeps its shorter far clip after fitting. See `../representative/titanic-refinement-qa.md` for the flow review and checks.
