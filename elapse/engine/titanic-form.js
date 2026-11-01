// Independent approximate reconstruction from period profile + 1912 inquiry + deck-plan references.
// The original time-model JSON and split/attachment frames are not rewritten.
import {refineLinerHull} from './britannic-form.js';
export const TITANIC_PLAN_SOURCES=[
 {title:'1912 British inquiry · structural dimensions',url:'https://www.titanicinquiry.org/BOTInq/BOTReport/botRepTitanic.php'},
 {title:'1912 British inquiry · deck extents and 192ft screen',url:'https://www.titanicinquiry.org/BOTInq/BOTReport/botRepAccomo.php'},
 {title:'1911 Engineering period profile · Olympic/Titanic (not final 1912 outfit)',url:'https://commons.wikimedia.org/wiki/File:Olympic_and_Titanic_Side_Plan_1911.png'},
 {title:'Titanic Inquiry Project · A-deck reference drawing (2001)',url:'https://www.titanicinquiry.org/plans/adeck.php'},
 {title:'Titanic Belfast · provenance of original 1912 inquiry plan',url:'https://www.titanicbelfast.com/history-of-titanic/titanic-stories/from-skip-to-saleroom-titanics-plan/'},
];
export const TITANIC_ECOLOGY_SOURCES=[
 {title:'Cleland et al. (2025) · Titanic megafauna',url:'https://doi.org/10.1016/j.dsr.2025.104544'},
 {title:'NOAA · The Titanic Wrecksite',url:'https://oceantoday.noaa.gov/titanicwrecksite/'},
];
export const FT=.3048;
export const TITANIC_SCREEN_FROM=76.55-192*FT;
const A_OUTER=[[-75.45,7.6],[-71,9.8],[-63,12.5],[61,12.5],[69,11.6],[76.55,9.7]];
const A_INNER=[[-75.45,3.6576],[-67,3.6576],[-66,9.4],[-44,9.4],[-43,7.6],[-22,7.6],[-21,10.5],[-2,10.5],[-1,4.4],[17,4.4],[18,9.8],[45,9.8],[46,10.9728],[76.55,10.9728]];
const HOUSE={
 officers:[[54.55,5],[56,6.5],[68,6.5],[69,5.1],[74.8,5.1],[76.55,3.2]],
 'first-house':[[-3.45,3.4],[0,3.4],[1,5.2],[12,5.2],[13,6],[25,6],[26,4.7],[38,4.7],[39,3.2],[42.55,3.2]],
 'aft-house':[[-69.45,3.2],[-63,3.2],[-62,5],[-49,5],[-48,6],[-34,6],[-33,4.8],[-20,4.8],[-19,3.4],[-15.45,3.4]],
};
function valueAt(rows,x){if(x<=rows[0][0])return rows[0][1];for(let i=1;i<rows.length;i++)if(x<=rows[i][0]){const a=rows[i-1],b=rows[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return rows.at(-1)[1];}
function clip(rows,piece){const q=piece.params,origin=piece.offset[0],a=origin-q.l/2,b=origin+q.l/2;return [[a,valueAt(rows,a)],...rows.filter(r=>r[0]>a+.001&&r[0]<b-.001),[b,valueAt(rows,b)]].map(([x,w])=>[x-origin,Math.min(q.b/2,w)]);}
export function refineTitanicPiece(piece){
 const q=piece.params;
 if(piece.template==='hull'){
   const base=refineLinerHull(piece).params;
   // B deck is the old model's shell top. Recess the two open wells by one deck (9ft).
   const foreEnd=134.55-125*FT,aftStart=-134.55+105*FT;
   return {...piece,params:{...base,planEndDecks:false,planWellCuts:[{from:foreEnd-50*FT,to:foreEnd,drop:9*FT},{from:aftStart,to:aftStart+50*FT,drop:9*FT}],
     windows:[{from:-111,to:-82,spacing:2.8,z:14.9},{from:-73,to:75,spacing:2.4,z:14.9},{from:84,to:120,spacing:2.8,z:14.9},
       {from:-108,to:-86,spacing:2.6,z:17.6},{from:-74,to:72,spacing:2.2,z:17.6},{from:86,to:116,spacing:3,z:17.6},
       {from:-115,to:-104,spacing:3,z:20.6},{from:-85,to:79,spacing:2.45,z:20.6,kind:'rect',width:.85,height:1.1},{from:99,to:118,spacing:3,z:20.6}]}};
 }
 if(piece.template!=='deckhouse')return piece;
 const id=piece.id.replace(/-(bow|mid|stern)$/,''),outline=id==='a-deck'?A_OUTER:HOUSE[id];if(!outline)return piece;
 const p={...q,planForm:true,planOrigin:piece.offset[0],planOutline:clip(outline,piece),
   planWindowWidth:id==='a-deck'?1.7:.70,planWindowHeight:id==='a-deck'?1.4:1.05,planWindowGap:id==='a-deck'?2.7:2.15,
   planPromenade:id==='a-deck',planScreenFrom:id==='a-deck'?TITANIC_SCREEN_FROM:null,roofStep:id==='first-house'?.42:0,planDome:id==='first-house'};
 if(id==='a-deck')p.planInnerOutline=clip(A_INNER,piece).map(([x,w])=>[x,Math.min(w,valueAt(p.planOutline,x)-.55)]);
 return {...piece,params:p};
}
