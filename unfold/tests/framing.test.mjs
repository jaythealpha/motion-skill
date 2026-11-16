import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeModel } from 'unfold/model.js';
import { createTimeline, INTRO_END, ASM_END } from 'unfold/timeline.js';
import { frameTable, frameAt, boxUnion } from 'unfold/framing.js';

const full = [-50, -80, 0, 50, 80, 300];
const steps = [[-40, -75, 0, 40, 75, 60], [-40, -75, 0, 40, 75, 200], [-40, -75, 0, 40, 75, 30]];
const at = t => t < 8 ? -1 : t > 92 ? 3 : t < 36 ? 0 : t < 64 ? 1 : 2;
const holds = (outer, inner) => [0, 1, 2].every(i => outer[i] <= inner[i] + 1e-9) && [3, 4, 5].every(i => outer[i] >= inner[i] - 1e-9);

test('the framed box always holds the current step (and the whole envelope before the first step)', () => {
  const T = frameTable(full, steps, at);
  for (let t = 0; t <= 100; t += 0.25) {
    const k = at(t), raw = k < 0 ? full : steps[Math.min(k, steps.length - 1)];
    assert.ok(holds(frameAt(T, t), raw), `t=${t}`);
  }
  assert.deepEqual(frameAt(T, 2).map(v => Math.round(v)), full);
});

test('the framed box changes gradually between steps', () => {
  const T = frameTable(full, steps, at);
  let worst = 0;
  for (let t = 0; t < 100; t += 0.05) worst = Math.max(worst, Math.abs(frameAt(T, t + 0.05)[5] - frameAt(T, t)[5]));
  // the biggest jump (300 -> 60) spread over the averaging window: well under a tenth of it per 0.05
  assert.ok(worst < 240 * 0.05, `worst step ${worst}`);
});

test('works with a real timeline and its step index', () => {
  const m = normalizeModel(JSON.parse(readFileSync(new URL('./fixtures/mini.json', import.meta.url))));
  const tl = createTimeline(m, 'stack'), T = frameTable(full, m.steps.map(() => steps[0]), t => tl.stepIndexAt(t));
  assert.ok(holds(frameAt(T, (INTRO_END + ASM_END) / 2), steps[0]));
  assert.deepEqual(boxUnion([0, 0, 0, 1, 1, 1], [-1, 0.5, 0, 0.5, 2, 1]), [-1, 0, 0, 1, 2, 1]);
});
