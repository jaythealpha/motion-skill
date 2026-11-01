// Gate 1's physical checks, on top of the schema checks in model.js. Pure; the CLI is scripts/check_model.mjs.
// Checks tied to an optional feature run only when the model turns that feature on.
import {isBuilding,validateBuilding} from './building-model.js';
import { validateModel, confidenceItems, DIM_TOL } from './model.js';
import { classOf } from '../shared/confidence.js';
import { evaluate } from './tracks.js';
import { pieceBox, worldBox, deckHeightAt, hullMesh, halfBreadthAt, groundFn } from './geom.js';
import { apply } from './math.js';

const SAMPLES = 400, EPS = 0.05;
const label = it => it.id ? `'${it.id}'` : it.at != null ? `key at ${JSON.stringify(it.at)}` : 'item';

function chapters(m, err) {
  const cs = m.chapters.slice().sort((a, b) => a.bar[0] - b.bar[0]);
  if (Math.abs(cs[0].bar[0]) > 1e-9) err('chapters', 'the first chapter must start at bar 0');
  if (Math.abs(cs.at(-1).bar[1] - 100) > 1e-9) err('chapters', 'the last chapter must end at bar 100');
  cs.forEach((c, i) => {
    if (!(c._end > c._start)) err('chapters', `'${c.id}' must end after it starts`);
    const n = cs[i + 1]; if (!n) return;
    if (Math.abs(c.bar[1] - n.bar[0]) > 1e-9) err('chapters', `'${c.id}' and '${n.id}' leave a gap or overlap on the bar`);
    if (n._start < c._end) err('chapters', `'${n.id}' starts before '${c.id}' ends: real times must run in order`);
  });
}

function confidence(m, err) {
  const proj = new Set(m.features.projection ? m.features.projectionChapters || [] : []);
  const projBars = m.chapters.filter(c => proj.has(c.id)).map(c => c.bar);
  if (m.features.projection && !projBars.length) err('features', 'projection is on but no projection chapter exists');
  const inProj = t => projBars.some(([a, b]) => t > a + 1e-9 && t <= b + 1e-9);
  for (const it of confidenceItems(m)) {
    const cls = classOf(it);
    if (!cls) { err('confidence', `${label(it)} has neither sourceIds nor a known confidence`); continue; }
    if (cls === 'disputed' && !(it.alternatives?.ko || it.alternatives?.en)) err('confidence', `${label(it)} is disputed but gives no alternatives`);
    if (it._t != null && inProj(it._t) && cls !== 'projection') err('confidence', `${label(it)} lies in a projection chapter but is marked ${cls}`);
  }
}

function hullUnion(m) {
  const hulls = m.pieces.filter(p => p.template === 'hull'); if (!hulls.length) return null;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const h of hulls) { const b = pieceBox(h, m); for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], b.min[k]); hi[k] = Math.max(hi[k], b.max[k]); } }
  return { loa: hi[0] - lo[0], beam: hi[1] - lo[1], depth: Math.max(...hulls.map(h => h.params.depth)) };
}

function dims(m, err, official) {
  const u = hullUnion(m); if (!u) { err('dims', 'no hull piece'); return; }
  for (const [what, ref] of [['subject.dims', m.subject.dims], ['--official', official]]) {
    if (!ref) continue;
    for (const k of ['loa', 'beam', 'depth']) if (Math.abs(u[k] - ref[k]) > ref[k] * DIM_TOL)
      err('dims', `hull ${k} ${u[k].toFixed(2)} m differs from ${what} ${ref[k]} m by more than ${DIM_TOL * 100}%`);
  }
}

function water(m, err) {
  const breakT = m.events.find(e => e.kind === 'break')?._t ?? Infinity;
  const tracks = m.tracks.filter(t => t.prop === 'water'), byId = new Map(m.pieces.map(p => [p.id, p]));
  for (const tr of tracks) tr.keys.forEach((k, i) => {
    if (i && k._t < breakT && k.v < tr.keys[i - 1].v - 1e-9) err('water', `'${tr.piece}' water falls at ${JSON.stringify(k.at)} before the break`);
  });
  const comps = m.pieces.filter(p => p.template === 'compartment');
  for (const bh of m.pieces.filter(p => p.template === 'bulkhead')) {
    const x = bh.params.x, top = bh.params.top;
    const side = comps.filter(c => c.parent === bh.parent && (Math.abs(c.params.x1 - x) < 0.01 || Math.abs(c.params.x0 - x) < 0.01));
    for (const c of side) {
      const tr = tracks.find(t => t.piece === c.id); if (!tr) continue;
      const over = tr.keys.find(k => k.v > top + 1e-9); if (!over) continue;
      const others = side.filter(o => o !== c).map(o => o.id);
      // allowed after water spills over that bulkhead, or after water enters the compartment from outside (inflow)
      const ok = m.events.some(e => e._t <= over._t + 1e-9 && ((e.kind === 'overflow' &&
        ((e.from === c.id && others.includes(e.to)) || (e.to === c.id && others.includes(e.from)))) || (e.kind === 'inflow' && e.piece === c.id)));
      if (!ok) err('water', `'${c.id}' rises above bulkhead '${bh.id}' (top ${top} m) at ${JSON.stringify(over.at)} with no overflow across it or inflow into it by then`);
    }
  }
}

function seabed(m, err) {
  const depth = m.environment.seaDepth; if (!(depth > 0)) return;
  const byId = new Map(m.pieces.map(p => [p.id, p]));
  // what lies inside a buried piece is buried with it: embed is inherited down the parent chain
  const embed = p => p.embed ?? (p.parent ? embed(byId.get(p.parent)) : 0.5);
  // a hull is tested by its own surface (every few vertices); a box's corners would reach far below a narrow
  // bow once the ship trims or lies on its side. Other pieces are tested by their box corners.
  const pts = new Map();
  for (const p of m.pieces) {
    if (p.template === 'hull') { const pos = hullMesh(p.params).positions, out = []; for (let i = 0; i < pos.length; i += 9) out.push([pos[i], pos[i + 1], pos[i + 2]]); pts.set(p.id, out); continue; }
    // a bulkhead is the hull's section at its x: test its outline, not its full-beam box
    const hullParent = p.template === 'bulkhead' && m.pieces.find(q => q.id === p.parent && q.template === 'hull');
    if (hullParent) {
      const q = p.params, out = [], fl = q.floor ?? 0;
      for (let i = 0; i <= 8; i++) { const z = fl + (q.top - fl) * i / 8, y = halfBreadthAt(hullParent.params, q.x, z); out.push([q.x, y, z], [q.x, -y, z]); }
      pts.set(p.id, out); continue;
    }
    const b = pieceBox(p, m); if (!b) continue;
    const lo = b.min.map((v, k) => v - p.offset[k]), hi = b.max.map((v, k) => v - p.offset[k]), c = [];
    for (const x of [lo[0], hi[0]]) for (const y of [lo[1], hi[1]]) for (const z of [lo[2], hi[2]]) c.push([x, y, z]);
    pts.set(p.id, c);
  }
  const worst = new Map(), ground = groundFn(m), endGap = new Map();
  for (let i = 0; i <= SAMPLES; i++) {
    const t = 100 * i / SAMPLES, s = evaluate(m, t);
    for (const p of m.pieces) {
      const ps = s.pieces.get(p.id), list = pts.get(p.id);
      if (!list || !ps.visible || (ps.collapse?.mode === 'vanish' && ps.collapse.p >= 1)) continue;
      // how far the piece's lowest point is above (+) or below (−) the drawn seabed beneath it
      let gap = Infinity; for (const q of list) { const w = apply(ps.matrix, q); gap = Math.min(gap, w[2] - ground(w[0], w[1])); }
      if (gap < -embed(p) - 1e-6 && !(worst.get(p.id)?.gap <= gap)) worst.set(p.id, { gap, t });
      if (i === SAMPLES && p.template === 'hull') endGap.set(p.id, gap);
    }
  }
  for (const [id, w] of worst) err('seabed', `'${id}' goes ${(-w.gap).toFixed(1)} m into the seabed at bar ${w.t.toFixed(1)} (allowed: its embed)`);
  // a wreck rests on the seabed: every hull still drawn at the end touches it
  for (const [id, gap] of endGap) if (gap > 1) err('seabed', `'${id}' ends ${gap.toFixed(1)} m above the seabed at bar 100; a wreck rests on the bottom`);
}

const centre = b => b.min.map((v, k) => (v + b.max[k]) / 2);
function wreck(m, err) {
  const w = m.wreck; if (!w) return;
  const s = evaluate(m, 100), byId = new Map(m.pieces.map(p => [p.id, p]));
  const at = id => { const p = byId.get(id), b = pieceBox(p, m); if (!b) return s.pieces.get(id).pos;
    return centre(worldBox({ min: b.min.map((v, k) => v - p.offset[k]), max: b.max.map((v, k) => v - p.offset[k]) }, s.pieces.get(id).matrix)); };
  if (w.separation) {
    const [a, b] = w.separation.between, pa = at(a), pb = at(b), d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
    if (Math.abs(d - w.separation.metres) > w.separation.tol) err('wreck', `'${a}' and '${b}' end ${d.toFixed(0)} m apart; the record says ${w.separation.metres} ± ${w.separation.tol} m`);
  }
  for (const q of w.poses || []) {
    const ps = s.pieces.get(q.piece), tol = q.tol ?? 10;
    if (!ps) { err('wreck', `wreck.poses names '${q.piece}', which is not a piece`); continue; }
    for (const k of ['trim', 'list', 'heading']) {
      if (q[k] == null) continue;
      const raw = Math.abs(ps[k] - q[k]) % 360, d = Math.min(raw, 360 - raw);
      if (d > tol) err('wreck', `'${q.piece}' ends with ${k} ${ps[k].toFixed(0)}°; the record says ${q[k]} ± ${tol}°`);
    }
  }
  if (w.heading) {
    const [a, b] = w.heading.between, raw = Math.abs(s.pieces.get(a).heading - s.pieces.get(b).heading) % 360, d = Math.min(raw, 360 - raw);
    if (Math.abs(d - w.heading.deg) > w.heading.tol) err('wreck', `'${a}' and '${b}' end ${d.toFixed(0)}° apart in heading; the record says ${w.heading.deg} ± ${w.heading.tol}°`);
  }
}

function seating(m, err) {
  const byId = new Map(m.pieces.map(p => [p.id, p]));
  for (const p of m.pieces.filter(q => q.on)) {
    const hull = byId.get(p.on), b = pieceBox(p, m); if (!b || hull?.template !== 'hull') continue;
    const x = (b.min[0] + b.max[0]) / 2, deck = deckHeightAt(hull.params, x);
    if (Math.abs(b.min[2] - deck) > 0.5) err('seating', `'${p.id}' sits at z ${b.min[2].toFixed(2)} m but the deck of '${hull.id}' there is at ${deck.toFixed(2)} m`);
  }
}

function overlap(m, err) {
  const on = m.pieces.filter(p => p.on);
  for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
    const a = on[i], b = on[j]; if (a.on !== b.on || a.passesThrough.includes(b.id) || b.passesThrough.includes(a.id)) continue;
    const A = pieceBox(a, m), B = pieceBox(b, m); if (!A || !B) continue;
    if ([0, 1, 2].every(k => Math.min(A.max[k], B.max[k]) - Math.max(A.min[k], B.min[k]) > EPS)) err('overlap', `'${a.id}' and '${b.id}' overlap (declare passesThrough if one really goes through the other)`);
  }
}

function lights(m, err) {
  const out = m.events.find(e => e.kind === 'lightsOut'), tr = m.tracks.find(t => t.prop === 'lights');
  if (!out) { err('lights', 'lights is on but there is no lightsOut event'); return; }
  if (!tr) { err('features', 'lights is on but there is no lights track'); return; }
  const after = tr.keys.filter(k => k._t >= out._t - 1e-9);
  if (!after.length || after.some(k => k.v > 1e-6)) err('lights', `the lights track must be 0 from the lightsOut event (${JSON.stringify(out.at)}) on`);
}

function features(m, err) {
  const f = m.features;
  if (f.compartments && (!m.pieces.some(p => p.template === 'compartment') || !m.tracks.some(t => t.prop === 'water'))) err('features', 'compartments is on but there are no compartments with water tracks');
  if (f.break && !m.events.some(e => e.kind === 'break')) err('features', 'break is on but there is no break event');
  if (f.break && !m.wreck?.separation) err('features', 'break is on but wreck.separation (the recorded distance between the pieces) is missing');
  if (!(m.meta.about?.ko || m.meta.about?.en)) err('meta', 'meta.about (the memorial note: the death toll and any protection of the site) is missing');
  for (const s of m.sources) if (!/^https?:\/\//.test(s.url || '')) err('sources', `source '${s.id}' needs an http(s) url to the original publisher`);
}

function branches(m, err) {
  for (const b of m.branches) if (!(b.from > 0 && b.from < 100)) err('branches', `branch '${b.id}' must start inside the bar (0 < from < 100)`);
}

export function runChecks(model, { official } = {}) {
  if(isBuilding(model))return validateBuilding(model);
  const { errors, warnings } = validateModel(model);
  if (errors.length) return { errors, warnings };
  const err = (where, msg) => errors.push({ where, msg });
  chapters(model, err);
  confidence(model, err);
  dims(model, err, official);
  if (model.features.compartments) water(model, err);
  seabed(model, err);
  if (model.features.break || model.wreck) wreck(model, err);
  seating(model, err);
  overlap(model, err);
  if (model.features.lights) lights(model, err);
  features(model, err);
  branches(model, err);
  return { errors, warnings };
}
