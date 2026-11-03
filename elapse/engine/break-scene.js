import{tr,sceneLanguagePicker}from'../shared/locale.js';
// A focused, reversible directing study. Simulation poses stay in the researched model.
import * as THREE from 'three';
import { normalizeModel } from './model.js';
import { timeToBar, parseAt } from './chapters.js';
import { createRenderer } from './render.js';
import { rng, apply } from './math.js';

const raw=JSON.parse(document.querySelector('#elapse-model').textContent), model=normalizeModel(raw);
const canvas=document.querySelector('canvas'), R=createRenderer(canvas,model,{auto:false,cinematic:false,quality:model.meta.renderQuality});
const q=new URLSearchParams(location.search), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const errors=[]; addEventListener('error',e=>errors.push(e.message));
const root=new THREE.Group(); root.rotation.x=-Math.PI/2; R.scene.add(root);
// Replace the featureless surface in this study only.
R.scene.traverse(o=>{if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&o.geometry.parameters.width===30000)o.visible=false;});
const seaGeo=new THREE.PlaneGeometry(3600,3600,100,100);
const seaMat=new THREE.ShaderMaterial({uniforms:{clock:{value:0},impact:{value:0},focus:{value:new THREE.Vector2()}},side:THREE.DoubleSide,transparent:true,depthWrite:false,
vertexShader:`varying vec2 xy; varying float wave; uniform float clock; void main(){xy=position.xy;vec3 p=position;wave=sin(p.x*.09+clock*1.3)*.33+sin(p.y*.16-clock*.8)*.19+sin((p.x+p.y)*.041+clock)*.32;p.z+=wave;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
fragmentShader:`varying vec2 xy;varying float wave;uniform float clock;uniform float impact;uniform vec2 focus;void main(){float d=length((xy-focus)*vec2(.65,1.));float rings=pow(max(0.,sin(d*.29-clock*2.6)),18.)*exp(-d*.012)*impact;float crest=pow(max(0.,wave+.12),6.);float streak=pow(max(0.,sin(xy.x*.08+xy.y*.21+clock*.7)),24.);vec3 col=mix(vec3(.012,.033,.065),vec3(.055,.16,.23),clamp(wave*.5+.4,0.,1.));col+=vec3(.16,.27,.32)*crest+vec3(.1,.16,.18)*streak*.24+vec3(.38,.65,.72)*rings;gl_FragColor=vec4(col,.76);}`});
const sea=new THREE.Mesh(seaGeo,seaMat);root.add(sea);
const random=rng(802), N=1800, seeds=Array.from({length:N},()=>[random(),random(),random(),random()]);
const positions=new Float32Array(N*3), sizes=new Float32Array(N), alphas=new Float32Array(N);
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3));pg.setAttribute('size',new THREE.BufferAttribute(sizes,1));pg.setAttribute('alpha',new THREE.BufferAttribute(alphas,1));
const particles=new THREE.Points(pg,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
vertexShader:`attribute float size;attribute float alpha;varying float a;void main(){a=alpha;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*420./max(10.,-p.z),1.,20.);gl_Position=projectionMatrix*p;}`,
fragmentShader:`varying float a;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(.68,.87,1.,a*(1.-d*d));}`}));particles.frustumCulled=false;root.add(particles);
const fill=new THREE.DirectionalLight('#9bc7ed',2.8); fill.position.set(50,180,-100);R.scene.add(fill);
const toWorld=p=>new THREE.Vector3(p[0],p[2],-p[1]);
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Screen time is intentionally non-uniform: linger around separation, then resume the fall.
export function secondsAt(p){const ks=[[0,-50],[.28,-4],[.56,8],[.82,42],[1,75]];let i=ks.findIndex(k=>k[0]>=p);if(i<=0)return ks[0][1];let[a,b]=[ks[i-1],ks[i]];return a[1]+(b[1]-a[1])*(p-a[0])/(b[0]-a[0]);}
let progress=+(q.get('p')||0), playing=false, last=0, total=30;
function draw(p){progress=Math.max(0,Math.min(1,p));const sec=secondsAt(progress),at=parseAt('1912-04-15T02:18')+sec*1000,t=timeToBar(model,at);
R.set({t,xray:false});
const state=R.state.last,ship=state.pieces.get('ship'), bow=state.pieces.get('hull-bow'),stern=state.pieces.get('hull-stern');
const hinge=apply(ship.matrix,[-16,0,16]);
const after=ease((sec-3)/55), target=hinge.map((v,i)=>v+(i===2?-25*after:0));
const heading=100*Math.PI/180, yaw=(heading*180/Math.PI-87+9*ease(progress))*Math.PI/180;
const dist=(330-50*ease(progress/.35)+125*after)*Math.max(1,1.95/(canvas.clientWidth/canvas.clientHeight));
const eye=[target[0]+Math.cos(yaw)*dist,target[1]+Math.sin(yaw)*dist,target[2]+dist*.20];
R.camera.position.copy(toWorld(eye));R.camera.lookAt(toWorld(target));R.camera.updateMatrixWorld();R.scene.fog=null;R.scene.background=new THREE.Color('#030a12');
sea.position.set(ship.pos[0],ship.pos[1],0);seaMat.uniforms.clock.value=progress*30;seaMat.uniforms.focus.value.set(hinge[0]-ship.pos[0],hinge[1]-ship.pos[1]);seaMat.uniforms.impact.value=Math.sin(Math.PI*ease((sec+2)/65))*1.5;
const impact=Math.max(0,Math.min(1,(sec+1)/5));
for(let i=0;i<N;i++){const[a,b,c,d]=seeds[i], plume=i<1050;
let x,y,z,opacity;
if(plume){const age=((sec+2)*.18+a*2.4)%2.4,angle=b*Math.PI*2,spread=(8+age*27),centre=apply(bow.matrix,[-6+c*14,0,8]);x=centre[0]+Math.cos(angle)*spread;y=centre[1]+Math.sin(angle)*spread*.6;z=Math.max(-3,centre[2])+age*(20+c*16)-15*age*age;opacity=sec< -1?0:impact*(1-age/2.4)*.6;if(z<-.5)opacity*=.18;}
else{const age=(progress*22+a*6)%6,side=b>.5?1:-1,along=(c-.5)*210,base=apply(ship.matrix,[along,side*13,0]);x=base[0]+Math.cos(heading)*age*3;y=base[1]+Math.sin(heading)*age*3;z=.3+Math.sin(a*24+progress*20)*.3;opacity=.12+d*.24;if(sec>25)opacity*=.5;}
positions.set([x,y,z],i*3);sizes[i]=plume?2+d*3.5:1+d*2;alphas[i]=opacity;}
pg.attributes.position.needsUpdate=pg.attributes.size.needsUpdate=pg.attributes.alpha.needsUpdate=true;
R.renderer.render(R.scene,R.camera);
document.querySelector('#timeline').value=progress*1000;document.querySelector('#time').textContent=new Date(at).toISOString().slice(11,19);
const stage=sec<0?0:sec<15?1:2;document.querySelectorAll('[data-beat]').forEach((el,i)=>el.classList.toggle('active',i===stage));
document.querySelector('#caption').textContent=[tr("들린 선미 · 선체에 집중되는 하중"),tr("정전, 그리고 분리 · 갈라지는 틈을 따라 시선을 이동"),tr("가라앉는 선수와 잠시 내려앉는 선미")][stage];
document.querySelector('#rate').textContent=sec>=-4&&sec<=8?tr("SLOW MOTION · 분리 순간 확대"):tr("시간 압축 재생");
window.__study.state={p:progress,t,sec,particles:N,errors};}
function play(on){if(on&&playing)return;playing=on;document.querySelector('#play').textContent=on?tr("일시정지"):tr("재생");if(!on)return;if(progress>=1)progress=0;last=performance.now();requestAnimationFrame(tick);}
function tick(now){if(!playing)return;const dt=Math.min(.2,(now-last)/1000);last=now;draw(progress+dt/total);if(progress>=1)play(false);else requestAnimationFrame(tick);}
document.querySelector('#play').onclick=()=>play(!playing);
document.querySelector('#replay').onclick=()=>{draw(0);play(true);};
document.querySelector('#timeline').oninput=e=>{play(false);draw(+e.target.value/1000);};
document.querySelector('#speed').onchange=e=>total=30/(+e.target.value);
document.querySelectorAll('[data-beat]').forEach(el=>el.onclick=()=>{play(false);draw(+el.dataset.beat);});
addEventListener('resize',()=>{R.resize();draw(progress);});
window.__study={draw,play,errors,state:{}};R.resize();draw(progress);if(q.get('play')==='1'&&!reduced)play(true);

sceneLanguagePicker(()=>{const resume=playing;play(false);draw(progress);if(resume)play(true)});
