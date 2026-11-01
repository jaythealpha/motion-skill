import {barToTime,parseAt} from './chapters.js';
import {WTC_DATES} from './wtc-model.js';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
// Authored observation framing, not inferred flight paths or physical collapse timing.
export function wtcShot(model,t){const ms=barToTime(model,t);for(const[id,x,y,z,sign,yaw]of[['north',-43.5,63,365,1,135],['south',19.5,-78,300,-1,235]]){const hit=parseAt(WTC_DATES[id+'Hit']),a=hit-30000,b=hit+105000;if(ms>=a&&ms<=b){const approach=1-clamp((ms-a)/30000),reach=45+170*approach;return{id:id+'-impact',label:id==='north'?'북타워 충돌':'남타워 충돌',weight:smooth((ms-a)/6500)*(1-smooth((ms-(b-12000))/12000)),yaw,pitch:8,box:{min:[x-58,y-(sign<0?reach:28),z-55],max:[x+58,y+(sign>0?reach:28),z+70]}};}}
for(const[id,x,y,h,yaw]of[['south',19.5,-46.5,415,235],['north',-43.5,31.5,417,145],['seven',0,172,186,40]]){const a=parseAt(WTC_DATES[id+'Fall']),b=a+165000;if(ms>=a-8000&&ms<=b){const f=clamp((ms-a)/120000),top=(h-(id==='south'?110:id==='seven'?16:50))*(1-f),fall=smooth((f-.62)/.38);return{id:id+'-collapse',label:id==='seven'?'7 WTC 붕괴':id==='north'?'북타워 붕괴':'남타워 붕괴',weight:smooth((ms-a+8000)/8000)*(1-smooth((ms-(b-20000))/20000)),yaw,pitch:12+18*fall,box:{min:[x-85,y-85,Math.max(0,top-85)*(1-fall)],max:[x+85,y+85,Math.max(110,top+(id==='south'?130:90))]}};}}
return null;}
