#!/usr/bin/env node
// New-topic entry point: an agent researches the evidence; this compiler never invents it.
import{readFileSync,writeFileSync}from'node:fs';import{resolve,dirname,basename,join}from'node:path';import{fileURLToPath}from'node:url';import{spawnSync}from'node:child_process';
import{validateRecords}from'../engine/records-model.js';import{validateTopicResearch,TOPIC_PROFILE}from'../engine/topic-research.js';
const args=process.argv.slice(2),take=k=>{const i=args.indexOf(k);if(i<0)return null;if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing value for '+k);return args.splice(i,2)[1];};
try{
 const records=take('--records'),gate=take('--gate2')||'unknown';if(!['unknown','pass','fail','skipped'].includes(gate))throw Error('Invalid --gate2');
 if(args.length!==2||args.some(x=>x.startsWith('--')))throw Error('usage: build-topic.mjs scene.json output.html [--records evidence.json] [--gate2 pass|fail|skipped]');
 const [src,out]=args.map(x=>resolve(x)),model=JSON.parse(readFileSync(src,'utf8'));if(records)model.remembrance=JSON.parse(readFileSync(resolve(records),'utf8'));
 model.meta={...model.meta,researchProfile:TOPIC_PROFILE,gate2:gate};
 const data=validateRecords(model),coverage=validateTopicResearch(model);const errors=data.errors;if(errors.length)throw Error(JSON.stringify(errors));
 const dir=dirname(fileURLToPath(import.meta.url)),run=(file,a)=>{const p=spawnSync(process.execPath,[join(dir,file),...a],{encoding:'utf8'});if(p.status!==0)throw Error(p.stderr||p.stdout||file+' failed');return p.stdout;};
 // Validate a temporary candidate before replacing either existing deliverable.
 const {mkdtempSync,rmSync}=await import('node:fs'),{tmpdir}=await import('node:os');const temp=mkdtempSync(join(tmpdir(),'elapse-topic-'));
 try{const candidate=join(temp,'model.json');writeFileSync(candidate,JSON.stringify(model,null,2)+'\n');process.stdout.write(run('check_model.mjs',[candidate]));process.stdout.write(run('../shared/check-locales.mjs',[candidate]));const html=join(temp,'out.html');run('build.mjs',[candidate,html,...(gate==='unknown'?[]:['--gate2',gate])]);const sibling=join(dirname(out),basename(out).replace(/\.html?$/i,'')+'.json');if(sibling===out||sibling===src)throw Error('Output must use a different path from source model');writeFileSync(sibling,readFileSync(candidate));writeFileSync(out,readFileSync(html));const report={profile:TOPIC_PROFILE,...coverage.coverage,warnings:coverage.warnings,truthVerification:'Structural coverage only; source claims require primary-source review',gate2:gate};writeFileSync(out+'.research.json',JSON.stringify(report,null,2)+'\n');console.log('TOPIC PASS '+JSON.stringify(report));}finally{rmSync(temp,{recursive:true,force:true});}
}catch(e){console.error('TOPIC FAIL '+e.message);process.exitCode=1;}
