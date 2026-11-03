import {spriteBatch} from './sprite-batch.js';
import {particleAtlas} from './particle-atlas.js';

// The existing dated fire/damage state remains authoritative. These are authored
// roof-level flame and smoke shapes, not a fire-propagation reconstruction.
export function cathedralEffects(root){
 const flame=spriteBatch(root,particleAtlas(true),'#ffffff',30),smoke=spriteBatch(root,particleAtlas(false),'#9d9994',54);
 return {set(p,bp,t){const active=!bp&&p.fire>.001;flame.mesh.visible=smoke.mesh.visible=active;if(!active)return;
  const clock=t*.05;
  for(const[i,q]of flame.particles.entries()){const a=i*2.4,w=.8+.2*Math.sin(clock+i);q.visible=true;q.position.set(-37+i%15*5.1,Math.sin(a)*4,44+Math.sin(a*.7)*2+(i%3)*1.8);q.scale.set((7+i%4)*p.fire*w,(12+i%5)*p.fire*w,1);q.material.opacity=p.fire*.56;q.material.rotation=Math.sin(a)*.4+clock*.1;}
  for(const[i,q]of smoke.particles.entries()){const u=i/53,a=i*2.4;q.visible=true;q.position.set(-30+i%12*6+u*18+Math.sin(a)*4,-5-u*17+Math.cos(a)*5,47+u*46*p.fire);const size=(10+i%7)*(.7+u)*Math.max(.1,p.fire);q.scale.set(size,size*1.12,1);q.material.opacity=p.fire*(.27+u*.13);q.material.rotation=a+clock*.03;}
  flame.flush();smoke.flush();
 },info:()=>({particleDrawBatches:2,particles:84})};
}
