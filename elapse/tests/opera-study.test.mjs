import test from 'node:test';
import assert from 'node:assert/strict';
import {studyCamera} from '../engine/opera-study-motion.js';
import {STUDY_TEXT,studyLocale} from '../engine/opera-study-i18n.js';
test('representative study camera is finite and keeps subject framing across viewports',()=>{
 for(const aspect of [.46,.75,1.6,2.2])for(let t=0;t<=36;t+=.05){const p=studyCamera(t,aspect);assert.ok([...p.eye,...p.target].every(Number.isFinite));assert.ok(p.eye[2]>p.target[2]);assert.ok(Math.hypot(...p.eye.map((v,i)=>v-p.target[i]))>10);}
});
test('representative camera is independent of the comparison variant and clamps endpoints',()=>{
 assert.deepEqual(studyCamera(-1),studyCamera(0));assert.deepEqual(studyCamera(99),studyCamera(36));
 assert.equal(studyCamera(24.9).interior,false);assert.equal(studyCamera(25).interior,true);
});
test('all five study locales provide the same nonempty interface keys',()=>{
 const keys=Object.keys(STUDY_TEXT.en).sort();for(const [lang,fields]of Object.entries(STUDY_TEXT)){assert.deepEqual(Object.keys(fields).sort(),keys,lang);assert.ok(Object.values(fields).every(s=>typeof s==='string'&&s.length>0),lang);}
 assert.equal(studyLocale(null),'en');assert.equal(studyLocale('ch'),'zh');assert.equal(studyLocale('unknown'),'en');
});
