#!/usr/bin/env node
// Local representative study; no original timeline or factual records are changed.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {importMap,licenseBlock} from '../shared/inline.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=readFileSync(resolve(root,'templates/opera-study.html'),'utf8');
const all=importMap({root,prefix:'elapse'}).imports;
const names=['three','three/core','elapse/opera-study.js','elapse/opera-study-motion.js','elapse/opera-study-i18n.js','elapse/opera-art-pass.js','elapse/opera-form.js','elapse/opera-hall-finish.js','elapse/opera-geometry.js','elapse/opera-navigation.js','elapse/opera-hall-layout.js','elapse/quality-surfaces.js','shared/material-budget.js','shared/presentation.js','shared/surface-finish.js'];
const imports=Object.fromEntries(names.map(k=>{if(!all[k])throw Error('Missing module '+k);return[k,all[k]];}));
const output=resolve(process.argv[2]||resolve(root,'examples/opera-art-study.html'));
writeFileSync(output,source.replace('<!-- LICENSE -->',licenseBlock(root)).replace('<!-- IMPORTMAP -->',`<script type="importmap">${JSON.stringify({imports})}</script>`));
console.log('Built',output);
