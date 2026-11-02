import * as THREE from 'three';
// Visual surface finish only: these marks are not a measured circuit/serial/fastener inventory.
export function qualityMaterial(key,color,lightweight=false){
 const metals=['alu','metal','metalDark','gold','copper','flex','passive'];
 const glass=['glass','lens'].includes(key),metal=metals.includes(key);
 const p={color,roughness:glass?.19:metal?.38:key==='pcb'?.72:.65,metalness:metal?.48:0,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1};
 const m=lightweight?new THREE.MeshPhongMaterial({color,shininess:glass?85:metal?45:12,specular:glass?'#667e97':metal?'#6c6c6c':'#151515',polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}):glass?new THREE.MeshPhysicalMaterial({...p,clearcoat:1,clearcoatRoughness:.12,iridescence:key==='lens'?.65:0}):new THREE.MeshStandardMaterial(p);
 const kind=['pcb','pcbDark'].includes(key)?1:key==='chip'?2:key==='label'?3:glass?4:metal?5:0;
 if(kind){m.onBeforeCompile=s=>{
 s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 ufSurface;').replace('#include <begin_vertex>','#include <begin_vertex>\nufSurface=position;');
 s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 ufSurface;\nfloat ufLine(float x,float width){float a=max(fwidth(x),.015);return 1.-smoothstep(width,width+a,abs(fract(x)-.5));}`);
 const detail=kind===1?`vec2 p=ufSurface.xy;float traces=ufLine(p.x*.48,.025)*(.4+.6*step(.4,fract(p.y*.12)))+ufLine(p.y*.32,.02)*step(.65,fract(p.x*.1));diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.28+vec3(.025,.04,.0),clamp(traces*.35,0.,.4));`
 :kind===2?`float pins=ufLine(ufSurface.x*2.,.06)*ufLine(ufSurface.y*.3,.15);diffuseColor.rgb*=.92+pins*.2;`
 :kind===3?`float rules=ufLine(ufSurface.y*.9,.1)*step(.28,fract(ufSurface.x*.035));diffuseColor.rgb*=1.-rules*.12;`
 :kind===4?`diffuseColor.rgb+=vec3(.015,.03,.045)*(0.5+0.5*sin(ufSurface.x*3.));`
 :`float grain=sin(ufSurface.y*24.)*.015;diffuseColor.rgb*=1.+grain;`;
 s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+detail);
 };m.customProgramCacheKey=()=>`unfold-surface-${kind}`;}
 return m;
}
