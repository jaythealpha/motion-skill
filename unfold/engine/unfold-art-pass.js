// Fable 5.2 (claude-fable-5-2) specification-only module, 2026-11-17; reviewed and integrated by Claude Opus 5.5.
// No repository source files were sent to the model. Integration notes: docs/reviews/2026-11-17-britannic-unfold/design-qa.md
/**
 * unfold-art-pass.js
 * ---------------------------------------------------------------------------
 * AUTHORED ILLUSTRATION FINISHES for the smartphone assembly / teardown view.
 *
 * Everything in this file (surface patterns, tones, roughness offsets, the
 * studio environment, the suggested lights) is an authored illustration
 * choice made for legibility. None of it is a measured component appearance
 * or a manufacturer's material specification. There are no logos, brand
 * marks, part numbers or readable text anywhere: "silkscreen" and "laser
 * marks" are plain rectangles and dots only.
 *
 * Technical notes
 *  - three r180 / WebGL2, procedural GLSL + one CanvasTexture, no network.
 *  - Patterns are evaluated on the object-space vertex `position`, which the
 *    host page guarantees to be model millimetres (z through the phone).
 *  - Every pattern is filtered against `fwidth(position)` (mm per pixel):
 *    detail fades to its mean tone before it can shimmer or moiré.
 *  - Base colours are only modulated, never replaced (coloured frames keep
 *    their hue).
 *  - Deterministic: no clocks, no render targets, no per-frame allocations.
 * ---------------------------------------------------------------------------
 */

import * as THREE from 'three';

/* ------------------------------------------------------------------------ */
/* Authored constants (all lengths in model millimetres)                     */
/* ------------------------------------------------------------------------ */

/** Bead-blast / brushed metal finishes, keyed by material key. */
const METAL = Object.freeze({
  alu: Object.freeze({
    speckleFine: 0.35,    // mm, period of the finest bead-blast speckle (visible only when zoomed in)
    speckleCoarse: 0.9,   // mm, period of the coarser speckle that survives at overview zoom
    ampFine: 0.05,        // +-2.5 % tone from the fine speckle
    ampCoarse: 0.035,     // +-1.75 % tone from the coarse speckle
    brushPeriod: 0.45,    // mm, cross-grain period of the directional brushing
    brushStretch: 0.03,   // grain is 1/0.03 = ~33x longer along the part's long axis
    ampBrush: 0.04,       // +-2 % tone from brushing ("very faint")
    sheen: 0.22,          // max grazing-angle brightening (fraction of base colour)
    tone: 1.0,            // overall tone multiplier (1 = keep the base colour)
    roughVar: 1.6,        // roughness delta per unit of tone variation (STANDARD only)
    roughOffset: 0.0,     // constant roughness offset (STANDARD only)
    gloss: 1.1,           // Phong specular strength multiplier (lightweight path)
    turnPitch: 0.0,       // mm, lathe-ring pitch on round parts (0 = none)
    ampTurn: 0.0,         // tone amplitude of lathe rings
  }),
  metal: Object.freeze({
    speckleFine: 0.35,    // mm, as alu: brackets and shields share the blasted look
    speckleCoarse: 0.9,   // mm
    ampFine: 0.045,       // slightly calmer than the frame
    ampCoarse: 0.03,      //
    brushPeriod: 0.45,    // mm
    brushStretch: 0.03,   //
    ampBrush: 0.05,       // stamped sheet reads a touch more directional
    sheen: 0.2,           //
    tone: 1.0,            //
    roughVar: 1.6,        //
    roughOffset: 0.0,     //
    gloss: 1.1,           //
    turnPitch: 0.0,       //
    ampTurn: 0.0,         //
  }),
  metalDark: Object.freeze({
    speckleFine: 0.5,     // mm, "slightly coarser" speckle for machined steel
    speckleCoarse: 1.3,   // mm
    ampFine: 0.07,        //
    ampCoarse: 0.05,      //
    brushPeriod: 0.5,     // mm, machining grain
    brushStretch: 0.05,   // shorter grain than anodised frames
    ampBrush: 0.06,       //
    sheen: 0.3,           // steel catches a slightly stronger grazing highlight
    tone: 0.93,           // 7 % darker satin
    roughVar: 1.4,        //
    roughOffset: 0.06,    // satin: a little rougher than the frame
    gloss: 1.2,           //
    turnPitch: 0.35,      // mm, concentric turning rings on round parts (screw heads)
    ampTurn: 0.1,         // +-5 % ring tone, zero-mean so it vanishes when sub-pixel
  }),
});

/** Solder-mask circuit board. */
const PCB = Object.freeze({
  region: [9.0, 7.0],        // mm, size of one routing region (pitch/direction is hashed per region)
  pitchMin: 0.3,             // mm, finest trace pitch (per spec 0.3-1.2 mm)
  pitchMax: 1.2,             // mm, widest trace pitch
  traceDuty: 0.5,            // copper : gap ratio, also the mean tonal lift once sub-pixel
  plainShare: 0.28,          // share of regions left as plain copper pour (no traces)
  regionInset: 0.07,         // fraction of a region kept clear at each edge (trace bundles end softly)
  traceLift: 0.24,           // multiplicative brightening of mask over copper
  traceTint: [0.010, 0.014, 0.002], // additive linear-RGB yellow-green shift over copper
  viaCell: 1.7,              // mm, grid cell in which at most one via may appear
  viaShare: 0.16,            // share of cells that hold a via ("sparse")
  viaRadius: 0.22,           // mm, annular ring outer radius
  viaHole: 0.09,             // mm, drilled hole radius
  silkCell: [14.0, 11.0],    // mm, grid cell in which at most one silkscreen outline may appear
  silkShare: 0.38,           // share of cells that hold an outline ("a few")
  silkHalfWidth: 0.07,       // mm, half stroke width of the outline
  silkColor: [0.80, 0.82, 0.76], // linear RGB of the pale silkscreen ink
  silkMix: 0.6,              // max opacity of the ink
  footprintDarken: 0.1,      // area inside an outline is 10 % darker (bare component footprint)
  sheen: 0.25,               // grazing brightening of the glossy mask
  roughTrace: -0.05,         // mask over copper is slightly smoother (STANDARD only)
  gloss: 1.15,               // Phong specular multiplier
});

/** IC package (matte epoxy). */
const CHIP = Object.freeze({
  noisePeriod: 0.4,          // mm, epoxy grain
  noiseAmp: 0.12,            // +-6 % tone (base is very dark, so this stays subtle)
  bevelFrac: 0.08,           // bevel width as a fraction of the package's short side
  bevelMin: 0.15,            // mm, minimum bevel width
  bevelMax: 0.6,             // mm, maximum bevel width
  bevelAdd: [0.018, 0.019, 0.021], // additive linear RGB at the very edge
  markInset: 0.2,            // laser-mark rectangle inset as a fraction of the short side
  markHalfWidth: 0.05,       // mm, half stroke width of the etched rectangle
  markAdd: 0.012,            // additive linear grey of the etched mark ("very faint")
  dotFrac: 0.07,             // orientation-dot radius as a fraction of the short side
  roughOffset: 0.05,         // matte (STANDARD only)
  gloss: 0.8,                // Phong specular multiplier (duller)
});

/** Pouch cell (soft foil). */
const BATTERY = Object.freeze({
  wrinkle: [7.0, 15.0, 7.0], // mm, wrinkle periods per axis (longer along the cell)
  octave2: 2.3,              // frequency ratio of the second wrinkle octave
  amp: 0.09,                 // +-4.5 % tone
  sheen: 0.3,                // foil catches grazing light
  roughOffset: -0.12,        // "slightly glossier" (STANDARD only)
  roughVar: 0.1,             // wrinkles perturb roughness a little
  gloss: 1.35,               // Phong specular multiplier
});

/** Polyimide flex cable. */
const FLEX = Object.freeze({
  pitch: 0.5,                // mm, trace pitch across the cable
  duty: 0.55,                // copper share of one pitch
  traceTint: [0.80, 0.70, 0.60], // copper seen through amber film: darker, redder (multiplier)
  traceMix: 0.7,             // strength of that tint
  marginFrac: 0.08,          // trace-free margin at each cable edge (fraction of width)
  marginMin: 0.25,           // mm, minimum margin
  sheen: 0.3,                // glossy film
  roughOffset: -0.08,        // (STANDARD only)
  gloss: 1.25,               // Phong specular multiplier
});

/** Copper coils / shields. */
const COPPER = Object.freeze({
  pitch: 0.6,                // mm, winding / grain pitch
  duty: 0.6,                 // bright share of one pitch
  amp: 0.12,                 // zero-mean tone amplitude (vanishes when sub-pixel)
  noisePeriod: 1.1,          // mm, soft oxidation mottling
  noiseAmp: 0.04,            // +-2 %
  sheen: 0.25,               //
  roughVar: 0.5,             // (STANDARD only)
  gloss: 1.15,               // Phong specular multiplier
});

/** Matte plastic / foam / gaskets. */
const BLACK = Object.freeze({
  noisePeriod: 0.45,         // mm, moulding texture
  noiseAmp: 0.2,             // +-10 % of a very dark base = barely visible
  sheen: 0.35,               // lifts grazing faces so black parts keep their form
  roughOffset: 0.04,         // (STANDARD only)
  gloss: 0.85,               // Phong specular multiplier
});

/** Back glass / cover glass. */
const GLASS = Object.freeze({
  gradDir: [0.4472, 0.8944], // unit direction (x, y) of the large panel gradient
  gradStart: -20.0,          // mm along gradDir where the gradient starts
  gradEnd: 190.0,            // mm along gradDir where it ends (spans a whole phone)
  gradLo: 0.88,              // tone multiplier at the dark end
  gradHi: 1.25,              // tone multiplier at the bright end
  tint: [0.010, 0.016, 0.026], // additive cool linear RGB reflection tint
  tintGrad: 0.35,            // share of the tint driven by the gradient
  tintSheen: 1.0,            // share of the tint driven by grazing angle
});

/** Shared filtering thresholds. */
const FILTER = Object.freeze({
  fadeStart: 0.3,            // pattern starts fading when a pixel covers 30 % of its period
  fadeEnd: 0.85,             // ...and is gone at 85 %
  sheenPower: 2.0,           // exponent of the grazing-angle sheen (soft, Fresnel-like)
  topStart: 0.55,            // |normal.z| where "flat face" detail starts to appear
  topEnd: 0.85,              // |normal.z| where it is fully shown
});

/** Bounds heuristics used by setBounds(). */
const RADIAL_ASPECT = Object.freeze({
  copper: 1.6,               // x/y footprint aspect below which a copper part is drawn as a concentric coil
  metalDark: 1.25,           // aspect below which a dark-metal part is treated as round (screw head)
});

/** Keys that receive a shader finish; all other keys are left untouched. */
const PATCHED_KEYS = new Set([
  'alu', 'metal', 'metalDark', 'glass', 'pcb', 'pcbDark',
  'chip', 'battery', 'flex', 'copper', 'black',
]);

/* ------------------------------------------------------------------------ */
/* GLSL helpers                                                              */
/* ------------------------------------------------------------------------ */

/** Format a JS number as a GLSL float literal. */
const gl = (n) => (Number.isInteger(n) ? n.toFixed(1) : String(n));
/** Format a JS array as a GLSL vecN literal. */
const glv = (a) => `vec${a.length}(${a.map(gl).join(', ')})`;

const VERTEX_PARS = /* glsl */ `
varying vec3 uapPos;
`;

const VERTEX_MAIN = /* glsl */ `
uapPos = position;
`;

const fragmentPars = (lite) => /* glsl */ `
${lite ? '#define UAP_LITE' : ''}
uniform float uapOn;
uniform float uapHasBox;
uniform float uapRadial;
uniform vec3 uapBoxMin;
uniform vec3 uapBoxMax;
uniform vec3 uapAxis;
uniform vec3 uapCross;
varying vec3 uapPos;

float uapHash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float uapHash3(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float uapNoise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(uapHash2(i), uapHash2(i + vec2(1.0, 0.0)), f.x),
             mix(uapHash2(i + vec2(0.0, 1.0)), uapHash2(i + vec2(1.0, 1.0)), f.x), f.y);
}
float uapNoise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(uapHash3(i), uapHash3(i + vec3(1.0, 0.0, 0.0)), f.x),
                mix(uapHash3(i + vec3(0.0, 1.0, 0.0)), uapHash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y);
  float b = mix(mix(uapHash3(i + vec3(0.0, 0.0, 1.0)), uapHash3(i + vec3(1.0, 0.0, 1.0)), f.x),
                mix(uapHash3(i + vec3(0.0, 1.0, 1.0)), uapHash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y);
  return mix(a, b, f.z);
}
// Volume noise; the lightweight path uses a sheared 2D lookup (4 taps instead of 8).
float uapNoise(vec3 p) {
  #ifdef UAP_LITE
    return uapNoise2(p.xy + p.z * vec2(0.37, 0.61));
  #else
    return uapNoise3(p);
  #endif
}
// 1 while a pattern of the given period (mm) is resolved, 0 once it is sub-pixel.
float uapFade(float fw, float period) {
  return 1.0 - smoothstep(${gl(FILTER.fadeStart)}, ${gl(FILTER.fadeEnd)}, fw / period);
}
// Filtered periodic stripes (period 1 in u, w = pixel footprint in u). Tends to its mean (duty).
float uapStripe(float u, float duty, float w) {
  float d = abs(fract(u) - 0.5);
  float hw = 0.5 * duty;
  float ww = max(w, 1e-4);
  float s = 1.0 - smoothstep(hw - ww, hw + ww, d);
  return mix(s, duty, smoothstep(0.2, 0.55, ww));
}
// Box-filtered coverage of a line of half width hw at signed distance d (a = half pixel footprint).
float uapLine(float d, float hw, float a) {
  return clamp((min(d + a, hw) - max(d - a, -hw)) / (2.0 * a), 0.0, 1.0);
}
// Signed distance to an axis-aligned rectangle of half size h.
float uapBox(vec2 p, vec2 h) {
  vec2 q = abs(p) - h;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}
`;

/** Shared preamble: all screen-space derivatives are taken here, outside any branch. */
const FRAGMENT_PREAMBLE = /* glsl */ `
float uapRoughD = 0.0;
float uapGloss = 1.0;
{
  vec3 uapFw3 = max(fwidth(uapPos), vec3(1e-5));
  float uapFw = max(max(uapFw3.x, uapFw3.y), uapFw3.z);
  vec3 uapNo = cross(dFdx(uapPos), dFdy(uapPos));
  float uapNoLen = length(uapNo);
  uapNo = uapNoLen > 1e-10 ? uapNo / uapNoLen : vec3(0.0, 0.0, 1.0);
  float uapTop = smoothstep(${gl(FILTER.topStart)}, ${gl(FILTER.topEnd)}, abs(uapNo.z));
  #ifdef FLAT_SHADED
    vec3 uapNv = cross(dFdx(vViewPosition), dFdy(vViewPosition));
    float uapNvLen = length(uapNv);
    uapNv = uapNvLen > 1e-10 ? uapNv / uapNvLen : vec3(0.0, 0.0, 1.0);
  #else
    vec3 uapNv = normalize(vNormal);
  #endif
  vec3 uapV = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);
  float uapSheen = pow(1.0 - clamp(abs(dot(uapNv, uapV)), 0.0, 1.0), ${gl(FILTER.sheenPower)});
  vec3 uapCol = diffuseColor.rgb;
`;

const FRAGMENT_POSTAMBLE = /* glsl */ `
  diffuseColor.rgb = mix(diffuseColor.rgb, max(uapCol, vec3(0.0)), uapOn);
  uapRoughD *= uapOn;
  uapGloss = mix(1.0, uapGloss, uapOn);
}
`;

/** Applied just before <normal_fragment_begin>, where roughnessFactor / specularStrength exist. */
const FRAGMENT_SURFACE = /* glsl */ `
#ifdef STANDARD
  roughnessFactor = clamp(roughnessFactor + uapRoughD, 0.05, 1.0);
#endif
#ifdef PHONG
  specularStrength *= uapGloss;
#endif
`;

/* ----------------------------- per-key bodies ---------------------------- */

function metalBody(m) {
  const turn = m.turnPitch > 0
    ? /* glsl */ `
  {
    vec2 uapTc = 0.5 * (uapBoxMin.xy + uapBoxMax.xy);
    float uapTr = length(uapPos.xy - uapTc);
    float uapTw = max(uapFw3.x, uapFw3.y) / ${gl(m.turnPitch)};
    float uapTs = uapStripe(uapTr / ${gl(m.turnPitch)}, 0.5, uapTw) - 0.5;
    uapTone += uapTs * ${gl(m.ampTurn)} * uapRadial * uapHasBox * uapTop;
  }`
    : '';
  return /* glsl */ `
  float uapTone = 0.0;
  #ifndef UAP_LITE
    uapTone += (uapNoise(uapPos / ${gl(m.speckleFine)}) - 0.5) * ${gl(m.ampFine)} * uapFade(uapFw, ${gl(m.speckleFine)});
  #endif
  uapTone += (uapNoise(uapPos / ${gl(m.speckleCoarse)} + 17.0) - 0.5) * ${gl(m.ampCoarse)} * uapFade(uapFw, ${gl(m.speckleCoarse)});
  vec3 uapBq = uapPos - uapAxis * dot(uapPos, uapAxis) * ${gl(1 - m.brushStretch)};
  uapTone += (uapNoise(uapBq / ${gl(m.brushPeriod)} + 41.0) - 0.5) * ${gl(m.ampBrush)} * uapFade(uapFw, ${gl(m.brushPeriod)});
  ${turn}
  uapCol *= ${gl(m.tone)} * (1.0 + uapTone);
  uapCol *= 1.0 + ${gl(m.sheen)} * uapSheen;
  uapRoughD = uapTone * ${gl(m.roughVar)} + ${gl(m.roughOffset)};
  uapGloss = ${gl(m.gloss)};
`;
}

function glassBody() {
  const g = GLASS;
  return /* glsl */ `
  float uapG = smoothstep(${gl(g.gradStart)}, ${gl(g.gradEnd)}, dot(uapPos.xy, ${glv(g.gradDir)}));
  uapCol *= mix(${gl(g.gradLo)}, ${gl(g.gradHi)}, uapG);
  uapCol += ${glv(g.tint)} * (${gl(g.tintGrad)} * uapG + ${gl(g.tintSheen)} * uapSheen);
`;
}

function pcbBody() {
  const p = PCB;
  return /* glsl */ `
  vec2 uapPp = uapPos.xy;
  vec2 uapFw2 = uapFw3.xy;
  float uapFwm = max(uapFw2.x, uapFw2.y);
  float uapAa = max(0.6 * uapFwm, 1e-4);

  // Routing regions: direction, pitch and presence are hashed per region.
  vec2 uapRc = uapPp / ${glv(p.region)};
  vec2 uapRi = floor(uapRc);
  vec2 uapRf = uapRc - uapRi;
  float uapH1 = uapHash2(uapRi + 3.1);
  float uapH2 = uapHash2(uapRi + 11.7);
  float uapH3 = uapHash2(uapRi + 23.9);
  float uapPitch = mix(${gl(p.pitchMin)}, ${gl(p.pitchMax)}, uapH2 * uapH2);
  float uapAlongY = step(0.5, uapH1);
  float uapU = mix(uapPp.y, uapPp.x, uapAlongY) / uapPitch;
  float uapW = mix(uapFw2.y, uapFw2.x, uapAlongY) / uapPitch;
  float uapTr = uapStripe(uapU, ${gl(p.traceDuty)}, uapW);
  vec2 uapRm = max(vec2(${gl(p.regionInset)}), 1.5 * uapFw2 / ${glv(p.region)});
  vec2 uapRe = smoothstep(vec2(0.0), uapRm, uapRf) * smoothstep(vec2(0.0), uapRm, 1.0 - uapRf);
  uapTr *= uapRe.x * uapRe.y * step(${gl(p.plainShare)}, uapH3);

  // Sparse vias: tinned ring with a dark drill hole.
  float uapVia = 0.0;
  float uapHole = 0.0;
  #ifndef UAP_LITE
  {
    vec2 uapVc = uapPp / ${gl(p.viaCell)};
    vec2 uapVi = floor(uapVc);
    float uapVh = step(${gl(1 - p.viaShare)}, uapHash2(uapVi + 57.3));
    vec2 uapVo = (vec2(uapHash2(uapVi + 5.5), uapHash2(uapVi + 9.2)) - 0.5) * 0.5 + 0.5;
    float uapVd = length((uapVc - uapVi - uapVo) * ${gl(p.viaCell)});
    uapVia = (1.0 - smoothstep(${gl(p.viaRadius)} - uapAa, ${gl(p.viaRadius)} + uapAa, uapVd))
      * uapVh * uapFade(uapFwm, ${gl(p.viaRadius * 4)});
    uapHole = (1.0 - smoothstep(${gl(p.viaHole)} - uapAa, ${gl(p.viaHole)} + uapAa, uapVd))
      * uapVh * uapFade(uapFwm, ${gl(p.viaHole * 4)});
  }
  #endif

  // A few silkscreen outline rectangles (no text).
  vec2 uapSi = floor(uapPp / ${glv(p.silkCell)});
  float uapSh = step(${gl(1 - p.silkShare)}, uapHash2(uapSi + 71.9));
  vec2 uapSc = (uapSi + 0.5 + (vec2(uapHash2(uapSi + 2.3), uapHash2(uapSi + 8.1)) - 0.5) * 0.3) * ${glv(p.silkCell)};
  vec2 uapSz = ${glv(p.silkCell)} * mix(vec2(0.14), vec2(0.30), vec2(uapHash2(uapSi + 13.3), uapHash2(uapSi + 19.9)));
  float uapSd = uapBox(uapPp - uapSc, uapSz);
  float uapSilk = uapLine(uapSd, ${gl(p.silkHalfWidth)}, uapAa) * uapSh;
  float uapInside = (1.0 - smoothstep(-uapAa, uapAa, uapSd)) * uapSh;

  uapTr *= (1.0 - 0.85 * uapInside) * uapTop;
  uapCol *= 1.0 + ${gl(p.traceLift)} * uapTr;
  uapCol += ${glv(p.traceTint)} * uapTr;
  uapCol = mix(uapCol, uapCol * 1.5 + vec3(0.03, 0.03, 0.015), 0.8 * uapVia * uapTop);
  uapCol *= 1.0 - 0.6 * uapHole * uapTop;
  uapCol *= 1.0 - ${gl(p.footprintDarken)} * uapInside * uapTop;
  uapCol = mix(uapCol, ${glv(p.silkColor)}, ${gl(p.silkMix)} * uapSilk * uapTop);
  uapCol *= 1.0 + ${gl(p.sheen)} * uapSheen;
  uapRoughD = ${gl(p.roughTrace)} * uapTr;
  uapGloss = ${gl(p.gloss)};
`;
}

function chipBody() {
  const c = CHIP;
  return /* glsl */ `
  uapCol *= 1.0 + (uapNoise(uapPos / ${gl(c.noisePeriod)}) - 0.5) * ${gl(c.noiseAmp)} * uapFade(uapFw, ${gl(c.noisePeriod)});
  if (uapHasBox > 0.5) {
    vec2 uapCs = max(uapBoxMax.xy - uapBoxMin.xy, vec2(1e-3));
    vec2 uapLp = uapPos.xy - uapBoxMin.xy;
    float uapMinDim = min(uapCs.x, uapCs.y);
    float uapAa = max(0.6 * uapFw, 1e-4);
    // Soft lighter bevel toward the package's own bounding-box edges.
    float uapDe = min(min(uapLp.x, uapCs.x - uapLp.x), min(uapLp.y, uapCs.y - uapLp.y));
    float uapBw = max(clamp(${gl(c.bevelFrac)} * uapMinDim, ${gl(c.bevelMin)}, ${gl(c.bevelMax)}), 1.5 * uapFw);
    uapCol += ${glv(c.bevelAdd)} * (1.0 - smoothstep(0.0, uapBw, uapDe)) * uapTop;
    // Faint laser-etched rectangle and orientation dot (no text).
    float uapInset = ${gl(c.markInset)} * uapMinDim;
    float uapMd = uapBox(uapLp - 0.5 * uapCs, 0.5 * uapCs - uapInset);
    float uapMark = uapLine(uapMd, ${gl(c.markHalfWidth)}, uapAa);
    float uapDr = ${gl(c.dotFrac)} * uapMinDim;
    float uapDd = length(uapLp - vec2(1.75 * uapInset));
    uapMark += (1.0 - smoothstep(uapDr - uapAa, uapDr + uapAa, uapDd)) * uapFade(uapFw, 4.0 * uapDr);
    uapCol += vec3(${gl(c.markAdd)}) * min(uapMark, 1.0) * uapTop;
  }
  uapRoughD = ${gl(c.roughOffset)};
  uapGloss = ${gl(c.gloss)};
`;
}

function batteryBody() {
  const b = BATTERY;
  const inv = b.wrinkle.map((v) => 1 / v);
  const minPeriod = Math.min(...b.wrinkle) / b.octave2;
  return /* glsl */ `
  vec3 uapWq = uapPos * ${glv(inv)};
  float uapWn = uapNoise(uapWq) - 0.5;
  uapWn += 0.5 * (uapNoise(uapWq * ${gl(b.octave2)} + 9.0) - 0.5) * uapFade(uapFw, ${gl(minPeriod)});
  uapWn /= 1.5;
  uapCol *= 1.0 + ${gl(b.amp * 2)} * uapWn;
  uapCol *= 1.0 + ${gl(b.sheen)} * uapSheen;
  uapRoughD = ${gl(b.roughOffset)} + ${gl(b.roughVar * 2)} * uapWn;
  uapGloss = ${gl(b.gloss)};
`;
}

function flexBody() {
  const f = FLEX;
  return /* glsl */ `
  float uapFc = dot(uapPos, uapCross);
  float uapFwc = dot(uapFw3, abs(uapCross));
  float uapTr = uapStripe(uapFc / ${gl(f.pitch)}, ${gl(f.duty)}, uapFwc / ${gl(f.pitch)});
  // Hide traces on the thin side faces whose normal points across the cable.
  uapTr *= 1.0 - smoothstep(0.3, 0.6, abs(dot(uapNo, uapCross)));
  if (uapHasBox > 0.5) {
    float uapLo = dot(uapBoxMin, uapCross);
    float uapHi = dot(uapBoxMax, uapCross);
    float uapMg = max(${gl(f.marginFrac)} * (uapHi - uapLo), ${gl(f.marginMin)});
    uapTr *= smoothstep(0.6 * uapMg - uapFwc, uapMg + uapFwc, uapFc - uapLo)
           * smoothstep(0.6 * uapMg - uapFwc, uapMg + uapFwc, uapHi - uapFc);
  }
  uapCol = mix(uapCol, uapCol * ${glv(f.traceTint)}, ${gl(f.traceMix)} * uapTr);
  uapCol *= 1.0 + ${gl(f.sheen)} * uapSheen;
  uapRoughD = ${gl(f.roughOffset)};
  uapGloss = ${gl(f.gloss)};
`;
}

function copperBody() {
  const c = COPPER;
  return /* glsl */ `
  vec2 uapCc = 0.5 * (uapBoxMin.xy + uapBoxMax.xy);
  float uapCr = length(uapPos.xy - uapCc);
  float uapCl = dot(uapPos, uapCross);
  float uapRad = uapRadial * uapHasBox;
  float uapCu = mix(uapCl, uapCr, uapRad) / ${gl(c.pitch)};
  float uapCw = mix(dot(uapFw3, abs(uapCross)), max(uapFw3.x, uapFw3.y), uapRad) / ${gl(c.pitch)};
  float uapTone = (uapStripe(uapCu, ${gl(c.duty)}, uapCw) - ${gl(c.duty)}) * ${gl(c.amp)};
  uapTone += (uapNoise(uapPos / ${gl(c.noisePeriod)}) - 0.5) * ${gl(c.noiseAmp)} * uapFade(uapFw, ${gl(c.noisePeriod)});
  uapCol *= 1.0 + uapTone;
  uapCol *= 1.0 + ${gl(c.sheen)} * uapSheen;
  uapRoughD = -uapTone * ${gl(c.roughVar)};
  uapGloss = ${gl(c.gloss)};
`;
}

function blackBody() {
  const b = BLACK;
  return /* glsl */ `
  uapCol *= 1.0 + (uapNoise(uapPos / ${gl(b.noisePeriod)}) - 0.5) * ${gl(b.noiseAmp)} * uapFade(uapFw, ${gl(b.noisePeriod)});
  uapCol *= 1.0 + ${gl(b.sheen)} * uapSheen;
  uapRoughD = ${gl(b.roughOffset)};
  uapGloss = ${gl(b.gloss)};
`;
}

function bodyForKey(key) {
  switch (key) {
    case 'alu':
    case 'metal':
    case 'metalDark':
      return metalBody(METAL[key]);
    case 'glass':
      return glassBody();
    case 'pcb':
    case 'pcbDark':
      return pcbBody();
    case 'chip':
      return chipBody();
    case 'battery':
      return batteryBody();
    case 'flex':
      return flexBody();
    case 'copper':
      return copperBody();
    case 'black':
      return blackBody();
    default:
      return '';
  }
}

/** Insert `code` right after `#include <chunk>`; returns the source unchanged if the chunk is absent. */
function insertAfter(source, chunk, code) {
  const token = `#include <${chunk}>`;
  return source.includes(token) ? source.replace(token, `${token}\n${code}`) : source;
}

/** Insert `code` right before `#include <chunk>`; returns the source unchanged if the chunk is absent. */
function insertBefore(source, chunk, code) {
  const token = `#include <${chunk}>`;
  return source.includes(token) ? source.replace(token, `${code}\n${token}`) : source;
}

const NOOP_HANDLE = Object.freeze({
  setEnabled() {},
  setBounds() {},
  dispose() {},
});

/* ------------------------------------------------------------------------ */
/* 1. patchFinish                                                            */
/* ------------------------------------------------------------------------ */

/**
 * Adds an authored illustration finish to a material, chained after the
 * material's existing onBeforeCompile / customProgramCacheKey.
 *
 * @param {THREE.Material} material MeshStandard / MeshPhysical / MeshPhong material
 * @param {string} key palette key (alu, glass, pcb, ...)
 * @param {{ lightweight?: boolean }} [options]
 * @returns {{ setEnabled(on: boolean): void,
 *             setBounds(min: THREE.Vector3, max: THREE.Vector3): void,
 *             dispose(): void }}
 */
export function patchFinish(material, key, { lightweight = false } = {}) {
  // gold, label, passive, lens, adhesive and unknown keys stay visually unchanged.
  if (!material || !PATCHED_KEYS.has(key)) return NOOP_HANDLE;

  // A material shared by many meshes is patched once; later calls get the same handle.
  if (material.userData && material.userData.uapFinish) return material.userData.uapFinish;

  const body = bodyForKey(key);
  const lite = !!lightweight;

  const uniforms = {
    uapOn: { value: 1 },
    uapHasBox: { value: 0 },
    uapRadial: { value: 0 },
    uapBoxMin: { value: new THREE.Vector3(0, 0, 0) },
    uapBoxMax: { value: new THREE.Vector3(1, 1, 1) },
    uapAxis: { value: new THREE.Vector3(0, 1, 0) },  // default grain / cable direction: phone length (y)
    uapCross: { value: new THREE.Vector3(1, 0, 0) }, // default cross direction: phone width (x)
  };

  const previousCompile = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey;
  const suffix = `|uap-${key}-${lite ? 'l' : 'f'}`;

  const fragPars = fragmentPars(lite);
  const fragMain = `${FRAGMENT_PREAMBLE}${body}${FRAGMENT_POSTAMBLE}`;

  const compile = function (shader, renderer) {
    if (typeof previousCompile === 'function') previousCompile.call(material, shader, renderer);

    // Without the anchor chunks nothing is injected (the material renders as before).
    if (!shader.fragmentShader.includes('#include <color_fragment>')
      || !shader.vertexShader.includes('#include <begin_vertex>')) return;

    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = insertAfter(shader.vertexShader, 'common', VERTEX_PARS);
    shader.vertexShader = insertAfter(shader.vertexShader, 'begin_vertex', VERTEX_MAIN);

    shader.fragmentShader = insertAfter(shader.fragmentShader, 'common', fragPars);
    shader.fragmentShader = insertAfter(shader.fragmentShader, 'color_fragment', fragMain);
    shader.fragmentShader = insertBefore(shader.fragmentShader, 'normal_fragment_begin', FRAGMENT_SURFACE);
  };

  const cacheKey = function () {
    const base = typeof previousKey === 'function' ? previousKey.call(material) : '';
    return `${base}${suffix}`;
  };

  material.onBeforeCompile = compile;
  material.customProgramCacheKey = cacheKey;
  material.needsUpdate = true;

  const radialAspect = RADIAL_ASPECT[key] || 0;

  const handle = {
    /** Blueprint mode calls setEnabled(false): the finish is mixed out by a uniform, no recompile. */
    setEnabled(on) {
      uniforms.uapOn.value = on ? 1 : 0;
    },

    /**
     * Optional: the part's own bounds in model millimetres (geometry space).
     * Drives edge bevels, the long (grain / cable) axis and concentric modes.
     */
    setBounds(min, max) {
      if (!min || !max) return;
      uniforms.uapBoxMin.value.copy(min);
      uniforms.uapBoxMax.value.copy(max);
      uniforms.uapHasBox.value = 1;

      const dx = Math.abs(max.x - min.x);
      const dy = Math.abs(max.y - min.y);
      const dz = Math.abs(max.z - min.z);

      // Longest extent = grain / cable axis, middle extent = cross axis. Ties prefer y, then x.
      let longest = 1;
      if (dx > dy && dx >= dz) longest = 0;
      else if (dz > dy && dz > dx) longest = 2;

      let middle;
      if (longest === 0) middle = dy >= dz ? 1 : 2;
      else if (longest === 1) middle = dx >= dz ? 0 : 2;
      else middle = dy >= dx ? 1 : 0;

      uniforms.uapAxis.value.set(longest === 0 ? 1 : 0, longest === 1 ? 1 : 0, longest === 2 ? 1 : 0);
      uniforms.uapCross.value.set(middle === 0 ? 1 : 0, middle === 1 ? 1 : 0, middle === 2 ? 1 : 0);

      // Roughly square x/y footprint: coils are drawn concentric, screw heads get turning rings.
      const lo = Math.max(Math.min(dx, dy), 1e-6);
      const aspect = Math.max(dx, dy) / lo;
      uniforms.uapRadial.value = radialAspect > 0 && aspect < radialAspect ? 1 : 0;
    },

    /** Restores the previous shader hooks (only if nothing was chained after this pass). */
    dispose() {
      if (material.onBeforeCompile === compile) {
        material.onBeforeCompile = previousCompile;
        material.customProgramCacheKey = previousKey;
        material.needsUpdate = true;
      }
      if (material.userData && material.userData.uapFinish === handle) {
        delete material.userData.uapFinish;
      }
    },
  };

  if (material.userData) material.userData.uapFinish = handle;
  return handle;
}

/* ------------------------------------------------------------------------ */
/* 2. createStudioEnvironment                                                */
/* ------------------------------------------------------------------------ */

const DEG = Math.PI / 180;

/**
 * Authored studio layout. Longitude follows three's equirect convention
 * (lon = atan2(dir.z, dir.x)), latitude is elevation above the horizon.
 * Levels are display-referred greys (0..1), strictly neutral (r = g = b) so
 * coloured frames keep their hue.
 */
const STUDIO = Object.freeze({
  zenith: 0.2,          // ceiling grey straight up
  skyHorizon: 0.44,     // wall grey just above the horizon
  cycHorizon: 0.62,     // cyclorama grey just below the horizon (bounce from the sweep)
  nadir: 0.36,          // floor grey straight down
  horizonBlend: 5 * DEG, // half height of the soft wall-to-sweep transition
  boxes: Object.freeze([
    // Key softbox: upper-left-front, matches the existing key light direction (-0.6, 1.4, 0.9).
    Object.freeze({ lon: 124 * DEG, lat: 48 * DEG, halfW: 30 * DEG, halfH: 17 * DEG, soft: 7 * DEG, level: 0.8 }),
    // Fill softbox: right-front, lower and dimmer.
    Object.freeze({ lon: 28 * DEG, lat: 20 * DEG, halfW: 22 * DEG, halfH: 15 * DEG, soft: 8 * DEG, level: 0.42 }),
    // Strip light: long and thin, behind the subject, gives edge highlights.
    Object.freeze({ lon: -90 * DEG, lat: 34 * DEG, halfW: 62 * DEG, halfH: 3.5 * DEG, soft: 2.5 * DEG, level: 0.7 }),
  ]),
});

const smooth01 = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Neutral procedural photo-studio environment (equirectangular, 2:1).
 * @param {{ size?: number }} [options] size = texture height in pixels (width is 2 * size)
 * @returns {{ texture: THREE.CanvasTexture, dispose(): void }}
 */
export function createStudioEnvironment({ size = 512 } = {}) {
  const height = Math.max(16, Math.floor(size));
  const width = height * 2;

  const canvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : new OffscreenCanvas(width, height);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const boxes = STUDIO.boxes;
  const twoPi = Math.PI * 2;

  for (let j = 0; j < height; j++) {
    // Canvas row 0 is the top of the texture (v = 1, straight up).
    const lat = (0.5 - (j + 0.5) / height) * Math.PI;

    // Background: ceiling-to-wall gradient above the horizon, cyclorama sweep below.
    const up = Math.max(0, lat) / (Math.PI / 2);
    const down = Math.max(0, -lat) / (Math.PI / 2);
    const sky = STUDIO.skyHorizon + (STUDIO.zenith - STUDIO.skyHorizon) * smooth01(0, 1, up);
    const cyc = STUDIO.cycHorizon + (STUDIO.nadir - STUDIO.cycHorizon) * smooth01(0, 1, down);
    const blend = smooth01(-STUDIO.horizonBlend, STUDIO.horizonBlend, lat);
    const background = cyc + (sky - cyc) * blend;

    for (let i = 0; i < width; i++) {
      const lon = ((i + 0.5) / width - 0.5) * twoPi;
      let value = background;

      for (let k = 0; k < boxes.length; k++) {
        const b = boxes[k];
        let dLon = lon - b.lon;
        dLon -= twoPi * Math.round(dLon / twoPi); // wrap across the seam
        const sx = 1 - smooth01(b.halfW - b.soft, b.halfW + b.soft, Math.abs(dLon));
        const sy = 1 - smooth01(b.halfH - b.soft, b.halfH + b.soft, Math.abs(lat - b.lat));
        value += sx * sy * b.level;
      }

      const byte = Math.round(Math.min(1, Math.max(0, value)) * 255);
      const o = (j * width + i) * 4;
      data[o] = byte;
      data[o + 1] = byte;
      data[o + 2] = byte;
      data[o + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.name = 'uap-studio-environment';
  texture.needsUpdate = true;

  return {
    texture,
    dispose() {
      texture.dispose();
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

/* ------------------------------------------------------------------------ */
/* 3. SUGGESTED_LIGHTS                                                       */
/* ------------------------------------------------------------------------ */

/**
 * Authored product-shot light rig, a gentle retune of the existing setup
 * (hemisphere 1.6 + directional 2.2 from (-0.6, 1.4, 0.9)). Directions point
 * from the subject toward the light, in world space (y up).
 */
export const SUGGESTED_LIGHTS = Object.freeze({
  hemiSky: '#f3f5f8',                        // near-neutral, faintly cool ceiling bounce
  hemiGround: '#8d8f93',                     // mid-grey sweep bounce keeps undersides readable
  hemiIntensity: 1.25,                       // below the existing 1.6: the environment now adds fill
  keyColor: '#fff7ee',                       // slightly warm key softbox
  keyIntensity: 2.4,                         // a touch above the existing 2.2 for clearer face separation
  keyDirection: Object.freeze([-0.6, 1.4, 0.9]), // unchanged, matches the key softbox in the environment
  rimColor: '#dfe8ff',                       // cool rim separates dark glass and black parts from the backdrop
  rimIntensity: 0.9,                         // subtle: edges only, no second shadow reading
  rimDirection: Object.freeze([0.8, 0.9, -1.1]), // behind-right and above, near the strip light
});
