#!/usr/bin/env node
import {QUALITY_VIEWS} from '../engine/quality-form.js';
// Writes model.json for HMHS Britannic from the facts in britannic-notes.md (source ids s1… are that file's).
//   node research/britannic-gen.mjs [out.json]
// Ship frame: x forward from midships (the stem at +LOA/2), y to port, z up from the keel. World: x east, y north,
// z up, sea surface 0; headings count counter-clockwise from east (north = 90, south = 270).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const SK = new URL('..', import.meta.url).pathname.replace(/\/$/, '');   // the skill folder
const { linerOffsets } = await import(`${SK}/engine/hullform.js`);
const { deckHeightAt, halfBreadthAt, hullMesh } = await import(`${SK}/engine/geom.js`);
const { poseMatrix, mul, apply } = await import(`${SK}/engine/math.js`);
const { normalizeModel } = await import(`${SK}/engine/model.js`);
const { evaluate } = await import(`${SK}/engine/tracks.js`);
const { timeToBar } = await import(`${SK}/engine/chapters.js`);

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || resolve(HERE, '../examples/britannic.json');
const DEG = 180 / Math.PI;
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
const S = (...ids) => ({ sourceIds: ids }), EST = { confidence: 'estimated' };
const DISP = (ko, en) => ({ confidence: 'disputed', alternatives: { ko, en } });
const bi = (ko, en) => ({ ko, en });

// ---- the ship ------------------------------------------------------------------------------------------------
const LOA = 269.1, BEAM = 28.65, DEPTH = 19.66, DRAFT = 10.5;   // s1: 882 ft 9 in, 94 ft, 64 ft 6 in, 34 ft 7 in
const DRAFT_DAY = 9.5;                                           // no patients aboard on the outward run (estimated)
const XFP = LOA / 2, fp = d => r2(XFP - d);
const HULL = {
  offsets: linerOffsets({ loa: LOA - 10.0, beam: BEAM, depth: DEPTH, draft: DRAFT, parallel: 0.36, bilgeRadius: 2.2, aftFullness: 0.7 }),
  depth: DEPTH, draft: DRAFT, sheer: { fwd: 4.0, aft: 1.5 }, stem: 'straight', stern: 'counter', sternOverhang: 10.0, counterFrom: 8.5, counterRise: 5,
  // hospital-ship white above the waterline (s1, s8); the red below and the dark boot top are estimated
  paint: { topside: '#f1efe8', bottom: '#8a2a1d', boot: '#3b3b3b', bootHeight: 0.35, bands: [] },
};
HULL.offsets.stations = HULL.offsets.stations.map(s => ({ ...s, x: r2(s.x + 5.0) }));   // the counter's tip lands at -LOA/2
const deck = x => deckHeightAt(HULL, x);                         // C deck, the top of the hull piece, with sheer
const deckAt = (mid, x) => r2(mid + deck(x) - DEPTH);
const E = x => deckAt(13.8, x), D = x => deckAt(16.5, x);       // sister-ship deck heights (s10), estimated here
const BDK = 2.74, BOAT_H = 2.9, TANK = 1.5;
const B = x => r2(deck(x) + BDK);                                // B deck
const hb = (x, z) => halfBreadthAt(HULL, x, z);

// the bow broke and bent at bulkhead C, where the mine struck between holds 2 and 3 (s1; the hinge line estimated)
const CUT = fp(43.3);
const half = x => x > CUT + 0.01 ? 'hull-bow' : 'hull-main';

const pieces = [], tracks = [], events = [];
const piece = p => { pieces.push(p); return p; };
const STRIKE = '1916-11-21T09:05';
// Burial is not recorded; the hull is posed to rest about 1.5 m into the sand (estimated).
const EMBED_BOX = { hull: 2, main: 2, bow: 2.5 };
piece({ id: 'ship', name: bi('브리타닉호', 'Britannic'), template: 'group', ...S('s1') });
piece({ id: 'hull', name: bi('선체', 'Hull'), template: 'hull', parent: 'ship', params: HULL, embed: EMBED_BOX.hull, ...S('s1'),
  notes: 'LOA, beam, moulded depth and draught sourced (s1). The form (offsets) is estimated with linerOffsets from the sister ship: no lines plan is public.' });
piece({ id: 'hull-main', name: bi('선체 (뒤쪽 대부분)', 'Hull (main part)'), template: 'hull', parent: 'ship', appear: STRIKE,
  params: { ...HULL, range: [-XFP, CUT], cap: 'jagged' }, embed: EMBED_BOX.main, ...S('s1') });
piece({ id: 'hull-bow', name: bi('찌그러진 선수', 'Crumpled bow'), template: 'hull', parent: 'ship', appear: STRIKE,
  params: { ...HULL, range: [CUT, XFP], cap: 'jagged' }, embed: EMBED_BOX.bow, ...S('s1'),
  notes: 'Heavily deformed and held only by parts of C deck (s1). The bend angle and hinge are estimated.' });

// livery: the green band along the whole hull and the red crosses (s1, s8), painted on the hull so they follow its
// curve; the band height and the cross positions are estimated. The mine opened the starboard bow between holds 2
// and 3 (s1): a dark patch marks it.
const BAND_Z = 12.4, BAND_H = 1.5;
HULL.paint.bands.push({ z0: BAND_Z, z1: BAND_Z + BAND_H, color: '#2f7d3a', from: -XFP + 6, to: XFP - 4 });
for (const x of [28, -34]) {
  const zc = BAND_Z + BAND_H / 2;
  HULL.paint.bands.push({ z0: zc - 5, z1: zc + 5, color: '#c8102e', from: x - 1.5, to: x + 1.5 }, { z0: zc - 1.5, z1: zc + 1.5, color: '#c8102e', from: x - 5, to: x + 5 });
}
HULL.paint.bands.push({ z0: 1.5, z1: 6.5, color: '#151515', from: fp(43.3) - 2, to: fp(27.7) - 4, side: 'stbd' });

// superstructure (sister-ship profile, estimated): B deck house on the hull, A deck on it, boat-deck houses on top
const house = (id, ko, en, x0, x1, b, h, zBase, extra = {}) => {
  const mid = (x0 + x1) / 2;
  return piece({ id, name: bi(ko, en), template: 'deckhouse', parent: 'hull-main', offset: [r2(mid), 0, r2(zBase(mid))],
    params: { l: r2(Math.abs(x0 - x1)), b, h, r: 1.2, windows: 1, windowSpacing: 2.6 }, ...EST, ...extra });
};
const bW = r2(2 * Math.min(hb(fp(48), deck(fp(48))), hb(fp(222), deck(fp(222)))) - 0.6);
house('b-deck', 'B 갑판', 'B deck', fp(48), fp(222), bW, BDK, deck, { on: 'hull-main' });
house('a-deck', 'A 갑판 (산책 갑판)', 'A deck (promenade)', fp(58), fp(210), r2(Math.min(25.0, bW - 1)), BDK, B);
const boatZ = x => B(x) + BDK;
house('officers', '항해 선교와 사관실', "Bridge and officers' quarters", fp(58), fp(80), 13, BOAT_H, boatZ);
house('first-house', '1등석 계단실', 'First-class staircase house', fp(92), fp(138), 12, BOAT_H, boatZ);
house('aft-house', '뒤쪽 갑판실', 'After deckhouse', fp(150), fp(204), 12, BOAT_H, boatZ);
piece({ id: 'bridge-wings', name: bi('선교 날개', 'Bridge wings'), template: 'box', parent: 'hull-main', offset: [fp(58.5), 0, r2(boatZ(fp(58.5)) + BOAT_H - 0.6)],
  params: { l: 2.4, b: r2(bW - 0.4), h: 0.6, color: '#f4f1ea' }, ...EST });

// funnels: four, No. 4 a dummy, buff with black tops, tops 175 ft above the keel (s1 height; positions and colours
// from the sister ship, estimated)
const FUN_TOP = 53.3;
const FUNNELS = [[1, 76], [2, 110], [3, 142], [4, 177]].map(([n, d]) => {
  const x = fp(d), z = r2(boatZ(x) + BOAT_H);
  piece({ id: `funnel-${n}`, name: bi(`${n}번 굴뚝${n === 4 ? ' (환기용)' : ''}`, `Funnel ${n}${n === 4 ? ' (ventilation dummy)' : ''}`), template: 'funnel', parent: 'hull-main',
    offset: [x, 0, z], params: { a: 3.73, b: 2.9, h: r2(FUN_TOP - z), rake: 9.46, top: 4.6, color: '#d39b3a', topColor: '#141517' }, ...EST,
    passesThrough: ['officers', 'first-house', 'aft-house'] });
  return { n, x, z };
});
for (const [id, ko, en, d, top] of [['foremast', '앞 돛대', 'Foremast', 46, 60], ['mainmast', '뒷 돛대', 'Mainmast', 232, 60]]) {
  const x = fp(d);
  piece({ id, name: bi(ko, en), template: 'mast', parent: 'hull-main', offset: [x, 0, r2(deck(x))], params: { h: r2(top - deck(x)), d: 1.0, rake: 9.5 }, ...EST });
}
// gantry davits: five sets fitted of eight designed, several abreast of the funnels (s1); positions estimated.
// The boats are not drawn.
const GANTRY = [[68, 'port'], [68, 'stbd'], [152, 'port'], [152, 'stbd'], [198, 'port']];
GANTRY.forEach(([d, side], i) => {
  const x = fp(d), y = 11.6;
  piece({ id: `gantry-${i + 1}`, name: bi('갠트리 대빗(보트 걸이)', 'Gantry davit'), template: 'davit', parent: 'hull-main',
    offset: [x, side === 'port' ? y : -y, r2(boatZ(x))], params: { h: 6.5, reach: 3.2, side }, ...EST,
    // she lies on her starboard side, so its davits are pressed into the sand (estimated)
    ...(side === 'stbd' ? { embed: 3 } : {}) });
});

// watertight subdivision: the sister ship's 15 bulkheads A–P (s9) plus one more in the electric engine room
// (15 vs 16 is disputed); E–J raised to B deck (five, s1; which five is estimated), A–B and K–P to D deck, C–D to E deck
const BH = [['A', 14.0, D], ['B', 27.7, D], ['C', 43.3, E], ['D', 58.8, E], ['E', 75.3, B], ['F', 92.7, B], ['G', 110.0, B], ['H', 127.4, B],
  ['J', 145.7, B], ['K', 156.7, D], ['L', 177.7, D], ['M', 195.1, D], ['M2', 204.7, D], ['N', 214.3, D], ['O', 230.7, D], ['P', 248.1, D]].map(([n, d, deckFn]) => {
  const x = fp(d), top = r2(deckFn(x));
  const conf = n === 'M2' ? DISP('15개 격벽(위키백과, Chirnside 인용)이라는 자료와, 격벽 하나를 더해 17칸이 됐다는 자료가 있어요. 이 격벽은 위치도 추정이에요.', 'One account gives 15 bulkheads (Wikipedia, citing Chirnside); others say a bulkhead was added, making 17 compartments. Its position is estimated too.')
    : ['E', 'F', 'G', 'H', 'J'].includes(n) ? DISP('B 갑판까지 올린 격벽은 5개라는 자료와 6개라는 자료가 있고, 어느 것인지는 확인하지 못했어요.', 'Sources give five or six bulkheads raised to B deck; which ones is not recorded in what was found.') : EST;
  piece({ id: `bulkhead-${n}`, name: bi(`${n} 격벽`, `Bulkhead ${n}`), template: 'bulkhead', parent: half(x), params: { x, top, floor: TANK }, ...conf });
  return { n, x, top };
});
const bh = n => BH.find(b => b.n === n);
const COMPS = [
  ['forepeak', '선수 피크', 'Forepeak', XFP - 1.5, 'A'], ['hold-1', '1번 화물창', 'No. 1 hold', 'A', 'B'], ['hold-2', '2번 화물창', 'No. 2 hold', 'B', 'C'],
  ['hold-3', '3번 화물창', 'No. 3 hold', 'C', 'D'], ['br-6', '6번 보일러실', 'Boiler room 6', 'D', 'E'], ['br-5', '5번 보일러실', 'Boiler room 5', 'E', 'F'],
  ['br-4', '4번 보일러실', 'Boiler room 4', 'F', 'G'], ['br-3', '3번 보일러실', 'Boiler room 3', 'G', 'H'], ['br-2', '2번 보일러실', 'Boiler room 2', 'H', 'J'],
  ['br-1', '1번 보일러실', 'Boiler room 1', 'J', 'K'], ['engine', '왕복기관실', 'Reciprocating engine room', 'K', 'L'], ['turbine', '터빈실', 'Turbine room', 'L', 'M'],
  ['electric-1', '발전기실 (앞)', 'Electric engine room (fwd)', 'M', 'M2'], ['electric-2', '발전기실 (뒤)', 'Electric engine room (aft)', 'M2', 'N'],
  ['tunnel-1', '축로 (앞)', 'Shaft tunnel (forward)', 'N', 'O'], ['tunnel-2', '축로 (뒤)', 'Shaft tunnel (aft)', 'O', 'P'], ['afterpeak', '선미 피크', 'After peak', 'P', -XFP + 16],
].map(([id, ko, en, f, a]) => {
  const F = typeof f === 'number' ? null : bh(f), A = typeof a === 'number' ? null : bh(a);
  const x1 = F ? F.x : f, x0 = A ? A.x : a, top = r2(Math.min(...[F, A].filter(Boolean).map(v => v.top))), xc = (x0 + x1) / 2;
  const w = r2(2 * Math.min(hb(x0, 6), hb(x1, 6)) * 0.9);
  piece({ id, name: bi(ko, en), template: 'compartment', parent: half(xc), params: { x0: r2(x0), x1: r2(x1), floor: TANK, top, b: w }, ...EST });
  return { id, top, xc };
});
const topOf = id => COMPS.find(c => c.id === id).top;

// ---- the ship's track (all estimated: no track is recorded; northbound s1/s3, the starboard turn s1, the
// wreck's bow to the south s4) ------------------------------------------------------------------------------------
const T0 = Date.UTC(1916, 10, 21, 8, 10), iso = ms => new Date(ms).toISOString().slice(0, 19);
const at = sec => iso(T0 + sec * 1000);
const seg = (K, sec) => {
  if (sec >= K.at(-1)[0]) return K.at(-1)[1];
  const i = K.findIndex(k => k[0] > sec); if (i <= 0) return K[0][1];
  const [a, va] = K[i - 1], [b, vb] = K[i]; return va + (vb - va) * (sec - a) / (b - a);
};
const HEAD = [[0, 70], [120, 70], [360, 20], [1500, -60], [2400, -75], [3000, -90], [3300, -90]];
const SPEED = [[0, 10.5], [120, 10.5], [360, 6], [1500, 3], [1800, 0.4], [2400, 0.4], [2700, 2], [3000, 2], [3300, 0.2]];
const path = [[0, 0]];
for (let s = 1; s <= 3300; s++) { const h = seg(HEAD, s) / DEG, v = seg(SPEED, s); const [x, y] = path.at(-1); path.push([x + v * Math.cos(h), y + v * Math.sin(h)]); }
const [ox, oy] = path[120]; for (const p of path) { p[0] -= ox; p[1] -= oy; }    // the explosion at the world origin
const P = s => [r1(path[Math.min(3300, s)][0]), r1(path[Math.min(3300, s)][1])];
const norm = h => ((h % 360) + 360) % 360;

// hull points under a pose: the lowest point, the highest point, a given local point
const HULL_PTS = (() => { const { positions } = hullMesh(HULL), out = []; for (let i = 0; i < positions.length; i += 3) out.push([positions[i], positions[i + 1], positions[i + 2]]); return out; })();
const extent = pose => { const m = poseMatrix(pose); let lo = Infinity, hi = -Infinity; for (const p of HULL_PTS) { const z = apply(m, p)[2]; lo = Math.min(lo, z); hi = Math.max(hi, z); } return { lo, hi }; };
const toPose = m => ({ pos: [r2(m[12]), r2(m[13]), r2(m[14])], trim: r2(Math.asin(Math.max(-1, Math.min(1, -m[2]))) * DEG),
  list: r2(Math.atan2(m[6], m[10]) * DEG), heading: r2(norm(Math.atan2(m[1], m[0]) * DEG)) });

const shipKeys = [];
const ATT = [   // sec after 08:10, trim, list, z of the keel origin, confidence
  [0, 0, 0, -DRAFT_DAY, S('s1', 's3')], [120, 0, 0, -DRAFT_DAY, S('s1', 's3')], [240, 0.8, 0.5, -9.8, EST], [360, 1.5, 1, -10.0, S('s1', 's2')],
  [720, 3, 3, -10.4, EST], [1020, 4, 4, -10.8, S('s1')], [1500, 5.5, 6, -11.2, EST], [2100, 7, 8, -11.8, EST], [2400, 8, 9, -12.2, S('s1')],
  [3000, 11, 14, -13.5, S('s1')], [3180, 16, 24, -25, EST], [3240, 20, 32, -40, EST],
];
for (const [s, trim, list, z, c] of ATT) shipKeys.push({ at: at(s), v: { pos: [...P(s), z], trim, list, heading: r1(norm(seg(HEAD, s))) }, ...c });

// 09:05 the bow strikes the seabed with the stern still above water (s1, s6); then she rolls onto her starboard
// side and settles (s1, s4). The stem is pinned where it struck; each key sits on the seabed.
const SEA = 120;                                          // s1 122, s2 117, s4 116–120, s6 118
const smooth = f => f * f * (3 - 2 * f);
const ROLL0 = 3300, ROLL1 = 3480;
const stemLocal = [XFP, 0, 0];
const rollAngles = f => ({ trim: r2(25 + (0.5 - 25) * smooth(f)), list: r2(40 + (90 - 40) * smooth(f)), heading: 270 });
let PIN = null;
const rollKeys = [];
for (let s = ROLL0; s <= ROLL1; s += 20) {
  const f = (s - ROLL0) / (ROLL1 - ROLL0), ang = rollAngles(f);
  const m0 = poseMatrix({ pos: [0, 0, 0], ...ang }), stem0 = apply(m0, stemLocal);
  if (!PIN) PIN = [P(ROLL0)[0] + stem0[0], P(ROLL0)[1] + stem0[1]];       // the stem lands ahead of the 09:05 position
  const { lo } = extent({ pos: [0, 0, 0], ...ang }), sink = 0.4 + 1.1 * f;   // settles a little into the sand
  const v = { pos: [r1(PIN[0] - stem0[0]), r1(PIN[1] - stem0[1]), r2(-SEA - sink - lo)], ...ang };
  rollKeys.push({ s, f, v });
  const c = s === ROLL0 ? S('s1', 's6') : s === ROLL1 ? S('s1', 's4') : EST;
  shipKeys.push({ at: at(s), v, ...c });
}
tracks.push({ piece: 'ship', prop: 'pose', interp: 'linear', keys: shipKeys });
const FINAL = rollKeys.at(-1).v;
for (const k of shipKeys) { const e = extent(k.v); k._dbg = `${k.at.slice(11)} lo ${e.lo.toFixed(1)} hi ${e.hi.toFixed(1)}`; }

// the bow bends up about the deck line at bulkhead C as it is driven into the seabed (s1; angle estimated)
const HINGE = [CUT, 0, r2(deck(CUT))];
const bend = f => mul(mul(poseMatrix({ pos: HINGE }), poseMatrix({ trim: -12 * f, list: 6 * f })), poseMatrix({ pos: HINGE.map(v => -v) }));
tracks.push({ piece: 'hull-bow', prop: 'pose', interp: 'linear', keys: rollKeys.map(({ s, v }) => {
  const fb = smooth(Math.min(1, (s - ROLL0) / 120));
  return { at: at(s), v: toPose(mul(poseMatrix(v), bend(fb))), ...(s === ROLL0 ? S('s1') : EST) };
}) });

// ---- water in the compartments (metres above the keel at each compartment's centre) ---------------------------
// which compartments flooded and when the door failed are sourced (s1); the levels between are estimated
const W = (id, keys) => tracks.push({ piece: id, prop: 'water', keys: keys.map(([a, v, c]) => ({ at: a, v: r2(Math.min(v, topOf(id))), ...c })) });
const t = (h, m, s = 0) => iso(Date.UTC(1916, 10, 21, h, m, s));
const END_FILL = [t(9, 8), 99, EST];
W('forepeak', [[t(8, 12), TANK, S('s1')], [t(8, 14), 7, S('s1')], [t(8, 20), 13, EST], [t(8, 27), 99, EST], END_FILL]);
W('hold-1', [[t(8, 12), TANK, S('s1')], [t(8, 16), 7, S('s1')], [t(8, 25), 13, EST], [t(8, 35), 99, EST], END_FILL]);
W('hold-2', [[t(8, 12), TANK, S('s1')], [t(8, 14), 8, S('s1')], [t(8, 20), 13, EST], [t(8, 30), 99, EST], END_FILL]);
W('hold-3', [[t(8, 12), TANK, S('s1')], [t(8, 14), 8, S('s1')], [t(8, 22), 99, EST], END_FILL]);
W('br-6', [[t(8, 12), TANK, S('s1')], [t(8, 14), 3, S('s1')], [t(8, 30), 9, EST], [t(8, 50), 99, EST], END_FILL]);
W('br-5', [[t(8, 14), TANK, S('s1')], [t(8, 16), 2.5, EST], [t(8, 40), 9, EST], [t(9, 0), D(bh('F').x), S('s1')], [t(9, 5), 21, EST], END_FILL]);
W('br-4', [[t(8, 45), TANK, EST], [t(9, 0), 6, EST], [t(9, 5), 12, EST], END_FILL]);
for (const c of COMPS.map(c => c.id).filter(id => !['forepeak', 'hold-1', 'hold-2', 'hold-3', 'br-6', 'br-5', 'br-4'].includes(id)))
  W(c, [[t(9, 5), TANK, EST], END_FILL]);

// rust and growth: none at the sinking; the 2025 divers describe her as heavily overgrown but the best preserved of
// the big liners (s6). Levels are estimated; warm, shallow water, so kept low.
tracks.push({ piece: '*', prop: 'rust', keys: [{ at: t(9, 10), v: 0, ...EST }, { at: 1975.92, v: 0.3, ...EST }, { at: 2025.4, v: 0.42, ...EST }] });

// ---- events (cards) ---------------------------------------------------------------------------------------------
const ev = e => events.push(e);
ev({ id: 'channel', kind: 'note', at: t(8, 10), title: bi('케아 해협', 'The Kea Channel'), text: bi('병원선 브리타닉호가 무드로스로 가는 길에 케아 해협을 전속력으로 북쪽으로 지나요.', 'The hospital ship Britannic steams north through the Kea Channel at full speed, bound for Mudros.'),
  detail: bi('1,066명이 타고 있었어요: 승무원 673명, 육군 의무대 315명, 간호사 77명, 그리고 선장. 다친 병사를 태우러 가는 길이라 환자는 없었어요.', '1,066 aboard: 673 crew, 315 Army medical corps, 77 nurses and the captain. She was going out to fetch the wounded, so no patients were aboard.'), ...S('s1', 's3') });
ev({ id: 'explosion', kind: 'collision', at: t(8, 12), piece: 'hull', title: bi('폭발', 'Explosion'), text: bi('08:12, 우현 앞쪽 2번과 3번 화물창 사이에서 기뢰가 터져요.', 'At 08:12 a mine explodes on the starboard bow, between holds 2 and 3.'),
  detail: bi('독일 잠수함 U-73이 한 달 전 이 해협에 깐 기뢰예요. 1번 화물창 앞 격벽이 상하고, 6번 보일러실로 가는 화부 통로도 부서져 앞쪽 네 칸이 빠르게 차요.', 'The German submarine U-73 had laid mines in the channel a month earlier. The bulkhead ahead of hold 1 is damaged and the firemen’s tunnel to boiler room 6 is broken, so the first four compartments flood fast.'), ...S('s1', 's2', 's3') });
ev({ id: 'door', kind: 'overflow', at: t(8, 14), from: 'br-6', to: 'br-5', title: bi('닫히지 않은 문', 'A door that would not close'), text: bi('6번과 5번 보일러실 사이의 방수문이 제대로 닫히지 않아 물이 5번 보일러실로 들어가요.', 'The watertight door between boiler rooms 6 and 5 fails to close, and water gets into boiler room 5.'),
  detail: bi('폭발 2분 뒤 두 보일러실에서 사람들이 빠져나와요. 이제 여섯 칸이 열렸어요. 이 배는 여섯 칸이 차도 떠 있도록 만들어졌으니, 한계에 닿은 거예요.', 'Two minutes after the blast both boiler rooms are cleared. Six compartments are now open: exactly the most she was built to survive.'), ...S('s1') });
ev({ id: 'turn', kind: 'note', at: t(8, 16), title: bi('케아 섬으로', 'Turning for Kea'), text: bi('바틀릿 선장이 배를 얕은 곳에 올리려고 오른쪽 케아 섬으로 방향을 틀어요.', 'Captain Bartlett turns to starboard for Kea, hoping to run her aground.'),
  detail: bi('폭발로 조타 장치가 고장 나, 좌현 프로펠러를 더 빨리 돌려 방향을 잡았어요. 시각은 추정이에요.', 'The steering gear was knocked out, so he steered by running the port propeller faster. The time is estimated.'), ...S('s1', 's2') });
ev({ id: 'ten-min', kind: 'note', at: t(8, 22), title: bi('10분 만에', 'Ten minutes in'), text: bi('폭발 10분 뒤, 배는 타이타닉이 충돌 한 시간 뒤에 있던 상태쯤에 와 있어요.', 'Ten minutes after the blast she is about where Titanic was an hour after the iceberg.'), ...S('s1') });
ev({ id: 'portholes', kind: 'inflow', piece: 'br-5', at: t(8, 27), title: bi('열린 현창', 'Open portholes'), text: bi('15분쯤 지나 E 갑판의 현창들이 물에 잠겨요. 병실 환기를 위해 열어 둔 것들이에요.', 'About fifteen minutes in, the E-deck portholes go under. Many had been opened to air the wards.'),
  detail: bi('규정과 달리 열려 있던 현창으로 물이 방수 칸막이 위쪽으로 들어와 퍼졌어요.', 'Left open against standing orders, they let water in above the watertight bulkheads.'), ...S('s1') });
ev({ id: 'boats', kind: 'note', at: t(8, 35), title: bi('멈춘 기관', 'Engines stopped'), text: bi('일찍 내린 구명보트들이 아직 돌던 프로펠러 쪽으로 밀려가는 사고가 나요. 선장이 기관을 멈춰요.', 'Boats lowered early drift toward the still-turning propellers, and there is an accident. The captain stops the engines.'),
  detail: bi('이 사고의 정확한 시각은 기록되지 않았어요(추정 08:35).', 'The exact time is not recorded (about 08:35 here).'), ...EST });
ev({ id: 'beyond', kind: 'overflow', at: t(8, 45), from: 'br-5', to: 'br-4', title: bi('한계를 넘어', 'Past the limit'), text: bi('물이 5번 보일러실 뒤의 4번 보일러실까지 번져요. 일곱째 칸이에요.', 'Water reaches boiler room 4, behind boiler room 5: a seventh compartment.'),
  detail: bi('물이 뒤쪽 칸으로 넘어간 것은 기록에 있지만 시각은 추정이에요. 열린 현창으로 들어온 물이 큰 몫을 했어요.', 'That water got aft of boiler room 5 is recorded; the time is estimated. Water through the open portholes did much of it.'), ...EST });
ev({ id: 'restart', kind: 'note', at: t(8, 50), title: bi('마지막 시도', 'One more try'), text: bi('구명보트 35척이 떠나고, 선장이 다시 기관을 돌려 섬으로 향해요.', 'With 35 boats away, the captain starts the engines again and heads for the island.'), ...S('s1') });
ev({ id: 'abandon', kind: 'note', at: t(9, 0), title: bi('배를 떠나라', 'Abandon ship'), text: bi('물이 D 갑판까지 올라와요. 기관을 멈추고, 긴 기적 두 번으로 배를 떠나라고 알려요.', 'The water reaches D deck. The engines are stopped and two long blasts order everyone off.'), ...S('s1') });
ev({ id: 'funnels', kind: 'collapse', at: t(9, 4), until: t(9, 6), piece: 'funnel-1', mode: 'drop', title: bi('굴뚝이 하나씩', 'The funnels go one by one'), text: bi('배가 오른쪽으로 넘어가며 굴뚝들이 차례로 무너져요.', 'As she rolls to starboard the funnels collapse one after another.'),
  detail: bi('1번 굴뚝은 보트 갑판 바로 옆에, 2~4번은 선미 너머 잔해 속에 놓여 있어요.', 'Funnel 1 lies a few metres from the boat deck; funnels 2 to 4 lie in the debris off the stern.'), ...S('s1') });
ev({ id: 'hull-swap', kind: 'collapse', card: false, at: STRIKE, until: STRIKE, piece: 'hull', mode: 'vanish', title: bi('선체 교체', 'Hull swap'), text: bi('', ''), ...S('s1') });
ev({ id: 'bow-strikes', kind: 'note', at: STRIKE, title: bi('선수가 바닥에', 'The bow hits bottom'), text: bi('배 길이(269m)가 바다 깊이(약 120m)의 두 배가 넘어, 선미가 아직 물 위에 있을 때 선수가 바닥에 부딪혀요.', 'She is more than twice as long (269 m) as the sea is deep (about 120 m): the bow strikes the seabed while the stern is still above water.'),
  detail: bi('선수는 크게 찌그러져 C 갑판 일부로만 붙어 있어요. 구부러진 각도는 추정이에요.', 'The bow is badly crumpled and hangs on only by parts of C deck. The bend angle drawn is estimated.'), ...S('s1', 's6') });
ev({ id: 'foremast-falls', kind: 'collapse', card: false, at: t(9, 5, 30), until: t(9, 7), piece: 'foremast', mode: 'drop', title: bi('앞 돛대', 'Foremast'), text: bi('앞 돛대가 휘어 난파선 옆에 떨어져요.', 'The foremast bends and falls beside the wreck.'), ...S('s1') });
ev({ id: 'gone', kind: 'note', at: t(9, 7), title: bi('55분', 'Fifty-five minutes'), text: bi('09:07, 폭발 55분 만에 배가 오른쪽으로 누운 채 사라져요.', 'At 09:07, fifty-five minutes after the explosion, she rolls onto her starboard side and is gone.'), ...S('s1', 's2') });
ev({ id: 'rest', kind: 'note', at: t(9, 8, 30), title: bi('해저 120m', 'At 120 metres'), text: bi('배는 오른쪽 옆구리를 대고 누워요. 선수는 남쪽을 향해요.', 'She lies on her starboard side, bow to the south.'),
  detail: bi('바닥은 약 117~122m, 가장 높은 부분은 약 90m예요. 기뢰 구멍은 배 밑에 깔려 보이지 않아요.', 'The seabed is about 117–122 m down and her highest parts about 90 m. The mine hole is hidden beneath her.'), ...S('s1', 's4', 's6') });
ev({ id: 'found', kind: 'discovery', at: 1975.92, title: bi('발견', 'Found'), text: bi('1975년, 자크 쿠스토의 탐사선 칼립소 팀이 케아 해협 바닥에서 난파선을 찾아요.', 'In 1975 Jacques Cousteau’s team on Calypso finds the wreck in the Kea Channel.'),
  ...DISP('발견 날짜는 1975년 11월 13일(위키백과), 12월 3일(여러 자료), 12월 4일(Titanic Inquiry Project)로 갈려요. 이 모델은 12월 3일을 따랐어요.', 'The date is given as 13 November (Wikipedia), 3 December (several accounts) or 4 December 1975 (Titanic Inquiry Project). This model uses 3 December.') });
ev({ id: 'cousteau-dives', kind: 'discovery', at: 1976.6, title: bi('첫 진입', 'First inside'), text: bi('1976년, 쿠스토의 잠수부들이 처음으로 난파선 안에 들어가요.', 'In 1976 Cousteau’s divers go inside the wreck for the first time.'), ...S('s1') });
ev({ id: 'ballard', kind: 'discovery', at: 1995.5, title: bi('밸러드', 'Ballard'), text: bi('1995년 로버트 밸러드가 찾아와, 굴뚝들이 놀랄 만큼 온전하다고 기록해요.', 'In 1995 Robert Ballard visits and finds the funnels in surprisingly good condition.'), ...S('s1') });
ev({ id: 'mills', kind: 'note', at: 1996.6, title: bi('소유자', 'An owner'), text: bi('1996년 8월, 해양사 연구자 사이먼 밀스가 난파선을 사요. 지금도 그가 소유자예요.', 'In August 1996 the maritime historian Simon Mills buys the wreck. He still owns it.'), ...S('s1') });
ev({ id: 'project-2012', kind: 'discovery', at: 2012.4, title: bi('부식 연구', 'Studying the decay'), text: bi('2012년, 잠수부들이 물과 퇴적물, 생물 표본을 모아 난파선이 어떻게 삭아 가는지 연구해요.', 'In 2012 divers collect water, sediment and organisms to study how the wreck is wearing away.'), ...S('s4') });
ev({ id: 'shell-door', kind: 'discovery', at: 2016.5, title: bi('열린 출입문', 'An open shell door'), text: bi('2016년, 잠수정이 E 갑판 옆구리의 출입문이 열려 있는 것을 찾아요.', 'In 2016 a submersible finds a shell door open on E deck.'), ...S('s5') });
ev({ id: 'bell', kind: 'discovery', at: 2019.5, title: bi('망루의 종', 'The crow’s-nest bell'), text: bi('2019년, 쓰러진 앞 돛대 망루 아래 모래 위에서 종이 발견돼요.', 'In 2019 divers spot the crow’s-nest bell on the sand below the fallen foremast’s lookout.'), ...S('s1', 's5') });
ev({ id: 'opened', kind: 'note', at: 2022.45, title: bi('바깥만 허락', 'Outside only'), text: bi('2022년, 그리스가 허가받은 잠수의 바깥 관람을 열어요. 안에 들어가거나 물건을 옮기는 것은 금지예요.', 'In 2022 Greece opens the wreck to licensed dives on the outside only. Going in or moving anything is forbidden.'), ...S('s11') });
ev({ id: 'recovery', kind: 'discovery', at: 2025.4, title: bi('첫 인양', 'First recovery'), text: bi('2025년 5월, 허가를 받은 잠수팀이 망루의 종과 좌현 항해등 등을 건져 올려요.', 'In May 2025 a licensed team raises the crow’s-nest bell, the port navigation light and other items.'),
  detail: bi('종은 약 70kg이에요. 유물은 보존 처리 뒤 피레우스의 국립수중고고학박물관에 전시될 예정이에요.', 'The bell weighs about 70 kg. After conservation the items are to go on show at the national museum of underwater antiquities in Piraeus.'), ...S('s5', 's7') });

// ---- camera -----------------------------------------------------------------------------------------------------
const H = s => norm(seg(HEAD, s));
const camera = [
  { at: at(0), target: 'ship', yaw: H(0) - 60, pitch: 16, dist: 520 },
  { at: at(120), target: 'ship', yaw: H(120) - 45, pitch: 14, dist: 400 },
  { at: at(360), target: 'ship', yaw: H(360) - 70, pitch: 22, dist: 430 },
  { at: at(1020), target: 'ship', yaw: H(1020) - 80, pitch: 20, dist: 420 },
  { at: at(2400), target: 'ship', yaw: H(2400) - 100, pitch: 18, dist: 430 },
  { at: at(3000), target: 'ship', yaw: H(3000) - 75, pitch: 12, dist: 460 },
  { at: at(3240), target: 'ship', yaw: 200, pitch: 6, dist: 520 },
  { at: at(3300), target: 'ship', yaw: 195, pitch: 4, dist: 520 },
  { at: at(3420), target: 'ship', yaw: 175, pitch: 10, dist: 380 },
  // on the seabed the eye stays under the surface (eye z = target z + dist·sin(pitch) < 0)
  { at: t(9, 10), target: 'ship', yaw: 150, pitch: 13, dist: 340 },
  { at: 1975.92, target: 'ship', yaw: 135, pitch: 12, dist: 330 },
  { at: 1993, target: 'ship', yaw: 125, pitch: 12, dist: 330 },
  { at: 1996, target: 'hull-bow', yaw: 120, pitch: 16, dist: 220 },
  { at: 2012, target: 'ship', yaw: 60, pitch: 12, dist: 340 },
  { at: 2019.5, target: 'hull-main', yaw: 110, pitch: 14, dist: 300 },
  { at: 2026.8, target: 'ship', yaw: 160, pitch: 13, dist: 350 },
];

// ---- sources: the table in the notes ---------------------------------------------------------------------------
const notes = readFileSync(resolve(HERE, 'britannic-notes.md'), 'utf8');
const sources = [];
for (const line of notes.slice(notes.indexOf('## 9. Sources')).split('\n')) {
  const m = line.match(/^\|\s*(s\d+)\s*\|\s*(.*?)\s*\|\s*(https?:\/\/[^|]+?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);
  if (m) sources.push({ id: m[1], title: m[2], url: m[3], publisher: m[4], year: m[5] });
}

const model = {
  subject: { name: bi('HMHS 브리타닉', 'HMHS Britannic'), kind: 'ship', built: 1915, dims: { loa: LOA, beam: BEAM, depth: DEPTH, draft: DRAFT }, ...S('s1') },
  features: { lights: false, compartments: true, break: false, projection: false, xrayChapters: ['explosion', 'flooding'] },
  chapters: [
    { id: 'explosion', name: bi('폭발', 'Explosion'), start: '1916-11-21T08:10', end: '1916-11-21T08:16', bar: [0, 8], unit: 'minute' },
    { id: 'flooding', name: bi('침수', 'Flooding'), start: '1916-11-21T08:16', end: '1916-11-21T09:00', bar: [8, 40], unit: 'minute' },
    { id: 'capsize', name: bi('전복', 'Capsize'), start: '1916-11-21T09:00', end: '1916-11-21T09:10', bar: [40, 62], unit: 'minute' },
    { id: 'quiet', name: bi('잊힌 60년', 'Sixty quiet years'), start: '1916-11-21T09:10', end: 1975.85, bar: [62, 70], unit: 'year' },
    { id: 'explored', name: bi('탐사', 'Explored'), start: 1975.85, end: 2026.8, bar: [70, 100], unit: 'year' },
  ],
  stops: QUALITY_VIEWS,
  pieces, tracks, events, camera, cameraSubject: ['hull-main', 'hull-bow'],
  environment: { seaDepth: SEA, sky: 'day', seabed: { size: 15000, relief: 3 }, growth: { kind: 'crust', color: '#6f7a4a' } },
  // recorded: on her starboard side, bow to the south (s1, s4)
  wreck: { poses: [{ piece: 'ship', list: 90, heading: 270, tol: 15 }] },
  refs: { ko: { name: '63빌딩', height: 249 }, en: { name: 'Big Ben', height: 96 } },
  sources,
  meta: {
    renderQuality: 'high',
    interpretation: bi('HMHS 브리타닉(1916): 타이타닉의 동생 배로, 병원선으로 쓰이다 그리스 케아 해협에서 기뢰에 맞아 가라앉은 배예요. 1874년과 1930년의 다른 브리타닉호가 아니에요. 낮(08:12~09:07)에 가라앉아 조명 장면은 넣지 않았고, 배는 한 덩어리로 가라앉아 두 동강 장면도 없어요(찌그러진 선수만 따로 그렸어요). 어느 칸이 찼는지는 기록이 있어 구획 투시를 넣었어요. 날짜가 있는 붕괴 예측이 없어서 "앞으로" 장은 만들지 않았어요.',
      'HMHS Britannic (1916): Titanic’s younger sister, serving as a hospital ship when a mine sank her in the Kea Channel, Greece. Not the Britannic of 1874 or of 1930. She sank by day (08:12–09:07), so there is no lights scene; she went down in one piece, so there is no break (only the crumpled bow is drawn as a separate part). Which compartments flooded is recorded, so x-ray is on. No dated forecast of her collapse exists, so there is no projection chapter.'),
    about: bi('1916년 11월 21일, 타고 있던 1,066명 가운데 30명이 목숨을 잃었어요(자료에 따라 21~41명). 이 그림에는 사람과 구명보트를 그리지 않았어요. 난파선은 그리스 문화부 수중고고학청이 관리하는 보호 유적이고, 허가받은 다이빙 센터를 통해 바깥만 볼 수 있으며 물건을 옮기는 것은 금지예요. 1996년부터 사이먼 밀스가 소유하고 있어요.',
      'Of the 1,066 people aboard, 30 died on 21 November 1916 (sources range from 21 to 41). No people or lifeboats are drawn here. The wreck is a protected site under the Greek Ministry of Culture’s Ephorate of Underwater Antiquities: licensed dives may visit the outside only, and nothing may be moved. Simon Mills has owned it since 1996.'),
    limitations: [
      bi('선체 곡면, 상부 구조, 굴뚝·돛대·대빗의 위치는 자매선 타이타닉의 옆모습에서 잡은 추정이에요.', 'The hull form, superstructure and the positions of funnels, masts and davits are estimated from the sister ship Titanic’s profile.'),
      bi('초록 띠와 붉은 십자는 선체에 칠한 무늬로 그렸어요. 띠의 높이와 십자의 수·위치는 추정이에요. 기뢰로 뚫린 자리(우현 앞쪽)는 어두운 칸으로 표시했고, 크기는 추정이에요.', 'The green band and red crosses are painted on the hull; the band height and the crosses’ number and position are estimated. The mine damage (starboard bow) is marked as a dark patch of estimated size.'),
      bi('격벽 수(15 또는 16)와 B 갑판까지 올린 격벽(5 또는 6개, 어느 것인지 미상)은 자료가 갈려요. 구획 수위와 기울기, 배의 항로는 모두 추정이에요.', 'The bulkhead count (15 or 16) and which bulkheads reached B deck (five or six, which ones unknown) are disputed. Water levels, angles and the ship’s track are all estimated.'),
      bi('선수가 구부러진 각도와 모양, 굴뚝 2~4번이 놓인 자리는 추정이에요.', 'The angle and shape of the crumpled bow and where funnels 2–4 lie are estimated.'),
      bi('해저에서 날짜가 기록된 붕괴는 찾지 못했어요. 해양 생물이 덮인 정도는 추정이에요.', 'No dated collapse on the seabed was found. The amount of marine growth is estimated.'),
    ],
  },
};

// funnels 2–4 come away during the roll and settle in the debris off the stern (s1; times and spots estimated):
// their first key is exactly where they were on the ship at that moment
{
  const prov = normalizeModel(model);
  const sternW = apply(poseMatrix(FINAL), [-XFP, 0, 10]), fwd = [Math.cos(FINAL.heading / DEG), Math.sin(FINAL.heading / DEG)];
  const side = [-fwd[1], fwd[0]];
  [[2, t(9, 4, 30), 55, 18], [3, t(9, 5), 95, -14], [4, t(9, 5, 30), 140, 26]].forEach(([n, a, back, off], i) => {
    const s0 = evaluate(prov, timeToBar(prov, a)), p0 = toPose(s0.pieces.get(`funnel-${n}`).matrix);
    const rest = [r1(sternW[0] - fwd[0] * back + side[0] * off), r1(sternW[1] - fwd[1] * back + side[1] * off)];
    const mid = [r1((p0.pos[0] + rest[0]) / 2), r1((p0.pos[1] + rest[1]) / 2)];
    const tm = iso(Date.parse(a + 'Z') + 50000), te = iso(Date.parse(a + 'Z') + 130000);
    tracks.push({ piece: `funnel-${n}`, prop: 'pose', interp: 'linear', keys: [
      { at: a, v: p0, ...EST },
      { at: tm, v: { pos: [...mid, r1((p0.pos[2] - SEA) / 2)], trim: r1(p0.trim / 2), list: 70, heading: r1(p0.heading + 20) }, ...EST },
      { at: te, v: { pos: [...rest, r2(-SEA + 2.9 - 0.3)], trim: 0, list: 90, heading: r1(norm(FINAL.heading + 40 + 50 * i)) }, ...S('s1') },
    ] });
  });
}

if (process.argv.includes('--debug')) for (const k of shipKeys) console.log(k._dbg, JSON.stringify(k.v));
for (const k of shipKeys) delete k._dbg;
writeFileSync(OUT, JSON.stringify(model, null, 1));
console.log(`wrote ${OUT}: ${pieces.length} pieces, ${tracks.length} tracks, ${events.length} events, ${sources.length} sources`);
