#!/usr/bin/env node
import {TITANIC_QUALITY_VIEWS} from '../engine/quality-form.js';
// Writes examples/titanic.json from the facts in research/titanic-notes.md (source ids s1… are that file's).
//   node research/titanic-gen.mjs [out.json]
// Ship frame: x forward from midships (the stem at +LOA/2), y to port, z up from the keel. World: x east, y north,
// z up, sea surface 0; headings count counter-clockwise from east (west = 180, north = 90).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { linerOffsets } from '../engine/hullform.js';
import { deckHeightAt, halfBreadthAt } from '../engine/geom.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || resolve(HERE, '../examples/titanic.json');
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
const S = (...ids) => ({ sourceIds: ids }), EST = { confidence: 'estimated' }, PROJ = { confidence: 'projection' };
const bi = (ko, en) => ({ ko, en });

// ---- the ship ------------------------------------------------------------------------------------------------
const LOA = 269.1, BEAM = 28.2, DRAFT = 10.5, DEPTH_B = 22.3;   // s14: moulded depth 73 ft 3 in to B (bridge) deck
const XFP = LOA / 2;                                             // the straight stem stands on the forward perpendicular
const fp = d => r2(XFP - d);                                     // metres aft of FP -> ship x
const DRAFT_NIGHT = 9.93;                                        // load draught less about 2 ft of coal and stores used (s15)
const HULL = {
  offsets: linerOffsets({ loa: LOA - 10.0, beam: BEAM, depth: DEPTH_B, draft: DRAFT, parallel: 0.36, bilgeRadius: 2.2, aftFullness: 0.7 }),
  depth: DEPTH_B, draft: DRAFT, sheer: { fwd: 4.0, aft: 1.5 }, stem: 'straight', stern: 'counter', sternOverhang: 10.0, counterFrom: 8.5, counterRise: 5,
  paint: { topside: '#17181b', bottom: '#8a2a1d', boot: '#e9e4d6', bootHeight: 0.35 },
};
// the offsets run from the after perpendicular to the stem; shift them so the counter's tip lands at -LOA/2
HULL.offsets.stations = HULL.offsets.stations.map(s => ({ ...s, x: r2(s.x + 5.0) }));
const deck = x => deckHeightAt(HULL, x);                         // B deck (top of the black hull) with sheer
const SHEER_AT = x => deck(x) - DEPTH_B;
const deckAt = (mid, x) => r2(mid + SHEER_AT(x));                // a lower deck at x: its amidships height plus the sheer
const E = x => deckAt(13.8, x), D = x => deckAt(16.5, x), G = x => deckAt(8.8, x), F = x => deckAt(11.2, x);
const TANK = 1.5;                                                // tank top above the keel (s1)
const hb = (x, z) => halfBreadthAt(HULL, x, z);

// the break: the bow section is about 140 m from the stem, the stern about 107 m from the stern tip; the 22 m
// between (boiler room 1, the 3rd funnel) broke up (s17, s18, s23)
const CUT_BOW = fp(140), CUT_STERN = r2(-XFP + 107);
const half = x => x >= CUT_BOW ? 'hull-bow' : x >= CUT_STERN ? 'hull-mid' : 'hull-stern';

const pieces = [], tracks = [], events = [];
const piece = p => { pieces.push(p); return p; };
piece({ id: 'ship', name: bi('타이타닉호', 'Titanic'), template: 'group', ...S('s1', 's14') });
const windows = [14.9, 17.6, 20.6].map(z => ({ z, from: fp(250), to: fp(18), spacing: 2.4 }));
piece({ id: 'hull', name: bi('선체', 'Hull'), template: 'hull', parent: 'ship', params: { ...HULL, windows }, ...S('s1', 's14', 's46'),
  notes: 'LOA, beam, depth to B deck, draught, sheer and stern type sourced (s1, s14, s46). The form (offsets) is estimated with linerOffsets: no lines plan is public. The forward and after well decks are not cut out.' });
for (const [id, ko, en, range] of [['hull-bow', '선수부', 'Bow section', [CUT_BOW, XFP]], ['hull-mid', '가운데 부분', 'Middle section', [CUT_STERN, CUT_BOW]], ['hull-stern', '선미부', 'Stern section', [-XFP, CUT_STERN]]])
  piece({ id, name: bi(ko, en), template: 'hull', parent: 'ship', appear: '1912-04-15T02:18', params: { ...HULL, range, cap: 'jagged' },
    ...S('s17', 's18', 's23'), embed: id === 'hull-bow' ? 19 : id === 'hull-stern' ? 15 : 0.5 });

// superstructure: A deck (white, nearly full width) from the bridge front aft, boat-deck houses on it (s1 lengths;
// positions estimated from the profile)
const A_TOP = 2.74, BOAT_H = 2.9;                                // 9 ft and 9 ft 6 in between decks (s1)
function house(id, ko, en, x0, x1, b, h, zBase, parentFn = half, extra = {}) {
  // split at the break so each part rides with its section
  const cuts = [CUT_STERN, CUT_BOW].filter(c => c > Math.min(x0, x1) && c < Math.max(x0, x1));
  const xs = [Math.min(x0, x1), ...cuts, Math.max(x0, x1)], out = [];
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], c = xs[i + 1], mid = (a + c) / 2, pid = parentFn(mid + 0.01), sfx = xs.length > 2 ? `-${pid.split('-')[1]}` : '';
    out.push(piece({ id: id + sfx, name: bi(ko, en), template: 'deckhouse', parent: pid, offset: [r2(mid), 0, r2(zBase(mid))],
      params: { l: r2(c - a), b, h, r: 1.2, windows: 1, windowSpacing: 2.6 }, ...EST, ...extra }));
  }
  return out;
}
const aHouses = house('a-deck', 'A 갑판 (산책 갑판)', 'A deck (promenade)', fp(58), fp(210), 25.0, A_TOP, deck);
for (const h of aHouses) h.on = h.parent;
const boatZ = x => deck(x) + A_TOP;
house('officers', '항해 선교와 사관실', "Bridge and officers' quarters", fp(58), fp(80), 13, BOAT_H, boatZ);
house('first-house', '1등석 계단실', 'First-class staircase house', fp(92), fp(138), 12, BOAT_H, boatZ);
house('aft-house', '뒤쪽 갑판실', 'After deckhouse', fp(150), fp(204), 12, BOAT_H, boatZ);
piece({ id: 'bridge-wings', name: bi('선교 날개', 'Bridge wings'), template: 'box', parent: 'hull-bow', offset: [fp(58.5), 0, r2(boatZ(fp(58.5)) + BOAT_H - 0.6)],
  params: { l: 2.4, b: 27.6, h: 0.6, color: '#f4f1ea' }, ...EST });
// the starboard wall of the officers' quarters (reported collapsing in 2019, s33)
piece({ id: 'officers-wall', name: bi('사관실 우현 벽', "Officers' quarters, starboard wall"), template: 'box', parent: 'hull-bow',
  offset: [fp(69), -6.6, r2(boatZ(fp(69)))], params: { l: 18, b: 0.4, h: BOAT_H, color: '#f4f1ea' }, ...EST });

// funnels: positions over the boiler-room pairs (estimated ±15 ft), elliptic 24 ft 6 in × 19 ft, about 81.5 ft above
// the boat deck, raked 2 in per foot (s45, s49 — weak sources), buff with black tops (s13); No. 4 a dummy (s21, s24)
const FUN_TOP = 53.3;                                             // keel to funnel top, 175 ft (s13, s21)
[[1, 76], [2, 110], [3, 142], [4, 177]].forEach(([n, d]) => {
  const x = fp(d), z = r2(boatZ(x) + BOAT_H);
  piece({ id: `funnel-${n}`, name: bi(`${n}번 굴뚝${n === 4 ? ' (환기용)' : ''}`, `Funnel ${n}${n === 4 ? ' (ventilation dummy)' : ''}`), template: 'funnel', parent: half(x),
    offset: [x, 0, z], params: { a: 3.73, b: 2.9, h: r2(FUN_TOP - z), rake: 9.46, top: 4.6, color: '#d39b3a', topColor: '#141517' }, ...EST,
    passesThrough: pieces.filter(p => p.template === 'deckhouse' && p.parent === half(x)).map(p => p.id) });
});
// masts (positions estimated from the profile; height disputed 155 vs 205 ft, the 205 ft keel-to-top figure used)
for (const [id, ko, en, d] of [['foremast', '앞 돛대', 'Foremast', 44], ['mainmast', '뒷 돛대', 'Mainmast', 232]]) {
  const x = fp(d);
  piece({ id, name: bi(ko, en), template: 'mast', parent: half(x), offset: [x, 0, r2(deck(x))], params: { h: r2(62.5 - deck(x)), d: 1.0, rake: 9.5 }, ...EST });
}
// davits: 8 a side in two groups of 4 (s16, s21); boats are not drawn
[62, 68, 74, 80, 160, 167, 174, 181].forEach((d, i) => {
  const x = fp(d), y = 12.2;                               // at the edge of the boat deck
  for (const side of ['port', 'stbd']) piece({ id: `davit-${side}-${i + 1}`, name: bi('대빗(보트 걸이)', 'Davit'), template: 'davit', parent: half(x),
    offset: [x, side === 'port' ? y : -y, r2(boatZ(x) + BOAT_H)], params: { h: 3.2, reach: 1.6, side }, ...S('s16', 's21') });
});
// the port bow railing section that fell between 2022 and 2024 (s37, s38)
{ const x = fp(16); piece({ id: 'rail-bow-port', name: bi('선수 좌현 난간', 'Port bow railing'), template: 'railing', parent: 'hull-bow', on: 'hull-bow',
  offset: [x, r2(hb(x, deck(x)) - 0.25), r2(deck(x))], params: { l: 4.6, h: 1.1, color: '#d9d4c6' }, ...S('s37') }); }
{ const x = fp(16); piece({ id: 'rail-bow-stbd', name: bi('선수 우현 난간', 'Starboard bow railing'), template: 'railing', parent: 'hull-bow', on: 'hull-bow',
  offset: [x, -r2(hb(x, deck(x)) - 0.25), r2(deck(x))], params: { l: 4.6, h: 1.1, color: '#d9d4c6' }, ...EST }); }

// watertight subdivision: 15 bulkheads A–P (no I) from FP (s2; cumulative positions estimated), A–B and K–P to
// D deck, C–J to E deck (s1, s2)
const BH = [['A', 14.0, D], ['B', 27.7, D], ['C', 43.3, E], ['D', 58.8, E], ['E', 75.3, E], ['F', 92.7, E], ['G', 110.0, E], ['H', 127.4, E],
  ['J', 145.7, E], ['K', 156.7, D], ['L', 177.7, D], ['M', 195.1, D], ['N', 214.3, D], ['O', 230.7, D], ['P', 248.1, D]].map(([n, d, deckFn]) => {
  const x = fp(d), top = deckFn(x);
  piece({ id: `bulkhead-${n}`, name: bi(`${n} 격벽`, `Bulkhead ${n}`), template: 'bulkhead', parent: half(x), params: { x, top, floor: TANK }, ...S('s1', 's2') });
  return { n, x, top };
});
const COMPS = [
  ['forepeak', '선수 피크', 'Forepeak', XFP - 1.5, BH[0]], ['hold-1', '1번 화물창', 'No. 1 hold', BH[0], BH[1]], ['hold-2', '2번 화물창', 'No. 2 hold', BH[1], BH[2]],
  ['hold-3', '3번 화물창', 'No. 3 hold', BH[2], BH[3]], ['br-6', '6번 보일러실', 'Boiler room 6', BH[3], BH[4]], ['br-5', '5번 보일러실', 'Boiler room 5', BH[4], BH[5]],
  ['br-4', '4번 보일러실', 'Boiler room 4', BH[5], BH[6]], ['br-3', '3번 보일러실', 'Boiler room 3', BH[6], BH[7]], ['br-2', '2번 보일러실', 'Boiler room 2', BH[7], BH[8]],
  ['br-1', '1번 보일러실', 'Boiler room 1', BH[8], BH[9]], ['engine', '왕복기관실', 'Reciprocating engine room', BH[9], BH[10]],
  ['turbine', '터빈실', 'Turbine room', BH[10], BH[11]], ['electric', '발전기실', 'Electric engine room', BH[11], BH[12]],
  ['tunnel-1', '축로 (앞)', 'Shaft tunnel (forward)', BH[12], BH[13]], ['tunnel-2', '축로 (뒤)', 'Shaft tunnel (aft)', BH[13], BH[14]],
  ['afterpeak', '선미 피크', 'After peak', BH[14], -XFP + 16],
].map(([id, ko, en, f, a]) => {
  const x1 = typeof f === 'number' ? f : f.x, x0 = typeof a === 'number' ? a : a.x;
  const tops = [f, a].filter(v => typeof v !== 'number').map(v => v.top), top = r2(Math.min(...tops)), xc = (x0 + x1) / 2;
  const w = r2(2 * Math.min(hb(x0, 6), hb(x1, 6)) * 0.9);
  piece({ id, name: bi(ko, en), template: 'compartment', parent: half(xc), params: { x0: r2(x0), x1: r2(x1), floor: TANK, top, b: w }, ...S('s2') });
  return { id, top, xc };
});
const topOf = id => COMPS.find(c => c.id === id).top;

// the iceberg: size not recorded (estimated from accounts of 50–100 ft above water)
const BERG = { l: 110, b: 70, above: 20, below: 95, seed: 4 };

// ---- the ship's track: course, the swing, the stop (headings and positions after the collision estimated) ---------
const T0 = Date.UTC(1912, 3, 14, 23, 39), iso = ms => new Date(ms).toISOString().slice(0, 19);
const at = (h, m, s = 0) => iso(Date.UTC(1912, 3, h < 12 ? 15 : 14, h, m, s));
const headingAt = sec => {                                         // seconds after 23:39:00
  const K = [[0, 184], [37, 186], [60, 204], [180, 196], [420, 140], [660, 100]];
  if (sec >= K.at(-1)[0]) return K.at(-1)[1];
  const i = K.findIndex(k => k[0] > sec); const [a, ha] = K[i - 1], [b, hb2] = K[i]; return ha + (hb2 - ha) * (sec - a) / (b - a);
};
const speedAt = sec => sec <= 90 ? 11.3 : Math.max(0, 11.3 * (1 - (sec - 90) / 570));   // 22 kn until 23:40:30, coasting to a stop by 23:50
const pos = [[0, 0]];
for (let s = 1; s <= 660; s++) { const h = headingAt(s) * Math.PI / 180, v = speedAt(s); const [x, y] = pos.at(-1); pos.push([x + v * Math.cos(h), y + v * Math.sin(h)]); }
// put the collision (23:40:00, second 60) at the world origin
const [cx, cy] = pos[60]; for (const p of pos) { p[0] -= cx; p[1] -= cy; }
const P = s => [r1(pos[Math.min(660, s)][0]), r1(pos[Math.min(660, s)][1])];
const STOP = P(660);

const shipKeys = [];
const key = (atIso, v, c) => shipKeys.push({ at: atIso, v, ...c });
for (const s of [0, 20, 37, 50, 60, 75, 90, 120, 180, 300, 420, 540, 660])
  key(iso(T0 + s * 1000), { pos: [...P(s), -DRAFT_NIGHT], trim: s >= 360 ? r2(1.5 * (s - 360) / 300) : 0, list: s >= 360 ? r2(5 * Math.min(1, (s - 360) / 300)) : 0, heading: r1(headingAt(s)) },
    s <= 60 ? S('s15', 's22') : EST);
const sink = [
  ['1912-04-15T00:10', -10.2, 2, 3, EST],
  ['1912-04-15T00:40', -10.6, 4, 0, EST],
  ['1912-04-15T01:30', -11.6, 5, -5, EST],
  ['1912-04-15T01:50', -12.0, 6, -10, S('s15')],
  ['1912-04-15T02:05', -12.6, 7, -10, S('s15')],
  ['1912-04-15T02:15', -14.0, 10, -10, { confidence: 'disputed', alternatives: bi('Halpern의 관찰 분석은 약 10°, Hackett·Bedford의 모델은 약 17°예요.', "Halpern's reading of the observations gives about 10°; the Hackett & Bedford model about 17°.") }],
  ['1912-04-15T02:17', -15.0, 13, -10, { confidence: 'disputed', alternatives: bi('부러질 때의 각도는 학설이 갈려요: 11~15°(2005~2006년 이후의 낮은 각도 해석), 약 17°(Hackett·Bedford, Woytowich·Mengot), 30~45°(목격자, 1997년 영화).', 'The angle at the break is disputed: 11–15° (the low-angle reading after 2005–2006), about 17° (Hackett & Bedford, Woytowich & Mengot), 30–45° (eyewitnesses, the 1997 film).') }],
];
for (const [a, z, trim, list, c] of sink) key(a, { pos: [...STOP, z], trim, list, heading: 100 }, c);
tracks.push({ piece: 'ship', prop: 'pose', interp: 'linear', keys: shipKeys });
const SHIP_END = shipKeys.at(-1).v;                               // the ship's pose when it breaks

// the iceberg sits off the starboard bow at the moment of contact
{
  const h = 204 * Math.PI / 180, fx = Math.cos(h), fy = Math.sin(h), sx = Math.sin(h), sy = -Math.cos(h);   // forward and starboard unit vectors
  const along = 108, out = 14 + BERG.b * 0.45;
  piece({ id: 'iceberg', name: bi('빙산', 'Iceberg'), template: 'iceberg', offset: [r1(along * fx + out * sx), r1(along * fy + out * sy), 0], params: BERG, ...EST,
    notes: 'Size and exact position not recorded; placed against the starboard bow at 23:40.' });
}

// ---- water in the compartments: heights above the keel at each compartment's centre ----------------------------
// testimony points sourced (s5, s6, s8, s15, s19); between them interpolated (estimated); capped at the
// compartment's top (its lower bulkhead), where an overflow event carries the water on
const W = (id, keys) => tracks.push({ piece: id, prop: 'water', keys: keys.map(([a, v, c]) => ({ at: a, v: r2(Math.min(v, topOf(id))), ...c })) });
const xc = id => COMPS.find(c => c.id === id).xc;
W('forepeak', [['1912-04-14T23:40', TANK, S('s5')], ['1912-04-14T23:50', 4.3, S('s6', 's8')], ['1912-04-15T00:10', 10, EST], ['1912-04-15T00:40', 99, S('s6')]]);
W('hold-1', [['1912-04-14T23:40', TANK, S('s5')], ['1912-04-14T23:47', 3.6, S('s5', 's15')], ['1912-04-14T23:50', 4.3, S('s6', 's8')], ['1912-04-14T23:55', G(xc('hold-1')), S('s15')],
  ['1912-04-15T00:25', E(xc('hold-1')) + 0.9, S('s6', 's15')], ['1912-04-15T01:00', 99, EST]]);
W('hold-2', [['1912-04-14T23:40', TANK, S('s5')], ['1912-04-14T23:45', 2.5, S('s5', 's15')], ['1912-04-14T23:50', 4.3, S('s6', 's8')], ['1912-04-15T00:25', 99, S('s6', 's15')]]);
W('hold-3', [['1912-04-14T23:40', TANK, S('s5')], ['1912-04-14T23:50', 4.3, S('s6', 's8')], ['1912-04-14T23:52', G(xc('hold-3')) - 0.6, S('s15')],
  ['1912-04-15T00:02', F(xc('hold-3')) - 0.6, S('s15')], ['1912-04-15T00:10', E(xc('hold-3')) - 1.2, S('s15')], ['1912-04-15T00:20', 99, EST]]);
W('br-6', [['1912-04-14T23:40', TANK, S('s5')], ['1912-04-14T23:50', 4.7, S('s5', 's15')], ['1912-04-15T00:20', 10.5, EST], ['1912-04-15T00:40', 99, S('s6', 's8')]]);
W('br-5', [['1912-04-14T23:40', TANK, S('s5')], ['1912-04-15T00:40', 2.2, S('s6', 's15')], ['1912-04-15T01:10', 4.0, { confidence: 'disputed', alternatives: bi('벙커 문이 터진 시각은 00:40(영국 청문회)과 01:10 무렵(Barrett의 짐작)으로 갈려요.', 'The bunker door gave way at 00:40 (British inquiry) or about 01:10 (Barrett’s guess).') }],
  ['1912-04-15T01:45', 99, S('s15')]]);
W('br-4', [['1912-04-15T01:20', TANK + 0.1, S('s6', 's8', 's15')], ['1912-04-15T01:45', 2.5, EST], ['1912-04-15T02:00', (TANK + topOf('br-4')) / 2, S('s19')], ['1912-04-15T02:15', 99, EST]]);
W('br-3', [['1912-04-15T02:05', TANK, EST], ['1912-04-15T02:15', 6.0, EST]]);
W('br-2', [['1912-04-15T02:10', TANK, EST], ['1912-04-15T02:15', 3.0, EST]]);
W('engine', [['1912-04-15T01:35', TANK + 0.1, S('s22')], ['1912-04-15T02:15', 3.0, EST]]);

// lights stay on until the power fails as the hull splits (s13: 02:18; s15: 02:17)
tracks.push({ piece: 'ship', prop: 'lights', keys: [{ at: '1912-04-14T23:39', v: 1, ...S('s13') }, { at: '1912-04-15T02:16:30', v: 1, ...S('s13', 's15') }, { at: '1912-04-15T02:17', v: 0, ...S('s13', 's15') }] });

// ---- after the break --------------------------------------------------------------------------------------------
// the stern sinks nearly where the ship went down; the bow planes about 600 m north (fall:travel ≈ 6:1, s17) and
// lands facing roughly north, the stern facing roughly south (s23; headings weakly sourced)
const SINK = [STOP[0], STOP[1]];
const S_END = [r1(SINK[0] + 20), r1(SINK[1])], B_END = [r1(S_END[0] - 28.5), r1(S_END[1] + 616.4)];
const lerp2 = (a, b, f) => [r1(a[0] + (b[0] - a[0]) * f), r1(a[1] + (b[1] - a[1]) * f)];
const pose = (p, z, trim, list, heading) => ({ pos: [p[0], p[1], z], trim, list, heading });
const start = { ...SHIP_END };
tracks.push({ piece: 'hull-bow', prop: 'pose', interp: 'smooth', keys: [
  { at: '1912-04-15T02:18', v: start, ...EST },
  { at: '1912-04-15T02:19', v: pose(lerp2(SINK, B_END, 0.03), -45, 30, -5, 100), ...EST },
  { at: '1912-04-15T02:20', v: pose(lerp2(SINK, B_END, 0.1), -220, 45, 0, 98), ...S('s23') },
  { at: '1912-04-15T02:21', v: pose(lerp2(SINK, B_END, 0.3), -900, 30, 0, 95), ...S('s17') },
  { at: '1912-04-15T02:22:30', v: pose(lerp2(SINK, B_END, 0.55), -1900, 40, 0, 92), ...S('s17') },
  { at: '1912-04-15T02:24', v: pose(lerp2(SINK, B_END, 0.82), -3000, 20, 0, 88), ...S('s17') },
  { at: '1912-04-15T02:25:30', v: pose(B_END, -3801, 7.2, 0, 85), ...S('s17', 's22', 's23') },
] });
tracks.push({ piece: 'hull-stern', prop: 'pose', interp: 'smooth', keys: [
  { at: '1912-04-15T02:18', v: start, ...EST },
  { at: '1912-04-15T02:18:40', v: pose(SINK, -12, 3, -15, 100), ...S('s7', 's20') },
  { at: '1912-04-15T02:19:30', v: pose(SINK, -86, 70, -20, 110), ...S('s7', 's25') },
  { at: '1912-04-15T02:20', v: pose(SINK, -131, 75, -20, 130), ...S('s7', 's13') },
  { at: '1912-04-15T02:21', v: pose(lerp2(SINK, S_END, 0.2), -700, 60, -10, 280), ...S('s19', 's29') },
  { at: '1912-04-15T02:23', v: pose(lerp2(SINK, S_END, 0.5), -1900, 30, 0, 430), ...S('s19', 's29') },
  { at: '1912-04-15T02:25', v: pose(lerp2(SINK, S_END, 0.8), -3000, 10, 0, 560), ...S('s19', 's29') },
  { at: '1912-04-15T02:27:30', v: pose(S_END, -3803, -4, 0, 625), ...S('s18', 's19', 's23') },
] });

// debris: the five single-ended boilers of boiler room 1, bottom pieces, the "Big Piece" (s19, s23, s27–s29)
const sh = SHIP_END, ch = Math.cos(sh.heading * Math.PI / 180), shh = Math.sin(sh.heading * Math.PI / 180);
const fromShip = (x, y) => [r1(sh.pos[0] + x * ch - y * shh), r1(sh.pos[1] + x * shh + y * ch)];
const debris = [
  ['boiler-1', '보일러', 'Boiler', 'boiler', { d: 4.8, l: 3.6 }, [-14, 4], [70, -40], S('s23', 's29')],
  ['boiler-2', '보일러', 'Boiler', 'boiler', { d: 4.8, l: 3.6 }, [-16, -3], [95, -10], S('s23', 's29')],
  ['boiler-3', '보일러', 'Boiler', 'boiler', { d: 4.8, l: 3.6 }, [-18, 2], [110, 25], S('s23', 's29')],
  ['boiler-4', '보일러', 'Boiler', 'boiler', { d: 4.8, l: 3.6 }, [-20, -5], [80, 45], S('s23', 's29')],
  ['boiler-5', '보일러', 'Boiler', 'boiler', { d: 4.8, l: 3.6 }, [-22, 6], [130, 5], S('s23', 's29')],
  ['bottom-1', '선체 바닥 조각', 'Double-bottom section', 'debris', { l: 15, b: 9, h: 2.2, seed: 21, color: '#7a2a20' }, [-15, 0], [330, 260], S('s27', 's28')],
  ['bottom-2', '선체 바닥 조각', 'Double-bottom section', 'debris', { l: 12, b: 8, h: 2.0, seed: 22, color: '#7a2a20' }, [-22, 0], [360, 230], S('s27', 's28')],
  ['big-piece', '선체 옆판 조각 ("빅 피스")', 'Side plating ("Big Piece")', 'debris', { l: 7.6, b: 4.6, h: 1.0, seed: 23, color: '#202124' }, [-12, -12], [150, 90], S('s19', 's23')],
  ['debris-1', '갑판실 잔해', 'Deckhouse wreckage', 'debris', { l: 18, b: 10, h: 4, seed: 31, color: '#bdb6a6' }, [-16, 0], [60, 120], EST],
  ['debris-2', '잔해', 'Wreckage', 'debris', { l: 10, b: 7, h: 3, seed: 32 }, [-24, 3], [200, -80], EST],
  ['debris-3', '잔해', 'Wreckage', 'debris', { l: 8, b: 6, h: 2.5, seed: 33 }, [-10, -4], [-40, 60], EST],
];
for (const [id, ko, en, template, params, local, land, c] of debris) {
  const p0 = fromShip(local[0], local[1]), p1 = [r1(S_END[0] + land[0]), r1(S_END[1] + land[1])];
  piece({ id, name: bi(ko, en), template, appear: '1912-04-15T02:18', params, embed: 2, ...c });   // debris lies half sunk in the sediment
  tracks.push({ piece: id, prop: 'pose', interp: 'smooth', keys: [
    { at: '1912-04-15T02:18', v: pose(p0, r1(sh.pos[2] + 12), 0, 0, sh.heading), ...EST },
    { at: '1912-04-15T02:21', v: pose(lerp2(p0, p1, 0.3), -800, 20, 30, sh.heading + 60), ...EST },
    { at: '1912-04-15T02:28:30', v: pose(p1, -3800.4, 3, 8, sh.heading + 140), ...c },
  ] });
}

// rust: none at the sinking, heavy by the discovery, still growing (s23: rusticles; ~650 t on the bow)
tracks.push({ piece: '*', prop: 'rust', keys: [
  { at: '1912-04-15T02:30', v: 0, ...EST }, { at: 1985.67, v: 0.55, ...S('s23', 's30') }, { at: 2010, v: 0.72, ...S('s23', 's34') }, { at: 2026, v: 0.82, ...EST },
  { at: 2100, v: 1, ...PROJ } ] });

// ---- events (cards) ---------------------------------------------------------------------------------------------
const ev = e => events.push(e);
ev({ id: 'sighted', kind: 'note', at: '1912-04-14T23:39', title: bi('빙산 발견', 'Iceberg sighted'), text: bi('망루에서 정면의 빙산을 봐요. 부딪히기까지 약 37초.', 'The lookout sees an iceberg dead ahead. About 37 seconds to impact.'),
  detail: bi('배는 약 22노트(시속 약 41km)로 달리고 있었고, 왼쪽으로 돌기 시작해요.', 'The ship is making about 22 knots (41 km/h) and begins to turn to port.'), ...S('s15', 's22') });
ev({ id: 'collision', kind: 'collision', at: '1912-04-14T23:40', piece: 'hull', title: bi('충돌', 'Collision'), text: bi('빙산이 우현 앞쪽 바닥을 긁고 지나가요. 큰 피해는 10초도 안 걸렸어요.', 'The iceberg scrapes along the starboard bow below the waterline. The main damage takes under ten seconds.'),
  detail: bi('길게 찢긴 하나가 아니라 짧은 틈 여러 개예요. 다 합쳐 약 1.1㎡, 용골에서 약 3m 높이로, 앞쪽 6개 칸에 걸쳐 있었어요. (미국 청문회는 충돌 시각을 23:46으로 적었어요.)',
    'Not one long gash but several short openings: about 1.1 m² in all, about 3 m above the keel, across the first six compartments. (The US inquiry put the time at 23:46.)'), ...S('s3', 's4', 's10', 's44') });
ev({ id: 'stopped', kind: 'note', at: '1912-04-14T23:45', title: bi('기관 정지', 'Engines stopped'), text: bi('배가 멈춰 서고, 우현으로 약 5° 기울어요.', 'The ship comes to a stop, listing about 5° to starboard.'), ...S('s15', 's22') });
ev({ id: 'five', kind: 'note', at: '1912-04-15T00:00', title: bi('다섯 칸이 잠겼다', 'Five compartments open'), text: bi('4칸까지는 버틸 수 있게 설계됐어요. 뚫린 건 5~6칸이었어요.', 'She was built to float with four compartments flooded. Five, even six, were open.'),
  detail: bi('어느 두 칸이 차거나 앞의 네 칸이 차도 떠 있을 수 있었어요. 앞의 네 칸과 6번 보일러실이 차면, 물이 칸막이를 차례로 넘어가 배는 가라앉아요. 설계자 앤드루스는 남은 시간을 두 시간쯤으로 봤어요.',
    'She could float with any two compartments flooded, or the first four. With the first four and boiler room 6 flooded, water spills over the bulkheads one after another and she sinks. Her designer, Andrews, gave her about two hours.'), ...S('s8', 's12', 's22') });
ev({ id: 'spill-hold3', kind: 'overflow', at: '1912-04-15T00:20', from: 'hold-3', to: 'br-6', title: bi('물이 E 갑판을 따라 뒤로', 'Water runs aft along E deck'), text: bi('3번 화물창이 차올라, 물이 E 갑판 위로 뒤쪽을 향해 퍼져요.', 'No. 3 hold fills and water spreads aft along E deck.'), ...EST });
ev({ id: 'spill-br6', kind: 'overflow', at: '1912-04-15T00:40', from: 'br-6', to: 'br-5', title: bi('칸막이를 넘다', 'Over the bulkhead'), text: bi('6번 보일러실이 E 갑판까지 차서, 물이 칸막이 꼭대기를 넘어 다음 칸으로 흘러요. 여기서 배의 운명이 정해져요.', 'Boiler room 6 fills to E deck and water spills over the top of the bulkhead into the next room. This is when her fate is sealed.'),
  detail: bi('격벽은 E 갑판까지만 물을 막았고, 그 위 E 갑판의 통로는 물을 막도록 만들어지지 않았어요.', 'The bulkheads were watertight only to E deck, and the openings above them on E deck were not designed to close.'), ...S('s6', 's8', 's12') });
ev({ id: 'spill-br5', kind: 'overflow', at: '1912-04-15T01:45', from: 'br-5', to: 'br-4', title: bi('5번 → 4번 보일러실', 'Boiler room 5 into 4'), text: bi('5번 보일러실이 가득 차고, 물이 4번 보일러실로 넘어가요. 가라앉는 속도가 빨라져요.', 'Boiler room 5 is full and water spills into boiler room 4. The sinking speeds up.'), confidence: 'disputed',
  alternatives: bi('01:45는 Hackett·Bedford 모델의 시각이에요. 4번 보일러실 바닥에 물이 보였다는 증언은 01:20 무렵인데, 바닥 아래로 스며든 물일 수 있어요.', '01:45 comes from the Hackett & Bedford model. Water was seen in boiler room 4 at about 01:20, perhaps rising from below the plates.') });
ev({ id: 'port-list', kind: 'note', at: '1912-04-15T01:50', title: bi('왼쪽으로 기울어요', 'Listing to port'), text: bi('E 갑판 통로로 물이 번지며 배가 왼쪽으로 약 10° 기울어요.', 'Water spreading along the E-deck passage lists her about 10° to port.'), ...S('s15') });
ev({ id: 'spill-br4', kind: 'overflow', at: '1912-04-15T02:05', from: 'br-4', to: 'br-3', title: bi('뒤쪽 칸으로 번지다', 'Spreading aft'), text: bi('4번 보일러실도 넘쳐, 물이 뒤쪽 칸으로 번져요.', 'Boiler room 4 overflows too, and the water spreads aft.'), ...EST });
ev({ id: 'forecastle', kind: 'note', at: '1912-04-15T02:06', title: bi('앞 갑판이 잠겨요', 'The forecastle goes under'), text: bi('뱃머리 갑판이 물에 잠기고, 기울기가 빨리 커져요.', 'The forecastle deck goes under and the angle grows quickly.'), ...S('s15') });
ev({ id: 'funnel-1-falls', kind: 'collapse', at: '1912-04-15T02:15', until: '1912-04-15T02:15:20', piece: 'funnel-1', mode: 'vanish', title: bi('1번 굴뚝이 무너져요', 'Funnel 1 falls'), text: bi('물이 선교를 넘는 무렵, 1번 굴뚝이 바다로 쓰러져요.', 'As the water reaches the bridge, the first funnel falls into the sea.'), ...S('s22') });
ev({ id: 'lights-out', kind: 'lightsOut', at: '1912-04-15T02:17', title: bi('불이 꺼져요', 'The lights go out'), text: bi('마지막까지 켜져 있던 불이 한꺼번에 꺼져요.', 'The lights, burning to the last, go out all at once.'), detail: bi('기록은 02:17~02:18로 1분쯤 차이가 나요.', 'Accounts differ by about a minute: 02:17–02:18.'), ...S('s13', 's15') });
ev({ id: 'hull-vanish', kind: 'collapse', at: '1912-04-15T02:18', until: '1912-04-15T02:18', piece: 'hull', mode: 'vanish', card: false, title: bi('선체 교체', 'Hull swap'), text: bi('', ''), ...S('s23') });
ev({ id: 'break', kind: 'break', at: '1912-04-15T02:18', title: bi('두 동강', 'The break'), text: bi('선미가 들리다가, 3번 굴뚝 부근에서 배가 부러져요.', 'With the stern lifting, the hull breaks near the third funnel.'), confidence: 'disputed',
  detail: bi('선수부 약 140m, 선미부 약 107m, 그 사이 약 22m는 부서져 흩어졌어요. 바닥(이중저)이 먼저 꺾였다는 해석과 위 갑판부터 갈라졌다는 해석이 있어요.', 'The bow section is about 140 m, the stern about 107 m; some 22 m between broke apart. One reading has the bottom failing first, another the upper decks.'),
  alternatives: bi('부러질 때 각도: 이 모델은 약 13°(2005~2006년 이후의 낮은 각도 해석 11~15°). 약 17°(Hackett·Bedford, Woytowich·Mengot), 30~45°(목격자들, 1997년 영화)라는 견해도 있어요. 1912년 두 청문회는 배가 부러지지 않고 가라앉았다고 결론지었어요. 위치도 2·3번 굴뚝 사이라는 설과 3·4번 사이라는 설이 있어요.',
    'Angle at the break: about 13° here (the low-angle reading, 11–15°, after 2005–2006). Others hold about 17° (Hackett & Bedford, Woytowich & Mengot) or 30–45° (eyewitnesses, the 1997 film). Both 1912 inquiries concluded she sank intact. The break is placed between funnels 2 and 3 by some, 3 and 4 by others.') });
ev({ id: 'mid-gone', kind: 'collapse', card: false, at: '1912-04-15T02:18', until: '1912-04-15T02:19', piece: 'hull-mid', mode: 'vanish', title: bi('가운데가 부서져요', 'The middle breaks up'), text: bi('부러진 가운데 부분은 보일러와 조각들로 흩어져요.', 'The broken middle scatters as boilers and wreckage.'), ...S('s23', 's29') });
ev({ id: 'funnel-2-gone', kind: 'collapse', card: false, at: '1912-04-15T02:18', until: '1912-04-15T02:18:30', piece: 'funnel-2', mode: 'vanish', title: bi('2번 굴뚝', 'Funnel 2'), text: bi('2번 굴뚝도 떨어져 나가요.', 'Funnel 2 comes away too.'), ...EST });
ev({ id: 'funnel-3-gone', kind: 'collapse', card: false, at: '1912-04-15T02:18', until: '1912-04-15T02:18:20', piece: 'funnel-3', mode: 'vanish', title: bi('3번 굴뚝', 'Funnel 3'), text: bi('부러진 자리의 3번 굴뚝이 무너져요.', 'Funnel 3, at the break, collapses.'), ...S('s23') });
ev({ id: 'stern-up', kind: 'note', at: '1912-04-15T02:19:30', title: bi('선미가 수직으로', 'The stern stands up'), text: bi('혼자 남은 선미가 다시 들려, 거의 수직으로 서요.', 'The stern, alone now, rises again until it stands almost upright.'), detail: bi('목격자들은 65~70°, 또는 "수직"이라고 했어요.', 'Witnesses said 65–70°, or "perpendicular".'), ...S('s7', 's25') });
ev({ id: 'funnel-4-gone', kind: 'collapse', card: false, at: '1912-04-15T02:19:50', until: '1912-04-15T02:20', piece: 'funnel-4', mode: 'vanish', title: bi('4번 굴뚝', 'Funnel 4'), text: bi('4번 굴뚝이 떨어져 나가요.', 'Funnel 4 breaks away.'), ...EST });
ev({ id: 'implosion', kind: 'collapse', at: '1912-04-15T02:19:50', until: '1912-04-15T02:20:20', piece: 'hull-stern', mode: 'crush', title: bi('선미가 찌그러져요', 'The stern is crushed'), text: bi('물에 잠기며 선미 안에 갇힌 공기가 터져, 갑판들이 눌려 내려앉아요.', 'As it goes under, air trapped in the stern bursts out and the decks are crushed down.'), detail: bi('선미의 갑판들은 모두 합쳐 3.7~4.6m 높이로 눌렸어요.', 'The stern’s decks were pressed down to 3.7–4.6 m in all.'), ...S('s18', 's19') });
ev({ id: 'aft-house-crush', kind: 'collapse', card: false, at: '1912-04-15T02:19:50', until: '1912-04-15T02:20:20', piece: 'aft-house-stern', mode: 'crush', title: bi('선미 갑판실', 'Stern deckhouse'), text: bi('선미 갑판실도 눌려요.', 'The stern deckhouse is crushed too.'), ...S('s18') });
ev({ id: 'a-stern-crush', kind: 'collapse', card: false, at: '1912-04-15T02:19:50', until: '1912-04-15T02:20:20', piece: 'a-deck-stern', mode: 'crush', title: bi('선미 A 갑판', 'Stern A deck'), text: bi('A 갑판도 D 갑판 위로 거의 내려앉아요.', 'A deck sinks almost onto D deck.'), ...S('s18') });
ev({ id: 'gone', kind: 'note', at: '1912-04-15T02:20', title: bi('사라짐', 'Gone'), text: bi('02:20, 선미가 수면 아래로 사라져요.', 'At 02:20 the stern slips under.'), ...S('s7', 's13') });
ev({ id: 'bow-lands', kind: 'note', at: '1912-04-15T02:25:30', title: bi('선수가 해저에 박혀요', 'The bow strikes the seabed'), text: bi('미끄러지듯 내려온 선수가 3,800m 바닥에 박혀요.', 'Gliding down, the bow ploughs into the seabed 3,800 m below.'),
  detail: bi('약 5~6분 만에, 초속 약 11~13m로 부딪혀 앞쪽이 약 18m 진흙에 묻혀요.', 'After 5–6 minutes it hits at about 11–13 m/s and buries its forward end about 18 m in the mud.'), ...S('s17', 's22', 's23') });
ev({ id: 'foremast-falls', kind: 'collapse', at: '1912-04-15T02:25:30', until: '1912-04-15T02:25:40', piece: 'foremast', mode: 'topple', title: bi('앞 돛대가 쓰러져요', 'The foremast falls'), text: bi('앞 돛대가 선교 쪽으로 쓰러져요. 1985년 발견 때 이미 그렇게 누워 있었어요.', 'The foremast falls back toward the bridge. It already lay so when the wreck was found in 1985.'), ...S('s17', 's23') });
ev({ id: 'stern-lands', kind: 'note', at: '1912-04-15T02:27:30', title: bi('선미, 반대쪽을 보며', 'The stern, facing the other way'), text: bi('선미는 빙글빙글 돌며 거의 수직으로 내려와, 선수와 반대쪽을 향해 내려앉아요.', 'The stern spins down almost vertically and settles facing the other way from the bow.'),
  detail: bi('두 조각은 약 600m 떨어져 있어요. 선미는 키 쪽이 약 15m 묻혔어요. 방향은 기록이 약해요.', 'The two pieces lie about 600 m apart; the stern is buried about 15 m at the rudder. The headings are weakly recorded.'), ...S('s18', 's19', 's23', 's29') });
ev({ id: 'found', kind: 'discovery', at: 1985.67, title: bi('발견', 'Found'), text: bi('1985년 9월 1일, 로버트 밸러드와 장루이 미셸의 탐사팀이 보일러 하나를 찍으며 난파선을 찾아요.', 'On 1 September 1985 the team of Robert Ballard and Jean-Louis Michel finds the wreck when a camera passes over a boiler.'), ...S('s30') });
ev({ id: 'alvin', kind: 'discovery', at: 1986.53, title: bi('첫 유인 잠수', 'First crewed dives'), text: bi('1986년 7월, 잠수정 앨빈이 처음으로 사람을 태우고 난파선에 내려가요.', 'In July 1986 the submersible Alvin takes the first people down to the wreck.'), ...S('s31') });
ev({ id: 'rusticles', kind: 'note', at: 1987.5, title: bi('녹고드름', 'Rusticles'), text: bi('선체에 고드름처럼 매달린 녹을 "녹고드름"이라 불러요. 그 속의 미생물이 철을 먹어 들어가요.', 'The icicle-like growths of rust are named "rusticles". The microbes inside them eat the iron.'), detail: bi('선수에만 약 650톤, 하루에 철 약 180kg이 사라진다는 추정이 있어요.', 'One estimate puts about 650 t on the bow alone, with about 180 kg of iron lost a day.'), ...S('s23') });
ev({ id: 'big-piece-raised', kind: 'collapse', at: 1998.5, until: 1998.6, piece: 'big-piece', mode: 'vanish', title: bi('조각 인양', 'A piece raised'), text: bi('선체 옆판 조각("빅 피스", 약 7.6×4.6m, 20톤)이 바다 위로 인양돼요.', 'A section of side plating (the "Big Piece", about 7.6 × 4.6 m, 20 t) is raised.'), ...S('s23') });
ev({ id: 'stern-sag', kind: 'note', at: 1990, title: bi('천천히 내려앉는 갑판', 'Decks slowly settle'), text: bi('1986년 이후 선미의 2등석 입구는 약 6m 내려앉았어요.', 'Since 1986 the stern’s second-class entrance has dropped about 6 m.'), ...S('s18') });
ev({ id: 'bottom-found', kind: 'discovery', at: 2005.6, title: bi('바닥 조각 발견', 'Bottom pieces found'), text: bi('2005년, 붉은 바닥 페인트가 남은 선체 바닥 조각 두 개가 발견돼요. 부러질 때의 각도를 다시 생각하게 한 발견이에요.', 'In 2005 two sections of the double bottom, red paint still on them, are found. They reopened the question of the break angle.'), ...S('s27', 's28') });
ev({ id: 'bacterium', kind: 'discovery', at: 2010.0, title: bi('철을 먹는 세균', 'The iron-eating bacterium'), text: bi('녹고드름에서 새 세균이 확인돼 "할로모나스 티타니카이"라는 이름이 붙어요.', 'A new bacterium from the rusticles is named Halomonas titanicae.'), detail: bi('녹고드름에서는 27종이 넘는 세균이 확인됐어요.', 'Rusticles hold at least 27 bacterial strains.'), ...S('s34', 's35', 's36') });
ev({ id: 'sonar-map', kind: 'discovery', at: 2010.6, title: bi('전체 지도', 'The whole site mapped'), text: bi('무인 잠수정 두 대가 음파로 난파선 일대 전체를 지도로 그려요. 선미가 돌며 떨어진 흔적도 보여요.', 'Two robot submarines map the whole site by sonar. The marks of the stern’s spinning fall show up.'), ...S('s29') });
ev({ id: 'unesco', kind: 'note', at: 2012.29, title: bi('100년', 'A hundred years'), text: bi('침몰 100년, 난파선이 유네스코 수중문화유산 협약의 보호 대상이 돼요.', 'A century after the sinking, the wreck comes under the UNESCO convention on underwater heritage.'), ...S('s42') });
ev({ id: 'officers-collapse', kind: 'collapse', at: 2019.0, until: 2019.6, piece: 'officers-wall', mode: 'crush', title: bi('사관실이 무너져요', "The officers' quarters give way"), text: bi('선장실이 있던 사관실 우현 쪽이 무너져 내리고 있다고 보고돼요.', "The starboard side of the officers' quarters, where the captain's cabin was, is reported collapsing."), ...S('s33') });
ev({ id: 'scan', kind: 'discovery', at: 2022.6, title: bi('전체 디지털 스캔', 'A full digital scan'), text: bi('2022년 여름, 70만 장이 넘는 사진으로 난파선 전체가 3D로 기록돼요(2023년 공개).', 'In summer 2022, more than 700,000 images record the whole wreck in 3D (published 2023).'), ...S('s38', 's39') });
ev({ id: 'railing-falls', kind: 'collapse', at: 2023.4, until: 2024.6, piece: 'rail-bow-port', mode: 'drop', title: bi('선수 난간이 떨어져요', 'The bow railing falls'), text: bi('2022년에 서 있던 선수 좌현 난간 약 4.6m가 2024년에는 바닥에 떨어져 있어요.', 'A 4.6 m stretch of the port bow railing, standing in 2022, lies on the seabed by 2024.'), ...S('s37', 's38') });
ev({ id: 'decks-go', kind: 'collapse', at: 2030, until: 2060, piece: 'first-house', mode: 'crush', title: bi('갑판실이 무너져요 (예측)', 'The deckhouses fall in (projection)'), text: bi('보트 갑판의 집들이 차례로 무너질 것으로 예상돼요.', 'The houses on the boat deck are expected to fall in one after another.'), ...PROJ });
ev({ id: 'a-deck-sags', kind: 'collapse', at: 2035, until: 2070, piece: 'a-deck-bow', mode: 'sag', title: bi('위 갑판이 주저앉아요 (예측)', 'The upper decks sag (projection)'), text: bi('선수의 위쪽 갑판들이 내려앉을 것으로 예상돼요.', 'The bow’s upper decks are expected to sag.'), ...PROJ });
ev({ id: 'bow-sags', kind: 'collapse', at: 2060, until: 2100, piece: 'hull-bow', mode: 'sag', title: bi('선체가 주저앉아요 (예측)', 'The hull settles (projection)'), text: bi('결국 선체가 무너져 녹 무더기가 될 것으로 예상돼요. 시점은 예측마다 크게 달라요.', 'In the end the hull is expected to collapse into a heap of rust. Forecasts differ widely on when.'),
  detail: bi('예측: 2030년 무렵(Mann), 50년 안(NOAA), 200년 안에 선체의 절반(Cullimore). 2010년에는 "한두 해"부터 "몇 백 년"까지 의견이 갈렸어요.', 'Forecasts: around 2030 (Mann), within 50 years (NOAA), half the hull within 200 years (Cullimore). In 2010 views ran from "a year or two" to "centuries".'), ...PROJ });
ev({ id: 'officers-house-go', kind: 'collapse', at: 2026.5, until: 2045, piece: 'officers', mode: 'crush', title: bi('선교의 집 (예측)', 'The bridge house (projection)'), text: bi('사관실과 선교의 남은 부분도 무너질 것으로 예상돼요.', "What is left of the bridge and officers' quarters is expected to fall in."), ...PROJ });

// ---- camera ---------------------------------------------------------------------------------------------------
const WRECK_MID = [r1((B_END[0] + S_END[0]) / 2), r1((B_END[1] + S_END[1]) / 2 + 70), -3790];
const camera = [
  { at: '1912-04-14T23:39', target: 'ship', yaw: 120, pitch: 14, dist: 560 },
  { at: '1912-04-14T23:40:10', target: 'ship', yaw: 115, pitch: 18, dist: 430 },
  { at: '1912-04-14T23:41', target: 'ship', yaw: 95, pitch: 24, dist: 440 },
  { at: '1912-04-14T23:50', target: 'ship', yaw: 45, pitch: 22, dist: 400 },
  { at: '1912-04-15T01:30', target: 'ship', yaw: 25, pitch: 18, dist: 400 },
  { at: '1912-04-15T01:50', target: 'ship', yaw: 150, pitch: 14, dist: 420 },
  { at: '1912-04-15T02:15', target: 'ship', yaw: 185, pitch: 7, dist: 470 },
  { at: '1912-04-15T02:18:30', target: 'ship', yaw: 190, pitch: 8, dist: 520 },
  { at: '1912-04-15T02:19:30', target: 'hull-stern', yaw: 200, pitch: 5, dist: 330 },
  { at: '1912-04-15T02:20:05', target: 'hull-stern', yaw: 195, pitch: 2, dist: 330 },     // stay on the stern until it is gone
  { at: '1912-04-15T02:20:40', target: 'hull-bow', yaw: 160, pitch: 10, dist: 360 },
  { at: '1912-04-15T02:25:20', target: 'hull-bow', yaw: 140, pitch: 18, dist: 330 },
  { at: '1912-04-15T02:25:50', target: 'hull-bow', yaw: 135, pitch: 20, dist: 330 },      // stay on the bow through its landing
  { at: '1912-04-15T02:26:20', target: 'hull-stern', yaw: 210, pitch: 15, dist: 340 },
  { at: '1912-04-15T02:28', target: 'hull-stern', yaw: 220, pitch: 22, dist: 300 },
  { at: '1912-04-15T02:30', target: WRECK_MID, yaw: 185, pitch: 34, dist: 720 },
  { at: 1986, target: WRECK_MID, yaw: 190, pitch: 32, dist: 700 },
  { at: 1995, target: 'hull-bow', yaw: 130, pitch: 24, dist: 380 },
  { at: 2019.3, target: 'hull-bow', yaw: 25, pitch: 30, dist: 260 },
  { at: 2024.4, target: 'hull-bow', yaw: 130, pitch: 26, dist: 230 },
  { at: 2026, target: WRECK_MID, yaw: 185, pitch: 34, dist: 720 },
  { at: 2060, target: 'hull-bow', yaw: 150, pitch: 26, dist: 400 },
  { at: 2100, target: WRECK_MID, yaw: 190, pitch: 36, dist: 720 },
];

// ---- sources: the table in the notes ---------------------------------------------------------------------------
const notes = readFileSync(resolve(HERE, 'titanic-notes.md'), 'utf8');
const sources = [];
for (const line of notes.slice(notes.indexOf('## 12. Sources')).split('\n')) {
  // a row may list more than one URL ('a ; b'): link the first
  const m = line.match(/^\|\s*(s\d+)\s*\|\s*(.*?)\s*\|\s*(https?:\/\/[^|]+?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);
  if (m) sources.push({ id: m[1], title: m[2], url: m[3].split(/\s*;\s*/)[0], publisher: m[4], year: m[5] });
}

const model = {
  subject: { name: bi('RMS 타이타닉', 'RMS Titanic'), kind: 'ship', built: 1911, dims: { loa: LOA, beam: BEAM, depth: DEPTH_B, draft: DRAFT }, ...S('s1', 's14') },
  features: { lights: true, compartments: true, break: true, projection: true, xrayChapters: ['flooding'] },
  chapters: [
    { id: 'collision', name: bi('충돌', 'Collision'), start: '1912-04-14T23:39', end: '1912-04-14T23:41', bar: [0, 6], unit: 'minute' },
    { id: 'flooding', name: bi('침수', 'Flooding'), start: '1912-04-14T23:41', end: '1912-04-15T02:15', bar: [6, 38], unit: 'minute' },
    { id: 'break', name: bi('두 동강', 'The break'), start: '1912-04-15T02:15', end: '1912-04-15T02:20', bar: [38, 47], unit: 'minute' },
    { id: 'descent', name: bi('하강', 'Descent'), start: '1912-04-15T02:20', end: '1912-04-15T02:30', bar: [47, 56], unit: 'minute' },
    { id: 'seabed', name: bi('해저', 'On the seabed'), start: '1912-04-15T02:30', end: 2026, bar: [56, 90], unit: 'year' },
    { id: 'ahead', name: bi('앞으로 (예측)', 'Ahead (projection)'), start: 2026, end: 2100, bar: [90, 100], unit: 'year' },
  ],
  stops: TITANIC_QUALITY_VIEWS,
  pieces, tracks, events, camera, cameraSubject: ['hull-bow', 'hull-stern'],
  environment: { seaDepth: 3800, sky: 'night', seabed: { size: 3200, relief: 8 } },
  wreck: { separation: { between: ['hull-bow', 'hull-stern'], metres: 600, tol: 60 }, heading: { between: ['hull-bow', 'hull-stern'], deg: 180, tol: 25 } },
  refs: { ko: { name: '롯데월드타워', height: 555 }, en: { name: 'Eiffel Tower', height: 330 } },
  sources,
  meta: {
    renderQuality: 'high',
    interpretation: bi('RMS 타이타닉(1912) — 빙산 충돌부터 해저의 난파선, 붕괴 예측까지', 'RMS Titanic (1912): from the iceberg to the wreck on the seabed and the forecasts of its collapse'),
    about: bi('1912년 4월 15일 이 배와 함께 1,490~1,517명(1912년 공식 집계, 오늘날 연구로는 약 1,496명)이 목숨을 잃었어요. 이 그림에는 사람을 그리지 않았어요. 난파선은 2012년부터 유네스코 수중문화유산 협약의 대상이고, 2019년 11월 18일 발효된 영국·미국 협정이 보호하고 있어요.',
      'Between 1,490 and 1,517 people (the 1912 official counts; about 1,496 by modern research) died with her on 15 April 1912. No people are drawn here. The wreck has fallen under the UNESCO convention on underwater heritage since 2012 and is protected by a UK–US agreement in force since 18 November 2019.'),
    limitations: [
      bi('기존 선체 상단22.3m는 상부 갑판 기준이며 C갑판 형심 약19.7m와 다른 값입니다. 기존 형상·운동 좌표를 유지하는 시각 모델입니다.','The22.3m upper-deck model reference differs from the approximately19.7m C-deck moulded-depth datum; existing geometry and motion coordinates are retained.'),
      bi('선체 곡면은 추정이에요. 공개된 선도(lines plan)가 없어 주요 치수와 일반적인 여객선 형상으로 만들었어요. 앞뒤의 낮은 갑판(웰 데크)은 채워서 그렸어요.', 'The hull form is estimated: no lines plan is public, so it is built from the main dimensions and a typical liner form. The fore and aft well decks are drawn filled in.'),
      bi('굴뚝과 돛대의 위치는 옆모습에서 비례로 잡은 추정이에요(±약 5m).', 'Funnel and mast positions are estimated from the profile (±about 5 m).'),
      bi('구획 수위는 증언 시점 사이를 이은 추정이 섞여 있어요.', 'Compartment water levels between the testimony points are interpolated.'),
      bi('부러진 각도와 위치는 학설이 갈려요. 이 모델은 낮은 각도(약 13°) 해석을 따랐어요.', 'The break angle and position are disputed; this model follows the low-angle reading (about 13°).'),
      bi('충돌 뒤 배의 방향, 하강 경로, 잔해의 위치, 빙산의 크기는 추정이에요. 해저의 두 조각의 방향은 기록이 약해요.', 'The ship’s heading after the collision, the descent paths, the debris positions and the iceberg’s size are estimated; the headings of the two pieces on the seabed are weakly recorded.'),
    ],
  },
};
writeFileSync(OUT, JSON.stringify(model, null, 1));
console.log(`wrote ${OUT}: ${pieces.length} pieces, ${tracks.length} tracks, ${events.length} events, ${sources.length} sources`);
