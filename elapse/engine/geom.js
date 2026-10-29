// Geometry with no three.js: the hull lofted from an offsets table, piece boxes, and the plane of the water in a
// compartment. Gate 1 and the renderer both use it. Pure.
import { apply, rng } from './math.js';

const X_SUB = 6, Z_SUB = 2;            // loft subdivisions between stations and between waterlines

const stations = p => p.offsets.stations.slice().sort((a, b) => a.x - b.x);
const ends = p => { const s = stations(p); return [s[0].x, s.at(-1).x]; };

// the deck at x: the moulded depth plus sheer, a parabola rising to sheer.fwd / sheer.aft at the ends
export function deckHeightAt(p, x) {
  const [a, b] = ends(p), mid = (a + b) / 2, half = (b - a) / 2 || 1, u = (x - mid) / half, sh = p.sheer || {};
  return p.depth + (u >= 0 ? (sh.fwd || 0) : (sh.aft || 0)) * u * u;
}

// half-breadth of one waterline row at x: a monotone cubic through the stations, so the hull never bulges past
// the widest offset (a plain spline would, and the beam would come out wider than the official figure)
function hbRow(st, i, x) {
  const n = st.length;
  if (x <= st[0].x) return st[0].hb[i];
  if (x >= st[n - 1].x) return st[n - 1].hb[i];
  const j = st.findIndex(s => s.x > x) - 1;
  const d = k => (st[k + 1].hb[i] - st[k].hb[i]) / (st[k + 1].x - st[k].x);
  const slope = k => {
    if (k === 0) return d(0);
    if (k === n - 1) return d(n - 2);
    const a = d(k - 1), b = d(k);
    return a * b <= 0 ? 0 : 2 / (1 / a + 1 / b);
  };
  const a = st[j], b = st[j + 1], h = b.x - a.x, f = (x - a.x) / h, f2 = f * f, f3 = f2 * f;
  return Math.max(0, (2 * f3 - 3 * f2 + 1) * a.hb[i] + (f3 - 2 * f2 + f) * h * slope(j) + (-2 * f3 + 3 * f2) * b.hb[i] + (f3 - f2) * h * slope(j + 1));
}


export function halfBreadthAt(p, x, z) {
  const st = stations(p), wl = p.offsets.waterlines, n = wl.length, scale = deckHeightAt(p, x) / p.depth, zz = z / scale;
  if (zz <= wl[0]) return hbRow(st, 0, x);
  for (let i = 1; i < n; i++) if (zz <= wl[i]) { const f = (zz - wl[i - 1]) / (wl[i] - wl[i - 1]); return hbRow(st, i - 1, x) * (1 - f) + hbRow(st, i, x) * f; }
  return hbRow(st, n - 1, x);
}

// stem and stern shapes move the end rings: a raked stem leans forward with height, a counter stern overhangs aft
function endShift(p, x, z, a, b) {
  const h = z / p.depth;
  if (Math.abs(x - b) < 1e-9 && p.stem === 'raked') return (p.stemRake ?? p.depth * 0.25) * h;
  if (Math.abs(x - a) < 1e-9 && p.stern === 'counter') {
    // the counter overhangs from counterFrom (default the waterline) and reaches its full length counterRise above
    const from = p.counterFrom ?? p.draft, rise = p.counterRise ?? (p.depth - p.draft), f = Math.max(0, Math.min(1, (z - from) / rise));
    return -(p.sternOverhang ?? p.depth * 0.3) * f * f * (3 - 2 * f);
  }
  return 0;
}

// paint edges that need their own rows (heights at midships, scaled with the sheer like the waterlines) and rings
const EDGE = 0.02;
function paintRows(p) {
  const hs = [], d = p.draft, boot = p.paint?.bootHeight ?? 0;
  if (d != null) for (const z of [d, d - boot]) hs.push(z - EDGE, z);
  for (const b of p.paint?.bands || []) hs.push(b.z0 - EDGE, b.z0, b.z1, b.z1 + EDGE);
  return hs;
}
const paintRings = p => (p.paint?.bands || []).flatMap(b => [b.from, b.to].filter(v => v != null).flatMap(v => [v - 0.05, v, v + 0.05]));

// the x positions of the rings: stations subdivided, clipped to the piece's range, with the range ends exact
function ringXs(p) {
  const st = stations(p), [a, b] = ends(p), [r0, r1] = p.range || [a, b], xs = new Set([Math.max(a, r0), Math.min(b, r1)]);
  for (let j = 0; j < st.length - 1; j++) for (let k = 0; k <= X_SUB; k++) {
    const x = st[j].x + (st[j + 1].x - st[j].x) * k / X_SUB;
    if (x > r0 && x < r1) xs.add(x);
  }
  for (const x of paintRings(p)) if (x > Math.max(a, r0) && x < Math.min(b, r1)) xs.add(x);
  return [...xs].sort((u, v) => u - v);
}

// one ring: starboard from keel to deck, then port from deck to keel — a closed loop, so lofting it makes the
// sides, the deck and the bottom. Rows are heights at midships (waterlines, their subdivisions and paint edges),
// scaled with the sheer at this x.
function ring(p, x, a, b) {
  const wl = p.offsets.waterlines, st = stations(p), pts = [], top = wl.at(-1);
  const hs = new Set(wl);
  for (let i = 0; i < wl.length - 1; i++) for (let k = 1; k < Z_SUB; k++) hs.add(wl[i] + (wl[i + 1] - wl[i]) * k / Z_SUB);
  for (const h of paintRows(p)) if (h > wl[0] && h < top) hs.add(+h.toFixed(4));
  const scale = deckHeightAt(p, x) / p.depth;
  const side = [...hs].sort((u, v) => u - v).map(h => {
    let i = wl.findIndex(w => w >= h); if (i <= 0) i = 1;
    const f = (h - wl[i - 1]) / (wl[i] - wl[i - 1]);
    return [hbRow(st, i - 1, x) * (1 - f) + hbRow(st, i, x) * f, h * scale];
  });
  for (const [hb, z] of side) pts.push([x + endShift(p, x, z, a, b), -hb, z]);
  for (const [hb, z] of side.slice().reverse()) pts.push([x + endShift(p, x, z, a, b), hb, z]);
  return pts;
}

export function hullMesh(p) {
  const [a, b] = ends(p), xs = ringXs(p), rings = xs.map(x => ring(p, x, a, b)), n = rings[0].length;
  const [r0, r1] = p.range || [a, b];
  // a jagged cap at a cut end: the end ring's points step back and forth along x
  if (p.cap === 'jagged') for (const [ri, dir] of [[0, 1], [rings.length - 1, -1]]) {
    const x = xs[ri], cut = (ri === 0 ? x > a + 1e-9 && r0 > a : x < b - 1e-9 && r1 < b);
    if (cut) rings[ri].forEach((pt, k) => { pt[0] += dir * (k % 3 === 1 ? 0.6 : k % 3 === 2 ? 0.25 : 0); });
  }
  const pos = [], idx = [];
  for (const r of rings) for (const pt of r) pos.push(...pt);
  for (let j = 0; j < rings.length - 1; j++) for (let k = 0; k < n; k++) {
    const a0 = j * n + k, a1 = j * n + (k + 1) % n, b0 = a0 + n, b1 = a1 + n;
    idx.push(a0, b0, a1, a1, b0, b1);
  }
  // end caps: a fan from a centre point
  for (const [ri, flip] of [[0, true], [rings.length - 1, false]]) {
    const r = rings[ri], c = pos.length / 3;
    pos.push(r.reduce((s, q) => s + q[0], 0) / n, 0, r.reduce((s, q) => s + q[2], 0) / n);
    for (let k = 0; k < n; k++) { const u = ri * n + k, v = ri * n + (k + 1) % n; flip ? idx.push(c, v, u) : idx.push(c, u, v); }
  }
  return { positions: new Float32Array(pos), indices: new Uint32Array(idx) };
}

// window rectangles along both sides, only those inside the piece's range
export function hullWindows(p) {
  const out = [], [a, b] = ends(p), [r0, r1] = p.range || [a, b];
  for (const w of p.windows || []) for (let x = w.from; x <= w.to + 1e-9; x += w.spacing) {
    if (x < r0 || x > r1) continue;
    const hb = halfBreadthAt(p, x, w.z) + 0.02;
    for (const side of ['port', 'stbd']) out.push({ x0: x - 0.3, x1: x + 0.3, z0: w.z - 0.25, z1: w.z + 0.25, y: side === 'port' ? hb : -hb, side });
  }
  return out;
}

const hullCache = new WeakMap();
function hullBox(p) {
  if (hullCache.has(p)) return hullCache.get(p);
  const { positions } = hullMesh(p), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], positions[i + k]); hi[k] = Math.max(hi[k], positions[i + k]); }
  const b = { min: lo, max: hi }; hullCache.set(p, b); return b;
}

// a piece's box in its parent's frame (its own offset applied); null for pieces with no body
export function pieceBox(piece, model) {
  const q = piece.params || {}, o = piece.offset || [0, 0, 0], beam = model?.subject?.dims?.beam ?? 10, depth = model?.subject?.dims?.depth ?? 10;
  const tan = d => Math.tan((d || 0) * Math.PI / 180);
  let b;
  switch (piece.template) {
    case 'group': case 'seabed': return null;
    case 'hull': { const h = hullBox(q); b = { min: h.min.slice(), max: h.max.slice() }; break; }
    case 'deckhouse': case 'box': b = { min: [-q.l / 2, -q.b / 2, 0], max: [q.l / 2, q.b / 2, q.h] }; break;
    case 'funnel': b = { min: [-q.a - tan(q.rake) * q.h, -q.b, 0], max: [q.a, q.b, q.h] }; break;
    case 'mast': b = { min: [-q.d / 2 - tan(q.rake) * q.h, -q.d / 2, 0], max: [q.d / 2, q.d / 2, q.h] }; break;
    case 'davit': { const r = q.reach || 1.5; b = q.side === 'port' ? { min: [-0.3, -0.3, 0], max: [0.3, r, q.h || 3] } : { min: [-0.3, -r, 0], max: [0.3, 0.3, q.h || 3] }; break; }
    case 'railing': b = { min: [-q.l / 2, -0.05, 0], max: [q.l / 2, 0.05, q.h || 1.1] }; break;
    case 'cylinder': b = { min: [-q.d / 2, -q.d / 2, 0], max: [q.d / 2, q.d / 2, q.h] }; break;
    case 'bulkhead': b = { min: [q.x - 0.05, -beam / 2, q.floor ?? 0], max: [q.x + 0.05, beam / 2, q.top] }; break;
    case 'compartment': { const hw = (q.b ?? beam * 0.9) / 2; b = { min: [q.x0, -hw, q.floor ?? 0], max: [q.x1, hw, q.top ?? depth] }; break; }
    case 'iceberg': b = { min: [-q.l / 2, -q.b / 2, -q.below], max: [q.l / 2, q.b / 2, q.above] }; break;
    case 'debris': b = { min: [-q.l / 2, -q.b / 2, 0], max: [q.l / 2, q.b / 2, q.h] }; break;
    case 'boiler': b = { min: [-q.l / 2, -q.d / 2, 0], max: [q.l / 2, q.d / 2, q.d] }; break;
    default: return null;
  }
  return { min: b.min.map((v, k) => v + o[k]), max: b.max.map((v, k) => v + o[k]) };
}

// the seabed height at (x, y): -seaDepth with seeded relief, levelled within 150 m of where the pieces come to rest
// (fading back in by 400 m) so the wreck and its debris lie on level ground in plain view. The page draws this
// surface, and Gate 1 and the 'drop' collapse test against it.
export function groundFn(model) {
  const depth = model.environment?.seaDepth || 0, relief = model.environment?.seabed?.relief ?? 4;
  if (!(depth > 0)) return () => 0;
  const r = rng(5), waves = Array.from({ length: 6 }, () => [r() * 0.02 + 0.004, r() * 0.02 + 0.004, r() * 6.28, r()]);
  const rest = [];
  for (const tr of model.tracks || []) if (tr.prop === 'pose' && tr.keys.length) rest.push(tr.keys.at(-1).v.pos);
  for (const p of model.pieces || []) if (!p.parent && !(model.tracks || []).some(t => t.piece === p.id && t.prop === 'pose')) rest.push(p.offset || [0, 0, 0]);
  const near = rest.filter(q => q[2] < -depth * 0.5);
  return (x, y) => {
    let d = Infinity; for (const q of near) d = Math.min(d, Math.hypot(x - q[0], y - q[1]));
    const f = Math.max(0, Math.min(1, (d - 150) / 250)), k = f * f * (3 - 2 * f);
    if (k === 0) return -depth;
    let h = 0; for (const [a, b, ph, w] of waves) h += Math.sin(x * a + ph) * Math.cos(y * b + ph * 0.7) * w;
    return -depth + h * relief / 2 * k;
  };
}

// the axis-aligned box of a box after a transform
export function worldBox(box, m) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const x of [box.min[0], box.max[0]]) for (const y of [box.min[1], box.max[1]]) for (const z of [box.min[2], box.max[2]]) {
    const p = apply(m, [x, y, z]); for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); }
  }
  return { min: lo, max: hi };
}

// water lies level in the world, so in the ship's frame its surface tilts with the ship. The plane n·p = d in the
// compartment's own frame (shipMatrix = that frame's world matrix) through the point (xc, 0, h).
export function waterPlane(shipMatrix, comp, h) {
  const q = comp.params || {}, P = [((q.x0 ?? 0) + (q.x1 ?? 0)) / 2, 0, h];
  const n = [shipMatrix[2], shipMatrix[6], shipMatrix[10]], len = Math.hypot(...n) || 1, nn = n.map(v => v / len);
  return { n: nn, d: nn[0] * P[0] + nn[1] * P[1] + nn[2] * P[2] };
}

// vertices above the plane come down along local z onto it, so a box becomes a body of water with a level top
export function clampToPlane(positions, { n, d }) {
  const out = new Float32Array(positions);
  if (n[2] <= 1e-6) return out;
  for (let i = 0; i < out.length; i += 3) {
    const s = n[0] * out[i] + n[1] * out[i + 1] + n[2] * out[i + 2];
    if (s > d) out[i + 2] = (d - n[0] * out[i] - n[1] * out[i + 1]) / n[2];
  }
  return out;
}
