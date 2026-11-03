import * as THREE from 'three';
// Small, periodic material-data tiles shared by a whole scene. Red is height,
// green is roughness. Generated once; no photos, runtime downloads or simulation.
const tiles=new Map(),normals=new Map();
const hash=(x,y)=>{let n=Math.imul(x&31,374761393)^Math.imul(y&31,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
const smooth=x=>x*x*(3-2*x);
function noise(x,y){const i=Math.floor(x),j=Math.floor(y),u=smooth(x-i),v=smooth(y-j),a=hash(i,j)*(1-u)+hash(i+1,j)*u,b=hash(i,j+1)*(1-u)+hash(i+1,j+1)*u;return a*(1-v)+b*v;}
function tile(kind){if(tiles.has(kind))return tiles.get(kind);const size=256,a=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,p=noise(u*8,v*8),f=noise(u*32,v*32),brushed=noise(u*4,v*32);let h=.5,r=.8;
  if(kind==='metal'){h=.5+(brushed-.5)*.15;r=.72+(brushed-.5)*.18;}
  else if(kind==='wood'){h=.5+(noise(u*32,v*4)-.5)*.3;r=.8+(p-.5)*.12;}
  else if(kind==='stone'||kind==='rust'){h=.5+(p-.5)*.32+(f-.5)*.16;r=.89+(p-.5)*.15;}
  else{h=.5+(f-.5)*.09;r=.85+(p-.5)*.08;}
  const i=(y*size+x)*4;a[i]=Math.round(h*255);a[i+1]=Math.round(r*255);a[i+2]=255;a[i+3]=255;
 }
 const t=new THREE.DataTexture(a,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;tiles.set(kind,t);return t;
}
function normalTile(kind){if(normals.has(kind))return normals.get(kind);const height=tile(kind),N=height.image.width,a=height.image.data,out=new Uint8Array(N*N*4),strength=kind==='metal'?.45:kind==='wood'?.7:1.0;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=(xx,yy)=>a[(((yy+N)%N)*N+(xx+N)%N)*4]/255,dx=(h(x+1,y)-h(x-1,y))*strength,dy=(h(x,y+1)-h(x,y-1))*strength,k=1/Math.hypot(dx,dy,1),i=(y*N+x)*4;out[i]=Math.round((.5-dx*k*.5)*255);out[i+1]=Math.round((.5-dy*k*.5)*255);out[i+2]=Math.round((.5+k*.5)*255);out[i+3]=255;}const t=new THREE.DataTexture(out,N,N);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;normals.set(kind,t);return t;}
export function finishMaterial(m,kind='metal'){
 if(!m||m.userData.surfaceFinish||!(m.isMeshStandardMaterial||m.isMeshPhongMaterial))return m;m.userData.surfaceFinish=kind;
 if(kind==='glass'){if('roughness'in m)m.roughness=Math.min(m.roughness,.2);m.envMapIntensity=.85;return m;}
 if(kind==='facade')return m;
 const data=tile(kind);if(!m.normalMap){m.normalMap=normalTile(kind);m.normalScale=new THREE.Vector2(kind==='metal'?.35:.65,kind==='metal'?.35:.65);}if(!m.bumpMap){m.bumpMap=data;m.bumpScale=kind==='stone'?.045:kind==='rust'?.03:kind==='wood'?.018:.007;}
 if('roughness'in m&&!m.roughnessMap)m.roughnessMap=data;
 m.needsUpdate=true;return m;
}
