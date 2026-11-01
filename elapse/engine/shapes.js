// Geometry for each piece template, in the piece's own frame (its offset is applied by the renderer through the
// piece's matrix). Meshes carry userData.role and userData.color; the renderer picks the materials.
import { hullMesh, hullWindows, halfBreadthAt, deckHeightAt, sheerHeightAt } from './geom.js';
import {planHalfWidth, planWindows, deckBand} from './britannic-form.js';

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
    const x = positions[i], y = positions[i + 1], z = positions[i + 2], h = z * q.depth / sheerHeightAt(q, x);
    const band = bands.find(b => h >= b.z0 - 1e-4 && h <= b.z1 + 1e-4 && (b.from == null || x >= b.from - 1e-4) && (b.to == null || x <= b.to + 1e-4)
      && (!b.side || (b.side === 'port' ? y > 0 : y < 0)));
    c.set(band ? band.color : h < draft - boot - 1e-4 ? paint.bottom : h < draft + 1e-4 ? paint.boot : paint.topside);
    col[i] = c.r; col[i + 1] = c.g; col[i + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  g.add(mesh(THREE, geo, 'hull', '#ffffff', { vertexColors: true }));
  if(q.planForm&&q.planEndDecks!==false){
    const st=q.offsets.stations,range=q.range||[st[0].x,st.at(-1).x];
    for(const [a,b,rise] of [[-119,-88,2.4],[108,134.55,2.25]]){
      const lo=Math.max(a,range[0],st[0].x),hi=Math.min(b,range[1],st.at(-1).x);if(hi<=lo)continue;
      const points=deckBand(q,lo,hi,rise),shape=new THREE.Shape(points.map(v=>new THREE.Vector2(v[0],v[1])));
      const plate=new THREE.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:false}),p=plate.attributes.position;
      for(let k=0;k<p.count;k++)p.setZ(k,p.getZ(k)+deckHeightAt(q,p.getX(k))+rise);plate.computeVertexNormals();g.add(mesh(THREE,plate,'structure',LOOK.house));
      // Forecastle has a closed shell below its raised deck; aft well cover rests on columns.
      if(a>0){const pos=[],idx=[];for(let j=0;j<points.length;j++){const A=points[j],B=points[(j+1)%points.length],k=pos.length/3;
        pos.push(A[0],A[1],A[2]-rise,B[0],B[1],B[2]-rise,...A,...B);idx.push(k,k+1,k+2,k+2,k+1,k+3);}
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();g.add(mesh(THREE,geo,'structure',LOOK.house));
      }else for(let x=lo+1;x<hi-1;x+=3.5)for(const side of [-1,1]){const z=deckHeightAt(q,x),y=side*(halfBreadthAt(q,x,z)-.3),geo=new THREE.CylinderGeometry(.09,.09,rise,6);geo.rotateX(Math.PI/2);geo.translate(x,y,z+rise/2);g.add(mesh(THREE,geo,'structure',LOOK.house));}
      const rods=[];for(let j=0;j<points.length;j++){const v=points[j],w=points[(j+1)%points.length];rods.push(...v,...w);}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(rods,3));const line=new THREE.LineSegments(geo,new THREE.LineBasicMaterial());line.userData={role:'structure'};g.add(line);
    }
  }
  const wins = hullWindows(q);
  if (wins.length) g.userData.windows = wins.map(w => [(w.x0 + w.x1) / 2, w.y, (w.z0 + w.z1) / 2]);
}

function deckhouse(THREE, q, g) {
  if(q.planOutline){planDeckhouse(THREE,q,g);return;}
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

// Real window voids, thin roof/floor edges and a stepped footprint; no painted window dots.
// Coalesce identical wall/pane materials per deckhouse to keep the finer model practical on mobile.
// All these meshes are authored in the same local frame; retain normals for curved skylights.
function compactPlanMeshes(THREE,g){
  const sets=new Map();for(const m of [...g.children]){if(!m.isMesh)continue;const u=m.userData,key=[u.role,u.color,!!u.planGlass,!!u.noEdges].join(':');if(!sets.has(key))sets.set(key,[]);sets.get(key).push(m);}
  for(const ms of sets.values()){if(ms.length<2)continue;const geos=ms.map(m=>m.geometry.index?m.geometry.toNonIndexed():m.geometry),geo=new THREE.BufferGeometry();
    for(const name of ['position','normal']){const size=geos.reduce((s,g)=>s+g.attributes[name].array.length,0),data=new Float32Array(size);let at=0;for(const g of geos){data.set(g.attributes[name].array,at);at+=g.attributes[name].array.length;}geo.setAttribute(name,new THREE.BufferAttribute(data,3));}
    const m=new THREE.Mesh(geo,ms[0].material);m.userData={...ms[0].userData};g.add(m);
    ms.forEach((m,i)=>{g.remove(m);m.geometry.dispose();if(geos[i]!==m.geometry)geos[i].dispose();if(i)m.material.dispose();});
  }
}

function planDeckhouse(THREE,q,g){
  const rows=q.planOutline,outline=[...rows.map(([x,w])=>[x,-w]),...rows.toReversed().map(([x,w])=>[x,w])];
  const shape=new THREE.Shape(outline.map(([x,y])=>new THREE.Vector2(x,y)));
  for(const [z,h] of [[0,.14],[q.h-.14,.14]]){const geo=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});geo.translate(0,0,z);g.add(mesh(THREE,geo,'structure',z===0?'#c3b69b':LOOK.house));}
  const wins=planWindows(q);
  if(q.planOrigin!=null)g.userData.windows=wins.filter(w=>!w.open).flatMap(w=>[-1,1].map(side=>[w.x,side*(planHalfWidth(q,w.x)+.04),w.z]));
  for(let i=0;i<outline.length;i++){
    const a=outline[i],b=outline[(i+1)%outline.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.01)continue;
    const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
    const wall=new THREE.Shape();wall.moveTo(0,.14);wall.lineTo(len,.14);wall.lineTo(len,q.h-.14);wall.lineTo(0,q.h-.14);wall.closePath();
    if(Math.abs(dx)>1.7&&a[1]*b[1]>0)for(const w of wins){
      const t=(w.x-a[0])/dx,u=t*len,ww=w.w/Math.abs(ux);if(t<=0||t>=1||u-ww/2<.14||u+ww/2>len-.14)continue;
      const z=w.open?(q.h-.7)/2+.4:w.z,lo=z-w.h/2,hi=z+w.h/2;
      const hole=new THREE.Path();hole.moveTo(u-ww/2,lo);hole.lineTo(u-ww/2,hi);hole.lineTo(u+ww/2,hi);hole.lineTo(u+ww/2,lo);hole.closePath();wall.holes.push(hole);
      if(!w.open){const geo=new THREE.PlaneGeometry(ww-.05,w.h-.05),p=geo.attributes.position;
        for(let k=0;k<p.count;k++){const U=p.getX(k)+u,Z=p.getY(k)+z;p.setXYZ(k,a[0]+ux*U+nx*.09,a[1]+uy*U+ny*.09,Z);}geo.computeVertexNormals();
        g.add(mesh(THREE,geo,'structure','#122831',{planGlass:true,noEdges:true}));
      }
    }
    const geo=new THREE.ExtrudeGeometry(wall,{depth:.12,bevelEnabled:false}),p=geo.attributes.position;
    for(let k=0;k<p.count;k++){const U=p.getX(k),Z=p.getY(k),N=p.getZ(k);p.setXYZ(k,a[0]+ux*U+nx*N,a[1]+uy*U+ny*N,Z);}geo.computeVertexNormals();
    g.add(mesh(THREE,geo,'structure',LOOK.house));
  }
  if(q.planInnerOutline){const r=q.planInnerOutline,points=[...r.map(([x,w])=>new THREE.Vector2(x,-w)),...r.toReversed().map(([x,w])=>new THREE.Vector2(x,w))],geo=new THREE.ExtrudeGeometry(new THREE.Shape(points),{depth:q.h-.28,bevelEnabled:false});geo.translate(0,0,.14);g.add(mesh(THREE,geo,'structure','#c1c5c0'));}
  else if(q.planPromenade){const inner=new THREE.BoxGeometry(q.l*.45,q.b*.62,q.h-.30);inner.translate(-q.l*.24,0,q.h/2);g.add(mesh(THREE,inner,'structure','#9caaa8'));}
  if(q.roofStep){const r=new THREE.BoxGeometry(q.l*.28,q.b*.65,q.roofStep);r.translate(-q.l*.04,0,q.h+q.roofStep/2);g.add(mesh(THREE,r,'structure',LOOK.house));
    const skylight=q.planDome?new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2):new THREE.CylinderGeometry(1,1,.32,12,1,false,0,Math.PI*2);skylight.rotateX(Math.PI/2);skylight.scale(q.b*.20,q.b*.20,q.planDome?1.05:1);skylight.translate(-q.l*.04,0,q.h+q.roofStep+.16);g.add(mesh(THREE,skylight,'structure','#647b80'));}
  compactPlanMeshes(THREE,g);
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
