import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeModel} from '../engine/model.js';
import {runChecks} from '../engine/checks.js';
import {civilState,advanceCivil} from '../engine/civil-model.js';
import {explorationStart} from '../engine/exploration.js';
const raw=id=>JSON.parse(readFileSync(new URL('../examples/'+id+'.json',import.meta.url)));
for(const id of ['sampoong','seongsu-bridge']){
 test(id+' preserves input and dispatches to civil history without ship or Eiffel tracks',()=>{const r=raw(id),before=JSON.stringify(r),m=normalizeModel(r);assert.deepEqual(runChecks(m).errors,[]);assert.equal(JSON.stringify(r),before);assert.equal(m.features.compartments,false);assert.deepEqual(m.construction.heightKeys,[]);assert.equal(explorationStart(m,43),43);});
 test(id+' can rewind from aftermath/reopening to before failure without accumulated state',()=>{const m=normalizeModel(raw(id));const start=civilState(m,0);assert.equal(start.fall,0);const final=civilState(m,100);assert.equal(final.fall,1);assert.deepEqual(civilState(m,0),start);assert.equal(final.replacement,id==='sampoong'?0:1);for(let t=0;t<100;t+=.2){const p=civilState(m,t);for(const [k,v]of Object.entries(p))if(k!=='bridge')assert.ok(Number.isFinite(v),k);}});
 test(id+' rejects falsely sourced geometry, invented extension dates and absent translations',()=>{for(const change of [m=>m.geometry.estimated=false,m=>m.chapters.at(-1).end='2026-11-03',m=>delete m.presentation.inspectionHint.ja,m=>m.construction.heightKeys=[{at:'1990-01-01',height:4}],m=>m.events[0].sourceIds=['missing']]){const r=raw(id);change(r);assert.ok(runChecks(normalizeModel(r)).errors.length);}});
 test(id+' keeps slow/fast passages reachable and genuine quarter-speed below half-speed',()=>{const m=normalizeModel(raw(id)),t=id==='sampoong'?33.9:19.9;const q=advanceCivil(m,t,.5,'quarter'),h=advanceCivil(m,t,.5,'half'),fast=advanceCivil(m,t,.5,'fast');assert.ok(t<q&&q<h&&h<fast&&fast<40);assert.equal(advanceCivil(m,100,1,'fast'),100);});
}
test('Seongsu retains its suspended segment and historical four-lane geometry contract',()=>{for(const change of [m=>m.geometry.suspendedLength=120,m=>m.subject.dims.width=35,m=>m.geometry.bridgeLength=120]){const r=raw('seongsu-bridge');change(r);assert.ok(runChecks(normalizeModel(r)).errors.length);}});
