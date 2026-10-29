// Where the camera looks at bar t. Camera keys name a target (a piece, followed as it moves, or a fixed point),
// a yaw and pitch in degrees and a distance in metres; between keys everything blends. With no keys the camera
// frames the subject pieces. Pure.
import { pieceBox, worldBox } from './geom.js';
import { lerp, lerpAngle } from './math.js';

// a piece's box in the world at this state (its geometry is built in its own frame, without the offset). A piece
// with no body of its own (a group) spans its children.
export function pieceWorldBox(model, state, id) {
  const p = model.pieces.find(q => q.id === id), b = p && pieceBox(p, model);
  if (!b) {
    const kids = model.pieces.filter(q => q.parent === id).map(q => pieceWorldBox(model, state, q.id)).filter(Boolean);
    if (kids.length) return { min: [0, 1, 2].map(k => Math.min(...kids.map(x => x.min[k]))), max: [0, 1, 2].map(k => Math.max(...kids.map(x => x.max[k]))) };
    const s = state.pieces.get(id); return s ? { min: s.pos.slice(), max: s.pos.slice() } : null;
  }
  return worldBox({ min: b.min.map((v, k) => v - p.offset[k]), max: b.max.map((v, k) => v - p.offset[k]) }, state.pieces.get(id).matrix);
}

// the pieces the camera is following at bar t: the target of the nearest camera key when it is a piece, else the
// subject pieces (cameraSubject, else every hull). Gate 2 checks these stay in frame.
export function frameSubject(model, t) {
  const subject = () => model.cameraSubject.length ? model.cameraSubject : model.pieces.filter(p => p.template === 'hull').map(p => p.id);
  if (!model.camera.length) return subject();
  let k = model.camera[0];
  for (const c of model.camera) if (Math.abs(c._t - t) < Math.abs(k._t - t)) k = c;
  return typeof k.target === 'string' ? [k.target] : subject();
}

// the union of some pieces' world boxes (by default the subject pieces)
export function subjectBox(model, state, ids) {
  ids = ids || (model.cameraSubject.length ? model.cameraSubject : model.pieces.filter(p => p.template === 'hull').map(p => p.id));
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const id of ids) { const b = pieceWorldBox(model, state, id); if (!b) continue; for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], b.min[k]); hi[k] = Math.max(hi[k], b.max[k]); } }
  return isFinite(lo[0]) ? { min: lo, max: hi } : { min: [0, 0, 0], max: [0, 0, 0] };
}

const centre = b => b.min.map((v, k) => (v + b.max[k]) / 2);
const targetOf = (model, state, key) => typeof key.target === 'string' ? centre(pieceWorldBox(model, state, key.target)) : key.target;

export function cameraAt(model, t, state) {
  const keys = model.camera;
  if (!keys.length) {
    const b = subjectBox(model, state), r = Math.hypot(...b.max.map((v, k) => v - b.min[k])) / 2;
    return { target: centre(b), yaw: 215, pitch: 20, dist: Math.max(30, r * 2.6) };
  }
  let i = keys.findIndex(k => k._t > t);
  if (i === -1) i = keys.length;
  const a = keys[Math.max(0, i - 1)], b = keys[Math.min(keys.length - 1, i)];
  const f = b._t > a._t ? Math.max(0, Math.min(1, (t - a._t) / (b._t - a._t))) : 0;
  const ta = targetOf(model, state, a), tb = targetOf(model, state, b);
  return { target: ta.map((v, k) => lerp(v, tb[k], f)), yaw: lerpAngle(a.yaw, b.yaw, f), pitch: lerp(a.pitch, b.pitch, f),
    dist: Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), f)) };
}
