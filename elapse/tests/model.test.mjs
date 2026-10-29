import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeModel, validateModel, sourcedShare } from '../engine/model.js';
import { raw } from './load.mjs';

const errs = mut => { const r = raw('mini-ship'); mut(r); return validateModel(normalizeModel(r)).errors.map(e => e.msg).join(' | '); };

test('mini-ship is valid', () => assert.deepEqual(validateModel(normalizeModel(raw('mini-ship'))).errors, []));

test('rejects unknown template, prop, event kind, collapse mode, and a piece parent that does not exist', () => {
  assert.match(errs(r => { r.pieces[1].template = 'blob'; }), /template/);
  assert.match(errs(r => { r.tracks[0].prop = 'colour'; }), /prop/);
  assert.match(errs(r => { r.events[0].kind = 'party'; }), /kind/);
  assert.match(errs(r => { r.events[5].mode = 'melt'; }), /mode/);
  assert.match(errs(r => { r.pieces[1].parent = 'nowhere'; }), /parent/);
  assert.match(errs(r => { r.tracks[0].piece = 'ghost'; }), /piece/);
  assert.match(errs(r => { r.pieces[2].sourceIds = ['nope']; }), /source/);
});

test('names become bilingual and keys get bar positions', () => {
  const m = normalizeModel(raw('branch'));
  assert.deepEqual(m.subject.name, { ko: 'Branch test', en: 'Branch test' });
  assert.equal(m.tracks[0].keys[1]._t, 100);
  assert.deepEqual(m.features, { lights: false, compartments: false, break: false, projection: false, xrayChapters: ['all'] });
});

test('sourcedShare counts pieces, keys and events', () => {
  const s = sourcedShare(normalizeModel(raw('branch')));
  assert.equal(s, 1);
});

test('topple is a collapse mode (a mast falls over onto the deck)', () => {
  const r = raw('mini-ship'); r.events[5].mode = 'topple';
  assert.deepEqual(validateModel(normalizeModel(r)).errors, []);
});

test('xrayChapters defaults to the first chapter and must name chapters', () => {
  assert.deepEqual(normalizeModel(raw('mini-ship')).features.xrayChapters, ['night']);
  const r = raw('mini-ship'); r.features.xrayChapters = ['nope'];
  assert.match(validateModel(normalizeModel(r)).errors.map(e => e.msg).join(), /xrayChapters/);
  const r2 = raw('mini-ship'); r2.pieces[1].appear = '1800-01-01T00:00';
  assert.match(validateModel(normalizeModel(r2)).errors.map(e => e.msg).join(), /appear/);
});

test('the sourced share does not change when a track gets more estimated keys', async () => {
  const { classShares } = await import('../engine/model.js');
  const r = raw('mini-ship'), a = classShares(normalizeModel(r));
  const k = r.tracks[0].keys; r.tracks[0].keys = [k[0], { ...k[1] }, { at: '1912-04-15T01:30', v: k[1].v, confidence: 'estimated' }, { at: '1912-04-15T01:45', v: k[1].v, confidence: 'estimated' }, k[2]];
  const b = classShares(normalizeModel(r));
  assert.ok(Math.abs(a.sourced - b.sourced) < 0.06, `${a.sourced} vs ${b.sourced}`);
  assert.ok(Math.abs(a.sourced + a.estimated + a.disputed + a.projection - 1) < 1e-9);
});

test('a malformed time says so, instead of "outside every chapter"', () => {
  const zoned = errs(r => { r.tracks[0].keys[0].at = '1912-04-14T23:39+00:00'; });
  assert.match(zoned, /not a time Elapse reads/); assert.doesNotMatch(zoned, /outside every chapter/);
  assert.match(errs(r => { r.events[4].at = '1985'; }), /not a time Elapse reads/);
  assert.match(errs(r => { r.tracks[0].keys[0].at = '1900-01-01T00:00'; }), /outside every chapter/);
});

test('confidence "sourced" with sourceIds is accepted by Gate 1', async () => {
  const { runChecks } = await import('../engine/checks.js');
  const r = raw('mini-ship'); r.pieces[1].confidence = 'sourced';
  assert.deepEqual(runChecks(normalizeModel(r)).errors.filter(e => e.where === 'confidence'), []);
});

test('hull window spacing must be positive', () => {
  assert.match(errs(r => { r.pieces[1].params.windows[0].spacing = 0; }), /spacing/);
});
