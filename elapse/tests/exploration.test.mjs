import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {explorationStops,explorationStart} from '../engine/exploration.js';
for(const name of ['titanic','britannic']){const m=JSON.parse(readFileSync(new URL('../examples/'+name+'.json',import.meta.url)));test(name+' exploration references only existing pieces and leaves the source unchanged',()=>{const before=JSON.stringify(m),stops=explorationStops(m),ids=new Set(m.pieces.map(p=>p.id));assert.equal(stops.length,4);for(const s of stops)assert.ok(s.parts.length&&s.parts.every(id=>ids.has(id)));assert.equal(JSON.stringify(m),before);});test(name+' historical wreck time is retained, while sinking/projection opens an inspection date',()=>{assert.equal(explorationStart(m,85),85);const p=explorationStart(m,0);assert.ok(p>=56&&p<100);if(m.features.projection)assert.equal(explorationStart(m,99),p);});}
