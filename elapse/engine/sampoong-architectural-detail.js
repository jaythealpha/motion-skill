import * as T from 'three';
import {boxInstances} from './quality-surfaces.js';
// Original geometry. Public photographs guide the rose envelope/recessed bays only.
// All opening dimensions, panel subdivisions, services and internal fittings are estimates.
export function coreArchitecture(cores,mat){
 const rose=mat('#bb899a'),reveal=mat('#956b79'),coping=mat('#dcc4c5'),frame=mat('#737c79','metal',{metalness:.65,roughness:.31}),inside=mat('#283331'),floor=mat('#827e74'),glass=mat('#607e82','glass',{metalness:.5,roughness:.17}),seam=mat('#9c7780');
 facadeFinish(rose);
 const walls=[],returns=[],caps=[],frames=[],interiors=[],panes=[],joints=[],stairs=[];
 for(const[cx,w]of[[-46,12],[47,13]]){
  // Hollow frontage: glass sits 0.85m behind a 0.65m-deep wall, with real reveals.
  for(const side of[-1,1]){
   const y=side*24,bay=4.25,edge=(w-bay)/2;
   walls.push([cx-(bay+edge)/2,y,12.9,edge,.65,25.8],[cx+(bay+edge)/2,y,12.9,edge,.65,25.8],[cx,y,21.5,bay,.65,3.1],[cx,y,25,bay,.65,1.8]);
   returns.push([cx-bay/2,side*23.6,10.5,.18,1.15,21],[cx+bay/2,side*23.6,10.5,.18,1.15,21],[cx,side*23.6,20.35,bay,1.15,.24]);
   // Narrow clerestory sits in an actual slot, not on top of a pink box.
   for(let xx=-w/2+.7;xx<w/2-.2;xx+=1.35){panes.push([cx+xx,side*23.7,23.55,1.15,.12,.75]);frames.push([cx+xx-.61,side*24.05,23.55,.075,.16,.95]);}
   caps.push([cx,side*24.1,23.02,w,.30,.15],[cx,side*24.1,24.12,w,.30,.13]);
   for(let z=0;z<20;z+=4.4){
    interiors.push([cx,side*22.1,z+.12,bay,3.4,.24],[cx,side*21.6,z+2.2,bay,1.2,4.1]);
    frames.push([cx,side*23.28,z+4.28,bay,.18,.13]);
    for(let col=0;col<3;col++)for(let row=0;row<2;row++){
     const x=cx+(col-1)*1.36,zz=z+1.08+row*2.1;
     panes.push([x,side*23.18,zz,1.27,.075,1.96]);
     frames.push([x-.67,side*23.3,zz,.065,.20,2.12],[x,side*23.30,zz+1.02,1.36,.2,.065]);
    }
   }
   // Broad stone fields articulated by fine horizontal and vertical recessed joints.
   for(let z=.9;z<26;z+=1.2){for(const sign of[-1,1])joints.push([cx+sign*(bay+edge)/2,side*24.333,z,edge-.06,.018,.022]);}
   for(let x=-w/2+1.5;x<w/2;x+=1.5)if(Math.abs(x)>bay/2+.1)joints.push([cx+x,side*24.335,12.9,.018,.018,25.7]);
   // Double glazed doors, deep threshold and cantilever canopy; not a recovered entrance plan.
   frames.push([cx,side*24.8,3.55,5.4,2.4,.16],[cx-2.5,side*24.4,1.65,.10,.12,3.3],[cx+2.5,side*24.4,1.65,.10,.12,3.3]);
   for(const dx of[-.7,.7]){panes.push([cx+dx,side*24.35,1.3,1.27,.08,2.55]);frames.push([cx+dx-.65,side*24.46,1.3,.055,.12,2.6],[cx+dx,side*24.48,1.3,.035,.07,2.5],[cx+dx+.22,side*24.55,1.23,.025,.08,.48]);}
   for(let i=0;i<3;i++)stairs.push([cx,side*(25.1+i*.48),.28-i*.09,6.1,1.6-i*.35,.12]);
  }
  // Side returns, internal spine and rooftop setback retain a readable hollow mass.
  walls.push([cx-w/2+.25,0,12.9,.5,47.4,25.8],[cx+w/2-.25,0,12.9,.5,47.4,25.8],[cx,0,12.9,w-1,38,25.8],[cx,0,26.15,w,48,.7],[cx,0,27,w-2,44,1.0]);
  caps.push([cx,0,25.85,w+.25,48.25,.17],[cx,0,27.52,w-1.65,44.35,.14]);
  for(let z=1;z<26;z+=1.2)for(const sign of[-1,1])joints.push([cx+sign*(w/2+.008),0,z,.022,47.4,.025]);
 }
 boxInstances(cores,walls,rose);boxInstances(cores,returns,reveal);boxInstances(cores,caps,coping);boxInstances(cores,frames,frame);boxInstances(cores,interiors,inside);boxInstances(cores,stairs,floor);boxInstances(cores,joints,seam);
 const glazing=boxInstances(cores,panes,glass),c=new T.Color();for(let i=0;i<panes.length;i++){c.setHSL(.515+(i%7)*.004,.12,.46+(i%5)*.033);glazing.setColorAt(i,c);}glazing.instanceColor.needsUpdate=true;
 return{recessedPanes:panes.length,architecturalMembers:walls.length+returns.length+caps.length+frames.length+joints.length};
}
export function plantDetail(g,mat){
 const steel=mat('#5b6868','metal',{metalness:.62,roughness:.42}),light=mat('#b2b3a9','metal'),dark=mat('#263d40','metal');const rows=[],fins=[],blades=[];
 for(const dx of[-2,2]){
  const disk=new T.Mesh(new T.CylinderGeometry(1.24,1.24,.15,32),dark);disk.rotation.x=Math.PI/2;disk.position.set(dx,0,3.4);g.add(disk);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;blades.push([dx+Math.cos(a)*.62,Math.sin(a)*.62,3.5,1.1,.27,.035,a+.55]);}
  for(let i=-4;i<=4;i++){const x=i*.26,h=Math.sqrt(Math.max(0,1.2**2-x*x))*2;fins.push([dx+x,0,3.56,.024,h,.025],[dx,i*.26,3.58,h,.024,.025]);}
  rows.push([dx,0,3.56,.28,.28,.16]);
 }
 for(const y of[-3.02,3.02])for(let z=1.1;z<2;z+=.16)fins.push([0,y,z,8.6,.08,.035]);
 rows.push([-3.8,0,.42,.22,5.4,.5],[3.8,0,.42,.22,5.4,.5],[4.62,-1.5,1.25,.23,.9,1.3]);
 boxInstances(g,rows,steel);boxInstances(g,blades,light);boxInstances(g,fins,steel);
}
// Batched fracture aggregates and ribbed reinforcement follow each slab's complete matrix.
// Local normalized geometry allows these details to inherit shrink/tilt/rewind exactly.
export function slabDetailGeometry(kind){
 const bits=[],add=(geo,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const d=new T.Object3D();d.position.set(x,y,z);d.rotation.set(rx,ry,rz);d.scale.set(sx,sy,sz);d.updateMatrix();geo.applyMatrix4(d.matrix);bits.push(geo.toNonIndexed());};
 if(kind==='steel'){
  for(let i=0;i<9;i++){const x=-.43+i*.106;for(const y of[-.49,.49]){add(new T.CylinderGeometry(1,1,1,5),x,y,.0,.0022,.095,.045,0,0,0);for(let j=0;j<4;j++)add(new T.BoxGeometry(1,1,1),x,y+(j-1.5)*.019,.035,.006,.003,.03);}}
  for(let i=0;i<5;i++)add(new T.BoxGeometry(1,1,1),-.49,-.38+i*.19,-.08,.10,.003,.04,0,.10,0);
 }else{
  for(let i=0;i<52;i++){const t=i/51,side=i%2?-1:1;add(new T.IcosahedronGeometry(1,0),-.48+t*.96,side*.493,Math.sin(i*3.1)*.22,.008+((i*17)%7)*.001,.006,.06+((i*13)%5)*.025,0,0,i);}
 }
 const p=[],n=[],uv=[];for(const g of bits){p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);if(g.attributes.uv)uv.push(...g.attributes.uv.array);else uv.push(...new Float32Array(g.attributes.position.count*2));g.dispose();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;
}

export function siteArchitecture(root,mat){
 const metal=mat('#4b5655','metal'),stone=mat('#c0b8a8'),soil=mat('#514d40'),leaf=mat('#53634d'),bark=mat('#665448');
 const rows=[],pave=[],grates=[],stems=[],greens=[];
 for(const cx of[-46,47])for(const dx of[-4,4]){rows.push([cx+dx,-29,.42,1.8,2.2,.8]);pave.push([cx+dx,-29,.86,1.65,2.05,.10]);greens.push([cx+dx,-29,1.22,1.25,1.65,.8]);}
 for(let x=-54;x<103;x+=2.4){pave.push([x,-31.1,.11,2.36,.18,.22]);if(x%7<1)grates.push([x,-29.9,.11,.9,.4,.04]);}
 for(let x=-50;x<100;x+=12)for(let k=0;k<9;k++)grates.push([x+k*.055,-29.8,.14,.018,.42,.025]);
 for(const x of[-53,54,99]){stems.push([x,-30.5,1.65,.15,.15,3.3]);for(let i=0;i<6;i++){const a=i*2.4;greens.push([x+Math.cos(a)*.65,-30.5+Math.sin(a)*.55,3.1+(i%3)*.35,1.1,1.0,1.4]);}}
 for(const x of[-39,39,58,96]){rows.push([x,-30,.4,.15,.15,.8]);rows.push([x,-29.4,3.1,.07,.07,6.2],[x,-28.8,6.1,.1,1.2,.1],[x,-28.1,6.0,.6,.8,.17]);}
 boxInstances(root,rows,metal);boxInstances(root,pave,stone);boxInstances(root,grates,metal);boxInstances(root,stems,bark);
 const greenMesh=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),leaf,greens.length),d=new T.Object3D();greens.forEach(([x,y,z,sx,sy,sz],i)=>{d.position.set(x,y,z);d.scale.set(sx,sy,sz);d.rotation.set(i*.3,i*.7,i);d.updateMatrix();greenMesh.setMatrixAt(i,d.matrix);greenMesh.setColorAt(i,new T.Color().setHSL(.25,.13,.30+(i%5)*.025));});root.add(greenMesh);
}
// Metre-scaled cladding variation; antialiased joints and faint drainage streaks.
// This is original material shading, not a photograph or a surveyed panel map.
export function facadeFinish(m){
 const prior=m.onBeforeCompile;m.onBeforeCompile=s=>{prior.call(m,s);s.vertexShader='varying vec3 spWorld;\n'+s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
 vec4 spLocal=vec4(transformed,1.);
 #ifdef USE_INSTANCING
 spLocal=instanceMatrix*spLocal;
 #endif
 spWorld=(modelMatrix*spLocal).xyz;`);
 s.fragmentShader='varying vec3 spWorld;\nfloat spHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n'+s.fragmentShader;
 s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 spUV=vec2((spWorld.x+spWorld.z)/1.5,spWorld.y/1.2);vec2 spCell=floor(spUV);vec2 spF=fract(spUV);vec2 spAA=max(fwidth(spUV),vec2(.001));
 vec2 spEdge=min(spF,1.-spF);float spJoint=1.-smoothstep(.004,.004+max(spAA.x,spAA.y),min(spEdge.x,spEdge.y));
 float spPanel=spHash(spCell),spStreak=pow(max(0.,sin(spUV.x*41.+spPanel*6.)),14.)*pow(1.-spF.y,3.);
 diffuseColor.rgb*=.965+spPanel*.07-spJoint*.10-spStreak*.025;`);
 };m.customProgramCacheKey=()=> 'sampoong-cladding-metres-v1';return m;
}
