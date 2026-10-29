// Playback speeds shared by the skills: seconds for the whole 0–100 bar.
export const SPEEDS = { xslow: 60, slow: 36, normal: 24, fast: 12 };
const ORDER = Object.keys(SPEEDS);

// the bar position after dtSec seconds of playback at a speed, clamped to 100
export const advance = (t, dtSec, speed) => Math.min(100, t + dtSec * 100 / (SPEEDS[speed] || SPEEDS.normal));

// one step slower (dir < 0) or faster (dir > 0), staying inside the presets
export function stepSpeed(speed, dir) {
  const i = Math.max(0, Math.min(ORDER.length - 1, ORDER.indexOf(speed) + Math.sign(dir)));
  return ORDER[i];
}
