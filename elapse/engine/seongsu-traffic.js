import * as T from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';
import {trafficPose,trafficAvailable} from './seongsu-traffic-motion.js';
// Original generic early-1990s silhouettes. No brand/model or accident vehicle is claimed.
export function seongsuTraffic(root){
 const g=new T.Group();g.name='illustrative-road-traffic';root.add(g);const materials=[],material=(color,o={})=>{const m=surfaceMaterial({color,roughness:.35,...o});m.userData.originalColor=new T.Color(color);m.userData.baseMetalness=m.metalness??0;materials.push(m);return m;};
 const paint=material('#ffffff',{metalness:.5}),glass=material('#304a55',{metalness:.48,roughness:.16}),trim=material('#b1b5ad',{metalness:.8,roughness:.25}),black=material('#23282a',{roughness:.86}),lamp=material('#dfd9bd'),red=material('#783326');
 function profile(points,width){const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,z):s.moveTo(x,z));s.closePath();const geo=new T.ExtrudeGeometry(s,{depth:width,bevelEnabled:false});geo.translate(0,0,-width/2);geo.rotateX(Math.PI/2);return geo;}
 function merge(rows){const p=[],n=[],uv=[];for(const {geo,matrix}of rows){const b=geo.index?geo.toNonIndexed():geo.clone();b.applyMatrix4(matrix);p.push(...b.attributes.position.array);n.push(...b.attributes.normal.array);uv.push(...(b.attributes.uv?.array||new Float32Array(b.attributes.position.count*2)));b.dispose();}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return geo;}
 const d=new T.Object3D(),I=new T.Matrix4(),box=new T.BoxGeometry(1,1,1),pieces=[];
 const add=(geo,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{d.position.set(x,y,z);d.scale.set(sx,sy,sz);d.rotation.set(rx,ry,rz);d.updateMatrix();pieces.push({geo,matrix:d.matrix.clone()});};
 const models=[];for(const van of[false,true]){
  const body=profile(van?[[-2.35,.42],[-2.35,1.65],[-1.9,1.92],[1.1,1.92],[1.85,1.22],[2.2,1.1],[2.2,.42]]:[[-2.25,.45],[-2.22,.98],[-1.25,1.02],[-.7,1.52],[.75,1.52],[1.35,1.0],[2.22,.88],[2.25,.45]],van?1.82:1.72);
  pieces.length=0;for(const side of[-1,1]){
   // Side windows are individual polygons; pillars and door joints remain paint/trim.
   const windows=van?[[[-1.88,1.12],[-1.88,1.72],[-.9,1.72],[-.9,1.12]],[[-.78,1.12],[-.78,1.72],[.2,1.72],[.2,1.12]],[[.32,1.12],[.32,1.72],[1.0,1.72],[1.56,1.12]]]:[[[-1.1,1.05],[-.62,1.43],[-.10,1.43],[-.10,1.05]],[[.02,1.05],[.02,1.43],[.68,1.43],[1.15,1.05]]];
   for(const pts of windows)add(profile(pts,.015),0,side*(van?.918:.868),0);
  }
  const windshield=van?[[1.12,1.94],[1.20,1.96],[1.94,1.25],[1.85,1.24]]:[[.79,1.53],[.85,1.55],[1.42,1.06],[1.34,1.04]];
  add(profile(windshield,van?1.61:1.48),0,0,0);if(!van)add(profile([[-1.30,1.08],[-1.22,1.08],[-.69,1.56],[-.76,1.55]],1.48),0,0,0);
  const glazing=merge(pieces);pieces.length=0;
  for(const side of[-1,1]){add(box,0,side*(van?.924:.878),.60,4.2,.035,.055);for(const x of[-.85,.60])add(box,x,side*(van?.927:.882),.88,.16,.045,.035);add(box,1.02,side*.98,1.03,.24,.23,.13);for(const x of[-.05,van?-1.6:-1.3])add(box,x,side*(van?.925:.879),.79,.018,.022,.35);}
  for(const x of[-2.22,2.22])add(box,x,0,.52,.16,1.68,.13);add(box,2.25,0,.74,.035,.70,.18);const fittings=merge(pieces);pieces.length=0;
  for(const side of[-1,1])add(box,2.25,side*.60,.79,.07,.42,.18);const headlights=merge(pieces);pieces.length=0;for(const side of[-1,1])add(box,-2.26,side*.60,.79,.06,.40,.17);const taillights=merge(pieces);pieces.length=0;
  add(box,-2.31,0,.73,.025,.35,.13);add(box,2.34,0,.55,.025,.35,.13);const plates=merge(pieces);pieces.length=0;
  const ids=Array.from({length:32},(_,i)=>i).filter(i=>(i%7===0)===van),batches=[];
  for(const[geo,m,tint]of[[body,paint,true],[glazing,glass],[fittings,trim],[headlights,lamp],[taillights,red],[plates,black]]){const mesh=new T.InstancedMesh(geo,m,ids.length);mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);if(tint){const palette=['#e0dacc','#74868b','#3c5366','#746f72','#aaaba3','#4a625c','#d6cead','#8a6d69'];ids.forEach((id,i)=>mesh.setColorAt(i,new T.Color(palette[id%palette.length])));}batches.push(mesh);}models.push({ids,batches});
 }
 const tireGeo=new T.CylinderGeometry(.31,.31,.21,14);const tire=new T.InstancedMesh(tireGeo,black,128),hubGeo=new T.CylinderGeometry(.18,.18,.225,10);const hubs=new T.InstancedMesh(hubGeo,trim,128);for(const q of[tire,hubs]){q.frustumCulled=false;q.castShadow=true;g.add(q);}
 const matrix=new T.Matrix4(),local=new T.Matrix4(),tmp=new T.Object3D();let clock=0,visible=false;
 function apply(t,seconds){clock=seconds;g.visible=visible=trafficAvailable(t);if(!visible)return;for(const{ids,batches}of models)ids.forEach((id,i)=>{const q=trafficPose(Math.floor(id/8),id%8,clock);d.position.set(q.x,q.y,q.z);d.scale.set(1,1,1);d.rotation.set(0,0,q.yaw);d.updateMatrix();matrix.copy(d.matrix);for(const b of batches)b.setMatrixAt(i,matrix);for(let w=0;w<4;w++){tmp.position.set(w<2?-1.42:1.38,w%2?-.85:.85,.31);tmp.scale.set(1,1,1);tmp.rotation.set(0,q.wheel,0);tmp.updateMatrix();local.multiplyMatrices(matrix,tmp.matrix);tire.setMatrixAt(id*4+w,local);hubs.setMatrixAt(id*4+w,local);}});for(const m of models)for(const b of m.batches)b.instanceMatrix.needsUpdate=true;tire.instanceMatrix.needsUpdate=hubs.instanceMatrix.needsUpdate=true;}
 return{apply,materials,group:g,info:()=>({vehicles:32,lanes:4,clock,visible,illustrative:true}),templates:models,tireGeometry:tireGeo,hubGeometry:hubGeo,tireMaterial:black,hubMaterial:trim,meshes:models.flatMap(x=>x.batches)};
}
