import test from 'node:test';
import assert from 'node:assert/strict';
import { hullMesh, deckHeightAt, halfBreadthAt, hullWindows, pieceBox, worldBox, waterPlane, clampToPlane } from '../engine/geom.js';
import { poseMatrix } from '../engine/math.js';
import { load } from './load.mjs';

const m = load('mini-ship'), bow = m.pieces.find(p => p.id === 'bow'), H = { ...bow.params, range: undefined, cap: 'flat' };
const extent = pos => { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], pos[i + k]); hi[k] = Math.max(hi[k], pos[i + k]); } return { lo, hi }; };
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;

test('hull extents match the offsets', () => {
  const { positions } = hullMesh(H), { lo, hi } = extent(positions);
  assert.ok(near(lo[0], -100) && near(hi[0], 100), `x ${lo[0]}..${hi[0]}`);
  assert.ok(near(hi[1], 10, 1e-3) && near(lo[1], -10, 1e-3), `y ${lo[1]}..${hi[1]}`);
  assert.ok(near(lo[2], 0) && near(hi[2], 17, 1e-6), `z ${lo[2]}..${hi[2]}`);
});

test('range cuts the hull and the mesh is closed', () => {
  for (const cap of ['flat', 'jagged']) {
    const { positions, indices } = hullMesh({ ...H, range: [0, 100], cap }), { lo } = extent(positions);
    assert.ok(lo[0] > -0.7 && lo[0] < 1e-6, `min x ${lo[0]}`);
    const edges = new Map();
    for (let i = 0; i < indices.length; i += 3) for (let k = 0; k < 3; k++) {
      const a = indices[i + k], b = indices[i + (k + 1) % 3], key = a < b ? `${a},${b}` : `${b},${a}`;
      edges.set(key, (edges.get(key) || 0) + 1);
    }
    assert.ok([...edges.values()].every(n => n === 2), `${cap}: open or non-manifold edges`);
  }
});

test('deckHeightAt rises with sheer', () => {
  assert.ok(near(deckHeightAt(H, 0), 15));
  assert.ok(near(deckHeightAt(H, 100), 17));
  assert.ok(near(deckHeightAt(H, -100), 16));
  assert.ok(near(halfBreadthAt(H, 0, 8), 10));
});

test('hullWindows spaces windows along both sides', () => {
  const w = hullWindows(bow.params);
  assert.equal(w.length, 2 * 21);   // only the windows inside the piece's range [0, 100]
  assert.ok(w.every(r => r.z1 > r.z0 && r.x1 > r.x0 && (r.side === 'port' || r.side === 'stbd')));
});

test('pieceBox applies the offset and template sizes', () => {
  const house = pieceBox(m.pieces.find(p => p.id === 'house'), m);
  assert.deepEqual(house, { min: [10, -7, 15], max: [50, 7, 21] });
  const berg = pieceBox(m.pieces.find(p => p.id === 'berg'), m);
  assert.deepEqual(berg, { min: [370, -50, -90], max: [430, -10, 18] });
  assert.equal(pieceBox(m.pieces.find(p => p.id === 'ship'), m), null);
});

test('worldBox of a unit box rotated 90° about z', () => {
  const b = worldBox({ min: [0, 0, 0], max: [2, 1, 1] }, poseMatrix({ pos: [10, 0, 0], heading: 90 }));
  assert.ok(near(b.min[0], 9) && near(b.max[0], 10) && near(b.min[1], 0) && near(b.max[1], 2));
});

test('waterPlane level ship', () => {
  const p = waterPlane(poseMatrix({}), { params: { x0: 0, x1: 10 } }, 5);
  assert.ok(near(p.n[0], 0) && near(p.n[1], 0) && near(p.n[2], 1) && near(p.d, 5));
});

test('waterPlane trimmed 10° bow down', () => {
  const p = waterPlane(poseMatrix({ trim: 10 }), { params: { x0: 0, x1: 10 } }, 5), s = Math.sin(Math.PI / 18);
  assert.ok(near(p.n[0], -s) && near(p.n[2], Math.cos(Math.PI / 18)), `n ${p.n}`);
  assert.ok(near(p.n[0] * 5 + p.n[2] * 5, p.d));      // (xc, 0, h) is on the plane
});

test('clampToPlane', () => {
  const plane = { n: [0, 0, 1], d: 2 }, pos = new Float32Array([0, 0, 1, 0, 0, 5, 3, 1, 2]);
  const out = clampToPlane(pos, plane);
  assert.deepEqual([...out], [0, 0, 1, 0, 0, 2, 3, 1, 2]);
});

test('a compartment can be narrower than the beam, and a port davit reaches to port', () => {
  const c = pieceBox({ template: 'compartment', params: { x0: 0, x1: 10, floor: 1, top: 9, b: 6 } }, m);
  assert.deepEqual([c.min[1], c.max[1]], [-3, 3]);
  const port = pieceBox({ template: 'davit', params: { h: 3, reach: 1.5, side: 'port' } }, m), stbd = pieceBox({ template: 'davit', params: { h: 3, reach: 1.5 } }, m);
  assert.ok(port.max[1] >= 1.5 && stbd.min[1] <= -1.5);
});

test('paint bands get their own rows and rings, so their edges are crisp', () => {
  const P = { ...H, paint: { bands: [{ z0: 9.3, z1: 10.1, color: '#2f7d3a', from: -40, to: 37 }] } };
  const { positions } = hullMesh(P), zs = new Set(), xs = new Set();
  for (let i = 0; i < positions.length; i += 3) { if (Math.abs(positions[i]) < 1e-4) zs.add(+positions[i + 2].toFixed(3)); xs.add(+positions[i].toFixed(3)); }
  for (const z of [9.3, 10.1, 9.28, 10.12]) assert.ok(zs.has(z), `row at z=${z} missing`);
  for (const x of [-40, 37]) assert.ok(xs.has(x), `ring at x=${x} missing`);
});

test('the seabed is level where the wreck lies and has relief further out', async () => {
  const { groundFn } = await import('../engine/geom.js');
  const g = groundFn(m), [bx, by] = m.tracks.find(t => t.piece === 'bow').keys.at(-1).v.pos;
  for (const [dx, dy] of [[0, 0], [60, -40], [-120, 30]]) assert.equal(g(bx + dx, by + dy), -3800);
  const far = [0, 1, 2, 3, 4, 5].map(i => g(bx + 1500 + i * 37, by - 1400 + i * 53));
  assert.ok(far.some(z => Math.abs(z + 3800) > 0.5), `${far}`);
  assert.ok(far.every(z => Math.abs(z + 3800) <= m.environment.seabed.relief * 3));
});
