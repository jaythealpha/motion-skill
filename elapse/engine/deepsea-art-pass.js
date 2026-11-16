// Fable 5.2 (claude-fable-5-2) specification-only module, 2026-11-16; reviewed and integrated by Claude Opus 5.5.
// No repository source files were sent to the model. Integration notes: docs/reviews/2026-11-16-notredame-titanic-art-pass/design-qa.md
/**
 * deepsea-art-pass.js
 * ---------------------------------------------------------------------------
 * Art pass for the seabed scenes of the RMS Titanic wreck page
 * (three.js r180, WebGL2, offline, single ES module, no assets).
 *
 * IMPORTANT - READ BEFORE CHANGING ANY VALUE
 *   Every look in this file is AUTHORED ILLUSTRATION. Nothing here is measured,
 *   photographed or simulated. At about 3,800 m depth there is no daylight at
 *   all; the real site is completely dark. The visible light in these scenes
 *   (ambient floor, soft "lamp" pools, the faint haze at the horizontal) is an
 *   illustrative "survey lighting" convention used so that the sediment and the
 *   wreck can be read, in the same spirit as a lit museum diagram. Colours of
 *   sediment, rust and water are authored for legibility and a calm, respectful
 *   tone. This is a memorial subject: prefer restraint.
 *
 * Technical notes
 *   - Deterministic: no wall-clock time anywhere. Animation is a pure function
 *     of caller-supplied numbers (`t`, camera position).
 *   - No render targets, no per-frame allocations. Extra draw calls: 2
 *     (water-column dome + marine-snow points). The seabed and wreck are
 *     material patches on existing meshes (no extra draws).
 *   - All procedural patterns are faded by their screen-space footprint
 *     (derivatives) so nothing shimmers, and by camera distance (> 900 m).
 *   - Frame: model metres, z up. `root` maps model (x, y, z) -> world (x, z, -y).
 *     Patched materials reconstruct MODEL-space position with `uDsModelInv`
 *     (inverse of root.matrixWorld, supplied via `update(rootMatrixWorld)`).
 *   - Water column and marine snow are WORLD-space objects: add them to the
 *     scene, NOT to `root`.
 */

import * as THREE from 'three';

/* ===========================================================================
 * Shared authored constants
 * ======================================================================== */

/** Authored fog colour for the deep scenes. The water-column dome equals this
 *  colour exactly in the horizontal direction, so fogged geometry dissolves
 *  into the background without a visible seam. A dark, slightly luminous
 *  teal-blue: light enough that dark silhouettes separate from it. */
export const DEEP_FOG = new THREE.Color(0x0c2432);

/** Authored lighting / fog suggestions for the seabed scenes. */
export const SUGGESTED = {
  /** Hemisphere "sky" colour: cool pale blue-grey survey light from above. */
  hemiSky: 0x9db4c2,
  /** Hemisphere "ground" colour: dim teal bounce so undersides stay readable. */
  hemiGround: 0x16262f,
  /** Hemisphere intensity (r155+ physical light units): dark and solemn,
   *  yet the toon bands on the wreck still resolve against DEEP_FOG. */
  hemiIntensity: 1.2,
  /** Fog near = 0.7 x camera distance: falloff begins just in front of the
   *  subject, giving the sediment plane a visible depth gradient
   *  (caller currently uses 1.1). */
  fogNearFactor: 0.7,
  /** Fog far = 4.5 x camera distance: both hull pieces (about 600 m apart)
   *  stay under ~10 % fog in the overview (caller currently uses 5). */
  fogFarFactor: 4.5,
};

/* Registry so the module-level dispose() can release everything. */
const _disposers = new Set();

/** Dispose every object created by this module (materials, geometries,
 *  and restore patched wreck materials). */
export function dispose() {
  const list = Array.from(_disposers);
  for (let i = 0; i < list.length; i++) list[i]();
  _disposers.clear();
}

/* ---------------------------------------------------------------------------
 * Small helpers (creation-time only, never per frame)
 * ------------------------------------------------------------------------ */

/** Format a JS number as a GLSL float literal. */
function glf(n) {
  const s = Number(n).toFixed(5);
  return s.indexOf('.') === -1 ? s + '.0' : s;
}

/** Format a THREE.Color (linear working values) as a GLSL vec3 literal. */
function glv3(c) {
  return 'vec3(' + glf(c.r) + ', ' + glf(c.g) + ', ' + glf(c.b) + ')';
}

/** Insert `code` after (default) or before a shader anchor string. */
function inject(src, anchor, code, before = false) {
  if (src.indexOf(anchor) === -1) return src;
  return src.replace(anchor, before ? code + '\n' + anchor : anchor + '\n' + code);
}

/** Finite-number guard for caller data. */
function num(v, fallback) {
  return Number.isFinite(v) ? v : fallback;
}

/** Shared GLSL: sin-free hashes, value noise and the derivative filter. */
const GLSL_NOISE = /* glsl */ `
float dsHash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float dsHash3(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float dsNoise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dsHash2(i), dsHash2(i + vec2(1.0, 0.0)), u.x),
    mix(dsHash2(i + vec2(0.0, 1.0)), dsHash2(i + vec2(1.0, 1.0)), u.x),
    u.y);
}
float dsNoise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dsHash3(i), dsHash3(i + vec3(1.0, 0.0, 0.0)), u.x),
        mix(dsHash3(i + vec3(0.0, 1.0, 0.0)), dsHash3(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(mix(dsHash3(i + vec3(0.0, 0.0, 1.0)), dsHash3(i + vec3(1.0, 0.0, 1.0)), u.x),
        mix(dsHash3(i + vec3(0.0, 1.0, 1.0)), dsHash3(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
    u.z);
}
// 1 while a feature of size 'wavelength' (m) spans several pixels,
// 0 once the pixel footprint (m) approaches it: fades detail before it aliases.
float dsFilter(float footprint, float wavelength) {
  return 1.0 - smoothstep(0.25, 0.70, footprint / wavelength);
}
`;

/** Shared vertex declarations + MODEL-space position reconstruction. */
const GLSL_VERT_PARS = /* glsl */ `
uniform mat4 uDsModelInv;
varying vec3 vDsModel;
varying vec3 vDsView;
`;

/* Inserted after <project_vertex> (valid in Standard, Phong and Toon), where
 * `transformed` is final and `mvPosition` exists. */
const GLSL_VERT_MAIN = /* glsl */ `
{
  vec4 dsLocal = vec4(transformed, 1.0);
  #ifdef USE_BATCHING
    dsLocal = batchingMatrix * dsLocal;
  #endif
  #ifdef USE_INSTANCING
    dsLocal = instanceMatrix * dsLocal;
  #endif
  vDsModel = (uDsModelInv * modelMatrix * dsLocal).xyz; // model metres, z up
  vDsView = -mvPosition.xyz;                             // for distance fade
}
`;

/* ===========================================================================
 * 1. Seabed material
 * ======================================================================== */

/* --- authored seabed constants ------------------------------------------ */
const SEABED = {
  /** Sediment albedo under the illustrative light: cool pale grey-olive. */
  color: new THREE.Color(0x4a524d), // darkened at integration review: 0x8f978a read as shallow water
  /** Roughness of fine abyssal ooze (Standard only): matte. */
  roughness: 0.95,
  /** Mottling wavelengths in metres (fine / medium / broad). */
  mottleFine: 0.5,
  mottleMid: 6.0,
  mottleBroad: 80.0,
  /** Mottling tone amplitudes (fraction of albedo): all low. */
  mottleFineAmp: 0.10,
  mottleMidAmp: 0.14,
  mottleBroadAmp: 0.18,
  /** Current ripples: wavelength (m) and tone amplitude (very gentle). */
  rippleWavelength: 1.2,
  rippleAmp: 0.035,
  /** Ripple crest-normal direction in model xy (unit vector, authored). */
  rippleDirX: 0.829,
  rippleDirY: 0.559,
  /** Pebble / nodule specks: cell size (m), density (fraction of cells),
   *  and darkening factor. */
  speckCell: 0.9,
  speckDensity: 0.12,
  speckDarken: 0.45,
  /** Scour: darkening of disturbed sediment inside a piece's radius. */
  scourDarken: 0.28,
  /** Berm ring: centre (x radius), width (x radius) and tone lift. */
  bermCentre: 1.12,
  bermWidth: 0.12,
  bermLift: 0.07,
  /** Debris stain field: extent (x radius), speck cell (m), max density. */
  fieldExtent: 2.5,
  fieldCell: 1.7,
  fieldDensity: 0.22,
  /** Debris stain speck colour: dark rust-brown (illustrative). */
  rust: new THREE.Color(0x4a2c1c),
  /** Lamp pool colour: cool white survey light. */
  poolColor: new THREE.Color(0xdcebf2),
  /** Pool gain: peak added diffuse (x albedo) directly under a lamp. */
  poolGain: 1.25,
  /** Height falloff: larger = pool dims faster as the lamp rises. */
  poolHeightK: 1.5,
  /** Ambient floor (x albedo): unlit sediment stays dark but readable. */
  floorColor: new THREE.Color(0x4a6470),
  floorGain: 0.10,
  /** Distance fade of all repeating patterns (m): start / fully flat. */
  fadeStart: 900.0,
  fadeEnd: 1500.0,
};

const MAX_PIECES = 8;
const MAX_LAMPS = 4;

export function createSeabedMaterial({ lightweight = false } = {}) {
  const material = lightweight
    ? new THREE.MeshPhongMaterial({
        color: SEABED.color.clone(),
        specular: 0x000000, // no highlight: sediment is matte
        shininess: 4,
      })
    : new THREE.MeshStandardMaterial({
        color: SEABED.color.clone(),
        roughness: SEABED.roughness,
        metalness: 0,
      });

  const pieces = [];
  for (let i = 0; i < MAX_PIECES; i++) pieces.push(new THREE.Vector4(0, 0, 1, 0));
  const lamps = [];
  for (let i = 0; i < MAX_LAMPS; i++) lamps.push(new THREE.Vector4(0, 0, 0, 1));

  const uniforms = {
    uDsModelInv: { value: new THREE.Matrix4() },
    uDsPieces: { value: pieces },      // xy = centre, z = radius, w = strength
    uDsPieceCount: { value: 0 },
    uDsLamps: { value: lamps },        // xyz = lamp position, w = pool radius
    uDsLampCount: { value: 0 },
    uDsStrength: { value: 1 },
  };

  const fragPars = /* glsl */ `
${lightweight ? '#define DS_LIGHT' : ''}
uniform vec4 uDsPieces[${MAX_PIECES}];
uniform int uDsPieceCount;
uniform vec4 uDsLamps[${MAX_LAMPS}];
uniform int uDsLampCount;
uniform float uDsStrength;
varying vec3 vDsModel;
varying vec3 vDsView;
${GLSL_NOISE}
`;

  /* After <color_fragment>: tone-only sediment patterns on diffuseColor. */
  const fragColor = /* glsl */ `
vec2 dsP = vDsModel.xy;
// pixel footprint on the seabed in metres
float dsFoot = max(length(dFdx(dsP)), length(dFdy(dsP)));
// all repeating patterns go flat beyond ${glf(SEABED.fadeStart)} m (anti-moire)
float dsNear = 1.0 - smoothstep(${glf(SEABED.fadeStart)}, ${glf(SEABED.fadeEnd)}, length(vDsView));

// --- multi-scale mottling (each octave filtered by its own wavelength)
float dsTone =
    (dsNoise2(dsP / ${glf(SEABED.mottleFine)}) - 0.5) * ${glf(SEABED.mottleFineAmp)} * dsFilter(dsFoot, ${glf(SEABED.mottleFine)})
  + (dsNoise2(dsP / ${glf(SEABED.mottleMid)} + 17.3) - 0.5) * ${glf(SEABED.mottleMidAmp)} * dsFilter(dsFoot, ${glf(SEABED.mottleMid)})
  + (dsNoise2(dsP / ${glf(SEABED.mottleBroad)} + 41.7) - 0.5) * ${glf(SEABED.mottleBroadAmp)} * dsFilter(dsFoot, ${glf(SEABED.mottleBroad)});

// --- gentle current ripples (tone only), warped so crests are not ruler-straight
float dsWarp = dsNoise2(dsP / 9.0 + 5.1);
float dsRip = sin(dot(dsP, vec2(${glf(SEABED.rippleDirX)}, ${glf(SEABED.rippleDirY)})) * ${glf((Math.PI * 2) / SEABED.rippleWavelength)} + dsWarp * 6.0);
float dsRipAmp = ${glf(SEABED.rippleAmp)} * dsFilter(dsFoot, ${glf(SEABED.rippleWavelength)});
#ifndef DS_LIGHT
  // ripples come and go in broad patches (30 m) rather than covering everything
  dsRipAmp *= 0.35 + 0.65 * dsNoise2(dsP / 30.0 + 9.0);
#endif
dsTone += dsRip * dsRipAmp;

// --- sparse dark specks (pebbles / nodules), one candidate per cell
vec2 dsCell = dsP / ${glf(SEABED.speckCell)};
vec2 dsId = floor(dsCell);
vec2 dsOff = (vec2(dsHash2(dsId + 7.1), dsHash2(dsId + 13.7)) - 0.5) * 0.6;
float dsRad = 0.06 + 0.10 * dsHash2(dsId + 3.3);          // radius in cell units
float dsAA = max(dsFoot / ${glf(SEABED.speckCell)}, 0.01);
float dsSpeck = step(${glf(1 - SEABED.speckDensity)}, dsHash2(dsId))
  * (1.0 - smoothstep(dsRad - dsAA, dsRad + dsAA, length(fract(dsCell) - 0.5 - dsOff)))
  * dsFilter(dsFoot, 0.25);

// --- per-piece scour, berm ring and debris stain field
float dsScour = 0.0;
float dsBerm = 0.0;
float dsField = 0.0;
float dsEdge = (dsNoise2(dsP / 25.0 + 3.9) - 0.5) * 0.18;  // irregular outlines
for (int i = 0; i < ${MAX_PIECES}; i++) {
  if (i >= uDsPieceCount) break;
  vec4 dsPc = uDsPieces[i];
  float dsD = length(dsP - dsPc.xy) / max(dsPc.z, 1.0) + dsEdge;
  dsScour = max(dsScour, dsPc.w * (1.0 - smoothstep(0.35, 1.0, dsD)));
  float dsB = (dsD - ${glf(SEABED.bermCentre)}) / ${glf(SEABED.bermWidth)};
  dsBerm = max(dsBerm, dsPc.w * exp(-dsB * dsB));
  dsField = max(dsField, dsPc.w * (1.0 - smoothstep(1.0, ${glf(SEABED.fieldExtent)}, dsD)));
}
dsScour = clamp(dsScour, 0.0, 1.0);
dsBerm = clamp(dsBerm, 0.0, 1.0);
dsField = clamp(dsField, 0.0, 1.0);

// --- sparse rust-brown specks inside the debris field (illustrative stain)
vec2 dsCellR = dsP / ${glf(SEABED.fieldCell)} + 31.4;
vec2 dsIdR = floor(dsCellR);
vec2 dsOffR = (vec2(dsHash2(dsIdR + 2.7), dsHash2(dsIdR + 19.1)) - 0.5) * 0.6;
float dsRadR = 0.07 + 0.13 * dsHash2(dsIdR + 5.9);
float dsAAR = max(dsFoot / ${glf(SEABED.fieldCell)}, 0.01);
float dsRustSpeck = step(1.0 - ${glf(SEABED.fieldDensity)} * dsField, dsHash2(dsIdR))
  * (1.0 - smoothstep(dsRadR - dsAAR, dsRadR + dsAAR, length(fract(dsCellR) - 0.5 - dsOffR)))
  * dsFilter(dsFoot, 0.45);

// --- compose (tone only). The scour is a single large landmark, not a
// repeating pattern, so it is kept at distance; everything else fades flat.
float dsShade = 1.0 + dsTone * dsNear;
dsShade *= 1.0 - ${glf(SEABED.scourDarken)} * dsScour;
dsShade += ${glf(SEABED.bermLift)} * dsBerm * dsNear;
vec3 dsAlb = diffuseColor.rgb * dsShade;
// very faint warm cast across the debris field so it reads as one area
dsAlb = mix(dsAlb, dsAlb * vec3(1.03, 0.97, 0.92), 0.5 * dsField);
dsAlb = mix(dsAlb, dsAlb * ${glf(SEABED.speckDarken)}, dsSpeck * dsNear);
dsAlb = mix(dsAlb, ${glv3(SEABED.rust)}, 0.8 * dsRustSpeck * dsNear);
diffuseColor.rgb = dsAlb;
`;

  /* Before <normal_fragment_begin> (present in both; after roughnessFactor
   * has been declared in Standard). */
  const fragRough = /* glsl */ `
#ifdef STANDARD
  // disturbed sediment slightly rougher, nodules slightly smoother (subtle)
  roughnessFactor = clamp(roughnessFactor + dsTone * 0.2 * dsNear - dsSpeck * 0.15 * dsNear, 0.6, 1.0);
#endif
`;

  /* After <lights_fragment_end>: illustrative survey-light pools + floor.
   * Added as diffuse light multiplied by albedo, so the sediment patterns
   * remain visible inside the pool (not emissive-flat). */
  const fragLight = /* glsl */ `
{
  float dsPool = 0.0;
  for (int i = 0; i < ${MAX_LAMPS}; i++) {
    if (i >= uDsLampCount) break;
    vec4 dsLp = uDsLamps[i];
    float dsR = max(dsLp.w, 1.0);
    vec3 dsV = dsLp.xyz - vDsModel;
    float dsFall = 1.0 - smoothstep(0.0, 1.0, length(dsV.xy) / dsR); // 0 at pool edge
    dsFall *= dsFall;                                                // soft shoulder
    float dsH = max(dsV.z, 0.0) / dsR;                               // lamp height above ground
    dsPool += dsFall / (1.0 + ${glf(SEABED.poolHeightK)} * dsH * dsH);
  }
  dsPool = min(dsPool, 1.0); // overlapping pools never blow out
  reflectedLight.directDiffuse += diffuseColor.rgb * ${glv3(SEABED.poolColor)} * (dsPool * uDsStrength * ${glf(SEABED.poolGain)});
  reflectedLight.indirectDiffuse += diffuseColor.rgb * ${glv3(SEABED.floorColor)} * ${glf(SEABED.floorGain)};
}
`;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    let vs = shader.vertexShader;
    vs = inject(vs, '#include <common>', GLSL_VERT_PARS);
    vs = inject(vs, '#include <project_vertex>', GLSL_VERT_MAIN);
    shader.vertexShader = vs;
    let fs = shader.fragmentShader;
    fs = inject(fs, '#include <common>', fragPars);
    fs = inject(fs, '#include <color_fragment>', fragColor);
    fs = inject(fs, '#include <normal_fragment_begin>', fragRough, true);
    fs = inject(fs, '#include <lights_fragment_end>', fragLight);
    shader.fragmentShader = fs;
  };
  material.customProgramCacheKey = () => 'ds-seabed-v1-' + (lightweight ? 'phong' : 'std');

  const handle = {
    material,
    /** list: up to 8 of { x, y, radius, strength } in MODEL coordinates. */
    setPieces(list) {
      const n = Math.min(list ? list.length : 0, MAX_PIECES);
      for (let i = 0; i < n; i++) {
        const p = list[i];
        pieces[i].set(
          num(p.x, 0), num(p.y, 0),
          Math.max(num(p.radius, 1), 1),
          Math.min(Math.max(num(p.strength, 1), 0), 1));
      }
      uniforms.uDsPieceCount.value = n;
    },
    /** list: up to 4 of { x, y, z, radius } in MODEL coordinates. */
    setLamps(list) {
      const n = Math.min(list ? list.length : 0, MAX_LAMPS);
      for (let i = 0; i < n; i++) {
        const l = list[i];
        lamps[i].set(num(l.x, 0), num(l.y, 0), num(l.z, 0), Math.max(num(l.radius, 1), 1));
      }
      uniforms.uDsLampCount.value = n;
    },
    /** Scale the light pools, 0..1. */
    setStrength(v) {
      uniforms.uDsStrength.value = Math.min(Math.max(num(v, 1), 0), 1);
    },
    /** Call whenever root.matrixWorld changes (allocation-free). */
    update(rootMatrixWorld) {
      uniforms.uDsModelInv.value.copy(rootMatrixWorld).invert();
    },
    dispose() {
      material.dispose();
      _disposers.delete(handle.dispose);
    },
  };
  _disposers.add(handle.dispose);
  return handle;
}

/* ===========================================================================
 * 2. Water column (camera-centred background dome)
 * ======================================================================== */

/* --- authored water-column constants ------------------------------------ */
const WATER = {
  /** Dome radius (m). Only nominal: the dome is drawn camera-centred. */
  radius: 6000,
  /** Looking straight down: very dark blue-black. */
  below: new THREE.Color(0x020509),
  /** Looking straight up: slightly lighter deep teal-blue (still dark). */
  above: new THREE.Color(0x081a27),
  /** Angular half-width (in sin-of-elevation units) of the horizontal haze
   *  band. Wide and faint: it only exists so silhouettes separate. */
  hazeWidth: 0.26,
  /** Amplitude of the slow particulate dither (fraction of colour). */
  ditherAmp: 0.05,
};

export function createWaterColumn() {
  const geometry = new THREE.SphereGeometry(WATER.radius, 24, 16);
  const uniforms = {
    uFog: { value: DEEP_FOG.clone() },
    uBelow: { value: WATER.below.clone() },
    uAbove: { value: WATER.above.clone() },
  };

  const material = new THREE.ShaderMaterial({
    name: 'DeepSeaWaterColumn',
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    toneMapped: false, // three applies scene fog un-tone-mapped; match it
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position; // world direction (dome is never rotated)
        // camera-centred like a sky dome: rotation only, no translation
        gl_Position = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
        // keep well inside the clip volume whatever the camera far plane is
        gl_Position.z = 0.5 * gl_Position.w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uFog;
      uniform vec3 uBelow;
      uniform vec3 uAbove;
      varying vec3 vDir;

      float wcHash3(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.zyx + 31.32);
        return fract((p.x + p.y) * p.z);
      }
      float wcNoise3(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(wcHash3(i), wcHash3(i + vec3(1.0, 0.0, 0.0)), u.x),
              mix(wcHash3(i + vec3(0.0, 1.0, 0.0)), wcHash3(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
          mix(mix(wcHash3(i + vec3(0.0, 0.0, 1.0)), wcHash3(i + vec3(1.0, 0.0, 1.0)), u.x),
              mix(wcHash3(i + vec3(0.0, 1.0, 1.0)), wcHash3(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
          u.z);
      }

      void main() {
        vec3 d = normalize(vDir);
        float y = d.y; // sin(elevation): -1 down, 0 horizontal, +1 up

        // authored vertical gradient: blue-black below -> deep teal-blue above
        vec3 col = mix(uBelow, uAbove, smoothstep(-0.75, 0.85, y));

        // faint wide haze around the horizontal; equals the fog colour exactly
        // at y = 0 so fogged geometry meets the background without a seam
        float haze = exp(-(y * y) / ${glf(WATER.hazeWidth * WATER.hazeWidth)});
        col = mix(col, uFog, haze);

        // extremely subtle slow-scale particulate dither, filtered by footprint
        // and removed at the horizontal (keeps the fog match exact)
        float foot = max(length(dFdx(d)), length(dFdy(d)));
        float n = wcNoise3(d * 9.0 + 3.1) * 0.65
                + wcNoise3(d * 27.0 + 8.7) * 0.35 * (1.0 - smoothstep(0.25, 0.7, foot * 27.0));
        col *= 1.0 + (n - 0.5) * ${glf(WATER.ditherAmp)} * (1.0 - haze);

        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        // static sub-LSB screen dither against banding in the dark gradient
        gl_FragColor.rgb += (wcHash3(vec3(gl_FragCoord.xy, 1.7)) - 0.5) / 255.0;
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'DeepSeaWaterColumn';
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;

  let wanted = true;
  let underwater = true;

  const handle = {
    mesh,
    /** cameraWorldY > 0 (above the surface) hides the dome. Optional second
     *  argument: the live fog colour, if the caller does not use DEEP_FOG. */
    update(cameraWorldY, fogColor) {
      underwater = !(cameraWorldY > 0);
      mesh.visible = wanted && underwater;
      if (fogColor && fogColor.isColor) uniforms.uFog.value.copy(fogColor);
    },
    setVisible(v) {
      wanted = !!v;
      mesh.visible = wanted && underwater;
    },
    dispose() {
      if (mesh.parent) mesh.parent.remove(mesh);
      geometry.dispose();
      material.dispose();
      _disposers.delete(handle.dispose);
    },
  };
  _disposers.add(handle.dispose);
  return handle;
}

/* ===========================================================================
 * 3. Marine snow
 * ======================================================================== */

/* --- authored marine-snow constants ------------------------------------- */
const SNOW = {
  /** Edge of the camera-centred wrap box (m). */
  box: 120,
  /** Fall per time-bar unit (m): a slow, calm drift. */
  fallPerT: 0.8,
  /** Lateral sway amplitude (m), a pure function of t. */
  sway: 0.8,
  /** Point size = clamp(sizeRef * seed / distance, 1, 3) px: never above 3. */
  sizeRef: 30,
  /** Maximum alpha of any particle (spec: <= 0.35). */
  maxAlpha: 0.35,
  /** Pale blue-grey particle colour. */
  color: new THREE.Color(0xb9c9d2),
  /** Fixed PRNG seed: the field is identical on every load. */
  seed: 19120415,
};

/** Small deterministic PRNG (mulberry32). */
function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMarineSnow({ count = 400 } = {}) {
  const n = Math.max(1, Math.floor(num(count, 400)));
  const rand = mulberry32(SNOW.seed);
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = rand() * SNOW.box;
    pos[i * 3 + 1] = rand() * SNOW.box;
    pos[i * 3 + 2] = rand() * SNOW.box;
    seed[i * 4] = rand();     // fall-speed variation
    seed[i * 4 + 1] = rand(); // sway phase
    seed[i * 4 + 2] = rand(); // size variation
    seed[i * 4 + 3] = rand(); // alpha variation
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uCam: { value: new THREE.Vector3() },
      uT: { value: 0 },
      uColor: { value: SNOW.color.clone() },
    },
  ]);

  const material = new THREE.ShaderMaterial({
    name: 'DeepSeaMarineSnow',
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    fog: true,
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform vec3 uCam;
      uniform float uT;
      varying float vAlpha;
      #include <fog_pars_vertex>
      void main() {
        const float BOX = ${glf(SNOW.box)};
        vec3 p = position;
        // slow fall and sway: pure functions of the caller's t and fixed seeds
        p.y -= uT * ${glf(SNOW.fallPerT)} * (0.6 + 0.8 * aSeed.x);
        float ph = aSeed.y * 6.2831853;
        p.x += sin(uT * 0.21 + ph) * ${glf(SNOW.sway)};
        p.z += cos(uT * 0.17 + ph * 1.7) * ${glf(SNOW.sway)};
        // wrap around the camera in world space
        vec3 rel = mod(p - uCam, BOX) - 0.5 * BOX;
        vec4 mvPosition = viewMatrix * vec4(uCam + rel, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        float dist = length(rel);
        // tiny dots: 1..3 px, never larger
        gl_PointSize = clamp(${glf(SNOW.sizeRef)} * (0.6 + 0.8 * aSeed.z) / max(dist, 0.001), 1.0, 3.0);
        // fade at the box faces (no popping on wrap) and right at the lens
        vec3 a = abs(rel) / (0.5 * BOX);
        float edge = 1.0 - smoothstep(0.7, 1.0, max(a.x, max(a.y, a.z)));
        vAlpha = ${glf(SNOW.maxAlpha)} * (0.4 + 0.6 * aSeed.w) * edge * smoothstep(1.5, 6.0, dist);
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      #include <fog_pars_fragment>
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = vAlpha * (1.0 - smoothstep(0.2, 1.0, r)); // soft dot
        if (a < 0.002) discard;
        gl_FragColor = vec4(uColor, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
        #ifdef USE_FOG
          gl_FragColor.a *= 1.0 - fogFactor; // dissolve into the fog as well
        #endif
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'DeepSeaMarineSnow';
  points.frustumCulled = false; // positions are wrapped in the shader
  points.matrixAutoUpdate = false;
  points.visible = false;

  const handle = {
    points,
    /** cameraWorldPosition: THREE.Vector3 (world); t: time-bar 0..100. */
    update(cameraWorldPosition, t, visible) {
      points.visible = !!visible;
      if (!points.visible) return;
      uniforms.uCam.value.copy(cameraWorldPosition);
      uniforms.uT.value = num(t, 0);
    },
    dispose() {
      if (points.parent) points.parent.remove(points);
      geometry.dispose();
      material.dispose();
      _disposers.delete(handle.dispose);
    },
  };
  _disposers.add(handle.dispose);
  return handle;
}

/* ===========================================================================
 * 4. Wreck surface weathering (patch for MeshToonMaterial)
 * ======================================================================== */

/* --- authored weathering constants -------------------------------------- */
const RUST = {
  /** Streak width in the horizontal plane (m) and length in z (m). */
  streakWidth: 0.45,
  streakLength: 9.0,
  /** Streak colour: dark orange-brown. */
  streakColor: new THREE.Color(0x6a3418),
  /** Maximum blend of a streak at full rust. */
  streakMix: 0.5,
  /** Patch size (m) and breakup size (m). */
  patchSize: 3.0,
  patchBreakup: 0.8,
  /** Patch colour: muted orange-brown. */
  patchColor: new THREE.Color(0x8a4a24),
  /** Maximum blend of a patch at full rust. */
  patchMix: 0.45,
  /** Darkening at the very bottom of the hull at full rust. */
  lowDarken: 0.22,
  /** Default model z of the hull base (seabed) and the height (m) over
   *  which the lower-hull darkening fades out. */
  baseZ: -3800,
  hullHeight: 30,
};

export function patchWreckSurface(material, { lightweight = false, baseZ = RUST.baseZ, hullHeight = RUST.hullHeight } = {}) {
  if (material.userData && material.userData.dsWreckHandle) return material.userData.dsWreckHandle;

  const uniforms = {
    uDsModelInv: { value: new THREE.Matrix4() },
    uDsRust: { value: 0 },
    uDsOn: { value: 1 },
    uDsHull: { value: new THREE.Vector2(num(baseZ, RUST.baseZ), Math.max(num(hullHeight, RUST.hullHeight), 1)) },
  };

  const fragPars = /* glsl */ `
${lightweight ? '#define DS_LIGHT' : ''}
uniform float uDsRust;
uniform float uDsOn;
uniform vec2 uDsHull; // x = base z (m), y = fade height (m)
varying vec3 vDsModel;
varying vec3 vDsView;
${GLSL_NOISE}
`;

  /* After <color_fragment>: only diffuseColor.rgb is touched, so toon
   * banding, emissive tint, vertex colours and x-ray alpha stay intact. */
  const fragColor = /* glsl */ `
{
  vec3 dsP = vDsModel;
  // footprint computed outside any branch (derivatives stay well-defined)
  float dsFoot = max(length(dFdx(dsP)), length(dFdy(dsP)));
  float dsAmt = clamp(uDsRust, 0.0, 1.0) * uDsOn;
  if (dsAmt > 0.001) {
    // vertical streaks / drips: thin in plan, stretched in z
    float dsS = dsNoise3(vec3(dsP.xy / ${glf(RUST.streakWidth)}, dsP.z / ${glf(RUST.streakLength)}));
    float dsStreak = smoothstep(0.58, 0.82, dsS) * dsFilter(dsFoot, ${glf(RUST.streakWidth)});
    #ifndef DS_LIGHT
      // streaks gather in groups (5 m) instead of covering the hull evenly
      dsStreak *= smoothstep(0.30, 0.70, dsNoise3(dsP / 5.0 + 11.0));
    #endif

    // mottled orange-brown patches
    float dsN = dsNoise3(dsP / ${glf(RUST.patchSize)} + 4.7);
    #ifndef DS_LIGHT
      dsN = dsN * 0.75 + 0.125
          + (dsNoise3(dsP / ${glf(RUST.patchBreakup)} + 2.0) - 0.5) * 0.25 * dsFilter(dsFoot, ${glf(RUST.patchBreakup)});
    #endif
    float dsPatch = smoothstep(0.45, 0.75, dsN) * dsFilter(dsFoot, ${glf(RUST.patchSize)});

    // slight darkening toward the lower hull
    float dsLow = 1.0 - smoothstep(0.0, uDsHull.y, dsP.z - uDsHull.x);

    vec3 dsC = diffuseColor.rgb;
    vec3 dsRusted = mix(dsC * vec3(0.95, 0.62, 0.42), ${glv3(RUST.patchColor)}, 0.35);
    dsC = mix(dsC, dsRusted, dsPatch * ${glf(RUST.patchMix)} * dsAmt);
    dsC = mix(dsC, ${glv3(RUST.streakColor)}, dsStreak * ${glf(RUST.streakMix)} * dsAmt);
    dsC *= 1.0 - ${glf(RUST.lowDarken)} * dsLow * dsAmt;
    diffuseColor.rgb = dsC;
  }
}
`;

  const prevOBC = material.onBeforeCompile;
  const prevKey = material.customProgramCacheKey;
  const prevSrc = typeof prevOBC === 'function' ? prevOBC.toString() : '';
  const suffix = '|ds-wreck-v1-' + (lightweight ? 'lite' : 'full');

  const patchedOBC = function (shader, renderer) {
    if (typeof prevOBC === 'function') prevOBC.call(this, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
    let vs = shader.vertexShader;
    vs = inject(vs, '#include <common>', GLSL_VERT_PARS);
    vs = inject(vs, '#include <project_vertex>', GLSL_VERT_MAIN);
    shader.vertexShader = vs;
    let fs = shader.fragmentShader;
    fs = inject(fs, '#include <common>', fragPars);
    fs = inject(fs, '#include <color_fragment>', fragColor);
    shader.fragmentShader = fs;
  };
  const patchedKey = function () {
    // previous hook source is included so differently pre-patched materials
    // never share a program by accident
    const base = typeof prevKey === 'function' ? prevKey.call(this) : '';
    return base + '|' + prevSrc + suffix;
  };

  material.onBeforeCompile = patchedOBC;
  material.customProgramCacheKey = patchedKey;
  material.needsUpdate = true;

  const handle = {
    /** Call whenever root.matrixWorld changes (allocation-free). */
    update(rootMatrixWorld) {
      uniforms.uDsModelInv.value.copy(rootMatrixWorld).invert();
    },
    /** Weathering amount 0..1 (0 = as built, 1 = fully weathered). */
    setRust(v) {
      uniforms.uDsRust.value = Math.min(Math.max(num(v, 0), 0), 1);
    },
    /** false (blueprint mode) switches all weathering off. */
    setEnabled(b) {
      uniforms.uDsOn.value = b ? 1 : 0;
    },
    /** Optional extra: model z of the hull base and darkening fade height. */
    setHullBase(z, height) {
      uniforms.uDsHull.value.set(num(z, RUST.baseZ), Math.max(num(height, RUST.hullHeight), 1));
    },
    /** Restore the material's previous hooks (does not dispose the material). */
    dispose() {
      if (material.onBeforeCompile === patchedOBC) material.onBeforeCompile = prevOBC;
      if (material.customProgramCacheKey === patchedKey) material.customProgramCacheKey = prevKey;
      if (material.userData) delete material.userData.dsWreckHandle;
      material.needsUpdate = true;
      _disposers.delete(handle.dispose);
    },
  };
  if (material.userData) material.userData.dsWreckHandle = handle;
  _disposers.add(handle.dispose);
  return handle;
}
