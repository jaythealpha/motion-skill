import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES, classOf } from '../confidence.js';

test('classOf', () => {
  assert.deepEqual(CLASSES, ['sourced', 'estimated', 'disputed', 'projection']);
  assert.equal(classOf({ confidence: 'disputed', sourceIds: ['s1'] }), 'disputed');
  assert.equal(classOf({ sourceIds: ['s1'] }), 'sourced');
  assert.equal(classOf({ sourceIds: [] }), null);
  assert.equal(classOf({}), null);
  assert.equal(classOf({ confidence: 'made-up' }), null);
});

test('explicit sourced needs sources', () => {
  assert.equal(classOf({ confidence: 'sourced', sourceIds: ['s1'] }), 'sourced');
  assert.equal(classOf({ confidence: 'sourced' }), null);
});
