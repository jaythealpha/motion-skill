import {createTitanicQuality} from './quality-titanic.js';
import {createQualityStudy} from './quality.js';
// three.js renderer. Model coordinates are z-up metres; the root group turns them so z points up on screen.
// Two styles from the same meshes ('color': toon bands and ink edges; 'blueprint': flat fills and light lines),
// and an x-ray mode that thins the hull to show bulkheads and the water inside.
import * as THREE from 'three';
import { createWreckDetail } from './wreck-detail.js';
import { refineBritannicPiece } from './britannic-form.js';
import {refineTitanicPiece} from './titanic-form.js';
import { createCinematic } from './cinematic.js';
import {createDeepEcology} from './deep-ecology.js';
import {ecologyMode} from './ecology-model.js';
import {explorationStops} from './exploration.js';
import { isTitanic, isBritannic, hasDirecting, smooth } from './directing.js';
import { buildPiece, LOOK, rng } from './shapes.js';
import { buildEnvironment } from './env.js';
import { evaluate } from './tracks.js';
import { cameraAt, subjectBox, frameSubject, pieceWorldBox } from './camera.js';
import { pieceBox, waterPlane, clampToPlane, groundFn, worldBox } from './geom.js';
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

  const refine=isBritannic(model)?refineBritannicPiece:isTitanic(model)?refineTitanicPiece:null;
  const drawingModel=refine?{...model,pieces:model.pieces.map(refine)}:model;
  const gmap = gradientMap(THREE), byId = new Map(drawingModel.pieces.map(p => [p.id, p]));
  const rustCol = new THREE.Color(LOOK.rust), white = new THREE.Color('#ffffff');
  // ink edges by day; light edges against the night sky and dark water, so a black hull still reads
  const lines = { color: new THREE.LineBasicMaterial({ color: INK }), colorDim: new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.18, depthWrite: false }),
    dark: new THREE.LineBasicMaterial({ color: '#a9bfd6', transparent: true, opacity: 0.75 }), darkDim: new THREE.LineBasicMaterial({ color: '#a9bfd6', transparent: true, opacity: 0.22, depthWrite: false }),
    blueprint: new THREE.LineBasicMaterial({ color: BP.line }), blueprintDim: new THREE.LineBasicMaterial({ color: BP.line, transparent: true, opacity: 0.3, depthWrite: false }) };

  // every piece: its group (placed by matrix each frame) and its meshes with a material per style
  const items = [];
  const order = [], seen = new Set(), visit = p => { if (seen.has(p.id)) return; seen.add(p.id); if (p.parent && byId.has(p.parent)) visit(byId.get(p.parent)); order.push(p); };
  drawingModel.pieces.forEach(visit);
  for (const p of order) {
    const g = buildPiece(THREE, p, drawingModel); g.matrixAutoUpdate = false; root.add(g);
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
      if(u.planGlass){u.mats={color:new THREE.MeshBasicMaterial({color:'#122831',side:THREE.DoubleSide}),blueprint:new THREE.MeshBasicMaterial({color:'#081d36',side:THREE.DoubleSide})};continue;}
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
      windows = new THREE.Points(geo, new THREE.PointsMaterial({ color: LOOK.window, size: 2, sizeAttenuation: false, transparent: true, depthWrite: false, toneMapped: false }));
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
    const lb = pieceBox(p, drawingModel), local = lb && { min: lb.min.map((v, k) => v - p.offset[k]), max: lb.max.map((v, k) => v - p.offset[k]) };
    items.push({ p, g, meshes, windows, rusticles, local });
  }
  if (env.seabed) env.seabed.userData.mats = {
    color: new THREE.MeshToonMaterial({ color: isTitanic(model) ? '#18323d' : isBritannic(model) ? '#2b565d' : LOOK.sand, gradientMap: gmap }), blueprint: new THREE.MeshBasicMaterial({ color: BP.bg }) };

  if(env.seabed && isBritannic(model)){
    // Neutral procedural sediment grain: lighting/texture, not mapped site data.
    const pixels=new Uint8Array(128*128*4),noise=rng(1916);
    for(let i=0;i<128*128;i++){const x=i%128,y=Math.floor(i/128),v=Math.round(180+50*noise()+20*Math.sin(x*.07)*Math.cos(y*.09));pixels.set([v,v,v,255],i*4);}
    const texture=new THREE.DataTexture(pixels,128,128);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(250,250);texture.needsUpdate=true;
    env.seabed.userData.mats.color.map=texture;
  }
  const cinematic = hasDirecting(model) && opts.cinematic !== false ? createCinematic(root, model, env.surface) : null;
  const wreckDetail = hasDirecting(model) ? createWreckDetail({root,model,items,ground,shallow:isBritannic(model)}) : null;
  const ecology=isTitanic(model)?createDeepEcology({root,scene,camera,model,items,ground}):null;
  const surveyLamp=new THREE.SpotLight('#c5e6ef',1,500,.5,.85,2);scene.add(surveyLamp,surveyLamp.target);surveyLamp.visible=false;surveyLamp.name='exploration-lamp';
  const st = {exploring:false,exploreTarget:null,lampStrength:1, ecology:opts.ecology!==false, exploreLight:opts.exploreLight!==false, ecoView:opts.ecoView||'scene',ecoClock:0,t: 0, branch: 'a', style: 'color', xray: false, auto: opts.auto !== false, yaw: opts.yaw ?? null, pitch: opts.pitch ?? null, zoom: opts.zoom || 1, last: null, cam: null };
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
    hemi.intensity = bp ? 1.5 : night || deep ? 1.15 : 1.6; hemi.color.set(night || deep ? '#c9d6f0' : '#ffffff'); sun.color.set(cinematic && (deep || (isBritannic(model) && st.eyeZ<0)) ? '#a1c7df' : '#ffffff'); sun.intensity = night || deep ? (cinematic ? 2.6 : 1.3) : 2;
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
    const c = cameraAt(model, st.t, st.last);
    if (cinematic && st.auto && isTitanic(model)) {
      // Broadside makes the iceberg contact, flooding compartments and broken keel readable.
      if (st.t < 38) {
        const fade=1-smooth((st.t-34)/4);
        const side=(st.last.pieces.get('ship')?.heading || 100)-87;
        c.yaw=c.yaw+(side-c.yaw)*fade;c.pitch=14+(c.pitch-14)*(1-fade);
      }
      if(st.t>=38 && st.t<45.2){
        const blend=smooth((st.t-38)/1.2)*(1-smooth((st.t-44)/1.2));
        c.yaw+=(13-c.yaw)*blend;c.pitch+=(11-c.pitch)*blend;
      }
    }
    if(cinematic && st.auto && isBritannic(model)){
      if(st.t<40){const heading=st.last.pieces.get('ship').heading;c.yaw=heading-90;c.pitch=17;}
      else if(st.t<62){const p=(st.t-40)/22,heading=st.last.pieces.get('ship').heading;c.yaw=heading-90-30*smooth(p);c.pitch=8;}
      else{c.yaw=150+20*Math.sin((st.t-62)/38*Math.PI);c.pitch=14;c.dist*=.82;}
    }
    st.focusIds=null;st.focusBox=null;
    if(cinematic && st.auto && isTitanic(model) && st.t>=56){
      const event=model.events.filter(e=>e.kind==='collapse'&&e.mode!=='vanish'&&e.card!==false&&st.t>=e._t-.12&&st.t<=e._until+.35).at(-1);
      if(event){const it=items.find(it=>it.p.id===event.piece),ps=st.last.pieces.get(event.piece);
        const drawn=collapseMatrix(it,st.last,new THREE.Matrix4().fromArray(ps.matrix));
        const b=it.local?worldBox(it.local,drawn.elements):pieceWorldBox(model,st.last,event.piece),f=smooth((st.t-event._t+.12)/.12)*(1-smooth((st.t-event._until)/.35));
        const centre=b.min.map((v,k)=>(v+b.max[k])/2);c.target=c.target.map((v,k)=>v+(centre[k]-v)*f);const close=Math.max(12,Math.hypot(...b.max.map((v,k)=>v-b.min[k]))*2.3);c.dist=c.dist+(close-c.dist)*f;
        if(f>.95){st.focusIds=[event.piece];st.focusBox=b;}
      }
    }
    if(wreckDetail && isTitanic(model) && st.auto && !st.focusIds && st.t>=80 && st.t<=88){
      const f=smooth((st.t-80)/2)*(1-smooth((st.t-86)/2)),ids=['officers','first-house','bridge-wings'];
      const b=subjectBox(model,st.last,ids),centre=b.min.map((v,k)=>(v+b.max[k])/2),heading=st.last.pieces.get('hull-bow').heading;
      c.target=c.target.map((v,k)=>v+(centre[k]-v)*f);c.dist+=(150-c.dist)*f;c.yaw+=(heading-65-c.yaw)*f;c.pitch+=(22-c.pitch)*f;
      if(f>.95){st.focusIds=ids;st.focusBox=b;}
    }
    if(wreckDetail && isBritannic(model) && st.auto && st.t>=82 && st.t<=98){
      const f=smooth((st.t-82)/4)*(1-smooth((st.t-94)/4));
      const ids=['officers','gantry-1','bridge-wings'],b=subjectBox(model,st.last,ids),centre=b.min.map((v,k)=>(v+b.max[k])/2);
      c.target=c.target.map((v,k)=>v+(centre[k]-v)*f);c.dist+=(105-c.dist)*f;c.yaw+=(220-c.yaw)*f;c.pitch+=(26-c.pitch)*f;
      if(f>.95){st.focusIds=ids;st.focusBox=b;}
    }
    const stop=st.exploring&&explorationStops(model).find(s=>s.id===st.exploreTarget);
    if(stop){let b=subjectBox(model,st.last,stop.parts);if(stop.trimX||stop.trimY||stop.trimZ){const it=items.find(q=>q.p.id===stop.parts[0]);if(it?.local){const box={min:[...it.local.min],max:[...it.local.max]};for(const [k,key]of ['trimX','trimY','trimZ'].entries()){const v=stop[key];if(v){const lo=box.min[k],span=box.max[k]-lo;box.max[k]=lo+span*v[1];box.min[k]=lo+span*v[0];}}b=worldBox(box,it.g.matrix.elements);}}c.target=b.min.map((v,k)=>(v+b.max[k])/2);c.dist=Math.max(8,...b.max.map((v,k)=>(v-b.min[k])*1.55));c.yaw=stop.yaw;c.pitch=stop.pitch;st.focusBox=b;st.focusIds=stop.parts;}
    st.ecoFocus=null;ecology?.updateAnimals(st);const ecoFocus=ecology?.inspect(st);
    if(ecoFocus){st.ecoFocus=ecoFocus;const b=ecoFocus.box;c.target=b.min.map((v,k)=>(v+b.max[k])/2);c.dist=ecoFocus.dist;c.yaw=ecoFocus.yaw;c.pitch=st.ecoView==='sponge'?35:12;st.focusBox=b;st.focusIds=[st.ecoView==='sponge'?'aft-house-stern':st.ecoView==='coral'?'rail-bow-stbd':'hull-bow'];}
    st.cam = c;
    const yaw = (st.auto || st.yaw == null ? c.yaw : st.yaw) * DEG, pitch = Math.max(-80, Math.min(85, st.auto || st.pitch == null ? c.pitch : st.pitch)) * DEG;
    // a tall, narrow screen (a phone held upright) sees less across, so the camera stands further back
    const narrow = camera.aspect < 1 ? Math.min(2.4, 1 / camera.aspect) ** 0.85 : 1;
    let dist = c.dist * st.zoom * narrow; const T = c.target;
    const eye = [T[0] + dist * Math.cos(pitch) * Math.cos(yaw), T[1] + dist * Math.cos(pitch) * Math.sin(yaw), T[2] + dist * Math.sin(pitch)];
    const submerged=cinematic && isBritannic(model) && subjectBox(model,st.last,frameSubject(model,st.t)).max[2]<-10;
    if(submerged)eye[2]=Math.min(-8,eye[2]);
    camera.position.copy(toThree(eye)); camera.near = Math.max(st.ecoFocus ? .003 : .5, dist / 200); camera.far = st.ecoFocus ? Math.max(20,dist*40) : dist * 40 + 10000; camera.updateProjectionMatrix();
    camera.lookAt(toThree(T));
    if(cinematic && st.auto){
      // Fit the current subject at every aspect ratio, with room for the overlay cards.
      const b=st.focusBox || subjectBox(model,st.last,frameSubject(model,st.t));
      for(let attempt=0;attempt<18;attempt++){
        camera.updateMatrixWorld();let fit=true;
        for(const x of [b.min[0],b.max[0]])for(const y of [b.min[1],b.max[1]])for(const z of [b.min[2],b.max[2]]){
          const v=toThree([x,y,z]).project(camera);if(Math.abs(v.x)>.83||Math.abs(v.y)>.56||v.z>1)fit=false;
        }
        if(fit)break;dist*=1.12;
        eye[0]=T[0]+dist*Math.cos(pitch)*Math.cos(yaw);eye[1]=T[1]+dist*Math.cos(pitch)*Math.sin(yaw);eye[2]=T[2]+dist*Math.sin(pitch);
        if(submerged)eye[2]=Math.min(-8,eye[2]);
        camera.position.copy(toThree(eye));camera.lookAt(toThree(T));
      }
      camera.far=st.ecoFocus?Math.max(20,dist*40):dist*40+10000;camera.updateProjectionMatrix();
    }
    env.update(scene, eye[2], st.style, BP, dist);
    st.eyeZ = eye[2];
  }

  const quality=opts.quality==='high'&&isBritannic(model)?createQualityStudy({renderer,scene,camera,root,items,ground,hemi,sun,model,cutaway:opts.qualityCutaway}):opts.quality==='high'&&isTitanic(model)?createTitanicQuality({renderer,scene,items}):null;
  function render() { if (!st.last) apply(st.t); placeCamera(); cinematic?.update(st); wreckDetail?.update(st); ecology?.updateLight(st,hemi,sun); surveyLamp.visible=st.exploring&&(!ecology||!ecologyMode(model,st))&&st.style==='color'&&st.exploreLight;
    if(surveyLamp.visible){const T=toThree(st.cam.target),d=camera.position.distanceTo(T);surveyLamp.position.copy(camera.position);surveyLamp.target.position.copy(T);surveyLamp.distance=d*5+5;surveyLamp.intensity=d*d*2*st.lampStrength;}
    quality?.update(st);
    renderer.render(scene, camera); opts.onRender?.(); }

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
    const b = st.focusBox || subjectBox(model, st.last, frameSubject(model, st.t)), lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
    let behind = 0;
    for (const x of [b.min[0], b.max[0]]) for (const y of [b.min[1], b.max[1]]) for (const z of [b.min[2], b.max[2]]) {
      const v = toThree([x, y, z]).project(camera);
      if (v.z > 1) { behind++; continue; }
      lo[0] = Math.min(lo[0], v.x); lo[1] = Math.min(lo[1], v.y); hi[0] = Math.max(hi[0], v.x); hi[1] = Math.max(hi[1], v.y);
    }
    return behind === 8 ? null : { lo, hi };
  }
  function frame() {
    const ids = st.focusIds || frameSubject(model, st.t), top = (st.focusBox || subjectBox(model, st.last, ids)).max[2], s = screenBox();
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

  function diagram(){
    const W=canvas.clientWidth||800,ids=isBritannic(model)?['officers','gantry-1','funnel-1','hull-bow']:(st.focusIds?.includes('first-house')?['officers','first-house','hull-bow','bridge-wings']:['officers','hull-bow','funnel-1','hull-stern']);
    const anchors=ids.map(id=>{const it=items.find(q=>q.p.id===id);if(!it?.g.visible||!it.local)return null;
      const b=worldBox(it.local,it.g.matrix.elements),v=toThree(b.min.map((n,k)=>(n+b.max[k])/2)).project(camera);
      return v.z>1||v.z< -1?null:{id,name:it.p.name,x:(v.x+1)/2,y:(1-v.y)/2};}).filter(Boolean);
    const a=toThree(st.cam?.target||[0,0,0]),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),b=a.clone().add(right);
    a.project(camera);b.project(camera);return {anchors,ppm:Math.max(.0001,Math.abs(b.x-a.x)*W/2)};
  }
  return {
    state: st, renderer, scene, camera, diagram, qualityInfo:()=>quality?.stats||null,
    ecologyInfo(){return ecology?{available:st.t>=0&&ecologyMode(model,st),kind:st.ecoFocus?.kind||null,clock:st.ecoClock,...ecology.stats()}:null;},
    set(o = {}) {
      for(const k of ['ecology','exploreLight','ecoView','ecoClock','exploring','lampStrength'])if(o[k]!=null)st[k]=o[k];
      if('exploreTarget' in o)st.exploreTarget=o.exploreTarget;
      if (o.style) st.style = o.style;
      if (o.xray != null) st.xray = !!o.xray;
      if (o.branch) st.branch = o.branch;
      if (o.t != null) st.t = o.t;
      apply(st.t); render();
    },
    setAuto(on) { st.auto = !!on; if (on) { st.zoom = 1; } render(); },
    reset() { st.auto = true; st.zoom = 1; st.yaw = st.pitch = null; render(); },
    restoreView(v){for(const k of ['auto','yaw','pitch','zoom'])st[k]=v[k];render();},
    zoomBy(f){manual();st.zoom=Math.max(.2,Math.min(5,st.zoom*f));render();},
    animateEcology(clock){st.ecoClock=clock;render();},
    frame, probe, resize, render,
    dataURL() { render(); return renderer.domElement.toDataURL('image/png'); },
  };
}
