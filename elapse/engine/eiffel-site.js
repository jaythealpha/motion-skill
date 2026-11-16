import * as THREE from 'three';
import {halfWidth} from './eiffel-form.js';
// Construction-site context for the 1887–1889 Eiffel study. Model coordinates (z up, metres).
// SOURCED (SETE history, checked 2026-11-16): twelve 30 m and four 40 m temporary wooden scaffolds for the first level;
// small steam cranes mounted on the tower that climbed on the future elevator runners; parts prefabricated at
// Levallois-Perret in sections about 5 m long; watertight metal caissons with compressed air on the Seine side.
// ESTIMATED: every position, count of stacked sections, caisson shape, crane form and timber dimension below.
// No people are depicted.
const legWidth=z=>25+(6-25)*Math.min(1,z/115);
const box=(rows,geometry,material)=>{const m=new THREE.InstancedMesh(geometry,material,rows.length),o=new THREE.Object3D();rows.forEach(([x,y,z,sx,sy,sz,rz=0],i)=>{o.position.set(x,y,z);o.rotation.set(0,0,rz);o.scale.set(sx,sy,sz);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.computeBoundingSphere();return m;};
// Ledgers, decks and sole plates for the scaffold towers already in eiffel-form.js (same centres and heights).
export function scaffoldDressing(group,material){
 const unit=new THREE.BoxGeometry(1,1,1),rows=[],towers=[];
 for(const a of [-1,1])for(const b of [-1,1])for(const u of [-1,0,1])towers.push([a*(32+u*7),b*32,1.4,30]);
 for(const x of [-14,14])for(const y of [-14,14])towers.push([x,y,2,40]);
 for(const [x,y,r,H] of towers){
  for(let z=2.5;z<H;z+=2.5)for(const s of [-1,1]){rows.push([x,y+s*r,z,2*r+.3,.16,.16],[x+s*r,y,z,.16,2*r+.3,.16]);}
  for(let k=-2;k<=2;k++)rows.push([x+k*r*.42,y,H+.12,r*.38,2*r+1.2,.08]);
  for(const s of [-1,1])rows.push([x,y+s*r,.15,2*r+1.6,.5,.3]);
 }
 group.add(box(rows,unit,material));return towers.length;
}
// Steam creeper cranes: estimated form. They ride the leg centre line (future elevator runner) below the
// second level and the shaft above it. Returns chimney emitters for the steam puffs.
export function createCranes(material,dark){
 const cranes=new THREE.Group(),emitters=[],unit=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(.5,.5,1,12);cyl.rotateX(Math.PI/2);
 for(const sign of [-1,1]){const g=new THREE.Group();g.userData.sign=sign;
  g.add(box([[0,0,.25,5,4,.5],[-1.6,1.4,.7,.25,.25,1],[1.6,1.4,.7,.25,.25,1],[-1.6,-1.4,.7,.25,.25,1],[1.6,-1.4,.7,.25,.25,1]],unit,material));
  const boiler=new THREE.Mesh(cyl,dark);boiler.scale.set(1.5,1.5,2.4);boiler.position.set(-1.2,0,1.7);g.add(boiler);
  const stack=new THREE.Mesh(cyl,dark);stack.scale.set(.35,.35,2.2);stack.position.set(-1.2,0,4);g.add(stack);
  const mast=new THREE.Mesh(unit,material);mast.scale.set(.45,.45,7);mast.position.set(1,0,4);g.add(mast);
  const jib=new THREE.Mesh(unit,material);jib.scale.set(9,.35,.35);jib.position.set(4.6,0,7.6);jib.rotation.y=-.32;g.add(jib);
  const rope=new THREE.Mesh(cyl,dark);rope.scale.set(.06,.06,6);rope.position.set(8.6,0,6.2);g.add(rope);
  const load=new THREE.Mesh(unit,material);load.scale.set(4.8,.45,.6);load.position.set(8.6,0,3.1);g.add(load);
  g.userData.stack=new THREE.Vector3(-1.2,0,5.2);cranes.add(g);emitters.push(new THREE.Vector3());}
 function place(height){const h=Math.max(6,height),z=Math.min(276,h);cranes.children.forEach((g,i)=>{const s=g.userData.sign,c=h<115?halfWidth(z)-legWidth(z)/2:halfWidth(z)*.55;g.position.set(s*c,s*c,h);g.rotation.z=s>0?Math.PI*1.25:Math.PI*.25;g.updateMatrixWorld();emitters[i].copy(g.userData.stack).applyMatrix4(g.matrix);});}
 return {group:cranes,emitters,place};
}
// Prefabricated ~5 m sections waiting near the +y (Seine-side, illustrative) haul path. Counts/positions estimated.
export function sectionStock(material){
 const shape=new THREE.Shape(),o=[[-.5,-.5],[.5,-.5],[.5,-.32],[.1,-.32],[.1,.32],[.5,.32],[.5,.5],[-.5,.5],[-.5,.32],[-.1,.32],[-.1,-.32],[-.5,-.32]];o.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 const g=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);g.rotateY(Math.PI/2);
 const rows=[];let k=0;for(const [cx,cy,rz] of [[-26,96,.08],[27,101,-.05],[-6,128,.02],[38,72,1.52]])for(let layer=0;layer<3;layer++)for(let j=0;j<6-layer;j++){k++;rows.push([cx+(j-(5-layer)/2)*.95,cy+((k*37)%7-3)*.08,-5.75+layer*.62,5,.6,.6,rz+((k*13)%5-2)*.01]);}
 const stock=new THREE.Group();stock.add(box(rows,g,material));
 const bearers=[];for(const [cx,cy,rz] of [[-26,96,.08],[27,101,-.05],[-6,128,.02],[38,72,1.52]])for(const s of [-1.6,1.6])bearers.push([cx+Math.sin(rz)*s,cy+Math.cos(rz)*s,-6.05,6.2,.4,.3,rz]);
 stock.add(box(bearers,new THREE.BoxGeometry(1,1,1),material.userData.timber||material));return stock;
}
// Seine-side compressed-air caissons around the +y pillar foundation blocks (shape/count estimated).
export function caissons(steel,dark){
 const g=new THREE.Group(),unit=new THREE.BoxGeometry(1,1,1),cyl=new THREE.CylinderGeometry(.9,.9,1,14);cyl.rotateX(Math.PI/2);const rows=[],lips=[];
 for(const sx of [-1,1])for(const dx of [-9,9])for(const dy of [-9,9]){const x=sx*50+dx,y=50+dy;rows.push([x,y,-6.6,9,9,3.4]);lips.push([x,y,-4.8,9.6,9.6,.3]);
  const shaft=new THREE.Mesh(cyl,dark);shaft.scale.set(1,1,9);shaft.position.set(x+2.6,y-2.6,-.5);g.add(shaft);const lock=new THREE.Mesh(cyl,steel);lock.scale.set(1.9,1.9,2.2);lock.position.set(x+2.6,y-2.6,4.6);g.add(lock);}
 g.add(box(rows,unit,steel),box(lips,unit,dark));return g;
}
