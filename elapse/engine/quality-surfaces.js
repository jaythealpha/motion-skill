import * as THREE from 'three';
// Original procedural material treatment, not downloaded photographic textures.
export function enrichMaterial(mat,kind='metal'){
 if(!(mat?.isMeshStandardMaterial||mat?.isMeshPhongMaterial)||mat.userData.qualitySurface)return;
 mat.userData.qualitySurface=true;mat.userData.qsUniform={value:1};
 if(kind==='rust')mat.userData.qsAge={value:0};
 const prior=mat.onBeforeCompile;
 mat.onBeforeCompile=s=>{prior.call(mat,s);s.uniforms.qsEnabled=mat.userData.qsUniform;if(kind==='rust')s.uniforms.qsAge=mat.userData.qsAge;s.vertexShader='varying vec3 qsPosition;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nqsPosition=position;');
 s.fragmentShader=(kind==='rust'?'uniform float qsAge;\n':'')+'uniform float qsEnabled;\nvarying vec3 qsPosition;\nfloat qsHash(vec3 p){return fract(sin(dot(p,vec3(12.73,48.37,81.13)))*43758.5);}\n'+s.fragmentShader;
 const stone=kind==='stone',wood=kind==='wood';


 s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 if(qsEnabled>.5){float qsGrain=qsHash(floor(qsPosition*${stone?'18.':wood?'vec3(6.,2.,.15)':'12.'}));
 ${kind==='facade'?'':'diffuseColor.rgb*=.97+.06*qsGrain;'}
 ${kind==='rust'?'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.26,.145,.075)*(.86+.22*qsGrain),qsAge*.88);':''}
 ${stone?`vec2 qsCell=vec2(qsPosition.x*.9+step(.5,fract(qsPosition.z*1.5))*.5,qsPosition.z*1.5);vec2 qsEdge=min(fract(qsCell),1.-fract(qsCell));float qsMortar=1.-smoothstep(.012,.035,min(qsEdge.x,qsEdge.y));diffuseColor.rgb*=1.-qsMortar*.12;`:wood?'diffuseColor.rgb*=.92+.08*sin(qsPosition.z*18.+sin(qsPosition.x*3.));':''}
 }`);};mat.customProgramCacheKey=()=> 'elapse-surface-'+kind+'-v1';
}
const lightingModes=new WeakMap();
export function qualityLighting(renderer,scene,st){
 const color=st.style!=='blueprint';if(lightingModes.get(scene)!==color){lightingModes.set(scene,color);scene.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.userData.qsUniform)m.userData.qsUniform.value=color?1:0;});}renderer.toneMapping=color?THREE.ACESFilmicToneMapping:THREE.NoToneMapping;renderer.toneMappingExposure=1.05;
}
export function qualitySceneMaterials(root,choose=()=> 'metal'){
 const seen=new Set();root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&!seen.has(m)){seen.add(m);enrichMaterial(m,choose(m,o));}});
}
// Repeated prismatic pieces use one draw call, preserving the parent's visibility/clipping state.
export function boxInstances(parent,rows,material){if(!rows.length)return null;const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,rows.length),M=new THREE.Matrix4(),q=new THREE.Quaternion();rows.forEach(([x,y,z,w,d,h,rz=0],i)=>{q.setFromAxisAngle(new THREE.Vector3(0,0,1),rz);M.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(w,d,h));mesh.setMatrixAt(i,M);});mesh.computeBoundingSphere();parent.add(mesh);return mesh;}
