import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../engine/tracks.js';
import { poseMatrix, mul } from '../engine/math.js';
import { normalizeModel } from '../engine/model.js';
import { timeToBar } from '../engine/chapters.js';
import { load, raw } from './load.mjs';

const close = (a, b, eps = 1e-6) => a.every((v, i) => Math.abs(v - b[i]) < eps);

test('pure across break and collapse', () => {
  const m = load('mini-ship');
  const seen = new Map();
  for (const t of [40, 44.9, 45, 50, 80, 99, 50, 44.9, 40]) {
    const s = evaluate(m, t);
    assert.deepEqual(s, evaluate(m, t));
    if (seen.has(t)) assert.deepEqual(s, seen.get(t)); else seen.set(t, s);
  }
  assert.equal(evaluate(m, 40).broken, false);
  assert.equal(evaluate(m, 50).broken, true);
  assert.equal(evaluate(m, 40).pieces.get('funnel').collapse, null);
  assert.equal(evaluate(m, 99).pieces.get('funnel').collapse.p, 1);
});

test('parent until own track', () => {
  const m = load('mini-ship'), before = timeToBar(m, '1912-04-15T02:10'), after = timeToBar(m, '1912-04-15T02:38');
  const s = evaluate(m, before), ship = s.pieces.get('ship'), stern = s.pieces.get('stern');
  assert.ok(close(stern.matrix, ship.matrix));
  const house = s.pieces.get('house'), bow = s.pieces.get('bow');
  assert.ok(close(house.matrix, mul(bow.matrix, poseMatrix({ pos: [30, 0, 15], trim: 0, list: 0, heading: 0 }))));
  const s2 = evaluate(m, after).pieces.get('stern');
  assert.ok(close(s2.pos, [150, -400, -3800])); assert.equal(s2.heading, 180);
});

test('heading shortest arc', () => {
  const r = raw('branch');
  r.tracks.push({ piece: 'ship', prop: 'pose', keys: [{ at: 2000, v: { pos: [0, 0, 0], trim: 0, list: 0, heading: 350 }, sourceIds: ['s1'] },
    { at: 2100, v: { pos: [0, 0, 0], trim: 0, list: 0, heading: 10 }, sourceIds: ['s1'] }] });
  const h = evaluate(normalizeModel(r), 50).pieces.get('ship').heading;
  assert.ok(Math.abs(((h % 360) + 360) % 360) < 1e-9 || Math.abs(((h % 360) + 360) % 360 - 360) < 1e-9, `heading ${h}`);
});

test('water clamps between keys and holds after the last', () => {
  const m = load('mini-ship');
  assert.equal(evaluate(m, 0).water.get('c1'), 1);
  const mid = evaluate(m, timeToBar(m, '1912-04-15T00:00')).water.get('c1');
  assert.ok(mid > 1 && mid < 9.5);
  assert.equal(evaluate(m, 80).water.get('c1'), 15);
  assert.equal(evaluate(m, 0).lights, 1); assert.equal(evaluate(m, 44.9).lights, 0);
});

test('rust from the * track, own pose, and happened events', () => {
  const m = load('mini-ship'), s = evaluate(m, 90);
  assert.ok(Math.abs(s.pieces.get('house').rust - 0.7) < 1e-6);
  assert.deepEqual(s.happened.map(e => e.id), ['hit', 'spill', 'dark', 'split', 'found', 'fall']);
  assert.equal(evaluate(m, 0).chapter, 0);
});

test('branch b overrides after from only', () => {
  const m = load('branch'), rust = (t, b) => evaluate(m, t, b).pieces.get('ship').rust;
  for (const t of [0, 20, 49.9]) assert.equal(rust(t, 'b'), rust(t, 'a'));
  assert.ok(Math.abs(rust(50, 'b') - rust(50, 'a')) < 1e-9);
  assert.ok(Math.abs(rust(75, 'b') - 0.35) < 1e-9);
  assert.ok(Math.abs(rust(100, 'b') - 0.2) < 1e-9);
  assert.ok(Math.abs(rust(100, 'a') - 1) < 1e-9);
});

test('a piece with appear is hidden before that time', () => {
  const r = raw('mini-ship'); r.pieces.find(p => p.id === 'boiler').appear = '1912-04-15T02:18';
  const m = normalizeModel(r), at = timeToBar(m, '1912-04-15T02:18');
  assert.equal(evaluate(m, at - 0.1).pieces.get('boiler').visible, false);
  assert.equal(evaluate(m, at).pieces.get('boiler').visible, true);
  assert.equal(evaluate(m, 0).pieces.get('bow').visible, true);
});

test('a piece reports which parent it is following', () => {
  const m = load('mini-ship');
  assert.equal(evaluate(m, 10).pieces.get('stern').follows, 'ship');
  assert.equal(evaluate(m, 50).pieces.get('stern').follows, null);
  assert.equal(evaluate(m, 50).pieces.get('house').follows, 'bow');
  assert.equal(evaluate(m, 50).pieces.get('berg').follows, null);
});

test('a child can be turned relative to its parent', () => {
  const r = raw('mini-ship'); r.pieces.find(p => p.id === 'house').rotate = { trim: 10 };
  const m = normalizeModel(r), s = evaluate(m, 0), bow = s.pieces.get('bow'), house = s.pieces.get('house');
  const expect = mul(bow.matrix, poseMatrix({ pos: [30, 0, 15], trim: 10, list: 0, heading: 0 }));
  assert.ok(close(house.matrix, expect));
});
