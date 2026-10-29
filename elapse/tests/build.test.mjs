import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), BUILD = resolve(HERE, '../scripts/build.mjs'), MODEL = resolve(HERE, 'fixtures/plain-ship.json');
const out = join(mkdtempSync(join(tmpdir(), 'build-')), 'p.html');
const run = (...a) => spawnSync(process.execPath, [BUILD, MODEL, out, ...a], { encoding: 'utf8' });

test('build accepts only pass, skipped or fail for --gate2', () => {
  assert.equal(run('--gate2', 'pass').status, 0);
  const r = run('--gate2', 'passed');
  assert.equal(r.status, 64); assert.match(r.stderr, /pass\|skipped\|fail/);
});
