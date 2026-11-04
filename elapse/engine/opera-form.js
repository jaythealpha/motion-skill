import {nearWallSide} from './opera-navigation.js';
import * as T from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';
import {enrichMaterial,boxInstances} from './quality-surfaces.js';
import {hallRow,hallSeat,rowOutline,riserOutline} from './opera-hall-layout.js';
import {placedPatch,ROOF_SPECS,ROOF_RADIUS} from './opera-geometry.js';
// An original explanatory model informed by published architectural descriptions
// and the venue's technical dimensions. No photographs, scans or plan pixels embedded.
export function operaForm(root){
 const materials=[],groups={},stages=[],shellStages=[];
 const mat=(color,kind='stone',metalness=0,roughness=.65)=>{const m=surfaceMaterial({color,metalness,roughness,side:T.DoubleSide});m.userData.originalColor=m.color.clone();m.userData.baseMetalness=metalness;m.userData.operaKind=kind;if(['stone','wood'].includes(kind))enrichMaterial(m,kind);materials.push(m);return m;};
 const stone=mat('#baa58e'),edge=mat('#8f7e68'),concrete=mat('#c9c7bd'),underside=mat('#afa994'),roof=mat('#f3efdf','tile',.12,.3),glass=mat('#284d58','glass',.25,.2),metal=mat('#746c58','metal',.4,.4),wood=mat('#9b623e','wood'),darkWood=mat('#543a2b','wood'),birch=mat('#c7a879','wood'),fabric=mat('#813b60','fabric'),petal=mat('#b33976','fabric'),pipe=mat('#c5b79a','metal',.6,.25),site=mat('#b8aa94');
 // Small authored ceramic cells; UVs are distances in model metres, not source pixels.
 const pixels=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const k=(y*64+x)*4,seam=x<2||y<2,ivory=(Math.floor(x/32)+Math.floor(y/32))%2;pixels.set([seam?171:ivory?238:249,seam?167:ivory?232:246,seam?151:ivory?214:233,255],k);}const tileMap=new T.DataTexture(pixels,64,64);tileMap.colorSpace=T.SRGBColorSpace;tileMap.wrapS=tileMap.wrapT=T.RepeatWrapping;tileMap.repeat.set(2.5,2.5);tileMap.magFilter=T.LinearFilter;tileMap.minFilter=T.LinearMipmapLinearFilter;tileMap.generateMipmaps=true;tileMap.needsUpdate=true;roof.map=tileMap;
 const lineM=new T.LineBasicMaterial({color:'#9a917c',transparent:true,opacity:.34});
 function group(parent,name){const g=new T.Group();g.name=name;parent.add(g);return g;}
 for(const id of ['podium','shells','glazing','interior','renewal','erection'])groups[id]=group(root,id);
 function box(g,w,d,h,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,d,h),m);o.position.set(x,y,z);g.add(o);return o;}
 function lineGeo(points,r=.16){return new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(8,points.length*2),r,5,false);}
 function merge(g,geos,m){if(!geos.length)return;const pos=[],nor=[],uv=[];for(let geo of geos){const indexed=geo;geo=geo.index?geo.toNonIndexed():geo;pos.push(...geo.attributes.position.array);nor.push(...geo.attributes.normal.array);if(geo.attributes.uv)uv.push(...geo.attributes.uv.array);if(geo!==indexed)indexed.dispose();geo.dispose();}const b=new T.BufferGeometry();b.setAttribute('position',new T.Float32BufferAttribute(pos,3));b.setAttribute('normal',new T.Float32BufferAttribute(nor,3));if(uv.length===pos.length/3*2)b.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const mesh=new T.Mesh(b,m);g.add(mesh);return mesh;}
 function segments(g,points,m=lineM){const b=new T.BufferGeometry();b.setAttribute('position',new T.Float32BufferAttribute(points,3));g.add(new T.LineSegments(b,m));}
 function patchMesh(p,u0,u1,v0,v1,offset=0){const pos=[],uv=[],ix=[],nu=18,nv=20;for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=u0+(u1-u0)*i/nu,v=v0+(v1-v0)*j/nv,a=p.point(u,v);a[2]+=offset;pos.push(...a);uv.push(u*65,v*u*30);}for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const k=i*(nv+1)+j;ix.push(k,k+1,k+nv+1,k+1,k+nv+2,k+nv+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return geo;}
 // Irregular promontory, low sea wall and a receding southern forecourt.
 const outline=[[-62,-96],[60,-96],[64,-50],[61,36],[52,79],[23,91],[-28,90],[-56,73],[-64,22]];
 const shape=new T.Shape(outline.map(p=>new T.Vector2(...p))),slab=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:1.6,bevelEnabled:false}),site);slab.position.z=-1.4;root.add(slab);
 const water=mat('#285b69','water',.15,.4),harbour=new T.Mesh(new T.PlaneGeometry(4000,4000),water);harbour.position.z=-1.7;root.add(harbour);
 const quay=outline.flatMap((p,i)=>[...p,.3,...outline[(i+1)%outline.length],.3]);segments(root,quay);
 const baseGrid=[];for(let x=-55;x<=55;x+=10)baseGrid.push(x,-90,.23,x,70,.23);for(let y=-90;y<80;y+=10)baseGrid.push(-55,y,.23,55,y,.23);segments(root,baseGrid);
 // Foundation shafts are representative: no invented claim of exact pile positions.
 const foundations=group(groups.podium,'foundation-shafts'),columns=[];for(let x=-47;x<=47;x+=15.6)for(let y=-48;y<=65;y+=16)columns.push([x,y,2.2,.85,.85,4.4]);boxInstances(foundations,columns,concrete);stages.push([foundations,'podium',.01]);
 const terraces=group(groups.podium,'terraces');box(terraces,105,123,6,0,10,3.3,stone);box(terraces,112,126,2,0,11,7.3,stone);box(terraces,116,132,1.9,0,11,9.25,stone);box(terraces,119,135,1.1,0,11,10.75,stone);stages.push([terraces,'podium',.42]);
 const steps=group(groups.podium,'monumental-steps'),stepRows=[];for(let i=0;i<36;i++)stepRows.push([0,-91+i*.92,.3+i*.305,98,.98,.31]);boxInstances(steps,stepRows,stone);stages.push([steps,'podium',.78]);
 const paving=group(groups.podium,'paving-and-parapets'),joints=[];for(let y=-55;y<78;y+=2.8)joints.push(-56,y,11.32,56,y,11.32);for(let x=-56;x<57;x+=2.8)joints.push(x,-55,11.32,x,78,11.32);segments(paving,joints);for(const x of[-57,57])box(paving,.5,123,.9,x,11,11.6,edge);stages.push([paving,'podium',.94]);
 // Folded prestressed beams of the column-free foyer, opened at the podium stop.
 const foyer=group(root,'podium-structure'),folded=[];for(let x=-43;x<44;x+=4){folded.push(lineGeo([[x,-61,4],[x,-52,9.7],[x,-43,4]],.35));}merge(foyer,folded,concrete);box(foyer,95,1,1.2,0,-52,10,stone);
 // Common-sphere paired roof patches, each with finite thickness, fanned ribs,
 // ring joints, ridge capping and four cladding bands revealed after erection.
 for(let s=0;s<ROOF_SPECS.length;s++){
  const spec=ROOF_SPECS[s],pair=group(groups.shells,'shell-pair-'+s),start=s<4?s*.025:s<8?.11+(s-4)*.025:.23;
  for(const side of[-1,1]){const p=placedPatch(spec,side),ribs=group(pair,'precast-ribs-'+side),ends=[];
   for(let band=0;band<4;band++){const g=group(ribs,'rib-course-'+band),geos=[];for(let r=side<0?0:1;r<=15;r++){const points=[];for(let i=0;i<=9;i++){const a=p.point((band+i/9)/4,r/15);a[2]-=.58;points.push(a);}geos.push(lineGeo(points,.21+band*.025));}merge(g,geos,concrete);shellStages.push([g,start+band*.095]);}
   for(let band=0;band<4;band++){const g=group(pair,'tile-band-'+side+'-'+band);merge(g,[patchMesh(p,band/4,(band+1)/4,0,1)],roof);const edges=[];for(const v of[1])for(let i=0;i<18;i++){const a=p.point((band+i/18)/4,v),b=p.point((band+(i+1)/18)/4,v),c=[...a],d=[...b];c[2]-=.4;d[2]-=.4;edges.push(...a,...c,...b,...b,...c,...d);}if(band===3)for(let i=0;i<20;i++){const a=p.point(1,i/20),b=p.point(1,(i+1)/20),c=[...a],d=[...b];c[2]-=.4;d[2]-=.4;edges.push(...a,...c,...b,...b,...c,...d);}const wall=new T.BufferGeometry();wall.setAttribute('position',new T.Float32BufferAttribute(edges,3));wall.computeVertexNormals();merge(g,[patchMesh(p,band/4,(band+1)/4,0,1,-.4),wall],underside);shellStages.push([g,.43+start+band*.07]);}
   for(const v of(side<0?[0,1]:[1])){const pts=[];for(let i=0;i<=40;i++)pts.push(p.point(i/40,v));ends.push(lineGeo(pts,.22));}const lip=group(pair,'edge-capping-'+side);merge(lip,ends,roof);shellStages.push([lip,.7+start]);
   const seams=[];for(let r=1;r<16;r++)for(let i=1;i<25;i++){const a=p.point(i/25,r/16),b=p.point((i+1)/25,r/16);a[2]+=.025;b[2]+=.025;seams.push(...a,...b);}const sg=group(pair,'panel-joints-'+side);segments(sg,seams);shellStages.push([sg,.75+start]);
   // End curtain wall: fan of tapered panes, splayed mullions and cross rails.
   const panes=[],mullions=[];for(let k=0;k<15;k++){const v0=k/15,v1=(k+1)/15,a=p.point(1,v0),b=p.point(1,v1),ba=[a[0],a[1]-spec[5]*3,11.4],bb=[b[0],b[1]-spec[5]*3,11.4];const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute([...a,...ba,...b,...b,...ba,...bb],3));geom.computeVertexNormals();panes.push(geom);mullions.push(lineGeo([ba,a],.11));for(let f=1;f<5;f++)mullions.push(lineGeo([a.map((x,i)=>ba[i]+(x-ba[i])*f/5),b.map((x,i)=>bb[i]+(x-bb[i])*f/5)],.075));}merge(groups.glazing,panes,glass);merge(groups.glazing,mullions,metal);
  }
 }
 // Temporary erection truss and lifting crane. Shapes/location are illustrative.
 const truss=[];for(let i=0;i<12;i++){const a=i/12*Math.PI,b=(i+1)/12*Math.PI,pa=[-25,-10+36*Math.cos(a),12+39*Math.sin(a)],pb=[-25,-10+36*Math.cos(b),12+39*Math.sin(b)];truss.push(lineGeo([pa,pb],.25));truss.push(lineGeo([pa,[pa[0]+2,pa[1],pa[2]-2],pb],.13));}merge(groups.erection,truss,metal);const crane=[];for(let z=0;z<58;z+=4){crane.push(lineGeo([[51,-15,z],[55,-15,z+4],[51,-15,z+4],[55,-15,z]],.1));}crane.push(lineGeo([[53,-15,0],[53,-15,61]],.3),lineGeo([[15,-15,60],[65,-15,60],[53,-15,66],[15,-15,60]],.2),lineGeo([[19,-15,60],[19,-15,33]],.075));merge(groups.erection,crane,metal);
 // Concert Hall: south-facing stage, fan stalls and ascending perimeter terraces.
 // Technical reference: normal stage depth12.30m; front width14.50m; floor offset0.90m.
 const hall=groups.interior;hall.position.x=-25;const floorZ=13,stageY=-22,stageZ=13.9;
 box(hall,41,83,1,0,2,12.5,wood);const floor=new T.Shape([[-7.25,stageY-6.15],[7.25,stageY-6.15],[8,stageY+6.15],[-8,stageY+6.15]].map(p=>new T.Vector2(...p)));const stage=new T.Mesh(new T.ExtrudeGeometry(floor,{depth:.9,bevelEnabled:false}),wood);stage.position.z=floorZ;stage.name='south-facing-stage';hall.add(stage);
 const deck=[],seatRows=[],backs=[],seatWood=[],armrests=[],rails=[];
 for(let row=0;row<25;row++){
  const q=hallRow(row),outline=new T.Shape(rowOutline(row).map(p=>new T.Vector2(...p)));
  const tread=new T.ExtrudeGeometry(outline,{depth:.4,bevelEnabled:false});tread.translate(0,0,q.z-.4);deck.push(tread);
  for(let x=-q.width+.55;x<q.width-.4;x+=.82){
   if(Math.abs(x)<.9||Math.abs(Math.abs(x)-7.4)<.55)continue;
   const f=hallSeat(row,x),c=Math.cos(f.angle),sn=Math.sin(f.angle);
   seatRows.push([x,f.y,f.z+.44,.62,.64,.16,f.angle]);backs.push([f.backX,f.backY,f.z+.76,.62,.13,.58,f.angle]);
   for(const side of[-1,1]){const dx=side*.32;armrests.push([x+dx*c,f.y+dx*sn,f.z+.69,.07,.57,.07,f.angle]);seatWood.push([x+dx*c,f.y+dx*sn,f.z+.24,.055,.055,.42,f.angle]);}
  }
 }
 merge(hall,deck,wood);boxInstances(hall,seatRows,fabric);boxInstances(hall,backs,birch);boxInstances(hall,seatWood,darkWood);boxInstances(hall,armrests,birch);
 // Side boxes, rear circle, aisles and balcony fronts give the volume real depth.
 const terraceSeats=[],terraceBacks=[],tierBlocks=[];for(const side of[-1,1])for(let tier=0;tier<3;tier++)for(let block=0;block<5;block++){const x=side*(16.2+tier*.72),y=-9+block*10,z=17+tier*2.3+block*.7;tierBlocks.push([x,y,z,3.5,8,.55]);rails.push(lineGeo([[x-side*1.75,y-4,z+.4],[x-side*1.75,y+4,z+.4]],.12));for(let a=0;a<3;a++)for(let b=0;b<6;b++){terraceSeats.push([x+side*(a*.75-.9),y-3+b*1.03,z+.55,.6,.66,.16]);terraceBacks.push([x+side*(a*.75-.9),y-2.72+b*1.03,z+.85,.6,.13,.58]);}}
 for(let row=0;row<5;row++){const z=21.5+row*.65,y=31.5+row*1.35;tierBlocks.push([0,y,z,32,1.4,.5]);for(let x=-15;x<16;x+=.82){if(Math.abs(x)<1||Math.abs(Math.abs(x)-8)<.5)continue;terraceSeats.push([x,y,z+.5,.62,.65,.16]);terraceBacks.push([x,y+.28,z+.8,.62,.13,.58]);}}
 boxInstances(hall,tierBlocks,wood);boxInstances(hall,terraceSeats,fabric);boxInstances(hall,terraceBacks,birch);merge(hall,rails,birch);
 const sideWalls=[];for(const side of[-1,1]){const panels=[];for(let y=-28;y<=39;y+=2.5)panels.push([side*19.5,y,21,1,2.28,15]);const wall=boxInstances(hall,panels,wood);wall.name=side<0?'hall-wall-west':'hall-wall-east';sideWalls.push({side,wall});}
 // Configurable horseshoe stage lifts are a2022-renewal feature, not a1973 fixture.
 const stageRisers=group(hall,'renewed-stage-risers'),risers=[];
 for(let i=0;i<4;i++){const outline=new T.Shape(riserOutline(6.9-i*1.3,5.85-i*1.3).map(p=>new T.Vector2(...p)));const g=new T.ExtrudeGeometry(outline,{depth:(4-i)*.2,bevelEnabled:false});g.translate(0,0,stageZ);risers.push(g);}merge(stageRisers,risers,wood);
 // Retained side strips suggest a timber ceiling; the centre is explicitly cut
 // away for visibility. Its profile is estimated, never a surveyed roof section.
 const ceiling=group(root,'cutaway-rib-context'),cg=[];
 for(let y=-28;y<40;y+=4.8)for(const side of[-1,1])cg.push(lineGeo([[-25+side*19.2,y,26.8],[-25+side*16,y,28],[-25+side*12,y,28.9]],.18));merge(ceiling,cg,wood);
 // Solid balcony fronts and shallow varied diffuser fins provide visible thickness.
 const fronts=[],fins=[];for(const side of[-1,1])for(let tier=0;tier<3;tier++)for(let block=0;block<5;block++){
  const x=side*(16.2+tier*.72),y=-9+block*10,z=17+tier*2.3+block*.7;
  fronts.push([x-side*1.75,y,z-.3,.22,8,1.15]);for(let j=0;j<18;j++)fins.push([x-side*(1.9+.05*(j%4)),y-3.8+j*.43,z-.3,.15,.14,.95]);
 }boxInstances(hall,fronts,wood);const diffusers=boxInstances(hall,fins,birch);diffusers.name='renewed-box-diffusers';
 const organ=group(hall,'grand-organ'),pipeGeos=[],mouths=[];box(organ,13,2,7.7,0,-35,21,darkWood);for(let i=0;i<61;i++){const x=(i-30)*.185,h=3.2+3.8*(.4+.6*Math.cos(x*.75)**2),r=.055+.025*(h/7);const g=new T.CylinderGeometry(r,r,h,10,1,true);g.rotateX(Math.PI/2);g.translate(x,-33.8,17.8+h/2);pipeGeos.push(g);mouths.push([x,-33.71,18.3,r*1.1,.025,.13]);}merge(organ,pipeGeos,pipe);boxInstances(organ,mouths,darkWood);
 // 18 variable-height petals: 12 orchestra, four audience-facing and two choir.
 const reflectorPositions=[];for(let row=0;row<3;row++)for(let col=0;col<4;col++)reflectorPositions.push([(col-1.5)*3.9,-25+row*3.7,stageZ+9.2+row*.55]);for(let i=0;i<4;i++)reflectorPositions.push([(i-1.5)*4.1,-12,stageZ+10.7]);for(const x of[-4.5,4.5])reflectorPositions.push([x,-30.7,stageZ+9.8]);
 // Thin, closed, independently authored curved panels, rather than open spheres.
 // No claim that these estimated contours reproduce the manufactured reflectors.
 const pv=[],pi=[],rings=8,slices=32,layerSize=1+rings*slices;
 for(const side of[1,-1]){pv.push(0,0,side*.04);for(let r=1;r<=rings;r++)for(let j=0;j<slices;j++){const u=r/rings,a=j/slices*Math.PI*2;pv.push(1.8*u*Math.cos(a)*(1+.15*Math.sin(a)),2.5*u*Math.sin(a),-.28*u*u+.05*u*Math.sin(a)+side*.04);}}
 for(let j=0;j<slices;j++)pi.push(0,1+j,1+(j+1)%slices);
 for(let r=0;r<rings-1;r++)for(let j=0;j<slices;j++){const a=1+r*slices+j,b=a+slices,c=1+r*slices+(j+1)%slices,d=c+slices;pi.push(a,b,c,c,b,d);}
 const frontIndices=[...pi];for(let i=0;i<frontIndices.length;i+=3)pi.push(frontIndices[i]+layerSize,frontIndices[i+2]+layerSize,frontIndices[i+1]+layerSize);
 for(let j=0;j<slices;j++){const a=1+(rings-1)*slices+j,b=1+(rings-1)*slices+(j+1)%slices;pi.push(a,a+layerSize,b,b,a+layerSize,b+layerSize);}
 const petalGeometry=new T.BufferGeometry();petalGeometry.setAttribute('position',new T.Float32BufferAttribute(pv,3));petalGeometry.setIndex(pi);petalGeometry.computeVertexNormals();
 const hangers=[];for(const[x,y,z]of reflectorPositions){const p=new T.Mesh(petalGeometry,petal);p.rotation.x=.12;p.position.set(x-25,y,z);groups.renewal.add(p);p.name='acoustic-petal-'+hangers.length;hangers.push(lineGeo([[x-25,y,z+.04],[x-25,y,z+4]],.028));}merge(groups.renewal,hangers,metal);
 const sideReflectors=[];for(const side of[-1,1])for(let i=0;i<11;i++)sideReflectors.push([side*18.6-25,-12+i*4.3,26.3,1.4,2.9,.32]);boxInstances(groups.renewal,sideReflectors,petal);
 box(groups.renewal,2.5,2.5,10,-3,42,18,glass);merge(groups.renewal,[lineGeo([[-3,-22,13.2],[-3,42,13.2],[-10,42,13.2]],.17)],petal);
 return{groups,materials,stats:{illustratedShells:ROOF_SPECS.length,sphericalPatches:18,workingSphereRadius:ROOF_RADIUS,reflectors:18,sideReflectors:22,illustratedSeats:seatRows.length+terraceSeats.length,stageDepth:12.3,stageFrontWidth:14.5},apply(p,st){
  for(const[g,key,t]of stages)g.visible=p[key]>=t;
  const cut=st.exploring&&['hall','renewal','organ'].includes(st.exploreTarget),ribView=st.exploring&&st.exploreTarget==='ribs',podiumView=st.exploring&&st.exploreTarget==='podium';
  groups.podium.visible=p.podium>.001;terraces.visible=p.podium>=.42&&!podiumView;paving.visible=p.podium>=.94&&!podiumView;foyer.visible=podiumView&&p.podium>.8;
  groups.shells.visible=!cut;for(const[g,t]of shellStages)g.visible=p.shells>=t&&!(ribView&&/tile-band|panel-joints|edge-capping/.test(g.name));
  groups.glazing.visible=!cut&&!ribView&&p.fitout>.8;
  const near=nearWallSide(st.cam?.yaw??60);for(const {side,wall}of sideWalls)wall.visible=!cut||side!==near;
  stage.position.z=floorZ+.4*(1-p.renewal);stageRisers.visible=p.renewal>.99;diffusers.visible=p.renewal>.99;groups.interior.visible=cut&&p.fitout>.95;ceiling.visible=cut&&p.fitout>.95&&st.exploreTarget==='hall';organ.visible=p.organ>.99;
  groups.renewal.visible=cut&&p.renewal>.99&&st.exploreTarget!=='organ';groups.erection.visible=p.shells>.04&&p.shells<.94;
 }};
}
