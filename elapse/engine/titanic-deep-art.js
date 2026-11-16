import * as THREE from 'three';
import {createSeabedMaterial,createWaterColumn,createMarineSnow,patchWreckSurface,DEEP_FOG} from './deepsea-art-pass.js';
// Seabed presentation for the ship timelines (authored illustration). Wreck history, poses, rust timing and records are unchanged.
// 'abyssal' (Titanic, ~3,800 m): no daylight, illustrative survey-light pools mark the resting hull sections.
// 'shelf' (Britannic, ~120 m): dim blue-green daylight, no pools; same sediment/scour/marine-snow modules re-tinted.
const PRESETS={abyssal:{fog:null,depth:[1200,3000],lamps:true,snow:400},shelf:{fog:'#0e3f4a',sediment:'#6d786a',below:'#03141a',above:'#1b5868',depth:[30,100],lamps:false,snow:220}};
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
export function createTitanicDeepArt({renderer,scene,root,env,items,seaFloor,toonWeathering,preset='abyssal'}){
 const P=PRESETS[preset]||PRESETS.abyssal,target=P.fog?new THREE.Color(P.fog):DEEP_FOG,lightweight=!!renderer.userData?.lightweight,seabed=env.seabed?createSeabedMaterial({lightweight}):null;
 if(seabed&&P.sediment)seabed.material.color.set(P.sediment);
 if(seabed)env.seabed.userData.mats.color=seabed.material;
 const column=createWaterColumn(),snow=createMarineSnow({count:lightweight?Math.round(P.snow/2):P.snow});scene.add(column.mesh,snow.points);
 if(P.fog){const u=column.mesh.material.uniforms;u.uBelow.value.set(P.below);u.uAbove.value.set(P.above);}
 const wreck=new Map();
 if(toonWeathering)for(const it of items)for(const m of it.meshes){const mat=m.userData.mats?.color;if(m.userData.baseColor&&mat?.isMeshToonMaterial&&!wreck.has(mat)){const h=patchWreckSurface(mat,{lightweight});h.setHullBase(seaFloor,30);wreck.set(mat,h);}}
 const box=new THREE.Box3(),c=new THREE.Vector3(),size=new THREE.Vector3(),fogColor=new THREE.Color();let depthMix=0;
 return {
  // After the dated state is applied: weathering follows each piece's existing rust value; pools follow resting hull sections.
  apply(st,s){
   for(const it of items){const ps=s.pieces.get(it.p.id);for(const m of it.meshes){const h=wreck.get(m.userData.mats?.color);if(h){h.setRust(ps.rust||0);h.setEnabled(st.style!=='blueprint');}}}
   if(!seabed)return;
   const rows=[],settled=preset==='shelf'?62:54;if(st.t>=settled)for(const it of items){if(!it.g.visible||!String(it.p.template).startsWith('hull'))continue;it.g.updateMatrixWorld(true);box.setFromObject(it.g);if(box.isEmpty())continue;box.getCenter(c);box.getSize(size);const z=c.y;if(z>seaFloor+Math.max(30,Math.min(80,-seaFloor*.6)))continue;rows.push({x:c.x,y:-c.z,z,len:Math.max(size.x,size.z,20)});}
   rows.sort((a,b)=>b.len-a.len);const main=rows.slice(0,4);
   seabed.setPieces(main.map(r=>({x:r.x,y:r.y,radius:r.len*.55,strength:1})));
   seabed.setLamps(P.lamps?main.slice(0,4).map(r=>({x:r.x,y:r.y,z:seaFloor+55,radius:r.len*.95})):[]);
   seabed.setStrength(P.lamps?smooth(54,58,st.t):0);
  },
  // After the environment sets fog/background for the camera depth: deepen toward the authored deep-water colour.
  beforeRender(st,camera){
   root.updateMatrixWorld();seabed?.update(root.matrixWorld);for(const h of wreck.values())h.update(root.matrixWorld);
   const color=st.style!=='blueprint',under=(st.eyeZ??1)<0;depthMix=color&&under?smooth(P.depth[0],P.depth[1],-(st.eyeZ??0)):0;
   if(scene.fog&&depthMix>0){fogColor.copy(scene.fog.color).lerp(target,depthMix);scene.fog.color.copy(fogColor);scene.fog.near*=1-depthMix*(1-.7/1.1);scene.fog.far*=1-depthMix*(1-4.5/5);}
   column.setVisible(depthMix>.01);column.update(camera.position.y,scene.fog?.color);
   snow.update(camera.position,st.t,depthMix>.5&&!st.exploring);
  },
  info:()=>({seabed:!!seabed,depthMix,weathered:wreck.size,snow:snow.points.visible,column:column.mesh.visible})
 };
}
