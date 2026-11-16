// Fable 5.2 (claude-fable-5-2) specification-only module, 2026-11-16; reviewed and integrated by Claude Opus 5.5.
// No repository source files were sent to the model. Integration notes: docs/reviews/2026-11-16-notredame-titanic-art-pass/design-qa.md
/**
 * notredame-art-pass.js
 * -----------------------------------------------------------------------------
 * AUTHORED ILLUSTRATION ONLY. Everything in this module (stone coursing, joint
 * spacing, grime, lead seams, oak grain, parvis slabs, street / garden / quay /
 * river layout, tree positions and sizes, light colours) is hand-authored for a
 * calm, legible educational picture. No stone course heights were measured, no
 * site plan was surveyed, and nothing here claims photorealism or accuracy.
 *
 * three r180, WebGL2. Procedural GLSL only (no textures, no render targets,
 * no network). Nothing animates: every time-varying value is a caller-set uniform.
 *
 * Usage notes
 *  - patchLimestone / patchLead / patchOak chain onto an existing
 *    onBeforeCompile + customProgramCacheKey (previous pass runs first).
 *    Call handle.update(root.matrixWorld) whenever the root moves (once is
 *    enough for a static root). One art patch per material.
 *  - createCiteGround().mesh and createTrees().group are built in MODEL
 *    coordinates (z up, metres): add them to the rotated `root` group.
 *    The ground sits at z = -0.02, so hide the old flat ground plane.
 *  - Oak grain direction (documented choice): 'auto' = along z on near-vertical
 *    faces (posts, spire timbers), otherwise along the horizontal axis that the
 *    face normal leans toward (y for flat tops). Override per material with
 *    opts.grain = 'x' | 'y' | 'z' | THREE.Vector3 (model space) for beams/rafters.
 */
import * as THREE from 'three';

/* ============================================================================
 * Shared authored site constants (model metres) - used by ground GLSL and trees
 * ========================================================================== */
const SITE = {
  centre: [40, -40],              // ground plane centre
  size: [900, 700],               // ground plane extent
  groundZ: -0.02,                 // just below the cathedral's z = 0
  fadeR0: 205, fadeR1: 345,       // edge dissolve radii (widened at integration review: hard pale ring)
  parvis: [-200, -55, -66, 55],   // x0, y0, x1, y1
  footA: [-66, -15, 66, 15],      // nave + choir footprint box
  footB: [-2, -28, 12, 28],       // transept footprint box
  closeW: 6,                      // cathedral close ring width
  street: [-200, 33, 70, 45],     // north street roadway
  cityY: 45,                      // city-block ground begins north of this
  east: [70, -45, 185, 40],       // east garden
  eastR: 4,                       // east garden corner radius
  south: [-40, -48, 70, -18],     // south garden strip
  southR: 2,                      // south strip corner radius
  quay: [-200, -60, 185, -48],    // south quay roadway
  bankY: -62,                     // water south of this
  bankX: 195,                     // water east of this
  bankR: 25,                      // island-tip corner radius
  edgeW: 2,                       // stone quay edge width
  pathInset: 5,                   // east garden perimeter path inset
  pathHalf: 1.5,                  // east garden path half width
  axisY: -2,                      // east garden E-W axis path
  crossX: 128,                    // east garden N-S cross path
  rondR: 7,                       // gravel rond-point radius
  southPathY: -33,                // south strip path centreline
  southPathHalf: 1.25             // south strip path half width
};

/** Soft Paris daylight; keeps cream stone below clipping under ACES @ ~1.05. */
export const SUGGESTED_LIGHTS = {
  hemiSky: 0xdfe8f1,      // pale overcast-blue sky fill
  hemiGround: 0x8c8375,   // warm bounce from paving
  hemiIntensity: 0.95,
  sunColor: 0xfff1dc,     // slightly warm sun
  sunIntensity: 2.3
};

/* ============================================================================
 * GLSL library (all names prefixed nd / uNd / vNd)
 * ========================================================================== */
const glslLib = (octaves) => /* glsl */`
float ndHash(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float ndNoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(ndHash(i), ndHash(i + vec2(1.0, 0.0)), f.x),
             mix(ndHash(i + vec2(0.0, 1.0)), ndHash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float ndFbm(vec2 p){
  float a = 0.5;
  float s = 0.0;
  float n = 0.0;
  for (int i = 0; i < ${octaves}; i++){
    s += a * ndNoise(p);
    n += a;
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s / n;
}
// Box-filtered line at integer values of c. hw = half width, fw = fwidth, both
// in units of c. Thin lines lose energy and vanish as cells go sub-pixel.
float ndLine(float c, float hw, float fw){
  fw = max(fw, 1e-5);
  float d = abs(fract(c - 0.5) - 0.5);
  float cov = min(clamp((hw - d) / fw + 0.5, 0.0, 1.0), 2.0 * hw / fw);
  return cov * (1.0 - smoothstep(0.2, 0.5, fw));
}
float ndBox(vec2 p, vec2 lo, vec2 hi){
  vec2 d = abs(p - 0.5 * (lo + hi)) - 0.5 * (hi - lo);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
float ndMask(float sd, float aa){
  return 1.0 - smoothstep(-aa, aa, sd);
}
`;

const VERT_PARS = /* glsl */`
uniform mat4 uNdModelInv;
varying vec3 vNdPos;
varying vec3 vNdNrm;
`;

const VERT_MAIN = /* glsl */`
{
  vec4 ndLocal = vec4(transformed, 1.0);
  vec3 ndNormal = objectNormal;
  #ifdef USE_INSTANCING
    ndLocal = instanceMatrix * ndLocal;
    ndNormal = mat3(instanceMatrix) * ndNormal;
  #endif
  vNdPos = (uNdModelInv * modelMatrix * ndLocal).xyz;
  vNdNrm = normalize(mat3(uNdModelInv) * mat3(modelMatrix) * ndNormal);
}
`;

const FRAG_PARS = /* glsl */`
uniform float uNdFx;
uniform float uNdTint;
varying vec3 vNdPos;
varying vec3 vNdNrm;
float ndAux = 0.0;
`;

/* ============================================================================
 * Generic chained material patch
 * ========================================================================== */
const PATCHED = new WeakMap();

function installPatch(material, spec) {
  const existing = PATCHED.get(material);
  if (existing) {
    console.warn('[notredame-art-pass] material already has an art patch; reusing it.');
    return existing;
  }
  const lightweight = !!spec.lightweight;
  const uniforms = Object.assign({
    uNdModelInv: { value: new THREE.Matrix4() },
    uNdFx: { value: 1 },
    uNdTint: { value: spec.tint }
  }, spec.uniforms || {});

  const prevOBC = material.onBeforeCompile;
  const prevKey = material.customProgramCacheKey;
  const prevKeyIsCustom = prevKey !== THREE.Material.prototype.customProgramCacheKey;
  const suffix = '|nd-art:' + spec.key + (lightweight ? ':lw' : ':hq');
  const fragPars = glslLib(lightweight ? 2 : 3) + FRAG_PARS + (spec.fragPars || '');

  const onBeforeCompile = function (shader, renderer) {
    if (typeof prevOBC === 'function') prevOBC.call(this, shader, renderer);
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERT_PARS)
      .replace('#include <project_vertex>', '#include <project_vertex>\n' + VERT_MAIN);

    let fs = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + fragPars)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + spec.fragColor);
    if (spec.fragRough) {
      fs = fs.replace('#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\n#ifdef STANDARD\n' + spec.fragRough + '\n#endif\n');
    }
    if (spec.fragMetal) {
      fs = fs.replace('#include <metalnessmap_fragment>',
        '#include <metalnessmap_fragment>\n#ifdef STANDARD\n' + spec.fragMetal + '\n#endif\n');
    }
    if (spec.fragSpec) {
      fs = fs.replace('#include <specularmap_fragment>',
        '#include <specularmap_fragment>\n#ifndef STANDARD\n' + spec.fragSpec + '\n#endif\n');
    }
    shader.fragmentShader = fs;
  };

  const customProgramCacheKey = function () {
    const base = prevKeyIsCustom
      ? prevKey.call(this)
      : (typeof prevOBC === 'function' ? prevOBC.toString() : '');
    return base + suffix;
  };

  material.onBeforeCompile = onBeforeCompile;
  material.customProgramCacheKey = customProgramCacheKey;
  material.needsUpdate = true;

  const handle = {
    uniforms,
    /** Copy inverse(root.matrixWorld) into uNdModelInv. Allocation-free. */
    update(rootMatrixWorld) {
      uniforms.uNdModelInv.value.copy(rootMatrixWorld).invert();
    },
    setStyle(style) {
      uniforms.uNdFx.value = style === 'blueprint' ? 0 : 1;
    },
    dispose() {
      if (material.onBeforeCompile === onBeforeCompile) {
        material.onBeforeCompile = prevOBC;
        if (prevKeyIsCustom) material.customProgramCacheKey = prevKey;
        else delete material.customProgramCacheKey;
        material.needsUpdate = true;
      }
      PATCHED.delete(material);
    }
  };
  PATCHED.set(material, handle);
  return handle;
}

/* ============================================================================
 * 1. Limestone
 * ========================================================================== */
const LIMESTONE_FRAG = /* glsl */`
if (uNdFx > 0.5) {
  const float ND_COURSE = 0.55;   // authored ashlar course height (m)
  const float ND_LMIN = 0.9;      // shortest block length (m)
  const float ND_LMAX = 1.4;      // longest block length (m)
  const float ND_JOINT = 0.011;   // mortar half width (m)
  const float ND_GRIME_H = 6.0;   // ground grime height (m)
  const vec3 ND_STONE = vec3(0.718, 0.612, 0.401); // warm cream-ochre (linear)
  const vec3 ND_GRIME = vec3(0.60, 0.56, 0.50);    // soot multiplier

  vec3 ndP = vNdPos;
  vec3 ndA = abs(normalize(vNdNrm));
  vec3 ndW = fwidth(ndP);

  // Wall coursing: horizontal axis chosen from the model-space normal.
  bool ndAlongY = ndA.x > ndA.y;
  float ndU = ndAlongY ? ndP.y : ndP.x;
  float ndFu = ndAlongY ? ndW.y : ndW.x;
  float ndCz = ndP.z / ND_COURSE;
  float ndRow = floor(ndCz);
  float ndLen = mix(ND_LMIN, ND_LMAX, ndHash(vec2(ndRow, 3.7)));
  float ndCu = (ndU + ndHash(vec2(ndRow, 11.3)) * ndLen) / ndLen; // staggered
  float ndCol = floor(ndCu);
  float ndFz = ndW.z / ND_COURSE;
  float ndFuc = ndFu / ndLen;
  float ndJoint = max(ndLine(ndCz, ND_JOINT / ND_COURSE, ndFz),
                      ndLine(ndCu, ND_JOINT / ndLen, ndFuc));
  float ndBlockFade = 1.0 - smoothstep(0.25, 0.7, max(ndFz, ndFuc));
  float ndBlock = (ndHash(vec2(ndCol, ndRow) + (ndAlongY ? 57.0 : 0.0)) - 0.5)
                  * 0.10 * ndBlockFade;                            // +-5 % per block
  float ndLow = ndNoise(vec2(ndU * 0.11 + 5.0, ndP.z * 0.09));     // broad tone

  // Grime: ground band plus vertical streaks (noise stretched in z).
  float ndBase = (1.0 - smoothstep(0.0, ND_GRIME_H, ndP.z))
               * (0.55 + 0.45 * ndNoise(vec2(ndU * 0.4, ndP.z * 0.6)));
  float ndStreak = smoothstep(0.52, 0.85, ndFbm(vec2(ndU * 0.75, ndP.z * 0.055)));
  ndStreak *= 0.4 + 0.6 * ndNoise(vec2(ndU * 0.05 + 9.0, ndP.z * 0.16)); // height bands
  float ndGrime = clamp(ndBase * 0.7 + ndStreak * 0.45, 0.0, 1.0);

  // Near-horizontal faces: weathered paving-like top instead of courses.
  float ndTop = smoothstep(0.62, 0.78, ndA.z);
  vec2 ndPc = ndP.xy / 0.8;                                        // 0.8 m top slabs
  vec2 ndFp = ndW.xy / 0.8;
  float ndPj = max(ndLine(ndPc.x, 0.012, ndFp.x), ndLine(ndPc.y, 0.012, ndFp.y));
  float ndMott = ndFbm(ndP.xy * 0.35);
  float ndTopGrime = 0.2 + 0.45 * ndMott;

  float ndCleanK = 1.0 - 0.88 * uNdClean;                          // cleaning removes grime
  float ndG = mix(ndGrime, ndTopGrime, ndTop) * ndCleanK;

  vec3 ndC = mix(diffuseColor.rgb, ND_STONE, uNdTint);
  ndC *= mix(vec3(0.93, 0.915, 0.88), vec3(1.07, 1.06, 1.04), uNdClean);
  float ndWallMul = (1.0 + ndBlock + (ndLow - 0.5) * 0.06) * (1.0 - 0.20 * ndJoint);
  float ndTopMul = (1.0 + (ndMott - 0.5) * 0.10) * (1.0 - 0.10 * ndPj);
  ndC *= mix(ndWallMul, ndTopMul, ndTop);
  ndC *= mix(vec3(1.0), ND_GRIME, ndG);
  diffuseColor.rgb = ndC;
  ndAux = ndG;
}
`;

export function patchLimestone(material, { lightweight = false, tint = 0.35 } = {}) {
  const h = installPatch(material, {
    key: 'limestone',
    lightweight,
    tint,                                   // pull of base colour toward authored cream
    uniforms: { uNdClean: { value: 0 } },
    fragPars: 'uniform float uNdClean;\n',
    fragColor: LIMESTONE_FRAG,
    fragRough: 'roughnessFactor = clamp(roughnessFactor + 0.06 * ndAux, 0.0, 1.0);',
    fragSpec: 'specularStrength *= 1.0 - 0.5 * ndAux;'
  });
  return {
    update: h.update,
    setClean(v) { h.uniforms.uNdClean.value = Math.min(1, Math.max(0, +v || 0)); },
    setStyle: h.setStyle,
    dispose: h.dispose
  };
}

/* ============================================================================
 * 2. Lead roofing
 * ========================================================================== */
const LEAD_FRAG = /* glsl */`
if (uNdFx > 0.5) {
  const float ND_SEAM = 0.6;      // standing seam spacing (m)
  const float ND_WELT = 2.2;      // cross-welt spacing in height (m)
  const vec3 ND_LEAD = vec3(0.156, 0.190, 0.237);  // grey-blue lead (linear)
  const vec3 ND_OXIDE = vec3(0.515, 0.563, 0.579); // whitish oxidation

  vec3 ndP = vNdPos;
  vec3 ndA = abs(normalize(vNdNrm));
  vec3 ndW = fwidth(ndP);

  // Seams run down the slope: spaced along the ridge axis
  // (x for nave/choir where the normal leans in y, y for the transept).
  bool ndRidgeX = ndA.y >= ndA.x;
  float ndS = ndRidgeX ? ndP.x : ndP.y;
  float ndFs = (ndRidgeX ? ndW.x : ndW.y) / ND_SEAM;
  float ndCs = ndS / ND_SEAM;
  float ndBay = floor(ndCs);
  float ndSeam = ndLine(ndCs, 0.02 / ND_SEAM, ndFs);               // dark seam shadow
  float ndHl = ndLine(ndCs + 0.06, 0.03, ndFs);                    // lit seam flank
  float ndCq = ndP.z / ND_WELT + ndHash(vec2(ndBay, 4.0));         // staggered welts
  float ndFq = ndW.z / ND_WELT;
  float ndWelt = ndLine(ndCq, 0.012 / ND_WELT, ndFq);
  float ndSheetFade = 1.0 - smoothstep(0.25, 0.7, max(ndFs, ndFq));
  float ndSheet = (ndHash(vec2(ndBay, floor(ndCq)) + (ndRidgeX ? 0.0 : 31.0)) - 0.5)
                  * 0.08 * ndSheetFade;                            // +-4 % per sheet

  float ndPat = ndFbm(vec2(ndS * 0.18, ndP.z * 0.22) + 3.0);       // soft patina
  float ndOx = smoothstep(0.5, 0.85, ndFbm(vec2(ndS * 1.1, ndP.z * 0.07) + 20.0));

  vec3 ndC = mix(diffuseColor.rgb, ND_LEAD, uNdTint);
  ndC *= 1.0 + ndSheet + (ndPat - 0.5) * 0.12;
  ndC *= mix(vec3(1.0), vec3(0.93, 0.98, 1.06), ndPat * 0.6);      // bluish drift
  ndC = mix(ndC, ND_OXIDE, ndOx * 0.22);
  ndC *= (1.0 - 0.28 * ndSeam - 0.12 * ndWelt) * (1.0 + 0.10 * ndHl);
  diffuseColor.rgb = ndC;
  ndAux = mix(0.55, 0.75, clamp(ndPat * 0.6 + ndOx * 0.5, 0.0, 1.0)); // roughness
}
`;

export function patchLead(material, { lightweight = false, tint = 0.7 } = {}) {
  const h = installPatch(material, {
    key: 'lead',
    lightweight,
    tint,
    fragColor: LEAD_FRAG,
    fragRough: 'roughnessFactor = mix(roughnessFactor, ndAux, uNdFx);',
    fragMetal: 'metalnessFactor = mix(metalnessFactor, 0.3, uNdFx);',
    fragSpec: 'specularStrength *= mix(1.0, 1.3 - ndAux, uNdFx);'
  });
  return { update: h.update, setStyle: h.setStyle, dispose: h.dispose };
}

/* ============================================================================
 * 3. Fresh oak
 * ========================================================================== */
const OAK_FRAG = /* glsl */`
if (uNdFx > 0.5) {
  const vec3 ND_OAK = vec3(0.612, 0.388, 0.148);   // pale honey oak (linear)

  vec3 ndP = vNdPos;
  vec3 ndN = normalize(vNdNrm);
  vec3 ndA = abs(ndN);
  vec3 ndW = fwidth(ndP);

  // Grain axis: caller override, else z on vertical faces, else the horizontal
  // axis the normal leans toward (y for flat tops).
  vec3 ndGr;
  if (uNdGrain.w > 0.5) ndGr = uNdGrain.xyz;
  else if (ndA.z < 0.5) ndGr = vec3(0.0, 0.0, 1.0);
  else ndGr = ndA.x > ndA.y ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);

  vec3 ndTv = cross(ndN, ndGr);
  float ndTl = length(ndTv);
  float ndEnd = 1.0 - smoothstep(0.25, 0.6, ndTl);                 // end-grain faces
  ndTv = ndTl > 1e-3 ? ndTv / ndTl : vec3(1.0, 0.0, 0.0);
  float ndAl = dot(ndP, ndGr);                                     // along the grain
  float ndAc = dot(ndP, ndTv);                                     // across the grain
  float ndFal = dot(abs(ndGr), ndW);
  float ndFac = dot(abs(ndTv), ndW);
  float ndSide = 1.0 - ndEnd;

  float ndFine = ndFbm(vec2(ndAc * 34.0, ndAl * 1.1));             // ~3 cm grain lines
  float ndFineK = (1.0 - smoothstep(0.25, 0.8, ndFac * 34.0)) * ndSide;
  float ndBroad = ndFbm(vec2(ndAc * 6.0 + 13.0, ndAl * 0.22));     // broad figure
  float ndBroadK = (1.0 - smoothstep(0.25, 0.8, ndFac * 6.0)) * ndSide;

  // Occasional medullary flecks: short dark dashes in sparse patches.
  float ndFleck = smoothstep(0.80, 0.93, ndNoise(vec2(ndAc * 70.0, ndAl * 7.0)))
                * smoothstep(0.45, 0.7, ndNoise(vec2(ndAc * 3.0, ndAl * 0.8) + 40.0));
  ndFleck *= (1.0 - smoothstep(0.2, 0.6, ndFac * 70.0)) * ndSide;

  // Faint adze / hewing facets: ~24 x 10 cm staggered scallops.
  vec2 ndHc = vec2(ndAl / 0.24, ndAc / 0.10);
  ndHc.x += 0.5 * mod(floor(ndHc.y), 2.0);
  float ndFacetK = (1.0 - smoothstep(0.2, 0.6, max(ndFal / 0.24, ndFac / 0.10))) * ndSide;
  float ndFacet = ((ndHash(floor(ndHc)) - 0.5) * 0.045 + (fract(ndHc.x) - 0.5) * 0.03)
                  * ndFacetK;

  vec3 ndC = mix(diffuseColor.rgb, ND_OAK, uNdTint);
  ndC *= 1.0 + (ndFine - 0.5) * 0.16 * ndFineK + (ndBroad - 0.5) * 0.12 * ndBroadK + ndFacet;
  ndC = mix(ndC, ndC * vec3(0.62, 0.52, 0.42), ndFleck * 0.55);
  ndC *= mix(1.0, 0.86 + 0.08 * ndNoise(ndP.xy * 9.0 + ndP.z * 5.0), ndEnd);
  diffuseColor.rgb = ndC;
}
`;

export function patchOak(material, { lightweight = false, tint = 0.7, grain = 'auto' } = {}) {
  const g = new THREE.Vector4(0, 0, 1, 0);       // w = 0 -> auto rule
  if (grain === 'x') g.set(1, 0, 0, 1);
  else if (grain === 'y') g.set(0, 1, 0, 1);
  else if (grain === 'z') g.set(0, 0, 1, 1);
  else if (grain && grain.isVector3 && grain.lengthSq() > 0) {
    const l = grain.length();
    g.set(grain.x / l, grain.y / l, grain.z / l, 1);
  }
  const h = installPatch(material, {
    key: 'oak',
    lightweight,
    tint,
    uniforms: { uNdGrain: { value: g } },
    fragPars: 'uniform vec4 uNdGrain;\n',
    fragColor: OAK_FRAG,
    fragRough: 'roughnessFactor = mix(roughnessFactor, 0.82, uNdFx);',
    fragSpec: 'specularStrength *= mix(1.0, 0.35, uNdFx);'
  });
  return { update: h.update, setStyle: h.setStyle, dispose: h.dispose };
}

/* ============================================================================
 * 4. Île de la Cité ground
 * ========================================================================== */
const F = (n) => '(' + Number(n).toFixed(3) + ')';
const V2 = (x, y) => 'vec2(' + F(x) + ', ' + F(y) + ')';
const BOX = (b, inset = 0) =>
  V2(b[0] + inset, b[1] + inset) + ', ' + V2(b[2] - inset, b[3] - inset);

const GROUND_FRAG = /* glsl */`
if (uNdFx > 0.5) {
  // Authored flat tones (linear).
  const vec3 ND_ISLAND = vec3(0.515, 0.471, 0.388);  // neutral island paving
  const vec3 ND_CITY = vec3(0.330, 0.312, 0.286);    // city-block ground (darker at integration review)
  const vec3 ND_PARVIS = vec3(0.612, 0.547, 0.414);  // pale limestone slabs
  const vec3 ND_CLOSE = vec3(0.681, 0.612, 0.471);   // light gravel close
  const vec3 ND_ASPHALT = vec3(0.148, 0.148, 0.156); // roadway
  const vec3 ND_KERB = vec3(0.579, 0.547, 0.485);    // pale kerb stone
  const vec3 ND_LAWN = vec3(0.133, 0.218, 0.071);    // muted green
  const vec3 ND_GRAVEL = vec3(0.612, 0.547, 0.401);  // garden paths
  const vec3 ND_EDGE = vec3(0.646, 0.595, 0.485);    // quay edge stone
  const vec3 ND_WATER = vec3(0.106, 0.156, 0.133);   // calm grey-green Seine

  vec2 ndP = vNdG.xy;
  vec2 ndW = fwidth(ndP);
  float ndPx = max(ndW.x, ndW.y);
  float ndAa = max(ndPx, 0.12);                                    // soft region edges
  float ndDet = 1.0 - smoothstep(140.0, 480.0, length(vViewPosition)); // distance fade
  float ndFineK = ndDet * (1.0 - smoothstep(0.4, 1.2, ndPx));
  float ndN1 = ndFbm(ndP * 0.045);                                 // ~20 m mottling
  float ndN2 = ndFbm(ndP * 0.6 + 7.0);                             // ~1.5 m mottling

  // Base island ground, then city blocks to the north.
  vec3 ndC = ND_ISLAND * (1.0 + (ndN1 - 0.5) * 0.06 * ndDet);
  vec2 ndGc = (ndP - vec2(10.0, 25.0)) / 40.0;                     // 40 m block grid
  float ndGrid = max(ndLine(ndGc.x, 1.5 / 40.0, ndW.x / 40.0),
                     ndLine(ndGc.y, 1.5 / 40.0, ndW.y / 40.0));
  vec3 ndCity = ND_CITY * (1.0 - 0.07 * ndGrid * ndDet) * (1.0 + (ndN1 - 0.5) * 0.04 * ndDet);
  ndC = mix(ndC, ndCity, smoothstep(-ndAa, ndAa, ndP.y - ${F(SITE.cityY)}));

  // Parvis: 1.2 m slabs plus a few darker bands.
  float ndParvis = ndMask(ndBox(ndP, ${BOX(SITE.parvis)}), ndAa);
  vec2 ndSc = ndP / 1.2;
  vec2 ndFsc = ndW / 1.2;
  float ndSj = max(ndLine(ndSc.x, 0.012, ndFsc.x), ndLine(ndSc.y, 0.012, ndFsc.y));
  float ndSlab = (ndHash(floor(ndSc)) - 0.5) * 0.06
               * (1.0 - smoothstep(0.25, 0.7, max(ndFsc.x, ndFsc.y)));
  float ndBands = max(ndLine(ndP.x / 21.6, 0.6 / 21.6, ndW.x / 21.6),
                      ndLine(ndP.y / 38.4 - 0.5, 0.6 / 38.4, ndW.y / 38.4));
  vec3 ndPv = ND_PARVIS * (1.0 + ndSlab * ndDet + (ndN1 - 0.5) * 0.05 * ndDet)
            * (1.0 - 0.10 * ndSj * ndDet) * (1.0 - 0.08 * ndBands * ndDet);
  ndC = mix(ndC, ndPv, ndParvis);

  // Gardens: lawn with faint diagonal mown stripes, gravel paths.
  float ndSdE = ndBox(ndP, ${BOX(SITE.east, SITE.eastR)}) - ${F(SITE.eastR)};
  float ndSdS = ndBox(ndP, ${BOX(SITE.south, SITE.southR)}) - ${F(SITE.southR)};
  float ndInE = ndMask(ndSdE, ndAa);
  float ndInS = ndMask(ndSdS, ndAa);
  float ndStripe = sin(dot(ndP, vec2(0.8, 0.6)) * 1.9635)          // 3.2 m period
                 * 0.012 * ndDet * (1.0 - smoothstep(0.3, 1.0, ndPx / 1.6));
  vec3 ndLawn = ND_LAWN * (1.0 + (ndN1 - 0.5) * 0.22 * ndDet
                               + (ndN2 - 0.5) * 0.10 * ndFineK + ndStripe);
  ndC = mix(ndC, ndLawn, max(ndInE, ndInS));
  float ndPe = min(min(abs(ndSdE + ${F(SITE.pathInset)}) - ${F(SITE.pathHalf)},
                       abs(ndP.y - ${F(SITE.axisY)}) - ${F(SITE.pathHalf)}),
                   min(abs(ndP.x - ${F(SITE.crossX)}) - ${F(SITE.pathHalf)},
                       length(ndP - ${V2(SITE.crossX, SITE.axisY)}) - ${F(SITE.rondR)}));
  float ndPs = abs(ndP.y - ${F(SITE.southPathY)}) - ${F(SITE.southPathHalf)};
  float ndPath = max(ndMask(ndPe, ndAa) * ndInE, ndMask(ndPs, ndAa) * ndInS);
  vec3 ndGravel = ND_GRAVEL * (1.0 + (ndN2 - 0.5) * 0.08 * ndFineK);
  ndC = mix(ndC, ndGravel, ndPath);

  // Cathedral close: light gravel ring around the approximate footprint.
  float ndSdF = min(ndBox(ndP, ${BOX(SITE.footA)}), ndBox(ndP, ${BOX(SITE.footB)}));
  vec3 ndClose = ND_CLOSE * (1.0 + (ndN2 - 0.5) * 0.07 * ndFineK);
  ndC = mix(ndC, ndClose, ndMask(ndSdF - ${F(SITE.closeW)}, max(ndAa, 0.6)));

  // Roadways (north street, south quay) with pale kerbs.
  float ndSdN = ndBox(ndP, ${BOX(SITE.street)});
  float ndSdQ = ndBox(ndP, ${BOX(SITE.quay)});
  float ndSdR = min(ndSdN, ndSdQ);
  vec3 ndRoad = ND_ASPHALT * (1.0 + (ndN2 - 0.5) * 0.07 * ndFineK + (ndN1 - 0.5) * 0.05 * ndDet);
  ndC = mix(ndC, ndRoad, ndMask(ndSdR, ndAa));
  float ndKerb = (1.0 - smoothstep(0.25 - ndAa, 0.25 + ndAa, abs(ndSdR)))
               * min(1.0, 0.5 / ndAa);
  ndC = mix(ndC, ND_KERB, ndKerb);

  // Quay edge and Seine (south side and round the eastern tip).
  vec2 ndQ = vec2(ndP.x - ${F(SITE.bankX - SITE.bankR)}, ${F(SITE.bankY + SITE.bankR)} - ndP.y);
  float ndSdL = length(max(ndQ, 0.0)) + min(max(ndQ.x, ndQ.y), 0.0) - ${F(SITE.bankR)};
  float ndEj = ndLine(ndP.x / 3.0, 0.02 / 3.0, ndW.x / 3.0);       // 3 m coping stones
  vec3 ndEdge = ND_EDGE * (1.0 - 0.10 * ndEj * ndDet);
  ndC = mix(ndC, ndEdge, 1.0 - ndMask(ndSdL + ${F(SITE.edgeW)}, ndAa));
  float ndRip = ndFbm(vec2(ndP.x * 0.018, ndP.y * 0.07) + 11.0);   // static ripple tone
  vec3 ndWc = ND_WATER * (1.0 + (ndRip - 0.5) * 0.10 * ndDet);
  ndWc *= 1.0 - 0.18 * (1.0 - smoothstep(0.0, 2.5, ndSdL));        // shade under the wall
  float ndWm = 1.0 - ndMask(ndSdL, ndAa);
  ndC = mix(ndC, ndWc, ndWm);

  diffuseColor.rgb = ndC;
  ndAux = ndWm;
} else {
  diffuseColor.rgb = uNdFlat;
  ndAux = 0.0;
}
`;

const GROUND_FOG = /* glsl */`
#ifdef USE_FOG
{
  float ndEdgeFade = smoothstep(${F(SITE.fadeR0)}, ${F(SITE.fadeR1)},
                                length(vNdG.xy - ${V2(SITE.centre[0], SITE.centre[1])}));
  gl_FragColor.rgb = mix(gl_FragColor.rgb,
                         linearToOutputTexel(vec4(fogColor, 1.0)).rgb, ndEdgeFade);
}
#endif
`;

export function createCiteGround({ lightweight = false } = {}) {
  const geometry = new THREE.PlaneGeometry(SITE.size[0], SITE.size[1], 1, 1);
  // Bake the offset so local coordinates ARE model coordinates.
  geometry.translate(SITE.centre[0], SITE.centre[1], SITE.groundZ);

  const material = lightweight
    ? new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x2a2f2d, shininess: 40 })
    : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });

  const uniforms = {
    uNdFx: { value: 1 },
    uNdFlat: { value: new THREE.Color('#152639') }   // blueprint ground
  };
  const fragPars = glslLib(lightweight ? 2 : 3) + /* glsl */`
uniform float uNdFx;
uniform vec3 uNdFlat;
varying vec3 vNdG;
float ndAux = 0.0;
`;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vNdG;\n')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvNdG = transformed;\n');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + fragPars)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + GROUND_FRAG)
      .replace('#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\n#ifdef STANDARD\n' +
        'roughnessFactor = mix(0.95, 0.35, ndAux);\n#endif\n')       // glossier water
      .replace('#include <specularmap_fragment>',
        '#include <specularmap_fragment>\n#ifndef STANDARD\n' +
        'specularStrength = ndAux;\n#endif\n')                       // specular on water only
      .replace('#include <fog_fragment>', '#include <fog_fragment>\n' + GROUND_FOG);
  };
  material.customProgramCacheKey = () => 'nd-art:cite-ground' + (lightweight ? ':lw' : ':hq');

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'nd-cite-ground';
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  return {
    mesh,
    setStyle(style) { uniforms.uNdFx.value = style === 'blueprint' ? 0 : 1; },
    dispose() {
      if (mesh.parent) mesh.parent.remove(mesh);
      geometry.dispose();
      material.dispose();
    }
  };
}

/* ============================================================================
 * 5. Trees
 * ========================================================================== */
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sdBox(x, y, b, inset = 0) {
  const cx = (b[0] + b[2]) * 0.5, cy = (b[1] + b[3]) * 0.5;
  const dx = Math.abs(x - cx) - ((b[2] - b[0]) * 0.5 - inset);
  const dy = Math.abs(y - cy) - ((b[3] - b[1]) * 0.5 - inset);
  const ox = Math.max(dx, 0), oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0);
}
const footSd = (x, y) => Math.min(sdBox(x, y, SITE.footA), sdBox(x, y, SITE.footB));
const eastSd = (x, y) => sdBox(x, y, SITE.east, SITE.eastR) - SITE.eastR;
const southSd = (x, y) => sdBox(x, y, SITE.south, SITE.southR) - SITE.southR;

/** Signed distance to the nearest gravel path (mirrors the ground GLSL). */
function pathSd(x, y) {
  let d = Infinity;
  const e = eastSd(x, y);
  if (e < 0) {
    d = Math.min(
      Math.abs(e + SITE.pathInset) - SITE.pathHalf,
      Math.abs(y - SITE.axisY) - SITE.pathHalf,
      Math.abs(x - SITE.crossX) - SITE.pathHalf,
      Math.hypot(x - SITE.crossX, y - SITE.axisY) - SITE.rondR
    );
  }
  if (southSd(x, y) < 0) {
    d = Math.min(d, Math.abs(y - SITE.southPathY) - SITE.southPathHalf);
  }
  return d;
}

/** Merge a few squashed icosahedra into one non-indexed crown geometry. */
function buildCrownGeometry(blobs, detail) {
  const parts = [];
  let total = 0;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const e = new THREE.Euler();
  for (const b of blobs) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    q.setFromEuler(e.set(b.r[0], b.r[1], b.r[2]));
    m.compose(p.set(b.p[0], b.p[1], b.p[2]), q, s.set(b.s[0], b.s[1], b.s[2]));
    g.applyMatrix4(m);
    parts.push(g);
    total += g.attributes.position.count;
  }
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

export function createTrees({ lightweight = false } = {}) {
  const rand = mulberry32(20241208);                 // fixed seed -> deterministic
  const N_ROW = lightweight ? 5 : 10;                // parvis north row
  const N_EAST = lightweight ? 17 : 34;              // east garden
  const N_SOUTH = lightweight ? 8 : 16;              // south garden strip
  const FOOT_CLEAR = 8;                              // trunk clearance (>= footprint + 4 m)
  const PATH_CLEAR = 2.2;                            // trunk clearance from gravel paths

  const trees = [];
  const farEnough = (x, y, gap) => {
    for (let i = 0; i < trees.length; i++) {
      if (Math.hypot(trees[i].x - x, trees[i].y - y) < gap) return false;
    }
    return true;
  };
  const addTree = (x, y) => {
    trees.push({
      x, y,
      h: 12 + rand() * 8,                            // total height 12-20 m
      w: 7 + rand() * 5,                             // crown width 7-12 m
      rot: rand() * Math.PI * 2,
      hue: rand(), val: rand(), sat: rand()
    });
  };

  // Single row along the north edge of the parvis.
  const rowY = SITE.parvis[3] - 5;
  for (let i = 0; i < N_ROW; i++) {
    const t = N_ROW > 1 ? i / (N_ROW - 1) : 0.5;
    addTree(-188 + t * 110 + (rand() - 0.5) * 1.6, rowY + (rand() - 0.5) * 1.0);
  }

  // Rejection-sampled scatter inside a garden rectangle.
  const scatter = (count, x0, x1, y0, y1, gap) => {
    let placed = 0;
    for (let tries = 0; tries < 4000 && placed < count; tries++) {
      const x = x0 + rand() * (x1 - x0);
      const y = y0 + rand() * (y1 - y0);
      if (footSd(x, y) < FOOT_CLEAR) continue;
      if (pathSd(x, y) < PATH_CLEAR) continue;
      if (!farEnough(x, y, gap)) continue;
      addTree(x, y);
      placed++;
    }
  };
  scatter(N_EAST, SITE.east[0] + 4, SITE.east[2] - 4, SITE.east[1] + 4, SITE.east[3] - 4,
    lightweight ? 14 : 10.5);
  scatter(N_SOUTH, SITE.south[0] + 3, SITE.south[2] - 3, SITE.south[1] + 2, SITE.south[3] - 2,
    lightweight ? 13 : 9.5);

  // Geometry: trunk = unit-height cylinder along +z with its base at z = 0.
  const trunkGeo = new THREE.CylinderGeometry(0.7, 1, 1, lightweight ? 5 : 7, 1, true);
  trunkGeo.rotateX(Math.PI / 2);
  trunkGeo.translate(0, 0, 0.5);

  const blobs = [
    { p: [0, 0, 0], s: [1, 1, 0.95], r: [0, 0, 0] },
    { p: [0.45, 0.2, -0.18], s: [0.7, 0.68, 0.62], r: [0.4, 0.2, 1.1] },
    { p: [-0.4, -0.3, 0.12], s: [0.74, 0.7, 0.68], r: [0.9, 0.5, 0.3] }
  ];
  const BLOB_R = 1.13;                               // horizontal extent of merged crown
  const crownGeo = buildCrownGeometry(lightweight ? blobs.slice(0, 2) : blobs, 1);

  const MatClass = lightweight ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;
  const trunkMat = new MatClass({ color: 0x6b5f54 });   // warm grey-brown bark
  const crownMat = new MatClass({ color: 0xffffff });   // tinted per instance
  if (!lightweight) {
    trunkMat.roughness = 0.95; trunkMat.metalness = 0;
    crownMat.roughness = 0.9; crownMat.metalness = 0;
  }
  const blueprintMat = new THREE.MeshBasicMaterial({
    color: '#7fa8bd', transparent: true, opacity: 0.35, depthWrite: false
  });

  const count = trees.length;
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, count);
  const crowns = new THREE.InstancedMesh(crownGeo, crownMat, count);
  trunks.name = 'nd-tree-trunks';
  crowns.name = 'nd-tree-crowns';

  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const t = trees[i];
    const crownRz = t.h * 0.33;                      // crown vertical radius
    const crownZ = t.h - crownRz;                    // crown centre height
    const crownRx = (t.w * 0.5) / BLOB_R;
    const trunkR = 0.22 + t.h * 0.012;

    quat.setFromAxisAngle(zAxis, t.rot);
    m.compose(pos.set(t.x, t.y, 0), quat, scl.set(trunkR, trunkR, crownZ));
    trunks.setMatrixAt(i, m);
    m.compose(pos.set(t.x, t.y, crownZ), quat, scl.set(crownRx, crownRx, crownRz));
    crowns.setMatrixAt(i, m);

    // Muted summer green with small per-tree hue / saturation / value drift.
    col.setHSL(0.27 + (t.hue - 0.5) * 0.05, 0.36 + t.sat * 0.12, 0.19 + (t.val - 0.5) * 0.06); // darker at integration review (ACES)
    crowns.setColorAt(i, col);
  }
  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
  trunks.computeBoundingSphere();
  crowns.computeBoundingSphere();

  trunks.castShadow = true;
  trunks.receiveShadow = true;
  crowns.castShadow = true;
  crowns.receiveShadow = true;

  const crownColors = crowns.instanceColor;          // kept to restore after blueprint

  const group = new THREE.Group();
  group.name = 'nd-trees';
  group.add(trunks, crowns);

  return {
    group,
    setStyle(style) {
      const bp = style === 'blueprint';
      trunks.material = bp ? blueprintMat : trunkMat;
      crowns.material = bp ? blueprintMat : crownMat;
      crowns.instanceColor = bp ? null : crownColors; // flat outline colour in blueprint
      trunks.castShadow = !bp;
      crowns.castShadow = !bp;
      trunks.receiveShadow = !bp;
      crowns.receiveShadow = !bp;
    },
    dispose() {
      if (group.parent) group.parent.remove(group);
      crowns.instanceColor = crownColors;
      trunks.dispose();
      crowns.dispose();
      trunkGeo.dispose();
      crownGeo.dispose();
      trunkMat.dispose();
      crownMat.dispose();
      blueprintMat.dispose();
    }
  };
}
