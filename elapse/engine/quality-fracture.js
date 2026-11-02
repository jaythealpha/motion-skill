import * as THREE from 'three';
import {halfBreadthAt} from './geom.js';
import {rng} from './math.js';
// Independently authored visual interpretation. No measured tear/member coordinates asserted.
export function createFracture(g,p,id,finish,mobile,options={}){
 const random=rng(options.seed??(id==='hull-main'?41916:71916)),dir=options.dir??(id==='hull-main'?-1:1),cut=options.cut??91.25;
 const steel=finish('#474439','structure'),edges=finish('#63523d','structure'),inside=finish('#292f2c','structure');
 const beams=[],plateGeometries=[];
 const edge=(z,y)=>5.4+Math.sin(z*.67+y*.17)*1.1+Math.sin(z*1.9-y*.41)*.55;
 const at=(d,z,side)=>{const x=cut+dir*d;return [x,side*(halfBreadthAt(p,x,z)-.24),z];};
 function member(a,b,w=.17){beams.push({a,b,w});}
 // Frames have missing lengths and distinct bent ends rather than an intact wire cage.
 for(let ring=0;ring<5;ring++){
  const d=6.3+ring*1.75+random()*.45;
  for(const side of [-1,1])for(let j=0;j<7;j++){
   const z=1.5+j*2.45;if(random()<.2&&ring<3)continue;
   const a=at(d,z,side),b=at(d,Math.min(p.depth-1,z+2.45),side),bend=(1-ring/6)*.55;
   b[0]+=Math.sin(j*1.7+ring)*bend;b[1]+=side*bend*(random()-.3);
   const end=a.map((v,k)=>v+(b[k]-v)*(.55+random()*.43));member(a,end,.15+random()*.07);
  }
  for(const [j,z] of [5.1,7.8,10.55,13.3,16.1].entries()){
   const a=at(d,z,-1),b=at(d,z,1),mid=[cut+dir*(d+.2+random()),(random()-.5)*1.5,z-.25-random()*.65];
   member(a,mid,.17);if((ring+j)%3!==0)member(mid,b,.16);
  }
 }
 const boxGeo=new THREE.BoxGeometry(1,1,1),q=new THREE.Quaternion(),m=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0);
 const beamMesh=new THREE.InstancedMesh(boxGeo,steel,beams.length*3);
 let bi=0;for(const {a,b,w} of beams){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);q.setFromUnitVectors(up,v.clone().normalize());const centre=A.add(B).multiplyScalar(.5);
  // I-section: web plus two flanges; offsets are in the member's rotated frame.
  for(const [z,sx,sz] of [[0,w*.22,w*1.9],[-w*.88,w*2.4,w*.22],[w*.88,w*2.4,w*.22]]){const offset=new THREE.Vector3(0,0,z).applyQuaternion(q);m.compose(centre.clone().add(offset),q,new THREE.Vector3(sx,v.length(),sz));beamMesh.setMatrixAt(bi++,m);}}
 beamMesh.castShadow=beamMesh.receiveShadow=true;g.add(beamMesh);
 function sheet(nx,ny,point,hole){const pos=[],idx=[];
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)pos.push(...point(i/nx,j/ny));
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(hole?.((i+.5)/nx,(j+.5)/ny))continue;const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();plateGeometries.push(geo.toNonIndexed());
  const normal=geo.attributes.normal,back=pos.map((v,i)=>v-normal.array[i]*.045),backIdx=[];for(let i=0;i<idx.length;i+=3)backIdx.push(idx[i],idx[i+2],idx[i+1]);
  const rear=new THREE.BufferGeometry();rear.setAttribute('position',new THREE.Float32BufferAttribute(back,3));rear.setIndex(backIdx);rear.computeVertexNormals();plateGeometries.push(rear.toNonIndexed());rear.dispose();
  const boundary=new Map();for(let i=0;i<idx.length;i+=3)for(const [a,b] of [[idx[i],idx[i+1]],[idx[i+1],idx[i+2]],[idx[i+2],idx[i]]]){const key=Math.min(a,b)+':'+Math.max(a,b);if(boundary.has(key))boundary.delete(key);else boundary.set(key,[a,b]);}
  const rim=[];for(const [a,b]of boundary.values()){const A=pos.slice(a*3,a*3+3),B=pos.slice(b*3,b*3+3),C=back.slice(a*3,a*3+3),D=back.slice(b*3,b*3+3);rim.push(...A,...C,...B,...B,...C,...D);}const rimGeo=new THREE.BufferGeometry();rimGeo.setAttribute('position',new THREE.Float32BufferAttribute(rim,3));rimGeo.computeVertexNormals();plateGeometries.push(rimGeo);geo.dispose();
 }
 // Buckled deck remnants with broken edge contours and local holes. Not intact shelf rectangles.
 for(const [j,z] of [5.1,7.8,10.55,13.3,16.1].entries()){
  const sag=.2+random()*.7;
  sheet(mobile?5:9,mobile?10:16,(u,v)=>{const y=(v-.5)*halfBreadthAt(p,cut+dir*10,z)*1.8,d=6+u*8+(1-u)*(Math.sin(v*14+j)*1.3+Math.sin(v*29)*.35);return [cut+dir*d,y,z-sag*(1-u)**2+.18*Math.sin(v*11+j)*(1-u)];},(u,v)=>u<.33&&Math.sin(v*19+j)> .68);
 }
 // Wider overlapping torn shell flaps; each has its own width, twist and folded lip.
 for(const side of [-1,1])for(let j=0;j<7;j++){
  const z0=1.8+j*2.45,width=1.2+random()*1.1,curl=.5+random()*1.6,twist=(random()-.5)*1.5;
  sheet(mobile?8:14,4,(u,v)=>{const z=z0+v*width+.15*Math.sin(v*12+j)*u,d=edge(z,side*8)+u*3.8,x=cut+dir*d,y=side*(halfBreadthAt(p,x,z)+curl*Math.max(0,(.48-u)/.48)),zz=z+twist*(v-.5)*Math.max(0,1-u/.7)+.1*Math.sin(u*7+j)*(1-u);return [x,y,zz];});
 }
 // Merge sheets into one draw call, with actual thickness on the visible torn boundary strips.
 const size=plateGeometries.reduce((n,a)=>n+a.attributes.position.array.length,0),positions=new Float32Array(size),normals=new Float32Array(size);let off=0;
 for(const geo of plateGeometries){positions.set(geo.attributes.position.array,off);normals.set(geo.attributes.normal.array,off);off+=geo.attributes.position.array.length;geo.dispose();}
 const merged=new THREE.BufferGeometry();merged.setAttribute('position',new THREE.BufferAttribute(positions,3));merged.setAttribute('normal',new THREE.BufferAttribute(normals,3));
 const mat=edges;mat.side=THREE.DoubleSide;const sheets=new THREE.Mesh(merged,mat);sheets.castShadow=sheets.receiveShadow=true;g.add(sheets);
 // A few hanging pipe/cable remnants, with distinct broken ends instead of repeated hoops.
 for(let i=0;i<5;i++){const z=4+i*2.7,side=i%2?1:-1,a=at(8+i*.45,z,side),end=[a[0]-dir*(2+random()*3),a[1]*.55,z-1-random()*2];const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(...a),new THREE.Vector3(a[0]+dir*.8,a[1]-.7*side,z-.4),new THREE.Vector3(...end)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,mobile?8:14,.045+i*.008,5,false),inside));}
 return {members:beams.length,sheets:7*2+5};
}
