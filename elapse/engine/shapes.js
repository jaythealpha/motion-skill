// Geometry for each piece template, in the piece's own frame (its offset is applied by the renderer through the
// piece's matrix). Meshes carry userData.role and userData.color; the renderer picks the materials.
import { hullMesh, hullWindows, halfBreadthAt, deckHeightAt } from './geom.js';

export const LOOK = {
  topside: '#1c1d20', bottom: '#8e2b1f', boot: '#f2efe6', house: '#f4f1ea', funnel: '#d9a441', funnelTop: '#16171a',
  mast: '#b9a27a', metal: '#7d8288', ice: '#e8f2f7', debris: '#5d5650', boiler: '#45413c', bulkhead: '#c8d3dc',
  window: '#ffd27a', windowOff: '#34322d', water: '#3d8bff', rust: '#8a3b12', sand: '#6d6457',
};

import { rng } from './math.js';
export { rng };

const mesh = (THREE, geo, role, color, extra = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial()); m.userData = { role, color, ...extra }; return m; };
const tanD = d => Math.tan((d || 0) * Math.PI / 180);
// lean a geometry aft with height (funnels and masts rake back)
function rake(geo, deg) { const t = tanD(deg), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) - t * p.getZ(i)); p.needsUpdate = true; geo.computeVertexNormals(); return geo; }
// three's primitives stand along y; ours stand along z
const upright = (THREE, geo) => geo.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));

function hullPiece(THREE, q, g) {
  const { positions, indices } = hullMesh(q), geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geo.setIndex(new THREE.BufferAttribute(indices, 1));
  // paint by height: bottom below the waterline, a boot stripe at it, topside above
  // bands (a livery stripe, a damage patch) are heights at midships that follow the sheer, optionally limited
  // along the hull (from/to) and to one side
  const paint = { ...LOOK, ...(q.paint || {}) }, col = new Float32Array(positions.length), c = new THREE.Color();
  const draft = q.draft ?? q.depth * 0.6, boot = paint.bootHeight ?? 0, bands = paint.bands || [];
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2], h = z * q.depth / deckHeightAt(q, x);
    const band = bands.find(b => h >= b.z0 - 1e-4 && h <= b.z1 + 1e-4 && (b.from == null || x >= b.from - 1e-4) && (b.to == null || x <= b.to + 1e-4)
      && (!b.side || (b.side === 'port' ? y > 0 : y < 0)));
    c.set(band ? band.color : h < draft - boot - 1e-4 ? paint.bottom : h < draft + 1e-4 ? paint.boot : paint.topside);
    col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  g.add(mesh(THREE, geo, 'hull', '#ffffff', { vertexColors: true }));
  const wins = hullWindows(q);
  if (wins.length) g.userData.windows = wins.map(w => [(w.x0 + w.x1) / 2, w.y, (w.z0 + w.z1) / 2]);
}

function deckhouse(THREE, q, g) {
  const s = new THREE.Shape(), l = q.l / 2, b = q.b / 2, r = Math.min(q.r || 0, l, b);
  s.moveTo(-l + r, -b); s.lineTo(l - r, -b); s.quadraticCurveTo(l, -b, l, -b + r); s.lineTo(l, b - r); s.quadraticCurveTo(l, b, l - r, b);
  s.lineTo(-l + r, b); s.quadraticCurveTo(-l, b, -l, b - r); s.lineTo(-l, -b + r); s.quadraticCurveTo(-l, -b, -l + r, -b);
  const geo = new THREE.ExtrudeGeometry(s, { depth: q.h, bevelEnabled: false, curveSegments: 3 });
  g.add(mesh(THREE, geo, 'structure', q.color || LOOK.house));
  const rows = q.windows || 0, wins = [];
  for (let k = 0; k < rows; k++) {
    const z = q.h * (k + 0.55) / (rows + 0.2);
    for (let x = -l + 1.5; x <= l - 1.5; x += q.windowSpacing || 2.2) for (const y of [-b - 0.03, b + 0.03]) wins.push([x, y, z]);
  }
  if (wins.length) g.userData.windows = wins;
}

function funnel(THREE, q, g) {
  const body = upright(THREE, new THREE.CylinderGeometry(1, 1, q.h - q.top, 24, 1));
  body.scale(q.a, q.b, 1); body.translate(0, 0, (q.h - q.top) / 2);
  const top = upright(THREE, new THREE.CylinderGeometry(1, 1, q.top, 24, 1));
  top.scale(q.a, q.b, 1); top.translate(0, 0, q.h - q.top / 2);
  g.add(mesh(THREE, rake(body, q.rake), 'structure', q.color || LOOK.funnel));
  g.add(mesh(THREE, rake(top, q.rake), 'structure', q.topColor || LOOK.funnelTop));
}

function mast(THREE, q, g) {
  const geo = upright(THREE, new THREE.CylinderGeometry(q.d * 0.35, q.d / 2, q.h, 10, 1)); geo.translate(0, 0, q.h / 2);
  g.add(mesh(THREE, rake(geo, q.rake), 'structure', q.color || LOOK.mast));
}

function davit(THREE, q, g) {
  const h = q.h || 3, reach = q.reach || 1.5;
  const post = upright(THREE, new THREE.CylinderGeometry(0.12, 0.15, h, 6)); post.translate(0, 0, h / 2);
  const arm = new THREE.CylinderGeometry(0.1, 0.1, reach, 6); arm.translate(0, (q.side === 'port' ? 1 : -1) * reach / 2, h);
  g.add(mesh(THREE, post, 'structure', LOOK.metal)); g.add(mesh(THREE, arm, 'structure', LOOK.metal));
}

function railing(THREE, q, g) {
  const h = q.h || 1.1, top = new THREE.BoxGeometry(q.l, 0.08, 0.08); top.translate(0, 0, h);
  g.add(mesh(THREE, top, 'structure', q.color || LOOK.house));
  const n = Math.max(2, Math.round(q.l / 2.5));
  for (let i = 0; i <= n; i++) { const p = new THREE.BoxGeometry(0.06, 0.06, h); p.translate(-q.l / 2 + q.l * i / n, 0, h / 2); g.add(mesh(THREE, p, 'structure', q.color || LOOK.house, { noEdges: true })); }
}

// a bulkhead shaped like the hull's section at its x, when its parent is a hull
function bulkhead(THREE, q, g, parent, model) {
  const floor = q.floor ?? 0, s = new THREE.Shape(), N = 10;
  const hb = z => parent?.template === 'hull' ? Math.max(0.2, halfBreadthAt(parent.params, q.x, z) - 0.15) : (model.subject.dims.beam / 2);
  s.moveTo(-hb(floor), floor);
  for (let i = 0; i <= N; i++) { const z = floor + (q.top - floor) * i / N; s.lineTo(-hb(z), z); }
  for (let i = N; i >= 0; i--) { const z = floor + (q.top - floor) * i / N; s.lineTo(hb(z), z); }
  const geo = new THREE.ShapeGeometry(s);
  // the shape lies in (y, z) at x = q.x
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getX(i), z = p.getY(i); p.setXYZ(i, q.x, y, z); }
  geo.computeVertexNormals();
  g.add(mesh(THREE, geo, 'bulkhead', LOOK.bulkhead, { xrayOnly: true, doubleSide: true }));
}

function compartment(THREE, q, g, parent, model) {
  const w = q.b ?? model.subject.dims.beam * 0.9, top = q.top ?? model.subject.dims.depth, floor = q.floor ?? 0;
  const box = new THREE.BoxGeometry(q.x1 - q.x0, w, top - floor); box.translate((q.x0 + q.x1) / 2, 0, (top + floor) / 2);
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial());
  lines.userData = { role: 'compartment', xrayOnly: true };
  g.add(lines);
  // the water body: a subdivided box the renderer flattens to the water plane every frame
  const wb = new THREE.BoxGeometry(q.x1 - q.x0 - 0.3, w * 0.96, top - floor - 0.1, 10, 4, 10); wb.translate((q.x0 + q.x1) / 2, 0, (top + floor) / 2);
  g.add(mesh(THREE, wb, 'water', LOOK.water, { base: wb.attributes.position.array.slice(), floor, xrayOnly: true, noEdges: true }));
}

// an irregular lump: an icosphere pushed about by seeded noise and fitted to the box
function lump(THREE, seed, detail = 2) {
  const geo = new THREE.IcosahedronGeometry(1, detail), r = rng(seed), p = geo.attributes.position, seen = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    if (!seen.has(key)) seen.set(key, 0.78 + r() * 0.4);
    const k = seen.get(key); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  geo.computeVertexNormals(); return geo;
}

function iceberg(THREE, q, g) {
  const geo = lump(THREE, q.seed || 7, 3), h = q.above + q.below;
  geo.scale(q.l / 2, q.b / 2, h / 2); geo.translate(0, 0, (q.above - q.below) / 2);
  g.add(mesh(THREE, geo, 'structure', LOOK.ice));
}

function debris(THREE, q, g) {
  const geo = lump(THREE, q.seed || 3, 1); geo.scale(q.l / 2, q.b / 2, q.h / 2); geo.translate(0, 0, q.h / 2);
  g.add(mesh(THREE, geo, 'structure', q.color || LOOK.debris));
}

function boiler(THREE, q, g) {
  const geo = new THREE.CylinderGeometry(q.d / 2, q.d / 2, q.l, 20); geo.rotateZ(Math.PI / 2); geo.translate(0, 0, q.d / 2);
  g.add(mesh(THREE, geo, 'structure', LOOK.boiler));
}

export function buildPiece(THREE, piece, model) {
  const g = new THREE.Group(), q = piece.params || {}, parent = model.pieces.find(p => p.id === piece.parent);
  g.name = piece.id;
  switch (piece.template) {
    case 'hull': hullPiece(THREE, q, g); break;
    case 'deckhouse': deckhouse(THREE, q, g); break;
    case 'funnel': funnel(THREE, q, g); break;
    case 'mast': mast(THREE, q, g); break;
    case 'davit': davit(THREE, q, g); break;
    case 'railing': railing(THREE, q, g); break;
    case 'bulkhead': bulkhead(THREE, q, g, parent, model); break;
    case 'compartment': compartment(THREE, q, g, parent, model); break;
    case 'iceberg': iceberg(THREE, q, g); break;
    case 'debris': debris(THREE, q, g); break;
    case 'boiler': boiler(THREE, q, g); break;
    case 'box': { const b = new THREE.BoxGeometry(q.l, q.b, q.h); b.translate(0, 0, q.h / 2); g.add(mesh(THREE, b, 'structure', q.color || LOOK.metal)); break; }
    case 'cylinder': { const c = upright(THREE, new THREE.CylinderGeometry(q.d / 2, q.d / 2, q.h, 18)); c.translate(0, 0, q.h / 2); g.add(mesh(THREE, c, 'structure', q.color || LOOK.metal)); break; }
    default: break;   // group, seabed: nothing of their own
  }
  return g;
}
