# Britannic visible form study — 2026-11-01

## Evidence actually inspected
1. [USM / Osher Map Library catalogue, barcode 2000727](https://digitalcommons.usm.maine.edu/oml-morse-collection-gallery/2657/): identifies a Britannic longitudinal section and deck plan dated 27 February 1914. Its image link currently resolved to a placeholder; the catalogue is provenance evidence, not a source of measured coordinates.
2. [Historical White Star Line / Engineering plan reproduced on Commons](https://commons.wikimedia.org/wiki/File:The_White_Star_Atlantic_Mail_Steamer_Britannic_(deck_plans).jpg): opened the original-size 1099×729 reproduction in the browser and inspected the section and upper deck footprints. The drawing identifies Harland & Wolff as designer/builder. It shows different deck extents, working well decks, forecastle/after-deck transitions, broad promenades and indented deckhouse footprints. The reproduction is insufficient to read every small window or dimension. No scan/photo is downloaded into this project or embedded in an example.
3. [Mark Chirnside's promenade-enclosure research](https://www.encyclopedia-titanica.org/the-enclosure-of-titanics-forward-a-deck-promenade-popular-myth.html): confirms an enclosed forward A-deck promenade on Britannic. The boundary position, widths and individual openings here remain estimates.
4. [Chirnside's account of Cyril Codus' hospital-ship plans](https://markchirnside.co.uk/britannic-plans-by-cyril-codus/): warns that hospital-service appearance and lifeboat equipment differed from the builder's proposed passenger-ship arrangement. Existing 1916 equipment/time tracks are retained; the 1914 plan is not treated as the final 1916 arrangement.

## Material found but not transcribed
Bob Read's public HMHS reconstruction plan index and PDF text were inspected. They are modern drawings, not the 1914 original, and carry BY-NC-ND terms. No image, traced outline, offsets table or mesh from these sheets is included in this implementation. The viewer could not display their PDF diagrams in this session; no visual comparison against their body-plan curves is claimed. Paid plans were not purchased.

## Mapping evidence to independent geometry
| Feature | Observed basis | Implemented representation | Confidence boundary |
|---|---|---|---|
| Overall dimensions | Existing model's 269.1m LOA / 28.65m beam | Same maximum envelope; original attachment frames retained | Existing source dimensions; no new measurement claim |
| Counter stern / fine bow / rounded bilge | Period longitudinal profile and broad hull silhouette | 65-station independent approximate loft, eased aft overhang, rounded sections and slight upper-side inward slope | Entire section/half-breadth table is estimated; not a digitisation of a body plan |
| B/A deck difference | Distinct extents and indentations in upper deck plan | Separate stepped width profiles, real wall thickness, thin roof/floor lips | Exact breakpoints/widths remain hand-authored approximations |
| Boat-deck houses | Broken-up footprint in period upper-deck plan | Recessed wings, narrower connectors, raised roof portions | Coordinates, roof rise and skylight shape are illustrative estimates |
| Forecastle / aft well transitions | Section and forecastle/poop deck plans | Raised foredeck with shell below; supported aft cover | Heights/endpoints and support spacing estimated |
| Forward promenade | Period plan plus Chirnside's research | Enclosed forward windows, open aft bays with inboard wall | Exact enclosure boundary and frame positions estimated |
| Window arrangement | Distinct deck/window types visible in source material | Rectangular cutouts and inset panes on upper decks; grouped circular hull rows with gaps | Exact counts, spacing, side-to-side symmetry and individual coordinates unverified |

The 3D contours are an independently authored, qualitative interpretation of historical facts, not a copy of a modern recreation or a survey-quality CAD model. No tolerance such as ±cm is asserted. No people or lifeboats are added.

## Integration and preserved state
`engine/britannic-form.js` changes a copy of piece parameters during rendering only. Original JSON, dates, flooding, pose/collapse keys, source IDs, confidence percentages and attachment offsets are unchanged. Both hull swap states use the same form function and original split range, so the bow keeps its original independent deformation track. Detail rails, seams and colonies follow new deck footprints. No added geometry is counted as sourced in the 29% time-model statistic.

The existing Gate 1 checks the original temporal/data model, not this separate display geometry. Additional form tests check the visible hull's length/beam, finite offsets, envelope constraints, nonmutation and a ray passing through an actual window hole. Browser/Gate 2 checks cover integration. This distinction is intentional and must be retained in claims.

## Known limits
No authenticated builder's offsets table, high-resolution 1916 construction deck plan or surveyed wreck mesh was available. Individual windows, the detailed lower hull, exact deck camber/shear, corrosion, marine life and equipment locations remain approximate. The existing 1916 funnel/davit positions were preserved rather than silently replaced with the 1914 proposal. Finer geometry does not improve the accuracy of the historical time simulation. SVG annotations remain separate from canvas-only exports.
