// An offsets table for a steel liner or cargo hull, built from the figures that are usually public. Offsets tables
// themselves rarely are. Use it in a generator script and mark the hull form 'estimated' in its notes. Pure.
//   linerOffsets({ loa, beam, depth, draft, parallel, bilgeRadius, aftFullness?, stations?, deadrise? })
// parallel: the share of the length that is parallel mid-body (about 0.3–0.5 for liners). The entrance (forward)
// and run (aft) take the rest, the entrance a little longer. aftFullness: how full the stern stays above the
// waterline (0 = fine, 1 = as wide as midships), for a counter or cruiser stern.

export function linerOffsets({ loa, beam, depth, draft, parallel = 0.4, bilgeRadius = beam * 0.08, aftFullness = 0.5, stations = 25, deadrise = 0 }) {
  const B = beam / 2, R = Math.min(bilgeRadius, B * 0.9, draft * 0.9);
  const waterlines = [...new Set([0, R * 0.25, R * 0.6, R, draft * 0.5, draft, (draft + depth) / 2, depth].map(v => +v.toFixed(4)))].sort((a, b) => a - b);
  // the midship section: a flat side, a round bilge of radius R, a flat (or slightly rising) bottom
  const mid = z => z >= R ? B : B - R + Math.sqrt(Math.max(0, R * R - (R - z) * (R - z))) - deadrise * (1 - z / R);
  const par = loa * parallel, fwdLen = (loa - par) * 0.55, aftLen = loa - par - fwdLen;
  const x0 = -loa / 2, xParA = x0 + aftLen, xParF = xParA + par, x1 = loa / 2;
  const hb = (x, z) => {
    const m = mid(z), h = z / depth;
    if (x >= xParA && x <= xParF) return m;
    if (x > xParF) {               // the entrance: finer low down, a straight stem at the end
      const f = (x - xParF) / fwdLen, p = 1.5 + 1.1 * h;
      return Math.max(0.12, m * (1 - Math.pow(f, p)));
    }
    // the run: fine below the waterline toward the stern post, fuller above it toward the stern's overhang
    const f = (xParA - x) / aftLen, above = Math.max(0, Math.min(1, (z - draft * 0.6) / (depth - draft * 0.6)));
    const tip = 0.12 + aftFullness * above * m * 0.55, p = 1.3 + 1.6 * above;
    return Math.max(0.12, tip + (m - tip) * (1 - Math.pow(f, p)));
  };
  const xs = [];
  for (let i = 0; i < stations; i++) xs.push(x0 + (x1 - x0) * i / (stations - 1));
  for (const x of [xParA, xParF]) if (!xs.some(v => Math.abs(v - x) < 0.5)) xs.push(x);
  xs.sort((a, b) => a - b);
  return { waterlines, stations: xs.map(x => ({ x: +x.toFixed(3), hb: waterlines.map(z => +hb(x, z).toFixed(3)) })) };
}
