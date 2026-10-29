# Researching a sinking

You need four kinds of fact. For each one, write down where it came from as you go.

## 1. The ship

- **Official dimensions:** length overall, beam, moulded depth, draught, gross tonnage. Gate 1 compares the hull with these (±0.5%).
  - **Where:** the builder's figures, classification records, encyclopedias that cite them, and museum pages.
- **Hull form:** an offsets table is rarely public. Build one from:
  - the midship section (a near-box with a round bilge on most steel liners and cargo ships)
  - the length of the parallel mid-body
  - how fine the ends are (published block coefficient, profile drawings, sister ships)

  Mark the hull `estimated` in its notes, and say which figures are sourced.
- **Above the hull:** deck heights, superstructure extent, funnels (count, positions, size, rake, colours), masts. Profile drawings give positions, so measure them in proportion and mark them estimated.
- **Subdivision:** bulkhead positions and the decks they reached, and compartment names. The classification society or the inquiry reports usually state them.

## 2. The accident

- **Wartime and naval losses** often have no public inquiry: use admiralty or navy records, naval-history archives, survivors' accounts, the standard monographs and later dive reports. When levels per compartment are unknown, record which compartments flooded and estimate the levels.
- **Official inquiries** are the core when they exist: their timelines, testimony and findings (times are ship's time).
  - Titanic: the British Wreck Commissioner and the US Senate inquiry (titanicinquiry.org).
  - Lusitania: the Mersey inquiry.
- **Modern analyses** add flooding rates and angles: naval architects' papers, marine forensics panels. When an analysis is a simulation, its numbers are `estimated` with that source.
- **Water per compartment:** take each level against time where testimony or a simulation gives it. Between those points, interpolate and mark the result `estimated`. Water never falls before the break. When it rises past a bulkhead top, add an `overflow` event at that moment.
- **Disputed points** (break angle, exact damage): pick the most widely supported view, mark it `disputed`, and write the alternatives in one line each, with who holds them.

## 3. The wreck

- **Discovery and later expeditions:** these give dated states such as what had already collapsed and what fell later. Use NOAA, oceanographic institutes, expedition reports and reputable news.
- **Unrecorded burial:** use 0.5–2 m, estimated.
- **Layout:** depth, position, the distance and bearing between large pieces, the debris field size, and how deep pieces are buried (`embed`).
- **Decay:** rust and rusticles, and the organisms that eat the iron. Each dated collapse becomes a `collapse` event.

## 4. Projections and memorial facts

- **Predictions** of collapse are `projection`. Show them as a range, with who made them.
- **The death toll:** give the range across sources when they differ. Write it plainly in `meta.about`, in one or two sentences.
- **Legal protection** of the site (conventions, agreements): write one sentence in `meta.about`.

## Licence

- **Facts only.** Take sizes, times, counts, order and names. Many sources (encyclopedias, expedition and teardown sites) are under licences such as CC BY-SA or CC BY-NC-SA, or are copyrighted.
- **Link the original publisher.** A source's url is the publisher's own page (the newspaper, the archive, the institute), never a mirror, scraper, proxy or cache host.
- **Write every sentence yourself.**
- **Never embed or download photos, scans, sonar images, video frames or plan drawings.** Sources appear on the page as links only.
- **Scans and expedition footage:** these often belong to a company. You may use the facts they revealed (what fell, when), never the images.
