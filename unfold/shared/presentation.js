// Copied from shared/presentation.js by scripts/sync-shared.mjs. Edit shared/, not this copy.
import * as THREE from 'three';
// Independently painted lighting environment; no photographic assets or network requests.
export function createPresentation(renderer,scene,{kind='architecture',sun,root}={}){
 const marine=kind==='marine',studio=kind==='studio',c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d'),sky=g.createLinearGradient(0,0,0,512);
 [[0,marine?'#071826':studio?'#152534':'#648caf'],[.44,marine?'#16445b':studio?'#b7c7d4':'#c2d3de'],[.55,marine?'#091b2a':studio?'#f6f6ee':'#e9e2d2'],[1,marine?'#020910':studio?'#65707e':'#586473']].forEach(([p,color])=>sky.addColorStop(p,color));g.fillStyle=sky;g.fillRect(0,0,1024,512);
 if(studio)for(const[x,w,a]of[[120,70,.65],[560,160,.8],[850,30,.4]]){const strip=g.createLinearGradient(x,0,x+w,0);strip.addColorStop(0,'rgba(255,255,255,0)');strip.addColorStop(.5,`rgba(255,255,255,${marine?a*.14:a})`);strip.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=strip;g.fillRect(x,90,w,240);}
 const env=new THREE.CanvasTexture(c);env.mapping=THREE.EquirectangularReflectionMapping;env.colorSpace=THREE.SRGBColorSpace;
 const back=document.createElement('canvas');back.width=8;back.height=512;const b=back.getContext('2d'),gradient=b.createLinearGradient(0,0,0,512);gradient.addColorStop(0,studio?'#edf1f5':'#a6c0d4');gradient.addColorStop(.72,studio?'#d8e0e7':'#e6e8e5');gradient.addColorStop(1,studio?'#c6d0da':'#c5c9c3');b.fillStyle=gradient;b.fillRect(0,0,8,512);const background=new THREE.CanvasTexture(back);background.colorSpace=THREE.SRGBColorSpace;
 const low=innerWidth<600||renderer.userData?.lightweight;
 root?.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.isMeshPhongMaterial){m.envMap=env;m.reflectivity=marine?.06:studio?.16:.04;m.needsUpdate=true;}});
 if(sun&&!marine&&!studio){renderer.shadowMap.enabled=!low;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=!low;sun.shadow.mapSize.set(1024,1024);const span=kind==='city'?650:kind==='iron'?240:110;Object.assign(sun.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:1,far:2500});sun.shadow.bias=-.00008;sun.shadow.normalBias=kind==='city'?1.2:kind==='iron'?.15:.04;sun.shadow.radius=2;}
 root?.traverse(o=>{if(o.isMesh&&!o.material?.transparent){o.castShadow=true;o.receiveShadow=true;}});
 // Upload cached material tiles during scene preparation, not when a new event
 // first exposes a surface in the middle of playback.
 const uploaded=new Set();root?.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)for(const key of['map','bumpMap','normalMap','roughnessMap','metalnessMap']){const t=m[key];if(t&&!uploaded.has(t)){uploaded.add(t);renderer.initTexture(t);}}});
 let mode;
 return {env,update(st){const color=st.style!=='blueprint';scene.environment=color&&!low?env:null;scene.environmentIntensity=marine?.2:studio?.75:.4;if(!marine)scene.background=color?background:new THREE.Color('#172c42');if(mode===color)return;mode=color;if(sun&&renderer.shadowMap.enabled)sun.castShadow=color;},info:()=>({environment:kind,shadowMap:!low&&!marine&&!studio?1024:0})};
}
export function streetTexture(){
 const c=document.createElement('canvas');c.width=c.height=2048;const g=c.getContext('2d');g.fillStyle='#9b9f96';g.fillRect(0,0,2048,2048);const xs=[0,278,574,850,1170,1470,1780],ys=[0,245,540,820,1150,1460,1785];
 function road(p,vertical){g.save();if(!vertical){g.translate(2048,0);g.rotate(Math.PI/2);}g.fillStyle='#c1c2b7';g.fillRect(p,0,62,2048);g.fillStyle='#555c60';g.fillRect(p+9,0,44,2048);g.strokeStyle='#b9b5a0';g.lineWidth=1.5;g.setLineDash([12,24]);g.beginPath();g.moveTo(p+31,0);g.lineTo(p+31,2048);g.stroke();g.setLineDash([]);g.restore();}
 for(const x of xs)road(x,true);for(const y of ys)road(y,false);
 for(const x of xs)for(const y of ys)for(let k=0;k<5;k++){g.fillStyle='#d0d0c3';g.fillRect(x+12+k*8,y+62,4,18);g.fillRect(x+62,y+12+k*8,18,4);}
 // Subtle aggregate and paving variation, painted once, with mipmaps rather than per-fragment noise.
 for(let i=0;i<22000;i++){const x=(i*7919)%2048,y=(i*3571)%2048;g.fillStyle=i%2?'rgba(255,255,255,.035)':'rgba(10,18,20,.035)';g.fillRect(x,y,2,2);}
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}
