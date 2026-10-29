# HMHS Britannic: research notes for the time model

Compiled 2026-10-29 for the Elapse skill. Every sentence is my own summary; no source text or images are copied.
Source ids (s1, s2 …) point to section 9. Confidence values:
- `sourced`: stated in the cited source.
- `estimated`: my inference; the basis is given.
- `disputed`: sources disagree; the competing figures and who holds them are listed.

Reading of the request: **HMHS Britannic (1914–1916)**, the third Olympic-class liner of the White Star Line, completed as a
hospital ship and sunk by a mine in the Kea Channel, Aegean Sea, on 21 November 1916. Not the 1874 White Star *Britannic* (I)
nor the 1930 motor ship *Britannic* (III). Sinking more than 50 years ago, not a politically disputed warship incident, so the
refusal rule does not apply. Steel, powered, 1914: inside the tuned range.

Conventions: FP = forward perpendicular (taken as the stem). Ship's time (local) as given by the sources. 1 ft = 0.3048 m.

---

## 1. The ship

| Item | Value | Source | Confidence |
|---|---|---|---|
| Length overall | 269.1 m (882 ft 9 in) | s1 | sourced. s2 gives 903 ft (probably a rounded or different measure); s3 gives a registered length of 259.8 m. Gate 1 uses 269.1. |
| Beam | 28.65 m (94 ft) | s1, s2 | sourced. 1 ft 6 in wider than Olympic/Titanic (s1). |
| Moulded depth | 19.66 m (64 ft 6 in) | s1 | sourced. s2 lists "59 ft" under "draft (or depth)": the depth of hold, a different measure. The hull piece's top is this depth (about C deck); B deck and above are drawn as superstructure. |
| Draught (load) | 10.5 m (34 ft 7 in) | s1 | sourced. The draught on 21 Nov 1916 is not recorded; outbound to Mudros with no patients aboard, I use 9.5 m (estimated). |
| Gross tonnage | 48,158 GRT | s1, s2, s3 | sourced |
| Keel to funnel tops | 53.3 m (175 ft) | s1 | sourced |
| Speed | 21 kn service, 23 kn max; "full speed" into the Kea Channel that morning | s1 | sourced (speed at the moment of the explosion: about 10.5 m/s, estimated from "full speed") |
| People aboard | 1,066 (673 crew, 315 RAMC, 77 nurses, the captain) | s1 | sourced |
| Livery | White hull, a horizontal green band and large red crosses (s1); the Hague Convention X (1907) art. 5 fixes white with a green band about 1.5 m wide for military hospital ships (s8). Funnels buff with black tops (White Star colours; no source found for the hospital-ship period, estimated). | s1, s8 | sourced (white/green/crosses); estimated (band height on the hull, number and position of crosses, funnel colours) |

### Hull form
No lines plan is public. Built with `linerOffsets` from the dimensions and the sister ship's form (as in the Titanic example:
parallel 0.36, bilge radius 2.2 m, counter stern overhang about 10 m, straight stem): **estimated**.

### Superstructure (positions from the sister ship's profile, estimated ±5 m)
- B deck (enclosed, white) from about 48 m to 222 m aft of FP; A deck from 58 m to 210 m; boat-deck houses as on Titanic.
  Deck spacing 9 ft (2.74 m) per deck (sister ship s10): estimated for Britannic.
- Four funnels (No. 4 a dummy), elliptic, positions as Titanic (76, 110, 142, 177 m aft of FP): estimated.
- Foremast about 46 m, mainmast about 232 m aft of FP: estimated.
- **Gantry davits:** eight sets designed, five fitted before war service, "several" abreast of the funnels; the rest of the
  boats on hand-worked Welin davits (s1). Positions of the five: estimated (two pairs abreast funnels 1 and 3/4, one on the
  after deckhouse). Boats are not drawn (respect rule).

### Subdivision
- **Count:** s1 gives 15 bulkheads; another summary (Britannica, via search) gives 17 compartments, i.e. one extra bulkhead.
  A 1914 Times report (via search) says an extra bulkhead was added. **Disputed** (15 vs 16 bulkheads). Model: the Titanic A–P
  positions (s9, sister ship) plus one extra bulkhead in the electric engine room (estimated position).
- **Heights:** five (s1 sinking section; Britannica) or six (s1 characteristics section) bulkheads raised from E deck to B deck:
  **disputed**. Which ones is not stated in any source found. Model: E, F, G, H, J (the boiler-room bulkheads) to B deck,
  A–B and K–P to D deck, C–D to E deck (estimated, following Titanic's heights for the rest, s9).
- She could float with **six** compartments flooded (s1).
- Double hull added along the boiler and engine rooms (s1): not drawn separately.
- Deck heights above the keel amidships (sister ship, s10): E 13.8 m, D 16.5 m, C 19.7 m, B ≈ 22.4 m. Estimated for Britannic.

## 2. The sinking (21 November 1916, ship's time)

| Time | What | Source | Confidence |
|---|---|---|---|
| morning | Northbound in the Kea Channel at full speed, bound for Mudros | s1, s2, s3 | sourced |
| 08:12 | Explosion, starboard bow between holds 2 and 3; a mine laid by U-73 on 21 Oct 1916 (s1; s2: U-73's 22 Oct–7 Nov patrol, 12 mines in the channel) | s1, s2, s3 | sourced (time); the mine date differs by a day between s1 and s2 |
| 08:12 + | Bulkhead between hold 1 and the forepeak damaged; the first four compartments flood rapidly; the firemen's tunnel to boiler room 6 damaged, water enters BR6 | s1 | sourced |
| 08:14 | BR6 and BR5 evacuated two minutes after the blast; the watertight door between BR6 and BR5 fails to close, water enters BR5 → six compartments open, the design limit | s1 | sourced |
| ~08:16 | Bartlett turns to starboard toward Kea to beach her; the steering gear is out, so he steers by running the port shaft faster | s1, s2 | sourced (time estimated) |
| ~08:22 | About ten minutes in, she is about where Titanic was an hour after the iceberg | s1 | sourced (comparison) |
| 08:27 | E-deck portholes forward under water about 15 minutes after the blast; most had been opened by nurses to air the wards | s1 | sourced |
| (no time) | Water gets aft past BR5 into BR4 (beyond the six-compartment limit) | s1 | sourced (fact); estimated (08:45) |
| (no time) | Two port lifeboats lowered without orders are drawn into the turning propellers; 30 die; Bartlett stops the engines | s1 | sourced (fact); estimated (~08:35) |
| 08:50 | 35 boats away; evacuation halted; engines restarted to try for the shore | s1 | sourced |
| 09:00 | Flooding reaches D deck; engines stopped; two long blasts to abandon ship | s1 | sourced |
| ~09:00–09:07 | She rolls over to starboard; the funnels fall one after another; the bow hits the seabed while the stern is still above water, badly damaging the bow | s1, s6 | sourced (order); estimated (times, angles) |
| 09:07 | Gone, 55 minutes after the explosion | s1, s2 | sourced (s3: "moments after 9 a.m.") |

**Angles:** no list or trim in degrees is recorded. Estimated: trim and list grow slowly to about 11° and 14° by 09:00
(D deck flooded forward), then the roll. For the bow to reach ~120 m while the stern is still out, the trim must be at
least asin(120/269) ≈ 26.5° along the keel if she were upright; with her heavily listed, about 25° trim and 40° list
at the moment of the strike (estimated).

**Track:** the explosion position and the path to the wreck are not recorded (s2: the wreck lies 6.75 nm from her first
reported position). Course northbound (s1, s3); turned to starboard toward Kea (s1); the wreck lies bow toward the south
(s4). Path, speeds and headings in between: estimated.

## 3. The wreck

| Item | Value | Source | Confidence |
|---|---|---|---|
| Position | 37°42′05″N 24°17′02″E, off Kea | s1 | sourced |
| Depth | seabed about 118–122 m (s1 122, s2 117, s4 116–120, s6 118); highest parts about 90 m (s6), rising about 30 m off the seabed (s5) | s1, s2, s4, s5, s6 | sourced; model 120 m |
| Attitude | on her starboard side (s1, s4), bow toward the south (s4) | s1, s4 | sourced |
| Bow | heavily deformed, attached only by parts of C deck; a large hole beneath the forward well deck; the mine hole is hidden under her | s1 | sourced. Drawn as a ~12° bend of the part forward of bulkhead C (43 m aft of FP, where the mine struck), hinged at the deck line: estimated |
| Funnels | No. 1 a few metres from the boat deck; Nos 2–4 in the debris field off the stern | s1 | sourced (positions on the seabed estimated) |
| Foremast | bent, lying near the wreck with the crow's nest attached; the crow's-nest bell lay below it | s1, s5 | sourced |
| Burial | not recorded; 2 m into the sand for the hull, 4 m for the bow (estimated) | — | estimated |

### Dated states and visits
| Date | What | Source | Confidence |
|---|---|---|---|
| 1975 | Found by Jacques Cousteau's team (Calypso). **Date disputed:** 13 Nov 1975 (s1), 3 Dec 1975 (several, via search), 4 Dec 1975 (s2). Model: 3 Dec. | s1, s2 | disputed |
| 1976 | Cousteau's divers first enter the wreck | s1 | sourced |
| 1995 | Robert Ballard visits; finds the funnels in surprisingly good condition | s1 | sourced |
| Aug 1996 | Simon Mills buys the wreck; still the owner | s1 | sourced |
| 2012 (May) | "Project Britannic": samples of water, sediment and organisms to study how the wreck decays | s4 | sourced |
| 2016 | A submersible finds an open shell door on E deck | s5 | sourced |
| 2019 | Divers spot the crow's-nest bell on the sand | s1, s5 | sourced |
| 2022 | Greece opens the wreck's exterior to licensed recreational dives; no entry, no removal | s11 | sourced (month approximate: article of 15 Jun 2022) |
| May 2025 | First authorised recovery: the crow's-nest bell (~70 kg), the port running light, Turkish-bath tiles, bottles, crockery; for the Museum of Underwater Antiquities, Piraeus | s5, s7 | sourced |

**Decay:** no dated collapse of any part has been published in what I found. The 2025 survey describes heavy marine growth
and calls her the best preserved of the big liners (s6). Rust levels in the model are estimated only.

## 4. Projections

None with a date or range. Kohler (s5) says only that she will "inevitably" collapse. So `projection` is **off** and the bar
ends at 2026.

## 5. Memorial and legal facts

- Deaths: 30 (s1, s3: 21 crew and 9 RAMC); s2 says sources vary between 21 and 41. Survivors 1,036 (s1).
- Protection: a monument under the Greek Ministry of Culture (Ephorate of Underwater Antiquities); access governed by Law
  3409/2005 and later rules (s12); exterior-only licensed dives since 2022 (s11). Owner: Simon Mills (s1).

## 6. Conflicts and gaps (summary)

- Bulkhead count (15/16) and how many reached B deck (5/6), and which: disputed/estimated.
- Discovery date: disputed.
- No angles, no water levels per compartment, no track: all estimated.
- No dated decay record: the seabed chapters show visits, not collapses.

## 9. Sources

| id | Title | URL | Publisher | Year |
|---|---|---|---|---|
| s1 | HMHS Britannic (cites Chirnside 2011; Mills) | https://en.wikipedia.org/wiki/HMHS_Britannic | Wikipedia | 2026 |
| s2 | Britannic (II) | https://www.titanicinquiry.org/ships/britannicii.php | Titanic Inquiry Project | n.d. |
| s3 | Britannic | https://www.wreckdiving.gr/wreck/britannic | wreckdiving.gr | n.d. |
| s4 | Project Britannic | https://divernet.com/scuba-diving/general-wrecks/project-britannic/ | Divernet | 2012 |
| s5 | Inside Britannic: permits, politics and the physics of a 120-metre mission | https://indepthmag.com/inside-britannic-permits-politics-and-the-physics-of-a-120-meter-mission/ | InDepth | 2025 |
| s6 | As time goes by: Britannic 109 years later | https://indepthmag.com/as-time-goes-by-britannic-109-years-later/ | InDepth | 2025 |
| s7 | Divers recover artifacts from the Titanic's sister ship Britannic for the first time | https://www.news4jax.com/news/world/2025/09/16/divers-recover-artifacts-from-the-titanics-sister-ship-britannic-for-the-first-time/ | Associated Press | 2025 |
| s8 | Hague Convention (X) of 1907, art. 5 | https://avalon.law.yale.edu/20th_century/hague10.asp | Avalon Project, Yale | 1907 |
| s9 | British Wreck Commissioner's Inquiry: Watertight Compartments (sister ship) | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepWC.php | HMSO | 1912 |
| s10 | British Wreck Commissioner's Inquiry: Detailed Description (sister ship) | https://www.titanicinquiry.org/BOTInq/BOTReport/botRepTitanic.php | HMSO | 1912 |
| s11 | Diving tourism: 11 Greek shipwrecks now open for visits | https://news.gtp.gr/2022/06/15/diving-tourism-11-greek-shipwrecks-now-open-for-visits/ | GTP | 2022 |
| s12 | Kea Underwater Historic Site: legal framework | https://keadivers.com/kea-underwater-historic-site/85-legal-framework.html | Kea Divers | n.d. |
