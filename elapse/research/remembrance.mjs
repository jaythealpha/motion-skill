import {existsSync,readFileSync} from 'node:fs';
import {validateRecords} from '../engine/records-model.js';
export function withRemembrance(model,id){
 const key=id||model.subject?.id||(/britannic/i.test(model.subject?.name?.en)?'britannic':/titanic/i.test(model.subject?.name?.en)?'titanic':null);
 const aliases={'eiffel-1889':'eiffel-tower',notredame:'notre-dame'};
 const path=new URL('./records/'+(aliases[key]||key)+'.json',import.meta.url);
 if(existsSync(path))model.remembrance=JSON.parse(readFileSync(path,'utf8'));
 for(const e of model.events||[]){if(e.id==='before')e.presentationAnchor=true;if(typeof e.at==='string'&&(/^\d{4}-\d{2}-\d{2}$/.test(e.at)||/T00:00$/.test(e.at)))e.timePrecision='date';if(['sampoong','seongsu-bridge'].includes(key)&&['warning','collapse','drop'].includes(e.id))e.timePrecision='approximate';}
 const result=validateRecords(model);if(result.errors.length)throw new Error(JSON.stringify(result.errors));return model;
}
