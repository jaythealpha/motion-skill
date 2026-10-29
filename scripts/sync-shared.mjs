#!/usr/bin/env node
// Copy shared/ into every skill that uses it, so each installed skill stands alone.
//   node scripts/sync-shared.mjs [--check] [--root dir]
// .js/.mjs copies get a header saying where they come from; vendor files are copied byte for byte; shared/tests
// stays behind. --check changes nothing and exits 1 listing every stale or missing copy.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2), check = args.includes('--check');
const ri = args.indexOf('--root');
const ROOT = ri >= 0 ? resolve(args[ri + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = ['unfold', 'elapse'];
const SKIP = new Set(['tests', 'package.json', 'node_modules']);

function files(dir, base = dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    if (SKIP.has(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...files(p, base)); else out.push(relative(base, p));
  }
  return out;
}
const expected = rel => {
  const src = readFileSync(join(ROOT, 'shared', rel));
  if (/\.m?js$/.test(rel) && !rel.startsWith('vendor/'))
    return Buffer.concat([Buffer.from(`// Copied from shared/${rel} by scripts/sync-shared.mjs. Edit shared/, not this copy.\n`), src]);
  return src;
};

const stale = [], want = files(join(ROOT, 'shared'));
for (const skill of SKILLS) {
  if (!existsSync(join(ROOT, skill))) continue;
  // copies whose original is gone from shared/: flagged by --check, removed by a sync
  const copyDir = join(ROOT, skill, 'shared');
  if (existsSync(copyDir)) for (const rel of files(copyDir)) {
    if (want.includes(rel)) continue;
    const dest = join(copyDir, rel);
    if (check) { stale.push(relative(ROOT, dest) + ' (no longer in shared/)'); continue; }
    rmSync(dest); console.log(`removed ${relative(ROOT, dest)}`);
  }
  for (const rel of want) {
    const dest = join(ROOT, skill, 'shared', rel), want = expected(rel);
    const same = existsSync(dest) && readFileSync(dest).equals(want);
    if (same) continue;
    if (check) { stale.push(relative(ROOT, dest)); continue; }
    mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, want);
    console.log(`synced ${relative(ROOT, dest)}`);
  }
}
if (check) {
  if (stale.length) { console.log('stale or missing shared copies:\n  ' + stale.join('\n  ')); process.exit(1); }
  console.log('shared copies are up to date');
}
