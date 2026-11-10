import {addHallFinish} from './opera-hall-finish.js';
import * as T from 'three';
import {operaForm} from './opera-form.js';
import {createOperaArtPass} from './opera-art-pass.js';
import {STUDY_TEXT,studyLocale} from './opera-study-i18n.js';
import {studyCamera} from './opera-study-motion.js';
import {configureMaterialBudget,presentationPixelRatio} from '../shared/material-budget.js';
import {createPresentation} from '../shared/presentation.js';
import {qualityLighting} from './quality-surfaces.js';

const params=new URLSearchParams(location.search),$=s=>document.querySelector(s);
let lang=studyLocale(params.get('lang')||'en'),text=STUDY_TEXT[lang];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const initialPosition=Number(params.get('p')||0);
const state={time:Number.isFinite(initialPosition)?Math.max(0,Math.min(36,initialPosition*36)):0,variant:params.get('version')==='before'?'before':'after',playing:false,speed:1,comparing:false,ready:false};
const metrics={before:[],after:[],shots:{before:{overview:[],shells:[],hall:[]},after:{overview:[],shells:[],hall:[]}},renders:{before:[],after:[]},longFrames:{before:0,after:0},errors:[],gpu:'',frames:0};
let renderer,camera,low=false,raf=0,lastTime=0,lastRenderAt=0,currentShot='',scenes={},resizeObserver,disposed=false;
const canvas=$('#study-canvas'),stage=$('#stage'),status=$('#status');
function translate(){text=STUDY_TEXT[lang];document.documentElement.lang=lang;document.title=`${text.sub} · Elapse`;
 for(const el of document.querySelectorAll('[data-text]'))el.textContent=text[el.dataset.text];
 for(const el of document.querySelectorAll('[data-label]'))el.setAttribute('aria-label',text[el.dataset.label]);
 $('#language').value=lang;for(const link of document.querySelectorAll('[data-original]'))link.href=`https://jaythealpha.github.io/motion-skill/elapse/examples/sydney-opera-house.html?t=100&mode=explore&stop=hall&lang=${lang}&view=scene`;
 $('#compare-before').alt=text.before;$('#compare-after').alt=text.after;
 updateControls();}
function updateControls(){
 $('#play').textContent=state.playing?text.pause:state.time>=36?text.replay:text.play;
 $('#play').setAttribute('aria-pressed',String(state.playing));
 for(const button of document.querySelectorAll('[data-version]'))button.setAttribute('aria-pressed',String(button.dataset.version===state.variant));
 $('#version-label').textContent=text[state.variant];$('#time').textContent=`${state.time.toFixed(1).padStart(4,'0')} / 36 s`;
 $('#seek').value=state.time;$('#seek').setAttribute('aria-valuetext',`${state.time.toFixed(1)} / 36 seconds`);
 const shot=state.time<12?'overview':state.time<25?'shells':'hall';
 $('#shot-label').textContent=text[shot];for(const b of document.querySelectorAll('[data-shot]'))b.setAttribute('aria-pressed',String(b.dataset.shot===shot));
 $('#compare').textContent=state.comparing?text.back:text.compare;
 $('#compare-note').textContent=state.comparing?text.pausedCompare:'';
 if(state.ready)status.textContent=reduced.matches?text.motion:text.ready;
}
const V=([x,y,z])=>new T.Vector3(x,z,-y),progress={podium:1,shells:1,fitout:1,organ:1,renewal:1,phase:4};
function frameFor(sceneState){const view=studyCamera(state.time,camera.aspect);camera.position.copy(V(view.eye));camera.lookAt(V(view.target));camera.updateMatrixWorld();
 const yaw=Math.atan2(view.eye[1]-view.target[1],view.eye[0]-view.target[0])*180/Math.PI;
 sceneState.form.apply(progress,{exploring:view.interior,exploreTarget:'hall',cam:{yaw}});
 if(sceneState.interior!==view.interior){sceneState.interior=view.interior;renderer.shadowMap.needsUpdate=true;}
 sceneState.presentation.update({style:'color'});qualityLighting(renderer,sceneState.scene,{style:'color'});
 sceneState.art?.update(state.time,view.interior);
 if(sceneState.art){sceneState.scene.environmentIntensity=view.interior?.28:.23;renderer.toneMappingExposure=view.interior?1.04:.88;}
 return view;
}
function draw(){if(!state.ready||disposed)return;
 const s=scenes[state.variant],view=frameFor(s),start=performance.now();
 renderer.render(s.scene,camera);const elapsed=performance.now()-start;
 metrics.renders[state.variant].push(elapsed);if(metrics.renders[state.variant].length>900)metrics.renders[state.variant].shift();
 metrics.frames++;metrics.drawCalls=renderer.info.render.calls;metrics.triangles=renderer.info.render.triangles;
 metrics.textures=renderer.info.memory.textures;metrics.geometries=renderer.info.memory.geometries;
 if(currentShot!==view.shot){currentShot=view.shot;$('#shot-label').textContent=text[view.shot];}
 if(metrics.frames%30===0||!state.playing)$('#performance-data').textContent=JSON.stringify(report());
 updateControls();}
function loop(now){raf=0;if(disposed||!state.playing)return;
 const dt=lastTime?(now-lastTime)/1000:0;lastTime=now;
 if(!document.hidden){if(lastRenderAt){const interval=now-lastRenderAt;metrics[state.variant].push(interval);const samples=metrics.shots[state.variant][state.time<12?'overview':state.time<25?'shells':'hall'];samples.push(interval);if(samples.length>900)samples.shift();if(interval>50)metrics.longFrames[state.variant]++;if(metrics[state.variant].length>900)metrics[state.variant].shift();}lastRenderAt=now;
  state.time=Math.min(36,state.time+Math.min(dt,.15)*state.speed);draw();}
 else lastRenderAt=0;
 if(state.time>=36){pause();return;}raf=requestAnimationFrame(loop);
}
function pause(){state.playing=false;lastTime=lastRenderAt=0;if(raf)cancelAnimationFrame(raf);raf=0;updateControls();if(state.ready)$('#performance-data').textContent=JSON.stringify(report());}
function play(){if(!state.ready)return;if(state.comparing)toggleComparison();if(state.time>=36)state.time=0;state.playing=true;lastTime=lastRenderAt=0;if(!raf)raf=requestAnimationFrame(loop);updateControls();}
function seek(time){pause();state.time=Math.max(0,Math.min(36,time));if(state.comparing)captureComparison();else draw();}
function variant(value){if(state.variant===value)return;state.variant=value;lastRenderAt=0;renderer.shadowMap.needsUpdate=true;if(!state.comparing)draw();else updateControls();}
function captureComparison(){pause();const selected=state.variant;
 for(const [key,id]of[['before','#compare-before'],['after','#compare-after']]){state.variant=key;renderer.shadowMap.needsUpdate=true;draw();$(id).src=canvas.toDataURL('image/jpeg',.92);}
 state.variant=selected;renderer.shadowMap.needsUpdate=true;draw();updateControls();}
function toggleComparison(){if(!state.ready)return;state.comparing=!state.comparing;pause();
 stage.classList.toggle('is-comparing',state.comparing);
 $('#stills').hidden=!state.comparing;canvas.hidden=state.comparing;
 if(state.comparing)captureComparison();else draw();updateControls();}
function resize(){if(!renderer||!camera||state.comparing)return;const r=stage.getBoundingClientRect(),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));
 renderer.setPixelRatio(presentationPixelRatio(renderer));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 renderer.shadowMap.needsUpdate=true;if(state.ready){if(state.comparing)captureComparison();else draw();}}
function percentile(a,p){if(!a.length)return null;const q=[...a].sort((x,y)=>x-y);return Math.round(q[Math.min(q.length-1,Math.floor(q.length*p))]*100)/100;}
function report(){return{...metrics,before:undefined,after:undefined,renders:undefined,shots:Object.fromEntries(['before','after'].map(k=>[k,Object.fromEntries(Object.entries(metrics.shots[k]).map(([name,a])=>[name,{samples:a.length,medianMs:percentile(a,.5),p95Ms:percentile(a,.95)}]))])),samples:Object.fromEntries(['before','after'].map(k=>[k,{frames:metrics[k].length,medianMs:percentile(metrics[k],.5),p95Ms:percentile(metrics[k],.95),renderMedianMs:percentile(metrics.renders[k],.5),renderP95Ms:percentile(metrics.renders[k],.95),longFrames:metrics.longFrames[k]}])),state:{...state},low,pixelRatio:renderer?.getPixelRatio(),size:renderer?.getSize(new T.Vector2()).toArray(),renderer:renderer?.info.render};}
window.addEventListener('error',e=>metrics.errors.push(e.message));window.addEventListener('unhandledrejection',e=>metrics.errors.push(String(e.reason)));
async function init(){try{
 renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});low=configureMaterialBudget(renderer);metrics.gpu=renderer.userData.gpu;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.autoUpdate=false;
 camera=new T.PerspectiveCamera(36,1,.15,5000);
 for(const name of ['before','after']){
  const scene=new T.Scene(),root=new T.Group();root.rotation.x=-Math.PI/2;scene.add(root);
  const sun=new T.DirectionalLight('#fff1dc',3.1),hemi=new T.HemisphereLight('#e6f3ff','#676659',1.35);sun.position.set(-110,230,160);scene.add(sun,hemi);
  const form=operaForm(root,{artPass:name==='after'&&!low});
  // Clone mutable texture transforms so the art pass cannot change the baseline cache.
  if(name==='after')for(const material of form.materials)for(const key of ['map','normalMap','roughnessMap','bumpMap'])if(material[key]?.isTexture)material[key]=material[key].clone();
  const presentation=createPresentation(renderer,scene,{kind:'architecture',sun,root});
  const art=name==='after'?createOperaArtPass({renderer,scene,root,form,low,sun}):null;
  if(name==='after')addHallFinish(form);
  scenes[name]={scene,root,sun,hemi,form,presentation,art};
 }
 resize();
 // Warm every visibility state, texture and shader before enabling playback.
 const time=state.time,selected=state.variant;
 for(const key of ['before','after'])for(const t of [0,18,31]){state.variant=key;state.time=t;frameFor(scenes[key]);renderer.shadowMap.needsUpdate=true;if(renderer.compileAsync)await renderer.compileAsync(scenes[key].scene,camera);renderer.render(scenes[key].scene,camera);}
 renderer.getContext().finish(); // One setup-only synchronization, never during playback.
 state.variant=selected;state.time=time;state.ready=true;renderer.shadowMap.needsUpdate=true;draw();
 $('#loading').hidden=true;for(const b of document.querySelectorAll('[data-needs-ready]'))b.disabled=false;
 resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
 window.__operaStudy={report,scenes,renderer,camera,state};
 if(params.get('compare')==='1')toggleComparison();
 if(params.get('play')==='1'&&!reduced.matches)play();
 }catch(error){metrics.errors.push(String(error));$('#loading').hidden=true;$('#error').hidden=false;status.textContent=text.failure;console.error('Opera study initialization failed',error);}}
$('#play').addEventListener('click',()=>state.playing?pause():play());
$('#seek').addEventListener('input',e=>seek(Number(e.target.value)));
$('#reset').addEventListener('click',()=>seek(0));$('#compare').addEventListener('click',toggleComparison);
$('#speed').addEventListener('change',e=>{state.speed=Number(e.target.value);});
for(const b of document.querySelectorAll('[data-version]'))b.addEventListener('click',()=>variant(b.dataset.version));
for(const b of document.querySelectorAll('[data-shot]'))b.addEventListener('click',()=>seek({overview:0,shells:18,hall:29}[b.dataset.shot]));
$('#language').addEventListener('change',e=>{lang=studyLocale(e.target.value);const url=new URL(location);url.searchParams.set('lang',lang);history.replaceState(null,'',url);translate();});
$('#retry').addEventListener('click',()=>location.reload());
document.addEventListener('keydown',e=>{if(/^(INPUT|SELECT|TEXTAREA|BUTTON|A)$/.test(e.target.tagName)||e.altKey||e.metaKey||e.ctrlKey)return;
 if(e.code==='Space'){e.preventDefault();state.playing?pause():play();}
 if(e.key==='1')variant('before');if(e.key==='2')variant('after');
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();seek(state.time+(e.key==='ArrowRight'?2:-2));}});
document.addEventListener('visibilitychange',()=>{lastTime=lastRenderAt=0;});
reduced.addEventListener('change',()=>{if(reduced.matches)pause();updateControls();});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();pause();status.textContent=text.failure;$('#error').hidden=false;});
window.addEventListener('pageshow',e=>{if(e.persisted){resize();draw();}});
window.addEventListener('pagehide',e=>{pause();if(e.persisted)return;disposed=true;resizeObserver?.disconnect();const geometries=new Set(),materials=new Set(),textures=new Set();
 for(const s of Object.values(scenes)){s.art?.dispose();s.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);});for(const t of [s.scene.environment,s.scene.background])if(t?.isTexture)textures.add(t);}
 for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}for(const g of geometries)g.dispose();for(const t of textures)t.dispose();renderer?.dispose();});
translate();init();
