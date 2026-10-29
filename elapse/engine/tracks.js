// The state at bar t: every piece's world pose, rust and collapse, the water in each compartment, the lights,
// whether the ship has broken, and the events so far. A pure function of (model, t, branch).
import { poseMatrix, mul, apply, lerp, lerpAngle, catmull, clamp01 } from './math.js';

const ZERO = { pos: [0, 0, 0], trim: 0, list: 0, heading: 0 };

function samplePose(keys, t, smooth) {
  let i = keys.findIndex(k => k._t > t);
  if (i === -1) return keys.at(-1).v;
  if (i === 0) return keys[0].v;
  const a = keys[i - 1], b = keys[i], f = b._t > a._t ? (t - a._t) / (b._t - a._t) : 1;
  const pos = smooth
    ? [0, 1, 2].map(k => catmull((keys[i - 2] || a).v.pos[k], a.v.pos[k], b.v.pos[k], (keys[i + 1] || b).v.pos[k], f))
    : [0, 1, 2].map(k => lerp(a.v.pos[k], b.v.pos[k], f));
  return { pos, trim: lerpAngle(a.v.trim ?? 0, b.v.trim ?? 0, f), list: lerpAngle(a.v.list ?? 0, b.v.list ?? 0, f), heading: lerpAngle(a.v.heading ?? 0, b.v.heading ?? 0, f) };
}

function sampleNum(keys, t) {
  let i = keys.findIndex(k => k._t > t);
  if (i === -1) return keys.at(-1).v;
  if (i === 0) return keys[0].v;
  const a = keys[i - 1], b = keys[i];
  return lerp(a.v, b.v, b._t > a._t ? (t - a._t) / (b._t - a._t) : 1);
}

const sample = (tr, t) => tr.prop === 'pose' ? samplePose(tr.keys, t, tr.interp === 'smooth') : sampleNum(tr.keys, t);

// the tracks in force at t: in branch b, from its bar position on, its tracks replace the base ones, starting
// from the base value at that point so nothing jumps
function tracksAt(model, t, branch) {
  const b = branch !== 'a' && model.branches.find(x => x.id === branch);
  if (!b || t < b.from) return model.tracks;
  const out = model.tracks.slice();
  for (const bt of b.tracks) {
    const i = out.findIndex(x => x.piece === bt.piece && x.prop === bt.prop);
    if (i < 0) { out.push(bt); continue; }
    const base = out[i], start = { _t: b.from, v: sample(base, b.from) };
    out[i] = { ...bt, keys: [...base.keys.filter(k => k._t < b.from), start, ...bt.keys.filter(k => k._t > b.from)] };
  }
  return out;
}

export function evaluate(model, t, branch = 'a') {
  const tracks = tracksAt(model, t, branch);
  const find = (piece, prop) => tracks.find(x => x.piece === piece && x.prop === prop);
  const byId = new Map(model.pieces.map(p => [p.id, p]));
  const allRust = find('*', 'rust');
  const pieces = new Map();

  function world(id) {
    if (pieces.has(id)) return pieces.get(id);
    const p = byId.get(id), tr = find(id, 'pose');
    let pose, matrix, follows = null;
    if (tr && (t >= tr.keys[0]._t || !p.parent)) { pose = sample(tr, t); matrix = poseMatrix(pose); }
    else if (p.parent) {
      const par = world(p.parent); follows = p.parent;
      matrix = mul(par.matrix, poseMatrix({ ...ZERO, ...(p.rotate || {}), pos: p.offset }));   // offset, then turned about that point
      pose = { pos: apply(matrix, [0, 0, 0]), trim: par.trim, list: par.list, heading: par.heading };
    } else { pose = { ...ZERO, pos: p.offset.slice() }; matrix = poseMatrix(pose); }
    const rt = find(id, 'rust') || allRust;
    const col = model.events.filter(e => e.kind === 'collapse' && e.piece === id && e._t <= t).at(-1);
    const collapse = col ? { mode: col.mode, p: col._until > col._t ? clamp01((t - col._t) / (col._until - col._t)) : 1 } : null;
    const visible = p._appear == null || t >= p._appear;
    const s = { pos: pose.pos, trim: pose.trim, list: pose.list, heading: pose.heading, matrix, rust: rt ? sampleNum(rt.keys, t) : 0, collapse, visible, follows };
    pieces.set(id, s);
    return s;
  }
  for (const p of model.pieces) world(p.id);

  const water = new Map();
  for (const tr of tracks) if (tr.prop === 'water') water.set(tr.piece, sampleNum(tr.keys, t));
  const lt = tracks.find(x => x.prop === 'lights');
  const happened = model.events.filter(e => e._t <= t);
  let chapter = 0;
  model.chapters.forEach((c, i) => { if (t >= c.bar[0]) chapter = i; });
  return { t, chapter, lights: lt ? sampleNum(lt.keys, t) : 0, broken: happened.some(e => e.kind === 'break'), pieces, water, happened };
}
