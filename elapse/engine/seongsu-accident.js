import * as T from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';
import {finishMaterial} from '../shared/surface-finish.js';
import {boxInstances} from './quality-surfaces.js';
import {busPose,accidentCarPose} from './seongsu-accident-motion.js';
export function seongsuAccident(root,fleet){
 const group=new T.Group();group.name='recorded-vehicle-event-estimated-geometry';root.add(group);const bus=new T.Group(),body=new T.Group();group.add(bus);bus.add(body);body.position.x=-3.2;
 const materials=[],mat=(color,o={})=>{const m=surfaceMaterial({color,roughness:.5,...o});finishMaterial(m,o.metalness?'metal':'stone');m.userData.originalColor=new T.Color(color);m.userData.baseMetalness=m.metalness??0;materials.push(m);return m;};
 const paint=mat('#c4c1ab',{metalness:.25}),band=mat('#486f70',{metalness:.25}),glass=mat('#30454c',{metalness:.4,roughness:.19}),metal=mat('#939c96',{metalness:.7,roughness:.3}),black=mat('#272f31'),light=mat('#dcd4ad');
 const cream=[[0,0,.92,10.7,2.45,1.03],[0,0,3.03,10.9,2.51,.18],[-5.36,0,1.95,.15,2.45,1.2],[5.36,0,1.9,.15,2.45,.22]],windows=[],frames=[],trim=[],dark=[],lamps=[];
 for(const side of[-1,1]){for(let i=0;i<9;i++){const x=-4.8+i*1.15;windows.push([x,side*1.235,2.23,1.06,.055,1.19]);frames.push([x-.55,side*1.27,2.24,.045,.08,1.28],[x,side*1.27,2.34,1.1,.08,.035]);cream.push([x-.57,side*1.22,2.22,.07,.1,1.45]);}trim.push([0,side*1.26,1.51,10.7,.08,.10],[0,side*1.27,.69,10.6,.06,.05]);for(let i=0;i<20;i++)dark.push([-4.8+i*.18,side*1.27,1.01,.035,.025,.34]);}
 windows.push([5.45,0,2.2,.055,2.18,1.13],[-5.46,0,2.22,.055,2.13,1.10]);frames.push([5.49,0,2.21,.06,.06,1.19]);for(const x of[-5.48,5.48]){trim.push([x,0,.65,.16,2.40,.20]);dark.push([x,0,1.0,.055,.94,.36]);for(const side of[-1,1])lamps.push([x,side*.9,1.03,.07,.30,.17]);}
 // Seams, wipers, mirrors and two door openings; no occupants are modelled.
 for(const x of[1.4,4.6]){windows.push([x,-1.265,1.8,.72,.045,1.88]);frames.push([x-.4,-1.30,1.8,.055,.08,1.98],[x+.4,-1.30,1.8,.055,.08,1.98],[x,-1.31,1.8,.035,.08,1.94]);}
 for(const side of[-1,1]){frames.push([5.12,side*1.5,2.45,.1,.65,.08],[5.12,side*1.79,2.24,.23,.09,.38]);for(let i=0;i<8;i++)trim.push([-4.6+i*1.2,side*1.27,.92,.025,.018,.65]);}
 dark.push([5.51,-.5,1.91,.03,.8,.025],[5.51,.5,1.91,.03,.8,.025]);
 boxInstances(body,cream,paint);boxInstances(body,[[0,-1.249,1.25,10.7,.05,.24],[0,1.249,1.25,10.7,.05,.24]],band);boxInstances(body,windows,glass);boxInstances(body,frames,metal);boxInstances(body,trim,metal);boxInstances(body,dark,black);boxInstances(body,lamps,light);
 const tire=new T.InstancedMesh(fleet.tireGeometry,black,4),hubs=new T.InstancedMesh(fleet.hubGeometry,metal,4),d=new T.Object3D();body.add(tire,hubs);for(let i=0;i<4;i++){d.position.set(i<2?-3.2:3.2,i%2?-1.15:1.15,.43);d.rotation.set(0,0,0);d.scale.setScalar(1.38);d.updateMatrix();tire.setMatrixAt(i,d.matrix);hubs.setMatrixAt(i,d.matrix);}
 const c=document.createElement('canvas');c.width=128;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#263a3b';ctx.fillRect(0,0,128,64);ctx.fillStyle='#e1e0c9';ctx.font='bold 52px sans-serif';ctx.textAlign='center';ctx.fillText('16',64,51);const label=new T.Mesh(new T.PlaneGeometry(.8,.38),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}));label.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)));label.position.set(5.47,0,2.84);body.add(label);
 // Reuse original sedan/van geometry; five vehicles, not five new vehicle identities.
 const carBatches=[];for(let kind=0;kind<2;kind++){const ids=kind?[0]:[1,2,3,4],template=fleet.templates[kind];const meshes=template.batches.map((b,k)=>{const m=b.material.clone();m.userData={...b.material.userData};materials.push(m);const q=new T.InstancedMesh(b.geometry,m,ids.length);q.frustumCulled=false;q.castShadow=true;q.receiveShadow=true;group.add(q);if(k===0)ids.forEach((id,i)=>q.setColorAt(i,new T.Color(['#d5d2bf','#9faaa6','#5d6b73','#a5a196','#6f7e84'][id])));return q;});carBatches.push({ids,meshes});}
 const carTires=new T.InstancedMesh(fleet.tireGeometry,black,20),carHubs=new T.InstancedMesh(fleet.hubGeometry,metal,20);group.add(carTires,carHubs);const parent=new T.Matrix4(),wheel=new T.Object3D(),combined=new T.Matrix4();let last;
 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 function apply(t){last=busPose(t);group.visible=last.visible;if(!last.visible)return;bus.position.set(last.x,last.y,last.z);bus.rotation.y=last.pitch;body.scale.z=last.compression;
  // A crumpled roof stays above the fallen deck: retain a contact origin as the roof compresses.
  if(t>=44)bus.position.z=.18+3.12*last.compression;
  for(const{ids,meshes}of carBatches)ids.forEach((id,i)=>{const q=accidentCarPose(t,id);d.position.set(q.x,q.y,q.z);d.rotation.set(q.rx,q.ry,q.yaw);d.scale.set(1,1,1);d.updateMatrix();parent.copy(d.matrix);for(const m of meshes)m.setMatrixAt(i,parent);for(let j=0;j<4;j++){wheel.position.set(j<2?-1.42:1.38,j%2?-.85:.85,.31);wheel.rotation.set(0,0,0);wheel.scale.set(1,1,1);wheel.updateMatrix();combined.multiplyMatrices(parent,wheel.matrix);carTires.setMatrixAt(id*4+j,combined);carHubs.setMatrixAt(id*4+j,combined);}});for(const b of carBatches)for(const m of b.meshes)m.instanceMatrix.needsUpdate=true;carTires.instanceMatrix.needsUpdate=carHubs.instanceMatrix.needsUpdate=true;
 }
 return{apply,materials,group,bus,info:()=>({bus:last,vehicles:6,recordedBusRoute:'16',geometryEstimated:true})};
}
