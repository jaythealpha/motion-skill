// Evidence coverage checks. They validate an authored research bundle, not historical truth.
const langs=['en','ko','ja','zh','es'];
export const TOPIC_PROFILE='people-facts-v1';
export function validateTopicResearch(model){
 const errors=[],warnings=[],records=model.remembrance?.records||[],sources=new Set((model.remembrance?.sources||[]).map(s=>s.id));
 const fail=(where,msg)=>errors.push({where:'research.'+where,msg});
 const localized=p=>p&&langs.every(l=>typeof p[l]==='string'&&p[l].trim());
 if(!records.length)fail('records','new topics require sourced people records and scoped factual values');
 const people=records.filter(r=>Array.isArray(r.contributors)&&r.contributors.length);
 for(const r of people)for(const c of r.contributors){if(typeof c.name!=='string'||!c.name.trim()||!localized(c.role)||!Array.isArray(c.sourceIds)||!c.sourceIds.length||c.sourceIds.some(id=>!sources.has(id)||!r.sourceIds?.includes(id)))fail(r.id,'each contributor needs a name or documented collective, five-language role and record evidence');}
 const facts=records.flatMap(r=>(r.facts||[]).map(f=>({record:r.id,...f}))).filter(f=>typeof f.value==='number'&&Number.isFinite(f.value));
 for(const f of facts)if(!localized(f.scope)||!f.sourceIds?.length||f.sourceIds.some(id=>!sources.has(id)))fail(f.record+'/'+f.id,'numeric values require five-language scope and evidence');
 const gaps=model.remembrance?.research?.gaps||[];
 for(const gap of gaps){if(!['people','facts'].includes(gap.kind)||!localized(gap.reason)||!gap.sourceIds?.length||gap.sourceIds.some(id=>!sources.has(id))||!records.some(r=>r.id===gap.recordId&&langs.every(l=>typeof r.unknowns?.[l]==='string'&&r.unknowns[l].includes(gap.reason?.[l]))))fail('gaps','a gap needs a kind, evidence, five-language reason and visible record ID');}
 if(!people.length&&!gaps.some(g=>g.kind==='people'))fail('people','missing documented contributors; research them or add an evidenced visible gap');
 if(!facts.length&&!gaps.some(g=>g.kind==='facts'))fail('facts','missing numeric factual values; research them or add an evidenced visible gap');
 if(gaps.length)warnings.push({where:'research.gaps',msg:'Evidence gaps remain; review the linked visible records and report them at delivery.'});
 return {errors,warnings,coverage:{peopleRecords:people.length,contributors:people.reduce((n,r)=>n+r.contributors.length,0),numericFacts:facts.length,gaps:gaps.length}};
}
