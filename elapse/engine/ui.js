// Page shell: header with the confidence shares, toggles, the stage (canvas, event card, gauges), the chaptered
// time bar, chapter buttons, the branch switch, panels and exports.
import { createRenderer } from './render.js';
import { strings, pick } from './i18n.js';
import { classShares, WARN_SHARE } from './model.js';
import { chapterAt, formatTime } from './chapters.js';
import { subjectBox, frameSubject } from './camera.js';
import { SPEEDS, advance, stepSpeed } from '../shared/speeds.js';
import { CLASSES, classOf, badge } from '../shared/confidence.js';

const CSS = `
.el{--ink:#15171c;--muted:#626a76;--line:#d9dee6;--panel:#fff;--accent:#ff5a36;
  font:14px/1.45 system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:var(--ink);max-width:1180px;margin:0 auto;padding:18px 18px 28px;box-sizing:border-box}
.el *{box-sizing:border-box}
body{margin:0;background:linear-gradient(180deg,#f2f4f7,#e3e8ee);min-height:100vh}
.el-top{display:flex;justify-content:space-between;align-items:flex-end;gap:10px 20px;flex-wrap:wrap;margin-bottom:10px}
.el-top h1{font-size:22px;letter-spacing:-.01em;margin:0}
.el-sub{color:var(--muted);font-size:12.5px;margin-top:2px}
.el-trust{all:unset;cursor:pointer;display:flex;gap:6px;flex-wrap:wrap;font-size:12.5px}
.el-trust:focus-visible{outline:2px solid var(--ink);outline-offset:3px;border-radius:999px}
.cf-badge{display:inline-block;padding:3px 9px;border-radius:999px;background:var(--panel);border:1px solid var(--line);font-size:12px;white-space:nowrap}
.cf-sourced{border-color:#9bd3b4;background:#effaf3}.cf-estimated{border-color:#f1cf9a;background:#fff7ea}
.cf-disputed{border-color:#c7b2ef;background:#f5f0ff}.cf-projection{border-color:#9cc3ef;background:#eef5ff}
.el-warn{background:#fff3df;border:1px solid #f0c27a;color:#6b4500;border-radius:10px;padding:8px 12px;font-size:13px;margin:0 0 10px}
.el-controls{display:flex;gap:10px 18px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.el-seg{display:inline-flex;align-items:center;gap:8px}
.el-seg>b{font-size:11.5px;color:var(--muted);font-weight:600}
.el-seg div{display:inline-flex;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:2px}
.el-seg button{all:unset;cursor:pointer;padding:5px 11px;border-radius:8px;font-size:13px;white-space:nowrap}
.el-seg button[aria-pressed=true]{background:var(--ink);color:#fff}
.el-seg button:focus-visible{outline:2px solid var(--accent)}
.el-stage{position:relative;height:min(64vh,620px);border-radius:16px;overflow:hidden;background:#0b1420;border:1px solid var(--line);touch-action:none;user-select:none}
.el-stage canvas{width:100%;height:100%;display:block;cursor:grab}
.el-card{position:absolute;left:12px;top:12px;max-width:min(380px,calc(100% - 24px));background:rgba(255,255,255,.95);border-radius:12px;padding:10px 13px;box-shadow:0 6px 22px rgba(0,0,0,.18);font-size:13px}
.el-card h3{margin:0 0 4px;font-size:15px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;overflow-wrap:anywhere}
.el-card p{margin:4px 0;overflow-wrap:anywhere}.el-card .alt{color:#4b3a7a}.el-card .src{color:var(--muted);font-size:12px}
.el-card .src a{color:inherit}
.el-gauges{position:absolute;right:12px;top:12px;display:flex;flex-direction:column;gap:8px;align-items:flex-end;max-width:calc(100% - 24px)}
.el-g{background:rgba(10,18,30,.72);color:#eef3fa;border-radius:10px;padding:7px 10px;font-size:12px;min-width:120px}
.el-g b{display:block;font-size:10.5px;color:#9fb0c4;font-weight:600;letter-spacing:.02em}
.el-g .big{font-size:18px;font-weight:650;font-variant-numeric:tabular-nums}
.el-levels{display:flex;gap:3px;align-items:flex-end;height:54px;margin-top:4px}
.el-levels i{position:relative;width:9px;height:100%;background:rgba(255,255,255,.12);border-radius:2px;overflow:hidden}
.el-levels i s{position:absolute;left:0;right:0;bottom:0;background:#3d8bff}
.el-levels i.pulse{outline:2px solid #ffd27a}
.el-depthbar{position:relative;width:100%;height:6px;background:rgba(255,255,255,.15);border-radius:3px;margin-top:5px;overflow:hidden}
.el-depthbar s{position:absolute;left:0;top:0;bottom:0;background:#6fb1ff}
.el-proj{position:absolute;left:12px;bottom:12px;background:#1f4f8f;color:#fff;border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:600}
.el-lightnote{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);background:rgba(0,0,0,.55);color:#dfe8f2;border-radius:8px;padding:4px 10px;font-size:11.5px;max-width:calc(100% - 200px);text-align:center}
.el-view{position:absolute;right:12px;bottom:12px;display:flex;gap:6px}
.el-view button{all:unset;cursor:pointer;background:rgba(255,255,255,.9);border-radius:8px;padding:5px 9px;font-size:12px}
.el-view button[aria-pressed=true]{background:var(--ink);color:#fff}
.el-bar{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;margin-top:12px}
.el-pl{display:flex;gap:6px;align-items:center}
.el-play{all:unset;cursor:pointer;width:38px;height:38px;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:14px}
.el-pl select{font:inherit;font-size:12.5px;padding:4px;border-radius:8px;border:1px solid var(--line);background:var(--panel)}
.el-track{position:relative;height:46px}
.el-bands{position:absolute;left:0;right:0;top:0;height:16px}
.el-bands span{position:absolute;top:0;height:16px;font-size:10.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:4px;border-left:1px solid #b8c1cc}
.el-track input{position:absolute;left:0;right:0;top:18px;width:100%;margin:0;accent-color:var(--ink)}
.el-ticks{position:absolute;left:0;right:0;top:38px;height:8px;pointer-events:none}
.el-ticks i{position:absolute;width:2px;height:7px;background:#ff5a36;border-radius:1px;transform:translateX(-1px)}
.el-ticks i.ch{background:#15171c;height:8px}
.el-now{font-variant-numeric:tabular-nums;font-size:13px;min-width:120px;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:42vw}
.el-chapters,.el-branch,.el-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.el-chapters button,.el-branch button,.el-actions button{all:unset;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-size:12.5px}
.el-chapters button[aria-current=true],.el-branch button[aria-pressed=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
.el-actions button:disabled{opacity:.5;cursor:default}
.el-panel{margin-top:12px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 16px;font-size:13px}
.el-panel h2{font-size:15px;margin:0 0 8px;display:flex;justify-content:space-between;gap:10px}
.el-panel h2 button{all:unset;cursor:pointer;font-size:12.5px;color:var(--muted)}
.el-panel li{margin:3px 0;overflow-wrap:anywhere}
@media (max-width:640px){.el{padding:12px 16px 22px}.el-stage{height:58vh}.el-bar{grid-template-columns:auto 1fr}.el-now{grid-column:1/-1;text-align:left;max-width:none}
  .el-g{min-width:96px;padding:5px 8px}.el-levels{height:36px}.el-card{font-size:12.5px;max-width:calc(100% - 24px)}.el-gauges{top:auto;bottom:52px}.el-lightnote{display:none}}
`;

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mountElapse(root, model, params = {}) {
  const st = { lang: params.lang === 'en' ? 'en' : 'ko', depth: params.depth === 'simple' ? 'simple' : 'detail',
    style: params.style === 'blueprint' ? 'blueprint' : 'color', t: 0, playing: false, speed: SPEEDS[params.speed] ? params.speed : 'normal',
    xray: params.xray === '1' ? true : params.xray === '0' ? false : null, branch: params.branch === 'b' && model.branches.length ? 'b' : 'a' };
  const errors = window.__elapse?.errors || [];
  let L = strings(st.lang);
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  root.className = 'el';
  root.innerHTML = `
    <header class="el-top"><div><h1></h1><div class="el-sub"></div></div><button class="el-trust" type="button"></button></header>
    <div class="el-warn" hidden></div>
    <div class="el-controls"></div>
    <div class="el-stage"><canvas></canvas><div class="el-card" hidden></div><div class="el-gauges"></div>
      <div class="el-proj" hidden></div><div class="el-lightnote" hidden></div>
      <div class="el-view"><button type="button" data-v="auto"></button><button type="button" data-v="reset"></button></div></div>
    <div class="el-bar"><div class="el-pl"><button class="el-play" type="button"></button><select></select></div>
      <div class="el-track"><div class="el-bands"></div><input type="range" min="0" max="100" step="0.05" value="0"><div class="el-ticks"></div></div>
      <div class="el-now"></div></div>
    <div class="el-chapters"></div>
    <div class="el-branch" hidden></div>
    <div class="el-actions"></div>
    <aside class="el-panel" hidden></aside>`;
  const $ = s => root.querySelector(s);
  const canvas = $('canvas'), range = $('.el-track input');
  const num = k => params[k] != null && isFinite(+params[k]) ? +params[k] : undefined;
  const R = createRenderer(canvas, model, { auto: params.auto !== '0', yaw: num('yaw'), pitch: num('pitch'), zoom: num('zoom'), onManual: () => viewButtons() });
  const cs = classShares(model), shares = Object.fromEntries(CLASSES.map(c => [c, Math.round(100 * cs[c])]));
  const projCh = new Set(model.features.projectionChapters || []);
  const comps = model.pieces.filter(p => p.template === 'compartment' && model.tracks.some(tr => tr.piece === p.id && tr.prop === 'water'));
  const bulkTop = c => { const b = model.pieces.find(p => p.template === 'bulkhead' && p.parent === c.parent && (Math.abs(p.params.x - c.params.x0) < 0.01 || Math.abs(p.params.x - c.params.x1) < 0.01)); return b?.params.top ?? c.params.top ?? model.subject.dims.depth; };
  const sources = new Map(model.sources.map(s => [s.id, s]));
  // events with card: false only move pieces; they get no card and no tick
  const cards = model.events.filter(e => e.card !== false);

  function chrome() {
    L = strings(st.lang); document.documentElement.lang = st.lang;
    $('.el-top h1').textContent = pick(model.subject.name, st.lang);
    $('.el-sub').textContent = model.meta.interpretation ? L.interpreted(pick(model.meta.interpretation, st.lang)) : '';
    $('.el-trust').innerHTML = CLASSES.filter(c => shares[c] || c === 'sourced').map(c => `<span class="cf-badge cf-${c}">${L.share(L[c], shares[c])}</span>`).join('');
    $('.el-trust').setAttribute('aria-label', L.sources);
    const pct = shares.sourced, warn = $('.el-warn'); warn.hidden = pct >= WARN_SHARE * 100; warn.textContent = L.warn(pct);
    const seg = (key, opts, cur, lab = o => L[o]) => `<span class="el-seg"><b>${L[key]}</b><div role="group" aria-label="${L[key]}">${opts.map(o => `<button type="button" data-k="${key}" data-o="${o}" aria-pressed="${cur === o}">${lab(o)}</button>`).join('')}</div></span>`;
    $('.el-controls').innerHTML = seg('style', ['color', 'blueprint'], st.style) + seg('xray', ['on', 'off'], xrayNow() ? 'on' : 'off') + seg('depth', ['simple', 'detail'], st.depth)
      + `<span class="el-seg"><div role="group" aria-label="language">${['ko', 'en'].map(o => `<button type="button" data-k="lang" data-o="${o}" aria-pressed="${st.lang === o}">${o.toUpperCase()}</button>`).join('')}</div></span>`;
    $('.el-pl select').innerHTML = Object.keys(SPEEDS).map(k => `<option value="${k}"${st.speed === k ? ' selected' : ''}>${L[k]}</option>`).join('');
    $('.el-pl select').setAttribute('aria-label', L.speed);
    $('.el-bands').innerHTML = model.chapters.map(c => `<span style="left:${c.bar[0]}%;width:${c.bar[1] - c.bar[0]}%" title="${esc(pick(c.name, st.lang))}">${esc(pick(c.name, st.lang))}</span>`).join('');
    $('.el-ticks').innerHTML = cards.map(e => `<i style="left:${e._t}%" title="${esc(pick(e.title, st.lang))}"></i>`).join('') + model.chapters.slice(1).map(c => `<i class="ch" style="left:${c.bar[0]}%"></i>`).join('');
    $('.el-chapters').innerHTML = model.chapters.map((c, i) => `<button type="button" data-ch="${i}">${i + 1}. ${esc(pick(c.name, st.lang))}</button>`).join('');
    const br = $('.el-branch'); br.hidden = !model.branches.length;
    if (model.branches.length) br.innerHTML = `<span class="el-seg"><b>${L.branch}</b></span>` + [['a', model.meta.baseName || { ko: '기본', en: 'Base' }], ['b', model.branches[0].name]]
      .map(([id, n]) => `<button type="button" data-br="${id}" aria-pressed="${st.branch === id}">${esc(pick(n, st.lang))}</button>`).join('');
    $('.el-actions').innerHTML = `<button type="button" data-a="png">${L.png}</button><button type="button" data-a="video"${st.recording ? ' disabled' : ''}>${st.recording ? L.recording : L.video}</button><button type="button" data-a="sources">${L.sources}</button><button type="button" data-a="about">${L.about}</button>`;
    viewButtons(); playButton(); if (!$('.el-panel').hidden) panel(st.panel); setT(st.t, true);
  }
  const viewButtons = () => { $('.el-view [data-v=auto]').textContent = L.autoCam; $('.el-view [data-v=auto]').setAttribute('aria-pressed', R.state.auto); $('.el-view [data-v=reset]').textContent = L.resetView; };
  const playButton = () => { $('.el-play').textContent = st.playing ? '❚❚' : '▶'; $('.el-play').setAttribute('aria-label', st.playing ? L.pause : L.play); };
  // x-ray: the viewer's choice, else on in the model's x-ray chapters when it shows compartments
  const xrayNow = () => st.xray ?? (model.features.compartments && model.features.xrayChapters.includes(model.chapters[chapterAt(model, st.t)].id));

  function card() {
    const evs = cards, i = evs.findLastIndex(e => e._t <= st.t + 1e-9), el = $('.el-card');
    const e = evs[i], until = e ? Math.min(evs[i + 1]?._t ?? Infinity, e._t + 4) : -1;
    if (!e || st.t > until) { el.hidden = true; return null; }
    const cls = classOf(e), srcs = (e.sourceIds || []).map(id => sources.get(id)).filter(Boolean);
    el.hidden = false;
    el.innerHTML = `<h3>${esc(pick(e.title, st.lang))} ${badge(cls, L)}</h3><p>${esc(pick(e.text, st.lang))}</p>`
      + (st.depth === 'detail' ? (e.detail ? `<p>${esc(pick(e.detail, st.lang))}</p>` : '')
        + (e.alternatives ? `<p class="alt"><b>${L.alternatives}:</b> ${esc(pick(e.alternatives, st.lang))}</p>` : '')
        + (srcs.length ? `<p class="src">${L.sources}: ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ')}</p>` : '') : '');
    return e;
  }

  function gauges(s, ev) {
    const c = model.chapters[chapterAt(model, st.t)], out = [];
    if (c.unit === 'minute') out.push(`<div class="el-g"><b>${L.clock} ${L.shipTime}</b><span class="big">${esc(formatTime(model, st.t, st.lang).split(' ').at(-1))}</span></div>`);
    if (c.unit === 'minute' && model.features.compartments && comps.length && !s.broken) {
      const pulse = ev?.kind === 'overflow' ? new Set([ev.from, ev.to]) : new Set();
      out.push(`<div class="el-g"><b>${L.levels}</b><div class="el-levels">${comps.map(cp => {
        const h = s.water.get(cp.id) ?? 0, fl = cp.params.floor ?? 0, top = bulkTop(cp), f = Math.max(0, Math.min(1, (h - fl) / (top - fl)));
        return `<i class="${pulse.has(cp.id) ? 'pulse' : ''}" title="${esc(pick(cp.name, st.lang))}: ${h.toFixed(1)} m"><s style="height:${(f * 100).toFixed(0)}%"></s></i>`; }).join('')}</div></div>`);
    }
    const b = subjectBox(model, s, frameSubject(model, st.t)), z = -(b.min[2] + b.max[2]) / 2, ref = model.refs?.[st.lang];   // the depth of what the camera follows
    if (z > 50) out.push(`<div class="el-g"><b>${L.depthG}</b><span class="big">${Math.round(z).toLocaleString()} ${L.m}</span>${ref ? `<div>${esc(L.towers((z / ref.height).toFixed(1), ref.name))}</div>` : ''}${model.environment.seaDepth ? `<div class="el-depthbar"><s style="width:${Math.min(100, 100 * z / model.environment.seaDepth).toFixed(0)}%"></s></div>` : ''}</div>`);
    if (c.unit === 'year') out.push(`<div class="el-g"><b>${L.year}</b><span class="big">${esc(formatTime(model, st.t, 'en'))}</span></div>`);
    $('.el-gauges').innerHTML = out.join('');
  }

  function setT(t, force) {
    t = Math.max(0, Math.min(100, t));
    if (!force && t === st.t) return;
    st.t = t; range.value = t;
    R.set({ t, style: st.style, xray: xrayNow(), branch: st.branch });
    const s = R.state.last, ev = card(), ci = chapterAt(model, t), c = model.chapters[ci];
    gauges(s, ev);
    $('.el-now').textContent = formatTime(model, t, st.lang) + (c.unit === 'minute' ? ' ' + L.shipTime : '');
    root.querySelectorAll('.el-chapters button').forEach((b, i) => b.setAttribute('aria-current', i === ci));
    const proj = $('.el-proj'); proj.hidden = !projCh.has(c.id); proj.textContent = L.projBadge;
    const note = $('.el-lightnote'); note.hidden = !(R.state.eyeZ < -200 && st.style === 'color'); note.textContent = L.lightNote;
    const xb = root.querySelectorAll('[data-k=xray]'); xb.forEach(b => b.setAttribute('aria-pressed', (b.dataset.o === 'on') === xrayNow()));
  }

  function panel(kind) {
    const el = $('.el-panel'); st.panel = kind; el.hidden = false;
    const close = `<button type="button" data-a="close">${L.close}</button>`;
    if (kind === 'sources') el.innerHTML = `<h2>${L.sources}${close}</h2><p>${L.method}</p><ol>${model.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.publisher ? ` — ${esc(s.publisher)}` : ''}${s.year ? ` (${esc(s.year)})` : ''}</li>`).join('')}</ol>`;
    else el.innerHTML = `<h2>${L.about}${close}</h2>${model.meta.about ? `<p>${esc(pick(model.meta.about, st.lang))}</p>` : ''}`
      + (model.meta.limitations.length ? `<h3 style="font-size:13.5px">${L.limitations}</h3><ul>${model.meta.limitations.map(x => `<li>${esc(pick(x, st.lang))}</li>`).join('')}</ul>` : '')
      + `<p class="el-sub">${L.gate2[model.meta.gate2] || L.gate2.unknown}</p>`;
  }

  // playback -------------------------------------------------------------------------------------------------
  let last = 0;
  function play(on) {
    st.playing = on; playButton();
    if (!on) return;
    if (st.t >= 100) setT(0);
    last = performance.now();
    const step = now => { if (!st.playing) return; const dt = Math.min(0.5, (now - last) / 1000); last = now;
      setT(advance(st.t, dt, st.speed)); if (st.t >= 100) { play(false); return; } requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const { k, o, a, v, ch, br } = b.dataset;
    if (k === 'lang') { st.lang = o; chrome(); return; }
    if (k === 'style') { st.style = o; chrome(); return; }
    if (k === 'depth') { st.depth = o; chrome(); return; }
    if (k === 'xray') { st.xray = o === 'on'; chrome(); return; }
    if (ch != null) { play(false); setT(model.chapters[+ch].bar[0], true); return; }
    if (br) { st.branch = br; chrome(); return; }
    if (v === 'auto') { R.setAuto(!R.state.auto); viewButtons(); setT(st.t, true); return; }
    if (v === 'reset') { R.reset(); viewButtons(); setT(st.t, true); return; }
    if (b.classList.contains('el-play')) { play(!st.playing); return; }
    if (b.classList.contains('el-trust') || a === 'sources') { panel('sources'); return; }
    if (a === 'about') { panel('about'); return; }
    if (a === 'close') { $('.el-panel').hidden = true; st.panel = null; return; }
    if (a === 'png') { download(dataBlob(R.dataURL()), `${slug}-${Math.round(st.t)}.png`); return; }
    if (a === 'video') saveVideo();
  });
  range.addEventListener('input', () => { play(false); setT(+range.value); });
  $('.el-pl select').addEventListener('change', e => { st.speed = e.target.value; });
  addEventListener('keydown', e => {
    if (/input|textarea|select/i.test(e.target.tagName) && e.target !== range) return;
    if (st.recording) return;
    if (e.key === '[' || e.key === ']') { st.speed = stepSpeed(st.speed, e.key === ']' ? 1 : -1); $('.el-pl select').value = st.speed; return; }
    if (e.key === ' ' && e.target === document.body) { e.preventDefault(); play(!st.playing); }
  });
  addEventListener('resize', () => { R.resize(); setT(st.t, true); });

  // exports ----------------------------------------------------------------------------------------------------
  const slug = (model.subject.name.en || 'elapse').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const dataBlob = url => { const [h, b] = url.split(','), bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: h.match(/:(.*?);/)[1] }); };
  const download = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  function saveVideo() {
    if (!window.MediaRecorder || !canvas.captureStream) { alert(L.noVideo); return; }
    const type = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(canvas.captureStream(30), type ? { mimeType: type } : undefined), chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = () => { const mt = rec.mimeType || type || 'video/webm'; download(new Blob(chunks, { type: mt }), `${slug}.${/mp4/.test(mt) ? 'mp4' : 'webm'}`); st.recording = false; chrome(); };
    play(false); st.recording = true; chrome(); setT(0, true); rec.start();
    const t0 = performance.now(), dur = SPEEDS[st.speed] * 1000;
    const step = now => { const k = Math.min(1, (now - t0) / dur); setT(100 * k); if (k < 1) requestAnimationFrame(step); else setTimeout(() => rec.stop(), 600); };
    requestAnimationFrame(step);
  }

  // start ------------------------------------------------------------------------------------------------------
  R.resize();
  const ch = num('chapter'), t0 = num('t') ?? (ch != null ? model.chapters[Math.max(0, Math.min(model.chapters.length - 1, ch - 1))].bar[0] : 0);
  st.t = t0; chrome();
  if (params.panel === 'sources' || params.panel === 'about') panel(params.panel);
  if (params.play === '1') play(true);
  window.__elapse = Object.assign(window.__elapse || {}, { R, model, st, errors, setT, play });
  return window.__elapse;
}
