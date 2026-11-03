// Copied from shared/check-locales.mjs by scripts/sync-shared.mjs. Edit shared/, not this copy.
// Run from either installed skill: node <skill>/shared/check-locales.mjs model.json
import{readFileSync}from'node:fs';
const file=process.argv[2],languages=['en','ko','ja','zh','es'];
if(!file){console.error('usage: node <skill>/shared/check-locales.mjs model.json');process.exit(64);}
const raw=JSON.parse(readFileSync(file,'utf8')),{normalizeModel}=await import(new URL('../engine/model.js',import.meta.url));
const errors=[],seen=new Set;let fields=0;
function walk(v,path,normalized){if(Array.isArray(v))return v.forEach((x,i)=>walk(x,path+'.'+i,normalized));if(!v||typeof v!=='object')return;
 if(typeof v.en==='string'||typeof v.ko==='string'){if(normalized)fields++;const hasText=languages.some(l=>typeof v[l]==='string'&&v[l].trim());for(const l of languages)if(typeof v[l]!=='string'||(hasText&&!v[l].trim()))errors.push(path+'.'+l+' missing');}
 if(!normalized)for(const k of Object.keys(v))if(k.endsWith('_en')&&typeof v[k]==='string'){const prefix=k.slice(0,-3);for(const l of languages)if(typeof v[prefix+'_'+l]!=='string'||(v[k].trim()&&!v[prefix+'_'+l].trim()))errors.push(path+'.'+prefix+'_'+l+' missing');}
 for(const[k,x]of Object.entries(v))walk(x,path+'.'+k,normalized);
}
walk(raw,'model',false);walk(normalizeModel(raw),'model',true);
for(const e of errors)seen.add(e);if(seen.size){console.error('LOCALES FAIL\n'+[...seen].join('\n'));process.exit(1);}console.log('LOCALES PASS fields='+fields+' languages='+languages.join(','));
