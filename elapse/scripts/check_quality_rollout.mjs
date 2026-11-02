#!/usr/bin/env node
import {openBrowser}from'../shared/cdp.mjs';import{mkdirSync,writeFileSync}from'node:fs';import{resolve,join}from'node:path';import{pathToFileURL}from'node:url';
const [out='elapse/.out/quality-rollout']=process.argv.slice(2);mkdirSync(out,{recursive:true});const B=await openBrowser({tag:'quality-rollout'}),rows=[];
try{await B.S('Page.addScriptToEvaluateOnNewDocument',{source:`window.__rolloutErrors=[];const old=console.error;console.error=(...args)=>{window.__rolloutErrors.push(args.map(String).join(' '));old(...args);};addEventListener('error',e=>window.__rolloutErrors.push(e.message));`});
const subjects=process.argv.slice(3);
for(const name of (subjects.length?subjects:['titanic','britannic','eiffel-tower','notre-dame','world-trade-center','titanic-break-study','wtc-impact-study'])){
 for(const [width,height]of[[375,812],[768,1024],[1440,900]]){
  await B.S('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===375});const load=B.nextLoad(25000);await B.S('Page.navigate',{url:pathToFileURL(resolve('elapse/examples',name+'.html')).href});await load;
  await B.evaluate(`(async()=>{for(let i=0;i<150;i++){if(window.__elapse?.ready||window.__study||window.__wtcStudy)return;await new Promise(r=>setTimeout(r,100));}throw Error('not ready')})()`);
  const study=name.endsWith('study');
  if(study){for(const p of[0,.48,.86,1]){const r=await B.evaluate(`(()=>{const u=window.__study||window.__wtcStudy;u.draw?u.draw(${p}):u.set(${p});return {errors:[...window.__rolloutErrors,...(u.errors||[])],overflow:document.documentElement.scrollWidth>innerWidth+1};})()`);if(r.errors.length||r.overflow)throw Error(name+': '+JSON.stringify(r));rows.push({name,width,p,...r});} }
  else{
   for(const style of['color','blueprint'])for(const t of[0,40,85,100]){const r=await B.evaluate(`(()=>{const u=window.__elapse;u.st.style='${style}';u.setT(${t},true);return {frame:u.R.frame(),errors:[...u.errors,...window.__rolloutErrors],overflow:document.documentElement.scrollWidth>innerWidth+1};})()`);if(r.errors.length||r.overflow||r.frame.inside<.6||r.frame.area<.02)throw Error(name+'/'+width+'/'+style+'/'+t+': '+JSON.stringify(r));rows.push({name,width,style,t,...r});
    if(style==='color'&&[0,85].includes(t)){const{data}=await B.S('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(out,`${name}-${width}-${t}.png`),Buffer.from(data,'base64'));}
   }
   await B.evaluate(`(()=>{const u=window.__elapse;u.st.style='color';u.setT(85,true);u.explore(true);})()`);
   const stops=await B.evaluate(`[...document.querySelector('[data-survey=stop]').options].filter(o=>!o.disabled).map(o=>o.value)`);
   for(const stop of stops){const r=await B.evaluate(`(()=>{const u=window.__elapse,s=document.querySelector('[data-survey=stop]');s.value=${JSON.stringify(stop)};s.dispatchEvent(new Event('change',{bubbles:true}));return {frame:u.R.frame(),errors:[...u.errors,...window.__rolloutErrors]};})()`);if(r.errors.length||r.frame.inside<.6||r.frame.area<.02)throw Error(name+'/'+stop+': '+JSON.stringify(r));rows.push({name,width,stop,...r});if((name==='titanic'&&['bow-break','stern-break'].includes(stop))||(name==='world-trade-center'&&stop==='north')){const{data}=await B.S('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(out,`${name}-${width}-${stop}.png`),Buffer.from(data,'base64'));}}
   await B.evaluate(`(()=>{const u=window.__elapse;u.explore(false);if(u.st.t!==85||u.st.style!=='color')throw Error('context not restored');let n=0;u.R.scene.traverse(o=>{const p=o.geometry?.attributes.position;if(p&&!p.array.every(Number.isFinite))n++;});if(n)throw Error('non-finite geometry');})()`);
  }
 }
 console.log('PASS '+name+' at 3 widths');
}
writeFileSync(join(out,'results.json'),JSON.stringify(rows,null,2)+'\n');console.log('ROLLOUT PASS '+rows.length+' states');
}catch(e){console.error('ROLLOUT FAIL',e);process.exitCode=1;}finally{await B.cleanup();}
