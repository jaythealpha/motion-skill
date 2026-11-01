// Boot: read the embedded model and the URL parameters, then mount the page.
import {isBuilding,validateBuilding} from './building-model.js';
import { normalizeModel } from './model.js';
import { mountElapse } from './ui.js';

const errors = [];
window.__elapse = { errors };
addEventListener('error', e => errors.push(String(e.message || e)));
addEventListener('unhandledrejection', e => errors.push(String(e.reason?.message || e.reason)));

try {
  const raw = JSON.parse(document.getElementById('elapse-model').textContent);
  const params = Object.fromEntries(new URLSearchParams(location.search));
  const model=normalizeModel(raw);if(isBuilding(model)){const v=validateBuilding(model);if(v.errors.length)throw new Error(v.errors.map(e=>e.where+': '+e.msg).join('; '));}
  mountElapse(document.getElementById('elapse'), model, params);
  window.__elapse.ready = true;
} catch (e) {
  errors.push(String(e?.stack || e));
  document.getElementById('elapse').textContent = 'Elapse could not start: ' + (e?.message || e);
}
