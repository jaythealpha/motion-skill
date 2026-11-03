# Unfold high-detail rendering

The 2026-11-03 material revision adds cached periodic height/roughness tiles for metal and polymer surfaces, cleaner glass response and stronger studio reflection contrast. Tiles are generated once and reused. Geometry, original model JSON, screen states, fold paths, assembly steps and five-language controls remain unchanged. These surface details are illustrative; they do not describe measured coatings, circuit topology or serial markings.

`meta.renderQuality: "high"` (default) enables physically lit, material-specific finishes, smooth2-segment bevels and12-segment curves. No source image, scan, mesh or runtime network asset is embedded. `?quality=standard` selects the original toon material/tessellation path for comparison.

Mobile viewports and identified software renderers use a lightweight Phong finish with the same procedural marks and geometry; other GPUs use Standard/Physical materials. This adaptive path is documented rather than claiming the software screenshots validate hardware PBR performance.

Metal/copper/gold/flex finishes vary in roughness and response to light; lens/glass uses a clear coat. Surface marks suggest PCB solder-mask traces, chip/label detail and subtle brushed grain. These are independently authored illustrations, not measured circuit topology, actual battery warnings/serials, repair instructions or material specifications. No added electrical component or fastener is asserted. Silhouettes, part bounds, counts, coordinates, attachment, steps and fold transforms stay in the original model.

Colour mode reduces idle ink edges to keep bevels and material boundaries legible; active parts remain outlined. Blueprint/print modes keep the technical line work. Transparent waiting parts still reveal the work being assembled. The spine restores blueprint fill/edges in blueprint mode. Existing screen textures and finished screen states are retained.

Preserve a before-copy and compare the entire model excluding new metadata. Gate1 remains the unchanged reference for declared geometry/path consistency, not a metrology certificate. Full Gate2 verifies assembly, folds, speeds, screens and print. Responsive screenshot review must cover375/768/1440px and shader console errors. Physical-device performance and engineering acceptance require separate evidence.
