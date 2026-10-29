import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { raw } from './load.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), CLI = resolve(HERE, '../scripts/check_model.mjs'), TMP = mkdtempSync(join(tmpdir(), 'gate1-'));
const gate = (file, ...a) => { const r = spawnSync(process.execPath, [CLI, file, ...a], { encoding: 'utf8' }); return { code: r.status, out: r.stdout + r.stderr }; };
const variant = (name, mut, base = 'mini-ship') => { const r = raw(base); mut(r); const f = join(TMP, name + '.json'); writeFileSync(f, JSON.stringify(r)); return f; };
const fixture = n => resolve(HERE, 'fixtures', n + '.json');

test('mini-ship passes', () => {
  const r = gate(fixture('mini-ship'));
  assert.equal(r.code, 0, r.out); assert.match(r.out, /^GATE1 PASS errors=0 warnings=\d+ sourced=\d+%/);
});

test('plain ship passes', () => {
  const r = gate(fixture('plain-ship'), '--official', '100,14,9');
  assert.equal(r.code, 0, r.out); assert.match(r.out, /^GATE1 PASS/);
});

test('--official 2% off fails dims', () => {
  const r = gate(fixture('mini-ship'), '--official', '204,20,15');
  assert.equal(r.code, 1); assert.match(r.out, /ERROR dims/);
});

const FAILS = {
  water: r => { r.events = r.events.filter(e => e.kind !== 'overflow'); },
  seabed: r => { r.tracks[2].keys[2].v.pos[2] = -3900; },
  wreck: r => { r.tracks[1].keys[2].v.pos = [2000, 80, -3800]; },
  'confidence-projection': r => { r.events[6].confidence = undefined; r.events[6].sourceIds = ['s1']; },
  'confidence-disputed': r => { delete r.events[3].alternatives; },
  seating: r => { r.pieces[3].offset = [30, 0, 18]; },
  chapters: r => { r.chapters[2].start = '1912-04-15T02:30'; r.chapters[1].end = '1912-04-15T02:50'; },
  lights: r => { r.tracks[5].keys[2].v = 0.4; },
  features: r => { r.events = r.events.filter(e => e.kind !== 'break'); },
};
for (const [name, mut] of Object.entries(FAILS)) test(`${name} fails`, () => {
  const r = gate(variant(name, mut)), check = name.split('-')[0];
  assert.equal(r.code, 1, r.out); assert.match(r.out, /^GATE1 FAIL/);
  assert.match(r.out, new RegExp(`ERROR ${check}`), r.out);
});

test('usage and unreadable input', () => {
  assert.equal(gate('').code, 64);
  const r = gate(join(TMP, 'missing.json')); assert.equal(r.code, 1); assert.match(r.out, /GATE1 FAIL/);
});

test('a heeled hull resting on the seabed passes without extra embed (the check follows the hull, not its box)', () => {
  const f = variant('heeled', r => {
    r.pieces.find(p => p.id === 'hull').embed = undefined;
    // on her side with 25° trim: the hull just touches the 120 m seabed while its box would dig 6 m deeper
    r.tracks[0].keys[3].v = { pos: [20, 0, -99], trim: 25, list: 80, heading: 30 };   // hull low point -120.3 m; its box would reach -126.4
  }, 'plain-ship');
  const r = gate(f); assert.equal(r.code, 0, r.out);
});

test('a vanished piece is no longer checked against the seabed', () => {
  const f = variant('vanished', r => {
    r.events.push({ id: 'gone-house', kind: 'collapse', at: '1916-11-21T08:30', until: '1916-11-21T08:31', piece: 'house', mode: 'vanish', title: 'gone', text: 'gone', confidence: 'estimated' });
    r.pieces.find(p => p.id === 'house').offset = [0, 0, 9];
    r.tracks[0].keys[3].v.pos[2] = -121;   // the hull sinks 1 m into its 3 m embed; the house would go deeper than its own
    r.pieces.find(p => p.id === 'hull').embed = 3;
  }, 'plain-ship');
  const r = gate(f); assert.doesNotMatch(r.out, /'house' goes/, r.out);
});

test('an inflow event lets water rise above a bulkhead top', () => {
  const f = variant('inflow', r => {
    r.events = r.events.filter(e => e.kind !== 'overflow');
    r.events.push({ id: 'ports', kind: 'inflow', at: '1912-04-15T00:10', piece: 'c1', title: 'Portholes', text: 'Water enters through open portholes.', sourceIds: ['s1'] });
    r.tracks[4].keys = r.tracks[4].keys.map(k => ({ ...k, v: Math.min(k.v, 8.9) }));
  });
  const r = gate(f); assert.equal(r.code, 0, r.out);
});

test('wreck.poses checks a piece’s final attitude', () => {
  const ok = gate(variant('pose-ok', r => { r.wreck = { poses: [{ piece: 'ship', list: 80, heading: 30, tol: 10 }] }; r.pieces[1].embed = 8; }, 'plain-ship'));
  assert.equal(ok.code, 0, ok.out);
  const bad = gate(variant('pose-bad', r => { r.wreck = { poses: [{ piece: 'ship', list: 0, tol: 10 }] }; r.pieces[1].embed = 8; }, 'plain-ship'));
  assert.equal(bad.code, 1); assert.match(bad.out, /ERROR wreck/);
});

test('a wreck that never reaches the seabed fails', () => {
  const r = gate(variant('floating', r => { r.tracks[1].keys[2].v.pos[2] = -2000; r.tracks[2].keys[2].v.pos[2] = -2000; r.wreck = undefined; r.features.break = false; }));
  assert.equal(r.code, 1, r.out); assert.match(r.out, /ERROR seabed · 'bow' ends .* above the seabed/);
});

test('a ship that breaks needs its recorded final layout', () => {
  const r = gate(variant('no-layout', r => { delete r.wreck; }));
  assert.equal(r.code, 1); assert.match(r.out, /ERROR features · .*wreck/);
});

test('the memorial note and http(s) source links are required', () => {
  const a = gate(variant('no-about', r => { delete r.meta.about; }));
  assert.equal(a.code, 1); assert.match(a.out, /ERROR meta · /);
  const b = gate(variant('bad-url', r => { r.sources[0].url = 'ftp://example.org/x'; }));
  assert.equal(b.code, 1); assert.match(b.out, /ERROR sources · /);
});
