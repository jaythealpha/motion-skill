import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {explorationStops,explorationStart} from '../engine/exploration.js';
for(const name of ['titanic','britannic']){const m=JSON.parse(readFileSync(new URL('../examples/'+name+'.json',import.meta.url)));test(name+' exploration references only existing pieces and leaves the source unchanged',()=>{const before=JSON.stringify(m),stops=explorationStops(m),ids=new Set(m.pieces.map(p=>p.id));assert.equal(stops.length,m.stops?.length??4);for(const s of stops)assert.ok(s.parts.length&&s.parts.every(id=>ids.has(id)));assert.equal(JSON.stringify(m),before);});test(name+' historical wreck time is retained, while sinking/projection opens an inspection date',()=>{assert.equal(explorationStart(m,85),85);const p=explorationStart(m,0);assert.ok(p>=56&&p<100);if(m.features.projection)assert.equal(explorationStart(m,99),p);});}
import {normalizeModel,validateModel} from '../engine/model.js';
import {playbackRate} from '../engine/directing.js';
test('unfamiliar ship gets an overview and uses its recorded wreck chapter',()=>{
 const m={subject:{kind:'ship'},pieces:[{id:'custom-hull',template:'hull'}],camera:[{yaw:315}],features:{projection:false},chapters:[{id:'sink',unit:'minute',bar:[0,77]},{id:'visits',unit:'year',bar:[77,100],playbackRate:.4}]};
 assert.deepEqual(explorationStops(m)[0].parts,['custom-hull']);assert.equal(explorationStops(m)[0].yaw,315);
 assert.equal(explorationStart(m,10),88.5);assert.equal(explorationStart(m,95),95);assert.equal(playbackRate(m,95),.4);
 m.stops=[{id:'detail',name:{ko:'상세'},parts:['custom-hull'],yaw:180,pitch:3}];assert.equal(explorationStops(m)[0].id,'detail');m.stops=[];assert.deepEqual(explorationStops(m),[]);
});
test('Gate 1 rejects invalid declarative stops and pacing',()=>{
 const raw=JSON.parse(readFileSync(new URL('../examples/titanic.json',import.meta.url)));
 raw.stops=[{id:'bad',name:{ko:'오류'},parts:['missing'],yaw:NaN,pitch:90,trimX:[1,0]}];raw.chapters[0].playbackRate=0;
 const r=validateModel(normalizeModel(raw));assert.ok(r.errors.some(e=>e.where==='stop bad'));assert.ok(r.errors.some(e=>e.msg.includes('playbackRate')));
});
