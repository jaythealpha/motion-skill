#!/usr/bin/env node
// Check representative detail-camera entry/exit against the actual projected target bounds.
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {openBrowser} from '../shared/cdp.mjs';
const [page,out]=process.argv.slice(2);if(!page){console.error('usage: node scripts/check_camera.mjs page.html [out.json]');process.exit(64);}
const B=await openBrowser({tag:'elapse-camera'}),results=[];
try{
 const loaded=B.nextLoad(15000);await B.S('Page.navigate',{url:pathToFileURL(resolve(page)).href+'?style=blueprint'});await loaded;
 await B.evaluate(`(async()=>{for(let i=0;i<100&&!window.__elapse?.ready;i++)await new Promise(r=>setTimeout(r,100));if(!window.__elapse?.ready)throw new Error('page not ready');})()`);
 for(const width of [375,768,1440]){
  await B.S('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await B.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const rows=await B.evaluate(`(()=>{const u=window.__elapse;return [79.9,80,80.5,81,81.5,82,85,86,86.5,87,87.5,88,88.1].map(t=>{u.setT(t,true);return {t,...u.R.frame()};});})()`);
  for(const r of rows){if(r.inside<.6||r.area<.02)throw new Error('target lost at '+width+'px / '+r.t+': '+JSON.stringify(r));if(r.eyeZ>0&&r.subjectTop< -10)throw new Error('camera above surface over deep wreck');}
  results.push({width,rows});console.log('PASS '+width+'px: detail camera entry/hold/exit, 13 states');
 }
 if(out)writeFileSync(out,JSON.stringify(results,null,2)+'\n');console.log('CAMERA PASS (39 states)');
}catch(e){console.error('CAMERA FAIL: '+e.message);process.exitCode=1;}finally{await B.cleanup();}
