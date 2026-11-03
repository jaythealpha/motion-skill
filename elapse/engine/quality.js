import{surfaceMaterial}from'../shared/material-budget.js';
import {createQualityStructure} from './quality-structure.js';
// Optional authored look-development layer; no scanned textures or surveyed geometry.
import * as THREE from 'three';
import {halfBreadthAt} from './geom.js';
import {rng} from './math.js';
export function createQualityStudy({renderer,scene,camera,root,items,ground,hemi,sun,model,cutaway=false}){
 renderer.debug.onShaderError=(gl,program,vs,fs)=>{window.__elapse?.errors.push('Quality shader: '+gl.getShaderInfoLog(fs));};
 const anchor=model.tracks.find(t=>t.piece==='ship'&&t.prop==='pose')?.keys.at(-1)?.v.pos||[0,0,-120];
 const mobile=innerWidth<640,gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info'),software=debug&&/SwiftShader|llvmpipe|Software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)),shadows=!mobile&&!software;renderer.shadowMap.enabled=shadows;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const limited=mobile||software;
 const random=rng(11211916),overrides=[],extras=[];
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const finish=(base,kind='metal')=>{
  const mat=surfaceMaterial({color:base,roughness:.92,metalness:.08,transparent:kind==='sand',depthWrite:kind!=='sand'});
  mat.onBeforeCompile=s=>{
   s.vertexShader='varying vec3 qPosition;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nqPosition=position;');
   s.fragmentShader='varying vec3 qPosition;\nfloat qHash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}\nfloat qNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(qHash(i),qHash(i+vec3(1,0,0)),f.x),mix(qHash(i+vec3(0,1,0)),qHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(qHash(i+vec3(0,0,1)),qHash(i+vec3(1,0,1)),f.x),mix(qHash(i+vec3(0,1,1)),qHash(i+vec3(1,1,1)),f.x),f.y),f.z);}\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    float qPatch=qNoise(qPosition*vec3(.21,.36,.16)),grain=qNoise(qPosition*15.);
    float streak=smoothstep(.52,.84,qNoise(qPosition*vec3(2.2,.4,.055)));
    vec3 patina=mix(vec3(.19,.23,.20),vec3(.35,.20,.095),smoothstep(.36,.73,qPatch));
    diffuseColor.rgb=mix(diffuseColor.rgb,patina,.42+streak*.19)*(.91+.12*grain);
   `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    float h=qNoise(qPosition*12.)*.018+qNoise(qPosition*2.)*.035;
    vec3 sx=dFdx(vViewPosition),sy=dFdy(vViewPosition);vec3 r1=cross(sy,normal),r2=cross(normal,sx);
    float det=dot(sx,r1);normal=normalize(abs(det)*normal-sign(det)*(dFdx(h)*r1+dFdy(h)*r2));
   `);
   if(kind==='structure')s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb=mix(diffuseColor.rgb,patina,.42+streak*.19)*(.91+.12*grain);','diffuseColor.rgb=mix(diffuseColor.rgb,patina,.3)*(.8+.12*grain);');
   if(kind==='hull')s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb=mix(diffuseColor.rgb,patina,.42+streak*.19)*(.91+.12*grain);','diffuseColor.rgb=mix(diffuseColor.rgb,patina,.42+streak*.19)*(.91+.12*grain);float edgeAge=(1.-smoothstep(8.,22.,abs(qPosition.x-91.25)))*(1.-smoothstep(17.,20.,qPosition.z));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.23,.16,.1),edgeAge*(.2+.18*qPatch));').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(.78+.18*qPatch,.0,1.);').replace('#include <aomap_fragment>','#include <aomap_fragment>\nfloat cavity=(1.-smoothstep(4.,20.,abs(qPosition.x-91.25)))*(1.-smoothstep(15.,19.,qPosition.z));reflectedLight.indirectDiffuse*=1.-cavity*.42;');
   if(limited)s.fragmentShader=s.fragmentShader.replace('float h=qNoise(qPosition*12.)*.018+qNoise(qPosition*2.)*.035;','float h=0.;').replace('grain=qNoise(qPosition*15.)','grain=qHash(floor(qPosition*12.))').replace('float streak=smoothstep(.52,.84,qNoise(qPosition*vec3(2.2,.4,.055)));','float streak=smoothstep(.58,.86,qPatch);');
   if(kind==='sand')s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb=mix(diffuseColor.rgb,patina,.42+streak*.19)*(.91+.12*grain);',`diffuseColor.rgb*=.91+.12*grain+.035*sin(qPosition.x*8.+qPosition.y*2.);diffuseColor.a*=1.-smoothstep(.65,1.,length((qPosition.xy-vec2(${anchor[0].toFixed(2)},${anchor[1].toFixed(2)}))/vec2(275.,175.)));`);
  };mat.customProgramCacheKey=()=> 'elapse-quality-'+kind+'-v3';return mat;
 };
 for(const it of items){
  if(it.p.id==='hull')continue;
  for(const mesh of it.meshes){if(!mesh.isMesh||!mesh.userData.baseColor)continue;mesh.castShadow=mesh.receiveShadow=true;overrides.push({mesh,mat:finish(mesh.userData.baseColor,mesh.userData.role==='hull'?'hull':'metal')});}
  if(it.p.template!=='hull')continue;
  const p=it.p.params,st=p.offsets.stations,range=p.range||[st[0].x,st.at(-1).x],g=new THREE.Group();it.g.add(g);extras.push(g);
  const positions=[];
  for(const side of [-1,1])for(let x=range[0]+2;x<range[1]-2;x+=limited?6.6:3.3)for(let z=2;z<p.depth-.5;z+=limited?.76:.38){positions.push([x,side*(halfBreadthAt(p,x,z)+.045),z]);}
  const rivets=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.042,0),finish('#596957'),positions.length),m=new THREE.Matrix4();
  positions.forEach((p,i)=>{m.makeTranslation(...p);rivets.setMatrixAt(i,m);});g.add(rivets);
  const seams=[];
  for(const side of [-1,1])for(let z=2;z<p.depth;z+=2.1)for(let x=range[0]+1;x<range[1]-1;x+=1){const xn=Math.min(range[1]-1,x+1);seams.push(x,side*(halfBreadthAt(p,x,z)+.028),z,xn,side*(halfBreadthAt(p,xn,z)+.028),z);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(seams,3));g.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:'#102522',transparent:true,opacity:.35})));
 }
 const growthLOD=[];for(const it of items)it.g.traverse(o=>{if(o.isInstancedMesh&&o.geometry.type==='IcosahedronGeometry'){
  const original=o.instanceMatrix.array.slice(),scaled=original.slice(),m=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion(),scale=new THREE.Vector3();
  for(let i=0;i<o.count;i++){m.fromArray(original,i*16);m.decompose(v,q,scale);scale.multiplyScalar(.42);m.compose(v,q,scale);m.toArray(scaled,i*16);}
  growthLOD.push({mesh:o,original,scaled,active:null,mat:surfaceMaterial({color:'#536055',roughness:1,metalness:0})});
 }});
 const structure=createQualityStructure({items,finish,mobile});
 const sandGeo=new THREE.PlaneGeometry(550,350,140,90),a=sandGeo.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i)+anchor[0],y=a.getY(i)+anchor[1];a.setXYZ(i,x,y,ground(x,y)+.04+Math.sin(x*.5+y*.3)*.035);}
 sandGeo.computeVertexNormals();const sand=new THREE.Mesh(sandGeo,finish('#526861','sand'));sand.receiveShadow=true;root.add(sand);extras.push(sand);
 const p=new Float32Array(4500);for(let i=0;i<p.length;i+=3){p[i]=anchor[0]+(random()-.5)*380;p[i+1]=anchor[1]+(random()-.5)*180;p[i+2]=anchor[2]-8+random()*45;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));
 const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=32;const ctx=texCanvas.getContext('2d'),grad=ctx.createRadialGradient(16,16,0,16,16,16);grad.addColorStop(0,'rgba(230,255,246,.85)');grad.addColorStop(.25,'rgba(210,245,236,.4)');grad.addColorStop(1,'rgba(210,245,236,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,32,32);
 const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:'#b5d1c8',size:.19,map:new THREE.CanvasTexture(texCanvas),transparent:true,opacity:.3,depthWrite:false}));root.add(dust);extras.push(dust);
 const fill=new THREE.DirectionalLight('#5ca4b0',1.2);fill.position.set(-50,40,-20);scene.add(fill);
 const lamp=new THREE.SpotLight('#d9eee1',1,1000,.6,.85,1);lamp.castShadow=shadows;lamp.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);lamp.shadow.bias=-.0002;lamp.shadow.normalBias=.12;scene.add(lamp,lamp.target);
 return {stats:{tier:mobile?'mobile':software?'software':'desktop',shadows,software:!!software,...structure.stats},update(st){const active=st.style==='color'&&!st.xray&&st.t>=62;structure.update(active,cutaway);for(const lod of growthLOD){if(lod.active!==active){lod.mesh.instanceMatrix.array.set(active?lod.scaled:lod.original);lod.mesh.instanceMatrix.needsUpdate=true;lod.active=active;}if(active){lod.mesh.material=lod.mat;lod.mesh.count=Math.floor(lod.mesh.count*(limited?.45:.72));}}extras.forEach(g=>g.visible=active);lamp.visible=fill.visible=active;for(const {mesh} of overrides)if(mesh.userData.edges)mesh.userData.edges.visible=!active;renderer.toneMapping=active?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;if(!active)return;
   for(const {mesh,mat} of overrides){mesh.material=mat;mat.color.copy(mesh.userData.mats.color.color);if(mesh.userData.edges)mesh.userData.edges.visible=false;}
   hemi.intensity=.45;sun.intensity=.7;scene.background.set('#082b35');if(!scene.fog?.isFogExp2)scene.fog=new THREE.FogExp2('#143c40',.0019);else{scene.fog.color.set('#143c40');scene.fog.density=.0019;}
   const target=new THREE.Vector3(st.cam.target[0],st.cam.target[2],-st.cam.target[1]);const d=camera.position.distanceTo(target);lamp.position.copy(camera.position).add(new THREE.Vector3(-5,8,2));lamp.target.position.copy(target);lamp.intensity=d*2.5;lamp.distance=d*3;
  }};
}
