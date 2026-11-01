// The time model: what Claude writes from research, and what the page and Gate 1 read. Pure.
import {isBuilding,normalizeBuilding,validateBuilding} from './building-model.js';
import { parseAt, timeToBar } from './chapters.js';

// why a time did not land on the bar: it is not a time at all, or it falls outside the chapters
const badTime = at => isFinite(parseAt(at)) ? `${JSON.stringify(at)} is outside every chapter` : `${JSON.stringify(at)} is not a time Elapse reads: write an ISO date-time with no zone ("1912-04-14T23:40") or a decimal year as a number (1985.67)`;
import { classOf } from '../shared/confidence.js';

export const TEMPLATES = ['group', 'hull', 'deckhouse', 'funnel', 'mast', 'davit', 'railing', 'bulkhead', 'compartment', 'iceberg',
  'debris', 'boiler', 'seabed', 'box', 'cylinder'];
export const PROPS = ['pose', 'water', 'lights', 'rust'];
export const EVENT_KINDS = ['note', 'collision', 'overflow', 'inflow', 'lightsOut', 'break', 'collapse', 'discovery'];
export const COLLAPSE_MODES = ['drop', 'sag', 'crush', 'vanish', 'topple'];
export const FEATURES = ['lights', 'compartments', 'break', 'projection'];
export const DIM_TOL = 0.005;          // official size, relative
export const WARN_SHARE = 0.5;         // below this sourced share the page shows a warning band

const bi = v => v == null ? v : typeof v === 'string' ? { ko: v, en: v } : v;
const arr = v => Array.isArray(v) ? v : [];

export function normalizeModel(raw) {
  if(isBuilding(raw))return normalizeBuilding(raw);
  const m = structuredClone(raw);
  m.subject = m.subject || {}; m.subject.name = bi(m.subject.name);
  m.features = Object.fromEntries(FEATURES.map(f => [f, !!m.features?.[f]]).concat(
    m.features?.projectionChapters ? [['projectionChapters', m.features.projectionChapters]] : []));
  for (const k of ['chapters', 'pieces', 'tracks', 'events', 'camera', 'sources', 'branches', 'cameraSubject']) m[k] = arr(m[k]);
  for (const c of m.chapters) { c.name = bi(c.name); c._start = parseAt(c.start); c._end = parseAt(c.end); }
  if (m.features.projection && !m.features.projectionChapters && m.chapters.length) m.features.projectionChapters = [m.chapters.at(-1).id];
  // the chapters that open in x-ray by default (where the compartments matter): the first unless the model says
  m.features.xrayChapters = Array.isArray(raw.features?.xrayChapters) ? raw.features.xrayChapters : m.chapters.length ? [m.chapters[0].id] : [];
  for (const p of m.pieces) { p.name = bi(p.name); p.offset = Array.isArray(p.offset) ? p.offset : [0, 0, 0]; p.passesThrough = arr(p.passesThrough); p.params = p.params || {}; if (p.rotate) p.rotate = { trim: 0, list: 0, heading: 0, ...p.rotate }; }
  for (const p of m.pieces) if (p.appear != null) p._appear = timeToBar(m, p.appear);
  const keyed = tr => { tr.keys = arr(tr.keys).map(k => ({ ...k, _t: timeToBar(m, k.at) })).sort((a, b) => a._t - b._t); tr.interp = tr.interp || 'linear'; };
  m.tracks.forEach(keyed);
  for (const e of m.events) { for (const f of ['title', 'text', 'detail', 'alternatives']) e[f] = bi(e[f]); e._t = timeToBar(m, e.at); if (e.until != null) e._until = timeToBar(m, e.until); }
  m.events.sort((a, b) => a._t - b._t);
  for (const c of m.camera) c._t = timeToBar(m, c.at);
  m.camera.sort((a, b) => a._t - b._t);
  for (const b of m.branches) { b.name = bi(b.name); b.tracks = arr(b.tracks); b.tracks.forEach(keyed); }
  m.environment = { seaDepth: 0, sky: 'day', ...(m.environment || {}) };
  m.meta = { limitations: [], ...(m.meta || {}) };
  for (const f of ['interpretation', 'about']) m.meta[f] = bi(m.meta[f]);
  m.meta.limitations = arr(m.meta.limitations).map(bi);
  return m;
}

// every item that should carry a confidence: pieces, track keys, events
export const confidenceItems = m => [...m.pieces, ...m.tracks.flatMap(t => t.keys), ...m.branches.flatMap(b => b.tracks.flatMap(t => t.keys)), ...m.events];

// how much of the model is sourced, estimated, disputed or projection. Pieces and events count once each; a track
// counts once, split by its keys' classes, so writing more keys for a smooth motion does not change the shares.
export function classShares(m) {
  const out = { sourced: 0, estimated: 0, disputed: 0, projection: 0 };
  let n = 0;
  const add = (cls, w = 1) => { if (cls) out[cls] += w; };
  for (const it of [...m.pieces, ...m.events]) { add(classOf(it)); n++; }
  for (const tr of [...m.tracks, ...m.branches.flatMap(b => b.tracks)]) {
    if (!tr.keys.length) continue;
    for (const k of tr.keys) add(classOf(k), 1 / tr.keys.length);
    n++;
  }
  if (n) for (const k in out) out[k] /= n;
  return out;
}
export const sourcedShare = m => classShares(m).sourced;

// schema and references only; the physical checks live in checks.js
export function validateModel(m) {
  if(isBuilding(m))return validateBuilding(m);
  const errors = [], warnings = [], err = (where, msg) => errors.push({ where, msg });
  const ids = new Set(), sources = new Set(m.sources.map(s => s.id));
  const d = m.subject.dims || {};
  for (const k of ['loa', 'beam', 'depth', 'draft']) if (!(d[k] > 0)) err('subject', `dims.${k} must be a positive number (m)`);
  if (!m.subject.name?.ko && !m.subject.name?.en) err('subject', 'name is missing');
  if (!m.chapters.length) err('chapters', 'at least one chapter is needed');
  m.chapters.forEach((c, i) => {
    for (const k of ['start', 'end']) if (!isFinite(c[`_${k}`])) err(`chapter ${c.id ?? i}`, `${k} ${JSON.stringify(c[k])} is not a time Elapse reads: write an ISO date-time with no zone or a decimal year as a number`);
    if (!Array.isArray(c.bar) || c.bar.length !== 2 || !(c.bar[1] > c.bar[0])) err(`chapter ${c.id ?? i}`, 'bar must be [from, to] with to > from');
    if (!['minute', 'year'].includes(c.unit)) err(`chapter ${c.id ?? i}`, "unit must be 'minute' or 'year'");
  });
  for (const p of m.pieces) {
    if (!p.id) { err('piece', 'a piece has no id'); continue; }
    if (ids.has(p.id)) err(`piece ${p.id}`, 'duplicate id');
    ids.add(p.id);
  }
  const has = id => ids.has(id);
  const srcCheck = (where, it) => { for (const s of arr(it.sourceIds)) if (!sources.has(s)) err(where, `unknown source '${s}'`); };
  for (const p of m.pieces) {
    if (!TEMPLATES.includes(p.template)) err(`piece ${p.id}`, `unknown template '${p.template}'`);
    if (p.parent != null && !has(p.parent)) err(`piece ${p.id}`, `parent '${p.parent}' does not exist`);
    if (p.on != null && !has(p.on)) err(`piece ${p.id}`, `on '${p.on}' does not exist`);
    for (const q of p.passesThrough) if (!has(q)) err(`piece ${p.id}`, `passesThrough '${q}' does not exist`);
    if (p.appear != null && !isFinite(p._appear)) err(`piece ${p.id}`, `appear ${badTime(p.appear)}`);
    if (p.template === 'hull') for (const w of arr(p.params.windows)) if (!(w.spacing > 0) || !(w.to >= w.from)) err(`piece ${p.id}`, 'each windows row needs spacing > 0 and to ≥ from');
    srcCheck(`piece ${p.id}`, p);
  }
  for (const id of m.features.xrayChapters) if (!m.chapters.some(c => c.id === id)) err('features', `xrayChapters names '${id}', which is not a chapter`);
  // a parent chain must end
  for (const p of m.pieces) { let q = p, n = 0; while (q?.parent && n++ < 50) q = m.pieces.find(x => x.id === q.parent); if (n >= 50) err(`piece ${p.id}`, 'parent chain loops'); }
  const checkTracks = (tracks, where) => tracks.forEach((tr, i) => {
    const w = `${where} ${tr.piece}.${tr.prop}`;
    if (tr.piece !== '*' && !has(tr.piece)) err(w, `piece '${tr.piece}' does not exist`);
    if (!PROPS.includes(tr.prop)) err(w, `unknown prop '${tr.prop}'`);
    if (tr.piece === '*' && tr.prop !== 'rust') err(w, "only rust may use piece '*'");
    if (!tr.keys.length) err(w, 'a track needs keys');
    tr.keys.forEach(k => { if (!isFinite(k._t)) err(w, `key time ${badTime(k.at)}`); srcCheck(w, k); });
  });
  checkTracks(m.tracks, 'track');
  for (const e of m.events) {
    const w = `event ${e.id}`;
    if (!EVENT_KINDS.includes(e.kind)) err(w, `unknown kind '${e.kind}'`);
    if (!isFinite(e._t)) err(w, `time ${badTime(e.at)}`);
    if (e.until != null && !(e._until >= e._t)) err(w, 'until must be a time after at, inside a chapter');
    if (e.piece != null && !has(e.piece)) err(w, `piece '${e.piece}' does not exist`);
    for (const f of ['from', 'to']) if (e[f] != null && !has(e[f])) err(w, `${f} '${e[f]}' does not exist`);
    if (e.kind === 'collapse') { if (!COLLAPSE_MODES.includes(e.mode)) err(w, `unknown collapse mode '${e.mode}'`); if (!e.piece) err(w, 'a collapse needs a piece'); }
    if (e.kind === 'overflow' && (!e.from || !e.to)) err(w, 'an overflow needs from and to');
    if (e.kind === 'inflow' && !e.piece) err(w, 'an inflow needs the piece (compartment) the water enters');
    if (!e.title?.ko && !e.title?.en) err(w, 'title is missing');
    srcCheck(w, e);
  }
  for (const c of m.camera) {
    if (!isFinite(c._t)) err('camera', `time ${badTime(c.at)}`);
    if (typeof c.target === 'string' && !has(c.target)) err('camera', `target '${c.target}' does not exist`);
  }
  for (const id of m.cameraSubject) if (!has(id)) err('cameraSubject', `'${id}' does not exist`);
  m.branches.forEach(b => checkTracks(b.tracks, `branch ${b.id}`));
  srcCheck('subject', m.subject);
  return { errors, warnings };
}
