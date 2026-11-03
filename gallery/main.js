import {messages, languageTags} from './i18n.js?v=20261103-memory';
const key='motion-skill:gallery-language:v1';
const normalize=value=>{const code=String(value||'').toLowerCase();return ({'ch':'zh','zh-cn':'zh','zh-hans':'zh'})[code]||code;};
const supported=value=>Object.hasOwn(messages,normalize(value));
const picker=document.querySelector('#gallery-language');
let saved;try{saved=localStorage.getItem(key);}catch{}
const requested=new URL(location.href).searchParams.get('lang');
const initial=supported(requested)?normalize(requested):supported(saved)?normalize(saved):'en';
function apply(lang,persist=false){
 const m=messages[lang];document.documentElement.lang=languageTags[lang];document.title=m.title;
 document.querySelector('meta[name="description"]').content=m.meta;
 for(const node of document.querySelectorAll('[data-i18n]'))node.textContent=m[node.dataset.i18n];
 for(const node of document.querySelectorAll('[data-i18n-aria]'))node.setAttribute('aria-label',m[node.dataset.i18nAria]);
 for(const card of document.querySelectorAll('[data-card]')){
  const i=+card.dataset.card,name=m.names[i],link=card.querySelector('a');
  card.querySelector('h3').textContent=name;card.querySelector('p').textContent=m.descs[i];card.querySelector('.tag').textContent=m.tags[+card.dataset.tag];
  link.textContent=m.view.replace('{name}',name);
  const target=new URL(link.href);target.searchParams.set('lang',lang);target.searchParams.set('v','20261103-memory');link.href=target.href;
 }
 picker.value=lang;document.querySelector('#language-status').textContent=m.status;
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
 if(persist)try{localStorage.setItem(key,lang);}catch{/* URL and current selection remain usable if storage is blocked. */}
}
picker.addEventListener('change',()=>apply(picker.value,true));
apply(initial, supported(requested));picker.disabled=false;
window.__gallery={ready:true,language:()=>picker.value};
