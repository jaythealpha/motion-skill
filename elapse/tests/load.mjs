// test helper: a fixture, normalised
import { readFileSync } from 'node:fs';
import { normalizeModel } from '../engine/model.js';
export const raw = name => JSON.parse(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
export const load = name => normalizeModel(raw(name));
