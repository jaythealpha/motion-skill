// Viewing preferences, never measured architectural geometry.
export const clampZoom=z=>Math.max(.2,Math.min(5,z));
export function pinchZoom(zoom,before,after){return before>0&&after>0?clampZoom(zoom*before/after):zoom;}
export function nearWallSide(yaw){const x=Math.cos(yaw*Math.PI/180);return x>.15?1:x<-.15?-1:0;}
