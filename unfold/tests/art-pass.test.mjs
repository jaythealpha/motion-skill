import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import * as THREE from '../shared/vendor/three.module.min.js';
const vendor=new URL('../shared/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(vendor)},shortCircuit:true}:n(s,c);}`));
const {spineGeometry}=await import('../engine/render.js');
const art=await import('../engine/unfold-art-pass.js');
test('rounded hinge spine stays inside the original spine envelope for both axes and sides',()=>{for(const [len,sp,depth] of [[75.4,4.75,13.1],[123.9,3.2,9.7]])for(const bSign of [1,-1])for(const alongX of [true,false]){const g=spineGeometry(THREE,len,sp,depth,bSign,alongX);g.computeBoundingBox();const b=g.boundingBox,ex=alongX?[len,sp]:[sp,len];
 const dx=b.max.x-b.min.x,dy=b.max.y-b.min.y;assert.ok(dx<=ex[0]+.02&&dx>=ex[0]-.3&&dy<=ex[1]+.02&&dy>=ex[1]-.3,`${len}/${sp} ${bSign} ${alongX}: ${dx} x ${dy}`);assert.ok(Math.abs(b.max.z-depth/2)<.02&&Math.abs(b.min.z+depth/2)<.02);for(const v of g.attributes.position.array)assert.ok(Number.isFinite(v));
 // the outer side is rounded: its corner is cut back, while the inner side keeps full length
 const pos=g.attributes.position,U=alongX?1:0,A=alongX?0:1,outer=bSign>0?b.max.getComponent(U):b.min.getComponent(U);let outerLen=0;for(let i=0;i<pos.count;i++){const u=pos.getComponent(i,U);if(Math.abs(u-outer)<1e-3)outerLen=Math.max(outerLen,Math.abs(pos.getComponent(i,A)));}assert.ok(outerLen<len/2-.5);}});
test('Unfold finishes chain earlier hooks, keep distinct keys and leave unpatched keys alone',()=>{const m=new THREE.MeshStandardMaterial();m.onBeforeCompile=()=>{};m.customProgramCacheKey=()=>'unfold-surface-1';const h=art.patchFinish(m,'pcb');assert.match(m.customProgramCacheKey(),/^unfold-surface-1\|uap-pcb/);assert.equal(art.patchFinish(m,'pcb'),h);const g=new THREE.MeshStandardMaterial(),key=g.customProgramCacheKey();art.patchFinish(g,'gold');assert.equal(g.customProgramCacheKey(),key);h.setEnabled(false);});
test('art pass records spec-only provenance and uses no wall clock or network',()=>{const s=readFileSync(new URL('../engine/unfold-art-pass.js',import.meta.url),'utf8');assert.match(s,/claude-fable-5-2/);assert.doesNotMatch(s,/performance\.now|Date\.now|https?:\/\//);});
