import {advance} from '../shared/speeds.js';
import {barToTime,parseAt} from './chapters.js';
const clamp=x=>Math.max(0,Math.min(1,x));
export const isNotreDame=m=>m?.geometry?.type==='notredame-2019';
// Motion keys are illustrative intervals, not measurements or fire-propagation physics.
export function notreDameState(m,t){const ms=barToTime(m,t),r=(a,b)=>clamp((ms-parseAt(a))/(parseAt(b)-parseAt(a))),burn=r('2019-04-15T18:45','2019-04-15T21:00'),fall=r('2019-04-15T19:45','2019-04-15T19:50'),rebuild=r('2022-12-01','2023-12-16'),timber=r('2022-07-01','2024-03-08'),cover=r('2024-01-01','2024-11-01'),damage=clamp((burn-.08)/.84),fire=ms<parseAt('2019-04-15T18:45')?0:ms<parseAt('2019-04-15T20:00')?clamp(burn*3):1-r('2019-04-15T20:00','2019-04-16T03:45');return {height:96,damage,fall,fire,rebuild,timber,cover,clean:r('2022-06-01','2024-12-08'),support:r('2019-04-16','2019-11-30')*(1-r('2024-01-01','2024-11-01')),oldScaffold:1-r('2020-06-08','2020-11-24'),newScaffold:r('2022-01-01','2022-12-01')*(1-r('2024-02-01','2024-11-01')),vaultRepair:r('2022-01-01','2023-12-16'),tarp:r('2019-04-16','2019-04-19')*(1-r('2022-01-01','2022-07-01')),phase:t<10?'before':t<42?'fire':t<58?'stabilise':t<88?'restore':'reopen'};}
export function validateNotreDame(m,err){const d=m.subject.dims||{};if(d.width!==48||d.depth!==128||d.height!==96)err('subject','notredame-2019 uses nominal width48 / model length128 / spire96m');if(m.restoration?.template!=='roof-spire-2019-2024')err('restoration','unknown restoration template');if(m.construction?.heightKeys?.length)err('construction','Notre-Dame is damage/restoration, not monotonic tower construction');const end=parseAt(m.chapters.at(-1)?.end);if(end!==parseAt('2024-12-08T23:59'))err('chapters','end at the 2024 reopening milestone; do not claim present-day completion');}

export function notreDameRate(m,t){if(!isNotreDame(m))return 1;const p=notreDameState(m,t);return p.fall>0&&p.fall<1?.08:1;}

export function advanceNotreDame(m,t,dt,speed){for(let elapsed=0;elapsed<dt;elapsed+=.01)t=advance(t,Math.min(.01,dt-elapsed)*notreDameRate(m,t),speed);return t;}
