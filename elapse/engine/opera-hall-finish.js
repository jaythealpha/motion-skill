import * as T from 'three';
import {surfaceMaterial} from '../shared/material-budget.js';
export function addHallFinish(form){
 // Independently estimated brushbox backdrop and section rims, not surveyed joinery.
 const parent=form.groups.interior,g=new T.Group();g.name='estimated-hall-finish';parent.add(g);
 const material=surfaceMaterial({color:'#57321e',roughness:.64}),trim=surfaceMaterial({color:'#a87949',roughness:.6});
 const shape=new T.Shape();shape.moveTo(-19.2,0);shape.lineTo(19.2,0);shape.lineTo(19.2,14);shape.quadraticCurveTo(0,20,-19.2,14);shape.closePath();
 const geometry=new T.ExtrudeGeometry(shape,{depth:.4,bevelEnabled:false,curveSegments:20});geometry.rotateX(Math.PI/2);geometry.translate(0,-37.4,13);
 const wall=new T.Mesh(geometry,material);wall.castShadow=wall.receiveShadow=true;g.add(wall);
 const fins=new T.InstancedMesh(new T.BoxGeometry(1,1,1),trim,80),matrix=new T.Matrix4();
 for(let i=0;i<80;i++){const x=-18.9+i*.478,h=14.2+2.7*(1-(x/19)**2);matrix.makeScale(.055,.12,h);matrix.setPosition(x,-37.12,13+h/2);fins.setMatrixAt(i,matrix);}fins.computeBoundingSphere();fins.castShadow=fins.receiveShadow=true;g.add(fins);
 // Warm recessed light strips clarify balcony fronts without introducing point lights.
 const strips=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:'#edbd78'}),30);
 let index=0;for(const side of[-1,1])for(let tier=0;tier<3;tier++)for(let block=0;block<5;block++){
  const x=side*(16.2+tier*.72),y=-9+block*10,z=17+tier*2.3+block*.7;
  matrix.makeScale(.04,7.8,.045);matrix.setPosition(x-side*1.9,y,z+.3);strips.setMatrixAt(index++,matrix);
 }strips.computeBoundingSphere();g.add(strips);
}
