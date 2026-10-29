import test from 'node:test';
import assert from 'node:assert/strict';
import { SPEEDS, advance, stepSpeed } from '../speeds.js';

test('advance covers the bar in the preset time', () => {
  assert.equal(advance(0, 24, 'normal'), 100);
  assert.equal(advance(50, 6, 'fast'), 100);
  assert.equal(advance(0, 30, 'xslow'), 50);
  assert.equal(SPEEDS.slow, 36);
});

test('stepSpeed clamps', () => {
  assert.equal(stepSpeed('fast', 1), 'fast');
  assert.equal(stepSpeed('xslow', -1), 'xslow');
  assert.equal(stepSpeed('normal', 1), 'fast');
  assert.equal(stepSpeed('normal', -1), 'slow');
});
