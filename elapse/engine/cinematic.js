// Deterministic illustrative water/particles; not a fluid or structural solver.
import * as THREE from 'three';
import {ecologyMode} from './ecology-model.js';
import { rng, apply } from './math.js';
import { barToTime, parseAt } from './chapters.js';
import { directingBeat, smooth, isBritannic } from './directing.js';
import { pieceWorldBox } from './camera.js';
export function createCinematic(root, model, surface) {
  const britannic=isBritannic(model);
  surface.visible=false;
  const group=new THREE.Group();root.add(group);
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{day:{value:britannic?1:0},clock:{value:0},impact:{value:0},focus:{value:new THREE.Vector2()}},
    vertexShader:`varying vec2 xy;varying float wave;uniform float clock;void main(){xy=position.xy;vec3 p=position;wave=sin(p.x*.09+clock*1.3)*.33+sin(p.y*.16-clock*.8)*.19+sin((p.x+p.y)*.041+clock)*.32;p.z+=wave;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`varying vec2 xy;varying float wave;uniform float clock;uniform float impact;uniform float day;uniform vec2 focus;void main(){float d=length((xy-focus)*vec2(.65,1.));float rings=pow(max(0.,sin(d*.29-clock*2.6)),18.)*exp(-d*.012)*impact;float crest=pow(max(0.,wave+.12),6.);vec3 col=mix(vec3(.012,.033,.065),vec3(.055,.16,.23),clamp(wave*.5+.4,0.,1.));col=mix(col,vec3(.035,.25,.32)+wave*.07,day);col+=vec3(.16,.27,.32)*crest+vec3(.38,.65,.72)*rings;gl_FragColor=vec4(col,mix(.70,.45,day));}`});
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(britannic?30000:3600,britannic?30000:3600,britannic?180:100,britannic?180:100),material);group.add(sea);
  const N=2200, random=rng(802), seeds=Array.from({length:N},()=>[random(),random(),random(),random()]);
  const xyz=new Float32Array(N*3), alpha=new Float32Array(N), sizes=new Float32Array(N), colors=new Float32Array(N*3);
  const geo=new THREE.BufferGeometry();for(const [name,array,size] of [['position',xyz,3],['alpha',alpha,1],['size',sizes,1],['tint',colors,3]])geo.setAttribute(name,new THREE.BufferAttribute(array,size));
  const points=new THREE.Points(geo,new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    vertexShader:`attribute float alpha;attribute float size;attribute vec3 tint;varying float a;varying vec3 c;void main(){a=alpha;c=tint;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*420./max(10.,-p.z),1.,32.);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying float a;varying vec3 c;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(c,a*(1.-d*d));}`}));points.frustumCulled=false;group.add(points);
  function update(st) {
    const {t,last:s}=st, beat=directingBeat(model,t), {id,p}=beat;
    group.visible=st.style==='color';surface.visible=!group.visible; if(!group.visible)return;
    if(britannic){updateBritannic(st);return;}
    const ship=s.pieces.get('ship'),bow=s.pieces.get('hull-bow'),stern=s.pieces.get('hull-stern');
    const sec=(barToTime(model,t)-parseAt('1912-04-15T02:18'))/1000;
    const clock=id==='collision'?p*16:id==='flooding'?16+p*80:id==='break'?96+p*36:132+p*40;
    sea.visible=t<47;sea.position.set(ship.pos[0],ship.pos[1],0);material.uniforms.clock.value=clock;
    const contact=apply(ship.matrix,[105,-14,11]),hinge=apply(ship.matrix,[-16,0,16]);
    const focus=id==='collision'?contact:hinge;material.uniforms.focus.value.set(focus[0]-ship.pos[0],focus[1]-ship.pos[1]);
    const pulse=id==='collision'?smooth((p-.5)/.04)*(1-smooth((p-.68)/.3)):id==='break'?smooth(sec/5)*(1-smooth((sec-30)/100)):.15;
    material.uniforms.impact.value=pulse*1.5;
    const collapse=model.events.filter(e=>e.kind==='collapse'&&e.mode!=='vanish'&&e.card!==false&&t>=e._t&&t<e._until+.8).at(-1);
    points.visible=!ecologyMode(model,st)||!!collapse;
    const dustPiece=collapse?s.pieces.get(collapse.piece):null;
    const cp=collapse?smooth((t-collapse._t)/Math.max(.08,collapse._until-collapse._t)):0;
    const landing=model.events.filter(e=>['bow-lands','stern-lands'].includes(e.id)&&t>=e._t&&t<e._t+.65).at(-1);
    const land=landing?Math.sin(Math.PI*(t-landing._t)/.65):0;
    const bcentre=pieceWorldBox(model,s,dustPiece?collapse.piece:landing?.id==='stern-lands'?'hull-stern':'hull-bow'), dustCentre=bcentre.min.map((v,k)=>(v+bcentre.max[k])/2);
    const wet=[...s.water].filter(([,h])=>h>.1).map(([id,h])=>({h,part:model.pieces.find(q=>q.id===id),pose:s.pieces.get(id)}));
    for(let i=0;i<N;i++){
      const[a,b,c,d]=seeds[i],angle=b*Math.PI*2;let x=0,y=0,z=0,op=0,size=2+d*3,col=[.68,.87,1];
      if(id==='collision'||id==='break'){
        if(i<1400){const age=(clock*.3+a*2.4)%2.4,base=id==='collision'?contact:apply(bow.matrix,[-6+c*14,0,8]);
          const spread=5+age*23;x=base[0]+Math.cos(angle)*spread;y=base[1]+Math.sin(angle)*spread*.55;z=Math.max(-2,base[2])+age*(18+c*16)-15*age*age;op=pulse*(1-age/2.4)*.65;if(z<-.5)op*=.15;
        }else{const base=apply(ship.matrix,[(c-.5)*250,b>.5?14:-14,0]);x=base[0]+Math.cos(angle)*a*9;y=base[1]+Math.sin(angle)*a*9;z=.4;op=.15+d*.2;}
      }else if(id==='flooding'){
        // Inflow follows actual compartment levels; no invented changes to flooding tracks.
        const entry=wet[i%Math.max(1,wet.length)];
        if(entry&&st.xray){const ps=entry.pose,v=entry.part.params;
          const base=apply(ps.matrix,[v.x0+c*(v.x1-v.x0), (b-.5)*(v.b||12), Math.min(v.top,entry.h)+(1-((clock*.3+a)%1))*3]);[x,y,z]=base;op=.48*(1-a);size=1.5+d*3;}
      }else if(id==='descent'){
        const part=i%3===0?stern:bow,base=part.pos;
        x=base[0]+(a-.5)*130;y=base[1]+(b-.5)*75;z=base[2]+((clock*12+c*300)%300);op=.18*(1-c);size=.8+d*2;
        if(i>1300&&land>0){x=dustCentre[0]+Math.cos(angle)*a*150;y=dustCentre[1]+Math.sin(angle)*a*100;z=-model.environment.seaDepth+3+c*35;op=land*.38;size=8+d*14;col=[.38,.42,.43];}
      }else if(dustPiece&&i<1500){const scale=Math.min(1,Math.max(...bcentre.max.map((v,k)=>v-bcentre.min[k]))/40),radius=(8+cp*70)*scale; x=dustCentre[0]+Math.cos(angle)*a*radius;y=dustCentre[1]+Math.sin(angle)*a*radius;z=dustCentre[2]+c*25-cp*15;op=Math.sin(Math.PI*Math.min(.999,cp))*.34;size=(5+d*12)*scale;col=[.46,.38,.28];
      }else{const base=bow.pos;x=base[0]+(a-.5)*350;y=base[1]+(b-.5)*250;z=base[2]+c*100;op=.08;size=.5;}
      xyz.set([x,y,z],i*3);alpha[i]=op;sizes[i]=size;colors.set(col,i*3);
    }
    for(const a of Object.values(geo.attributes))a.needsUpdate=true;
  }
  function updateBritannic(st){
    const {t,last:s}=st,{id,p}=directingBeat(model,t),ship=s.pieces.get('ship'),main=s.pieces.get('hull-main');
    const clock=id==='explosion'?p*12:id==='flooding'?12+p*70:id==='capsize'?82+p*50:132+t*.8;
    sea.visible=st.eyeZ>=0;sea.position.set(ship.pos[0],ship.pos[1],0);material.uniforms.clock.value=clock;
    const contact=apply(ship.matrix,[90,-14,11]);material.uniforms.focus.value.set(contact[0]-ship.pos[0],contact[1]-ship.pos[1]);
    const hit=model.events.find(e=>e.id==='explosion'),strike=model.events.find(e=>e.id==='bow-strikes'),rest=model.events.find(e=>e.id==='rest');
    const pulse=id==='explosion'&&t>=hit._t?smooth((t-hit._t)/.3)*(1-smooth((t-hit._t-1)/3)):id==='capsize'?.65:.08;
    material.uniforms.impact.value=pulse;
    const wet=[...s.water].filter(([,h])=>h>.1).map(([id,h])=>({h,part:model.pieces.find(q=>q.id===id),pose:s.pieces.get(id)}));
    const landing=[strike,rest].filter(e=>t>=e._t&&t<e._t+3).at(-1),land=landing?Math.sin(Math.PI*(t-landing._t)/3):0;
    const bottom=pieceWorldBox(model,s,landing?.id==='bow-strikes'?'hull-bow':'hull-main');
    const centre=bottom.min.map((v,k)=>(v+bottom.max[k])/2);
    for(let i=0;i<N;i++){
      const[a,b,c,d]=seeds[i],angle=b*Math.PI*2;let x=0,y=0,z=0,op=0,size=2+d*3,col=[.65,.89,.95];
      if(id==='flooding'&&st.xray){
        const entry=wet[i%Math.max(1,wet.length)];
        if(entry){const v=entry.part.params,base=apply(entry.pose.matrix,[v.x0+c*(v.x1-v.x0),(b-.5)*(v.b||12),Math.min(v.top,entry.h)+(1-((clock*.35+a)%1))*3]);[x,y,z]=base;op=.55*(1-a);}
      }else if(id==='explosion'||(id==='capsize'&&st.eyeZ>=0)){
        const age=(clock*.3+a*2)%2,base=id==='explosion'?contact:apply(main.matrix,[(c-.5)*230,-13,10]);
        x=base[0]+Math.cos(angle)*age*18;y=base[1]+Math.sin(angle)*age*18;z=Math.max(0,base[2])+age*(16+d*12)-15*age*age;
        op=pulse*(1-age/2)*.6;if(z<0||base[2]>14||base[2]<-30)op=0;
      }else{
        const base=apply(main.matrix,[(a-.5)*240,(b-.5)*25,12]);
        x=base[0]+Math.sin(clock*.2+a*6)*6;y=base[1]+Math.cos(clock*.2+b*6)*6;z=Math.min(-1,base[2]+((clock*5+c*70)%70));
        op=id==='capsize'?.32*(1-c):.1;size=id==='capsize'?1+d*3:.6+d;
        if(id==='quiet'||id==='explored'){z=base[2]+(c-.5)*18+Math.sin(clock*.12+a*6);col=[.5,.7,.66];}
      }
      // Surface foam marks the rolling waterline, independent of x-ray choice.
      if(id==='capsize'&&st.eyeZ>=0&&i>1500){const base=apply(main.matrix,[(c-.5)*250,0,12]);x=base[0]+Math.cos(angle)*a*20;y=base[1]+Math.sin(angle)*a*20;z=.35;op=base[2]>-35&&base[2]<30?.35:0;size=2+d*3;}
      if(land>0&&i>1100){const spread=(t-landing._t)*24;x=centre[0]+Math.cos(angle)*a*(30+spread);y=centre[1]+Math.sin(angle)*a*(25+spread);z=-model.environment.seaDepth+3+c*18;op=land*.4;size=5+d*12;col=[.48,.54,.48];}
      xyz.set([x,y,z],i*3);alpha[i]=op;sizes[i]=size;colors.set(col,i*3);
    }
    for(const a of Object.values(geo.attributes))a.needsUpdate=true;
  }
  return {update};
}
