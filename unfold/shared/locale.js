// Copied from shared/locale.js by scripts/sync-shared.mjs. Edit shared/, not this copy.
import {catalog} from './locale-catalog.js';
// Static DOM text is trimmed for lookup; preserve equivalent aliases without per-frame scans.
for(const entries of Object.values(catalog))for(const[key,value]of Object.entries(entries)){const k=key.trim();if(k!==key&&!Object.hasOwn(entries,k))entries[k]=value.trim();}
export const LANGS=['en','ko','ja','zh','es'];
export const LANGUAGE_LABELS={en:'EN',ko:'KO',ja:'JA',zh:'CH',es:'ES'};
export const LANGUAGE_NAMES={en:'English',ko:'한국어',ja:'日本語',zh:'简体中文',es:'Español'};
export const LANGUAGE_TAGS={en:'en',ko:'ko',ja:'ja',zh:'zh-Hans',es:'es'};
export const LANGUAGE_KEY='motion-skill:gallery-language:v1';
const code=v=>({'ch':'zh','zh-cn':'zh','zh-hans':'zh'})[String(v||'').toLowerCase()]||String(v||'').toLowerCase();
export function resolveLocale(requested){const value=code(requested);if(LANGS.includes(value))return value;try{const saved=code(localStorage.getItem(LANGUAGE_KEY));if(LANGS.includes(saved))return saved;}catch{}return'en';}
let active='en';
export function setLocale(value,{persist=false,url=true}={}){active=LANGS.includes(code(value))?code(value):'en';if(typeof document!=='undefined'){document.documentElement.lang=LANGUAGE_TAGS[active];document.documentElement.translate=false;};if(persist)try{localStorage.setItem(LANGUAGE_KEY,active);}catch{}if(url&&typeof location!=='undefined')try{const u=new URL(location.href);u.searchParams.set('lang',active);history.replaceState(null,'',u);}catch{}return active;}
export const currentLocale=()=>active;
export function tr(value,lang=active){if(typeof value!=='string')return value;return catalog[lang]?.[value]??value;}
export function translatePack(pack,lang){const out={};for(const[k,v]of Object.entries(pack)){if(typeof v==='function')out[k]=(...a)=>{const markers=a.map((_,i)=>'__ARG'+i+'__');let result=tr(v(...markers),lang);markers.forEach((m,i)=>{result=result.split(m).join(String(a[i]));});return result;};else out[k]=typeof v==='string'?tr(v,lang):v&&typeof v==='object'?translatePack(v,lang):v;}return out;}
export function localizeStatic(root=document){const walker=document.createTreeWalker(root.body||root,NodeFilter.SHOW_TEXT);for(let n=walker.nextNode();n;n=walker.nextNode()){if(['SCRIPT','STYLE','OPTION'].includes(n.parentElement?.tagName))continue;const t=n.textContent;if(!t.trim())continue;const translated=tr(t.trim());if(translated!==t.trim())n.textContent=t.replace(t.trim(),translated);}for(const el of root.querySelectorAll('[aria-label],[title]'))for(const attr of['aria-label','title'])if(el.hasAttribute(attr))el.setAttribute(attr,tr(el.getAttribute(attr)));}
export function sceneLanguagePicker(redraw){
 const initial=resolveLocale(new URLSearchParams(location.search).get('lang'));setLocale(initial);
 const nodes=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n=walker.nextNode();n;n=walker.nextNode()){if(!['SCRIPT','STYLE'].includes(n.parentElement?.tagName)&&n.textContent.trim())nodes.push([n,n.textContent]);}
 const title=document.title,attrs=[];for(const el of document.querySelectorAll('[aria-label],[title]'))for(const a of['aria-label','title'])if(el.hasAttribute(a))attrs.push([el,a,el.getAttribute(a)]);
 const container=document.createElement('label');container.style.cssText='display:flex;align-items:center;gap:8px;font:14px system-ui';const label=document.createElement('span'),select=document.createElement('select');for(const lang of LANGS){const option=new Option(lang==='zh'?'CH · '+LANGUAGE_NAMES[lang]:LANGUAGE_NAMES[lang],lang);option.lang=LANGUAGE_TAGS[lang];select.add(option);}select.style.cssText='min-height:44px;font:inherit;padding:8px;border-radius:8px';select.value=initial;container.append(label,select);const head=document.querySelector('header');head.style.flexWrap='wrap';head.append(container);
 function refresh(){for(const[n,text]of nodes)if(n.isConnected){const v=tr(text.trim());n.textContent=text.replace(text.trim(),v);}for(const[el,a,text]of attrs)el.setAttribute(a,tr(text));label.textContent=tr('Language');select.setAttribute('aria-label',tr('Language'));document.title=tr(title);for(const a of document.querySelectorAll('a[href]')){const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.endsWith('.html')){u.searchParams.set('lang',active);const revision=new URL(location.href).searchParams.get('v');if(revision)u.searchParams.set('v',revision);a.href=u.href;}}redraw?.();}
 select.addEventListener('change',()=>{setLocale(select.value,{persist:true});refresh()});refresh();return initial;
}
