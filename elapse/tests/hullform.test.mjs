import test from 'node:test';
import assert from 'node:assert/strict';
import { linerOffsets } from '../engine/hullform.js';
import { hullMesh, halfBreadthAt } from '../engine/geom.js';

const P = { loa: 269.1, beam: 28.2, depth: 19.7, draft: 10.5, parallel: 0.42, bilgeRadius: 2.4, aftFullness: 0.55 };

test('a liner hull spans its length and beam', () => {
  const off = linerOffsets(P), st = off.stations;
  assert.ok(Math.abs(st[0].x + P.loa / 2) < 1e-9 && Math.abs(st.at(-1).x - P.loa / 2) < 1e-9);
  const hbMax = Math.max(...st.flatMap(s => s.hb));
  assert.ok(Math.abs(hbMax - P.beam / 2) < 1e-9);
  assert.deepEqual(off.waterlines, [...off.waterlines].sort((a, b) => a - b));
  assert.equal(off.waterlines.at(-1), P.depth);
});

test('the midbody is full above the bilge and rounded at it', () => {
  const params = { offsets: linerOffsets(P), depth: P.depth, draft: P.draft };
  assert.ok(Math.abs(halfBreadthAt(params, 0, P.draft) - P.beam / 2) < 1e-6);
  const atKeel = halfBreadthAt(params, 0, 0);
  assert.ok(atKeel < P.beam / 2 - P.bilgeRadius * 0.9 && atKeel > P.beam / 2 - P.bilgeRadius * 1.1, `keel hb ${atKeel}`);
});

test('the ends are fine and the bow finer than the stern below the waterline', () => {
  const params = { offsets: linerOffsets(P), depth: P.depth, draft: P.draft };
  const fwd = halfBreadthAt(params, P.loa / 2 - 20, 2), aft = halfBreadthAt(params, -P.loa / 2 + 20, 6);
  assert.ok(fwd < P.beam / 2 * 0.6, `fwd ${fwd}`);
  assert.ok(halfBreadthAt(params, P.loa / 2, P.depth) < 1.5);
  assert.ok(aft > 0 && aft < P.beam / 2);
});

test('it lofts into a closed hull within 0.5% of the official size', () => {
  const { positions } = hullMesh({ offsets: linerOffsets(P), depth: P.depth, draft: P.draft, sheer: { fwd: 0, aft: 0 } });
  let lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) { lo = [Math.min(lo[0], positions[i]), Math.min(lo[1], positions[i + 1])]; hi = [Math.max(hi[0], positions[i]), Math.max(hi[1], positions[i + 1])]; }
  assert.ok(Math.abs(hi[0] - lo[0] - P.loa) < P.loa * 0.005);
  assert.ok(Math.abs(hi[1] - lo[1] - P.beam) < P.beam * 0.005);
});
