import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../shared/vendor/three.module.min.js';
import {refineBritannicPiece,planHalfWidth,planWindows} from '../engine/britannic-form.js';
import {buildPiece} from '../engine/shapes.js';
import {hullMesh} from '../engine/geom.js';
const model=JSON.parse(readFileSync(new URL('../examples/britannic.json',import.meta.url)));
test('visual form does not rewrite historical source data or attachment offsets',()=>{
 const before=JSON.stringify(model),ps=model.pieces.map(refineBritannicPiece);
 assert.equal(JSON.stringify(model),before);
 for(let i=0;i<ps.length;i++){assert.deepEqual(ps[i].offset,model.pieces[i].offset);assert.equal(ps[i].id,model.pieces[i].id);assert.equal(ps[i].parent,model.pieces[i].parent);}
});
test('refined complete hull keeps LOA and beam and has finite nonnegative sections',()=>{
 const p=refineBritannicPiece(model.pieces.find(p=>p.id==='hull')).params,{positions,indices}=hullMesh(p);
 const xs=[],ys=[];for(let i=0;i<positions.length;i+=3){xs.push(positions[i]);ys.push(positions[i+1]);assert.ok(Number.isFinite(positions[i+2]));}
 assert.ok(Math.abs(Math.max(...xs)-Math.min(...xs)-269.1)<.05);
 assert.ok(Math.abs(Math.max(...ys)-Math.min(...ys)-28.65)<.05);
 assert.ok(p.offsets.stations.every(s=>s.hb.every(v=>v>=0&&Number.isFinite(v))));
 assert.ok(indices.every(i=>i<positions.length/3));
});
test('deck setbacks remain inside their attachment envelope',()=>{
 for(const original of model.pieces.filter(p=>p.template==='deckhouse')){
  const p=refineBritannicPiece(original).params;if(!p.planOutline)continue;
  assert.ok(p.planOutline.every(([x,w])=>Math.abs(x)<=original.params.l/2&&w>0&&w<=original.params.b/2));
  assert.ok(new Set(p.planOutline.map(r=>r[1])).size>=3);
 }
});
test('window is an actual hole through the forward promenade wall, not a painted decal',()=>{
 const p=refineBritannicPiece(model.pieces.find(p=>p.id==='a-deck')),q=p.params,g=buildPiece(THREE,p,model);
 g.updateMatrixWorld(true);const w=planWindows(q).find(w=>w.x>20&&w.x<45&&!w.open),y=-planHalfWidth(q,w.x)-1;
 const walls=[];g.traverse(m=>{if(m.isMesh&&!m.userData.planGlass)walls.push(m);});
 const ray=new THREE.Raycaster(new THREE.Vector3(w.x,y,w.z),new THREE.Vector3(0,1,0),0,1.3);
 assert.equal(ray.intersectObjects(walls,false).length,0,'opaque wall fills window');
 ray.ray.origin.z=q.h-.22;
 assert.ok(ray.intersectObjects(walls,false).length>0,'wall above opening is missing');
});
