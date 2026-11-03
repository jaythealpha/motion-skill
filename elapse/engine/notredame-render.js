import{configureMaterialBudget,presentationPixelRatio}from'../shared/material-budget.js';
import{surfaceMaterial}from'../shared/material-budget.js';
import{createPresentation}from'../shared/presentation.js';
import {cathedralDetail} from './quality-buildings.js';
import {qualityLighting,qualitySceneMaterials} from './quality-surfaces.js';
import * as THREE from 'three';
import {cathedralForm} from './notredame-form.js';
import {notreDameState} from './notredame-model.js';
const V=([x,y,z])=>new THREE.Vector3(x,z,-y);
export function createNotreDameRenderer(canvas,model,opts={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});configureMaterialBudget(renderer);renderer.setPixelRatio(presentationPixelRatio(renderer));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,5000),root=new THREE.Group();root.rotation.x=-Math.PI/2;scene.add(root);
 const hemi=new THREE.HemisphereLight('#fff8e8','#59646f',2),sun=new THREE.DirectionalLight('#fff3d8',3);sun.position.set(-100,150,80);scene.add(hemi,sun);
 const st={t:0,style:'color',auto:opts.auto!==false,yaw:opts.yaw??null,pitch:opts.pitch??null,zoom:opts.zoom||1,exploring:false,exploreTarget:'overview',lampStrength:1,last:null,cam:null,focusIds:null,focusBox:null,ecoFocus:null};if(st.yaw!=null||st.pitch!=null)st.auto=false;
 const form=cathedralForm(root),{groups:g,mats,roofs,oldTimbers,newTimbers,vaults}=form;
 const initialColors=new Map();root.traverse(o=>{if(o.material&&!initialColors.has(o.material))initialColors.set(o.material,o.material.color.clone());});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(550,400),surfaceMaterial({color:'#b6b3a6',roughness:1}));ground.position.z=-.3;root.add(ground);
 const plinth=new THREE.Mesh(new THREE.BoxGeometry(150,68,.4),surfaceMaterial({color:'#d3cbb8',roughness:1}));plinth.position.set(0,0,-.1);root.add(plinth);
 let progress=notreDameState(model,0);const allBox=()=>({min:[-66,-28,0],max:[66,28,progress.fall<1?96:progress.rebuild>0?96:70]});
 function view(){let b=allBox(),yaw=245,pitch=22;const stop=st.exploring&&model.stops.find(s=>s.id===st.exploreTarget);if(stop&&st.t>=stop.availableFrom){b=structuredClone(stop.box);if(stop.id==='overview')b=allBox();yaw=stop.yaw??225;pitch=stop.pitch??20;}
  st.focusBox=b;st.focusIds=[stop?.id||'overview'];const target=b.min.map((v,k)=>(v+b.max[k])/2),extent=b.max.map((v,k)=>v-b.min[k]);let dist=Math.max(30,Math.hypot(...extent)*.7);if(!st.auto&&st.yaw!=null)yaw=st.yaw;if(!st.auto&&st.pitch!=null)pitch=st.pitch;
  st.cam={target,yaw,pitch,dist};const place=()=>{const y=yaw*Math.PI/180,p=pitch*Math.PI/180;camera.position.copy(V([target[0]+dist*Math.cos(p)*Math.cos(y),target[1]+dist*Math.cos(p)*Math.sin(y),target[2]+dist*Math.sin(p)]));camera.lookAt(V(target));camera.updateMatrixWorld();};place();for(let n=0;n<5;n++){const q=project(b),factor=Math.max(Math.abs(q.minX)/.85,Math.abs(q.maxX)/.85,Math.abs(q.minY)/0.84,Math.abs(q.maxY)/0.84);if(factor<=1.001)break;dist*=factor*1.002;place();}dist*=st.zoom;place();st.cam.dist=dist;camera.near=Math.max(.05,dist/2000);camera.far=dist*10+1500;camera.updateProjectionMatrix();st.eyeZ=camera.position.y;
 }
 function project(b){const nodes=[];if(st.focusIds?.[0]==='overview'){for(const x of [-65,65])for(const y of [-26,26])for(const z of [0,44])nodes.push([x,y,z]);for(const x of [-65,-45])for(const y of [-22,22])nodes.push([x,y,69]);nodes.push([5,0,b.max[2]]);}else for(const x of [b.min[0],b.max[0]])for(const y of [b.min[1],b.max[1]])for(const z of [b.min[2],b.max[2]])nodes.push([x,y,z]);const ps=nodes.map(p=>V(p).project(camera));return {minX:Math.min(...ps.map(p=>p.x)),maxX:Math.max(...ps.map(p=>p.x)),minY:Math.min(...ps.map(p=>p.y)),maxY:Math.max(...ps.map(p=>p.y))};}
 const enhanced=opts.quality==='high';if(enhanced){cathedralDetail(form);qualitySceneMaterials(root,m=>m===mats.wood||m===mats.char?'wood':m===mats.stone||m===mats.trim?'stone':'metal');}
 const presentation=createPresentation(renderer,scene,{kind:'stone',sun,root});
 function render(){view();presentation.update(st);if(enhanced)qualityLighting(renderer,scene,st);renderer.render(scene,camera);opts.onRender?.();}
 function set(o={}){Object.assign(st,o);progress=notreDameState(model,st.t);st.progress=progress;st.last={pieces:new Map(),water:new Map(),lights:0};const bp=st.style==='blueprint';scene.background=new THREE.Color(bp?'#172b40':progress.fire>0?'#a6a6a0':'#e3e6df');ground.material.color.set(bp?'#152639':'#b6b3a6');plinth.material.color.set(bp?'#21384d':'#d3cbb8');
  for(const [m,color] of initialColors){m.color.copy(bp?new THREE.Color('#a9d1dc'):color);if('metalness'in m)m.metalness=bp?0:(m===mats.lead?.35:0);}
  mats.stone.color.copy(bp?new THREE.Color('#95b7c7'):new THREE.Color('#b9ad91').lerp(new THREE.Color('#ded5bd'),progress.clean*.5));mats.dark.color.set(bp?'#132538':'#273541');
  roofs.forEach((q,i)=>{q.visible=progress.damage<(i%9+1)/10||progress.cover>(i%9+1)/10;});
  oldTimbers.forEach((q,i)=>q.visible=progress.damage<(.12+(i%18)/23));g.oldTimber.visible=progress.damage<1;
  newTimbers.forEach((q,i)=>q.visible=progress.timber>(i%18+1)/19);g.newTimber.visible=progress.timber>0;
  g.oldSpire.visible=progress.fall<1;g.oldSpire.rotation.y=-progress.fall*1.2;g.oldSpire.position.z=44-progress.fall*16;
  g.newSpire.visible=progress.rebuild>0;g.newSpire.scale.z=Math.max(.001,progress.rebuild);
  vaults.forEach(q=>q.visible=!q.userData.damaged||progress.damage<.5||progress.vaultRepair>.85);
  g.rubble.visible=progress.damage>.3&&progress.vaultRepair<.85;
  g.oldScaffold.visible=progress.oldScaffold>.01;g.oldScaffold.scale.z=Math.max(.01,progress.oldScaffold);
  g.newScaffold.visible=progress.newScaffold>.01;g.newScaffold.scale.z=Math.max(.01,progress.newScaffold);
  g.support.visible=progress.support>.05;g.tarp.visible=progress.tarp>.1;
  g.fire.visible=progress.fire>.001&&!bp;g.smoke.visible=progress.fire>.001&&!bp;g.fire.scale.z=Math.max(.01,progress.fire);g.fire.position.z=44*(1-progress.fire);g.smoke.children.forEach((q,i)=>{q.scale.setScalar(.5+progress.fire*(1+(i%3)*.2));q.material.opacity=.17*progress.fire;});
  if(st.exploring&&st.exploreTarget==='vault'){g.roof.visible=false;g.oldTimber.visible=false;g.newTimber.visible=false;g.tarp.visible=false;g.oldSpire.visible=false;g.newSpire.visible=false;}else g.roof.visible=true;
  sun.intensity=(bp?0:3)*(st.exploring?st.lampStrength:1);hemi.intensity=bp?2:2;render();}
 const manual=()=>{if(st.yaw==null)st.yaw=st.cam?.yaw??225;if(st.pitch==null)st.pitch=st.cam?.pitch??20;if(st.auto){st.auto=false;st.yaw=st.cam.yaw;st.pitch=st.cam.pitch;opts.onManual?.();}};const pointers=new Map();let pinch=0;
 let renderRaf=0;const requestRender=()=>{if(!renderRaf)renderRaf=requestAnimationFrame(()=>{renderRaf=0;render();});};
 canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture?.(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);manual();if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)st.zoom=Math.max(.2,Math.min(5,st.zoom*pinch/d));pinch=d;}else{st.yaw-=(e.clientX-old[0])*.35;st.pitch=Math.max(-30,Math.min(75,st.pitch+(e.clientY-old[1])*.25));}requestRender();});for(const evt of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(evt,e=>{pointers.delete(e.pointerId);pinch=0;});canvas.addEventListener('wheel',e=>{e.preventDefault();manual();st.zoom=Math.max(.2,Math.min(5,st.zoom*Math.exp(e.deltaY*.001)));requestRender();},{passive:false});canvas.style.touchAction='none';
 const frame=()=>{const p=project(st.focusBox),w=p.maxX-p.minX,h=p.maxY-p.minY,inside=Math.max(0,Math.min(1,p.maxX)-Math.max(-1,p.minX))*Math.max(0,Math.min(1,p.maxY)-Math.max(-1,p.minY));return {area:w*h/4,inside:inside/Math.max(.000001,w*h),ids:st.focusIds,eyeZ:camera.position.y,subjectTop:st.focusBox.max[2]};};
 const diagram=()=>{const T=V(st.cam.target),B=T.clone().add(new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion));T.project(camera);B.project(camera);return {ppm:Math.abs(B.x-T.x)*canvas.clientWidth/2,anchors:model.stops.filter(s=>st.t>=s.availableFrom&&s.id!=='overview').map(s=>{const v=V(s.box.min.map((a,k)=>(a+s.box.max[k])/2)).project(camera);return {id:s.id,name:s.name,x:(v.x+1)/2,y:(1-v.y)/2};})};};
 return {state:st,renderer,scene,camera,set,render,frame,diagram,ecologyInfo:()=>null,probe:()=>({warm:0,water:0}),constructionInfo:()=>({...progress,structuralHeight:96,baseWidth:48,roofPanels:roofs.filter(q=>g.roof.visible&&q.visible).length,newTimbers:newTimbers.filter(q=>g.newTimber.visible&&q.visible).length,vaultPanels:vaults.filter(q=>q.visible).length,oldSpire:g.oldSpire.visible,newSpire:g.newSpire.visible,drawCalls:renderer.info.render.calls}),setAuto(on){st.auto=!!on;if(on)st.zoom=1;render();},reset(){st.auto=true;st.zoom=1;st.yaw=st.pitch=null;render();},restoreView(v){for(const k of ['auto','yaw','pitch','zoom'])st[k]=v[k];render();},zoomBy(f){manual();st.zoom=Math.max(.2,Math.min(5,st.zoom*f));render();},animateEcology(){render();},resize(){renderer.setSize(canvas.clientWidth||800,canvas.clientHeight||500,false);camera.aspect=(canvas.clientWidth||800)/(canvas.clientHeight||500);camera.updateProjectionMatrix();if(!st.last)set({});else render();},dataURL(){render();return canvas.toDataURL('image/png');}};
}
