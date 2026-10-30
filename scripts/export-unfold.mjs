#!/usr/bin/env node
// Assemble the standalone Unfold repository (a Claude Code plugin plus a GitHub Pages demo) from this monorepo.
//   node scripts/export-unfold.mjs [outDir]          default: dist/unfold
// The monorepo stays the source of truth: edit unfold/ and shared/ here, then export again.
// Files the export does not own (.git, anything not listed below) are left alone in outDir.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(ROOT, 'dist/unfold'));
const SRC = join(ROOT, 'unfold'), TPL = join(ROOT, 'scripts/export-unfold');
// the plugin lives in its own folder, so an install copies the skill and not the demo site
const PLUGIN = join(OUT, 'plugins/unfold'), SKILL = join(PLUGIN, 'skills/unfold');
const version = JSON.parse(readFileSync(join(SRC, 'package.json'), 'utf8')).version;

// shared/ must be in sync before it is shipped
execFileSync(process.execPath, [join(ROOT, 'scripts/sync-shared.mjs'), '--check'], { stdio: 'inherit' });

// the parts of outDir the export owns are rebuilt from scratch
for (const p of ['plugins', 'skills', 'docs', '.claude-plugin', '.github']) rmSync(join(OUT, p), { recursive: true, force: true });
mkdirSync(SKILL, { recursive: true });

// the skill: everything but the built example pages, which live in docs/ for the demo
for (const d of ['engine', 'scripts', 'references', 'research', 'shared', 'tests']) cpSync(join(SRC, d), join(SKILL, d), { recursive: true });
mkdirSync(join(SKILL, 'examples'));
const examples = readdirSync(join(SRC, 'examples')).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
for (const m of examples) cpSync(join(SRC, 'examples', `${m}.json`), join(SKILL, 'examples', `${m}.json`));
for (const f of ['package.json', 'LICENSE', 'README.md']) cpSync(join(SRC, f), join(SKILL, f));
// the bundled shared code is edited in place in this repository: drop the monorepo's "copied from" header
for (const f of readdirSync(join(SKILL, 'shared'))) if (/\.m?js$/.test(f)) {
  const fp = join(SKILL, 'shared', f); writeFileSync(fp, readFileSync(fp, 'utf8').replace(/^\/\/ Copied from shared\/.*\n/, '')); }
const skillMd = readFileSync(join(SRC, 'SKILL.md'), 'utf8')
  .replace('copied from the repository\'s `shared/`', 'bundled with the skill')
  .replace('finished examples in `examples/`, each a `.json` and an `.html`.', 'finished example models in `examples/` (their built pages are in the repository\'s `docs/examples/`).')
  .replace(/\n- How a ship sank or a wreck changed over time → \*\*elapse\*\*\./, '');
if (/elapse|\.html`/.test(skillMd.split('## Rules')[0])) throw new Error('SKILL.md still points at files the export leaves out');
writeFileSync(join(SKILL, 'SKILL.md'), skillMd);

// the demo site
mkdirSync(join(OUT, 'docs/examples'), { recursive: true });
// built by the exported skill itself, so CI's "demo pages match a fresh build" check holds byte for byte.
// The examples passed Gate 2 here before export (unfold/examples/*.html carry the same result).
for (const m of examples) {
  if (!/"gate2":"pass"/.test(readFileSync(join(SRC, 'examples', `${m}.html`), 'utf8'))) throw new Error(`${m}: the monorepo build does not record a Gate 2 pass`);
  execFileSync(process.execPath, [join(SKILL, 'scripts/build.mjs'), join(SKILL, 'examples', `${m}.json`), join(OUT, 'docs/examples', `${m}.html`), '--gate2', 'pass'], { stdio: 'ignore' });
}
cpSync(join(TPL, 'docs'), join(OUT, 'docs'), { recursive: true });
// one card per example, with the numbers the page itself shows
const { normalizeModel, verifiedShare } = await import(join(SRC, 'engine/model.js'));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cards = examples.map(m => {
  const model = normalizeModel(JSON.parse(readFileSync(join(SRC, 'examples', `${m}.json`), 'utf8'))), p = model.product;
  const kind = p.fold ? (p.fold.axis === 'x' ? '위아래로 접는 폴더블' : '책처럼 접는 폴더블') : (p.access === 'front' ? '바 형태 · 화면 쪽으로 열기' : '바 형태 · 뒷면으로 열기');
  const pct = Math.round(verifiedShare(model) * 100);
  return `    <a class="card" href="examples/${m}.html"><img src="assets/${m}.png" alt="${esc(p.name.ko)} 분해 장면" loading="lazy"><div><b>${esc(p.name.ko)}</b><small>${kind}</small>`
    + `<div class="chips"><span class="chip">부품 ${model.parts.length}개</span><span class="chip">${model.steps.length}단계</span><span class="chip ${pct >= 50 ? 'v' : 'e'}">자료 확인 ${pct}%</span></div></div></a>`;
}).join('\n');
const indexPath = join(OUT, 'docs/index.html');
writeFileSync(indexPath, readFileSync(indexPath, 'utf8').replace('<!--CARDS-->', cards));
for (const m of examples) if (!existsSync(join(OUT, 'docs/assets', `${m}.png`))) throw new Error(`missing poster docs/assets/${m}.png (run node scripts/export-unfold/posters.mjs)`);
writeFileSync(join(OUT, 'docs/.nojekyll'), '');

// plugin manifests, issue forms and the top-level files
cpSync(join(TPL, 'github'), join(OUT, '.github'), { recursive: true });
mkdirSync(join(OUT, '.claude-plugin')); mkdirSync(join(PLUGIN, '.claude-plugin'));
const meta = {
  name: 'unfold',
  description: 'Name a phone and get one offline HTML page where a time bar takes it apart and puts it back together, with every part marked sourced or estimated.',
  version,
  author: { name: 'jaythealpha' },
  homepage: 'https://jaythealpha.github.io/unfold/',
  repository: 'https://github.com/jaythealpha/unfold',
  license: 'MIT',
  keywords: ['teardown', 'exploded-view', 'assembly', 'smartphone', 'three.js', 'skill'],
};
writeFileSync(join(PLUGIN, '.claude-plugin/plugin.json'), JSON.stringify(meta, null, 2) + '\n');
writeFileSync(join(OUT, '.claude-plugin/marketplace.json'), JSON.stringify({
  name: 'unfold', owner: { name: 'jaythealpha' }, description: meta.description,
  plugins: [{ name: 'unfold', description: meta.description, version, source: './plugins/unfold', author: meta.author }],
}, null, 2) + '\n');
for (const f of readdirSync(TPL)) if (/\.(md|txt)$/.test(f) || f === 'LICENSE' || f === 'gitignore')
  cpSync(join(TPL, f), join(OUT, f === 'gitignore' ? '.gitignore' : f));

// nothing personal or machine-specific may leave this machine
const leaks = (() => { try { return execFileSync('grep', ['-rIl', '-e', '/Users/', '-e', 'okyoutobeyou', OUT, '--exclude-dir=.git'], { encoding: 'utf8' }).trim(); } catch { return ''; } })();
if (leaks) throw new Error(`personal paths or addresses in:\n${leaks}`);
console.log(`exported unfold ${version} (${examples.length} examples) to ${OUT}`);
