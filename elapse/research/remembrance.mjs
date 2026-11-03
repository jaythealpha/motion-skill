import {existsSync,readFileSync} from 'node:fs';
import {validateRecords} from '../engine/records-model.js';

export function withRemembrance(model,id){
 const key=id||model.subject?.id||(/britannic/i.test(model.subject?.name?.en)?'britannic':/titanic/i.test(model.subject?.name?.en)?'titanic':null);
 const aliases={'eiffel-1889':'eiffel-tower',notredame:'notre-dame'};
 const path=new URL('./records/'+(aliases[key]||key)+'.json',import.meta.url);
 const curated=existsSync(path);
 if(curated)model.remembrance=JSON.parse(readFileSync(path,'utf8'));
 for(const e of model.events||[]){
  if(e.id==='before')e.presentationAnchor=true;
  // Identified date-only placeholders, not every midnight or date-shaped boundary.
  const dateOnly=(key==='sampoong'&&['last-rescue','policy'].includes(e.id))||(key==='seongsu-bridge'&&e.id==='replace');
  if(curated&&e.timePrecision==='date'&&!dateOnly)delete e.timePrecision;
  if(dateOnly)e.timePrecision='date';
  if(['eiffel-1889','eiffel-tower'].includes(key)){
   e.timePrecision='month';
   if(e.id==='start')e.presentationAnchor=true;
  }
  if(['notredame','notre-dame'].includes(key)&&e.id==='restoration')e.presentationAnchor=true;
  if(key==='titanic'&&e.id==='five')e.presentationAnchor=true;
  if(['sampoong','seongsu-bridge'].includes(key)&&['warning','collapse','drop'].includes(e.id))e.timePrecision='approximate';
 }
 const result=validateRecords(model);
 if(result.errors.length)throw new Error(JSON.stringify(result.errors));
 return model;
}
