import{surfaceMaterial}from'../shared/material-budget.js';
import {createFracture} from './quality-fracture.js';
import * as THREE from 'three';
import {halfBreadthAt} from './geom.js';
import {enrichMaterial,qualityLighting,boxInstances} from './quality-surfaces.js';
// Titanic-specific open ends. Does not reuse Britannic's forward impact hinge or its equipment.
export function createTitanicQuality({renderer,scene,items}){
 const replacements=[],groups=[],skins=[];
 for(const it of items){
  for(const mesh of it.meshes){if(!mesh.isMesh||!mesh.userData.baseColor)continue;const mat=surfaceMaterial({color:mesh.userData.baseColor,vertexColors:!!mesh.userData.vertexColors,roughness:.92,metalness:.08,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});enrichMaterial(mat,['hull','deckhouse'].includes(it.p.template)?'rust':'metal');replacements.push({mesh,mat,it});}
  if(!['hull-bow','hull-stern'].includes(it.p.id))continue;
  const p=it.p.params,cut=it.p.id==='hull-bow'?p.range[0]:p.range[1],dir=it.p.id==='hull-bow'?1:-1,g=new THREE.Group();g.name='estimated-titanic-break-detail';it.g.add(g);groups.push(g);
  const steel=surfaceMaterial({color:'#55412e',roughness:1}),deck=surfaceMaterial({color:'#343630',roughness:1,side:THREE.DoubleSide});enrichMaterial(steel);enrichMaterial(deck);
  createFracture(g,p,it.p.id,(base)=>{const m=surfaceMaterial({color:base,roughness:.96,metalness:.08});enrichMaterial(m);return m;},innerWidth<640,{cut,dir,seed:it.p.id==='hull-bow'?191214:191215});
  const skin=it.meshes.find(m=>m.userData.role==='hull');if(skin){const orig=skin.geometry,pos=orig.attributes.position,indices=orig.index.array,keep=[];for(let k=0;k<indices.length;k+=3){const tri=[indices[k],indices[k+1],indices[k+2]],x=tri.reduce((v,i)=>v+pos.getX(i)/3,0),z=tri.reduce((v,i)=>v+pos.getZ(i)/3,0);if(Math.abs(x-cut)<5.4+.6*Math.sin(z*.8)&&z<p.depth-1.6)continue;keep.push(...tri);}const torn=orig.clone();torn.setIndex(keep);torn.computeVertexNormals();skins.push({mesh:skin,orig,torn});}
  // Torn sheet lips follow each section's cut, with independent approximate angular folds.
  const vertices=[];for(const side of[-1,1])for(let j=0;j<6;j++){const z=2+j*2.8,x=cut+dir*(2.6+.5*Math.sin(j)),y=side*halfBreadthAt(p,x,z);vertices.push(x,y,z,x+dir*2.1,y,z+.2,x,y+side*.8,z+1.7,x+dir*2.1,y,z+.2,x+dir*2.2,y,z+2,x,y+side*.8,z+1.7);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const lips=new THREE.Mesh(geo,deck);g.add(lips);
 }
 return {stats:{subject:'titanic',detailGroups:groups.length},update(st){const color=st.style==='color'&&!st.xray,broken=color&&st.t>=38;groups.forEach(g=>g.visible=broken);for(const s of skins)s.mesh.geometry=broken?s.torn:s.orig;for(const {mesh}of replacements)if(mesh.userData.edges)mesh.userData.edges.visible=!color;qualityLighting(renderer,scene,st);if(!color)return;for(const {mesh,mat,it}of replacements){if(mat.userData.qsAge)mat.userData.qsAge.value=st.t>=56?Math.min(1,(st.last.pieces.get(it.p.id)?.rust||0)*1.6):0;const old=mesh.userData.mats.color;mat.color.copy(old.color);mat.emissive.copy(old.emissive||new THREE.Color(0)).multiplyScalar(.2);mesh.material=mat;if(mesh.userData.edges)mesh.userData.edges.visible=false;}}};
}
