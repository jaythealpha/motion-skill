import{surfaceMaterial}from'../shared/material-budget.js';
import * as THREE from 'three';
import {boxInstances} from './quality-surfaces.js';
// Shapes and coordinates are independent illustrative estimates within the existing model.
export function towerFacade(parent,h,material){const rows=[],step=1.016;for(const side of [-1,1])for(let i=0;i<59;i++){const k=(i-29)*step;rows.push([k,side*31.8,h/2,.36,.3,h],[side*31.8,k,h/2,.3,.36,h]);}const m=boxInstances(parent,rows,material);m.userData.facadeRibs=true;return m;}
export function wtcDetail(form){
 for(const tw of form.towers){towerFacade(tw.body,tw.height,tw.clips[0]);towerFacade(tw.top,tw.topHeight,tw.top.children.find(o=>o.isMesh)?.material||tw.clips[0]);}
 const mat=surfaceMaterial({color:'#716f65',roughness:.95}),steel=surfaceMaterial({color:'#646a69',roughness:.82,metalness:.3}),slabs=[],webs=[],flanges=[];
 mat.userData.color=mat.color.clone();steel.userData.color=steel.color.clone();form.materials.push(mat,steel);
 for(let i=0;i<100;i++){const x=-112+(i*37%220),y=-85+(i*29%290),z=2+i%11,rz=i*1.37,l=4+i%10;slabs.push([x,y,z,l,2+i%4,.22,rz]);webs.push([x,y,z+.5,l,.14,.8,rz]);flanges.push([x,y,z+.1,l,.65,.12,rz],[x,y,z+.9,l,.65,.12,rz]);}boxInstances(form.groups.rubble,slabs,mat);boxInstances(form.groups.rubble,webs,steel);boxInstances(form.groups.rubble,flanges,steel);
 // Estimated podium/rooftop service detailing, attached to the dated building groups.
 for(const b of form.newBuildings){const rows=[];for(let i=0;i<8;i++)rows.push([-18+i*5,10,b.height-2,3,6,3]);boxInstances(b.g,rows,b.clips[0]);}
}
export function cathedralDetail(form){
 const {groups:g,mats}=form,stones=[],lead=[],joinery=[];
 // Recessed arch surrounds/cornice blocks are attached only to surviving masonry.
 for(const side of [-1,1])for(let bay=0;bay<12;bay++){const x=-43+bay*7.5;for(const sign of[-1,1])for(let j=0;j<=5;j++){const t=j/5,xx=x+sign*((1-t)**2*2+2*(1-t)*t*1.8+.16),z=22+(1-t)**2*4.4+2*(1-t)*t*6.56+t*t*8;stones.push([xx,side>0?7.78:-8.85,z,.42,.45,.48]);}for(const z of[16.5,21,33.7])for(let k=0;k<5;k++)stones.push([x-3+k*1.5,side*8,z+.22,.52,.7,.3]);}
 boxInstances(g.stone,stones,mats.trim);
 // Roof panel seam ribs follow each dated roof panel: no ribs float over the fire-loss state.
 for(const panel of form.roofs){if(panel.geometry?.type!=='ExtrudeGeometry')continue;panel.geometry.computeBoundingBox();const b=panel.geometry.boundingBox,half=(b.max.x-b.min.x)/2,base=b.min.y,rise=b.max.y-base,L=b.max.z-b.min.z;if(half<1||rise<1)continue;const rows=[];for(let x=-half+.6;x<half;x+=1.2)rows.push([x,base+rise*(1-Math.abs(x)/half)+.025,(b.min.z+b.max.z)/2,.025,.04,L]);boxInstances(panel,rows,mats.lead);}
 // Small joint collars on rebuilt timber members are interpretive, not a historic bolt inventory.
 for(const timber of form.newTimbers.slice(0,100)){const mesh=timber.isMesh?timber:null;if(!mesh)continue;mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;const collar=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.18),mats.dark);collar.position.set(0,b.max.y-.12,0);mesh.add(collar);}
}
export function eiffelDetail(groups,beams,material){
 const shape=new THREE.Shape(),outline=[[-.5,-.5],[.5,-.5],[.5,-.32],[.1,-.32],[.1,.32],[.5,.32],[.5,.5],[-.5,.5],[-.5,.32],[-.1,.32],[-.1,-.32],[-.5,-.32]];outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const profile=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false});profile.rotateX(-Math.PI/2);profile.translate(0,-.5,0);for(const [kind,g]of groups)if(kind!=='scaffold')for(const q of g.children)if(q.isInstancedMesh)q.geometry=profile;

 const ends=new Map();for(const beam of beams){if(!ends.has(beam.group))ends.set(beam.group,[]);const list=ends.get(beam.group);for(const p of [beam.a,beam.b])list.push([p[0],p[1],p[2],Math.max(.18,beam.w*1.6),Math.max(.18,beam.w*1.6),.11]);}
 for(const [kind,rows]of ends){const g=groups.get(kind);if(g)boxInstances(g,rows,material(kind,'#6b3e2c'));}
 for(const [kind,z,w]of [['first',57,70],['second',115,41],['crown',276,10]]){const rows=[],a=w/2;for(let p=-a;p<a;p+=1.4)for(const side of[-1,1])rows.push([p,side*a,z+.8,.07,.07,1.6],[side*a,p,z+.8,.07,.07,1.6]);for(const side of[-1,1])rows.push([0,side*a,z+1.5,w,.08,.08],[side*a,0,z+1.5,.08,w,.08]);boxInstances(groups.get(kind),rows,material(kind,'#7e4b35'));}
}

// Thin geometry aliases against the mapped facade when it spans fewer than a few pixels.
export function facadeLOD(parent,distance,canvasHeight,fov){
 const pitch=canvasHeight/(2*Math.tan(fov*Math.PI/360))*1.016/Math.max(1,distance);
 parent.traverse(q=>{if(!q.userData.facadeRibs)return;if(q.visible&&pitch<5)q.visible=false;else if(!q.visible&&pitch>6)q.visible=true;});
}
