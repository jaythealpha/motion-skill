import {renderRecords,rt} from './records-view.js';
import {contextT} from './records-view.js';
import {resolveLocale,setLocale} from '../shared/locale.js';
export function startRecords(model,params,mountScene){
 const shell=document.getElementById('records-shell'),reader=document.getElementById('records'),scene=document.getElementById('elapse'),select=document.getElementById('records-lang');
 let lang=resolveLocale(params.lang),selected=model.remembrance.records.some(r=>r.id===params.record)?params.record:model.remembrance.records[0].id,u,pending,view='records';
 const url=(kind)=>{const q=new URL(location.href);q.searchParams.set('view',kind);q.searchParams.set('lang',lang);q.searchParams.set('record',selected);if(u)q.searchParams.set('t',u.st.t);history.replaceState(null,'',q);};
 function draw(focus=false){setLocale(lang);reader.innerHTML=renderRecords(model,lang);select.value=lang;select.setAttribute('aria-label',rt('language',lang));select.parentElement.firstChild.textContent=rt('language',lang)+' ';for(const a of shell.querySelectorAll('[data-view]'))a.textContent=rt(a.dataset.view==='records'?'read':'scene',lang);for(const a of reader.querySelectorAll('[data-record-article]'))a.hidden=a.dataset.recordArticle!==selected;for(const a of reader.querySelectorAll('[data-record]'))a.setAttribute('aria-current',String(a.dataset.record===selected));if(focus){const article=reader.querySelector('[data-record-article="'+selected+'"]');article?.focus({preventScroll:true});article?.scrollIntoView({block:'start'});}document.title=(model.subject.name[lang]||model.subject.name.en)+' · Elapse';}
 function selectRecord(id,focus=true){if(model.remembrance.records.some(r=>r.id===id))selected=id;draw(focus);url('records');}
 async function show(kind,{record,context=false,focus=true}={}){
  view=kind;scene.hidden=kind!=='scene';reader.hidden=kind==='scene';for(const a of shell.querySelectorAll('[data-view]')){if(a.dataset.view===kind)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
  if(kind==='records'){if(u){u.play(false);u.surveyMotion(false);u.setActive?.(false);lang=u.st.lang;}if(record)selected=record;draw(focus);url('records');return;}
  url('scene');const status=document.getElementById('scene-status');status.hidden=false;status.textContent=rt('loading',lang);
  try{if(!u){pending??=mountScene({...params,lang,onRecord:id=>show('records',{record:id}),onLanguage:next=>{if(next!==lang){lang=next;draw(false);url(view);}}});u=await pending;}if(view!=='scene'){u.play(false);u.surveyMotion(false);u.setActive?.(false);return;}u.setActive?.(true);u.R.resize();if(context){u.play(false);if(u.st.exploring)u.explore(false);u.setT(contextT(model,model.remembrance.records.find(r=>r.id===selected)),true);}const btn=scene.querySelector('[data-k=lang][data-o='+lang+']');if(u.st.lang!==lang)btn?.click();status.hidden=true;url('scene');if(focus)scene.querySelector('h1')?.scrollIntoView({block:'start'});}
  catch(e){window.__elapse.errors.push(String(e?.message||e));status.textContent=rt('failure',lang);scene.hidden=true;reader.hidden=false;view='records';draw(false);url('records');for(const a of shell.querySelectorAll('[data-view]')){if(a.dataset.view==='records')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}}
 }
 shell.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;if(a.dataset.view){e.preventDefault();show(a.dataset.view);}if(a.dataset.record){e.preventDefault();selectRecord(a.dataset.record);}if(a.dataset.context){e.preventDefault();selected=a.dataset.context;show('scene',{context:true});}});
 select.addEventListener('change',()=>{lang=setLocale(select.value,{persist:true});draw(false);if(u)scene.querySelector('[data-k=lang][data-o='+lang+']')?.click();url(view);});
 window.__memory={ready:true,get view(){return view;},get selected(){return selected;},show,select:selectRecord};draw();
 const explicit=params.view==='scene'||(params.view!=='records'&&('t'in params||params.mode==='explore'||params.play==='1'));
 show(explicit?'scene':'records',{focus:false});
}
