#!/usr/bin/env node
// Capture the demo site's poster images from the built examples: the 3D stage only, with the page's overlays hidden.
//   node scripts/export-unfold/posters.mjs
// Writes scripts/export-unfold/docs/assets/<example>.png (4:3) and og.png (1200×630, for link previews).
import { openBrowser } from '../../shared/cdp.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url)), EX = resolve(HERE, '../../unfold/examples'), OUT = join(HERE, 'docs/assets');
mkdirSync(OUT, { recursive: true });
// the burst at t=6 shows the most parts at once; foldables open flat by then
const JOBS = readdirSync(EX).filter(f => f.endsWith('.html')).map(f => [f, 't=6&zoom=1.05', f.replace('.html', ''), 960, 720]);
JOBS.push(['galaxy-z-fold8.html', 't=6&zoom=1.5', 'og', 1200, 630]);

const B = await openBrowser({ tag: 'posters' });
for (const [file, q, name, w, h] of JOBS) {
  await B.S('Emulation.setDeviceMetricsOverride', { width: w, height: h + 200, deviceScaleFactor: 1, mobile: false });
  const l = B.nextLoad(15000); await B.S('Page.navigate', { url: pathToFileURL(join(EX, file)).href + '?' + q }); await l;
  await B.evaluate(`(async () => { for (let i = 0; i < 80 && !(window.__unfold || {}).ready; i++) await new Promise(r => setTimeout(r, 100));
    const s = document.createElement('style'); s.textContent = '.uf-view{display:none!important}'; document.head.appendChild(s); })()`);
  await B.sleep(900);
  const r = await B.evaluate(`(() => { const r = document.querySelector('.uf-stage').getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; })()`);
  // a crop of the stage at the poster's aspect, a little below centre: the exploded stack hangs low
  const cw = Math.min(r.w, r.h * w / h), ch = cw * h / w;
  const { data } = await B.S('Page.captureScreenshot', { format: 'png', clip: { x: r.x + (r.w - cw) / 2, y: r.y + Math.min(r.h - ch, (r.h - ch) / 2 + r.h * 0.08), width: cw, height: ch, scale: w / cw } });
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
  console.log(`poster ${name}.png`);
}
await B.cleanup();
