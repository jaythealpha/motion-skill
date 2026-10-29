// three.js renderer. Model coordinates are z-up metres; the root group turns them so z points up on screen.
// Two styles from the same meshes ('color': toon bands and ink edges; 'blueprint': flat fills and light lines),
// and an x-ray mode that thins the hull to show bulkheads and the water inside.
import * as THREE from 'three';
import { buildPiece, LOOK, rng } from './shapes.js';
import { buildEnvironment } from './env.js';
import { evaluate } from './tracks.js';
import { cameraAt, subjectBox, frameSubject, pieceWorldBox } from './camera.js';
import { pieceBox, waterPlane, clampToPlane, groundFn } from './geom.js';
import { gradientMap, INK, BP } from '../shared/toon.js';

const DEG = Math.PI / 180;
const toThree = ([x, y, z]) => new THREE.Vector3(x, z, -y);

export function createRenderer(canvas, model, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
  const hemi = new THREE.HemisphereLight('#ffffff', '#5a6878', 1.5), sun = new THREE.DirectionalLight('#ffffff', 2);
  sun.position.set(-0.5, 1.2, 0.8); scene.add(hemi, sun);
  const root = new THREE.Group(); root.rotation.x = -Math.PI / 2; scene.add(root);

  const night = model.environment.sky === 'night', seaFloor = -(model.environment.seaDepth || 0), ground = groundFn(model);
  // the seabed covers the wreck and the whole route above it (a ship can travel kilometres while it sinks)
  const end = evaluate(model, 100), endBox = subjectBox(model, end), xs = [endBox.min[0], endBox.max[0]], ys = [endBox.min[1], endBox.max[1]];
  for (const tr of model.tracks) if (tr.prop === 'pose') for (const k of tr.keys) { xs.push(k.v.pos[0]); ys.push(k.v.pos[1]); }
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const env = buildEnvironment(THREE, model, { centre: [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2],
    size: Math.max(model.environment.seabed?.size || 0, span * 1.4 + 600) });
  root.add(env.group);

  const gmap = gradientMap(THREE), byId = new Map(model.pieces.map(p => [p.id, p]));
  const rustCol = new THREE.Color(LOOK.rust), white = new THREE.Color('#ffffff');
  // ink edges by day; light edges against the night sky and dark water, so a black hull still reads
  const lines = { color: new THREE.LineBasicMaterial({ color: INK }), colorDim: new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.18, depthWrite: false }),
    dark: new THREE.LineBasicMaterial({ color: '#a9bfd6', transparent: true, opacity: 0.75 }), darkDim: new THREE.LineBasicMaterial({ color: '#a9bfd6', transparent: true, opacity: 0.22, depthWrite: false }),
    blueprint: new THREE.LineBasicMaterial({ color: BP.line }), blueprintDim: new THREE.LineBasicMaterial({ color: BP.line, transparent: true, opacity: 0.3, depthWrite: false }) };

  // every piece: its group (placed by matrix each frame) and its meshes with a material per style
  const items = [];
  const order = [], seen = new Set(), visit = p => { if (seen.has(p.id)) return; seen.add(p.id); if (p.parent && byId.has(p.parent)) visit(byId.get(p.parent)); order.push(p); };
  model.pieces.forEach(visit);
  for (const p of order) {
    const g = buildPiece(THREE, p, model); g.matrixAutoUpdate = false; root.add(g);
    const meshes = [];
    g.traverse(o => { if ((o.isMesh || o.isLineSegments) && o.userData.role) meshes.push(o); });
    for (const m of meshes) {
      const u = m.userData, base = new THREE.Color(u.color || '#888888');
      if (m.isLineSegments) { u.mats = { color: new THREE.LineBasicMaterial({ color: '#6fa8ff', transparent: true, opacity: 0.7 }), blueprint: new THREE.LineBasicMaterial({ color: BP.dim }) }; continue; }
      if (u.role === 'water') {
        u.mats = { color: new THREE.MeshBasicMaterial({ color: LOOK.water, transparent: true, opacity: 0.78, depthWrite: false }),
          blueprint: new THREE.MeshBasicMaterial({ color: BP.accent, transparent: true, opacity: 0.5, depthWrite: false }) };
        m.renderOrder = 3; continue;
      }
      if (u.role === 'bulkhead') {
        u.mats = { color: new THREE.MeshBasicMaterial({ color: base, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
          blueprint: new THREE.MeshBasicMaterial({ color: BP.line, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }) };
        continue;
      }
      u.baseColor = base;
      u.mats = { color: new THREE.MeshToonMaterial({ color: base.clone(), gradientMap: gmap, vertexColors: !!u.vertexColors, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
        blueprint: new THREE.MeshBasicMaterial({ color: BP.fill, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }) };
      if (!u.noEdges) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), lines.color); e.raycast = () => {}; m.add(e); u.edges = e; }
    }
    // lit windows: points that keep their size on screen
    let windows = null;
    if (g.userData.windows) {
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(g.userData.windows.flat(), 3));
      windows = new THREE.Points(geo, new THREE.PointsMaterial({ color: LOOK.window, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false }));
      windows.renderOrder = 4; g.add(windows);
    }
    // growth on a hull, shown in proportion to its rust: rusticles (downward cones, the deep-sea look) or a crust of
    // lumps (shallow, warm water), as environment.growth says
    let rusticles = null;
    const growth = { kind: 'rusticles', ...(model.environment.growth || {}) };
    if (p.template === 'hull' && growth.kind !== 'none') {
      const hull = meshes.find(m => m.userData.role === 'hull'), pos = hull.geometry.attributes.position, r = rng(p.id.length * 31 + 7), N = 600;
      const crust = growth.kind === 'crust', cone = crust ? new THREE.IcosahedronGeometry(0.45, 0) : new THREE.ConeGeometry(0.22, 1.5, 5);
      if (!crust) { cone.rotateX(-Math.PI / 2); cone.translate(0, 0, -0.75); }
      rusticles = new THREE.InstancedMesh(cone, new THREE.MeshToonMaterial({ color: growth.color || (crust ? '#6f7a4a' : '#9b4a1c'), gradientMap: gmap }), N);
      const mtx = new THREE.Matrix4(), depth = p.params.depth;
      for (let i = 0; i < N; i++) {
        let k = 0, tries = 0;
        do { k = Math.floor(r() * pos.count); } while ((pos.getZ(k) < depth * 0.15 || pos.getZ(k) > depth * 0.97) && ++tries < 40);
        const s = 0.6 + r() * 1.2;
        mtx.makeScale(s, s, s * (0.8 + r())).setPosition(pos.getX(k), pos.getY(k), pos.getZ(k)); rusticles.setMatrixAt(i, mtx);
      }
      rusticles.count = 0; g.add(rusticles);
    }
    const lb = pieceBox(p, model), local = lb && { min: lb.min.map((v, k) => v - p.offset[k]), max: lb.max.map((v, k) => v - p.offset[k]) };
    items.push({ p, g, meshes, windows, rusticles, local });
  }
  if (env.seabed) env.seabed.userData.mats = {
    color: new THREE.MeshToonMaterial({ color: LOOK.sand, gradientMap: gmap }), blueprint: new THREE.MeshBasicMaterial({ color: BP.dim, wireframe: true, transparent: true, opacity: 0.45 }) };

  const st = { t: 0, branch: 'a', style: 'color', xray: false, auto: opts.auto !== false, yaw: opts.yaw ?? null, pitch: opts.pitch ?? null, zoom: opts.zoom || 1, last: null, cam: null };
  if (opts.yaw != null || opts.pitch != null) st.auto = false;

  // the extra motion of a collapsing piece, on top of its pose
  function collapseMatrix(it, s, M) {
    const c = s.pieces.get(it.p.id).collapse; if (!c || !it.local) return M;
    const p = c.p, b = it.local, zb = b.min[2], mid = b.min.map((v, k) => (v + b.max[k]) / 2);
    const about = (sx, sy, sz, o) => new THREE.Matrix4().makeTranslation(o[0], o[1], o[2]).multiply(new THREE.Matrix4().makeScale(sx, sy, sz)).multiply(new THREE.Matrix4().makeTranslation(-o[0], -o[1], -o[2]));
    if (c.mode === 'sag') return M.clone().multiply(about(1, 1, 1 - 0.4 * p, [mid[0], mid[1], zb]));
    if (c.mode === 'crush') return M.clone().multiply(about(1 + 0.08 * p, 1 + 0.05 * p, 1 - 0.55 * p, [mid[0], mid[1], zb]));
    // topple: fall over aft about the foot, as a mast onto the deck
    if (c.mode === 'topple') return M.clone().multiply(new THREE.Matrix4().makeTranslation(mid[0], mid[1], zb)).multiply(new THREE.Matrix4().makeRotationY(-80 * DEG * p)).multiply(new THREE.Matrix4().makeTranslation(-mid[0], -mid[1], -zb));
    if (c.mode === 'vanish') return M.clone().multiply(about(1 - p * 0.999, 1 - p * 0.999, 1 - p * 0.999, mid));
    // drop: fall to the seabed (or 20 m when there is none), tipping a little
    const wb = pieceWorldBox(model, s, it.p.id), dz = seaFloor < 0 ? Math.min(0, ground((wb.min[0] + wb.max[0]) / 2, (wb.min[1] + wb.max[1]) / 2) - wb.min[2]) : -20;
    return new THREE.Matrix4().makeTranslation(0, 0, dz * p).multiply(M).multiply(new THREE.Matrix4().makeRotationY(6 * DEG * p));
  }

  function apply(t) {
    const s = evaluate(model, t, st.branch); st.last = s;
    placeCamera();                                   // the camera at this t decides the light and edge colours below
    const bp = st.style === 'blueprint', dark = night || (st.eyeZ ?? 1) < 0;
    // a piece riding on its parent also rides on the parent's collapse: its drawn matrix is the parent's drawn
    // matrix times its place in the parent (items are built parents-first, see order below)
    const drawn = new Map();
    for (const it of items) {
      const ps = s.pieces.get(it.p.id), own = new THREE.Matrix4().fromArray(ps.matrix);
      let base = own;
      if (ps.follows && drawn.has(ps.follows)) {
        const pm = new THREE.Matrix4().fromArray(s.pieces.get(ps.follows).matrix);
        base = drawn.get(ps.follows).clone().multiply(pm.invert()).multiply(own);
      }
      const M = collapseMatrix(it, s, base); drawn.set(it.p.id, M);
      it.g.matrix.copy(M); it.g.matrixWorldNeedsUpdate = true;
      it.g.visible = ps.visible && !(ps.collapse?.mode === 'vanish' && ps.collapse.p >= 1);
      for (const m of it.meshes) {
        const u = m.userData;
        m.visible = !u.xrayOnly || st.xray;
        m.material = u.mats[st.style];
        if (u.role === 'water') water(m, it, s);
        if (u.baseColor && !bp) {
          // rust: the colour drifts toward rust and glows a little with it, so even a black hull turns brown
          const mat = u.mats.color, tint = Math.min(0.85, ps.rust * 0.85);
          (u.vertexColors ? mat.color.copy(white) : mat.color.copy(u.baseColor)).lerp(rustCol, tint * 0.6);
          mat.emissive.copy(rustCol).multiplyScalar(tint * 0.45);
          mat.transparent = st.xray; mat.opacity = st.xray ? 0.16 : 1; mat.depthWrite = !st.xray;
        }
        if (u.baseColor && bp) { const mat = u.mats.blueprint; mat.transparent = st.xray; mat.opacity = st.xray ? 0.2 : 1; mat.depthWrite = !st.xray; }
        if (u.edges) u.edges.material = lines[(bp ? 'blueprint' : dark ? 'dark' : 'color') + (st.xray ? 'Dim' : '')];
      }
      if (it.windows) { it.windows.material.color.set(bp ? BP.accent : LOOK.window); it.windows.material.opacity = s.lights; it.windows.visible = s.lights > 0.01; }
      if (it.rusticles) { it.rusticles.count = bp ? 0 : Math.round(Math.max(0, ps.rust) * 600); it.rusticles.visible = !st.xray; }
    }
    if (env.seabed) env.seabed.material = env.seabed.userData.mats[st.style];
    // light: a dim blue night and dark deep water, still drawn bright enough to see
    const deep = st.cam ? st.cam.target[2] < -200 : false;
    hemi.intensity = bp ? 1.5 : night || deep ? 1.15 : 1.6; hemi.color.set(night || deep ? '#c9d6f0' : '#ffffff'); sun.intensity = night || deep ? 1.3 : 2;
  }

  // flatten the water box to its level surface, tilted in the ship's frame as the ship trims and lists
  function water(m, it, s) {
    const h = s.water.get(it.p.id), u = m.userData;
    if (h == null || h <= u.floor + 0.05) { m.visible = false; return; }
    const plane = waterPlane(s.pieces.get(it.p.id).matrix, it.p, h), out = clampToPlane(u.base, plane);
    for (let i = 2; i < out.length; i += 3) if (out[i] < u.floor) out[i] = u.floor;
    m.geometry.attributes.position.array.set(out); m.geometry.attributes.position.needsUpdate = true; m.geometry.computeBoundingSphere();
  }

  function placeCamera() {
    const c = cameraAt(model, st.t, st.last); st.cam = c;
    const yaw = (st.auto || st.yaw == null ? c.yaw : st.yaw) * DEG, pitch = Math.max(-80, Math.min(85, st.auto || st.pitch == null ? c.pitch : st.pitch)) * DEG;
    // a tall, narrow screen (a phone held upright) sees less across, so the camera stands further back
    const narrow = camera.aspect < 1 ? Math.min(2.4, 1 / camera.aspect) ** 0.85 : 1;
    const dist = c.dist * st.zoom * narrow, T = c.target;
    const eye = [T[0] + dist * Math.cos(pitch) * Math.cos(yaw), T[1] + dist * Math.cos(pitch) * Math.sin(yaw), T[2] + dist * Math.sin(pitch)];
    camera.position.copy(toThree(eye)); camera.near = Math.max(0.5, dist / 200); camera.far = dist * 40 + 10000; camera.updateProjectionMatrix();
    camera.lookAt(toThree(T));
    env.update(scene, eye[2], st.style, BP, dist);
    st.eyeZ = eye[2];
  }

  function render() { if (!st.last) apply(st.t); placeCamera(); renderer.render(scene, camera); }

  function resize() {
    const w = canvas.clientWidth || 800, h = canvas.clientHeight || 500;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
  }

  // drag to turn, wheel or pinch to zoom; any of these hands the camera to the viewer
  const ptrs = new Map(); let pinch = 0;
  const manual = () => { if (st.auto) { st.auto = false; st.yaw = st.cam?.yaw ?? 215; st.pitch = st.cam?.pitch ?? 20; opts.onManual?.(); } };
  canvas.addEventListener('pointerdown', e => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); canvas.setPointerCapture?.(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) return;
    const [x0, y0] = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) { st.zoom = Math.max(0.15, Math.min(6, st.zoom * pinch / d)); manual(); } pinch = d; render(); return; }
    manual(); st.yaw -= (e.clientX - x0) * 0.35; st.pitch = Math.max(-80, Math.min(85, st.pitch + (e.clientY - y0) * 0.3)); render();
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = 0; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); manual(); st.zoom = Math.max(0.15, Math.min(6, st.zoom * Math.exp(e.deltaY * 0.0012))); render(); }, { passive: false });

  // the subject's box on screen: how much of it is in view, and how big it is
  function screenBox() {
    const b = subjectBox(model, st.last, frameSubject(model, st.t)), lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
    let behind = 0;
    for (const x of [b.min[0], b.max[0]]) for (const y of [b.min[1], b.max[1]]) for (const z of [b.min[2], b.max[2]]) {
      const v = toThree([x, y, z]).project(camera);
      if (v.z > 1) { behind++; continue; }
      lo[0] = Math.min(lo[0], v.x); lo[1] = Math.min(lo[1], v.y); hi[0] = Math.max(hi[0], v.x); hi[1] = Math.max(hi[1], v.y);
    }
    return behind === 8 ? null : { lo, hi };
  }
  function frame() {
    const ids = frameSubject(model, st.t), top = subjectBox(model, st.last, ids).max[2], s = screenBox();
    if (!s) return { area: 0, inside: 0, ids, eyeZ: st.eyeZ, subjectTop: top };
    const w = Math.max(1e-9, s.hi[0] - s.lo[0]), h = Math.max(1e-9, s.hi[1] - s.lo[1]);
    const cw = Math.max(0, Math.min(1, s.hi[0]) - Math.max(-1, s.lo[0])), ch = Math.max(0, Math.min(1, s.hi[1]) - Math.max(-1, s.lo[1]));
    return { area: (cw * ch) / 4, inside: (cw * ch) / (w * h), ids, eyeZ: st.eyeZ, subjectTop: top };
  }
  // count warm (lit window) and water-blue pixels inside the subject's box, at full resolution
  function probe() {
    render();
    const s = screenBox(); if (!s) return { warm: 0, water: 0 };
    const W = renderer.domElement.width, H = renderer.domElement.height;
    const x0 = Math.max(0, Math.floor((Math.max(-1, s.lo[0]) + 1) / 2 * W)), x1 = Math.min(W, Math.ceil((Math.min(1, s.hi[0]) + 1) / 2 * W));
    const y0 = Math.max(0, Math.floor((1 - Math.min(1, s.hi[1])) / 2 * H)), y1 = Math.min(H, Math.ceil((1 - Math.max(-1, s.lo[1])) / 2 * H));
    if (x1 <= x0 || y1 <= y0) return { warm: 0, water: 0 };
    const c = document.createElement('canvas'); c.width = x1 - x0; c.height = y1 - y0;
    const g = c.getContext('2d'); g.drawImage(renderer.domElement, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data; let warm = 0, wet = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      if (r > 235 && gg > 185 && b > 70 && b < 170) warm++;   // lit-window yellow, not the buff funnels or white paint
      if (b > 180 && b - r > 80) wet++;
    }
    return { warm, water: wet };
  }

  return {
    state: st, renderer, scene, camera,
    set(o = {}) {
      if (o.style) st.style = o.style;
      if (o.xray != null) st.xray = !!o.xray;
      if (o.branch) st.branch = o.branch;
      if (o.t != null) st.t = o.t;
      apply(st.t); render();
    },
    setAuto(on) { st.auto = !!on; if (on) { st.zoom = 1; } render(); },
    reset() { st.auto = true; st.zoom = 1; st.yaw = st.pitch = null; render(); },
    frame, probe, resize, render,
    dataURL() { render(); return renderer.domElement.toDataURL('image/png'); },
  };
}
