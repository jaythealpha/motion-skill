import test from 'node:test';
import assert from 'node:assert/strict';
import {placedPatch,ROOF_SPECS,ROOF_RADIUS} from '../engine/opera-geometry.js';
import {operaState} from '../engine/opera-model.js';
import {normalizeModel} from '../engine/model.js';
import {timeToBar} from '../engine/chapters.js';
import {readFileSync} from 'node:fs';
test('roof control patches stay on one working-radius sphere including mirrored and rotated halves',()=>{
 for(const s of ROOF_SPECS)for(const side of[-1,1]){const p=placedPatch(s,side);for(let i=0;i<=20;i++)for(let j=0;j<=20;j++){const v=p.point(i/20,j/20);assert.ok(v.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...v.map((x,k)=>x-p.center[k]))-ROOF_RADIUS)<1e-8);assert.ok(v[2]>=11.5&&v[2]<=67.001);}}
});
test('completion, shell erection and organ date remain separate when seeking backwards',()=>{
 const m=normalizeModel(JSON.parse(readFileSync(new URL('../examples/sydney-opera-house.json',import.meta.url))));
 const at=d=>operaState(m,timeToBar(m,d));
 assert.equal(at('1973-10-20').organ,0);assert.ok(Math.abs(at('1979-05-30').organ-1)<1e-12);assert.equal(at('1963-01-01').shells,0);assert.equal(at('1967-01-01').shells,1);assert.equal(at('2023-11-08').renewal,1);assert.deepEqual(at('1965-01-01'),at('1965-01-01'));
});
test('mirrored roof halves actually meet at their shared ridge',()=>{
 for(const spec of ROOF_SPECS){const a=placedPatch(spec,-1),b=placedPatch(spec,1);for(let i=0;i<=100;i++){const u=i/100;assert.ok(Math.hypot(...a.point(u,0).map((x,k)=>x-b.point(u,0)[k]))<1e-8);assert.ok(Math.abs(a.point(u,1)[2]-12)<1e-8);}}
});
