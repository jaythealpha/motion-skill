import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import * as THREE from '../shared/vendor/three.module.min.js';
const vendor=new URL('../shared/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(vendor)},shortCircuit:true}:n(s,c);}`));
const {patchRiver}=await import('../engine/seongsu-art-pass.js');
const chunks=['#include <color_fragment>','#include <opaque_fragment>','#include <fog_fragment>'];
test('river patch chains the existing ripple shader, keys its program and can be switched off',()=>{
 const m=new THREE.MeshStandardMaterial();let prevRan=false;m.onBeforeCompile=s=>{prevRan=true;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n/*ripple*/');};m.customProgramCacheKey=()=>'base';
 const r=patchRiver(m),s={uniforms:{},vertexShader:'void main(){\n#include <project_vertex>\n}',fragmentShader:'void main(){\n'+chunks.join('\n')+'\n}'};m.onBeforeCompile(s,null);
 assert.ok(prevRan);assert.match(s.fragmentShader,/\/\*ripple\*\//);assert.match(s.fragmentShader,/uRvArt/);assert.match(s.vertexShader,/vRvWorld = /);
 for(const c of chunks)assert.ok(s.fragmentShader.includes(c),c);assert.equal(m.customProgramCacheKey(),'base|seongsu-river-v1');
 r.setArt(false);assert.equal(s.uniforms.uRvArt.value,0);r.setTime(10);assert.equal(s.uniforms.uRvTime.value,8);});
test('river pass is driven by the timeline only and names nothing as a record',()=>{const src=readFileSync(new URL('../engine/seongsu-art-pass.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/performance\.now|Date\.now|clock\.getElapsed/);assert.doesNotMatch(src,/https?:\/\//);assert.match(src,/not surveyed|not a record|nothing here is a record/i);});
