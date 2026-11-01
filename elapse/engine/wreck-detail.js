import {planHalfWidth} from './britannic-form.js';
// Britannic structural detail plus colour-only seabed dressing. Positions/organism distribution are illustrative,
// not a surveyed wreck mesh. Researched poses and collision envelopes stay unchanged.
import * as THREE from 'three';
import { hullWindows, halfBreadthAt, deckHeightAt } from './geom.js';
import { rng } from './math.js';

export function createWreckDetail({root,model,items,ground,shallow=true}) {
  const groups=[], weather=[],growth=[], random=rng(19161121);
  const metal=new THREE.MeshStandardMaterial({color:shallow?'#697d70':'#665746',roughness:.96,metalness:.15});
  const rim=new THREE.MeshStandardMaterial({color:shallow?'#8d947d':'#93816c',roughness:.94,metalness:.12});
  const black=new THREE.MeshStandardMaterial({color:'#0b2429',roughness:1,side:THREE.DoubleSide});
  const pale=new THREE.MeshStandardMaterial({color:'#b3b49a',roughness:1});
  const rust=new THREE.MeshStandardMaterial({color:'#75583b',roughness:1});
  const rodGeo=new THREE.CylinderGeometry(1,1,1,6);
  function rods(g,segments,mat=metal){
    if(!segments.length)return;
    const mesh=new THREE.InstancedMesh(rodGeo,mat,segments.length),q=new THREE.Quaternion(),m=new THREE.Matrix4(),up=new THREE.Vector3(0,1,0);
    segments.forEach(([a,b,r=.045],i)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);q.setFromUnitVectors(up,v.clone().normalize());m.compose(A.add(B).multiplyScalar(.5),q,new THREE.Vector3(r,v.length(),r));mesh.setMatrixAt(i,m);});g.add(mesh);
  }
  function batch(g,geo,mat,poses){
    const mesh=new THREE.InstancedMesh(geo,mat,poses.length),m=new THREE.Matrix4(),q=new THREE.Quaternion();
    poses.forEach(([x,y,z,s=1,ry=0,rx=0],i)=>{q.setFromEuler(new THREE.Euler(rx,ry,0));m.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(s,s,s));mesh.setMatrixAt(i,m);});g.add(mesh);return mesh;
  }
  for(const it of items){
    if(!['hull','deckhouse','davit','funnel'].includes(it.p.template))continue;
    const g=new THREE.Group();g.name='estimated-wreck-detail';it.g.add(g);groups.push(g);
    const p=it.p.params;
    // Real geometry for existing window patterns, rather than luminous point sprites.
    if(it.p.template==='hull'){
      const st0=p.offsets.stations,r0=p.range||[st0[0].x,st0.at(-1).x];
      const rects=[],rectFrames=[];
      const wins=hullWindows({...p,windows:p.windows||[11.8,14.5,17.2].map(z=>({from:r0[0]+8,to:r0[1]-8,spacing:2.6,z}))}),rings=[],holes=[];
      for(const w of wins){const x=(w.x0+w.x1)/2,z=(w.z0+w.z1)/2,side=Math.sign(w.y),y=w.y+side*.055;
        if(w.kind==='rect'){const W=w.width||.85,H=w.height||1.1;rects.push([x,y,z,1,0,Math.PI/2]);for(const dx of [-W/2,W/2])rectFrames.push([[x+dx,y,z-H/2],[x+dx,y,z+H/2],.035]);for(const dz of [-H/2,H/2])rectFrames.push([[x-W/2,y,z+dz],[x+W/2,y,z+dz],.035]);continue;}
        rings.push([x,y,z,1,0,Math.PI/2]);holes.push([x,y+side*.015,z,1,0,Math.PI/2]);}
      batch(g,new THREE.TorusGeometry(.25,.055,6,12),rim,rings);
      batch(g,new THREE.CircleGeometry(.205,12),black,holes);
      if(rects.length){batch(g,new THREE.PlaneGeometry(.85,1.1),black,rects);rods(g,rectFrames,rim);}
      const seams=[];const st=p.offsets.stations,range=p.range||[st[0].x,st.at(-1).x];
      for(let x=range[0]+4;x<range[1]-2;x+=8){for(const side of [-1,1])for(let z=3;z<p.depth-1;z+=2.2){
        const y0=halfBreadthAt(p,x,z)*side,y1=halfBreadthAt(p,x,z+2.1)*side;
        seams.push([[x,y0+side*.025,z],[x,y1+side*.025,z+2.1],.014]);}}
      // Deck edge stanchions and two rails follow the existing hull form.
      for(const side of [-1,1])for(let x=range[0]+3;x<range[1]-3;x+=2.5){
        const z=deckHeightAt(p,x),y=halfBreadthAt(p,x,z)*side;
        seams.push([[x,y,z],[x,y,z+1],.04]);
        if(x+2.5<range[1]-3){const zn=deckHeightAt(p,x+2.5),yn=halfBreadthAt(p,x+2.5,zn)*side;
          for(const h of [.5,1])seams.push([[x,y,z+h],[x+2.5,yn,zn+h],.035]);}}
      rods(g,seams);
    }
    if(it.p.template==='deckhouse'){
      const frames=[],panes=[];
      if(!p.planForm)for(let x=-p.l/2+1.5;x<p.l/2-1;x+=p.windowSpacing||2.2)for(const side of [-1,1]){
        const y=side*(p.b/2+.04),z=p.h*.45,w=.7,h=.72;
        panes.push([x,y,z,1,0,Math.PI/2]);
        for(const dx of [-w/2,w/2])frames.push([[x+dx,y,z-h/2],[x+dx,y,z+h/2],.035]);
        for(const dz of [-h/2,h/2])frames.push([[x-w/2,y,z+dz],[x+w/2,y,z+dz],.035]);
      }
      const outline=p.planOutline||[[-p.l/2,p.b/2],[p.l/2,p.b/2]];
      for(const side of [-1,1])for(let j=1;j<outline.length;j++){
        const [a,wa]=outline[j-1],[b,wb]=outline[j],N=Math.max(1,Math.ceil((b-a)/2.4));
        for(let i=0;i<N;i++){const f=i/N,fn=(i+1)/N,x=a+(b-a)*f,xn=a+(b-a)*fn,y=side*(wa+(wb-wa)*f),yn=side*(wa+(wb-wa)*fn);
          frames.push([[x,y,p.h],[x,y,p.h+1.05],.035]);
          for(const h of [.45,1.05])frames.push([[x,y,p.h+h],[xn,yn,p.h+h],.035]);}
      }
      // Schematic seams are clipped to the actual new footprint, not a floating rectangle.
      for(let y=-p.b/2+.3;y<p.b/2;y+=.55)for(let x=-p.l/2;x<p.l/2;x+=1.5){const xn=Math.min(p.l/2,x+1.5);
        if(Math.abs(y)<Math.min(planHalfWidth(p,x),planHalfWidth(p,xn))-.1)frames.push([[x,y,p.h+.025],[xn,y,p.h+.025],.012]);}
      rods(g,frames);if(panes.length)batch(g,new THREE.PlaneGeometry(.7,.72),black,panes);
      if(['first-house','aft-house','officers'].includes(it.p.id)){
        const vents=[];
        for(let x=-p.l/2+3;x<p.l/2-2;x+=7){const y=(x>0?1:-1)*(planHalfWidth(p,x)-1.2);
          vents.push([[x,y,p.h],[x,y,p.h+1.3],.22],[[x,y,p.h+1.3],[x,y+.55,p.h+1.3],.30]);}
        rods(g,vents,rim);
      }
    }
    if(it.p.template==='funnel'){
      for(let z=1;z<p.h;z+=4){const band=new THREE.Mesh(new THREE.TorusGeometry(1,.018,5,32),metal);band.scale.set(p.a,p.b,1);band.position.set(-Math.tan((p.rake||0)*Math.PI/180)*z,0,z);g.add(band);}
      const lip=new THREE.Mesh(new THREE.TorusGeometry(1,.045,6,32),rust);lip.scale.set(p.a,p.b,1);lip.position.set(-Math.tan((p.rake||0)*Math.PI/180)*p.h,0,p.h+.035);g.add(lip);
    }
    if(it.p.template==='davit'){
      const seg=[],h=p.h||6.5,reach=(p.side==='port'?1:-1)*(p.reach||3.2);
      for(const x of [-.55,.55]){for(const y of [-.3,.3])seg.push([[x,y,0],[x,y,h],.07]);
        for(let z=0;z<h;z+=1.1){seg.push([[x,-.3,z],[x,.3,Math.min(h,z+1.1)],.045]);}
        seg.push([[x,0,h],[x,reach,h],.08],[[x,0,h-1],[x,reach,h],.055]);}
      for(let z=0;z<h;z+=1.1)seg.push([[-.55,-.3,z],[.55,.3,Math.min(h,z+1.1)],.05]);
      seg.push([[-.55,reach,h],[.55,reach,h],.07],[[0,reach,h],[0,reach,h-2],.025]);rods(g,seg);
      const drum=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.9,12),rust);drum.rotation.z=Math.PI/2;drum.position.set(0,0,.9);g.add(drum);
    }
    if(shallow){
    // Small marine crust colonies, irregular and seeded (no species or surveyed locations implied).
    const colonies=[],N=it.p.template==='hull'?850:it.p.template==='deckhouse'?Math.max(100,Math.round(p.l*2)):25;
    for(let i=0;i<N;i++){
      let x,y,z;if(it.p.template==='hull'){const st=p.offsets.stations,r=p.range||[st[0].x,st.at(-1).x];x=r[0]+random()*(r[1]-r[0]);z=2+random()*(p.depth-2);y=(random()>.5?1:-1)*halfBreadthAt(p,x,z);}
      else if(it.p.template==='deckhouse'){x=(random()-.5)*p.l;y=(random()-.5)*2*planHalfWidth(p,x);z=p.h+.02;}
      else{x=(random()-.5);y=(random()-.5);z=random()*(p.h||6);}
      colonies.push([x,y,z,.07+random()*.22,random()*3,random()*3]);
    }
    const colonyMesh=batch(g,new THREE.IcosahedronGeometry(1,1),pale,colonies);
    growth.push({mesh:colonyMesh,it,total:colonies.length});
    for(let i=0;i<colonies.length;i++)colonyMesh.setColorAt(i,new THREE.Color().setHSL(.11+random()*.08,.15+random()*.25,.25+random()*.27));
    for(const m of it.meshes){const u=m.userData;if(!u.baseColor)continue;
      const color=m.geometry.getAttribute('color'),original=color?.array.slice(),aged=original?.slice();
      if(color){const pos=m.geometry.getAttribute('position');for(let i=0;i<color.count;i++){
        const n=(Math.sin(pos.getX(i)*1.72+pos.getZ(i)*3.17)+Math.sin(pos.getX(i)*.29-pos.getZ(i)*1.9)+2)/4;
        for(let k=0;k<3;k++)aged[i*3+k]=original[i*3+k]*(.28+.65*n);}}
      const mat=new THREE.MeshStandardMaterial({color:u.baseColor.clone(),vertexColors:!!u.vertexColors,roughness:.95,metalness:.13,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
      const ageUniform={value:0};
      mat.onBeforeCompile=shader=>{
        shader.uniforms.wreckAge=ageUniform;
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 wreckP;').replace('#include <begin_vertex>','#include <begin_vertex>\nwreckP=position;');
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 wreckP; uniform float wreckAge;').replace('#include <color_fragment>',`#include <color_fragment>
          float broad=sin(wreckP.x*.47+sin(wreckP.z*.63)*2.)*sin(wreckP.z*1.7+wreckP.y*.6);
          float grain=fract(sin(dot(floor(wreckP*22.),vec3(12.9898,78.233,37.719)))*43758.5453);
          float stain=smoothstep(.25,.78,broad*.5+.5)*(.65+.35*grain);
          vec3 coat=mix(vec3(.19,.24,.20),vec3(.39,.23,.11),stain);
          diffuseColor.rgb=mix(diffuseColor.rgb,coat,min(.9,wreckAge*2.)*(.35+.6*stain));
        `);
      };
      mat.customProgramCacheKey=()=> 'britannic-wreck-coat-v1';
      weather.push({m,it,mat,color,original,aged,ageUniform});
    }
  }
    }
  // Soft, illustrative contact darkening follows the existing seabed relief.
  const shadowGeo=new THREE.PlaneGeometry(315,100,50,16),sp=shadowGeo.attributes.position;
  const shadowMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 v;void main(){v=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 v;void main(){float a=pow(max(0.,1.-dot(v,v)),2.)*.43;gl_FragColor=vec4(.008,.026,.027,a);}'});
  const contact=new THREE.Mesh(shadowGeo,shadowMat);root.add(contact);
  const blueprint=new THREE.MeshBasicMaterial({color:'#9ad6f4'}),bluePane=new THREE.MeshBasicMaterial({color:'#092c51',side:THREE.DoubleSide});
  const dressing=[];for(const g of groups)g.traverse(m=>{if(m.isMesh)dressing.push({m,original:m.material});});
  let lastPosition='';
  function update(st){
    const active=shallow&&st.t>=62&&st.style==='color'&&!st.xray,bp=st.style==='blueprint'&&!st.xray;
    for(const it of items)if(it.windows&&(active||(shallow&&it.p.params?.planForm)))it.windows.visible=false;
    groups.forEach(g=>g.visible=(st.style==='color'||bp)&&!st.xray);contact.visible=active;
    for(const d of dressing)d.m.material=bp?(d.original===black?bluePane:blueprint):d.original;
    for(const g of growth){g.mesh.visible=active;g.mesh.count=Math.round(g.total*Math.min(1,st.last.pieces.get(g.it.p.id).rust*2));}
    for(const w of weather){
      if(active){w.m.material=w.mat;const age=st.last.pieces.get(w.it.p.id).rust;
        w.ageUniform.value=age;w.mat.color.copy(w.m.userData.mats.color.color);if(w.color){for(let i=0;i<w.original.length;i++)w.color.array[i]=w.original[i]+(w.aged[i]-w.original[i])*Math.min(1,age*1.8);w.color.needsUpdate=true;}}
      else if(w.color){w.color.array.set(w.original);w.color.needsUpdate=true;}
    }
    if(active){const main=st.last.pieces.get('hull-main'),key=main.pos.join(',');
      if(key!==lastPosition){const angle=main.heading*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
        for(let i=0;i<sp.count;i++){const x=(i%51)/50*315-157.5,y=Math.floor(i/51)/16*100-50,wx=main.pos[0]+x*c-y*s,wy=main.pos[1]+x*s+y*c;sp.setXYZ(i,wx,wy,ground(wx,wy)+.06);}
        sp.needsUpdate=true;shadowGeo.computeBoundingSphere();lastPosition=key;}
    }
  }
  return {update};
}
