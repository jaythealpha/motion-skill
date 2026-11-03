import{surfaceMaterial}from'../shared/material-budget.js';
// Independently modelled, small observation-based fauna. Not source photographs, a census or a species-ID model.
import * as THREE from 'three';
import {ecologyMode,fishPose,snowPoint} from './ecology-model.js';
import {rng} from './math.js';
import {worldBox} from './geom.js';
const toThree=([x,y,z])=>new THREE.Vector3(x,z,-y);
export function createDeepEcology({root,scene,camera,model,items,ground}){
 const random=rng(38001986),corals=[],sponges=[],fish=[];
 const pale=surfaceMaterial({color:'#c4baa0',roughness:.88,metalness:0}),stem=surfaceMaterial({color:'#978569',roughness:.95});
 const dark=surfaceMaterial({color:'#282a26',roughness:1}),skin=surfaceMaterial({color:'#8c9290',roughness:.8,metalness:.04});
 const surfaceUniform={value:0};
 // Procedural weathering, not measured corrosion. Confined to the two macro host structures.
 for(const it of items.filter(i=>['rail-bow-stbd','aft-house-stern'].includes(i.p.id)))for(const m of it.meshes){
   if(!m.userData.baseColor)continue;
   const mat=m.userData.mats.color.clone();m.userData.mats.color=mat;
   mat.onBeforeCompile=s=>{s.uniforms.ecoWeather=surfaceUniform;
     s.vertexShader='varying vec3 ecoLocal;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\necoLocal=position;');
     s.fragmentShader=`varying vec3 ecoLocal;uniform float ecoWeather;
float ecoHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float ecoNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(ecoHash(i),ecoHash(i+vec3(1,0,0)),f.x),mix(ecoHash(i+vec3(0,1,0)),ecoHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(ecoHash(i+vec3(0,0,1)),ecoHash(i+vec3(1,0,1)),f.x),mix(ecoHash(i+vec3(0,1,1)),ecoHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
`+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
       float mottled=ecoNoise(ecoLocal*340.)*.7+ecoNoise(ecoLocal*890.)*.3;
       float stain=smoothstep(.38,.7,ecoNoise(ecoLocal*48.));
       vec3 worn=mix(diffuseColor.rgb*(.60+.26*mottled),vec3(.22,.12,.065),stain*.65);
       diffuseColor.rgb=mix(diffuseColor.rgb,worn,ecoWeather);`);
   };mat.customProgramCacheKey=()=> 'ecology-weather-v2';
 }
 function batchCoral(g){const groups=new Map();for(const m of [...g.children]){if(!m.isMesh)continue;m.updateMatrix();const q=m.geometry.clone().applyMatrix4(m.matrix),a=groups.get(m.material)||[];a.push(q);groups.set(m.material,a);g.remove(m);m.geometry.dispose();}
   for(const [mat,parts] of groups){const p=[],n=[],ix=[];let offset=0;for(const q of parts){p.push(...q.attributes.position.array);n.push(...q.attributes.normal.array);const ids=q.index?.array||Array.from({length:q.attributes.position.count},(_,i)=>i);for(const i of ids)ix.push(offset+i);offset+=q.attributes.position.count;q.dispose();}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geo.setIndex(ix);g.add(new THREE.Mesh(geo,mat));}
 }
 function rod(g,a,b,r,mat){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),m=new THREE.Mesh(new THREE.CylinderGeometry(r*.65,r,d.length(),6),mat);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.position.copy(A.add(B).multiplyScalar(.5));g.add(m);}
 function coral(it,x){const g=new THREE.Group();g.position.set(x,0,it.p.params.h);it.g.add(g);
   rod(g,[0,0,0],[0,0,.12],.0018,stem);
   for(let j=0;j<5;j++){const z=.023+j*.018,reach=.044-j*.004;
     for(let k=0;k<3;k++){const a=k*Math.PI*2/3+j*.8,A=[0,0,z],B=[Math.cos(a)*reach,Math.sin(a)*reach,z+.022];rod(g,A,B,.00085,stem);
       for(let n=1;n<=3;n++){const f=n/4,C=B.map((v,i)=>A[i]+(v-A[i])*f),D=[C[0]+Math.cos(a+.7)*.008,C[1]+Math.sin(a+.7)*.008,C[2]+.01];rod(g,C,D,.0004,pale);
         const p=new THREE.Mesh(new THREE.SphereGeometry(.0016,5,4),pale);p.position.set(...D);g.add(p);}}
   }
   batchCoral(g);corals.push({it,g,box:{min:[x-.065,-.065,it.p.params.h-.01],max:[x+.065,.065,it.p.params.h+.14]}});
 }
 const rail=items.find(i=>i.p.id==='rail-bow-stbd');if(rail){coral(rail,.35);coral(rail,-.4);}
 function sponge(it,x){const g=new THREE.Group(),z=it.p.params.h+.016;g.position.set(x,0,z);it.g.add(g);
   const geo=new THREE.SphereGeometry(1,40,24),p=geo.attributes.position,colors=[];
   for(let i=0;i<p.count;i++){const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i),n=1+.025*Math.sin(X*19+Y*13)*Math.cos(Z*17);p.setXYZ(i,X*.052*n,Y*.038*n,Math.max(-.014,Z*.026*n));const v=.66+.08*Math.sin(X*37+Y*23)*Math.cos(Z*29);colors.push(v,v*.98,v*.84);}geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();g.add(new THREE.Mesh(geo,surfaceMaterial({vertexColors:true,roughness:1})));
   for(const [X,Y,R] of [[-.018,.01,.004],[.014,-.008,.006],[.024,.014,.003]]){const hole=new THREE.Mesh(new THREE.CircleGeometry(R,9),dark);hole.position.set(X,Y,.025);g.add(hole);}
   sponges.push({it,g,box:{min:[x-.075,-.06,z-.02],max:[x+.075,.06,z+.06]}});
 }
 const stern=items.find(i=>i.p.id==='aft-house-stern');if(stern){sponge(stern,-2);sponge(stern,1.5);}
 const bow=items.find(i=>i.p.id==='hull-bow');
 // Joined rings avoid a sphere/cone seam: blunt snout, deep head, continuously tapering rattail.
 function fishSurface(rings){const v=[],ix=[],n=24;for(const [x,r,z] of rings)for(let k=0;k<=n;k++){const a=k/n*Math.PI*2;v.push(x,Math.sin(a)*r,Math.cos(a)*r*1.2+z);}for(let j=0;j<rings.length-1;j++)for(let k=0;k<n;k++){const a=j*(n+1)+k,b=a+n+1;ix.push(a,b,a+1,a+1,b,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();return g;}
 function fin(g,vertices){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();g.add(new THREE.Mesh(geo,surfaceMaterial({color:'#6d7879',roughness:.85,side:THREE.DoubleSide})));}
 for(let i=0;i<3;i++){
   const g=new THREE.Group();root.add(g);g.add(new THREE.Mesh(fishSurface([[.19,.001,-.007],[.176,.026,-.003],[.14,.048,.006],[.09,.057,.009],[.025,.05,0],[-.065,.036,-.006]]),skin));
   const tail=new THREE.Group();tail.position.x=-.065;g.add(tail);tail.add(new THREE.Mesh(fishSurface([[0,.036,-.006],[-.065,.027,-.007],[-.14,.017,-.01],[-.23,.008,-.014],[-.31,.001,-.016]]),skin));
   for(const side of [-1,1]){rod(g,[.07,side*.052,.025],[.052,side*.045,-.027],.0012,dark);rod(g,[.172,side*.012,-.021],[.135,side*.032,-.028],.001,dark);}
   for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.012,10,8),dark);eye.position.set(.115,side*.043,.024);g.add(eye);
     fin(g,[.04,side*.025,-.01,-.04,side*.11,-.04,-.015,side*.025,.015]);}
   fin(g,[.055,0,.055,-.04,0,.15,-.045,0,.025]);fin(g,[-.08,0,-.025,-.29,0,-.03,-.15,0,-.065]);
   fish.push({g,tail,index:i,base:null});
 }
 const N=420,seeds=Array.from({length:N},()=>[random(),random(),random()]),pos=new Float32Array(N*3),alpha=new Float32Array(N),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('alpha',new THREE.BufferAttribute(alpha,1));
 const snow=new THREE.Points(geo,new THREE.ShaderMaterial({transparent:true,depthWrite:false,
   uniforms:{pixel:{value:1},grain:{value:.003}},vertexShader:`attribute float alpha;varying float a;uniform float pixel;uniform float grain;void main(){a=alpha;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=pixel*clamp(grain*420./max(.08,-p.z),1.,4.);gl_Position=projectionMatrix*p;}`,
   fragmentShader:`varying float a;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(.67,.79,.82,a*(1.-d*d));}`}));snow.frustumCulled=false;root.add(snow);
 const spots=[-1,1].map(()=>{const l=new THREE.SpotLight('#cae2ea',1,100,.36,.8,2);scene.add(l,l.target);return l;});
 function updateAnimals(st){const active=ecologyMode(model,st)&&st.ecology!==false,clock=st.ecoClock||0;
   surfaceUniform.value=ecologyMode(model,st)?1:0;
   for(const c of [...corals,...sponges])c.g.visible=active&&c.it.g.visible;
   for(const f of fish){f.g.visible=active;if(!active)continue;const base=new THREE.Vector3(103+f.index*7,-22-f.index*4,0).applyMatrix4(bow.g.matrix),p=fishPose(clock,f.index);f.g.position.set(base.x+p.offset[0],base.y+p.offset[1],ground(base.x,base.y)+1.2+p.offset[2]);f.g.rotation.z=p.heading;f.tail.rotation.z=p.tail;f.base=f.g.position.toArray();}
 }
 function inspect(st){if(!ecologyMode(model,st)||st.ecology===false||!['coral','sponge','fish'].includes(st.ecoView))return null;
   if(st.ecoView==='fish'){const f=fish[0];if(!f.base)return null;const c=f.base;return {box:{min:[c[0]-.46,c[1]-.22,c[2]-.18],max:[c[0]+.35,c[1]+.22,c[2]+.23]},yaw:100,dist:1.8,kind:'fish'};}
   const c=(st.ecoView==='coral'?corals:sponges)[0];if(!c||!c.it.g.visible)return null;return {box:worldBox(c.box,c.it.g.matrix.elements),yaw:(st.last.pieces.get(c.it.p.id).heading||85)-90,dist:st.ecoView==='coral'?.64:.48,kind:st.ecoView};
 }
 function updateLight(st,hemi,sun){const active=ecologyMode(model,st),lit=active&&st.exploreLight!==false;
   const target=st.cam.target,eye=camera.position.clone(),T=toThree(target),d=eye.distanceTo(T),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),macro=!!st.ecoFocus;
   hemi.intensity=lit?.13:hemi.intensity;sun.intensity=lit?.10:sun.intensity;
   spots.forEach((l,i)=>{l.visible=lit;if(!lit)return;l.position.copy(eye).addScaledVector(right,(i?1:-1)*d*.13);l.target.position.copy(T).addScaledVector(right,(i?1:-1)*d*.08);l.angle=macro?.43:.35;l.distance=d*5+5;l.intensity=d*d*(macro?3.8:5.2)*(st.lampStrength||1);});
   snow.visible=active;if(!active)return;
   const span=macro?(st.ecoFocus.kind==='fish'?2: .55): Math.min(70,Math.max(15,d*.35)),clock=st.ecoClock||0,C=target;
   for(let i=0;i<N;i++){const q=snowPoint(seeds[i],clock,span);pos.set([C[0]+q[0],C[1]+q[1],C[2]+q[2]],i*3);alpha[i]=(lit?.26:.055)*(1-Math.abs(q[2])/span)*(i%9===0?1.5:1);}
   geo.attributes.position.needsUpdate=true;geo.attributes.alpha.needsUpdate=true;snow.material.uniforms.pixel.value=1;snow.material.uniforms.grain.value=macro?(st.ecoFocus.kind==='fish'?.003:.0012):.015;geo.setDrawRange(0,macro?120:N);
 }
 return {updateAnimals,inspect,updateLight,stats:()=>({corals:corals.filter(c=>c.g.visible).length,coralMeshes:corals.reduce((n,c)=>n+c.g.children.length,0),sponges:sponges.filter(c=>c.g.visible).length,fish:fish.filter(c=>c.g.visible).length,snow:snow.visible,fishPosition:fish[0].base,lights:spots.filter(l=>l.visible).length})};
}
