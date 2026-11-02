// Independently authored damage interpretation. Coordinates are not survey measurements.
// A source-supported forward break is expressed without rewriting the historical poses.
export function damagedHull(positions,indices,{id,cut=91.25,depth=19.66}){
 const out=new Float32Array(positions),idx=[];
 for(let i=0;i<out.length;i+=3){const x=out[i],y=out[i+1],z=out[i+2],d=Math.abs(x-cut),w=Math.max(0,1-d/9),below=Math.max(0,1-z/depth);
  if(w&&z<depth-.001){out[i]+=w*below*(Math.sin(z*1.7+y*.42)*1.1+(id==='hull-bow'?1.5:-1.1));out[i+1]+=w*below*Math.sin(z*1.1+x*.7)*.8;out[i+2]+=w*below*Math.sin(y*.8)*.5;}
 }
 for(let i=0;i<indices.length;i+=3){const ids=[indices[i],indices[i+1],indices[i+2]],cx=ids.reduce((s,j)=>s+positions[j*3],0)/3,cz=ids.reduce((s,j)=>s+positions[j*3+2],0)/3;
  // Tear the cut-end closure below surviving upper deck; no invented holes elsewhere.
  if(Math.abs(cx-cut)<5.4+1.1*Math.sin(cz*.67)+.55*Math.sin(cz*1.9)&&cz<depth-1.9)continue;
  idx.push(...ids);
 }
 return {positions:out,indices:new Uint32Array(idx)};
}
export const QUALITY_VIEWS=[
 {id:'wreck',name:{ko:'전체 선체',en:'Wreck overview'},parts:['hull-main','hull-bow'],yaw:160,pitch:12},
 {id:'bow',name:{ko:'선수 파손·내부 구조',en:'Bow break / structure'},parts:['hull-main'],trimX:[.91,1],yaw:290,pitch:35},
 {id:'breach',name:{ko:'파손면·판재 단면 확대',en:'Fracture / plate edge close-up'},parts:['hull-main'],trimX:[.94,1],trimY:[.45,1],trimZ:[.08,.9],yaw:290,pitch:35},
 {id:'bridge',name:{ko:'선교 장비·인양 장치',en:'Bridge / davits'},parts:['officers','bridge-wings'],yaw:220,pitch:20},
 {id:'foredeck',name:{ko:'선수 갑판·윈치',en:'Foredeck / winches'},parts:['hull-bow'],yaw:210,pitch:20},
 {id:'stern',name:{ko:'선미·추진기',en:'Stern / propulsion'},parts:['hull-main'],trimX:[0,.16],yaw:120,pitch:12}
];

// Titanic end cuts use their own historical section frames and observation angles.
export const TITANIC_QUALITY_VIEWS=[
 {
  "id": "wreck",
  "name": {
   "ko": "선체 둘러보기",
   "en": "Wreck overview"
  },
  "parts": [
   "hull-bow",
   "hull-stern"
  ],
  "yaw": 210,
  "pitch": 18
 },
 {
  "id": "bow",
  "name": {
   "ko": "선수",
   "en": "Bow"
  },
  "parts": [
   "hull-bow"
  ],
  "yaw": 180,
  "pitch": 20
 },
 {
  "id": "bridge",
  "name": {
   "ko": "선교·갑판",
   "en": "Bridge / decks"
  },
  "parts": [
   "officers",
   "bridge-wings"
  ],
  "yaw": 180,
  "pitch": 26
 },
 {
  "id": "stern",
  "name": {
   "ko": "선미",
   "en": "Stern"
  },
  "parts": [
   "hull-stern"
  ],
  "trimX": null,
  "yaw": 120,
  "pitch": 20
 },
 {
  "id": "bow-break",
  "name": {
   "ko": "선수부 파단면 확대",
   "en": "Bow fracture close-up"
  },
  "parts": [
   "hull-bow"
  ],
  "trimX": [
   0,
   0.13
  ],
  "yaw": 240,
  "pitch": 20
 },
 {
  "id": "stern-break",
  "name": {
   "ko": "선미부 파단면 확대",
   "en": "Stern fracture close-up"
  },
  "parts": [
   "hull-stern"
  ],
  "trimX": [
   0.83,
   1
  ],
  "yaw": 285,
  "pitch": 22
 }
];
