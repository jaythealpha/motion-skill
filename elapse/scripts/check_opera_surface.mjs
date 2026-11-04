#!/usr/bin/env node
// Optional Opera detail/interaction-performance probe. Local GPU evidence only.
import {openBrowser} from '../shared/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const [page='elapse/examples/sydney-opera-house.html',out='opera-surface-qa']=process.argv.slice(2);
mkdirSync(out,{recursive:true});
const url=new URL(/^https?:/.test(page)?page:pathToFileURL(resolve(page)));
for(const[k,v]of Object.entries({view:'scene',t:'100',lang:'en'}))url.searchParams.set(k,v);
const B=await openBrowser({tag:'opera-surface',graphics:'hardware',minutes:4}),rows=[];
try{
 await B.S('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 const ready=B.nextLoad(20000);await B.S('Page.navigate',{url:url.href});await ready;
 await B.evaluate(`(async()=>{for(let i=0;i<800;i++){if(window.__elapse?.ready)return;await new Promise(r=>setTimeout(r,25))}throw Error('not ready')})()`);
 rows.push(await B.evaluate(`(()=>{
 const u=__elapse,problems=[];let buffers=0,invalid=0,panels=0;
 u.R.scene.traverse(o=>{if(o.geometry){buffers++;for(const a of Object.values(o.geometry.attributes))for(const x of a.array)if(!Number.isFinite(x))invalid++;}if(o.name.startsWith('acoustic-petal-'))panels++;});
 if(invalid)problems.push('non-finite geometry');if(panels!==18)problems.push('reflector count');
 const g=u.R.scene.getObjectByName('acoustic-petal-0').geometry,edges=new Map(),ix=g.index.array;
 for(let i=0;i<ix.length;i+=3)for(const[a,b]of[[ix[i],ix[i+1]],[ix[i+1],ix[i+2]],[ix[i+2],ix[i]]]){const key=Math.min(a,b)+':'+Math.max(a,b);edges.set(key,(edges.get(key)||0)+1);}
 if([...edges.values()].some(n=>n!==2))problems.push('open/non-manifold panel');g.computeBoundingBox();const thickness=g.boundingBox.max.z-g.boundingBox.min.z;if(thickness>.5)problems.push('panel too thick');
 const count=()=>{let meshes=0,instances=0;u.R.scene.traverse(o=>{if(o.isMesh)meshes++;if(o.isInstancedMesh)instances+=o.count;});return{meshes,instances};};const before=count();
 for(let i=0;i<30;i++)u.setT(i%2?100:0,true);if(JSON.stringify(before)!==JSON.stringify(count()))problems.push('population grows');
 return{case:'surface/reverse',problems,buffers,invalid,panels,panelThickness:thickness,population:before};})()`));
 for(const mode of['construction','hall-orbit'])rows.push(await B.evaluate(`(async()=>{
 const u=__elapse;u.explore(false);u.st.style='color';u.setT(${mode==='construction'?40:100},true);
 ${mode==='hall-orbit'?`u.explore(true);const select=document.querySelector('[data-survey=stop]');select.value='hall';select.dispatchEvent(new Event('change',{bubbles:true}));u.R.state.auto=false;`:''}
 for(let i=0;i<30;i++)u.R.render();const times=[];
 for(let i=0;i<90;i++){const start=performance.now();${mode==='construction'?'u.setT(40+i/90*4,true);':'u.R.state.yaw=60+i*.4;u.R.render();'}await new Promise(requestAnimationFrame);times.push(performance.now()-start);}
 times.sort((a,b)=>a-b);return{case:'${mode}',problems:[...u.errors],samples:times.length,medianMs:times[45],p95Ms:times[85],drawCalls:u.R.renderer.info.render.calls,triangles:u.R.renderer.info.render.triangles,gpu:u.R.renderer.userData.gpu};})()`));
}finally{writeFileSync(join(out,'results.json'),JSON.stringify({cases:rows.length,rows},null,2));await B.cleanup();}
console.log(JSON.stringify(rows));if(rows.some(r=>r.problems.length))process.exitCode=1;
