import * as THREE from 'three';

// Independently painted density/illumination sprites. Work is cached at creation,
// never evaluated as fractal noise for every screen pixel during playback.
const cache=new Map(),mix=(a,b,t)=>a+(b-a)*t,clamp=x=>Math.max(0,Math.min(1,x));
function hash(x,y){let n=Math.imul(x,374761393)^Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y){const i=Math.floor(x),j=Math.floor(y);let u=x-i,v=y-j;u=u*u*(3-2*u);v=v*v*(3-2*v);return mix(mix(hash(i,j),hash(i+1,j),u),mix(hash(i,j+1),hash(i+1,j+1),u),v);}
function fbm(x,y){return noise(x,y)*.57+noise(x*2.07+19,y*2.07+7)*.28+noise(x*4.13+5,y*4.13+31)*.15;}
export function particleAtlas(fire=false){
 const key=fire?'flame':'smoke';if(cache.has(key))return cache.get(key);
 const tile=128,side=4,size=tile*side,c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d'),im=g.createImageData(size,size),data=im.data;
 for(let k=0;k<16;k++)for(let y=0;y<tile;y++)for(let x=0;x<tile;x++){
  const u=(x+.5)/tile*2-1,v=(y+.5)/tile*2-1,sx=k*7.31,sy=k*3.77;
  const n=fbm(u*3.2+sx,v*3.2+sy),warp=(n-.5)*.28;
  const r2=(u+warp)*(u+warp)+(v-warp*.7)*(v-warp*.7),edge=clamp((1-r2)*3.2);
  const billow=fbm(u*6+sx+13,v*6+sy+9),density=clamp((1-r2)*.9+(n-.5)*.85+(billow-.5)*.24);
  const alpha=fire?clamp(density*1.9)*edge:(1-Math.exp(-density*3.5))*edge;
  const shade=clamp(.53-u*.22-v*.24+(n-.5)*.55+(billow-.5)*.22);
  const i=(((k>>2)*tile+y)*size+(k%4)*tile+x)*4;
  if(fire){const heat=clamp(density*.82+(billow-.4)*.72);data[i]=255;data[i+1]=mix(48,248,heat);data[i+2]=mix(5,212,heat**3);}
  else{const light=55+shade*165;data[i]=light;data[i+1]=light*1.015;data[i+2]=light*1.025;}
  data[i+3]=Math.round(alpha*255);
 }
 g.putImageData(im,0,0);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.userData.atlas=side;map.anisotropy=2;cache.set(key,map);return map;
}
