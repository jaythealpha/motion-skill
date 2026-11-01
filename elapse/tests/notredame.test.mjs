import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeModel} from '../engine/model.js';
import {runChecks} from '../engine/checks.js';
import {notreDameState,advanceNotreDame} from '../engine/notredame-model.js';
import {timeToBar,formatTime} from '../engine/chapters.js';
const raw=JSON.parse(readFileSync(new URL('../examples/notre-dame.json',import.meta.url))),m=normalizeModel(raw);
test('Notre-Dame uses damage/restoration contract without fake Eiffel construction keys',()=>{assert.deepEqual(runChecks(m).errors,[]);assert.equal(m.features.compartments,false);assert.equal(m.tracks.length,0);assert.equal(m.construction.heightKeys.length,0);});
test('roof and spire are lost, surviving stone is not treated as total collapse, then rebuilt',()=>{const state=d=>notreDameState(m,timeToBar(m,d));assert.equal(state('2019-04-15T18:30').damage,0);assert.equal(state('2019-04-15T18:30').fall,0);const ruined=state('2019-04-16T12:00');assert.equal(ruined.damage,1);assert.equal(ruined.fall,1);assert.equal(ruined.fire,0);assert.equal(ruined.rebuild,0);assert.equal(state('2023-12-16').rebuild,1);assert.equal(state('2024-12-08').cover,1);assert.equal(state('2020-11-24').oldScaffold,0);});
test('restoration states are finite/bounded and rewind deterministically',()=>{for(let t=0;t<=100;t+=.25){const p=notreDameState(m,t);for(const[k,v]of Object.entries(p))if(k!=='height'&&k!=='phase')assert.ok(Number.isFinite(v)&&v>=0&&v<=1,k);assert.deepEqual(notreDameState(m,t),p);}assert.equal(formatTime(m,0),'4월 15일 18:30');assert.equal(formatTime(m,100),'2024년 12월');});
test('reject mismatched building dimensions, construction data and falsely extended completion timeline',()=>{for(const change of[q=>q.subject.dims.height=300,q=>q.restoration.template='unknown',q=>q.construction={heightKeys:[{at:'2024-01-01',height:96}]},q=>q.chapters.at(-1).end='2026-12-01']){const q=structuredClone(raw);change(q);assert.ok(runChecks(normalizeModel(q)).errors.length);}});

test('fast playback cannot skip the spire collapse slow passage',()=>{const t=timeToBar(m,'2019-04-15T19:44');const end=advanceNotreDame(m,t,.5,'fast');assert.ok(end<timeToBar(m,'2019-04-15T19:50'));assert.ok(end>t);});
