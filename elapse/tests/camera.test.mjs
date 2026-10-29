import test from 'node:test';
import assert from 'node:assert/strict';
import { cameraAt, subjectBox, pieceWorldBox } from '../engine/camera.js';
import { evaluate } from '../engine/tracks.js';
import { normalizeModel } from '../engine/model.js';
import { load, raw } from './load.mjs';

test('target follows piece through descent', () => {
  const m = load('mini-ship');
  for (const t of [46, 48, 52]) {
    const s = evaluate(m, t), b = pieceWorldBox(m, s, 'bow'), c = cameraAt(m, t, s);
    assert.ok(Math.abs(c.target[2] - (b.min[2] + b.max[2]) / 2) < 1e-6, `t=${t}: ${c.target[2]} vs ${(b.min[2] + b.max[2]) / 2}`);
    assert.ok(c.dist > 0 && isFinite(c.yaw) && isFinite(c.pitch));
  }
});

test('auto-frame with no keys', () => {
  const r = raw('mini-ship'); r.camera = [];
  const m = normalizeModel(r), s0 = evaluate(m, 10), s1 = evaluate(m, 99);
  const d0 = cameraAt(m, 10, s0).dist, d1 = cameraAt(m, 99, s1).dist;
  const size = s => { const b = subjectBox(m, s); return Math.hypot(...b.max.map((v, k) => v - b.min[k])); };
  assert.ok(size(s1) > size(s0) && d1 > d0, `${d0} → ${d1}`);
});

test('frameSubject follows the piece the nearest camera key names', async () => {
  const { frameSubject } = await import('../engine/camera.js');
  const m = load('mini-ship');
  assert.deepEqual(frameSubject(m, 50), ['bow']);
  assert.deepEqual(frameSubject(m, 10), ['ship']);
  assert.deepEqual(frameSubject(m, 99), ['bow', 'stern']);      // the nearest key aims at a point: the subject pieces
});

test('a group spans its children', () => {
  const m = load('mini-ship'), s = evaluate(m, 0), g = pieceWorldBox(m, s, 'ship'), bow = pieceWorldBox(m, s, 'bow'), stern = pieceWorldBox(m, s, 'stern');
  assert.ok(g.min[0] <= stern.min[0] + 1e-9 && g.max[0] >= bow.max[0] - 1e-9);
});
