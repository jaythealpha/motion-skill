import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeModel } from '../engine/model.js';
import { directingBeat,isTitanic,hasDirecting } from '../engine/directing.js';
const model=normalizeModel(JSON.parse(fs.readFileSync(new URL('../examples/titanic.json',import.meta.url))));
test('critical contact and separation receive longer screen time without changing dates',()=>{
 const before=JSON.stringify(model);
 assert.ok(directingBeat(model,3.2).rate<directingBeat(model,1).rate);
 assert.ok(directingBeat(model,43.5).rate<directingBeat(model,39).rate);
 assert.equal(JSON.stringify(model),before);
 for(let t=0;t<=100;t+=.1){let b=directingBeat(model,t);assert.ok(b.rate>0&&b.rate<=1);}
});
test('ship-specific directing distinguishes Titanic and Britannic',()=>{assert.ok(isTitanic(model));const b={subject:{name:{en:'HMHS Britannic'}}};assert.ok(!isTitanic(b));assert.ok(hasDirecting(b));assert.ok(!hasDirecting({subject:{name:'Other ship'}}));});
const britannic=normalizeModel(JSON.parse(fs.readFileSync(new URL('../examples/britannic.json',import.meta.url))));
test('Britannic slows the roll, preserves dates and covers its seabed chapters',()=>{
 const original=JSON.stringify(britannic);
 assert.ok(directingBeat(britannic,51).rate<directingBeat(britannic,41).rate);
 assert.equal(directingBeat(britannic,65).id,'quiet');
 assert.equal(directingBeat(britannic,90).id,'explored');
 for(let t=0;t<=100;t+=.1)assert.ok(directingBeat(britannic,t).rate>0);
 assert.equal(JSON.stringify(britannic),original);
});
