import * as T from 'three';
// Original context/mass-surface treatment. Not a mapped 2001 Manhattan reconstruction.
export function finishCityContext(context,ground,scene){
 const palette=['#9c8c7c','#909997','#a5aaa4','#8b8278','#b2a998','#7e8e98'];
 const color=new T.Color();context.traverse(o=>{if(!o.isInstancedMesh||!o.material.map)return;for(let i=0;i<o.count;i++)o.setColorAt(i,color.set(palette[(i*7+i%3)%palette.length]));o.instanceColor.needsUpdate=true;});
 if(ground.material){ground.material.roughness=.94;ground.material.metalness=0;}
 scene.fog=new T.FogExp2('#bdcbd5',.00025);
 return{kind:'estimated-context',palette:palette.length};
}
