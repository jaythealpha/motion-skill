#!/usr/bin/env node
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {openBrowser} from '../shared/cdp.mjs';
const [page,out='elapse/.out/ecology-check']=process.argv.slice(2);mkdirSync(out,{recursive:true});
const B=await openBrowser({tag:'elapse-ecology'}),rows=[];
try{
 const loaded=B.nextLoad(15000);await B.S('Page.navigate',{url:pathToFileURL(resolve(page)).href+'?t=85&style=color'});await loaded;
 await B.evaluate(`(async()=>{for(let i=0;i<100&&!window.__elapse?.ready;i++)await new Promise(r=>setTimeout(r,100));if(!window.__elapse?.ready)throw new Error('not ready');})()`);
 for(const width of [375,768,1440]){
  await B.S('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
  await B.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  for(const kind of ['scene','coral','sponge','fish']){
   const r=await B.evaluate(`(()=>{const u=window.__elapse;document.querySelector('[data-k="ecoView"][data-o="${kind}"]').click();return {kind:'${kind}',...u.R.frame(),...u.R.ecologyInfo(),overflow:document.documentElement.scrollWidth>innerWidth+1,focus:document.activeElement?.dataset.o,card:document.querySelector('.el-card').innerText,errors:u.errors};})()`);
   if(r.focus!==kind||r.overflow||r.errors.length||r.inside<.6||r.area<.02||r.corals!==2||r.coralMeshes!==4||r.sponges!==2||r.fish!==3||r.lights!==2)throw new Error(width+': '+JSON.stringify(r));
   if(kind!=='scene'&&!r.card.includes('생태 확대'))throw new Error('macro card mismatch');
   if(kind==='scene'&&!r.card.includes('기록 시점'))throw new Error('historical card not restored');
   const {data}=await B.S('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,width+'-'+kind+'.png'),Buffer.from(data,'base64'));rows.push({width,...r});
  }
 }
 const toggles=await B.evaluate(`(()=>{const u=window.__elapse,click=(k,o)=>document.querySelector('[data-k="'+k+'"][data-o="'+o+'"]').click(),check=(ok,msg)=>{if(!ok)throw new Error(msg)};
 click('ecology','off');let a=u.R.ecologyInfo();check(a.fish===0&&a.corals===0&&a.sponges===0&&a.kind===null,'fauna off');click('ecology','on');click('exploreLight','off');check(u.R.ecologyInfo().lights===0,'light off');click('exploreLight','on');
 u.R.set({style:'blueprint'});a=u.R.ecologyInfo();check(!a.snow&&!a.fish&&!a.lights,'blueprint leak');u.R.set({style:'color',xray:true});a=u.R.ecologyInfo();check(!a.snow&&!a.fish&&!a.lights,'xray leak');u.R.set({xray:false});
 for(const t of [0,70,99]){u.setT(t,true);a=u.R.ecologyInfo();check(!a.snow&&!a.fish&&!a.lights,'historical/future leak at '+t)}u.setT(85,true);return 'toggles, structure-only and historical/future exclusions passed';})()`);console.log(toggles);
 const motion=await B.evaluate(`(async()=>{const u=window.__elapse,a=u.R.ecologyInfo();await new Promise(r=>setTimeout(r,200));const b=u.R.ecologyInfo();if(a.clock!==b.clock)throw new Error('pause advances clock');u.play(true);await new Promise(r=>setTimeout(r,800));u.play(false);const c=u.R.ecologyInfo();if(c.clock<=b.clock||JSON.stringify(c.fishPosition)===JSON.stringify(b.fishPosition))throw new Error('no playback motion');return {paused:a.clock,played:c.clock};})()`);console.log('motion',motion);
 await B.S('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await B.evaluate(`(async()=>{const u=window.__elapse,a=u.R.ecologyInfo().clock;u.play(true);await new Promise(r=>setTimeout(r,500));u.play(false);if(u.R.ecologyInfo().clock!==a)throw new Error('reduced motion ignored');})()`);
 writeFileSync(join(out,'results.json'),JSON.stringify({rows,toggles,motion,reducedMotion:'pass'},null,2)+'\n');console.log('ECOLOGY PASS (12 responsive frames + toggles + pause/play + reduced motion)');
}catch(e){console.error('ECOLOGY FAIL: '+e.message);process.exitCode=1;}finally{await B.cleanup();}
