// Stops reuse existing model parts; this mode freezes historical time, not the observation clock.
export function explorationStops(model){
 if(model.subject?.kind==='building')return model.stops;
 const valid=new Set(model.pieces.map(p=>p.id));
 if(Array.isArray(model.stops))return model.stops.map(s=>({...s,parts:(s.parts||[]).filter(id=>valid.has(id))})).filter(s=>s.parts.length);
 const hulls=model.pieces.filter(p=>p.template==='hull').map(p=>p.id);
 if(!model.pieces.some(p=>p.id==='hull-bow'))return hulls.length?[{id:'overview',name:{ko:'선체 둘러보기',en:'Hull overview'},parts:hulls,yaw:model.camera?.at(-1)?.yaw??210,pitch:3}]:[];
 const ids=new Set(model.pieces.map(p=>p.id)),brit=ids.has('hull-main');
 const stops=[
  {id:'wreck',name:{ko:'선체 둘러보기',en:'Wreck overview'},parts:brit?['hull-main','hull-bow']:['hull-bow','hull-stern'],yaw:brit?160:210,pitch:18},
  {id:'bow',name:{ko:'선수',en:'Bow'},parts:['hull-bow'],yaw:brit?210:180,pitch:20},
  {id:'bridge',name:{ko:'선교·갑판',en:'Bridge / decks'},parts:['officers','bridge-wings'],yaw:brit?220:180,pitch:26},
  {id:'stern',name:{ko:'선미',en:'Stern'},parts:brit?['hull-main']:['hull-stern'],trimX:brit?[0,.23]:null,yaw:120,pitch:20},
 ];
 return stops.map(s=>({...s,parts:s.parts.filter(id=>ids.has(id))})).filter(s=>s.parts.length);
}
export function explorationStart(model,t){
 if(model.subject?.kind==='building')return t;
 const projection=model.features.projectionChapters||(model.features.projection?[model.chapters.at(-1).id]:[]);
 const historical=model.chapters.filter(c=>c.unit==='year'&&!projection.includes(c.id));
 const c=historical.find(c=>t>=c.bar[0]&&t<=c.bar[1]);
 if(c)return t;
 const last=historical.at(-1);
 return last?(last.bar[0]+last.bar[1])/2:t;
}
