import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeModel} from '../engine/model.js';
import {runChecks} from '../engine/checks.js';
import {wtcState,advanceWTC,WTC_DATES} from '../engine/wtc-model.js';
import {timeToBar,formatTime} from '../engine/chapters.js';
const raw=JSON.parse(readFileSync(new URL('../examples/world-trade-center.json',import.meta.url))),m=normalizeModel(raw),state=d=>wtcState(m,timeToBar(m,d));
test('WTC has separate site-history contract and mandatory official events',()=>{assert.deepEqual(runChecks(m).errors,[]);assert.equal(m.features.compartments,false);assert.equal(m.construction.heightKeys.length,0);for(const[id,date]of Object.entries(WTC_DATES))assert.equal(m.events.find(e=>e.id===id).at,date);});
test('attack and collapse order retains North after South then WTC7 later',()=>{assert.equal(state('2001-09-11T08:45').northHit,false);assert.equal(state(WTC_DATES.northHit).northHit,true);assert.equal(state('2001-09-11T09:02').southHit,false);const afterS=state('2001-09-11T10:02');assert.equal(afterS.southFall,1);assert.equal(afterS.northFall,0);const afternoon=state('2001-09-11T12:00');assert.equal(afternoon.northFall,1);assert.equal(afternoon.sevenFall,0);assert.equal(state('2001-09-11T18:00').sevenFall,1);});
test('memorial and selected new buildings never appear as intact twins',()=>{assert.equal(state('2002-05-30').clear,1);assert.equal(state('2002-05-30').one,0);assert.equal(state('2011-09-11').memorial,1);assert.equal(state('2014-11-03').one,1);assert.equal(state('2018-06-11').three,1);assert.equal(state('2016-03-03').oculus,1);assert.ok(m.stops.find(s=>s.id==='memorial').availableFrom>m.stops.find(s=>s.id==='one').availableFrom);});
test('all transitional states are bounded and reversible across the whole bar',()=>{for(let t=0;t<=100;t+=.1){const p=wtcState(m,t);for(const[k,v]of Object.entries(p))if(typeof v==='number'&&!['height','ms'].includes(k))assert.ok(Number.isFinite(v)&&v>=0&&v<=1,k);assert.deepEqual(wtcState(m,t),p);}assert.equal(formatTime(m,100),'2018년 6월');});
test('fast playback cannot jump across the short WTC7 collapse window',()=>{const t=timeToBar(m,'2001-09-11T17:20:50'),end=advanceWTC(m,t,.5,'fast');assert.ok(end>t&&end<timeToBar(m,'2001-09-11T17:22:52'));});
test('invalid historical events, template and present-day completion claims fail',()=>{for(const change of[q=>q.events.find(e=>e.id==='southHit').at='2001-09-11T09:30',q=>q.restoration.template='other',q=>q.subject.dims.height=417,q=>q.chapters.at(-1).end='2026-12-01']){const q=structuredClone(raw);change(q);assert.ok(runChecks(normalizeModel(q)).errors.length);}});

test('WTC7 exact recorded second is not rounded to the next minute',()=>{assert.equal(formatTime(m,timeToBar(m,WTC_DATES.sevenFall)),'9월 11일 17:20:52');});

test('WTC quarter and half speeds preserve their relative pace outside directed windows',()=>{assert.ok(Math.abs(advanceWTC(m,0,1,'quarter')-100/240)<1e-8);assert.ok(Math.abs(advanceWTC(m,0,1,'half')-100/120)<1e-8);});
