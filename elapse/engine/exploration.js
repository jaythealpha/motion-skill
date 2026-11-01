// Stops reuse existing model parts; this mode freezes historical time, not the observation clock.
export function explorationStops(model){
 if(model.subject?.kind==='building')return model.stops;
 const ids=new Set(model.pieces.map(p=>p.id)),brit=ids.has('hull-main');
 const stops=[
  {id:'wreck',name:{ko:'선체 둘러보기',en:'Wreck overview'},parts:brit?['hull-main','hull-bow']:['hull-bow','hull-stern'],yaw:brit?160:210,pitch:18},
  {id:'bow',name:{ko:'선수',en:'Bow'},parts:['hull-bow'],yaw:brit?210:180,pitch:20},
  {id:'bridge',name:{ko:'선교·갑판',en:'Bridge / decks'},parts:['officers','bridge-wings'],yaw:brit?220:180,pitch:26},
  {id:'stern',name:{ko:'선미',en:'Stern'},parts:brit?['hull-main']:['hull-stern'],trimX:brit?[0,.23]:null,yaw:120,pitch:20},
 ];
 return stops.map(s=>({...s,parts:s.parts.filter(id=>ids.has(id))})).filter(s=>s.parts.length);
}
export function explorationStart(model,t){if(model.subject?.kind==='building')return t;const c=model.chapters.find((c,i)=>t>=c.bar[0]&&(t<c.bar[1]||i===model.chapters.length-1));return c?.unit==='year'&&!(model.features.projectionChapters||(model.features.projection?[model.chapters.at(-1).id]:[])).includes(c.id)?t:model.pieces.some(p=>p.id==='hull-main')?90:85;}
