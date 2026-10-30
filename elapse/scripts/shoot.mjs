#!/usr/bin/env node
// Gate 2: open a built Elapse page in headless Chrome (over the DevTools protocol, no npm packages), shoot it
// across chapters, events, styles, x-ray, languages and a phone viewport, check each shot, and make contact sheets.
//   node scripts/shoot.mjs page.html outDir [--quick] [--only "t=30&yaw=200"]... [--scale N]
// Prints GATE2 PASS | FAIL | SKIPPED.  Exit 0 pass, 1 fail, 2 skipped (no Chrome or Node < 22).
import { mkdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { openBrowser, shooter, writeSheets } from '../shared/cdp.mjs';

const args = process.argv.slice(2), quick = args.includes('--quick');
const only = [], taken = new Set(); let scale = 1;
args.forEach((a, i) => { if (a === '--only') { only.push(args[i + 1] ?? ''); taken.add(i + 1); } if (a === '--scale') { scale = Math.max(1, Math.min(4, +args[i + 1] || 1)); taken.add(i + 1); } });
const [page, outDir] = args.filter((a, i) => !a.startsWith('--') && !taken.has(i));
if (!page || !outDir) { console.error('usage: node scripts/shoot.mjs page.html outDir [--quick] [--only "query"] [--scale N]'); process.exit(64); }

mkdirSync(outDir, { recursive: true });
const B = await openBrowser({ tag: 'elapse' });
const { evaluate, cleanup, bail } = B;
try {
const base = pathToFileURL(resolve(page)).href;
const CHECK = `(async () => {
  for (let i = 0; i < 100 && !(window.__elapse && (window.__elapse.ready || window.__elapse.errors.length)); i++) await new Promise(r => setTimeout(r, 100));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await new Promise(r => setTimeout(r, 300));
  const u = window.__elapse || { errors: ['no __elapse'] }, out = { errors: [...(u.errors || [])], problems: [] };
  if (!u.ready) { out.problems.push('page did not finish starting'); return out; }
  if (document.documentElement.scrollWidth > innerWidth + 1) out.problems.push('horizontal scroll: ' + document.documentElement.scrollWidth + ' > ' + innerWidth);
  const cv = document.querySelector('.el-stage canvas');
  if (cv) { const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d'); g.drawImage(cv, 0, 0, 48, 48);
    const d = g.getImageData(0, 0, 48, 48).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] >> 4 << 8 | d[i+1] >> 4 << 4 | d[i+2] >> 4);
    if (seen.size < 6) out.problems.push('canvas looks blank (' + seen.size + ' colours)'); }
  const stage = document.querySelector('.el-stage')?.getBoundingClientRect();
  for (const el of document.querySelectorAll('.el-card:not([hidden]), .el-gauges .el-g, .el-proj:not([hidden])')) { const r = el.getBoundingClientRect();
    if (stage && (r.left < stage.left - 1 || r.right > stage.right + 1 || r.top < stage.top - 1 || r.bottom > stage.bottom + 1)) out.problems.push('outside the stage: ' + el.className + ' "' + el.textContent.slice(0, 30) + '"'); }
  for (const el of document.querySelectorAll('.el-card h3, .el-card p, .el-g, .el-chapters button, .el-actions button')) {
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).textOverflow !== 'ellipsis') out.problems.push('text overflows: "' + el.textContent.slice(0, 30) + '"'); }
  out.frame = u.R.frame();
  return out; })()`;
const { shot: rawShot, shots } = shooter({ ...B, base, outDir, check: CHECK, scale });
// every stage view must show what the camera follows: at least 60% of its box on screen, covering 2% of the stage
async function shot(name, params, opts = {}, { frame = true } = {}) {
  const r = await rawShot(name, params, opts);
  const f = r.frame, who = f?.ids ? ` following ${f.ids.map(i => `'${i}'`).join(', ')}` : '';
  if (frame && f && !r.errors.length && (f.inside < 0.6 || f.area < 0.02)) {
    const msg = `subject out of frame (inside ${(f.inside * 100).toFixed(0)}%, area ${(f.area * 100).toFixed(1)}%)${who}; add a camera key that holds the target before switching`;
    shots.at(-1).problems.push(msg); console.log(`FAIL ${name}  ${msg}`);
  }
  // a wreck seen from above the sea through the translucent surface floats in a void: keep the eye underwater
  if (frame && f && !r.errors.length && f.eyeZ > 0 && f.subjectTop < -10) {
    const msg = `camera above the sea while what it follows${who} lies ${Math.round(-f.subjectTop)} m down; lower the pitch or distance so the eye is underwater`;
    shots.at(-1).problems.push(msg); console.log(`FAIL ${name}  ${msg}`);
  }
  return r;
}
const flag = (name, file, problem) => { console.log(`FAIL ${name}  ${problem}`); shots.push({ name, file, errors: [], problems: [problem] }); };

if (only.length) {
  for (const q of only) { const name = 'view-' + q.replace(/[^a-z0-9]+/gi, '_').slice(0, 60); await rawShot(name, Object.fromEntries(new URLSearchParams(q))); console.log(`view: ${join(outDir, name + '.png')}`); }
  await cleanup(); process.exit(0);
}

await shot('ch1-start', { t: 0 });
const M = await evaluate(`(() => { const m = window.__elapse.model; return { chapters: m.chapters.map(c => ({ id: c.id, bar: c.bar })),
  events: m.events.map(e => ({ id: e.id, kind: e.kind, t: e._t })), features: m.features }; })()`);
const evName = e => 'ev-' + e.id.replace(/[^a-z0-9-]+/gi, '_');
for (const [i, c] of M.chapters.entries()) {        // --quick keeps every chapter's start and end, and drops the rest
  if (i) await shot(`ch${i + 1}-start`, { t: c.bar[0] + 0.01 });
  await shot(`ch${i + 1}-end`, { t: c.bar[1] - 0.3 });
  if (!quick) await shot(`ch${i + 1}-mid`, { t: (c.bar[0] + c.bar[1]) / 2 });
}
if (!quick) {
  for (const e of M.events) await shot(evName(e), { t: Math.min(100, e.t + 0.05) });
  for (const style of ['color', 'blueprint']) for (const t of [0, 25, 50, 75, 100]) await shot(`${style}-t${t}`, { t, style });
  if (M.features.compartments) { const xc = M.chapters.filter(c => (M.features.xrayChapters || []).includes(c.id)), a = (xc[0] || M.chapters[0]).bar[0], b = (xc.at(-1) || M.chapters[0]).bar[1];
    for (const f of [0.3, 0.6, 0.9]) for (const x of ['1', '0']) await shot(`xray${x === '1' ? 'on' : 'off'}-t${Math.round(a + (b - a) * f)}`, { t: a + (b - a) * f, xray: x }); }
  for (const yaw of [90, 180, 300]) await shot(`angle-yaw${yaw}`, { t: 20, yaw, pitch: 25 });
  await shot('lang-en', { t: 30, lang: 'en' });
  await shot('panel-sources', { t: 60, panel: 'sources' }, {}, { frame: false });
  await shot('panel-about', { t: 60, panel: 'about' }, {}, { frame: false });
  await shot('simple-t35', { t: 35, depth: 'simple' });
}
for (const t of quick ? [50] : [10, 50, 80]) await shot(`phone-t${t}`, { t }, { w: 375, h: 812, mobile: true });

// optional features: checked only when the model turns them on
const probe = () => evaluate('window.__elapse.R.probe()');
const out = M.events.find(e => e.kind === 'lightsOut');
if (M.features.lights && out) {
  await shot('lights-before', { t: Math.max(0, out.t - 1), xray: 0, style: 'color' }); const a = await probe();
  await shot('lights-after', { t: Math.min(100, out.t + 1), xray: 0, style: 'color' }); const b = await probe();
  const ok = a.warm >= 12 && b.warm <= 3;
  console.log(`${ok ? 'ok  ' : 'FAIL'} lights  warm pixels ${a.warm} before, ${b.warm} after the lights go out`);
  if (!ok) flag('lights', 'lights-before.png', `lit windows should show before the lights go out and not after (warm pixels ${a.warm} → ${b.warm})`);
} else console.log('skip lights (feature off)');
const spill = M.events.find(e => e.kind === 'overflow');
if (M.features.compartments && spill) {
  await shot('water-on', { t: Math.min(100, spill.t + 1), xray: 1 }); const w = await probe();
  console.log(`${w.water > 60 ? 'ok  ' : 'FAIL'} water  ${w.water} water pixels in x-ray after the first overflow`);
  if (w.water <= 60) flag('water', 'water-on.png', 'no water visible in the compartments in x-ray after the first overflow');
} else console.log('skip water (feature off)');
const pc = M.features.projection && M.chapters.find(c => (M.features.projectionChapters || []).includes(c.id));
if (pc) {
  await shot('projection', { t: (pc.bar[0] + pc.bar[1]) / 2 }); const shown = await evaluate("!document.querySelector('.el-proj').hidden");
  await shot('projection-off', { t: 0 }); const hidden = await evaluate("document.querySelector('.el-proj').hidden");
  console.log(`${shown && hidden ? 'ok  ' : 'FAIL'} projection badge  shown in its chapter: ${shown}, hidden at 0: ${hidden}`);
  if (!(shown && hidden)) flag('projection', 'projection.png', 'the projection badge must show in the projection chapter and nowhere else');
} else console.log('skip projection (feature off)');

// playback speed: each speed covers the whole bar in its own time (1× 60 s, 2× 30 s, 3× 20 s, 5× 12 s)
for (const [speed, secs] of quick ? [['slow', 30]] : [['xslow', 60], ['slow', 30], ['normal', 20], ['fast', 12]]) {
  await shot(`speed-${speed}`, { t: 10, speed, play: 1 });
  const moved = await evaluate(`(async () => { const t0 = window.__elapse.st.t, p0 = performance.now(); await new Promise(r => setTimeout(r, 2000));
    return { dt: window.__elapse.st.t - t0, secs: (performance.now() - p0) / 1000 }; })()`);
  const expect = moved.secs * 100 / secs, ok = Math.abs(moved.dt - expect) < Math.max(2, expect * 0.3);
  console.log(`${ok ? 'ok  ' : 'FAIL'} speed-${speed}  moved ${moved.dt.toFixed(1)} in ${moved.secs.toFixed(1)} s (expected ~${expect.toFixed(1)})`);
  if (!ok) flag(`speed-${speed}-rate`, `speed-${speed}.png`, 'playback speed is off');
}

// key shots by what the model has: the start, the strike, water, the break, the first year on the seabed, the end
const brk = M.events.find(e => e.kind === 'break'), hit = M.events.find(e => e.kind === 'collision'), lastEv = M.events.at(-1);
const firstYear = M.chapters.findIndex(c => c.unit === 'year');
await writeSheets({ ...B, outDir, title: basename(page), shots,
  key: [...new Set(['ch1-start', hit && evName(hit), 'water-on', brk ? evName(brk) : `ch${Math.max(1, firstYear)}-end`, firstYear >= 0 && `ch${firstYear + 1}-start`,
    lastEv && evName(lastEv), 'phone-t50', 'lang-en'].filter(Boolean))].filter(k => shots.some(s => s.name === k)) });
await cleanup();
const failed = shots.filter(s => s.errors.length + s.problems.length);
console.log(`contact sheet: ${join(outDir, 'contact.png')} · key shots: ${join(outDir, 'key.png')}`);
console.log(failed.length ? `GATE2 FAIL (${failed.length} of ${shots.length} shots)` : `GATE2 PASS (${shots.length} shots)`);
process.exit(failed.length ? 1 : 0);
} catch (e) { await bail(`GATE2 FAIL (${e.message})`); }
