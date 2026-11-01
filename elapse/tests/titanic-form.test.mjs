import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../shared/vendor/three.module.min.js';
import {refineTitanicPiece,TITANIC_SCREEN_FROM,FT} from '../engine/titanic-form.js';
import {planHalfWidth,planWindows} from '../engine/britannic-form.js';
import {deckHeightAt,sheerHeightAt,hullMesh} from '../engine/geom.js';
import {buildPiece} from '../engine/shapes.js';
const model=JSON.parse(readFileSync(new URL('../examples/titanic.json',import.meta.url)));
test('Titanic visual form preserves source tracks, split ranges, IDs and attachment frames',()=>{
 const before=JSON.stringify(model),ps=model.pieces.map(refineTitanicPiece);
 assert.equal(JSON.stringify(model),before);
 ps.forEach((p,i)=>{const old=model.pieces[i];assert.equal(p.id,old.id);assert.equal(p.parent,old.parent);assert.deepEqual(p.offset,old.offset);assert.deepEqual(p.params?.range,old.params?.range);assert.deepEqual(p.appear,old.appear);});
});
test('complete refined hull retains source dimensions and finite topology',()=>{
 const q=refineTitanicPiece(model.pieces.find(p=>p.id==='hull')).params,{positions,indices}=hullMesh(q);
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(let i=0;i<positions.length;i+=3){minX=Math.min(minX,positions[i]);maxX=Math.max(maxX,positions[i]);minY=Math.min(minY,positions[i+1]);maxY=Math.max(maxY,positions[i+1]);assert.ok(Number.isFinite(positions[i+2]));}
 assert.ok(Math.abs(maxX-minX-269.1)<.05);assert.ok(Math.abs(maxY-minY-28.2)<.05);assert.ok(indices.every(i=>i<positions.length/3));
});
test('only the documented well decks drop by 9ft, leaving forecastle and poop at B level',()=>{
 const q=refineTitanicPiece(model.pieces.find(p=>p.id==='hull')).params;
 for(const w of q.planWellCuts){const x=(w.from+w.to)/2;assert.ok(Math.abs(sheerHeightAt(q,x)-deckHeightAt(q,x)-9*FT)<1e-9);}
 for(const x of [-120,-40,0,110])assert.equal(deckHeightAt(q,x),sheerHeightAt(q,x));
});
test('split A-deck contours meet and the 192ft screen uses a common ship coordinate',()=>{
 const ps=model.pieces.filter(p=>p.id.startsWith('a-deck')).map(refineTitanicPiece).sort((a,b)=>a.offset[0]-b.offset[0]);
 for(let i=1;i<ps.length;i++)assert.ok(Math.abs(ps[i-1].params.planOutline.at(-1)[1]-ps[i].params.planOutline[0][1])<.001);
 assert.ok(Math.abs(76.55-TITANIC_SCREEN_FROM-192*FT)<1e-9);
 for(const p of ps)for(const w of planWindows(p.params))assert.equal(w.open,w.x+p.offset[0]<TITANIC_SCREEN_FROM);
});
test('forward A-deck window is clear through the steel wall, with wall retained above it',()=>{
 const p=refineTitanicPiece(model.pieces.find(p=>p.id==='a-deck-bow')),q=p.params,g=buildPiece(THREE,p,model);g.updateMatrixWorld(true);
 const w=planWindows(q).find(w=>w.x+q.planOrigin>25&&w.x+q.planOrigin<40&&!w.open),walls=[];g.traverse(m=>{if(m.isMesh&&!m.userData.planGlass)walls.push(m);});
 const ray=new THREE.Raycaster(new THREE.Vector3(w.x,-planHalfWidth(q,w.x)-1,w.z),new THREE.Vector3(0,1,0),0,1.3);
 assert.equal(ray.intersectObjects(walls,false).length,0);ray.ray.origin.z=q.h-.22;assert.ok(ray.intersectObjects(walls,false).length>0);
});
