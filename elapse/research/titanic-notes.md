# RMS Titanic — research notes for the time-lapse model

Compiled 2026-10-29. All sentences are my own summaries; no source text or images are copied.
Source ids (s1, s2 …) point to section 12. Confidence values:
- `sourced`: stated in the cited source.
- `estimated`: my inference; the basis is given.
- `disputed`: sources disagree; the competing figures and who holds them are listed.

Conventions used below:
- **FP** = forward perpendicular (≈ the stem at the waterline). **AP** = after perpendicular (the rudder post). LBP = 850 ft, so AP is 850 ft (259.1 m) aft of FP.
- The **stern tip** (end of the counter) is about 32.75 ft (10.0 m) aft of AP: LOA 882.75 ft − LBP 850 ft, with the straight stem taken as sitting on FP (`estimated`).
- 1 ft = 0.3048 m. Metres are rounded to 0.1 m.
- **Ship's time** (apparent time ship, ATS) = GMT − 2 h 58 min (s22) = New York time + 2 h 02 min (s15; derived from the Baltic wireless exchange). The US Senate report used a different offset: it gives the collision as 23:46 ship's time = 22:13 NY time, i.e. +1 h 33 min (s12). This is `disputed`; the model should use the British times (collision 23:40).

---

## 1. Official dimensions

| Item | Metres | Original | Source | Confidence |
|---|---|---|---|---|
| Length overall | 269.1 m | 882 ft 9 in | s14, s21, s13 | sourced (s11, the US report, gives 882.6 ft; a forum figure of 882 ft 8 in also exists) |
| Length between perpendiculars | 259.1 m | 850 ft | s14 | sourced. The Board of Trade register length is 852.5 ft (s1); the builder's method gives about 850 ft 6 in (forum, via search). The 16 compartment lengths in s2 sum to exactly 850 ft. |
| Beam (extreme) | 28.2 m | 92 ft 6 in | s1, s14 | sourced. The moulded beam is not stated in any source found; 92 ft is a common estimate (`estimated`). |
| Moulded depth | 18.1 m | 59 ft 6 in | s13 | disputed: TIS gives 59 ft 6 in (s13). TRMA gives 64 ft 3 in to the shelter deck (C) and 73 ft 3 in to the bridge deck (B) (s14). The BoT gives 64 ft 9 in from the top of the keel to the top of the C-deck beam (s1, s24). The C-deck figure (19.7 m) is the one to use for "keel to the uppermost continuous deck". C deck was the uppermost deck running the full length (s1). |
| Depth of hold (register) | 18.2 m | 59.58 ft | s1 | sourced |
| Load draught | 10.5 m | 34 ft 7 in (s1); "34 ft 6 in to 34 ft 7 in" (s14) | s1, s14 | sourced. On 14 April the mean draught was about 2 ft (0.6 m) less, because about two-thirds of the coal and stores had been used (s15). |
| Displacement at load draught | 53,150 t (metric) | 52,310 long tons | s1, s14 | sourced |
| Displacement on the night | 49,075 t | 48,300 long tons | s15 (quoting Hackett & Bedford) | sourced |
| GM (metacentric height) on the night | 0.80 m | 2.63 ft | s15 (quoting Hackett & Bedford) | sourced |
| Gross tonnage | — | 46,328 GRT (46,328.54) | s1, s14 | sourced (some sources round to 46,329: s13, s21) |
| Net tonnage | — | 21,831 NRT | s1 | sourced |
| Keel to boat deck (amidships) | 28.1 m | ≈ 92 ft 3 in | derived from s1 deck spacing | estimated: 64 ft 9 in to C + 9 ft to B + 9 ft to A + 9 ft 6 in to the boat deck. A check: Halpern gives the boat deck as 58 ft 0 in above a 34 ft 7 in waterline, which is 92 ft 7 in above the keel (s15). |
| Waterline to boat deck | 18.4 m | 60 ft 6 in | s13; s1 gives "about 60.5 ft" at the time of the accident | sourced (s11, the US report, gives 70 ft for boat deck and bridge, a rounded figure) |
| Keel to top of navigating bridge | 31.7 m | 104 ft | s14, s21 | sourced |
| Keel to funnel tops | 53.3 m | 175 ft | s13, s21 | sourced |
| Keel to masthead | 62.5 m | 205 ft | s24 | disputed: s24 gives 205 ft from keel to masthead; s21 gives "masts 155 ft (47.2 m)" with no reference point stated. |
| Decks | — | 9 (boat, A–G, orlop at the ends); 8 steel decks amidships | s1, s24, Shipbuilder via s49 | sourced |
| Double bottom (tank top above keel) | ≈ 1.5 m | about 5 ft | s1 | sourced. The BoT says it ran from bulkhead A to 20 ft forward of bulkhead P. Mengot gives the depth as 63 in increasing to 75 in (1.60 to 1.91 m) at frame 25 aft (s19). |

## 2. Hull form

| Item | Value | Source | Confidence |
|---|---|---|---|
| Block coefficient Cb | ≈ 0.67–0.68 | computed: 52,310 long tons × 35 ft³/ton ÷ (850 × 92.5 × 34.58 ft) = 0.673; with a 92 ft moulded beam it is 0.677 | estimated (no published Cb was found) |
| Midship coefficient / prismatic | not published | — | gap. Typical of a 1910s express liner: Cm ≈ 0.97–0.98, so Cp ≈ 0.69 (estimated, from Cb/Cm) |
| Stem | Straight, near-vertical plate stem with no bulb | general-arrangement profile; Shipbuilder via s49 | sourced (it is visible in all builder's profiles; no numeric rake was found, so model it as vertical) |
| Stern | **Counter stern** (an overhanging elliptical counter, not a cruiser stern). Titanic Belfast calls it "elliptical". The counter was framed with cant frames. Overhang aft of AP ≈ 32.75 ft (10.0 m). | s46; LOA − LBP | sourced (type); estimated (overhang) |
| Rudder | 78 ft 8 in high (23.98 m) × 15 ft 3 in long (4.65 m), over 100 t | s21 | sourced |
| Propellers | 3: wing propellers 23.5 ft (7.16 m) diameter, centre 17 ft (5.18 m) | s21 | sourced |
| Flat of side | A long parallel middle body, vertical sides | builder's plans (not online in numeric form) | estimated: a long-sided ship of Cb ≈ 0.68 usually has 30–40 % parallel middle body, so about 255–340 ft (78–104 m) centred near midships (≈ 425 ft from FP) |
| Bilge | A round bilge of moderate radius with a flat bottom, no rise of floor to speak of | no numeric radius found | estimated: a bilge radius of about 6–8 ft (1.8–2.4 m) is typical for this size and form |
| Offsets table | **No public offsets table was found.** H&W plans exist in archives; enthusiast CAD (Encyclopedia Titanica deck plans) is not a lines plan. | — | gap |
| Fineness for an estimate | The bow entrance is fine, with hollow waterlines near the stem. The run aft is longer and fine up to the counter. The forefoot is fairly sharp (a cut-up forefoot is absent; the keel runs straight to the stem). | — | estimated |
| Sheer | Deck heights above the 34 ft 7 in waterline (amidships / bow / stern): D 20 ft 0 in / 33 ft 0 in / 25 ft 0 in; E 11 ft 0 in / 24 ft 0 in / 16 ft 0 in; F 2 ft 6 in / (bow figure garbled in s1) / 7 ft 6 in. So the sheer is ≈ 13 ft (4.0 m) at the bow and ≈ 5 ft (1.5 m) at the stern. | s1 | sourced (values); estimated (sheer rise) |
| Hull plating | Sheer strake: two 1-inch plates over the top 100 in (2.5 m). B deck (the strength deck) tapers to ¾ in (19 mm). Superstructure sides ¼ in (6 mm). | s19 | sourced (Mengot) |
| Frames | Numbered from amidships: forward to 156F and aft to 148A. Spacing was not confirmed (3 ft amidships is commonly assumed). | search summary of an Encyclopedia Titanica item; s19 | sourced (count); estimated (spacing) |

## 3. Deck layout above the hull

### 3a. Decks: heights above the keel (amidships, top of the beam at the side)

Built from the BoT deck spacing (s1): C is 64 ft 9 in above the keel. The spacings are A→boat 9 ft 6 in, B→A 9 ft, C→B 9 ft, D→C 10 ft 6 in, E→D 9 ft, F→E 8 ft 6 in, G→F 8 ft, orlop→G 8 ft.

| Deck | Height above keel | Height above 34 ft 7 in WL | Extent | Confidence |
|---|---|---|---|---|
| Tank top | ≈ 5 ft (1.5 m) | — | A to near P | sourced (s1) |
| Orlop | 20 ft 9 in (6.3 m) | below WL | ends only | estimated. Forward it sits higher because of sheer: the No. 3 hold orlop (mail room floor) is 24 ft (7.3 m) above the keel (s5, s6). |
| G | 28 ft 9 in (8.8 m) | below WL amidships; ≈ 7 ft 6 in above WL at the bow (s1) | ends | estimated (height); sourced (bow figure) |
| F | 36 ft 9 in (11.2 m) | 2 ft 6 in (s1) | full length | estimated (cross-checks with s1 to within 0.3 ft) |
| E | 45 ft 3 in (13.8 m) | 11 ft 0 in (s1) | full length | estimated / cross-checked |
| D | 54 ft 3 in (16.5 m) | 20 ft 0 in (s1) | full length | estimated / cross-checked |
| C (shelter deck) | 64 ft 9 in (19.7 m) | ≈ 30 ft | full length; the uppermost continuous deck | sourced (s1, s24) |
| B (bridge deck) | 73 ft 9 in (22.5 m) | ≈ 39 ft | ≈ 550 ft (167.6 m), plus a 125 ft (38.1 m) forecastle and a 105 ft (32.0 m) poop on the same level | sourced (lengths, s1); estimated (height; TRMA gives a moulded depth of 73 ft 3 in to B, s14) |
| A (promenade) | 82 ft 9 in (25.2 m) | ≈ 48 ft | about 500 ft (152.4 m) (s1); 546 ft (166.4 m) (s24) | disputed (length); estimated (height) |
| Boat deck | 92 ft 3 in (28.1 m) | 58 ft 0 in (s15); ≈ 60 ft 6 in on the night (s1, s13) | about 500 ft (152.4 m) (s1) | estimated / sourced |
| Navigating bridge top | 104 ft (31.7 m) | — | — | sourced (s14) |

### 3b. Superstructure fore/aft extent (from FP; stern tip ≈ 882.75 ft)

| Element | From FP | Basis | Confidence |
|---|---|---|---|
| Forecastle (C deck level, raised) | 0 → ≈ 125 ft (0 → 38 m) | s1 gives the forecastle length as 125 ft | sourced (length); estimated (start at FP) |
| Forward well deck | ≈ 125 → ≈ 190 ft (38 → 58 m) | gap between the forecastle and the B-deck house | estimated |
| B-deck superstructure | ≈ 190 → ≈ 740 ft (58 → 226 m) | 550 ft long (s1) | estimated (position) |
| A deck / boat deck house | ≈ 190 → ≈ 690 ft (58 → 210 m) | ≈ 500 ft long (s1), starting at the bridge front | estimated |
| After well deck | ≈ 740 → ≈ 778 ft (226 → 237 m) | remainder | estimated |
| Poop | ≈ 778 → 882.75 ft (237 → 269 m) | 105 ft (s1), ending at the stern tip | estimated |

### 3c. Funnels

| Item | Value | Source | Confidence |
|---|---|---|---|
| Number | 4; Nos. 1–3 working; No. 4 a dummy used for ventilation (galley, engine-room and kitchen exhausts) and appearance | s21, s24 | sourced |
| Boiler rooms served | No. 1 funnel: BR 6 + BR 5; No. 2: BR 4 + BR 3; No. 3: BR 2 + BR 1; No. 4: over the engine rooms (no boiler uptake) | uptake arrangement | estimated (standard H&W layout; not confirmed in a source found) |
| Positions (centre of base, from FP) | No. 1 ≈ 250 ft (76 m); No. 2 ≈ 361 ft (110 m); No. 3 ≈ 466 ft (142 m); No. 4 ≈ 580 ft (177 m). Spacing ≈ 110–115 ft (34–35 m). | centred over the boiler-room pairs in s2 | estimated (±15 ft) — **check against a profile drawing** |
| Cross-section | Elliptical, 24 ft 6 in (7.47 m) fore-aft × 19 ft 0 in (5.79 m) athwartships | Encyclopedia Titanica forum figures (s45) | sourced (weak source) |
| Height above boat deck | ≈ 81 ft 6 in (24.8 m) | 1912 newspaper particulars (s49) | sourced (weak). Cross-check: 175 ft (keel to top) − 92.25 ft (keel to boat deck) = 82.75 ft (`estimated`). A forum figure of 70–74 ft probably uses a different datum (`disputed`). |
| Rake | 2 in aft per 12 in of height = 9.46° from vertical | s45 | sourced (weak) |
| Colours | White Star buff ("buff") with black tops | s13 | sourced. The depth of the black band is not given; about one-fifth of the visible height is typical (`estimated`). |

### 3d. Masts

| Item | Value | Source | Confidence |
|---|---|---|---|
| Number | 2 (foremast with the crow's nest; mainmast aft) | s21 | sourced |
| Height | 155 ft (47.2 m) (s21) vs 205 ft (62.5 m) keel to top (s24) | — | disputed |
| Rake | Not found; profiles show the same rake as the funnels | — | estimated: use 9.5° (as for the funnels) |
| Foremast position | Stepped in the forward well deck, just aft of the forecastle, ≈ 130–150 ft (40–46 m) from FP | profile layout | estimated |
| Crow's nest | On the foremast, ≈ 95 ft above the waterline (not confirmed). On the night the water reached it at ≈ 02:15 as the bridge went under (s15). | — | estimated (height); sourced (event) |
| Mainmast position | In the after well deck, ahead of the poop, ≈ 740–780 ft (226–238 m) from FP | profile layout | estimated |

### 3e. Bridge, davits, lifeboats

| Item | Value | Source | Confidence |
|---|---|---|---|
| Bridge | At the forward end of the boat-deck house, ≈ 190 ft (58 m) from FP; the officers' quarters deckhouse stood just aft, with collapsibles A and B on its roof | s15 (boat stowage); s1 lengths | estimated (position) |
| Davits | 16 sets of Welin double-acting quadrant davits (one pair per boat station) | s21, s11 | sourced |
| Stations | 8 per side, in two groups of 4 (forward group alongside the officers' house, behind the bridge; aft group abreast the 3rd–4th funnel area). Odd numbers starboard, even numbers port. | s16, search summary of Encyclopedia Titanica | sourced (grouping); estimated (exact positions) |
| Boat numbering | Starboard forward 1, 3, 5, 7; starboard aft 9, 11, 13, 15; port forward 2, 4, 6, 8; port aft 10, 12, 14, 16. Nos. 1 and 2 were the emergency cutters (kept swung out). Collapsibles C and D were stowed next to boats 1 and 2; A and B were on the officers' quarters roof. | s15, s16 | sourced |
| Boats | 20: 14 wooden 30 × 9 × 4 ft (65 persons); 2 cutters 25 × 7 × 3 ft (40); 4 Engelhardt collapsibles 27.5 × 8 × 3 ft (47). Total capacity 1,178. | s15, s21 | sourced (s11 gives slightly different capacities: 35 for the cutters, 49 for the collapsibles, 1,176 in all) |
| Design capacity of the davits | Up to 48 boats (3 per davit set) per s21; up to 4 per davit per the Welin design (search summary) | s21 | disputed |

## 4. Watertight subdivision

15 transverse bulkheads, A–P (no I), give 16 compartments (s1, s2, s12).

Compartment lengths are from the BoT report (s2). Positions are cumulative from FP (`estimated` from s2 lengths; the sum is exactly 850 ft = LBP). One check: s1 puts bulkhead K 90 ft aft of amidships, i.e. 515 ft from FP; the cumulative figure is 514 ft.

| Bulkhead | From FP (ft / m) | From AP (ft / m) | From stern tip (m, est.) | Watertight to (top of bulkhead) | Source |
|---|---|---|---|---|---|
| A (collision bulkhead) | 46 / 14.0 | 804 / 245.1 | 255.1 | Extends to C deck but is watertight only to D (s1). s2 and s12 say "to C". | s1, s2, s12 |
| B | 91 / 27.7 | 759 / 231.3 | 241.3 | D | s1, s2 |
| C | 142 / 43.3 | 708 / 215.8 | 225.8 | E | s2 |
| D | 193 / 58.8 | 657 / 200.3 | 210.3 | E | s2 |
| E | 247 / 75.3 | 603 / 183.8 | 193.8 | E | s2 |
| F | 304 / 92.7 | 546 / 166.4 | 176.4 | E | s2 |
| G | 361 / 110.0 | 489 / 149.0 | 159.0 | E | s2 |
| H | 418 / 127.4 | 432 / 131.7 | 141.7 | E | s2 |
| J | 478 / 145.7 | 372 / 113.4 | 123.4 | E | s2 |
| K | 514 / 156.7 | 336 / 102.4 | 112.4 | D | s1, s2 |
| L | 583 / 177.7 | 267 / 81.4 | 91.4 | D | s2 |
| M | 640 / 195.1 | 210 / 64.0 | 74.0 | D | s2 |
| N | 703 / 214.3 | 147 / 44.8 | 54.8 | D | s2 |
| O | 757 / 230.7 | 93 / 28.3 | 38.3 | D | s2 |
| P | 814 / 248.1 | 36 / 11.0 | 21.0 | D | s2 |

Frame numbers for the bulkheads were not found in any accessible source (gap). Frames ran 156F … 148A from amidships. If the spacing were 3 ft, K would be at about frame 30A (`estimated`).

| # | Compartment | Bulkheads | Length (ft / m) | Contents (hold level) | Source |
|---|---|---|---|---|---|
| 1 | Forepeak (peak tank below, storerooms above) | stem–A | 46 / 14.0 | trimming tank | s2 |
| 2 | No. 1 hold | A–B | 45 / 13.7 | cargo; firemen's quarters above | s2 |
| 3 | No. 2 hold | B–C | 51 / 15.5 | cargo; 3rd class above | s2 |
| 4 | No. 3 hold | C–D | 51 / 15.5 | coal/cargo; mail room and baggage above | s2 |
| 5 | Boiler room No. 6 | D–E | 54 / 16.5 | 5 double-ended boilers (estimated count) | s2 |
| 6 | Boiler room No. 5 | E–F | 57 / 17.4 | boilers | s2 |
| 7 | Boiler room No. 4 | F–G | 57 / 17.4 | boilers | s2 |
| 8 | Boiler room No. 3 | G–H | 57 / 17.4 | boilers | s2 |
| 9 | Boiler room No. 2 | H–J | 60 / 18.3 | boilers | s2 |
| 10 | Boiler room No. 1 | J–K | 36 / 11.0 | 5 single-ended boilers | s2, s23 |
| 11 | Reciprocating engine room | K–L | 69 / 21.0 | 2 triple-expansion engines | s2 |
| 12 | Turbine engine room | L–M | 57 / 17.4 | low-pressure turbine | s2 |
| 13 | Electric engine room | M–N | 63 / 19.2 | dynamos | s2 |
| 14 | Shaft tunnel (refrigerated cargo above) | N–O | 54 / 16.5 | tunnel | s2 |
| 15 | Shaft tunnel (cargo above) | O–P | 57 / 17.4 | tunnel | s2 |
| 16 | After peak | P–stern | 36 / 11.0 | trimming tank, stores | s2 |

Boilers: 29 in all (24 double-ended, 5 single-ended), 159 furnaces (s21). The 5 single-ended boilers were in BR 1 (s23).

**Design rule** (all `sourced`):
- She could float with any 2 main compartments flooded (s8, s12).
- She could float with any 3 of the 4 forward compartments flooded, or with all 4 forward compartments flooded (s8). Wikipedia's lead says "up to four" (s24).
- With the 4 forward compartments plus BR 6 flooded (5 in all), the water would spill aft over the bulkheads one after another and sink her (s8).
- 12 vertical sliding watertight doors were fitted in bulkheads D–O in the boiler and engine rooms (s1).
- The E-deck openings above the bulkheads were not designed to close watertight (s12). This is what allowed the progressive spill.

## 5. Collision and flooding timeline (ship's time, 14–15 April 1912)

### 5a. Event times

| Time | Event | Source | Confidence |
|---|---|---|---|
| 23:39 | Lookout Fleet sights the iceberg ("right ahead") | s22 | sourced |
| 23:40 | Collision, at about 22 kn (s22) / "over 20 knots" (s4). The iceberg passed along the starboard side at about 37 ft/s (11.3 m/s), and the main damage was done in under 8 s (s15) / under 10 s (s4). | s4, s13, s15, s22 | sourced. disputed: the US report gives 23:46 (s12). |
| ≈ 23:45 | Engines stopped, about 5 min after the collision | s22 | sourced (approximate) |
| 23:45–23:50 | A 5° list to starboard is seen on the wheelhouse inclinometer (Hichens) | s15 | sourced |
| ≈ 00:00–00:05 | Andrews and Smith inspect; Andrews judges the first five compartments flooded and gives the ship "roughly two hours" (s22) | s22 | sourced (approximate) |
| 00:05 | Order to uncover the boats and muster passengers | s13, s22 | sourced |
| 00:15 | First CQD sent | s13 | sourced (about ±5 min) |
| 00:40–00:45 | First boat (No. 7) lowered. Wormstedt et al. give ≈ 00:40 (s16); TIS and Wikipedia give 00:45 (s13, s22). The first rockets go up ≈ 00:45. | s13, s16, s22 | disputed (by about 5 min) |
| 01:00–01:50 | Main lowering of the boats. No. 8 ≈ 01:00; No. 1 01:05; No. 6 01:10; No. 16 01:20; No. 14 01:25; Nos. 12 and 9 01:30; No. 11 01:35; Nos. 13 and 15 01:40; No. 2 01:45; Nos. 10 and 4 01:50. | s16 | sourced (approximate) |
| 01:40 | Last rocket fired | s13 | sourced |
| ≈ 02:00 | Collapsible C lowered (starboard) | s16 | sourced |
| 02:05 | **Last boat lowered from the davits: Collapsible D** (port). At this point the forecastle head was just going under (QM Bright) and A deck was close to the water on the port side (s15). | s13, s15, s16, s22 | sourced |
| 02:10 | Last wireless signal | s13 | sourced |
| ≈ 02:15 | Collapsibles A and B float off as the boat deck submerges; water at the crow's nest and over the bridge (Lightoller); the No. 1 funnel falls | s15, s16, s22 | sourced (approximate) |
| 02:17–02:18 | Lights fail. TIS gives 02:18 (s13). Halpern gives 02:17, from Symons, as the stern lifts and the hull splits (s15). | s13, s15 | sourced (by about 1 min) |
| ≈ 02:17–02:18 | Break-up begins (see section 6) | s15, s19 | estimated |
| 02:20 | Stern disappears (05:18 GMT) | s7, s13, s22 | sourced |

### 5b. Damage

| Item | Value | Source | Confidence |
|---|---|---|---|
| Side | Starboard, forward bottom | s3 | sourced |
| Height of the damage | About 10 ft (3.0 m) above the keel; no damage above this height (BoT) | s3 | sourced |
| Height in BR 5 / BR 6 | Openings about 2 ft (0.6 m) above the stokehold plates, i.e. ≈ 4.5 ft (1.4 m) above the tank top (s15). The US report puts this about 20 ft (6.1 m) below the waterline (s12). The BR 5 damage extended about 2 ft (0.6 m) aft of bulkhead E, into the forward starboard coal bunker. | s5, s12, s15 | sourced |
| Compartments opened | 6: forepeak, holds 1, 2 and 3, BR 6, and BR 5 (bunker only) | s3, s15 | sourced |
| Length of the damaged zone | disputed: **about 300 ft (91 m)** (BoT, s3; TIS, s13). **"About 500 feet"** is what the transcript of Wilding's answer Q.20422 reads (s10); that is physically impossible, since bulkhead E plus 2 ft is only ≈ 249 ft from FP. Wilding's own arithmetic in the same answer (¾ in × 200 ft ≈ 12.5 ft²) points to ≈ 200 ft. **Best estimate for the model: from ≈ 10 ft aft of FP to ≈ 249 ft aft of FP (3 → 76 m), a span of ≈ 240 ft (73 m) of intermittent openings.** | s3, s10, s13 | disputed / estimated |
| Total opening area | **≈ 12 ft² (1.1 m²)** (Wilding, from the inflow: 16,000 tons in ≈ 40 min against a ≈ 25 ft head; s10). The 1996 sub-bottom sonar survey (Matthias) found 6 narrow openings totalling ≈ 12–13 ft² (1.1–1.2 m²) (s44, s22). The longest gap was ≈ 39 ft (11.9 m), ≈ 10 ft above the keel (s22). | s10, s22, s44 | sourced (approximate) |
| Average width | ≈ ¾ in (19 mm) if the openings were spread along the whole span | s10 | sourced (Wilding's arithmetic) |
| Nature | Separate short punctures and opened seams (sprung plates, popped rivets), not one long gash | s10, s44 | sourced |
| Initial inflow | ≈ 7 long tons/s (s22); ≈ 16,000 tons in 40 min (s10); ≥ 13,500 tons in 45 min (s22) | s10, s22 | disputed (all within the same order of magnitude) |
| Total water at foundering | ≥ 35,000 long tons; displacement went from 48,300 to more than 83,000 tons | s22 | sourced (secondary) |
| Pumps | 1,700 tons/h in total | s22 | sourced (secondary) |

### 5c. Water level against time, by compartment

Heights are given as stated; the datums vary (keel / tank top ≈ keel + 5 ft / stokehold plates ≈ tank top + 2.5 ft). t = minutes after 23:40.

| t (min) | Ship's time | Compartment | Water level | Source |
|---|---|---|---|---|
| 0 | 23:40 | BR 6 | Pouring in 2 ft above the stokehold plates, starboard, aft end (Barrett) | s5, s15 |
| 0 | 23:40 | BR 5 | Stream about the size of a 3 in fire hose into the forward starboard bunker, 2 ft above the plates (Barrett) | s5, s8, s15 |
| 0–5 | — | Forepeak | Peak tank flooding fast; the storeroom above the tank still dry (Hemming) | s15 |
| 5 (BoT) / 10–15 (Halpern) | 23:45 / 23:50 | No. 2 hold | Water rushing in at the bottom of the firemen's passage (the passage wall is 3.5 ft inboard of the shell) | s5, s15 |
| ≈ 5–10 | — | No. 1 hold | 7 ft (2.1 m) of water (carpenter's report) | s5, s15 |
| 10 | 23:50 | BR 6 | 8 ft (2.4 m) above the plates (Barrett). Halpern argues this is the low (starboard) side under the 5° list, and that the port side had only ≈ 1 ft. | s5, s15 |
| 10 | 23:50 | All 5 forward compartments (not BR 5) | ≈ 14 ft (4.3 m) above the keel | s6, s8 |
| ≈ 12 | 23:52 | No. 3 hold | Within 2 ft of G deck (Boxhall) | s15 |
| ≈ 15 | 23:55 | No. 1 hold | Water on G deck around the hatch coamings | s15 |
| ≤ 20 | 00:00 | No. 1 hold | Above G deck | s6 |
| ≈ 20 | 00:00 | No. 3 hold (mail room, floor 24 ft above keel) | Mail bags afloat | s6 |
| ≈ 22 | 00:02 | No. 3 hold | Within 2 ft of F deck | s15 |
| 25–30 | 00:05–00:10 | No. 3 hold | Above G deck; 1st class baggage room flooded | s6 |
| ≈ 30 | 00:10 | No. 3 hold | About 4 ft (6 steps) below E deck (Robinson) | s15 |
| ≈ 40–45 | 00:20–00:25 | No. 2 hold / crew quarters | About 3 ft above E deck | s6, s15 |
| ≈ 60 | 00:40 | BR 6 | Probably full to E deck, the top of bulkhead E | s6, s8 |
| ≈ 60 | 00:40 | Forepeak | Full above the tank; bow under above C deck | s6 |
| 65–70 | 00:45–00:50 | E deck | Water flowing down the 1st class stairs from E to F just aft of bulkhead F; at 00:50 water on E deck up to the No. 2 funnel casing | s15 |
| ≈ 60 (BoT) / ≈ 90 (Barrett's guess) | 00:40 / 01:10 | BR 5 | Bunker door gives way and a rush of water comes between the boilers; the stokers leave. Until then the water was below the plates. | s6, s15 |
| ≈ 100 | 01:20 | BR 4 | Water rising through the floor plates at the forward end (small amounts; about 3 ft in 1 h 40 min per BoT) | s6, s8, s15 |
| ≈ 100 | 01:20 | BR 1–3, engine rooms | Dry; all personnel ordered up from the engine room at 01:20 | s6, s15 |
| ≈ 115 | 01:35 | Engine room | Wireless reports "engine room getting flooded" | s22 |
| ≈ 125 | 01:45 | Engine room | "Full up to boilers" message (the meaning is debated) | s22 |
| ≈ 140 | 02:00 | BR 4 | About half full; the 6 forward compartments full (Mengot) | s19 |

**Modern flooding simulation (Hackett & Bedford 1996, RINA; s15, s50).** The paper itself is not online, so its curve is known only through Halpern (s15) and forum summaries.
- They modelled 7 flooding conditions, C1–C7.
- C4 is at 00:40, with ≈ 5° trim. The trim then stays constant at ≈ 5° until C5 at 01:45, because the internal water had reached the outside waterline.
- Overflow of the BR 5 → BR 4 bulkhead starts at 01:45, and the final rapid phase begins.
- Their model reaches 17° by 02:15.
- Forum summaries quote their intermediate values as ≈ 2° at 30 min and > 3° at 1 h (s50; `sourced` second-hand).

### 5d. Bulkhead spill-over moments

| From → to | Over bulkhead | Time | Source | Confidence |
|---|---|---|---|---|
| No. 3 hold → aft along E deck | D (top at E) | ≈ 00:20–00:45 (water above E deck forward at 00:25) | s6, s15 | estimated |
| BR 6 → BR 5 | E (top at E) | ≈ 00:40 (BR 6 full to E deck in about 1 h) | s6 | sourced (approximate) |
| E deck → BR 4 area | F (top at E) | ≈ 00:45–00:50 (water going down the stairs aft of bulkhead F) | s15 | sourced (observation) |
| BR 5 → BR 4 | F | 01:45 (Hackett & Bedford model) / water seen in BR 4 at ≈ 01:20 (observation, possibly from below the plates) | s15 | disputed |
| BR 4 → BR 3 and aft | G, H … | after ≈ 02:00, via E deck and the down-flooding hatches; ≈ 02:15 the angle increases rapidly as water enters through the deck hatches | s19, s22 | estimated |

### 5e. Trim (bow down) and list against time

| Ship's time | Trim (° bow down) | List | Source | Confidence |
|---|---|---|---|---|
| 23:45–23:55 | ≈ 1–2° | 5° starboard (inclinometer). Calculated 5.15° from asymmetric flooding of holds 2/3 (inboard of the firemen's tunnel) and the BR 5 bunker. | s15, s22 | sourced |
| 00:10 | ≈ 2° (H&B) | starboard, reducing | s50, s15 | sourced (second-hand) |
| 00:40 | ≈ 3–5° (H&B: > 3° at 1 h; 5° at C4) | ≈ upright, then turning to port | s15, s50 | disputed |
| 01:30 | ≈ 5° (H&B); "about 10°" (s22) | port list developing (E-deck Scotland Road flooding) | s15, s22 | disputed |
| 01:50 | — | ≈ 10° port (a 2.5 ft gap between boat 10 and the ship's side) | s15 | sourced (derived from an observation) |
| 02:05 | ≈ 7° (Halpern, from observation) | ≈ 10° port | s15 | sourced |
| 02:10–02:15 | 10° (Halpern, observation) vs 17° (H&B model; also quoted by Stephenson as "more than 17° between 02:10 and 02:15") | port | s15, forum quote | disputed |
| 02:17 | ≈ 11–15° at the break (low-angle school) up to ≈ 30–45° (eyewitness high-angle) — see section 6 | ≈ 10° port at the break (Mengot) | s19, s20, s22, s26 | disputed |
| 02:18–02:20 | The stern section rights itself, then rises to near-vertical (Lightoller: "perpendicular"; Thayer: 65–70°) and sinks | stern lists hard to port | s7, s20, s25 | sourced (eyewitness) |

The 2021 Encyclopedia Titanica animation revised the trim at the boat 10 launch (≈ 01:50) from Halpern's 11° to ≈ 9° (forum summary; `sourced` second-hand). This conflicts with Halpern's 2017 figure of 7° at 02:05. Treat the 01:30–02:10 trim as a ≈ 5–10° band.

## 6. The break-up

| Item | Value | Source | Confidence |
|---|---|---|---|
| 1912 view | Both inquiries accepted Lightoller: the ship sank intact, standing perpendicular. Thayer, Joughin and Symons said she broke. | s7, s25 | sourced |
| 1985 finding | Two main pieces ≈ 600 m apart prove a break at or near the surface (Ballard) | s23 | sourced |
| Where (along the hull) | In the region of BR 1 / the 3rd funnel. Mengot puts the centre of the keel failure at **frame 25 aft**, where the double-bottom depth changes (s19). Converting: ≈ 75 ft aft of amidships ≈ **500 ft (152 m) from FP ≈ 383 ft (117 m) from the stern tip** (estimated, assuming 3 ft frame spacing). Symons put the split "abaft the after expansion plate" (s15, s25). Thayer said "well forward to midship" (s25). | s15, s19, s25 | sourced (frame) / estimated (metres) |
| Between which funnels | disputed: "between the 2nd and 3rd funnels" (s23, supported by the 2010 find of the 3rd funnel base in the debris); "between the 3rd and 4th" (older accounts). Geometry: the bow section ends ≈ 450–470 ft from FP (just aft of funnel 2), and the stern section starts ≈ 530 ft from FP (just forward of funnel 4), so the destroyed zone contains the No. 3 funnel. | s17, s18, s23 | disputed |
| Piece lengths | Bow ≈ 450 ft (137 m) (Mengot, s17) or ≈ 470 ft (140 m) (s23). Stern ≈ 350 ft (105–110 m) (s18, s23). Missing middle ≈ 60–80 ft (18–24 m) went into the debris field. | s17, s18, s23 | sourced (lengths); estimated (missing span: 882.75 − 450/470 − 350) |
| Break angle: high-angle school | Eyewitnesses: stern up 30–45° before the break (s22). Cameron's 1997 film shows ≈ 45° (s25). Final stern angle 65–70° (Thayer) or perpendicular (Lightoller). | s22, s25 | disputed |
| Break angle: Hackett & Bedford / Stephenson | Trim ≈ 17° just before the break (model, 02:15) | s15 | disputed |
| Break angle: Woytowich & Mengot (2012) | Failure starts at ≈ 17° in the bottom structure. A bottom-up break: the double bottom fails first, B deck holds last. The SciAm blog says "17° of list"; I read this as the trim angle (`estimated`). | s20, s19 | disputed |
| Break angle: low-angle school (2005–2006 expedition) | Roger Long (naval architect), from the 2005 double-bottom pieces plus a hull-girder study: **≈ 10–11°** (s26); Halpern summarises Long as 11–15° (s47). A JMS Naval Architects study commissioned for the documentary reportedly agreed (s47; second-hand). | s26, s47 | disputed |
| Break angle: other modern estimates | ≈ 15° (Maltin, "recent forensic studies", s25); forum claims of ≤ 23° (unsourced) | s25 | disputed |
| Top-down vs bottom-up | Top-down (crack starts at the upper decks near the BR 1 casing / expansion joint) is the popular theory (s22; Stephenson). Bottom-up (keel buckles first) is Mengot / Woytowich (s19, s20). | s19, s20, s22 | disputed |
| List at the break | > 10° to port | s19 | sourced (Mengot) |
| Duration of the break | ≈ 15–20 s; the stern then floated alone for ≤ 5 min (Mengot); "2–3 min" (Symons) | s19, s15 | sourced |
| Double-bottom pieces (2005) | Two large intact sections of the bottom hull, red bottom paint still visible, found in August 2005 by Chatterton and Kohler's expedition (History Channel, *Titanic's Final Moments: Missing Pieces*, aired 2006). Location: outside the main field, reportedly a few hundred yards NE of the boiler group (forum). Dimensions were not found. One piece may have been seen in the 1990s (Nargeolet / RMST). | s27, s28 | sourced (finding); gap (size) |
| "Big Piece" | ≈ 25 ft (7.6 m) wide (Mengot); the published recovered size is ≈ 15 × 25 ft (4.6 × 7.6 m), 20 t, raised in 1998 (an earlier attempt was in 1996) | s19, s23 | sourced |
| Boilers | **5 boilers** (the single-ended boilers of BR 1) fell out at the break and lie in the debris field near the stern; the rest are presumed inside the bow | s23, s29 | sourced |
| No. 1 funnel | Collapsed into the water at ≈ 02:15, before the break, landing near collapsible B and Lightoller (s22). The starboard-forward direction of the fall is my reading of that account (`estimated`). | s19, s22 | sourced (event) |
| Other large debris | A deckhouse tangle; a side section > 60 ft (18 m) long and > 40 t; bottom pieces; a bow hatch cover; a revolving door; a mast lightning rod; a turbine-room condenser section south of the stern | s29, s19 | sourced |

## 7. Descent and landing

| Item | Value | Source | Confidence |
|---|---|---|---|
| Depth of the wreck | 3,800 m (12,467 ft; WHOI rounds to 12,500 ft) | s23, NOAA via search | disputed: 3,795 m (12,451 ft) (s22); "more than 12,400 ft" (WHOI 1985, s30) |
| Descent time | Bow ≈ 5–6 min to the bottom (s22); ≈ 5 min (s17) | s17, s22 | sourced |
| Bow descent angle | ≈ 45° (Halpern & Weeks 2011, via s23) | s23 | sourced (secondary) |
| Bow motion | Repeated "tip and level" oscillation (gliding back and forth); forward speed up to ≈ 10 kn (5.1 m/s) at the peaks, average 5–6 kn; fall-to-travel ratio ≈ 6:1 | s17 | sourced (Mengot) |
| Bow impact speed | ≈ 25–30 mph (11–13 m/s) at the rear of the bow section (s17, s22); ≈ 20 kn (10 m/s) (s23) | s17, s22, s23 | disputed (within ≈ 10–13 m/s) |
| Bow attitude at impact | The bow struck forefoot-first, ploughed in, then the after part slammed down. The hull bent ≈ 6° (Ballard) to ≈ 10° (Cameron / Marschall) under the forward well-deck cranes, and ≈ 4° under the forward expansion joint. The keel fractured in 2 places. | s17, s23 | disputed (bend angle) |
| Bow burial | ≈ 60 ft (18 m) at the anchors (s17); up to 20 m (66 ft) (s22). The after end of the bow section sits almost on the mud surface. | s17, s22 | sourced |
| Bow condition | Upright and largely intact, with mud piled at the stem. Decks A, C and E compressed; the No. 2 funnel uptake partly sunk into the hull; the gymnasium roof and floor sunk into A deck; the foremast fell back onto the bridge area. | s17, s23 | sourced |
| Stern descent | Did not plane. Sank nearly vertically, rotating ("like a helicopter blade"; scour marks west of the stern, debris almost entirely east; 2010 sonar, s29). Air trapped inside imploded parts of the after hull before it was fully submerged; Mengot puts the implosion damage at ≈ 60 ft (≈ 2 atm) depth while the poop was still a third out of the water. The rudder swung to ≈ 30–45°. | s19, s23, s29 | sourced |
| Stern landing | Upright on its keel, **facing roughly opposite to the bow** (bow heading ≈ north / slightly east of north; stern ≈ south-facing). The decks pancaked to a total of ≈ 12–15 ft (3.7–4.6 m), with no single deck more than ≈ 1 ft (0.3 m) high. The poop deck is peeled back over the stern. The hull is bent ≈ 10° to starboard under the 2nd class entrance. The wing propeller shafts are pushed ≈ 25 ft (7.6 m) up, and the wing propellers bent ≈ 20° up. Buried ≈ 15 m (49 ft) at the rudder. ≈ 90 % of the shell plate has separated from the stern. | s18, s19, s22, s23 | sourced (condition); disputed (headings — mostly forum/secondary) |
| Bow–stern distance | ≈ 600 m (1,970 ft; "about 2,000 ft") (s17, s23); "half a mile" (AP 2012, s29); ≈ 650 m (s25) | — | disputed (use 600 m) |
| Bearing bow → stern | The stern lies roughly **south** of the bow (the stern is "turned opposite the bow"). No exact bearing was found. | search summaries; Maltin s25 puts the bow > 650 m north of the stern | estimated: bearing ≈ 180–190° |
| Debris field | Two main debris fields, each ≈ 600–800 m (2,000–2,600 ft) long, ≈ 5 km² (2 mi²) in all (s23). The full 2010 map covered 3 × 5 nmi (≈ 5.6 × 9.3 km) (s23) / 3 × 5 statute mi (s29). The dense core of 2 × 3 mi (3.2 × 4.8 km) was photographed (s29). | s23, s29 | disputed (units) |
| Position (bow) | 41°43′57″ N, 49°56′49″ W | s21 | sourced. Other figures in circulation: 41°43′32″ N, 49°56′49″ W (s23; probably the debris-field or stern centre); 41°43′55″ N, 49°56′45″ W; TIS gives a median 41°43′ N, 49°56′ W, ≈ 13 mi SE of the CQD position (s13). |
| Distance from land | ≈ 325 nmi (600 km) SSE of Newfoundland (s23); ≈ 370 mi (600 km) S (NOAA via search) | s23 | sourced |

## 8. On the seabed over time

| Year | Event / state | Source | Confidence |
|---|---|---|---|
| 1912 | Sank 15 April at 02:20 | s13 | sourced |
| 1985 | **Discovered 1 September 1985**, just after 01:00, when Argo (towed from R/V Knorr) imaged a boiler. Led by Robert Ballard (WHOI) and Jean-Louis Michel (IFREMER); Michel was on watch. | s30, s13 | sourced |
| 1985 state | Bow upright and largely intact. The foremast had already fallen back toward the bridge (during the sinking or impact) and lay against the bridge / port bridge area. The crow's nest was still attached, though pulled askew. The wheelhouse was gone. | s23, forum summary via search | sourced (foremast); sourced-weak (crow's nest) |
| 1986 | WHOI return with DSV Alvin and the ROV Jason Jr., 9–28 July 1986; **11 dives** (WHOI 2023 release) or 12 (older WHOI page). First crewed visit. Diana statue photographed in the debris field. The gymnasium ceiling was apparently already down, though its walls were still standing. | s31, s37, forum | disputed (11 vs 12 dives) |
| 1987 | First salvage (IFREMER / Titanic Ventures): ≈ 1,800 artefacts | s32 | sourced |
| 1987 | Ballard coins the term "rusticles" | s23 | sourced |
| 1991 | Kristof photos: rust in cabins, the bow railing intact, a fallen bench | s32 | sourced |
| 1993–1996 | RMST salvage trips (≈ 2,200 more artefacts) | s32 | sourced |
| 1996 | Matthias sub-bottom sonar survey of the buried starboard bow (6 slits); first attempt to lift the "Big Piece" | s44, s23 | sourced |
| 1995–2005 | Cameron expeditions (1995, 2001, 2005). The bulkhead that exposed the captain's cabin was damaged during the 1995 expedition (s23). | s23 | sourced |
| 1998 | "Big Piece" raised | s23 | sourced |
| 2003–2004 | NOAA expeditions (2003: 4 dives in 2 days, stern and microbes; 2004: 11 days of mapping) | s23 | sourced |
| ~2000s | Crow's nest gone. Ballard (2012) blamed submersibles knocking it off; others cite corrosion. Reported as "vanished" by 2019. | s32, s48 | disputed (cause and date) |
| 2005 | Two double-bottom sections found (section 6) | s27, s28 | sourced |
| 2010 | **Halomonas titanicae** described (isolated from rusticles; Sánchez-Porro, Kaur, Mann, Ventosa; IJSEM 60:2768–2774; online Jan 2010, press Dec 2010). Rusticles hold ≥ 27 bacterial strains. | s34, s35, s36 | sourced |
| 2010 | RMST / WHOI / Waitt expedition, summer 2010. Two AUVs mapped the whole site with side-scan sonar (3 × 5 mi); 130,000+ photos of the 2 × 3 mi core; published March 2012. Shows the stern's rotation and 5 boilers. | s29, s23 | sourced |
| 2010 | Collapse forecasts made (section 9) | s32, s36 | sourced |
| 2012 | Wreck turns 100 and comes under the UNESCO 2001 Convention (15 April 2012) | s42 | sourced |
| 2019 | Caladan Oceanic / Triton (DSV Limiting Factor), 5 dives in early August 2019; first crewed visit in about 14–15 years (Atlantic Productions filmed). **The starboard side of the officers' quarters (where the captain's quarters were) is collapsing**; the captain's bathtub is gone (Stephenson). The deck house on that side is collapsing and taking the staterooms with it. The sloping lounge roof is also near collapse. | s33, search summaries | sourced. Note: a 2021 expedition reported that the bathtub was hidden under debris, not lost (s23) — disputed. |
| 2021–2022 | OceanGate dives. A forum report from 2022 says the officers' quarters had "completely collapsed" (unverified). | forum | disputed |
| 2022 | **Full digital scan** by Magellan Ltd with Atlantic Productions, summer 2022: a six-week expedition, ROVs "Romeo" and "Juliet", ≈ 700,000–715,000 images, > 16 TB, 7 months of processing. **Published 17–18 May 2023 (BBC).** The bow railing was still standing in 2022. | s38, s39, s37 | sourced |
| 2023 | Titan submersible implosion near the wreck, June 2023 (5 dead, including P.-H. Nargeolet) | s37 | sourced |
| 2024 | RMST imaging expedition (20 days, ended 9 August 2024; > 2 million images; LiDAR, sonar). **A ≈ 15 ft (4.6 m) section of the port bow railing has fallen** to the seabed directly below in one piece. Bowing and thinning metal elsewhere on the forward structure. The bronze Diana of Versailles statue (≈ 2 ft / 0.6 m) found again in the debris field (last seen 1986). Results published 2 September 2024. | s37 | sourced |
| Ongoing | Corrosion rate ≈ 400 lb (180 kg) of iron per day (Cullimore). Rusticle mass on the bow ≈ 650 t. The 2nd class entrance on the stern has dropped ≈ 20 ft (6 m) since 1986 (Mengot). The stern's A and boat decks are now nearly flat on D deck. | s23, s18 | sourced (secondary) |

## 9. Projections of collapse

| Who | When said | Prediction | Source | Confidence |
|---|---|---|---|---|
| Henrietta Mann (Dalhousie) | 1995 | About 30 more years (i.e. ~2025) | s36 | sourced |
| Henrietta Mann | Dec 2010 | "15 to 20 years" more (2025–2030) | s36 | sourced |
| Henrietta Mann (BBC) | 2010 | Possibly gone as soon as 2030 | s23 | sourced (secondary) |
| Mann and Kaur (with Seville) | 2016 report | The wreck may not exist by 2030 (s23 renders this as 2037) | s23 | disputed (2030 vs 2037) |
| Bill Lange (WHOI) | 2010 | Some expected the bow to collapse "in a year or two"; others said it could last centuries | s32 | sourced |
| Unnamed scientists | 2017 | No longer than 14 years (≈ 2031) | s23 | sourced (secondary) |
| Roy Cullimore | 1990s | ≈ 50 % of the hull gone within 200 years | s23 | sourced (secondary) |
| NOAA | n.d. | The hull "may collapse to the ocean floor within the next 50 years" | s23 (quoting NOAA) | sourced (secondary) |
| Parks Stephenson / Clare Fitzsimmons | 2019 | The decks will keep collapsing over the coming decades; deterioration will continue | s33 | sourced |
| RMST | 2024 | The forward structure is bowing and thinning (no date given) | s37 | sourced |

Model suggestion (`estimated`): put the deck-house collapse at 2019–2035, the bow upper decks at 2030–2060, and the bow hull girder (the "pile of rust") at 2050–2200. The spread reflects the 2010–2017 forecasts and the 50-year NOAA figure.

## 10. Memorial facts

### Death toll

| Figure | Who | Source |
|---|---|---|
| 1,490 lost (2,201 aboard, 711 saved) | British Wreck Commissioner's report, 1912 | s9 |
| 1,503 | British Board of Trade return (cited by Walter Lord) | s22 |
| 1,517 lost (2,223 aboard, 706 saved) | US Senate report, 1912 | s11 |
| 1,496 lost, 712 saved (2,208 aboard from Queenstown) | Titanic International Society (Bracken & Findlay) / modern research | s13, s22 |
| 1,635 | Some early figures (cited by Lord) | s22 |

Range: **1,490–1,517** (official 1912). Modern consensus ≈ 1,496 (`disputed`).

### Legal protection

| Instrument | Dates | Source | Confidence |
|---|---|---|---|
| RMS Titanic Maritime Memorial Act (US) | Signed 21 October 1986 | s23 | sourced |
| NOAA Guidelines for research, exploration and salvage | 2001 (non-binding) | s40 | sourced |
| Agreement Concerning the Shipwrecked Vessel RMS Titanic (UK–US; negotiated with Canada and France 1997–2000) | Opened at London 6 Nov 2003; UK signed 2003. The US signing date was not confirmed (2004 is often cited). US implementing law enacted 2017. US acceptance deposited, and **in force, 18 November 2019**. Announced January 2020. Only the UK and US have ratified. | s40, s41, s43 | sourced |
| UNESCO 2001 Convention on the Protection of the Underwater Cultural Heritage | Covers the wreck from **15 April 2012** (100 years under water). The US, UK and Canada are not parties, so its practical reach over this site is limited. | s42, s32 | sourced |
| RMST salvor-in-possession | Granted by a US federal court in 1994; a 1999 appeal ruling said this does not give exclusive rights to view or photograph the wreck | s23, search summary | sourced |

## 11. Conflicts and gaps

1. **Collision time**: 23:40 (BoT) vs 23:46 (US Senate). The ship-time offset to NY is +2 h 02 (Halpern) vs +1 h 33 (US report).
2. **Length of the damaged zone**: ≈ 300 ft (BoT) vs "500 ft" in Wilding's transcript (s10; impossible) vs ≈ 200 ft implied by his own ¾ in × 12 ft² arithmetic. The model should use the geometry: FP + ~10 ft to bulkhead E + 2 ft.
3. **Moulded depth**: 59 ft 6 in vs 64 ft 3 in vs 64 ft 9 in, depending on the deck and datum.
4. **Mast height**: 155 ft vs 205 ft (keel to top). Mast positions and rake are not published.
5. **Funnel positions and heights**: no primary source was found online; the positions given here are estimates from the boiler-room layout. The height above the boat deck is 81.5 ft (1912 press), consistent with the 175 ft keel-to-top figure.
6. **No public offsets table / lines plan**; there is also no published Cb (computed here ≈ 0.67–0.68).
7. **Frame numbers of the bulkheads**: not found (only the 156F–148A range).
8. **Trim against time**: Hackett & Bedford's model (5° from 00:40 to 01:45, 17° at 02:15) vs Halpern's observations (7° at 02:05, 10° at 02:15) vs Wikipedia (≈ 10° at 01:30).
9. **Break angle**: 1912 "intact / perpendicular" → eyewitness 30–45° → film 45° → 17° (H&B model; Woytowich / Mengot) → 15° (Maltin) → 11–15° (Long 2006). No consensus.
10. **Break location**: "between funnels 2 and 3" vs "3 and 4". Top-down vs bottom-up.
11. **2005 double-bottom pieces**: sizes not published in an accessible source.
12. **Bow / stern headings and the exact bearing between them**: only secondary or forum sources (bow ≈ N to NNE; stern opposite, roughly south).
13. **Depth**: 3,784–3,800 m across sources.
14. **2019 captain's quarters**: "bathtub gone" (2019, Stephenson) vs "obscured by debris" (2021).
15. **1986 Alvin dives**: 11 vs 12.
16. **Hackett & Bedford 1996** (RINA Transactions) is not freely online; its numbers are known only through Halpern and forum quotes.
17. **Collapse forecasts** range from "already overdue" (Mann's 1995 forecast) to centuries.

## 12. Sources

| id | Title | URL | Publisher | Year |
|---|---|---|---|---|
| s1 | British Wreck Commissioner's Inquiry Report — Detailed Description | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepTitanic.php | HMSO (via titanicinquiry.org) | 1912 |
| s2 | BWC Report — Watertight Compartments | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepWC.php | HMSO | 1912 |
| s3 | BWC Report — Extent of the Damage | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepExtent.php | HMSO | 1912 |
| s4 | BWC Report — Time in which the Damage was done | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepTime.php | HMSO | 1912 |
| s5 | BWC Report — The Flooding in the first 10 Minutes | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepFlooding.php | HMSO | 1912 |
| s6 | BWC Report — Gradual Effect of the Damage | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepGradEff.php | HMSO | 1912 |
| s7 | BWC Report — Final Effect of the Damage | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepFinEff.php | HMSO | 1912 |
| s8 | BWC Report — Observations | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepObserv.php | HMSO | 1912 |
| s9 | BWC Report — Numbers Saved | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepSaved.php | HMSO | 1912 |
| s10 | BWC Inquiry Day 19 — Edward Wilding testimony (Q.20422–20425) | https://www.titanicinquiry.org/BOTInq/BOTInq19Wilding03.php | HMSO | 1912 |
| s11 | US Senate Inquiry Report — General Particulars / Summary of Passengers and Survivors | https://www.titanicinquiry.org/USInq/USReport/AmInqRep03.php | US Senate | 1912 |
| s12 | US Senate Inquiry Report — Collision / Flooding | https://www.titanicinquiry.org/USInq/USReport/AmInqRep05.php | US Senate | 1912 |
| s13 | Titanic fact sheet (John P. Eaton) | https://titanicinternationalsociety.org/wp-content/uploads/2020/02/titanic-fact-sheet.pdf | Titanic International Society | 2020 (upload) |
| s14 | Titanic basic facts | https://trmaarchive.com/basic.shtml | Titanic Research & Modeling Association | n.d. |
| s15 | S. Halpern, "Angles of Trim and Heel" (rev. Aug 2017; appendix with C. Weeks) | http://www.titanicology.com/Titanica/TrimAndHeel.pdf | titanicology.com / Encyclopedia Titanica | 2017 |
| s16 | B. Wormstedt, T. Fitch, G. Behe, "Titanic: The Lifeboat Launching Sequence Re-Examined" | http://wormstedt.com/Titanic/lifeboats/lifeboatarticle.htm | wormstedt.com (orig. THS Commutator) | 2001, rev. 2023 |
| s17 | R. Mengot, "The Bow Section" | https://wormstedt.com/RoyMengot/TitanicWreck/BOW/bow.html | Roy Mengot / wormstedt.com | 2012 |
| s18 | R. Mengot, "The Stern Section" | https://wormstedt.com/RoyMengot/TitanicWreck/STERN/stern.html | Roy Mengot / wormstedt.com | 2012 |
| s19 | R. Mengot, "Breakup" | https://wormstedt.com/RoyMengot/TitanicWreck/BREAKUP/Breakup.html | Roy Mengot / wormstedt.com | 1997/2012 |
| s20 | R. Woytowich, "How did Titanic really break up?" | https://www.scientificamerican.com/blog/guest-blog/how-did-titanic-really-break-up/ | Scientific American (guest blog) | 2012 |
| s21 | "Titanic" | https://en.wikipedia.org/wiki/Titanic | Wikipedia (secondary) | accessed 2026 |
| s22 | "Sinking of the Titanic" | https://en.wikipedia.org/wiki/Sinking_of_the_Titanic | Wikipedia (secondary) | accessed 2026 |
| s23 | "Wreck of the Titanic" | https://en.wikipedia.org/wiki/Wreck_of_the_Titanic | Wikipedia (secondary) | accessed 2026 |
| s24 | "Olympic-class ocean liner" | https://en.wikipedia.org/wiki/Olympic-class_ocean_liner | Wikipedia (secondary) | accessed 2026 |
| s25 | T. Maltin, "Titanic broke in half as she sank – true or false?" | https://timmaltin.com/2019/05/01/titanic-broke-in-half/ | timmaltin.com | 2019 |
| s26 | "New theory on Titanic offered" (Roger Long) | https://www.sunjournal.com/2006/02/24/new-theory-titanic-offered/ | Sun Journal (Maine) | 2006 |
| s27 | "Divers' new evidence may rewrite Titanic story" | https://www.historynewsnetwork.org/article/26094 | History News Network | 2006 |
| s28 | "Titanic's Final Moments: Missing Pieces" | https://history.com/specials/titanics-final-moments-missing-pieces | History Channel | 2006 |
| s29 | "Full Titanic wreck site is mapped for 1st time" (AP) | https://www.cbsnews.com/news/full-titanic-wreck-site-is-mapped-for-1st-time/ | CBS News / Associated Press | 2012 |
| s30 | "1985 Discovery of RMS Titanic" | https://www.whoi.edu/know-your-ocean/ocean-topics/ocean-human-lives/underwater-archaeology/rms-titanic/1985-discovery-of-rms-titanic/ | WHOI | n.d. |
| s31 | "1986 Return to the RMS Titanic" | https://www.whoi.edu/ocean-learning-hub/ocean-topics/ocean-human-lives/underwater-archaeology/rms-titanic/1986-return-to-the-rms-titanic/ | WHOI | n.d. (2023 footage release) |
| s32 | "What we've learned—and lost—since the Titanic wreck was found" | https://www.nationalgeographic.com/history/article/titanic-wreck-site-history | National Geographic | 2024 |
| s33 | "Titanic dive" press release (Fitzsimmons, Stephenson) | https://www.ncl.ac.uk/press/articles/archive/2019/08/titanicdive/ | Newcastle University | 2019 |
| s34 | Sánchez-Porro C., Kaur B., Mann H., Ventosa A., "Halomonas titanicae sp. nov." IJSEM 60:2768–2774 | https://pubmed.ncbi.nlm.nih.gov/20061494/ | Int. J. Syst. Evol. Microbiol. (Microbiology Society) | 2010 |
| s35 | "New species of bacteria found on Titanic" | https://sciencedaily.com/releases/2010/12/101206093225.htm | ScienceDaily (Dalhousie release) | 2010 |
| s36 | "New species of rust-eating bacteria destroying Titanic" | https://www.nbcnews.com/id/wbna40533835 | NBC News | 2010 |
| s37 | "Titanic expedition yields lost bronze statue, high-resolution photos and other discoveries" (AP) | https://www.news4jax.com/news/2024/09/02/titanic-expedition-yields-lost-bronze-statue-high-resolution-photos-and-other-discoveries/ | Associated Press (syndicated) | 2024 |
| s38 | "See the Titanic in Stunning Detail With New 3D Scan" | https://www.smithsonianmag.com/smart-news/titanic-3d-scan-images-180982219/ | Smithsonian Magazine | 2023 |
| s39 | "First full-sized 3D scan of the Titanic shipwreck captured" | https://www.aljazeera.com/news/2023/5/17/first-full-sized-3d-scan-of-the-titanic-shipwreck-captured | Al Jazeera | 2023 |
| s40 | Agreement Concerning the Shipwrecked Vessel RMS Titanic, UK Treaty Series 8.2019; NOAA Titanic pages | https://treaties.fcdo.gov.uk/data/Library2/pdf/TS%208.2019%20Agreement%20concerning%20Shipwrecked%20Vessel%20RMS%20Titanic.pdf ; https://noaa.gov/node/10830 | FCDO / NOAA | 2019 |
| s41 | "Agreement Concerning the Shipwrecked Vessel RMS Titanic" | https://en.wikipedia.org/wiki/Agreement_Concerning_the_Shipwrecked_Vessel_RMS_Titanic | Wikipedia (secondary) | accessed 2026 |
| s42 | "Titanic wreckage to be protected under UNESCO convention" | https://news.un.org/en/story/2012/04/408092 | UN News | 2012 |
| s43 | "Titanic Wreckage Now Protected Under U.S.-U.K. Deal That Was Nearly Sunk" | https://www.npr.org/2020/01/21/798168753/titanic-wreckage-now-protected-under-u-s-u-k-deal-that-was-nearly-sunk | NPR | 2020 |
| s44 | "Did small holes in hull doom Titanic?" / "Small holes, not big gash, doomed Titanic" | https://www.deseret.com/1997/4/8/19305597/did-small-holes-in-hull-doom-titanic/ ; https://www.tampabay.com/archive/1997/04/09/small-holes-not-big-gash-doomed-titanic/ | Deseret News / Tampa Bay Times (AP) | 1997 |
| s45 | "What height are Titanic's funnels?" and funnel threads (24'6" × 19'; 2 in/ft rake) | https://www.encyclopedia-titanica.org/what-height-are-titanics-funnels.html | Encyclopedia Titanica (blocked to fetch; figures via search summary) | n.d. |
| s46 | Titanic ship fact file ("elliptical" stern) | https://titanicbelfast.com/Discover/Ship-Fact-Files/Titanic.aspx | Titanic Belfast | n.d. |
| s47 | S. Halpern, "Why A Low Angle Break?" | http://www.titanicology.com/Titanica/LowAngleBreak.pdf | titanicology.com / Encyclopedia Titanica | n.d. (~2008) |
| s48 | "Titanic's wreckage deteriorating as ocean reclaims once-grand ship" | https://www.pressreader.com/usa/houston-chronicle/20190823/281573767352607 | Houston Chronicle (AP) | 2019 |
| s49 | 1912 newspaper particulars (funnel 81 ft 6 in above the boat deck) | https://historicnewspapers.sc.edu/lccn/sn86063785/1912-04-26/ed-1/seq-1/ | Univ. of South Carolina Libraries (1912 paper) | 1912 |
| s50 | Encyclopedia Titanica forum: Hackett & Bedford 1996 trim figures ("Affecting Titanic's Trim") | https://www.encyclopedia-titanica.org/community/threads/affecting-titanics-trim.9618/ | Encyclopedia Titanica forum (weak) | n.d. |

Notes on access: Encyclopedia Titanica article pages returned HTTP 403 and WHOI pages failed TLS for the fetch tool, so figures from those sites (s30, s31, s45, s50) were taken from search-result summaries and are weaker than the titanicinquiry.org transcripts. Wikipedia (CC BY-SA) is used only as a secondary pointer; no text was copied from it.
