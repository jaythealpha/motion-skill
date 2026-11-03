import{surfaceMaterial}from'../shared/material-budget.js';
import * as THREE from 'three';
// Independently authored geometry and textures; no downloaded photos or source meshes.
export {aircraft} from './aircraft-detail.js';
export function facadeTexture(context=false){
 const c=document.createElement('canvas');c.width=1024;c.height=2048;const a=c.getContext('2d');
 a.fillStyle=context?'#8c9da5':'#74818a';a.fillRect(0,0,1024,2048);
 const cols=context?24:59,step=context?1024/24:1024*1.016/62.8,offset=context?0:512-29*step;
 for(let row=0;row<24;row++)for(let col=0;col<cols;col++){
  const x=offset+col*step,y=row*2048/24,rh=2048/24,w=context?step*.65:step*.64;
  const v=(row*41+col*19)%31,sky=a.createLinearGradient(x,y,x,y+rh);
  sky.addColorStop(0,`rgb(${31+v},${48+v},${57+v})`);sky.addColorStop(.42,`rgb(${56+v},${74+v},${83+v})`);sky.addColorStop(1,`rgb(${25+v},${36+v},${43+v})`);
  a.fillStyle='#b8c1c3';a.fillRect(x-step*.18,y,step*.36,rh);a.fillStyle=sky;a.fillRect(x+step*.18,y+5,w,rh*.68);
  // Recess reveal, narrow aluminum edge highlight, and a subdued spandrel.
  a.fillStyle='rgba(8,17,24,.68)';a.fillRect(x+step*.18,y+5,w,3);a.fillRect(x+step*.18,y+5,2,rh*.68);
  a.fillStyle='rgba(225,232,230,.48)';a.fillRect(x+step*.12,y,1.6,rh);a.fillStyle='rgba(48,61,68,.25)';a.fillRect(x+step*.93,y,1.8,rh);
  a.fillStyle='rgba(74,85,91,.25)';a.fillRect(x,y+rh*.81,step,2);
  if((row*7+col*11)%17===0){a.fillStyle='rgba(168,158,133,.16)';a.fillRect(x+step*.23,y+12,w*.82,rh*.5);}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,110/24);t.anisotropy=8;t.userData.towerFacade=!context;return t;
}
export {particleAtlas as softTexture} from './particle-atlas.js';
export function studyTower(root,x,y,h,texture){const g=new THREE.Group();g.position.set(x,y,0);root.add(g);const m=surfaceMaterial({map:texture,color:'#d3d9dc',metalness:.4,roughness:.6}),trim=surfaceMaterial({color:'#b7c0c4',metalness:.5,roughness:.43});const q=new THREE.Mesh(uprightBox(63,63,h,1),m);q.position.z=h/2;g.add(q);for(const side of[-1,1])for(const i of[-31.3,31.3]){for(const vertical of[true,false]){const q=new THREE.Mesh(new THREE.BoxGeometry(vertical?.35:.3,vertical?.3:.35,h),trim);q.position.set(vertical?i:side*31.55,vertical?side*31.55:i,h/2);g.add(q);}}for(const z of[7,41,75,108].map(f=>h*f/110)){const b=new THREE.Mesh(new THREE.BoxGeometry(63.4,63.4,h*2/110),surfaceMaterial({color:'#7c878d',metalness:.45,roughness:.6}));b.position.z=z;g.add(b);}const roof=new THREE.Mesh(new THREE.BoxGeometry(61,61,1.2),surfaceMaterial({color:'#6e7a80'}));roof.position.z=h+.3;g.add(roof);return g;}

export function uprightBox(w,d,h,bevel=0){let g;if(bevel){const s=new THREE.Shape(),x=w/2,y=d/2,b=bevel;for(const[i,p]of[[-x+b,-y],[x-b,-y],[x,-y+b],[x,y-b],[x-b,y],[-x+b,y],[-x,y-b],[-x,-y+b]].entries())i?s.lineTo(...p):s.moveTo(...p);s.closePath();g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false});g.translate(0,0,-h/2);}else g=new THREE.BoxGeometry(w,d,h);const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const side=Math.abs(n.getZ(i))<.5;uv.setXY(i,Math.abs(n.getX(i))>.5?(p.getY(i)+d/2)/d:(p.getX(i)+w/2)/w,side?(p.getZ(i)+h/2)/h:(p.getY(i)+d/2)/d);}return g;}
