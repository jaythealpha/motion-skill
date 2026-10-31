// Presentation only: researched poses, water levels and dates are never changed.
import { chapterAt } from './chapters.js';
export const isTitanic = m => /Titanic/i.test(typeof m.subject.name === 'object' ? m.subject.name.en : m.subject.name);
export const isBritannic = m => /Britannic/i.test(typeof m.subject.name === 'object' ? m.subject.name.en : m.subject.name);
export const hasDirecting = m => isTitanic(m) || isBritannic(m);
export const smooth = x => { x = Math.max(0, Math.min(1, x)); return x*x*(3-2*x); };
export function directingBeat(model, t) {
  const c = model.chapters[chapterAt(model,t)], p = (t-c.bar[0])/(c.bar[1]-c.bar[0]);
  const labels = {collision:['빙산과 우현의 접촉','Iceberg contact'],flooding:['칸을 채우고 격벽을 넘는 바닷물','Water rises over the bulkheads'],break:['정전과 선체 분리','Blackout and separation'],descent:['깊어지는 수심 · 해저 충격','Descent and seabed impact'],seabed:['부식과 구조물 붕괴','Corrosion and structural collapse'],ahead:['구조 약화 · 예측 구간','Structural weakening · projection']};
  if(isBritannic(model)){Object.assign(labels,{explosion:['우현 선수의 손상과 유입','Bow damage and inflow'],capsize:['우현 전복 · 선수 접지 · 하강','Starboard roll · bow impact · descent'],quiet:['해저 120m · 옆으로 누운 선체','120 m down · the ship on her side'],explored:['얕은 해저의 선체와 탐사','Shallow wreck and exploration']});}
  if(isBritannic(model)&&c.id==='capsize'){labels.capsize=p<.5?['우현으로 전복 · 수면과 선체','Rolling to starboard · the waterline']:p<.85?['선수 접지와 하강 · 수면 0m / 해저 '+(model.environment?.seaDepth ?? 120)+'m','Bow impact and descent · shallow water']:['해저에 내려앉는 선체','Settling on the seabed'];}
  let rate = 1;
  if(isBritannic(model)&&c.id==='capsize')rate=p>.35&&p<.9?.3:.65;
  if(isBritannic(model)&&c.id==='explosion')rate=p>.33&&p<.48?.3:.8;
  if (c.id==='collision') rate = p>.42&&p<.66 ? .24 : .7;
  if (c.id==='break') rate = p>.54&&p<.72 ? .2 : .65;
  if (c.id==='descent') rate = p>.52&&p<.8 ? .3 : .65;
  for(const e of model.events)if(e.kind==='collapse'&&t>=e._t&&t<=e._until&&e.card!==false)rate=Math.min(rate,.38,Math.max(.02,(e._until-e._t)*.15));
  return {id:c.id,p,rate,label:labels[c.id]||['','']};
}
