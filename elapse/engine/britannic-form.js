// Independent, approximate 3D interpretation of period GA/profile evidence.
// No source scan, traced contour, modern reconstruction mesh or measured offsets are bundled.
// Dimensions remain the existing time model's envelope. See research/britannic-form-notes.md.
import {halfBreadthAt, deckHeightAt} from './geom.js';
export const PLAN_SOURCES = [
  {title:'1914 Britannic longitudinal section and deck plans · USM catalogue',url:'https://digitalcommons.usm.maine.edu/oml-morse-collection-gallery/2657/'},
  {title:'1914 White Star Line plan · historical reproduction',url:'https://commons.wikimedia.org/wiki/File:The_White_Star_Atlantic_Mail_Steamer_Britannic_(deck_plans).jpg'},
  {title:'Mark Chirnside · forward A-deck promenade research',url:'https://www.encyclopedia-titanica.org/the-enclosure-of-titanics-forward-a-deck-promenade-popular-myth.html'},
];
// Hand-authored envelope fractions: shape interpretation, NOT a transcribed offsets table.
// Negative x is aft; the original model's counter-stern convention is preserved.
const WATER_SHAPE=[[0,.025],[.025,.11],[.06,.25],[.10,.43],[.16,.69],[.23,.89],[.31,.985],[.39,1],[.63,1],[.72,.95],[.81,.77],[.89,.49],[.95,.235],[.98,.09],[1,.0084]];
const DECK_SHAPE=[[0,.0084],[.025,.43],[.06,.61],[.10,.77],[.16,.90],[.23,.97],[.31,1],[.67,1],[.76,.94],[.84,.77],[.91,.51],[.97,.215],[1,.0084]];
function lerpRows(rows,x){let i=rows.findIndex(r=>r[0]>=x);if(i<=0)return rows[i<0?rows.length-1:0][1];const a=rows[i-1],b=rows[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}
export function planHalfWidth(q,x){return q.planOutline?lerpRows(q.planOutline,x):q.b/2;}
const FORMS={
  'b-deck':[[-.5,.67],[-.47,.78],[-.40,.87],[-.33,.87],[-.32,1],[-.14,1],[-.13,.95],[.12,.95],[.13,1],[.37,1],[.43,.94],[.48,.82],[.5,.72]],
  'a-deck':[[-.5,.64],[-.47,.78],[-.40,.88],[-.29,.88],[-.28,1],[.33,1],[.43,.96],[.48,.85],[.5,.73]],
  officers:[[-.5,.80],[-.43,.80],[-.42,1],[.22,1],[.23,.79],[.42,.79],[.48,.61],[.5,.45]],
  'first-house':[[-.5,.60],[-.41,.60],[-.40,.83],[-.17,.83],[-.16,1],[.07,1],[.08,.75],[.36,.75],[.37,.55],[.5,.55]],
  'aft-house':[[-.5,.53],[-.41,.53],[-.40,.79],[-.22,.79],[-.21,1],[.06,1],[.07,.77],[.37,.77],[.38,.60],[.5,.60]],
};
export function refineLinerHull(piece){
  const q=piece.params;
    const a=q.offsets.stations[0].x,b=q.offsets.stations.at(-1).x,B=Math.max(...q.offsets.stations.flatMap(s=>s.hb));
    const wl=[0,.15,.38,.8,1.3,2,3,4.5,6,8,q.draft,13,16,q.depth];
    const stations=Array.from({length:65},(_,i)=>{const u=i/64,x=a+(b-a)*u;
      return {x,hb:wl.map(z=>{const above=Math.max(0,Math.min(1,(z-q.draft)/(q.depth-q.draft))),f=lerpRows(WATER_SHAPE,u)*(1-above)+lerpRows(DECK_SHAPE,u)*above;
        const bilge=z>=3?1: .73+.27*Math.sqrt(Math.max(0,1-(1-z/3)**2));
        // Very fine underwater run, flared entrance and a slight tumblehome at the top.
        const endFine=z<q.draft&&(u<.23||u>.80)? .4+.6*Math.pow(z/q.draft,.4):1;
        return Math.max(.12,B*f*bilge*endFine*(z>16?1-.012*(z-16)/(q.depth-16):1));})};});
    return {...piece,params:{...q,offsets:{waterlines:wl,stations},planForm:true,
      // Grouped rows leave gaps around working areas; individual coordinates remain estimates.
      windows:[{from:-112,to:-89,spacing:3.1,z:12.6},{from:-79,to:77,spacing:2.65,z:13.6},{from:89,to:119,spacing:3.4,z:13.2},
        {from:-108,to:-75,spacing:2.8,z:16.4},{from:-69,to:69,spacing:2.25,z:16.5},{from:78,to:115,spacing:3,z:16.7},
        {from:-100,to:-80,spacing:3.2,z:18.6},{from:-68,to:60,spacing:2.6,z:19.0},{from:70,to:105,spacing:3.5,z:19.0}]}};
}
export function refineBritannicPiece(piece){
  const q=piece.params;
  if(piece.template==='hull')return refineLinerHull(piece);
  if(FORMS[piece.id])return {...piece,params:{...q,planForm:true,planOutline:FORMS[piece.id].map(([x,w])=>[x*q.l,w*q.b/2]),
    planPromenade:piece.id==='a-deck',planWindowWidth:piece.id==='a-deck'?1.7:piece.id==='b-deck'?.85:.65,
    planWindowGap:piece.id==='a-deck'?2.7:piece.id==='b-deck'?2.5:2.15,
    planWindowHeight:piece.id==='a-deck'?1.42:1.05,roofStep:['first-house','aft-house'].includes(piece.id)?.42:0}};
  return piece;
}
export function planWindows(q){
  const out=[],step=q.planWindowGap||2.5;
  for(let x=-q.l/2+1.5,i=0;x<q.l/2-1.5;x+=step,i++){
    // Open aft promenade; the enclosed forward section has larger sliding-window bays.
    const open=q.planPromenade&&(q.planScreenFrom!=null?x+(q.planOrigin||0)<q.planScreenFrom:x<-.03*q.l);
    // Retain deliberate structural gaps between window groups, not a uniform dotted row.
    if(!open&&i%11===5)continue;
    out.push({x,z:q.h*.51,w:open?step-.18:q.planWindowWidth,h:open?q.h-.7:q.planWindowHeight,open});
  }
  return out;
}
// A thin deck surface clipped to a hull range, following its sheer/curve.
export function deckBand(q,x0,x1,lift=0){
  const xs=Array.from({length:25},(_,i)=>x0+(x1-x0)*i/24),points=[];
  for(const x of xs)points.push([x,-halfBreadthAt(q,x,deckHeightAt(q,x)),deckHeightAt(q,x)+lift]);
  for(const x of xs.toReversed())points.push([x,halfBreadthAt(q,x,deckHeightAt(q,x)),deckHeightAt(q,x)+lift]);
  return points;
}
