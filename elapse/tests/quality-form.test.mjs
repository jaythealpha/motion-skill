import test from 'node:test';import assert from 'node:assert/strict';
import {damagedHull,QUALITY_VIEWS} from '../engine/quality-form.js';
import {readFileSync} from 'node:fs';
test('damage preserves original geometry and upper deck connection while opening cut-end lower plates',()=>{
 const p=new Float32Array([91.25,-3,2,91.25,3,2,91.25,0,5,91.25,-3,19.66,91.25,3,19.66,91.25,0,19.66]),before=[...p];
 const r=damagedHull(p,new Uint32Array([0,1,2,3,4,5]),{id:'hull-main'});assert.deepEqual([...p],before);assert.deepEqual([...r.indices],[3,4,5]);assert.ok([...r.positions].every(Number.isFinite));assert.deepEqual([...r.positions.slice(9)],[...p.slice(9)]);
});
test('quality inspection references existing parts with finite angles and safe crop fractions',()=>{
 const m=JSON.parse(readFileSync(new URL('../examples/britannic.json',import.meta.url))),ids=new Set(m.pieces.map(p=>p.id));
 for(const s of QUALITY_VIEWS){assert.ok(s.parts.every(p=>ids.has(p)));assert.ok(Number.isFinite(s.yaw)&&Number.isFinite(s.pitch));if(s.trimX)assert.ok(s.trimX[0]>=0&&s.trimX[1]<=1&&s.trimX[1]>s.trimX[0]);}
});
import {normalizeModel,validateModel} from '../engine/model.js';
test('all close-up crop axes reject reversed/out-of-range coordinates before camera use',()=>{
 for(const key of ['trimX','trimY','trimZ']){const m=JSON.parse(readFileSync(new URL('../examples/britannic.json',import.meta.url)));m.stops=[{id:'crop',name:{ko:'확대'},parts:['hull-main'],yaw:290,pitch:35,[key]:[.9,.2]}];const result=validateModel(normalizeModel(m));assert.ok(result.errors.some(e=>e.msg.includes(key)));}
});
