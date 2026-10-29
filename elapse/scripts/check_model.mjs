#!/usr/bin/env node
// Gate 1: check a time model before anything is drawn.
//   node scripts/check_model.mjs model.json [--official LOA,BEAM,DEPTH] [--json]
// Schema and references, then chapters, confidence marks, the hull's size, water levels, the seabed, the wreck's
// layout, seating, overlaps, lights and branches. Exit 0 = pass, 1 = errors, 64 = usage.
import { readFileSync } from 'node:fs';
import { normalizeModel, sourcedShare } from '../engine/model.js';
import { runChecks } from '../engine/checks.js';

const args = process.argv.slice(2), asJson = args.includes('--json'), taken = new Set();
const fail1 = msg => { console.log(`GATE1 FAIL errors=1 warnings=0 sourced=0%\n  ERROR ${msg}`); process.exit(1); };
let official = null;
const oi = args.indexOf('--official');
if (oi >= 0) {
  taken.add(oi); taken.add(oi + 1);
  const v = String(args[oi + 1] ?? '').split(',').map(Number);
  if (v.length !== 3 || !v.every(x => isFinite(x) && x > 0)) fail1('args · --official: give the size as three numbers in metres: --official LOA,BEAM,DEPTH');
  official = { loa: v[0], beam: v[1], depth: v[2] };
}
const file = args.find((a, i) => !a.startsWith('--') && !taken.has(i));
if (!file) { console.error('usage: node scripts/check_model.mjs model.json [--official LOA,BEAM,DEPTH] [--json]'); process.exit(64); }

let model;
try { model = normalizeModel(JSON.parse(readFileSync(file, 'utf8'))); }
catch (e) { fail1(`model · cannot read ${file}: ${e.message}`); }

const { errors, warnings } = runChecks(model, { official });
const pct = Math.round(sourcedShare(model) * 100);
if (asJson) console.log(JSON.stringify({ pass: !errors.length, errors, warnings, sourced: pct }, null, 1));
else {
  console.log(`GATE1 ${errors.length ? 'FAIL' : 'PASS'} errors=${errors.length} warnings=${warnings.length} sourced=${pct}%`);
  for (const e of errors) console.log(`  ERROR ${e.where} · ${e.msg}`);
  for (const w of warnings) console.log(`  warn  ${w.where} · ${w.msg}`);
}
process.exit(errors.length ? 1 : 0);
