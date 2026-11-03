import * as THREE from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';
import {boxInstances} from './quality-surfaces.js';

// An irregular opening with real depth, authored within the existing impact zone.
// This contour and its internal fragments are illustrative, not a damage survey.
export function impactOpening(parent,{height=415,z=300,sign=-1,half=31.5}={}){
 const swaps=[],interior=new THREE.Group();parent.add(interior);
 const contour=[[-21,-1],[-17,3],[-10,4],[-4,10],[0,11],[5,6],[13,2],[21,-1],[17,-4],[7,-3],[1,-6],[-6,-3],[-16,-5]];
 const shape=new THREE.Shape();shape.moveTo(-half,0);shape.lineTo(half,0);shape.lineTo(half,height);shape.lineTo(-half,height);shape.closePath();
 const hole=new THREE.Path();contour.forEach(([x,y],i)=>i?hole.lineTo(x,z+y):hole.moveTo(x,z+y));hole.closePath();shape.holes.push(hole);
 const front=new THREE.ShapeGeometry(shape),pp=front.attributes.position,uv=front.attributes.uv;
 for(let i=0;i<pp.count;i++){const x=pp.getX(i),zz=pp.getY(i);uv.setXY(i,(x+half)/(half*2),zz/height);pp.setXYZ(i,x,sign*half,zz);}
 if(sign>0){const ix=front.index;for(let i=0;i<ix.count;i+=3){const a=ix.getX(i);ix.setX(i,ix.getX(i+2));ix.setX(i+2,a);}}
 front.computeVertexNormals();
 for(const mesh of [...parent.children]){
  if(!mesh.isMesh||!mesh.material?.map?.userData.towerFacade)continue;
  mesh.updateMatrix();const original=mesh.geometry,geo=(original.index?original.toNonIndexed():original.clone()).applyMatrix4(mesh.matrix),p=geo.attributes.position,n=geo.attributes.normal;
  const arrays={position:[],normal:[],uv:[]};
  for(let i=0;i<p.count;i+=3){if(n.getY(i)*sign>.9)continue;for(const key of Object.keys(arrays)){const a=geo.attributes[key],size=key==='uv'?2:3;for(let j=i;j<i+3;j++)for(let k=0;k<size;k++)arrays[key].push(a?a.array[j*size+k]:0);}}
  const f=front.toNonIndexed();for(const key of Object.keys(arrays))arrays[key].push(...f.attributes[key].array);
  const result=new THREE.BufferGeometry();for(const[key,a]of Object.entries(arrays))result.setAttribute(key,new THREE.Float32BufferAttribute(a,key==='uv'?2:3));result.applyMatrix4(mesh.matrix.clone().invert());result.computeBoundingSphere();swaps.push({mesh,original,result});geo.dispose();f.dispose();
 }
 front.dispose();
 const dark=surfaceMaterial({color:'#252b2d',roughness:.95,side:THREE.DoubleSide}),steel=surfaceMaterial({color:'#777d7d',metalness:.55,roughness:.65});
 dark.clippingPlanes=steel.clippingPlanes=swaps[0]?.mesh.material.clippingPlanes||[];
 const floors=[],beams=[];for(const dz of[-3,1,5])floors.push([0,sign*(half-4),z+dz,36,8,.25]);
 for(let i=-18;i<=18;i+=3){const dip=Math.sin(i*.7)*1.2;beams.push([i,sign*(half-.5),z-4+dip,.3,1.8,2.5,i*.01],[i,sign*(half-1),z+5+dip,.3,2.4,2.2,-i*.008]);}
 const behind=new THREE.Mesh(new THREE.PlaneGeometry(44,20),dark);behind.rotation.x=Math.PI/2;behind.position.set(0,sign*(half-8),z+1);interior.add(behind);boxInstances(interior,floors,dark);boxInstances(interior,beams,steel);
 let active;
 return {set(on){if(active===on)return;active=on;for(const s of swaps)s.mesh.geometry=on?s.result:s.original;interior.visible=on;},stats:{openingMeshes:swaps.length,estimatedContour:true}};
}
