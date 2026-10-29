// Small 4×4 matrix helpers (column-major, as three.js stores them) and interpolation. Pure.
const DEG = Math.PI / 180;

export function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}

export const apply = (m, [x, y, z]) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];

// T(pos)·Rz(heading)·Ry(trim)·Rx(list), degrees. Trim > 0 puts the bow (+x) down; list > 0 puts starboard (−y) down.
export function poseMatrix({ pos = [0, 0, 0], trim = 0, list = 0, heading = 0 }) {
  const ch = Math.cos(heading * DEG), sh = Math.sin(heading * DEG), ct = Math.cos(trim * DEG), st = Math.sin(trim * DEG);
  const cl = Math.cos(list * DEG), sl = Math.sin(list * DEG);
  const Rz = [ch, sh, 0, 0, -sh, ch, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const Ry = [ct, 0, -st, 0, 0, 1, 0, 0, st, 0, ct, 0, 0, 0, 0, 1];
  const Rx = [1, 0, 0, 0, 0, cl, sl, 0, 0, -sl, cl, 0, 0, 0, 0, 1];
  const m = mul(Rz, mul(Ry, Rx));
  m[12] = pos[0]; m[13] = pos[1]; m[14] = pos[2];
  return m;
}

export const lerp = (a, b, f) => a + (b - a) * f;
// the short way round, in degrees
export const lerpAngle = (a, b, f) => a + ((((b - a) % 360) + 540) % 360 - 180) * f;
export const catmull = (p0, p1, p2, p3, f) => {
  const f2 = f * f, f3 = f2 * f;
  return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
};
export const clamp01 = v => Math.max(0, Math.min(1, v));
// a small seeded random, so every build of the same model looks the same
export function rng(seed = 1) { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s ^ (s << 13)) >>> 0, s = (s ^ (s >>> 17)) >>> 0, s = (s ^ (s << 5)) >>> 0) / 4294967296); }
