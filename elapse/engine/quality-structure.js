import {createFracture} from './quality-fracture.js';
import * as THREE from 'three';
import {halfBreadthAt,deckHeightAt} from './geom.js';
import {damagedHull} from './quality-form.js';
// Detail asset tier: repeated metalwork is instanced; individual dimensions remain estimates.
export function createQualityStructure({items,finish,mobile}){
 const switches=[],groups=[],metal=finish('#555c48'),dark=finish('#292e26'),brass=finish('#716043'),up=new THREE.Vector3(0,1,0);
 const cylinder=new THREE.CylinderGeometry(1,1,1,mobile?6:10),matrix=new THREE.Matrix4(),quat=new THREE.Quaternion();
 function rods(g,segments,mat=metal){if(!segments.length)return;const mesh=new THREE.InstancedMesh(cylinder,mat,segments.length);segments.forEach(([a,b,r=.06],i)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);quat.setFromUnitVectors(up,v.clone().normalize());matrix.compose(A.add(B).multiplyScalar(.5),quat,new THREE.Vector3(r,v.length(),r));mesh.setMatrixAt(i,matrix);});g.add(mesh);}
 function box(g,x,y,z,l,b,h,mat=metal){const m=new THREE.Mesh(new THREE.BoxGeometry(l,b,h),mat);m.position.set(x,y,z);g.add(m);return m;}
 function wheel(g,x,y,z,r=.4){const m=new THREE.Mesh(new THREE.TorusGeometry(r,.055,6,mobile?16:28),brass);m.position.set(x,y,z);m.rotation.x=Math.PI/2;g.add(m);return m;}
 for(const it of items){
  if(!['hull-main','hull-bow','officers'].includes(it.p.id))continue;
  const g=new THREE.Group();g.name='quality-estimated-structures';it.g.add(g);groups.push(g);const p=it.p.params;
  if(it.p.template==='hull'){
   const skin=it.meshes.find(m=>m.userData.role==='hull');if(skin){const orig=skin.geometry,raw=damagedHull(orig.attributes.position.array,orig.index.array,{id:it.p.id,depth:p.depth}),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(raw.positions,3));geo.setIndex(new THREE.BufferAttribute(raw.indices,1));if(orig.attributes.color)geo.setAttribute('color',orig.attributes.color.clone());geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();const keep=[];for(let i=0;i<raw.indices.length;i+=3){const tri=[raw.indices[i],raw.indices[i+1],raw.indices[i+2]],centre=tri.reduce((a,j)=>a.map((v,k)=>v+raw.positions[j*3+k]/3),[0,0,0]);if(it.p.id==='hull-main'&&centre[0]>91.25-16+2.4*Math.sin(centre[2]*.6)+Math.sin(centre[1]*.7)&&centre[1]>1.6+.4*Math.sin(centre[2])&&centre[2]>2&&centre[2]<p.depth-1.9)continue;keep.push(...tri);}const section=geo.clone();section.setIndex(keep);section.computeVertexNormals();switches.push({mesh:skin,original:orig,damaged:geo,section});}
   createFracture(g,p,it.p.id,finish,mobile);
   if(it.p.id==='hull-bow'){
    for(const [x,y] of [[113,-2.8],[113,2.8],[123,0]]){const z=deckHeightAt(p,x)+.35;box(g,x,y,z,2.2,1.8,.45);rods(g,[[[x,y,z],[x,y,z+1.1],.32]],dark);wheel(g,x,y,z+1.2,.55);}
    // Twin anchor-chain runs across the foredeck: grouped repeated links, not source-exact count.
    const links=[],count=mobile?34:68;for(const side of [-1,1])for(let i=0;i<count;i++){const x=110+i*18/count;links.push([x,side*2.5,deckHeightAt(p,x)+.28,i%2]);}
    const chain=new THREE.InstancedMesh(new THREE.TorusGeometry(.18,.055,5,10),dark,links.length);links.forEach(([x,y,z,v],i)=>{quat.setFromEuler(new THREE.Euler(v*Math.PI/2,0,0));matrix.compose(new THREE.Vector3(x,y,z),quat,new THREE.Vector3(1.45,1,1));chain.setMatrixAt(i,matrix);});g.add(chain);
   }
   if(it.p.id==='hull-main'){
    // Three screws: expedition account gives 23.9ft wing /16.6ft centre; exact pitch and location estimated.
    for(const [x,y,z,r,n] of [[-126,-7.3,4.6,23.9*.3048/2,3],[-126,7.3,4.6,23.9*.3048/2,3],[-132,0,4.4,16.6*.3048/2,4]]){
      rods(g,[[[x+22,y,z],[x-1,y,z],.3]],dark);
      const hub=new THREE.Mesh(new THREE.CylinderGeometry(.48,.35,1.5,16),brass);hub.rotation.z=Math.PI/2;hub.position.set(x,y,z);g.add(hub);
      for(let blade=0;blade<n;blade++){const shape=new THREE.Shape();shape.moveTo(.25,-.3);shape.bezierCurveTo(r*.6,-r*.55,r*1.05,-r*.15,r*.94,r*.22);shape.bezierCurveTo(r*.85,r*.65,r*.42,r*.55,.25,.3);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.035,bevelThickness:.035}),m=new THREE.Mesh(geo,brass),group=new THREE.Group();m.rotation.y=Math.PI/2;group.add(m);group.rotation.x=blade*Math.PI*2/n;group.position.set(x,y,z);g.add(group);}
    }
    const rudder=box(g,-132.8,0,7.6,.45,1,7,dark);rudder.rotation.z=.1;

    // Separate structural cutaway on the exposed shell near the bow. Only enabled by explicit cutaway.
    for(const sw of switches)if(sw.mesh===skin)sw.part=it.p.id;
   }
  }else{
   // Source-observed types: bridge telegraphs and exposed telemotor, with estimated placement.
   for(const [x,y] of [[3,-2.8],[3,-.8],[3,1.3],[3,3.3]]){rods(g,[[[x,y,.15],[x,y,1.25],.12]],brass);const dial=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.18,20),brass);dial.rotation.x=Math.PI/2;dial.position.set(x,y,1.25);g.add(dial);rods(g,[[[x,y-.15,1.2],[x+.4,y-.15,1.7],.045]]);}
   rods(g,[[[-1.8,0,.2],[-1.8,0,1.3],.14]],brass);wheel(g,-1.8,0,1.5,.45);
   // Estimated roof removal is an inspection cutaway, never labelled as observed collapse.
   for(const mesh of it.meshes){if(!mesh.isMesh||!mesh.geometry.attributes.position)continue;const orig=mesh.geometry,pos=orig.attributes.position,idx=orig.index?.array||Uint32Array.from({length:pos.count},(_,i)=>i),keep=[];for(let i=0;i<idx.length;i+=3){const tri=[idx[i],idx[i+1],idx[i+2]],isRoof=tri.every(j=>pos.getZ(j)>p.h-.12);if(!isRoof)keep.push(...tri);}if(keep.length<idx.length){const cut=orig.clone();cut.setIndex(keep);switches.push({mesh,original:orig,cutaway:cut});}}
  }
 }
 return {update(active,cutaway){groups.forEach(g=>g.visible=active);for(const s of switches)s.mesh.geometry=active?(cutaway&&s.section?s.section:s.damaged||(cutaway?s.cutaway:s.original)):s.original;},stats:{groups:groups.length,geometryVariants:switches.length}};
}
