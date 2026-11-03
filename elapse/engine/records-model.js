import {validateTopicResearch,TOPIC_PROFILE} from './topic-research.js';
// Claim-level evidence is independent of scene-item classification.
import {recordText} from './records-text.js';
const langs=['en','ko','ja','zh','es'],id=/^[a-z0-9][a-z0-9-]*$/;
export function validateRecords(model){
 const errors=[],warnings=[],m=model.remembrance,err=(where,msg)=>errors.push({where:'remembrance.'+where,msg});
 if(m==null){if(model.meta?.researchProfile===TOPIC_PROFILE)errors.push(...validateTopicResearch(model).errors);return{errors,warnings};}
 const pack=(p,w)=>{if(!p||typeof p!=='object'||langs.some(l=>typeof p[l]!=='string'||!p[l].trim()))err(w,'requires non-empty text in five languages');};
 if(m.version!==1)err('version','expected 1');
 if(!Array.isArray(m.sources)||!Array.isArray(m.records)||!m.records.length){err('records','requires sources and non-empty records');return{errors,warnings};}
 const sources=new Set(),records=new Set(),events=new Set((model.events||[]).map(e=>e.id));
 for(const s of m.sources){if(typeof s.id!=='string'||!id.test(s.id)||sources.has(s.id))err('sources','invalid or duplicate id');sources.add(s.id);if(!/^https:\/\//.test(s.url)||!s.title||!s.locator||!recordText.sourceTypes[s.type]||!/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt))err('sources.'+s.id,'requires HTTPS, title, locator, source type and checked date');}
 const refs=(r,w)=>{if(!Array.isArray(r)||!r.length||r.some(i=>!sources.has(i)))err(w,'unknown or missing evidence reference');};
 for(const r of m.records){const w='records.'+r.id;if(typeof r.id!=='string'||!id.test(r.id)||records.has(r.id))err(w,'invalid or duplicate id');records.add(r.id);for(const k of['title','action','meaning','unknowns'])pack(r[k],w+'.'+k);refs(r.sourceIds,w);if(r.time?.note)pack(r.time.note,w+'.time.note');const precision=r.time?.precision,pattern={year:/^\d{4}$/,month:/^\d{4}-\d{2}$/,date:/^\d{4}-\d{2}-\d{2}$/,minute:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,second:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,approximate:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/}[precision];if(!pattern?.test(r.time?.date))err(w+'.time','date must match declared precision');if(['minute','second','approximate'].includes(precision)&&!r.time.zone)err(w+'.time','timed record requires zone');if(!events.has(r.sceneAnchor?.eventId))err(w+'.sceneAnchor','unknown scene event');const fids=new Set();if(!Array.isArray(r.facts))err(w+'.facts','requires array');else for(const f of r.facts){if(typeof f.id!=='string'||!id.test(f.id)||fids.has(f.id))err(w+'.facts','invalid or duplicate fact id');fids.add(f.id);pack(f.label,w+'.facts.label');pack(f.scope,w+'.facts.scope');if(f.qualifier)pack(f.qualifier,w+'.facts.qualifier');if(!recordText.units[f.unit]||!['string','number'].includes(typeof f.value)||f.value===''||(typeof f.value==='number'&&!Number.isFinite(f.value)))err(w+'.facts','invalid value or unit');refs(f.sourceIds,w+'.facts');}}
 if(model.meta?.researchProfile===TOPIC_PROFILE){const v=validateTopicResearch(model);errors.push(...v.errors);warnings.push(...v.warnings);}
 return{errors,warnings};
}
