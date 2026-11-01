import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ecologyAvailable,ecologyMode,fishPose,snowPoint,scaleBar} from '../engine/ecology-model.js';
import {timeToBar} from '../engine/chapters.js';
const m=JSON.parse(readFileSync(new URL('../examples/titanic.json',import.meta.url)));
test('ecology never asserts a historical or projected population beyond the observation window',()=>{
 for(const year of [1912,1950,1985,2023,2026,2100])assert.equal(ecologyAvailable(m,timeToBar(m,year)),false);
 for(const year of [1986,1999,2009,2022])assert.equal(ecologyAvailable(m,timeToBar(m,year)),true);
 const t=timeToBar(m,2009);assert.equal(ecologyMode(m,{t,style:'color',xray:false}),true);
 assert.equal(ecologyMode(m,{t,style:'blueprint',xray:false}),false);assert.equal(ecologyMode(m,{t,style:'color',xray:true}),false);
});
test('fish motion is deterministic in playback seconds with bounded near-bottom excursions',()=>{
 assert.deepEqual(fishPose(17,1),fishPose(17,1));assert.notDeepEqual(fishPose(17,1),fishPose(18,1));
 for(let t=0;t<300;t+=.3){const p=fishPose(t);assert.ok(Math.abs(p.offset[0])<=2.4&&Math.abs(p.offset[1])<=1.5&&Math.abs(p.offset[2])<=.12);assert.ok(Number.isFinite(p.heading));}
});
test('marine snow sinks in model z and wraps without leaving its camera volume',()=>{
 const a=snowPoint([.5,.2,.8],0,2),b=snowPoint([.5,.2,.8],1,2);assert.ok(Math.abs(a[2]-b[2]-.012)<1e-9);
 for(let t=0;t<2000;t+=17){const p=snowPoint([.1,.8,.001],t,.55);assert.ok(p[2]>=-.275&&p[2]<=.275);assert.ok(p.every(Number.isFinite));}
});
test('metric reference ruler fits context and macro viewports',()=>{for(const ppm of [1,10,100,1000,6000])assert.ok(scaleBar(ppm,64)*ppm<=64);});
