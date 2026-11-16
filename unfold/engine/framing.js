// Step framing for the auto camera, as a pure function of t (so a screenshot at t shows what playback shows).
// Each assembly step gets a box in model coordinates: the finished phone where the parts land, plus the step's
// parts at their start and home. Before the first step the box is the whole exploded envelope. The per-t box is
// first widened over a short window (so it always holds the step on screen), then allowed to close in only slowly,
// then averaged (so the camera eases between steps instead of cutting).
// Boxes are arrays [minX, minY, minZ, maxX, maxY, maxZ].

export const FRAME_DT = 0.25, FRAME_DILATE = 1.5, FRAME_SMOOTH = 1.5, FRAME_RELEASE = 2.5;

export function boxUnion(a, b) {
  if (!a) return b ? b.slice() : null;
  if (!b) return a.slice();
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[3], b[3]), Math.max(a[4], b[4]), Math.max(a[5], b[5])];
}

// full: the whole envelope; steps: one box per step; stepIndexAt(t): -1 before the first step, steps.length after the last
export function frameTable(full, steps, stepIndexAt, { dt = FRAME_DT, dilate = FRAME_DILATE, smooth = FRAME_SMOOTH, release = FRAME_RELEASE } = {}) {
  const n = Math.round(100 / dt) + 1, raw = new Float64Array(n * 6);
  for (let i = 0; i < n; i++) {
    const k = stepIndexAt(i * dt), b = k < 0 || !steps.length ? full : steps[Math.min(k, steps.length - 1)];
    raw.set(b, i * 6);
  }
  // widen: min of the minima and max of the maxima within ±dilate
  const r = Math.round(dilate / dt), wide = new Float64Array(n * 6);
  for (let i = 0; i < n; i++) for (let c = 0; c < 6; c++) {
    let v = raw[i * 6 + c];
    for (let j = Math.max(0, i - r); j <= Math.min(n - 1, i + r); j++) { const w = raw[j * 6 + c]; v = c < 3 ? Math.min(v, w) : Math.max(v, w); }
    wide[i * 6 + c] = v;
  }
  // release: widening happens in time (the window above looks ahead), closing in follows slowly, so the view never
  // snaps tighter. Each edge relaxes toward the widened box with time constant `release` (in t units).
  const keep = Math.exp(-dt / release), held = new Float64Array(wide);
  for (let i = 1; i < n; i++) for (let c = 0; c < 6; c++) {
    const prev = held[(i - 1) * 6 + c], w = wide[i * 6 + c], relaxed = w + (prev - w) * keep;
    held[i * 6 + c] = c < 3 ? Math.min(w, relaxed) : Math.max(w, relaxed);
  }
  // ease: triangular average within ±smooth (smooth <= dilate keeps every averaged box around the raw one)
  const s = Math.round(Math.min(smooth, dilate) / dt), out = new Float64Array(n * 6);
  for (let i = 0; i < n; i++) for (let c = 0; c < 6; c++) {
    let sum = 0, wsum = 0;
    for (let j = i - s; j <= i + s; j++) { const jj = Math.max(0, Math.min(n - 1, j)), w = s + 1 - Math.abs(j - i); sum += held[jj * 6 + c] * w; wsum += w; }
    out[i * 6 + c] = sum / wsum;
  }
  return { dt, n, data: out };
}

export function frameAt(table, t) {
  const x = Math.max(0, Math.min(100, t)) / table.dt, i = Math.min(table.n - 2, Math.floor(x)), f = x - i, d = table.data, o = [];
  for (let c = 0; c < 6; c++) o.push(d[i * 6 + c] + (d[(i + 1) * 6 + c] - d[i * 6 + c]) * f);
  return o;
}
