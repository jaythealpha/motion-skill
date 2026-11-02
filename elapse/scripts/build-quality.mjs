#!/usr/bin/env node
// Independently authored Britannic detail tier. Builds an offline HTML and companion model.
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,dirname,basename,join} from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {QUALITY_VIEWS} from '../engine/quality-form.js';
const [input,output]=process.argv.slice(2);if(!input||!output)throw Error('usage: node build-quality.mjs britannic.json quality.html');
const m=JSON.parse(readFileSync(input,'utf8')),name=typeof m.subject?.name==='object'?m.subject.name.en:m.subject?.name;
if(!/Britannic/i.test(name)||!m.pieces?.some(p=>p.id==='hull-main')||!m.pieces.some(p=>p.id==='hull-bow'))throw Error('This detail tier supports the Britannic template only.');
const modelPath=join(dirname(resolve(output)),basename(output).replace(/\.html?$/i,'')+'.model.json');if(resolve(input)===modelPath)throw Error('Refusing to overwrite the input model.');
m.stops=QUALITY_VIEWS;m.meta={...m.meta,renderQuality:'high',gate2:'unknown',limitations:[...(m.meta?.limitations||[]),{ko:'고품질 선수 파손·늑골·갑판·장비는 탐사 기록을 참고한 독립 추정 형상입니다. 정확한 균열·부재·장비 좌표를 측량하지 않았습니다. 선교 지붕·선수 내부 절개는 설명용이며 실제 붕괴 기록이 아닙니다. 부착물·입자는 연도별 관측 개체가 아닙니다.',en:'Quality damage, frames, decks and equipment are independently estimated from expedition accounts, not surveyed coordinates. The bridge roof / forward shell cutaway is illustrative, not a recorded collapse. Growth and particles are not a dated census.'}]};
m.meta.limitations=[...new Map(m.meta.limitations.map(x=>[JSON.stringify(x),x])).values()];
for(const s of [{id:'quality-expedition-1998',title:'Nick Hope · Britannic98 expedition account',url:'https://www.bubblevision.com/underwater-videos/HMHS-Britannic.htm',year:1998},{id:'quality-propellers-2019',title:'Atlantic Wreck Salvage · Britannic expedition / propeller observations',url:'https://dvtenacious.com/h-m-h-s-britannics-lost-bell/',year:2019}])if(!m.sources.some(q=>q.id===s.id))m.sources.push(s);
writeFileSync(modelPath,JSON.stringify(m,null,2)+'\n');
execFileSync(process.execPath,[join(dirname(fileURLToPath(import.meta.url)),'build.mjs'),modelPath,resolve(output)],{stdio:'inherit'});
console.log('Companion model: '+modelPath+'; run Gate 1 and Gate 2 before delivery.');
