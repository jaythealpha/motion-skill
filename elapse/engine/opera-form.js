import * as T from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';
// Authored architectural interpretation. Not traced, scanned or a measured structural model.
export function operaForm(root){
 const materials=[],groups={};const mat=(color,metalness=0,roughness=.65)=>{const m=surfaceMaterial({color,metalness,roughness,side:T.DoubleSide});m.userData.originalColor=m.color.clone();m.userData.baseMetalness=metalness;materials.push(m);return m;};
 const stone=mat('#b9a080'),edge=mat('#8e7b63'),roof=mat('#eee7d7',.12,.35),rib=mat('#c6c4b8'),glass=mat('#355960',.2,.25),metal=mat('#626f70',.35,.4),wood=mat('#8e552b'),petal=mat('#ae3572');
 const water=mat('#416f7a',.1,.36);const harbour=new T.Mesh(new T.PlaneGeometry(4000,4000),water);harbour.position.z=-1.5;root.add(harbour);box(root,122,188,1,0,0,-.5,stone);
 const siteLines=[];for(let x=-60;x<=60;x+=12)siteLines.push(x,-90,.03,x,90,.03);for(let y=-90;y<=90;y+=15)siteLines.push(-60,y,.03,60,y,.03);const siteGeometry=new T.BufferGeometry();siteGeometry.setAttribute('position',new T.Float32BufferAttribute(siteLines,3));root.add(new T.LineSegments(siteGeometry,new T.LineBasicMaterial({color:'#477e8f',transparent:true,opacity:.65})));
 for(const id of ['podium','shells','glazing','interior','renewal']){groups[id]=new T.Group();groups[id].name=id;root.add(groups[id]);}
 function box(g,w,d,h,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,d,h),m);o.position.set(x,y,z);g.add(o);return o;}
 function line(g,points,m,r=.15){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));g.add(new T.Mesh(new T.TubeGeometry(curve,Math.max(8,points.length*2),r,5,false),m));}
 // Podium terraces and monumental southern stair, with separate parapets and paving joints.
 box(groups.podium,110,146,9,0,8,4.5,stone);box(groups.podium,116,136,2,0,11,10,stone);box(groups.podium,120,105,1,0,25,11.5,stone);
 for(let i=0;i<32;i++)box(groups.podium,92,1.12,.36,0,-88+i*1.12,.18+i*.36,stone);
 for(const x of [-55,55])box(groups.podium,.7,140,1,x,8,11.5,edge);
 const joints=[];for(let y=-58;y<78;y+=3.8)joints.push(-53,y,11.08,53,y,11.08);for(let x=-52;x<54;x+=3.8)joints.push(x,-58,11.08,x,78,11.08);const jg=new T.BufferGeometry();jg.setAttribute('position',new T.Float32BufferAttribute(joints,3));groups.podium.add(new T.LineSegments(jg,new T.LineBasicMaterial({color:'#8c806d',transparent:true,opacity:.3})));
 // Paired curved sails: smooth ridge profile, curved haunches, panel seams and structural ribs.
 // The real spherical solution is documented; these control points and dimensions are estimates.
 const specs=[[-24,53,24,35,55,1],[-24,22,23,31,47,1],[-24,-7,21,27,35,1],[-24,-30,16,22,23,-1],[24,47,22,32,44,1],[24,18,21,29,37,1],[24,-9,18,25,29,1],[24,-31,14,21,19,-1],[0,-50,14,20,13,-1]];
 function point(s,u,v){const [cx,cy,w,len,h,sgn]=s;const ridge=Math.sin(u*Math.PI/2),width=w*Math.sin(Math.PI*u)*.94+.24;return[cx+v*width,cy+(u-.5)*len*sgn,12+h*ridge*Math.sqrt(Math.max(0,1-v*v))];}
 const shellPieces=[];
 for(const s of specs){const g=new T.Group();groups.shells.add(g);const verts=[],idx=[],nu=32,nv=20;for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++)verts.push(...point(s,i/nu,j/nv*2-1));for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j;idx.push(a,a+nv+1,a+1,a+1,a+nv+1,a+nv+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();g.add(new T.Mesh(geo,roof));
  for(let j=0;j<=10;j++){const pts=[];for(let i=0;i<=24;i++)pts.push(point(s,i/24,j/10*2-1));line(g,pts,rib,j===0||j===10?.22:.1);}
  const seams=[];for(let i=1;i<nu;i++)for(let j=0;j<nv;j++){seams.push(...point(s,i/nu,j/nv*2-1),...point(s,i/nu,(j+1)/nv*2-1));}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(seams,3));g.add(new T.LineSegments(sg,new T.LineBasicMaterial({color:'#b9b8aa',transparent:true,opacity:.36})));
  // Glazed northern end and fine mullions are schematic, not a surveyed window inventory.
  const pts=[point(s,.97,-.88),point(s,.97,.88),point(s,.42,.88),point(s,.42,-.88)];const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute([...pts[0],...pts[1],...pts[2],...pts[0],...pts[2],...pts[3]],3));pg.computeVertexNormals();groups.glazing.add(new T.Mesh(pg,glass));for(let k=0;k<=7;k++){const x=s[0]+(k/7*2-1)*s[2]*.4;line(groups.glazing,[[x,s[1]+s[3]*.45*s[5],12],[x,s[1]+s[3]*.45*s[5],12+s[4]*Math.sqrt(1-(k/7*2-1)**2)]],metal,.12);}shellPieces.push(g);
 }
 // Cutaway hall conveys acoustics/access renewal without changing the historical exterior shell.
 box(groups.interior,27,60,1,-24,24,13,wood);box(groups.interior,18,13,1,-24,49,16,wood);
 const seats=new T.InstancedMesh(new T.BoxGeometry(.65,.65,.65),wood,224),matrix=new T.Matrix4();for(let row=0;row<16;row++)for(let col=0;col<14;col++){matrix.makeTranslation(-36+col*1.8,-4+row*2.6,14+row*.18);seats.setMatrixAt(row*14+col,matrix);}seats.computeBoundingSphere();groups.interior.add(seats);
 for(let i=0;i<18;i++){const p=new T.Mesh(new T.SphereGeometry(1,12,6),petal);p.scale.set(2,3,.35);p.position.set(-35+(i%6)*4.5,39+Math.floor(i/6)*6,30);groups.renewal.add(p);}
 box(groups.renewal,3,3,15,-43,25,20,glass);line(groups.renewal,[[-43,-9,14],[-43,25,14],[-41,45,14]],petal,.28);
 return{groups,materials,stats:{illustratedShells:specs.length,reflectors:18},apply(p,st){groups.podium.visible=p.podium>.001;groups.podium.scale.z=Math.max(.02,p.podium);shellPieces.forEach((g,i)=>{g.visible=p.shells>i/specs.length;g.scale.z=Math.max(.02,Math.min(1,(p.shells-i/specs.length)*specs.length));});groups.glazing.visible=p.fitout>.8;const cut=st.exploring&&['hall','renewal'].includes(st.exploreTarget);groups.shells.visible=!cut;groups.glazing.visible=!cut&&p.fitout>.8;groups.interior.visible=cut&&p.fitout>.95;groups.renewal.visible=cut&&p.renewal>.99;}};
}
