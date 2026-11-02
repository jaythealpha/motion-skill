import {isWTC,advanceWTC} from './wtc-model.js';
import {isNotreDame,advanceNotreDame} from './notredame-model.js';
// Page shell: header with the confidence shares, toggles, the stage (canvas, event card, gauges), the chaptered
// time bar, chapter buttons, the branch switch, panels and exports.
import {isBuilding} from './building-model.js';
import {createBuildingRenderer} from './building-render.js';
import {buildingGauges,buildingDrawing} from './building-ui.js';
import {explorationStops,explorationStart} from './exploration.js';
import { createRenderer } from './render.js';
import {PLAN_SOURCES} from './britannic-form.js';
import {TITANIC_PLAN_SOURCES} from './titanic-form.js';
import {ecologyAvailable,ECO_SOURCES,scaleBar} from './ecology-model.js';
import { hasDirecting, playbackRate, directingBeat, isBritannic, isTitanic } from './directing.js';
import { strings, pick } from './i18n.js';
import { classShares, WARN_SHARE } from './model.js';
import { chapterAt, formatTime } from './chapters.js';
import { subjectBox, frameSubject } from './camera.js';
import { SPEEDS, DEFAULT_SPEED, advance, stepSpeed, speedLabel } from '../shared/speeds.js';
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
.el-directing{padding:8px 2px 0;color:var(--muted);font-size:12px;overflow-wrap:anywhere}
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
.el-cinematic .el-stage{touch-action:auto;user-select:auto;overflow:visible;height:auto;background:transparent;border:0;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:10px}
.el-cinematic .el-stage canvas{touch-action:none;height:min(54vh,520px);grid-column:1/-1;min-width:0;border-radius:16px;background:#060a13;border:1px solid var(--line)}
.el-cinematic .el-card{position:static;max-width:none;min-width:0;block-size:224px;overflow:auto;scrollbar-gutter:stable;box-shadow:none;border:1px solid var(--line)}
.el-card-at{font-size:11px;color:var(--muted);margin-bottom:7px}
.el-cinematic .el-gauges{position:static;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr);block-size:224px;gap:8px;max-width:none;min-width:0;align-items:stretch}
.el-cinematic .el-g{min-width:0;min-height:0;padding:12px 10px;overflow:auto;border-radius:12px}
.el-cinematic .el-g b{min-height:30px}.el-cinematic .el-g .big{display:block;white-space:nowrap;font-size:22px;min-height:36px}
.el-g-note{display:block;font-size:11px;line-height:1.45;margin-top:8px;color:#c5d2e2;overflow-wrap:anywhere}
.el-cinematic .el-levels{height:64px;gap:2px}.el-cinematic .el-levels i{width:auto;flex:1;min-width:0}.el-levels.is-inactive{opacity:.24}
.el-cinematic .el-view{top:12px;bottom:auto}
.el-cinematic .el-proj{position:static;font-size:10px;padding:3px 6px;white-space:normal}.el-proj[hidden]{display:none}.el-status{block-size:36px;font-size:11px;margin-top:8px;overflow:auto}
.el-cinematic .el-lightnote{display:none}
.el-cinematic .el-directing{block-size:58px;overflow:auto;padding:8px 2px 0}
.el-drawing{position:absolute;top:0;left:0;width:100%;pointer-events:none;border-radius:16px;overflow:hidden}.el-drawing[hidden]{display:none}
@media(max-width:900px){.el-cinematic .el-stage{grid-template-columns:minmax(0,1fr)}.el-cinematic .el-card{block-size:200px}.el-cinematic .el-gauges{block-size:164px}.el-cinematic .el-g b{min-height:24px}.el-cinematic .el-g .big{font-size:20px;min-height:30px}.el-cinematic .el-levels{height:46px}}
@media(max-width:640px){.el-cinematic .el-stage canvas{height:min(42vh,340px)}.el-cinematic .el-card{block-size:216px}.el-cinematic .el-gauges{block-size:180px;gap:6px}.el-cinematic .el-g{padding:10px 8px}.el-cinematic .el-g b{font-size:10px;min-height:32px}.el-cinematic .el-directing{block-size:96px}}
.el-exploration{padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--panel);margin:0 0 12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.el-exploration[hidden]{display:none}.el-exploration label{display:flex;gap:6px;align-items:center}.el-exploration select,.el-exploration button{min-height:44px;max-width:100%;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--ink);font:inherit;padding:8px 10px}.el-exploration button:disabled,.el-exploration select:disabled{opacity:.45;cursor:not-allowed}.el-exploration p{flex-basis:100%;margin:0;font-size:12px;color:var(--muted)}
.el-building [data-gauge=time] .big{font-size:clamp(12px,1.3vw,18px);line-height:1.4;white-space:normal}
.el-quality-links{flex-wrap:wrap}.el-quality-links a{display:inline-flex;align-items:center;min-height:44px;padding:0 8px;border-radius:8px;color:#174d86}.el-quality-links a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}.el-quality-links span{font-size:11px;color:var(--muted)}
.el-eco-controls[hidden]{display:none}
.el-eco-controls button{box-sizing:border-box;min-height:44px}.el-eco-controls button:disabled{opacity:.4;cursor:not-allowed}
.el button:focus-visible,.el select:focus-visible,.el input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.el-cinematic .el-view button,.el-cinematic .el-chapters button{min-height:44px}
@media (max-width:640px){.el{padding:12px 16px 22px}.el-stage{height:58vh}.el-bar{grid-template-columns:auto 1fr}.el-now{grid-column:1/-1;text-align:left;max-width:none}
  .el-g{min-width:96px;padding:5px 8px}.el-levels{height:36px}.el-card{font-size:12.5px;max-width:calc(100% - 24px)}.el-gauges{top:auto;bottom:52px}.el-lightnote{display:none}}
`;

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mountElapse(root, model, params = {}) {
  params={...params,quality:params.quality??model.meta.renderQuality};
  const wtc=isWTC(model),nd=isNotreDame(model),building=isBuilding(model),defaultStop=explorationStops(model).find(s=>s.id==='bridge')?.id||explorationStops(model)[0]?.id;
  const speedKeys=wtc?['quarter','half',...Object.keys(SPEEDS)]:Object.keys(SPEEDS),speedName=k=>k==='quarter'?'0.25×':k==='half'?'0.5×':speedLabel(k);
  const st = { lang: params.lang === 'en' ? 'en' : 'ko', depth: params.depth === 'simple' ? 'simple' : 'detail',
    exploring:false,exploreMoving:false,exploreStop:'bridge',lampStrength:1,history:null,ecology:params.life!=='0',exploreLight:params.lamp!=='0',ecoClock:0,ecoView:['coral','sponge','fish'].includes(params.eco)?params.eco:'scene',
    style: params.style === 'blueprint' ? 'blueprint' : 'color', t: 0, playing: false, speed: speedKeys.includes(params.speed) ? params.speed : DEFAULT_SPEED,
    xray: params.xray === '1' ? true : params.xray === '0' ? false : null, branch: params.branch === 'b' && model.branches.length ? 'b' : 'a' };
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const errors = window.__elapse?.errors || [];
  let L = strings(st.lang);
  const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
  root.className = 'el'+(building?' el-building':'') + ' el-cinematic';
  root.innerHTML = `
    <header class="el-top"><div><h1></h1><div class="el-sub"></div></div><button class="el-trust" type="button"></button></header>
    <div class="el-warn" hidden></div>
    <div class="el-controls"></div><div class="el-exploration" hidden></div>
    <div class="el-stage"><canvas role="img" aria-label="시간에 따른 선체 변화 3D"></canvas><svg class="el-drawing" aria-hidden="true" hidden></svg><div class="el-card" tabindex="0" role="region" aria-label="장면 설명"></div><div class="el-gauges"></div>
      <div class="el-lightnote" hidden></div>
      <div class="el-view"><button type="button" data-v="auto"></button><button type="button" data-v="reset"></button></div></div>
    <div class="el-directing" tabindex="0" hidden></div>
    <div class="el-bar"><div class="el-pl"><button class="el-play" type="button"></button><select></select></div>
      <div class="el-track"><div class="el-bands"></div><input aria-label="시간 진행" type="range" min="0" max="100" step="0.05" value="0"><div class="el-ticks"></div></div>
      <div class="el-now"></div></div>
    <div class="el-chapters"></div>
    <div class="el-branch" hidden></div>
    <div class="el-actions"></div>
    <aside class="el-panel" hidden></aside>`;
  const $ = s => root.querySelector(s);
  const canvas = $('canvas'), range = $('.el-track input');
  const num = k => params[k] != null && isFinite(+params[k]) ? +params[k] : undefined;
  const R = (building?createBuildingRenderer:createRenderer)(canvas, model, {quality:params.quality,qualityCutaway:params.cutaway==='1',ecology:st.ecology,exploreLight:st.exploreLight,ecoView:st.ecoView, auto: params.auto !== '0', yaw: num('yaw'), pitch: num('pitch'), zoom: num('zoom'), onManual: () => viewButtons(), onRender: () => drawing() });
  const cs = classShares(model), shares = Object.fromEntries(CLASSES.map(c => [c, Math.round(100 * cs[c])]));
  const projCh = new Set(model.features.projectionChapters || []);
  const comps = model.pieces.filter(p => p.template === 'compartment' && model.tracks.some(tr => tr.piece === p.id && tr.prop === 'water'));
  const bulkTop = c => { const b = model.pieces.find(p => p.template === 'bulkhead' && p.parent === c.parent && (Math.abs(p.params.x - c.params.x0) < 0.01 || Math.abs(p.params.x - c.params.x1) < 0.01)); return b?.params.top ?? c.params.top ?? model.subject.dims.depth; };
  const sources = new Map(model.sources.map(s => [s.id, s]));
  // events with card: false only move pieces; they get no card and no tick
  const cards = model.events.filter(e => e.card !== false);

  function chrome() {
    L = strings(st.lang); document.documentElement.lang = st.lang;
    $('.el-card').setAttribute('aria-label',st.lang==='en'?'Scene explanation':'장면 설명');
    range.setAttribute('aria-label',st.lang==='en'?'Timeline':'시간 진행');
    const stopName=st.exploring?explorationStops(model).find(q=>q.id===st.exploreStop)?.name:null;
    canvas.setAttribute('aria-label',stopName?pick(stopName,st.lang)+(st.lang==='en'?' inspection':' 탐사'):building?(st.lang==='en'?'3D building construction over time':'시간에 따른 건축 시공 3D'):(st.lang==='en'?'3D ship changes over time':'시간에 따른 선체 변화 3D'));
    $('.el-top h1').textContent = pick(model.subject.name, st.lang);
    $('.el-sub').textContent = model.meta.interpretation ? L.interpreted(pick(model.meta.interpretation, st.lang)) : '';
    $('.el-trust').innerHTML = CLASSES.filter(c => shares[c] || c === 'sourced').map(c => `<span class="cf-badge cf-${c}">${L.share(L[c], shares[c])}</span>`).join('');
    $('.el-trust').setAttribute('aria-label', L.sources);
    const pct = shares.sourced, warn = $('.el-warn'); warn.hidden = pct >= WARN_SHARE * 100; warn.textContent = L.warn(pct);
    const seg = (key, opts, cur, lab = o => L[o]) => `<span class="el-seg"><b>${L[key]}</b><div role="group" aria-label="${L[key]}">${opts.map(o => `<button type="button" data-k="${key}" data-o="${o}" aria-pressed="${cur === o}">${lab(o)}</button>`).join('')}</div></span>`;
    $('.el-controls').innerHTML = seg('style', ['color', 'blueprint'], st.style) + seg('xray', ['on', 'off'], xrayNow() ? 'on' : 'off') + seg('depth', ['simple', 'detail'], st.depth)
      + `<span class="el-seg"><div role="group" aria-label="language">${['ko', 'en'].map(o => `<button type="button" data-k="lang" data-o="${o}" aria-pressed="${st.lang === o}">${o.toUpperCase()}</button>`).join('')}</div></span>`;
    if(isBritannic(model)&&(params.study==='quality'||model.meta.renderQuality==='high')){
      const cut=new URL(location.href);cut.searchParams.set('cutaway',params.cutaway==='1'?'0':'1');
      const link=high=>{const u=new URL(location.href);u.searchParams.set('quality',high?'high':'standard');u.searchParams.set('t',st.t);return esc(u.href);};
      $('.el-controls').insertAdjacentHTML('beforeend',`<span class="el-seg el-quality-links"><b>고품질 보기</b><a data-quality-mode="standard" href="${link(false)}">기존</a> · <a data-quality-mode="high" href="${link(true)}">고품질</a><a data-quality-mode="cutaway" href="${esc(cut.href)}">${params.cutaway==='1'?'절개 닫기':'구조 절개'}</a><span>형상·장비 배치 추정 · 절개는 설명용</span></span>`);
    }
    if(building)$('[data-k=xray]')?.closest('.el-seg')?.remove();
    if(isTitanic(model)){
      const ecoSeg=(label,key,options,current)=>`<span class="el-seg el-eco-controls"><b>${label}</b><div role="group" aria-label="${label}">${options.map(([v,text])=>`<button type="button" data-k="${key}" data-o="${v}" aria-pressed="${current===v}">${text}</button>`).join('')}</div></span>`;
      $('.el-controls').insertAdjacentHTML('beforeend',ecoSeg(st.lang==='en'?'Light':'관측 조명','exploreLight',[['on',st.lang==='en'?'Survey':'탐사'],['off',st.lang==='en'?'Base':'기본']],st.exploreLight?'on':'off')+ecoSeg(st.lang==='en'?'Fauna':'생물 재현','ecology',[['on',st.lang==='en'?'On':'켜기'],['off',st.lang==='en'?'Off':'끄기']],st.ecology?'on':'off')+ecoSeg(st.lang==='en'?'Inspect':'생태 확대','ecoView',[['scene',st.lang==='en'?'Context':'전체'],['coral',st.lang==='en'?'Coral':'산호'],['sponge',st.lang==='en'?'Sponge':'해면'],['fish',st.lang==='en'?'Fish':'물고기']],st.ecoView));
    }
    $('.el-pl select').innerHTML = speedKeys.map(k => `<option value="${k}"${st.speed === k ? ' selected' : ''}>${speedName(k)}</option>`).join('');
    $('.el-pl select').setAttribute('aria-label', L.speed);
    $('.el-bands').innerHTML = model.chapters.map(c => `<span style="left:${c.bar[0]}%;width:${c.bar[1] - c.bar[0]}%" title="${esc(pick(c.name, st.lang))}">${esc(pick(c.name, st.lang))}</span>`).join('');
    $('.el-ticks').innerHTML = cards.map(e => `<i style="left:${e._t}%" title="${esc(pick(e.title, st.lang))}"></i>`).join('') + model.chapters.slice(1).map(c => `<i class="ch" style="left:${c.bar[0]}%"></i>`).join('');
    $('.el-chapters').innerHTML = model.chapters.map((c, i) => `<button type="button" data-ch="${i}">${i + 1}. ${esc(pick(c.name, st.lang))}</button>`).join('');
    const br = $('.el-branch'); br.hidden = !model.branches.length;
    if (model.branches.length) br.innerHTML = `<span class="el-seg"><b>${L.branch}</b></span>` + [['a', model.meta.baseName || { ko: '기본', en: 'Base' }], ['b', model.branches[0].name]]
      .map(([id, n]) => `<button type="button" data-br="${id}" aria-pressed="${st.branch === id}">${esc(pick(n, st.lang))}</button>`).join('');
    $('.el-actions').innerHTML = `<button type="button" data-a="png">${L.png}</button><button type="button" data-a="video"${st.recording ? ' disabled' : ''}>${st.recording ? L.recording : L.video}</button><button type="button" data-a="sources">${L.sources}</button><button type="button" data-a="about">${L.about}</button>`;
    L.explorationMode=st.lang==='en'?'Mode':'모드';
    if(st.exploring&&(!isTitanic(model)||!ecologyAvailable(model,st.t)||st.style!=='color'||xrayNow()))surveyMotion(false);
    if(explorationStops(model).length)$('.el-controls').insertAdjacentHTML('beforeend',seg('explorationMode',['timeline','survey'],st.exploring?'survey':'timeline',o=>st.lang==='en'?(o==='survey'?'Explore':'Timeline'):(o==='survey'?'탐사':'시간순')));
    const legacyInspect=$('[data-k=ecoView]')?.closest('.el-seg');if(legacyInspect)legacyInspect.hidden=st.exploring;
    explorationPanel();
    viewButtons(); playButton(); if (!$('.el-panel').hidden) panel(st.panel); setT(st.t, true);
  }
  const viewButtons = () => { $('.el-view [data-v=auto]').textContent = L.autoCam; $('.el-view [data-v=auto]').setAttribute('aria-pressed', R.state.auto); $('.el-view [data-v=reset]').textContent = L.resetView; };
  const playButton = () => { $('.el-play').textContent = st.playing ? '❚❚' : '▶'; $('.el-play').setAttribute('aria-label', st.playing ? L.pause : L.play); };
  // x-ray: the viewer's choice, else on in the model's x-ray chapters when it shows compartments
  const xrayNow = () => st.xray ?? (model.features.compartments && model.features.xrayChapters.includes(model.chapters[chapterAt(model, st.t)].id));

  let cardKey = null;
  function card() {
    const evs = cards, i = evs.findLastIndex(e => e._t <= st.t + 1e-9), el = $('.el-card');
    const kind=R.state.ecoFocus?.kind,ko=st.lang!=='en';
    const e = evs[i], key = [i, st.lang, st.depth,kind||'',st.exploring?st.exploreStop:'', e ? "event" : chapterAt(model,st.t)].join(":");
    if(key === cardKey)return e || null;
    cardKey = key;
    if(kind){
      const notes={coral:ko?['냉수성 산호 · 선수 난간','난간에 붙은 작은 가지형 군체를 살펴보세요. 줄기와 가지 끝의 작은 돌기를 표현했습니다.']:['Cold-water coral · bow rail','Inspect the small branching colony on the railing, including its stem and fine branch tips.'],sponge:ko?['해면 · 선미 구조물','표면에 낮게 붙은 작은 해면을 살펴보세요. 표면 요철과 구멍은 설명을 위한 추정 형상입니다.']:['Sponge · stern structure','Inspect a small encrusting sponge. Surface relief and openings are illustrative approximations.'],fish:ko?['긴꼬리 심해어 · 해저 부근','해저 가까이 움직이는 그레나디어류의 형태를 표현했습니다. 몸통·지느러미와 가늘어지는 꼬리를 살펴보세요.']:['Rattail-like fish · near sediment','Inspect the body, fins and tapering tail of a fish moving near the bottom.']};
      const [title,text]=notes[kind];el.hidden=false;
      el.innerHTML=`<div class="el-card-at">${ko?'생태 확대 · 1986–2022 관측 참고':'Ecology study · 1986–2022 observation context'}</div><h3>${title} ${badge('estimated',L)}</h3><p>${text}</p><p>${ko?'크기·세부 형태·좌표·움직임은 추정이며, 현재 연도의 개체 기록이 아닙니다.':'Size, detailed shape, coordinates and motion are estimated, not a record of individuals in the displayed year.'}</p>`+(st.depth==='detail'?`<p class="src"><a href="${ECO_SOURCES[0].url}" target="_blank" rel="noopener">Cleland et al. 2025</a> · ${st.exploring?(ko?'시간순 보기로 나가면 이전 사건 설명이 복원됩니다.':'Leave Explore to restore the original event notes.'):(ko?'전체 보기로 돌아가면 사건 설명이 표시됩니다.':'Select Context to return to historical event notes.')}</p>`:'');
      canvas.setAttribute('aria-label',title+'. '+text);return e||null;
    }
    if(st.exploring){const stop=explorationStops(model).find(q=>q.id===st.exploreStop),title=(stop?pick(stop.name,st.lang):(ko?'구조':'Structure'))+(ko?' 탐사':' inspection');const refs=[...new Set((stop?.parts||[]).flatMap(id=>model.pieces.find(p=>p.id===id)?.sourceIds||[]))].map(id=>sources.get(id)).filter(Boolean);el.hidden=false;el.innerHTML=`<div class="el-card-at">${ko?'역사 시간 고정':'Historical time locked'} · ${formatTime(model,st.t,st.lang)}</div><h3>${esc(title)} ${badge('estimated',L)}</h3><p>${wtc?(ko?'고정한 시점의 건물·잔해·터·추모공간을 살펴보세요. 건물이 없어진 뒤에는 같은 자리의 변화를 보여줍니다. 상세 형상과 현장 좌표는 추정입니다.':'Inspect the building, debris, footprint or memorial at the locked date. After a building is lost, the same site is shown. Detailed geometry and coordinates are estimated.'):nd?(ko?'선택한 부위의 손상·복원 상태를 관찰합니다. 형상·손상 범위·부재 위치와 가설물은 추정입니다.':'Inspect damage and restoration at the locked date. Shapes, damage extent, members and temporary works are estimated.'):building?(ko?'선택한 부위의 시공 구조를 관찰합니다. 개별 철골·기초·접합부의 형상과 위치는 추정입니다.':'Inspect this construction area. Individual members, foundations and joints are approximate.'):(ko?'선택한 부위의 남아 있는 구조를 관찰합니다. 형상·세부 위치와 표면 표현에는 추정이 포함됩니다.':'Inspect the remaining structures in the selected area. Shape, detailed coordinates and surface appearance include estimates.')}</p><p>${ko?'시간순 보기로 돌아가면 원래 사건 설명과 시점이 복원됩니다.':'Timeline restores the original event notes and historical time.'}</p>`+(st.depth==='detail'&&refs.length?`<p class="src">${L.sources}: ${refs.map(q=>`<a href="${esc(q.url)}" target="_blank" rel="noopener">${esc(q.title)}</a>`).join(' · ')}</p>`:'');canvas.setAttribute('aria-label',title);return e||null;}
    canvas.setAttribute('aria-label',building?(ko?'시간에 따른 건축 시공 3D':'3D building construction over time'):(ko?'시간에 따른 선체 변화 3D':'3D ship changes over time'));
    if (!e) {el.hidden=false;el.innerHTML=`<h3>${esc(pick(model.chapters[chapterAt(model,st.t)].name,st.lang))}</h3><p>${st.lang==='en'?'Move the timeline to explore recorded events.':'시간 바를 움직여 기록된 사건을 확인하세요.'}</p>`;return null;}
    const cls = classOf(e), srcs = (e.sourceIds || []).map(id => sources.get(id)).filter(Boolean);
    el.hidden = false;
    el.innerHTML = `<div class="el-card-at">${st.lang==='en'?'Event recorded at':'기록 시점'} · ${esc(formatTime(model,e._t,st.lang))}</div><h3>${esc(pick(e.title, st.lang))} ${badge(cls, L)}</h3><p>${esc(pick(e.text, st.lang))}</p>`
      + (st.depth === 'detail' ? (e.detail ? `<p>${esc(pick(e.detail, st.lang))}</p>` : '')
        + (e.alternatives ? `<p class="alt"><b>${L.alternatives}:</b> ${esc(pick(e.alternatives, st.lang))}</p>` : '')
        + (srcs.length ? `<p class="src">${L.sources}: ${srcs.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join(' · ')}</p>` : '') : '');
    return e;
  }

  function gauges(s, ev) {
    if(building){buildingGauges($('.el-gauges'),model,R,st);return;}
    const c=model.chapters[chapterAt(model,st.t)], minute=c.unit==='minute';
    const wet=minute&&model.features.compartments&&comps.length&&!s.broken;
    const pulse=ev?.kind==='overflow'?new Set([ev.from,ev.to]):new Set();
    const bars=comps.map(cp=>{const h=s.water.get(cp.id)??0,fl=cp.params.floor??0,top=bulkTop(cp),f=wet?Math.max(0,Math.min(1,(h-fl)/(top-fl))):0;
      return `<i class="${pulse.has(cp.id)?'pulse':''}" title="${esc(pick(cp.name,st.lang))}${wet?': '+h.toFixed(1)+' m':''}"><s style="height:${(f*100).toFixed(0)}%"></s></i>`;}).join('');
    const b=R.state.ecoFocus?R.state.focusBox:subjectBox(model,s,R.state.focusIds||frameSubject(model,st.t)),z=-(b.min[2]+b.max[2])/2,available=z>50,ref=model.refs?.[st.lang];
    const value=minute?formatTime(model,st.t,st.lang).split(' ').at(-1):formatTime(model,st.t,'en');
    const note=!model.features.compartments?(st.lang==='en'?'No compartment-level evidence modelled':'구획별 침수 자료 미적용'):wet?(st.lang==='en'?'Modelled water levels':'모델의 구획별 수위'):(st.lang==='en'?'Not used in this chapter':'이 구간에서는 사용 안 함');
    $('.el-gauges').innerHTML=`<div class="el-g" data-gauge="time"><b>${L.clock} / ${L.year}</b><span class="big">${esc(value)}</span><span class="el-g-note">${minute?L.shipTime:(st.lang==='en'?'Historical year':'연대 기록')}</span><div class="el-status">${projCh.has(c.id)?'':esc(pick(c.name,st.lang))}<span class="el-proj" hidden></span></div></div>
      <div class="el-g" data-gauge="levels"><b>${L.levels}</b><div class="el-levels${wet?'':' is-inactive'}">${bars}</div><span class="el-g-note">${note}</span></div>
      <div class="el-g" data-gauge="depth"><b>${L.depthG}</b><span class="big">${available?Math.round(z).toLocaleString()+' '+L.m:'—'}</span><span class="el-g-note">${available&&ref?esc(L.towers((z/ref.height).toFixed(1),ref.name)):(st.lang==='en'?'Underwater view':'수중 장면에서 표시')}</span><div class="el-depthbar"><s style="width:${available?Math.min(100,100*z/(model.environment.seaDepth||z)):0}%"></s></div><span class="el-g-note">${st.lang==='en'?'Hull length':'선체 길이'} ${model.subject.dims.loa} m</span></div>`;
  }

  function drawing(){
    const svg=$('.el-drawing');if(!svg)return;
    if(building){buildingDrawing(svg,model,R,canvas,st);return;}
    const eco=R.ecologyInfo?.();
    if(st.style==='color'&&eco?.available){
      svg.removeAttribute('hidden');const W=canvas.clientWidth,H=canvas.clientHeight,small=W<640,ko=st.lang!=='en',d=R.diagram(),m=scaleBar(d.ppm,Math.min(120,W*.28)),len=m*d.ppm;
      svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.height=H+'px';
      const names={coral:ko?'냉수성 산호 확대':'Cold-water coral',sponge:ko?'해면 확대':'Sponge study',fish:ko?'그레나디어류 확대':'Rattail study'},title=names[eco.kind]||(ko?'심해 생태 참고':'Deep-sea study');
      const note=small?(ko?'관측 종류 · 크기/배치 추정':'Observed · size estimated'):(ko?'종류: 관측 근거 · 배치/크기 추정':'Observed groups; estimated placement/size'),source=ko?'1986–2022 관측 참고 · 특정 연도의 군집 재현 아님':'1986–2022 observations; not a dated population reconstruction';
      svg.innerHTML=`<g font-family="system-ui,sans-serif" font-size="${small?10:12}" fill="#d5e7e7"><rect x="8" y="12" width="${small?144:390}" height="48" rx="6" fill="#08151e" opacity=".9"/><text x="16" y="29">${title}</text><text x="16" y="47" font-size="${small?8:11}">${note}</text><rect x="8" y="${H-73}" width="${W-16}" height="65" rx="6" fill="#08151e" opacity=".83"/><text x="16" y="${H-56}" font-size="${small?8:11}">${source}</text><text x="16" y="${H-40}" font-size="${small?9:11}">${st.exploreLight?(ko?'가상 탐사 조명':'Virtual survey lighting'):(ko?'기본 설명 조명':'Illustrative base lighting')}${reducedMotion.matches?(ko?' · 생물 모션 감소':' · Fauna motion reduced'):''}</text>${eco.kind?`<path d="M16 ${H-24}v8m0-4h${len}m0-4v8" fill="none" stroke="#e6c784"/><text x="${22+len}" y="${H-20}" fill="#e6c784">${m<1?+(m*100).toFixed(2)+' cm':m+' m'} · ${ko?'참고 척도':'view scale'}</text>`:''}</g>`;
      return;
    }
    svg.toggleAttribute('hidden',st.style!=='blueprint'||!hasDirecting(model));
    if(svg.hasAttribute('hidden'))return;
    const d=R.diagram(),W=canvas.clientWidth,H=canvas.clientHeight;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.height=H+'px';
    const small=W<640,ink='#a9d8f4',gold='#ffda79',font=small?10:12;
    const header=st.lang==='en'?(isBritannic(model)?'1914 PLAN STUDY · APPROXIMATE SURFACES / WINDOWS':'1912 PLAN STUDY · APPROXIMATE SURFACES / WINDOWS'):(isBritannic(model)?'1914 갑판도 참고 · 곡면/개별 창 좌표 추정':'1912 갑판 자료 참고 · 곡면/개별 창 좌표 추정');
    let out=`<defs><pattern id="el-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${ink}" stroke-opacity=".1" stroke-width=".6"/></pattern></defs><rect width="100%" height="100%" fill="url(#el-grid)"/><g font-family="system-ui,sans-serif" font-size="${font}" fill="${ink}"><rect x="8" y="12" width="${small?164:390}" height="44" rx="6" fill="#102e50" opacity=".94"/><text x="16" y="28">${small?(isBritannic(model)?(st.lang==='en'?'1914 PLAN · APPROXIMATE':'1914 갑판도 참고 · 좌표 추정'):(st.lang==='en'?'1912 PLAN · APPROXIMATE':'1912 자료 참고 · 좌표 추정')):header}</text><text x="16" y="47">L ${model.subject.dims.loa} m · B ${model.subject.dims.beam} m</text>`;
    for(const [i,a] of d.anchors.entries()){
      const x=a.x*W,y=a.y*H;if(x<10||x>W-10||y<70||y>H-55)continue;
      const label=pick(a.name,st.lang),side=i%2,tx=side?W-16:16,ty=92+Math.floor(i/2)*38;
      out+=`<path d="M${x} ${y}L${side?W-90:90} ${ty+5}H${tx}" stroke="${ink}" stroke-width=".8" fill="none" opacity=".65"/><circle cx="${x}" cy="${y}" r="8" fill="#102e50" stroke="${gold}"/><text x="${x}" y="${y+3}" text-anchor="middle" fill="${gold}" font-size="9">${i+1}</text><text x="${tx}" y="${ty}" text-anchor="${side?'end':'start'}">${i+1} ${esc(small?label.slice(0,9):label)}</text>`;
    }
    const limit=Math.min(160,W*.28),scales=[.1,.2,.5,1,2,5,10,20,50,100,200,500,1000],meters=scales.filter(m=>m*d.ppm<=limit).at(-1)||.1,len=meters*d.ppm,y=H-25;
    out+=`<path d="M16 ${y-5}v10m0-5h${len}m0-5v10" stroke="${gold}" fill="none"/><text x="16" y="${y-12}" fill="${gold}">${st.lang==='en'?'View scale':'시점 기준 참고 척도'} · ${meters} m</text></g>`;svg.innerHTML=out;
  }

  function setT(t, force) {
    t = Math.max(0, Math.min(100, t));
    if (!force && t === st.t) return;
    st.t = t; range.value = t;
    R.set({ t, style: st.style, xray: xrayNow(), branch: st.branch,exploring:st.exploring,exploreTarget:st.exploring?st.exploreStop:null,lampStrength:st.exploring?st.lampStrength:1,ecology:st.ecology,exploreLight:st.exploreLight,ecoView:st.ecoView,ecoClock:st.ecoClock });
    const s = R.state.last, ev = card(), ci = chapterAt(model, t), c = model.chapters[ci];
    root.querySelectorAll('[data-quality-mode]').forEach(a=>{const url=new URL(location.href);url.searchParams.set('t',st.t);url.searchParams.set('mode',st.exploring?'explore':'timeline');if(st.exploring)url.searchParams.set('stop',st.exploreStop);if(a.dataset.qualityMode==='cutaway')url.searchParams.set('cutaway',params.cutaway==='1'?'0':'1');else url.searchParams.set('quality',a.dataset.qualityMode);a.href=url.href;});

    gauges(s, ev);
    const direction=$('.el-directing');direction.hidden=!(hasDirecting(model)||building);if(wtc)direction.textContent=st.lang==='en'?'Official event times · illustrative impacts/collapses and intermediate rebuilding · ends at2018 milestone':'공식 사건 시각 · 충돌·붕괴·중간 재건은 추정 도해 · 2018 이정표까지';else if(nd)direction.textContent=st.lang==='en'?'Official dated milestones · fire, collapse and intermediate rebuilding are illustrative · ends at 2024 reopening':'공식 주요 기록 · 화염·낙하·중간 복원은 추정 도해 · 2024 재개관까지';else if(building)direction.textContent=st.lang==='en'?'Recorded milestones · intermediate geometry/sequence interpolated · 300 m main-structure reference':'주요 시점은 공식 기록 · 중간 형상·순서는 추정·보간 · 300m 주구조 기준';
    if(wtc&&R.state.shot?.weight>.05)direction.textContent=(st.lang==='en'?R.state.shot.id.replace('-',' '):R.state.shot.label)+' · '+(st.lang==='en'?'Automatic observation camera · effects and motion estimated':'자동 관찰 카메라 · 효과·낙하·중간 과정 추정');
    if(!direction.hidden&&!building){const beat=directingBeat(model,t);direction.textContent=beat.label[st.lang==='en'?1:0]+' · '+(st.lang==='en'?'Illustrative effects; estimated motion':'물·입자 효과는 설명용 연출 · 움직임은 추정 포함')+(beat.rate<.5?(st.lang==='en'?' · Slow passage':' · 주요 순간 저속 재생'):'');if(isBritannic(model)&&R.state.focusIds?.includes('officers'))direction.textContent=(st.lang==='en'?'Bridge and gantry close-up · ':'선교·인양 장치 확대 · ')+direction.textContent;if(isBritannic(model)&&t>=62)direction.textContent+=(st.lang==='en'?' · Window/rail/vent positions, surface weathering and organism distribution are illustrative estimates':' · 현창·난간·환기구 위치, 표면 부식·부착 생물 분포는 추정 표현');}
    if(isTitanic(model)&&R.state.focusIds?.includes('first-house'))direction.textContent=(st.lang==='en'?'Bridge and deck detail · ':'선교·갑판 구조 확대 · ')+direction.textContent;
    if(isTitanic(model)&&!direction.hidden)direction.textContent+=(st.lang==='en'?' · 1912 plan-informed geometry; detailed positions estimated':' · 1912 갑판 자료 참고 · 세부 좌표 추정');
    const ecoReady=isTitanic(model)&&ecologyAvailable(model,t)&&st.style==='color'&&!xrayNow();
    root.querySelectorAll('.el-eco-controls button').forEach(b=>{b.disabled=!ecoReady||(b.dataset.k==='ecoView'&&b.dataset.o!=='scene'&&!st.ecology);b.title=st.lang==='en'?'Available in colour, non-x-ray 1986–2022 observation context':'1986–2022 관측 구간의 컬러·투시 끄기에서 표시';});
    if(isTitanic(model)&&!direction.hidden)direction.textContent+=(ecoReady?(st.lang==='en'?' · Fauna placement/size/motion estimated; not a dated census':' · 생물 배치·크기·움직임 추정, 연도별 개체수 재현 아님'):(st.lang==='en'?' · Fauna and survey light: colour observation context only':' · 생물·탐사광: 관측 구간의 컬러 보기에서 표시'));
    $('.el-now').textContent = formatTime(model, t, st.lang) + (c.unit === 'minute' ? ' ' + (wtc?(st.lang==='en'?'(New York local)':'(뉴욕 현지)'):nd?(st.lang==='en'?'(Paris local)':'(파리 현지)'):L.shipTime) : '');
    root.querySelectorAll('.el-chapters button').forEach((b, i) => b.setAttribute('aria-current', i === ci));
    const proj = $('.el-proj'); proj.hidden = !projCh.has(c.id); proj.textContent = L.projBadge;
    const note = $('.el-lightnote'); note.hidden = !(R.state.eyeZ < -200 && st.style === 'color'); note.textContent = L.lightNote;
    range.disabled=st.exploring;$('.el-pl select').disabled=st.exploring;$('.el-play').disabled=st.exploring;root.querySelectorAll('.el-chapters button').forEach(b=>b.disabled=st.exploring);const video=$('[data-a=video]');if(video)video.disabled=st.recording||st.exploring;
    if(st.exploring){const label=$('.el-exploration [data-explore-time]');if(label)label.textContent=(st.lang==='en'?'Historical time locked: ':'역사 시간 고정: ')+formatTime(model,st.t,st.lang);}
    const xb = root.querySelectorAll('[data-k=xray]'); xb.forEach(b => b.setAttribute('aria-pressed', (b.dataset.o === 'on') === xrayNow()));
  }

  function panel(kind) {
    const el = $('.el-panel'); st.panel = kind; el.hidden = false;
    const close = `<button type="button" data-a="close">${L.close}</button>`;
    if (kind === 'sources') el.innerHTML = `<h2>${L.sources}${close}</h2><p>${L.method}</p><ol>${model.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${s.publisher ? ` — ${esc(s.publisher)}` : ''}${s.year ? ` (${esc(s.year)})` : ''}</li>`).join('')}</ol>`;
    else el.innerHTML = `<h2>${L.about}${close}</h2>${model.meta.about ? `<p>${esc(pick(model.meta.about, st.lang))}</p>` : ''}`
      + (isBritannic(model)?`<h3>${st.lang==='en'?'Geometry evidence':'형상 기준 자료'}</h3><p>${st.lang==='en'?'The 1914 passenger-ship plan informs deck outlines and setbacks. Hull sections, individual window coordinates and the transition to the 1916 hospital configuration remain approximations. This visual layer does not change the historical time model or its source-share calculation.':'1914년 여객선 갑판도를 참고해 갑판 윤곽과 단차를 보강했습니다. 선체 횡단면·개별 창 좌표와 1916년 병원선 상태의 차이는 추정입니다. 형상 보강은 별도의 표현 계층이며, 기존 시간 모델의 출처 비율에 합산하지 않습니다.'}</p><ul>${PLAN_SOURCES.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul>`:'')
      + (isTitanic(model)?`<h3>${st.lang==='en'?'Geometry evidence':'형상 기준 자료'}</h3><p>${st.lang==='en'?'The 1912 inquiry gives deck extents, 9ft well-deck drops and the 192ft forward promenade screen. The 1911 period profile is a sister-ship/pre-completion reference; the 2001 deck drawings are modern references, not original builder plans. Hull sections and individual window/roof coordinates remain approximate. The original break, sinking and dated collapse tracks are unchanged.':'1912년 조사 보고서의 갑판 길이·웰 데크 9ft 단차·전방 방풍 스크린 192ft를 참고했습니다. 1911년 측면도는 자매선/완공 전 자료이며 2001년 갑판도는 현대 참고도입니다. 선체 횡단면·개별 창·지붕 위치는 추정입니다. 두 동강·침몰·날짜별 붕괴 경로는 기존 시간 모델을 유지합니다.'}</p><ul>${TITANIC_PLAN_SOURCES.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul>`:'')
      + (isTitanic(model)?`<h3>${st.lang==='en'?'Deep-sea observation context':'심해 생물·관측광 기준'}</h3><p>${st.lang==='en'?'Coral types follow bow-railing observations; unidentified small sponges are sparse on the stern. Geodia-rich Seamount U communities are not copied onto the wreck. Rattail-like fish are placed near the sediment. The small models use estimated placement, dimensions and motion, not a species identification or yearly census. Survey light is virtual observation light, not sunlight.':'선수 난간의 냉수성 산호와 선미에서 드물게 보고된 소형 해면을 참고했습니다. 인근 해산의 Geodia 대군락은 사용하지 않았습니다. 그레나디어류 물고기는 해저 가까이에 배치했습니다. 개별 위치·크기·형태·움직임은 추정이며, 특정 종의 정밀 동정이나 연도별 군집 재현이 아닙니다. 탐사광은 자연광이 아닌 가상 관측 조명입니다.'}</p><ul>${ECO_SOURCES.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}</ul>`:'')
      + (model.meta.limitations.length ? `<h3 style="font-size:13.5px">${L.limitations}</h3><ul>${model.meta.limitations.map((x,i) => `<li>${esc(isBritannic(model)&&i===0?(st.lang==='en'?'The base time model retains approximate sister-ship hull and equipment positions. Displayed deck shapes now also refer to the 1914 Britannic plan; exact surfaces and window positions remain estimates.':'기본 시간 모델은 자매선 기반의 선체·장비 위치 추정을 유지합니다. 표시되는 갑판 형상은 1914년 브리타닉 갑판도를 추가로 참고했으며, 정밀 곡면과 개별 창 위치는 추정입니다.'):pick(x, st.lang))}</li>`).join('')}</ul>` : '')
      + `<p class="el-sub">${L.gate2[model.meta.gate2] || L.gate2.unknown}</p>`;
  }

  // playback -------------------------------------------------------------------------------------------------
  let last=0,playRaf=0,surveyRaf=0,surveyLast=0;
  function explorationPanel(){
    const el=$('.el-exploration'),ko=st.lang!=='en';el.hidden=!st.exploring;if(!st.exploring)return;
    const stops=explorationStops(model),motionReady=isTitanic(model)&&ecologyAvailable(model,st.t)&&st.style==='color'&&!xrayNow(),eco=motionReady&&st.ecology;
    const opts=stops.map(q=>`<option value="${q.id}"${st.exploreStop===q.id?' selected':''}${q.availableFrom>st.t?' disabled':''}>${esc(pick(q.name,st.lang))}</option>`).join('')+(eco?['coral','sponge','fish'].map((k,i)=>`<option value="${k}"${st.exploreStop===k?' selected':''}>${ko?['산호','해면','물고기'][i]:['Coral','Sponge','Fish'][i]}</option>`).join(''):'');
    el.innerHTML=`<b data-explore-time>${ko?'역사 시간 고정: ':'Historical time locked: '}${formatTime(model,st.t,st.lang)}</b><label>${ko?'이동할 부위':'Visit'} <select data-survey="stop" aria-label="${ko?'탐사 위치':'Exploration stop'}">${opts}</select></label><label>${ko?'탐사광':'Survey light'} <select data-survey="lamp"${st.style!=='color'||!st.exploreLight?' disabled':''} aria-label="${ko?'탐사광 세기':'Survey intensity'}">${[.6,1,1.4].map((v,i)=>`<option value="${v}"${st.lampStrength===v?' selected':''}>${ko?['약하게','보통','밝게'][i]:['Dim','Normal','Bright'][i]}</option>`).join('')}</select></label><button type="button" data-survey="motion" aria-pressed="${st.exploreMoving}"${!motionReady||reducedMotion.matches?' disabled':''}>${ko?(st.exploreMoving?'생물·입자 정지':'생물·입자 재생'):(st.exploreMoving?'Pause fauna / snow':'Play fauna / snow')}</button><button type="button" data-survey="in" aria-label="${ko?'확대':'Zoom in'}">${ko?'확대':'Zoom in'}</button><button type="button" data-survey="out" aria-label="${ko?'축소':'Zoom out'}">${ko?'축소':'Zoom out'}</button><p>${ko?'드래그 회전·휠/핀치 확대. 탐사광·생물 모션은 설명용이며 역사 연도와 별개입니다. 시간순으로 나가면 이전 시점·보기가 복원됩니다.':'Drag to orbit; wheel/pinch to zoom. Survey lights and ecological motion are illustrative. History stays fixed; Timeline restores your prior time and view.'}${!isTitanic(model)?(ko?' 이 예시에는 별도 생물 모션이 없습니다.':' This example has no independent fauna motion.'):''}${reducedMotion.matches?(ko?' 동작 감소 설정으로 생물 모션은 정지합니다.':' Reduced motion keeps fauna still.'):''}</p>`;
    if(building){el.querySelector('[data-survey=motion]')?.remove();el.querySelector('p').textContent=wtc?(ko?'역사 시각을 고정해 같은 자리의 변화를 관찰합니다. 아직 조성되지 않은 부위는 선택할 수 없습니다. 실제 방문·구조 동선이 아닙니다.':'Lock the date to inspect the same site over time. Unbuilt stops are disabled. This is not a visitor or emergency route.'):nd?(ko?'역사 시각을 고정하고 손상·복원 부위를 살펴보세요. 볼트 탐사는 지붕을 숨긴 절개 보기입니다. 실제 방문 동선이 아닙니다.':'Inspect damage and restoration at a locked date. Vault inspection hides roof layers for a cutaway; this is not a visitor route.'):ko?'드래그 회전·휠/핀치 확대. 미시공 부위는 선택할 수 없습니다. 관찰 조명은 설명용이며, 시간순으로 나가면 이전 시점·보기가 복원됩니다.':'Drag to orbit; wheel/pinch to zoom. Unbuilt stops are disabled. View lighting is illustrative. Timeline restores the prior date and view.';const field=el.querySelector('[data-survey=lamp]');field.setAttribute('aria-label',ko?'관찰 조명 세기':'View light intensity');field.parentElement.firstChild.textContent=ko?'관찰 조명 ':'View light ';}
  }
  function surveyMotion(on){cancelAnimationFrame(surveyRaf);st.exploreMoving=!!on&&st.exploring&&!reducedMotion.matches;surveyLast=performance.now();
    const tick=now=>{if(!st.exploring||!st.exploreMoving)return;const dt=Math.min(.5,(now-surveyLast)/1000);surveyLast=now;if(!reducedMotion.matches){st.ecoClock+=dt;R.animateEcology(st.ecoClock);}surveyRaf=requestAnimationFrame(tick);};
    if(st.exploreMoving)surveyRaf=requestAnimationFrame(tick);
  }
  function explore(on){
    if(on===st.exploring)return;play(false);
    if(on){st.history={t:st.t,style:st.style,xray:st.xray,ecoView:st.ecoView,auto:R.state.auto,yaw:R.state.yaw,pitch:R.state.pitch,zoom:R.state.zoom};st.exploring=true;st.t=explorationStart(model,st.t);st.style='color';st.xray=false;st.ecoView='scene';st.exploreStop=defaultStop;R.setAuto(true);chrome();surveyMotion(isTitanic(model)&&ecologyAvailable(model,st.t));explorationPanel();setT(st.t,true);}
    else{surveyMotion(false);const h=st.history;st.exploring=false;Object.assign(st,{t:h.t,style:h.style,xray:h.xray,ecoView:h.ecoView});chrome();R.restoreView(h);}
  }
  function play(on){
    cancelAnimationFrame(playRaf);if(on&&st.exploring)return;st.playing=on;playButton();if(!on)return;
    if(st.t>=100)setT(0);last=performance.now();
    const step=now=>{if(!st.playing||st.exploring)return;const dt=Math.min(.5,(now-last)/1000);last=now;if(!reducedMotion.matches)st.ecoClock+=dt;setT(wtc?advanceWTC(model,st.t,dt,st.speed):nd?advanceNotreDame(model,st.t,dt,st.speed):advance(st.t,dt*playbackRate(model,st.t),st.speed));if(st.t>=100){play(false);return;}playRaf=requestAnimationFrame(step);};playRaf=requestAnimationFrame(step);
  }

  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const { k, o, a, v, ch, br } = b.dataset;
    if(k==='explorationMode'){explore(o==='survey');root.querySelector(`[data-k=explorationMode][data-o=${o}]`)?.focus();return;}
    if(b.dataset.survey==='motion'){surveyMotion(!st.exploreMoving);explorationPanel();$('[data-survey=motion]')?.focus();return;}
    if(['in','out'].includes(b.dataset.survey)){R.zoomBy(b.dataset.survey==='in'?.8:1.25);return;}
    if(['ecology','exploreLight'].includes(k)){st[k]=o==='on';if(k==='ecology'&&!st.ecology){st.ecoView='scene';if(st.exploring)st.exploreStop=defaultStop;}chrome();root.querySelector(`[data-k="${k}"][data-o="${o}"]`)?.focus();return;}
    if(k==='ecoView'){st.ecoView=o;if(st.exploring)st.exploreStop=o==='scene'?defaultStop:o;R.setAuto(true);chrome();root.querySelector(`[data-k="ecoView"][data-o="${o}"]`)?.focus();return;}
    if (k === 'lang') { st.lang = o; chrome(); return; }
    if (k === 'style') { st.style = o;if(st.exploring){st.ecoView='scene';st.exploreStop=defaultStop;} chrome(); return; }
    if (k === 'depth') { st.depth = o; chrome(); return; }
    if (k === 'xray') { st.xray = o === 'on';if(st.exploring){st.ecoView='scene';st.exploreStop=defaultStop;} chrome(); return; }
    if (ch != null) { play(false); setT(model.chapters[+ch].bar[0], true); return; }
    if (br) { st.branch = br; chrome(); return; }
    if (v === 'auto') { R.setAuto(!R.state.auto); viewButtons(); setT(st.t, true); return; }
    if (v === 'reset') { st.ecoView='scene';if(st.exploring)st.exploreStop=defaultStop;R.reset();chrome();return; }
    if (b.classList.contains('el-play')) { play(!st.playing); return; }
    if (b.classList.contains('el-trust') || a === 'sources') { panel('sources'); return; }
    if (a === 'about') { panel('about'); return; }
    if (a === 'close') { $('.el-panel').hidden = true; st.panel = null; return; }
    if (a === 'png') { download(dataBlob(R.dataURL()), `${slug}-${Math.round(st.t)}.png`); return; }
    if (a === 'video') saveVideo();
  });
  reducedMotion.addEventListener('change',()=>{if(st.exploring){surveyMotion(false);explorationPanel();setT(st.t,true);}});
  root.addEventListener('change',e=>{const kind=e.target.dataset.survey;if(kind==='stop'){st.exploreStop=e.target.value;st.ecoView=['coral','sponge','fish'].includes(st.exploreStop)?st.exploreStop:'scene';R.setAuto(true);setT(st.t,true);}if(kind==='lamp'){st.lampStrength=+e.target.value;setT(st.t,true);}});
  range.addEventListener('input', () => { play(false); setT(+range.value); });
  $('.el-pl select').addEventListener('change', e => { st.speed = e.target.value; });
  addEventListener('keydown', e => {
    if (/input|textarea|select/i.test(e.target.tagName) && e.target !== range) return;
    if (st.recording) return;
    if (e.key === '[' || e.key === ']') { st.speed = wtc?speedKeys[Math.max(0,Math.min(speedKeys.length-1,speedKeys.indexOf(st.speed)+(e.key===']'?1:-1)))]:stepSpeed(st.speed, e.key === ']' ? 1 : -1); $('.el-pl select').value = st.speed; return; }
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
    let recordedLast = performance.now();
    const step = now => { const dt=Math.min(.5,(now-recordedLast)/1000);recordedLast=now;
      if(!reducedMotion.matches)st.ecoClock+=dt;
      setT(wtc?advanceWTC(model,st.t,dt,st.speed):nd?advanceNotreDame(model,st.t,dt,st.speed):advance(st.t,dt*playbackRate(model,st.t),st.speed));
      if(st.t<100)requestAnimationFrame(step);else setTimeout(()=>rec.stop(),600); };
    requestAnimationFrame(step);
  }

  // start ------------------------------------------------------------------------------------------------------
  R.resize();
  const ch = num('chapter'), t0 = num('t') ?? (ch != null ? model.chapters[Math.max(0, Math.min(model.chapters.length - 1, ch - 1))].bar[0] : 0);
  st.t = t0; chrome();
  if (params.panel === 'sources' || params.panel === 'about') panel(params.panel);
  if(params.mode==='explore'){explore(true);if(explorationStops(model).some(s=>s.id===params.stop)){st.exploreStop=params.stop;explorationPanel();setT(st.t,true);}}
  if (params.play === '1' && !matchMedia('(prefers-reduced-motion: reduce)').matches) play(true);
  window.__elapse = Object.assign(window.__elapse || {}, { R, model, st, errors, setT, play,explore,surveyMotion });
  return window.__elapse;
}
