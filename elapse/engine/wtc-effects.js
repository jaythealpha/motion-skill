import{surfaceMaterial}from'../shared/material-budget.js';
import{spriteBatch}from'./sprite-batch.js';
import * as THREE from 'three';
import {softTexture} from './wtc-study-assets.js';
import {parseAt} from './chapters.js';
import {WTC_DATES} from './wtc-model.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export function createWTCEffects(root){const group=new THREE.Group();root.add(group);const sm=softTexture(),fm=softTexture(true),fires=[],smokes=[],dusts=[];
const batches=[spriteBatch(group,fm,'#ffffff',52),spriteBatch(group,sm,'#aaa49d',117),spriteBatch(group,sm,'#d4c8b6',126)];let fi=0,si=0,di=0;
// Authored radiance, not a measured fire temperature; retains the atlas's dark edge/core gradient.
batches[0].mesh.material.color.setRGB(2.8,2.1,1.15);
for(let k=0;k<3;k++){fires[k]=batches[0].particles.slice(fi,fi+(k===2?8:22));fi+=fires[k].length;smokes[k]=batches[1].particles.slice(si,si+(k===2?25:46));si+=smokes[k].length;dusts[k]=batches[2].particles.slice(di,di+42);di+=42;}
const debris=new THREE.InstancedMesh(new THREE.BoxGeometry(.55,.3,2.3),surfaceMaterial({color:'#a4a6a3',roughness:.8}),90);debris.frustumCulled=false;group.add(debris);const obj=new THREE.Object3D();let active=null;
function set(p,bp){group.visible=!bp;active=null;for(const[k,id,x,y,z,sign,h]of[[0,'north',-43.5,63,365,1,417],[1,'south',19.5,-78,300,-1,415],[2,'seven',0,201,80,1,186]]){const hit=parseAt(k===2?WTC_DATES.northFall:WTC_DATES[id+'Hit']),fallAt=parseAt(WTC_DATES[id+'Fall']),age=(p.ms-hit)/1000,f=p[id+'Fall'],q=(p.ms-fallAt)/120000;const glow=smooth(age/7)*(1-smooth((age-40)/65));
for(const[i,s]of fires[k].entries()){s.visible=age>=0&&f===0&&age<110;const a=i*2.39996,r=(5+i%5*2)*smooth(age/10);s.position.set(x+Math.cos(a)*r,y+sign*(1+Math.abs(Math.sin(a))*r),z+Math.sin(a*.7)*r*.5);s.scale.setScalar((9+i%7*2)*(.5+.5*smooth(age/10)));s.material.rotation=a+age*.02;s.material.opacity=glow*.52;}
for(const[i,s]of smokes[k].entries()){const born=i*1.3,A=clamp((age-born)/70);s.visible=age>born&&f<.15&&p.fire>0;const a=i*2.4;s.position.set(x+Math.cos(a)*(10+A*16)+A*33,y+sign*(12+Math.abs(Math.sin(a))*(10+A*15)),z+A*65+(i%4)*2);s.scale.setScalar((14+i%6*2)*(1+A*.8));s.material.rotation=a+A*.25;s.material.opacity=smooth((age-born)/8)*(.32+i%3*.035);}
const density=smooth(q/.1)*(1-smooth((q-1)/.38));if(q>0&&q<1.38)active={x,y:y-sign*30,h,q};for(const[i,s]of dusts[k].entries()){s.visible=q>0&&q<1.38;const a=i*2.4,spread=40+clamp(q)*90,front=Math.max(10,(h-(id==='south'?110:id==='seven'?16:50))*(1-f));const ground=i%3!==0;s.position.set(x+Math.cos(a)*spread,y-sign*30+Math.sin(a)*spread,ground?10+(i%4)*10:front+Math.sin(a)*16);s.scale.setScalar((28+i%7*5)*(.7+clamp(q)*1.3));s.material.rotation=a+q*.3;s.material.opacity=density*(ground?.57:.66);}}
debris.visible=!!active;if(active)for(let i=0;i<90;i++){const A=clamp((active.q-i%15*.012)/.75),a=i*2.4;obj.position.set(active.x+Math.cos(a)*A*(25+i%35),active.y+Math.sin(a)*A*(25+i%35),Math.max(2,active.h*(1-clamp(active.q))-A*A*120+(i%7)*2));obj.rotation.set(A*5,a,A*9);obj.scale.set(1+i%3,1,1+i%4);obj.updateMatrix();debris.setMatrixAt(i,obj.matrix);}if(active)debris.instanceMatrix.needsUpdate=true;if(!bp)for(const batch of batches)batch.flush();}
return{set,info:()=>({sprites:295,particleDrawBatches:3,activeCollapse:!!active})};}
