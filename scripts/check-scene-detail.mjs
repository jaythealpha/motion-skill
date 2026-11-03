#!/usr/bin/env node
// Renderer-level checks for the authored realism layer, separate from model facts.
import {openBrowser} from '../shared/cdp.mjs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
const out=process.argv[2]||'trials/scene-detail';mkdirSync(out,{recursive:true});
const B=await openBrowser({tag:'scene-detail',graphics:process.env.GRAPHICS||'hardware'}),rows=[];
async function load(path,query){const l=B.nextLoad(20000);await B.S('Page.navigate',{url:pathToFileURL(resolve(path)).href+'?lang=en&'+query});await l;await B.evaluate(`(async()=>{for(let i=0;i<300;i++){if(window.__wtcStudy||window.__elapse?.ready)return;await new Promise(r=>setTimeout(r,30))}throw Error('not ready')})()`);}
try{
 await B.S('Page.addScriptToEvaluateOnNewDocument',{source:`window.__detailErrors=[];const old=console.error;console.error=(...a)=>{__detailErrors.push(a.map(String).join(' '));old(...a)};addEventListener('error',e=>__detailErrors.push(e.message));addEventListener('unhandledrejection',e=>__detailErrors.push(String(e.reason)));`});
 for(const width of[375,768,1440]){
  await B.S('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===375});
  await load('elapse/examples/wtc-impact-study.html','p=.3');
  const r=await B.evaluate(`(async()=>{const u=__wtcStudy,THREE=await import('three'),clone=u.plane.clone(true);clone.position.set(0,0,0);clone.rotation.set(0,0,0);const size=new THREE.Box3().setFromObject(clone).getSize(new THREE.Vector3());const ids=()=>{let a=[];u.scene.traverse(o=>{if(o.isMesh)a.push(o.geometry.uuid)});return a.join(',')};u.set(0);const keys={tower:new Set(),generic:new Set()};u.scene.traverse(o=>{const m=o.material;if(m?.map&&m.userData?.qualitySurface)keys[m.map.userData.towerFacade?'tower':'generic'].add(m.customProgramCacheKey());});const separatePrograms=[...keys.tower].every(k=>!keys.generic.has(k));const original=ids();u.set(.7);const changed=ids()!==original;u.set(0);const restored=ids()===original;let invalid=0,atlases=0;u.scene.traverse(o=>{if(o.geometry)for(const a of Object.values(o.geometry.attributes))for(const v of a.array)if(!Number.isFinite(v))invalid++;if(o.material?.map?.userData.atlas===4)atlases++;});return{separatePrograms,length:size.y,span:size.x,height:size.z,aircraftBatches:u.plane.children.length,changed,restored,invalid,atlases,errors:__detailErrors};})()`);
  if(Math.abs(r.length-48.5)>.1||Math.abs(r.span-47.57)>.1||r.aircraftBatches>5||!r.separatePrograms||!r.changed||!r.restored||r.invalid||r.atlases!==2||r.errors.length)throw Error(JSON.stringify({width,...r}));
  rows.push({subject:'wtc-impact-study',width,...r});
  for(const p of[.3,.58,.86]){await B.evaluate(`__wtcStudy.set(${p})`);const{data}=await B.S('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,`study-${width}-${p}.png`),Buffer.from(data,'base64'));}
 }
 await load('elapse/examples/britannic.html','t=90');
 const growth=await B.evaluate(`(()=>{const u=__elapse,counts=()=>{let a=[];u.R.scene.traverse(o=>{if(o.isInstancedMesh&&o.geometry.type==='IcosahedronGeometry')a.push(o.count)});return a};const before=counts();for(let i=0;i<8;i++)u.R.render();return{before,after:counts(),errors:__detailErrors}})()`);
 if(!growth.before.length||JSON.stringify(growth.before)!==JSON.stringify(growth.after)||growth.errors.length)throw Error('growth population changed '+JSON.stringify(growth));rows.push({subject:'britannic',...growth});
 await load('elapse/examples/notre-dame.html','t=20');
 const fire=await B.evaluate(`(()=>{const u=__elapse,active=()=>{let n=0;u.R.scene.traverse(o=>{if(o.geometry?.getAttribute('particleOpacity')&&o.visible)n++});return n};const color=active();u.R.set({style:'blueprint'});const blueprint=active();u.R.set({style:'color'});return{color,blueprint,restored:active(),errors:__detailErrors}})()`);
 if(fire.color!==2||fire.blueprint!==0||fire.restored!==2||fire.errors.length)throw Error('dated fire visibility '+JSON.stringify(fire));rows.push({subject:'notre-dame',...fire});
 writeFileSync(join(out,'results.json'),JSON.stringify(rows,null,2));console.log('DETAIL PASS: airframe envelope, finite buffers, reversible openings, instanced atlases, stable growth and blueprint fire visibility');
}finally{await B.cleanup()}
