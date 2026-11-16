import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import * as THREE from '../shared/vendor/three.module.min.js';
import {eiffelMembers} from '../engine/eiffel-form.js';
// Engine modules import the bare specifier 'three' (resolved by the page import map); map it to the vendored build here.
const vendor=new URL('../shared/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(vendor)},shortCircuit:true}:n(s,c);}`));
const {scaffoldDressing,createCranes,sectionStock,caissons}=await import('../engine/eiffel-site.js');
const finite=g=>{let ok=true;g.updateMatrixWorld(true);g.traverse(o=>{if(o.isInstancedMesh){const m=new THREE.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);if(!m.elements.every(Number.isFinite))ok=false;}}if(!o.matrixWorld.elements.every(Number.isFinite))ok=false;});return ok;};
test('scaffold dressing follows the sourced 12 × 30 m and 4 × 40 m first-level scaffolds',()=>{const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial();assert.equal(scaffoldDressing(g,mat),16);assert.ok(finite(g));
 const tops=eiffelMembers().filter(b=>b.group==='scaffold').map(b=>Math.max(b.a[2],b.b[2]));assert.equal(Math.max(...tops),40);assert.ok(tops.includes(30));});
test('steam cranes stay on the structure and give deterministic chimney emitters',()=>{const m=new THREE.MeshBasicMaterial(),c=createCranes(m,m);for(const h of [6,57,114,115,200,300]){c.place(h);const a=c.emitters.map(v=>v.toArray());c.place(h);assert.deepEqual(c.emitters.map(v=>v.toArray()),a);for(const v of c.emitters){assert.ok(v.toArray().every(Number.isFinite));assert.ok(Math.abs(v.x)<=62.5&&Math.abs(v.y)<=62.5);assert.ok(v.z>=h&&v.z<h+8);}}});
test('stockpiled sections and Seine-side caissons are finite, ~5 m long and outside the tower footprint where stacked',()=>{const m=new THREE.MeshBasicMaterial();m.userData.timber=m;const s=sectionStock(m),k=caissons(m,m);assert.ok(finite(s)&&finite(k));const inst=s.children[0],M=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();for(let i=0;i<inst.count;i++){inst.getMatrixAt(i,M);M.decompose(p,q,sc);assert.ok(Math.abs(sc.x-5)<1e-5);assert.ok(Math.hypot(p.x,p.y)>62);}
 k.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)assert.ok(o.position.y>0,'caissons are only on the +y (Seine) side');});});
test('art pass is specification-only provenance and never drives animation by wall-clock time',()=>{const src=readFileSync(new URL('../engine/eiffel-art-pass.js',import.meta.url),'utf8');assert.match(src,/claude-fable-5-2/);assert.doesNotMatch(src,/performance\.now|Date\.now|clock\.getElapsed/);assert.doesNotMatch(src,/https?:\/\//);});
