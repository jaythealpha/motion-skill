import * as THREE from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';

// 767-200 envelope from Boeing airport-planning dimensions. All section contours,
// panel lines and engine details below are illustrative, not surveyed aircraft CAD.
function fuselageMap(){
 const c=document.createElement('canvas');c.width=512;c.height=1024;const a=c.getContext('2d');
 const g=a.createLinearGradient(0,0,512,0);for(const[p,col]of[[0,'#eff1ed'],[.22,'#e4e7e4'],[.36,'#a5afb4'],[.5,'#a1adb6'],[.64,'#a5afb4'],[.78,'#e4e7e4'],[1,'#eff1ed']])g.addColorStop(p,col);a.fillStyle=g;a.fillRect(0,0,512,1024);
 for(let y=100;y<970;y+=34){a.fillStyle='rgba(57,73,86,.12)';a.fillRect(0,y,512,1);}
 for(const side of[.25,.75]){
  const x=side*512;
  for(let y=-15;y<17;y+=.89){const py=(1-(y+24.25)/48.5)*1024;a.fillStyle='#9caeb5';a.beginPath();a.roundRect(x-5,py-4,10,9,3);a.fill();a.fillStyle='#203441';a.beginPath();a.roundRect(x-3,py-3,6,6,2);a.fill();a.fillStyle='rgba(217,236,244,.7)';a.fillRect(x-2,py-2,1,4);}
  for(const y of[-16,13.8]){const py=(1-(y+24.25)/48.5)*1024;a.strokeStyle='#8d9da2';a.lineWidth=1;a.beginPath();a.roundRect(x-10,py-21,20,42,4);a.stroke();a.fillStyle='#364e58';a.fillRect(x+3,py+4,5,2);}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function merged(root){
 const buckets=new Map();for(const q of [...root.children]){if(!q.isMesh)continue;q.updateMatrix();const geo=(q.geometry.index?q.geometry.toNonIndexed():q.geometry.clone()).applyMatrix4(q.matrix),list=buckets.get(q.material)||[];list.push(geo);buckets.set(q.material,list);root.remove(q);q.geometry.dispose();}
 for(const[mat,geos]of buckets){const g=new THREE.BufferGeometry();for(const key of['position','normal','uv']){const size=key==='uv'?2:3,total=geos.reduce((n,q)=>n+q.attributes.position.count*size,0),a=new Float32Array(total);let off=0;for(const q of geos){const src=q.attributes[key]?.array;if(src)a.set(src,off);off+=q.attributes.position.count*size;}g.setAttribute(key,new THREE.BufferAttribute(a,size));}g.computeBoundingSphere();const q=new THREE.Mesh(g,mat);q.castShadow=q.receiveShadow=true;root.add(q);geos.forEach(g=>g.dispose());}
}
function airfoil(side,tail=false){
 const rows=tail?[[1.7,-16.4,4.4,.55,.24],[4.8,-18.1,3.4,.85,.17],[9,-21,1.1,1.25,.05]]:[[2.1,4.4,12,-.35,.66],[8.9,.3,8.3,.1,.42],[16.4,-5.5,4,.85,.2],[23.785,-9.8,1.35,1.65,.055]];
 const p=[],idx=[],samples=20;
 for(const[x,lead,chord,z,thick]of rows)for(let j=0;j<=samples;j++){const angle=j/samples*Math.PI*2,u=(1-Math.cos(angle))*.5,section=Math.sin(angle)*(.75+.25*(1-u));p.push(side*x,lead-u*chord,z+section*thick);}
 for(let r=0;r<rows.length-1;r++)for(let j=0;j<samples;j++){const a=r*(samples+1)+j,b=a+samples+1;idx.push(a,a+1,b,b,a+1,b+1);}
 for(const r of[0,rows.length-1])for(let j=1;j<samples-1;j++){const base=r*(samples+1);idx.push(base,base+j,base+j+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
export function aircraft(){
 const g=new THREE.Group(),paint=surfaceMaterial({color:'#f2f2ed',map:fuselageMap(),roughness:.3,metalness:.28,side:THREE.DoubleSide}),skin=surfaceMaterial({color:'#cdd3d3',metalness:.7,roughness:.3,side:THREE.DoubleSide}),dark=surfaceMaterial({color:'#15212a',metalness:.25,roughness:.55,side:THREE.DoubleSide}),glass=surfaceMaterial({color:'#223b4c',metalness:.65,roughness:.16,side:THREE.DoubleSide});
 const add=(geo,m,x=0,y=0,z=0)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);g.add(q);return q;};
 const rings=[[-24.25,.025],[-23.4,.36],[-21.8,.85],[-19.3,1.55],[-17,2.1],[-13,2.5],[13.2,2.5],[17.4,2.4],[19.4,2.05],[21,1.5],[22.3,.9],[23.5,.38],[24.25,.025]].map(([y,r])=>new THREE.Vector2(r,y));
 add(new THREE.LatheGeometry(rings,48),paint);
 for(const side of[-1,1]){
  add(airfoil(side),skin);add(airfoil(side,true),skin);
  const x=side*8.9,y=.6,z=-2.8;
  const shell=[[-2.8,.62],[-2.5,.92],[-1.4,1.22],[1.7,1.43],[2.5,1.36],[2.72,1.2],[2.52,1.06],[1.7,.99]].map(([y,r])=>new THREE.Vector2(r,y));add(new THREE.LatheGeometry(shell,40),skin,x,y,z);
  const fan=add(new THREE.CircleGeometry(1.02,32),dark,x,y+1.74,z);fan.rotation.x=-Math.PI/2;
  for(let i=0;i<20;i++){const a=i*Math.PI/10,r=.58;const q=add(new THREE.BoxGeometry(.065,.18,.92),skin,x+Math.sin(a)*r,y+1.77,z+Math.cos(a)*r);q.rotation.y=a+.4;}
  const cone=add(new THREE.ConeGeometry(.29,.65,24),skin,x,y+1.9,z);cone.rotation.x=Math.PI;
  const exhaust=add(new THREE.CircleGeometry(.6,24),dark,x,y-2.81,z);exhaust.rotation.x=Math.PI/2;
  const pylon=add(new THREE.BoxGeometry(.55,4.8,1.8),skin,x,y-.2,z+1.25);pylon.rotation.x=-.12;
  // Control-surface gaps remain thin; they are merged, not separate draw calls.
  for(const[x0,y0,len]of[[6,-7,5],[12,-9.6,5],[18,-11,4]]){const q=add(new THREE.BoxGeometry(len,.045,.025),dark,side*x0,y0,.3+(x0/24));q.rotation.z=-side*.22;}
  const pp=[side*.25,21.6,1.23,side*1.48,20.6,1.24,side*1.6,19.55,1.53,side*.28,20.1,1.87];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();add(geo,glass);
 }
 const fin=new THREE.Shape();fin.moveTo(-20.8,.65);fin.lineTo(-23.2,7.8);fin.lineTo(-19.4,8.15);fin.lineTo(-12.9,.65);fin.closePath();const f=add(new THREE.ExtrudeGeometry(fin,{depth:.32,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:1}),skin);f.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(1,0,0)));f.position.x=-.16;
 merged(g);g.userData.detail={envelope:'767-200 reference',length:48.5,span:47.57,estimatedContours:true,mergedBatches:g.children.length};return g;
}
