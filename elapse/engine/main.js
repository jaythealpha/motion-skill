// Records remain ordinary HTML; only a requested scene loads the 3D runtime.
import {isBuilding,validateBuilding} from './building-model.js';
import {normalizeModel} from './model.js';
import {validateRecords} from './records-model.js';
import {startRecords} from './records-controller.js';
const errors=[];window.__elapse={errors};
addEventListener('error',e=>errors.push(String(e.message||e)));
addEventListener('unhandledrejection',e=>errors.push(String(e.reason?.message||e.reason)));
try{
 const raw=JSON.parse(document.getElementById('elapse-model').textContent),params=Object.fromEntries(new URLSearchParams(location.search)),model=normalizeModel(raw);
 if(isBuilding(model)){const v=validateBuilding(model);if(v.errors.length)throw Error(JSON.stringify(v.errors));}
 const validation=validateRecords(model);if(validation.errors.length)throw Error(validation.errors.map(e=>e.where+': '+e.msg).join('; '));
 const mount=async p=>{const {mountElapse}=await import('elapse/ui.js');const autoplay=p.play==='1',u=mountElapse(document.getElementById('elapse'),model,{...p,play:'0'});await u.R.prepare?.();window.__elapse.ready=true;if(autoplay&&!matchMedia('(prefers-reduced-motion: reduce)').matches)u.play(true);return u;};
 if(model.remembrance)startRecords(model,params,mount);else await mount(params);
}catch(e){errors.push(String(e?.message||e));const status=document.getElementById('scene-status')||document.getElementById('elapse');status.hidden=false;status.textContent='Elapse could not start. Embedded records remain available. '+(e?.message||e);}
