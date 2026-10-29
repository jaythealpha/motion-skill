import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../../scripts/sync-shared.mjs');
const run = (root, ...a) => spawnSync(process.execPath, [SCRIPT, '--root', root, ...a], { encoding: 'utf8' });

function tree() {
  const root = mkdtempSync(join(tmpdir(), 'sync-'));
  mkdirSync(join(root, 'shared/vendor'), { recursive: true }); mkdirSync(join(root, 'shared/tests'));
  writeFileSync(join(root, 'shared/a.js'), 'export const a = 1;\n');
  writeFileSync(join(root, 'shared/vendor/v.min.js'), 'VENDOR');
  writeFileSync(join(root, 'shared/tests/x.test.mjs'), '');
  mkdirSync(join(root, 'unfold')); mkdirSync(join(root, 'elapse'));
  return root;
}

test('sync copies with a header, vendor byte for byte, no tests', () => {
  const root = tree();
  assert.equal(run(root).status, 0);
  const a = readFileSync(join(root, 'elapse/shared/a.js'), 'utf8');
  assert.match(a, /^\/\/ Copied from shared\/a\.js by scripts\/sync-shared\.mjs\. Edit shared\/, not this copy\.\n/);
  assert.equal(readFileSync(join(root, 'unfold/shared/vendor/v.min.js'), 'utf8'), 'VENDOR');
  assert.throws(() => readFileSync(join(root, 'unfold/shared/tests/x.test.mjs')));
  assert.equal(run(root, '--check').status, 0);
});

test('--check flags a stale copy', () => {
  const root = tree();
  run(root);
  appendFileSync(join(root, 'unfold/shared/a.js'), '// edited\n');
  const r = run(root, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stdout + r.stderr, /unfold\/shared\/a\.js/);
});

test('an orphan copy is flagged by --check and removed by a sync', () => {
  const root = tree();
  run(root);
  writeFileSync(join(root, 'elapse/shared/old.js'), '// gone from shared/\n');
  const r = run(root, '--check');
  assert.equal(r.status, 1); assert.match(r.stdout, /elapse\/shared\/old\.js/);
  assert.equal(run(root).status, 0);
  assert.equal(run(root, '--check').status, 0);
});
