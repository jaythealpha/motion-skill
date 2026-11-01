# Titanic plan-informed visible geometry — 2026-11-01

## Sources inspected
- [1912 British inquiry: structural dimensions](https://www.titanicinquiry.org/BOTInq/BOTReport/botRepTitanic.php) and [decks/accommodation](https://www.titanicinquiry.org/BOTInq/BOTReport/botRepAccomo.php): primary report, electronically transcribed. The latter specifies a 192ft forward promenade screen, 125ft forecastle, approximately 105ft poop and approximately 50ft wells. Relative B–C deck separation is 9ft. Existing time-model vertical datums are retained; this is not a fresh datum survey.
- [1911 Engineering Olympic/Titanic profile](https://commons.wikimedia.org/wiki/File:Olympic_and_Titanic_Side_Plan_1911.png): opened the historical image in the browser. Used for qualitative fine bow, counter stern, deck hierarchy and rows of openings. This is a pre-completion sister-ship profile, not proof of Titanic's final April 1912 outfit.
- [Titanic Belfast's original inquiry-plan provenance](https://www.titanicbelfast.com/history-of-titanic/titanic-stories/from-skip-to-saleroom-titanics-plan/): the original was made by White Star's naval architects for the inquiry. Its displayed photograph was inspected; it supports the overall section but is insufficient for measured offsets.
- [A-deck](https://www.titanicinquiry.org/plans/adeck.php) and [C-deck](https://www.titanicinquiry.org/plans/cdeck.php) reference drawings: viewed in browser, explicitly marked Copyright 2001 Titanic Inquiry Project. These are modern explanatory references, not original builder sheets. They support interpretation of the irregular inner house and promenade. No image, traced contour or mesh is bundled.

The Commons file titled “Titanic Original Plans.jpg” was not accepted as an authenticated primary plan: its own metadata identifies a 2013 own-work upload. A 1997 coloured starboard drawing was likewise not treated as a 1912 original. Neither supplied coordinates.

## Implemented mapping
- `titanic-form.js` supplies a copied display model; no source JSON, source IDs, confidence percentages, track keys or attachment offsets are rewritten.
- Shared independently authored liner loft follows a finer entrance, rounded bilge, eased counter stern and slight tumblehome. Its 65-station offsets are estimated, not a transcribed builder's table. The maximum 269.1m/28.2m envelope is retained.
- The two open wells are recessed 9ft from the original B-deck datum, with the 125/105ft end-deck extents and approximately 50ft wells interpreted from the inquiry. Geometry clips the top without lowering the bottom/waterline sections. Half-breadth interpolation and historical flooding remain separate.
- A-deck's 192ft screen boundary is common in ship coordinates across the three original split pieces. Forward windows and open aft bays are actual wall openings. The inboard accommodation house has a variable-width outline; detailed plan breakpoints remain estimates.
- Boat-deck houses have setbacks, roof lips, a raised first-class roof and an approximate dome. Split pieces are clipped from shared full-ship profiles, preserving their original break and collapse parenting.
- Hull rows distinguish circular portholes from rectangular B-deck windows and omit openings above the recessed well deck. Counts, spacing, exact side differences and individual coordinates remain estimated.
- Structural rails/frames follow the new contours. Titanic keeps its existing deep-water rusticle treatment; Britannic's shallow-water colonies and green weathering layer are not imported into Titanic.
- Identical local wall/pane meshes are coalesced per material to reduce draw calls without changing openings. This is not a measured performance claim.

## Accuracy boundary
This is a source-informed illustration, not engineering CAD or a surveyed wreck mesh. Exact offsets, camber, skylight dimensions and all individual window coordinates remain unverified. The time model's 70% sourced share describes that original model only, not these extra estimated presentation details. The original dated sinking, three-way breakup, burial and collapse logic remains unchanged; no biological population timeline was added. Source scans/photos are not downloaded into the project or embedded in the HTML.
