import test from 'node:test';
import assert from 'node:assert/strict';
import { SPEEDS, DEFAULT_SPEED, advance, stepSpeed, speedLabel } from '../speeds.js';

test('advance covers the bar in the preset time', () => {
  assert.equal(advance(0, 20, 'normal'), 100);
  assert.equal(advance(50, 6, 'fast'), 100);
  assert.equal(advance(0, 30, 'xslow'), 50);
  assert.equal(advance(0, 15, 'nope'), 50);
  assert.equal(SPEEDS.slow, 30);
});

test('the slowest preset is 1× and the others are multiples of it', () => {
  assert.deepEqual(Object.keys(SPEEDS).map(speedLabel), ['1×', '2×', '3×', '5×']);
  assert.equal(DEFAULT_SPEED, 'slow');
});

test('stepSpeed clamps', () => {
  assert.equal(stepSpeed('fast', 1), 'fast');
  assert.equal(stepSpeed('xslow', -1), 'xslow');
  assert.equal(stepSpeed('normal', 1), 'fast');
  assert.equal(stepSpeed('normal', -1), 'slow');
});
