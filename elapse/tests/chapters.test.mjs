import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAt, chapterAt, barToTime, timeToBar, formatTime } from '../engine/chapters.js';
import { load } from './load.mjs';

test('parseAt is zone-independent', () => {
  assert.equal(parseAt('1912-04-14T23:39'), Date.UTC(1912, 3, 14, 23, 39));
  assert.equal(parseAt('1912-04-14T23:39:30'), Date.UTC(1912, 3, 14, 23, 39, 30));
  assert.equal(parseAt(1985), Date.UTC(1985, 0, 1));
  assert.equal(parseAt(1985.5), Date.UTC(1985, 0, 1) + 0.5 * (Date.UTC(1986, 0, 1) - Date.UTC(1985, 0, 1)));
  assert.ok(Number.isNaN(parseAt('not a time')));
});

test('bar↔time round trip', () => {
  const m = load('mini-ship');
  for (const t of [0, 12.5, 45, 55, 72, 100]) assert.ok(Math.abs(timeToBar(m, barToTime(m, t)) - t) < 1e-6, `t=${t}`);
  assert.ok(Number.isNaN(timeToBar(m, '1900-01-01T00:00')));
});

test('proportional inside a chapter', () => {
  const m = load('mini-ship');
  assert.ok(Math.abs(timeToBar(m, '1912-04-15T01:00') - 45 * 81 / 161) < 1e-9);
  assert.equal(chapterAt(m, 0), 0); assert.equal(chapterAt(m, 50), 1); assert.equal(chapterAt(m, 89.9), 2); assert.equal(chapterAt(m, 100), 3);
});

test('formatTime', () => {
  const m = load('mini-ship'), t = timeToBar(m, '1912-04-15T01:00'), y = timeToBar(m, 1996.4);
  assert.equal(formatTime(m, t, 'ko'), '4월 15일 01:00');
  assert.equal(formatTime(m, t, 'en'), 'Apr 15, 01:00');
  assert.equal(formatTime(m, y, 'ko'), '1996년');
  assert.equal(formatTime(m, y, 'en'), '1996');
});
