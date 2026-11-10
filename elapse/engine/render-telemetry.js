// Bounded local diagnostics. No network, identifiers or user data.
export function createRenderTelemetry(renderer,canvas){
 const intervals=[],cpu=[];let started=0,last=0,playing=false,frames=0,longFrames=0,meta={};
 const percentile=(rows,p)=>{if(!rows.length)return null;const a=[...rows].sort((x,y)=>x-y);return Math.round(a[Math.min(a.length-1,Math.floor(a.length*p))]*100)/100;};
 const info=()=>({frames,samples:intervals.length,medianMs:percentile(intervals,.5),p95Ms:percentile(intervals,.95),cpuP95Ms:percentile(cpu,.95),longFrames,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,low:!!renderer.userData.lightweight,gpu:renderer.userData.gpu,pixelRatio:renderer.getPixelRatio(),buffer:[canvas.width,canvas.height],...meta});
 return{reset(){intervals.length=cpu.length=0;last=frames=longFrames=0;},start(on=false){const now=performance.now();playing=!!on&&!document.hidden;if(playing&&last){const dt=now-last;intervals.push(dt);if(intervals.length>600)intervals.shift();if(dt>50)longFrames++;}last=playing?now:0;started=now;},finish(data={}){cpu.push(performance.now()-started);if(cpu.length>600)cpu.shift();meta=data;frames++;if(!playing||frames%30===0)canvas.dataset.renderMetrics=JSON.stringify(info());},info};
}
