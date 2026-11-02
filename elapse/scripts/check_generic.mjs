#!/usr/bin/env node
// General UI regression against newly built pages, including an unfamiliar ship.
import {writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {openBrowser} from '../shared/cdp.mjs';
const [dir='elapse/.out/generalization']=process.argv.slice(2),out=resolve(dir);mkdirSync(out,{recursive:true});
const B=await openBrowser({tag:'elapse-generic'}),rows=[];
try{for(const name of ['lusitania','titanic','britannic','eiffel-tower','notre-dame','world-trade-center']){
 const load=B.nextLoad(15000);await B.S('Page.navigate',{url:pathToFileURL(join(out,name+'.html')).href+'?t=50'});await load;
 await B.evaluate(`(async()=>{for(let i=0;i<100&&!window.__elapse?.ready;i++)await new Promise(r=>setTimeout(r,100));if(!window.__elapse?.ready)throw Error('not ready');await document.fonts.ready;})()`);
 for(const [width,height] of [[375,667],[375,812],[768,1024],[1440,900]]){
 await B.S('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width===375});await B.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
 for(const style of ['color','blueprint']){
 const r=await B.evaluate(`(()=>{const u=window.__elapse;u.st.style='${style}';u.setT(50,true);const slots=[...document.querySelectorAll('.el-card,[data-gauge]')].map(e=>e.getBoundingClientRect());for(let i=0;i<slots.length;i++)for(let j=i+1;j<slots.length;j++){const a=slots[i],b=slots[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)throw Error('overlapping slots');}if(document.documentElement.scrollWidth>innerWidth+1)throw Error('horizontal overflow');if(u.errors.length)throw Error(u.errors.join());return {errors:u.errors,slots:slots.length};})()`);
 rows.push({name,width,height,style,...r});
 if(style==='color'&&height!==667){const {data}=await B.S('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(out,name+'-'+width+'.png'),Buffer.from(data,'base64'));}
 }
 }
 const explore=await B.evaluate(`(()=>{const u=window.__elapse;u.setT(50,true);u.explore(true);if(!u.st.exploring||!document.querySelector('.el-track input').disabled)throw Error('exploration not locked');const select=document.querySelector('[data-survey=stop]');if(!select.options.length||!u.R.frame().ids.length)throw Error('no exploration target');const frame=u.R.frame();if(frame.inside<.6||frame.area<.02)throw Error('exploration target out of frame');u.explore(false);if(u.st.t!==50||u.st.style!=='blueprint'||document.querySelector('.el-track input').disabled)throw Error('context not restored');return {restored:true,frame};})()`);
 rows.push({name,explore});console.log('PASS '+name+' 8 layout states + exploration return');
 }writeFileSync(join(out,'generic-results.json'),JSON.stringify(rows,null,2)+'\n');console.log('GENERIC PASS (48 layouts + 6 exploration round trips)');
}catch(e){console.error(e);process.exitCode=1;}finally{await B.cleanup();}
