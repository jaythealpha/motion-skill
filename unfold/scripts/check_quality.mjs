#!/usr/bin/env node
import{openBrowser}from'../shared/cdp.mjs';import{mkdirSync,writeFileSync}from'node:fs';import{resolve,join,dirname}from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=process.argv[2]||'unfold/.out/quality';mkdirSync(out,{recursive:true});const B=await openBrowser({tag:'unfold-quality'}),rows=[];
try{
 await B.S('Page.addScriptToEvaluateOnNewDocument',{source:`window.__qualityErrors=[];const ce=console.error;console.error=(...a)=>{__qualityErrors.push(a.map(String).join(' '));ce(...a)};`});
 for(const name of['galaxy-s24','iphone-17-pro','iphone-duo','galaxy-z-fold8','galaxy-z-flip8'])for(const width of[375,768,1440]){
  await B.S('Emulation.setDeviceMetricsOverride',{width,height:width===375?812:1000,deviceScaleFactor:1,mobile:width===375});
  for(const quality of['high','standard']){
   const load=B.nextLoad(25000);await B.S('Page.navigate',{url:pathToFileURL(resolve(ROOT,`examples/${name}.html`)).href+'?t=40&auto=0'+(quality==='standard'?'&quality=standard':'')});await load;
   await B.evaluate(`(async()=>{for(let i=0;i<160;i++){if(window.__unfold?.ready)return;await new Promise(r=>setTimeout(r,100))}throw Error('not ready')})()`);
   for(const layout of quality==='high'?['stack','knoll']:['stack'])for(const style of quality==='high'?['color','blueprint']:['color']){
    const r=await B.evaluate(`(()=>{const u=__unfold;u.R.setLayout('${layout}');u.R.setStyle('${style}');u.setT(40);u.R.renderNow();return{errors:[...u.errors,...__qualityErrors],overflow:document.documentElement.scrollWidth>innerWidth+1,quality:u.model.meta.renderQuality,parts:u.model.parts.length,gpu:(()=>{const gl=document.querySelector('canvas').getContext('webgl2');if(!gl)return 'unknown';const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)):'unknown'})()}})()`);
    if(r.errors.length||r.overflow||r.quality!==quality)throw Error(JSON.stringify({name,width,quality,layout,style,...r}));rows.push({name,width,quality,layout,style,...r});
    if(style==='color'&&(layout==='stack'||width===1440)){const{data}=await B.S('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(out,`${name}-${width}-${quality}-${layout}.png`),Buffer.from(data,'base64'));}
   }
  }console.log('PASS '+name+' '+width);
 }
 // A deliberately delayed animation frame must not discard elapsed playback time.
 const load=B.nextLoad(25000);await B.S('Page.navigate',{url:pathToFileURL(resolve(ROOT,'examples/galaxy-s24.html')).href+'?t=10&speed=fast&auto=0'});await load;
 const clock=await B.evaluate(`(async()=>{while(!window.__unfold?.ready)await new Promise(r=>setTimeout(r,50));const u=__unfold;u.setT(10);const original=requestAnimationFrame;let sample=null;window.requestAnimationFrame=cb=>original(ts=>{const now=performance.now();cb(ts);if(cb.name==='tick')sample={now,bar:u.st.t}});const t=performance.now();u.play(true);await new Promise(r=>setTimeout(r,100));const stall=performance.now();while(performance.now()-stall<950){}await new Promise(r=>setTimeout(r,500));u.play(false);window.requestAnimationFrame=original;if(!sample||sample.now<stall+950)throw Error('no animation tick after delay');return{moved:sample.bar-10,expected:(sample.now-t)/1000*100/12,errors:u.errors}})()`);
 if(clock.errors.length||Math.abs(clock.moved-clock.expected)>3)throw Error('delayed frame clock '+JSON.stringify(clock));writeFileSync(join(out,'delayed-clock.json'),JSON.stringify(clock,null,2));
 writeFileSync(join(out,'results.json'),JSON.stringify(rows,null,2));console.log('QUALITY PASS '+rows.length+' states');
}catch(e){console.error(e);process.exitCode=1;}finally{await B.cleanup()}
