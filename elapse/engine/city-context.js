import{surfaceMaterial}from'../shared/material-budget.js';
import * as THREE from 'three';
import{uprightBox}from'./wtc-study-assets.js';
// Approximate contextual blocks, not a surveyed historic Manhattan model.
export function dressCity(context,material){
 const roof=surfaceMaterial({color:'#7d817c',roughness:.9});
 const originals=[...context.children],bodies=originals.filter((_,i)=>i%2===0),unit=new THREE.BoxGeometry(1,1,1),rows=[],facades=originals.map(q=>[q.position.x,q.position.y,q.position.z,q.geometry.parameters.width,q.geometry.parameters.height,q.geometry.parameters.depth]);
 for(const q of originals)context.remove(q);
 for(const[b,q]of bodies.entries()){const x=q.position.x,y=q.position.y,h=q.geometry.parameters.depth;
 for(let level=0;level<3;level++){const w=41-level*7,d=54-level*8,z=h+level*5;facades.push([x,y,z+2.5,w,d,5]);rows.push([x,y,z+5.1,w,d,.25]);}
 for(let j=0;j<4;j++)rows.push([x-10+j*6,y+8,h+17,4,9,3]);
 }
 for(let ix=-6;ix<=6;ix++)for(let iy=-6;iy<=6;iy++){const x=ix*210+35*Math.sin(ix*3.7+iy),y=iy*210+27*Math.cos(iy*4.1+ix);if(Math.abs(x)<550&&Math.abs(y)<560)continue;const h=35+Math.abs(Math.sin(ix*7.2+iy*13.4))*95;facades.push([x,y,h/2,55+Math.abs(ix%3)*12,62+Math.abs(iy%3)*11,h]);rows.push([x,y,h+1,45,50,2]);}
 const walls=new THREE.InstancedMesh(uprightBox(1,1,1),material,facades.length),matrix=new THREE.Matrix4();facades.forEach(([x,y,z,w,d,h],i)=>{matrix.makeScale(w,d,h);matrix.setPosition(x,y,z);walls.setMatrixAt(i,matrix)});walls.castShadow=walls.receiveShadow=true;walls.computeBoundingSphere();context.add(walls);
 const mesh=new THREE.InstancedMesh(unit,roof,rows.length),m=new THREE.Matrix4();rows.forEach(([x,y,z,w,d,h],i)=>{m.makeScale(w,d,h);m.setPosition(x,y,z);mesh.setMatrixAt(i,m)});mesh.castShadow=mesh.receiveShadow=true;mesh.computeBoundingSphere();context.add(mesh);
}
