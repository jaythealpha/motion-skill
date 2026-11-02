#!/usr/bin/env node
// Regression: timeline changes must not move the information slots or playback bar.
// node elapse/scripts/check_layout.mjs example.html [out.json]
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {openBrowser} from '../shared/cdp.mjs';
const [page,out]=process.argv.slice(2);
if(!page){console.error('usage: node scripts/check_layout.mjs page.html [out.json]');process.exit(64);}
const B=await openBrowser({tag:'elapse-layout'}),results=[];
try{
  const loaded=B.nextLoad(15000);
  await B.S('Page.navigate',{url:pathToFileURL(resolve(page)).href});await loaded;
  await B.evaluate(`(async()=>{for(let i=0;i<100&&!window.__elapse?.ready;i++)await new Promise(r=>setTimeout(r,100));if(!window.__elapse?.ready)throw new Error('page not ready');await document.fonts.ready;})()`);
  for(const [width,height] of [[375,667],[375,812],[768,1024],[1440,900]]){
    await B.S('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await B.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    for(const style of ['color','blueprint']){
      const rows=await B.evaluate(`(()=>{const u=window.__elapse;u.st.style=${JSON.stringify(style)};return [0,40,65,90,100].map(t=>{u.setT(t,true);return {t,overflow:document.documentElement.scrollWidth>innerWidth+1,slots:[...document.querySelectorAll('.el-card,[data-gauge],.el-bar')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y+scrollY,r.width,r.height];})};});})()`);
      for(const row of rows)for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=row.slots[i],b=row.slots[j];if(Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])>1&&Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1])>1)throw new Error('information slots overlap');}
      if(rows[0].slots.length!==5)throw new Error('missing information slot');
      for(const row of rows){if(row.overflow)throw new Error(`horizontal overflow at ${width}/${style}/${row.t}`);for(let i=0;i<5;i++)for(let k=0;k<4;k++)if(Math.abs(row.slots[i][k]-rows[0].slots[i][k])>.5)throw new Error(`moving slot ${i} at ${width}/${style}/${row.t}`);}
      results.push({width,height,style,rows});console.log(`PASS ${width}px ${style}: 5 timeline positions, 5 stable slots`);
    }
  }
  if(out)writeFileSync(out,JSON.stringify(results,null,2)+'\n');
  console.log('LAYOUT PASS (40 states)');
}catch(e){console.error('LAYOUT FAIL: '+e.message);process.exitCode=1;}finally{await B.cleanup();}
