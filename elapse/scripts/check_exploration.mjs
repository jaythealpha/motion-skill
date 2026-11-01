#!/usr/bin/env node
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const skillRoot=fileURLToPath(new URL('../',import.meta.url));
import {openBrowser} from '../shared/cdp.mjs';
const [out='elapse/.out/exploration']=process.argv.slice(2);mkdirSync(out,{recursive:true});const B=await openBrowser({tag:'elapse-exploration'}),rows=[];
try{for(const name of ['titanic','britannic']){
 const loaded=B.nextLoad(15000);await B.S('Page.navigate',{url:pathToFileURL(resolve(skillRoot,'examples/'+name+'.html')).href+'?t=10&style=blueprint'});await loaded;
 await B.evaluate(`(async()=>{for(let i=0;i<100&&!window.__elapse?.ready;i++)await new Promise(r=>setTimeout(r,100));if(!window.__elapse?.ready)throw new Error('not ready');const u=window.__elapse;u.explore(true);u.surveyMotion(false);})()`);
 for(const width of [375,768,1440]){
  await B.S('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await B.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const stops=await B.evaluate(`[...document.querySelector('[data-survey=stop]').options].map(o=>o.value)`);
  for(const stop of stops){const r=await B.evaluate(`(()=>{const u=window.__elapse,s=document.querySelector('[data-survey=stop]');s.value='${stop}';s.dispatchEvent(new Event('change',{bubbles:true}));return {stop:'${stop}',t:u.st.t,...u.R.frame(),overflow:document.documentElement.scrollWidth>innerWidth+1,locked:document.querySelector('.el-track input').disabled,errors:u.errors};})()`);if(r.overflow||!r.locked||r.errors.length||r.inside<.6||r.area<.02||r.eyeZ>0)throw new Error(name+'/'+width+': '+JSON.stringify(r));rows.push({name,width,...r});
   if(['bridge','coral'].includes(stop)){const {data}=await B.S('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,name+'-'+width+'-'+stop+'.png'),Buffer.from(data,'base64'));}
  }
 }
 await B.evaluate(`(()=>{const u=window.__elapse,t=u.st.t;u.play(true);if(u.st.playing||u.st.t!==t)throw new Error('timeline played in exploration');const s=document.querySelector('[data-survey=lamp]');s.value='1.4';s.dispatchEvent(new Event('change',{bubbles:true}));if(u.R.state.lampStrength!==1.4)throw new Error('lamp did not change');const z=u.R.state.zoom;document.querySelector('[data-survey=in]').click();if(u.R.state.zoom>=z||u.R.state.auto)throw new Error('zoom did not take manual control');})()`);
 if(name==='titanic'){
  await B.evaluate(`(()=>{document.querySelector('[data-survey=motion]').click();if(!document.querySelector('[data-explore-time]').textContent.trim())throw new Error('locked date vanished');document.querySelector('[data-survey=motion]').click();})()`);
  const motion=await B.evaluate(`(async()=>{const u=window.__elapse,t=u.st.t,a=u.st.ecoClock;u.surveyMotion(true);await new Promise(r=>setTimeout(r,900));u.surveyMotion(false);if(u.st.t!==t||u.st.ecoClock<=a)throw new Error('independent clock failed');const frozen=u.st.ecoClock;await new Promise(r=>setTimeout(r,150));if(u.st.ecoClock!==frozen)throw new Error('pause failed');return {yearFixed:true,clockAdvanced:true};})()`);console.log(name,motion);
  await B.S('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await B.evaluate(`(async()=>{const u=window.__elapse,a=u.st.ecoClock;u.surveyMotion(true);await new Promise(r=>setTimeout(r,200));if(u.st.ecoClock!==a||u.st.exploreMoving)throw new Error('reduced motion ignored');})()`);await B.S('Emulation.setEmulatedMedia',{features:[]});
 }
 await B.evaluate(`(()=>{const u=window.__elapse;u.explore(false);if(u.st.t!==10||u.st.style!=='blueprint'||u.st.exploring||document.querySelector('.el-track input').disabled)throw new Error('historical context not restored');})()`);if(name==='titanic')await B.evaluate(`(()=>{const u=window.__elapse;u.setT(70,true);u.explore(true);if(!u.R.scene.getObjectByName('exploration-lamp')?.visible)throw new Error('survey lamp missing outside fauna window');u.explore(false);})()`);console.log('PASS '+name+' exploration stops at 3 widths, clock/controls/return');
}
writeFileSync(join(out,'results.json'),JSON.stringify(rows,null,2)+'\n');console.log('EXPLORATION PASS ('+rows.length+' frames)');
}catch(e){console.error('EXPLORATION FAIL: '+e.message);process.exitCode=1;}finally{await B.cleanup();}
