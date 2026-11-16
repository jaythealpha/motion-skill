// Fable 5.2 (claude-fable-5-2) specification-only module, 2026-11-16; reviewed and integrated by Claude Opus 5.5.
// No repository source files were sent to the model. Integration notes: docs/reviews/2026-11-16-eiffel-art-pass/design-qa.md
// eiffel-art-pass.js
// -----------------------------------------------------------------------------
// AUTHORED ILLUSTRATION PASS for the Eiffel Tower construction timeline.
//
// Every colour, pattern, distance and intensity in this file is an authored,
// illustrative choice made for legibility of an engineering illustration.
// Nothing here is measured, surveyed or photo-referenced, and nothing here
// attempts photorealism. The riverside strip only hints at "the Seine is in
// this direction"; its distance and width are NOT surveyed.
//
// - Procedural only (no images, fonts or network). three r180, WebGL2.
// - Animated things are pure functions of the caller-supplied time-bar `t`.
// - Extra draw calls: sky (1) + ground (1) + steam (1) = 3.
// - Not yet run in a browser; written against r180 chunk names.
// -----------------------------------------------------------------------------

import * as THREE from 'three';

// -----------------------------------------------------------------------------
// Shared authored constants
// -----------------------------------------------------------------------------

/** Authored pale, slightly warm grey-blue daytime haze (sky horizon + fog). */
export const HAZE = new THREE.Color('#c6d1d9'); // bluer at integration review

/** Authored light pairing: slightly warmer sun, cooler sky fill, similar exposure. */
export const SUGGESTED_LIGHTS = {
  hemiSky: 0xeef3fb,      // cooler sky fill than the existing #fff9ed
  hemiGround: 0x5c5b55,   // warm-grey bounce from the pale earth
  hemiIntensity: 1.9,     // a touch under the existing 2 (ground is paler than before)
  sunColor: 0xffe9c6,     // slightly warmer than the existing #fff2d9
  sunIntensity: 3.1       // a touch over the existing 3 to keep overall exposure
};

// World-space direction toward the caller's sun at (-150, 380, 240).
const SUN_DIR = new THREE.Vector3(-150, 380, 240).normalize();

const FOG_DENSITY = 0.00052;   // FogExp2: ~20 % haze at 900 m (reduced at integration review for lattice contrast)
const SKY_RADIUS = 4000;       // dome radius (m); the shader only uses direction
const GROUND_SIZE = 1800;      // ground plane edge length (m)
const GROUND_Z = -6.2;         // model z of the ground top
const STEAM_K = 1 / 0.6;       // one puff life per 0.6 time-bar units
const MIN_PX = 0.9;            // minimum on-screen lattice member width (px)

// Things created / patched by this module, for dispose().
const _disposables = new Set();
const _restorers = new Set();
const _bufSize = new THREE.Vector2(); // scratch, reused every frame

function track(obj) {
  _disposables.add(obj);
  return obj;
}

// -----------------------------------------------------------------------------
// Shared GLSL helpers (sin-free hash: stable across mobile GPUs)
// -----------------------------------------------------------------------------

const GLSL_NOISE = /* glsl */ `
float eaHash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float eaHash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float eaNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = eaHash21(i);
  float b = eaHash21(i + vec2(1.0, 0.0));
  float c = eaHash21(i + vec2(0.0, 1.0));
  float d = eaHash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
// Signed (-1..1) value noise with cell size "cell" (same units as p), faded to
// zero as the pixel footprint "px" approaches the cell size (no shimmer).
float eaFNoise(vec2 p, float cell, float px) {
  float k = 1.0 - smoothstep(0.3, 1.0, px / cell);
  if (k <= 0.0) return 0.0;
  return (eaNoise(p / cell) - 0.5) * 2.0 * k;
}
`;

// -----------------------------------------------------------------------------
// 2. Sky dome
// -----------------------------------------------------------------------------

export function createSky() {
  const geometry = track(new THREE.SphereGeometry(SKY_RADIUS, 32, 16));

  const material = track(new THREE.ShaderMaterial({
    name: 'EiffelSky',
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false, // drawn first (renderOrder -1), so no depth needed
    fog: false,
    uniforms: {
      uHaze: { value: HAZE },                               // shared with fog
      uZenith: { value: new THREE.Color('#6f98c4') },       // authored soft zenith blue
      uGlow: { value: new THREE.Color('#fff0d2') },         // authored warm sun-side glow
      uCloud: { value: new THREE.Color('#f6f3ec') },        // authored soft cloud white
      uSunDir: { value: SUN_DIR }
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        // Camera-centred (rotation only), so the dome is independent of the
        // camera far plane and the horizon is truly at infinity.
        vec4 mv = vec4(mat3(viewMatrix) * position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_Position.z = 0.0; // inside the clip volume; depth test/write are off
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uHaze;
      uniform vec3 uZenith;
      uniform vec3 uGlow;
      uniform vec3 uCloud;
      uniform vec3 uSunDir;
      varying vec3 vDir;
      ${GLSL_NOISE}
      float eaFbm(vec2 p) {
        float s = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          s += a * eaNoise(p);
          p = p * 2.03 + vec2(17.3, 9.1);
          a *= 0.5;
        }
        return s / 0.9375;
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        float up = max(h, 0.0);

        // Broad haze band: exactly HAZE at and below the horizon.
        float k = sqrt(smoothstep(0.0, 0.55, up)); // integration review: bluer sky above a narrower haze band
        vec3 col = mix(uHaze, uZenith, k);

        // Faint warm glow toward the sun, masked off at the horizon.
        float sd = max(dot(d, uSunDir), 0.0);
        float aboveMask = smoothstep(0.0, 0.2, h);
        col += uGlow * (0.09 * pow(sd, 6.0) + 0.04 * sd * sd) * aboveMask;

        // A few very soft, large cloud forms (non-tiling low-frequency noise).
        vec2 cp = d.xz / (up + 0.18);
        cp = vec2(cp.x * 0.65, cp.y * 0.95) + vec2(3.7, 1.3);
        float c = smoothstep(0.5, 0.8, eaFbm(cp));
        c *= smoothstep(0.04, 0.3, h) * 0.38; // restrained opacity
        col = mix(col, uCloud, c);

        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        // +-0.5 LSB dither against banding in the smooth gradient.
        gl_FragColor.rgb += (eaHash21(gl_FragCoord.xy) - 0.5) / 255.0;
      }
    `
  }));

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'EiffelSkyDome';
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;

  return {
    mesh,
    setVisible(v) {
      mesh.visible = !!v;
    }
  };
}

// -----------------------------------------------------------------------------
// 3. Fog
// -----------------------------------------------------------------------------

export function applyFog(scene) {
  // At 900 m the fog factor is about 0.34, so the lattice keeps most of its
  // contrast. The ground plane edge is fully hidden by a radial fade to HAZE
  // inside the ground shader (520 -> 800 m from the site centre).
  const fog = new THREE.FogExp2(HAZE.getHex(), FOG_DENSITY);
  fog.color = HAZE; // share the instance so the horizon and fog can never drift apart
  scene.fog = fog;
  return {
    setEnabled(enabled) {
      scene.fog = enabled ? fog : null;
    }
  };
}

// -----------------------------------------------------------------------------
// 4. Site ground
// -----------------------------------------------------------------------------

export function createSiteGround({ lightweight = false } = {}) {
  const geometry = track(new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, 1, 1));

  const uniforms = {
    uEaBlueprint: { value: 0 },
    uEaFlat: { value: new THREE.Color('#17314c') },   // blueprint ground (specified)
    uEaHaze: { value: HAZE },
    uEaEarth: { value: new THREE.Color('#857a66') },  // authored compacted pale earth (darkened at integration for ACES output)
    uEaDamp: { value: new THREE.Color('#62584a') },   // authored damp excavation earth
    uEaQuay: { value: new THREE.Color('#a39d90') },   // authored pale quay stone
    uEaWater: { value: new THREE.Color('#68716d') }   // authored calm grey-green river (desaturated at integration)
  };

  const material = track(lightweight
    ? new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x1c1c1c, // very low; only the water uses it (see shader)
      shininess: 24
    })
    : new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0
    }));
  material.name = 'EiffelSiteGround';

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    // ---- vertex -------------------------------------------------------------
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */ `#include <common>
varying vec2 vEaSite;
varying vec3 vEaView;`)
      .replace('#include <begin_vertex>', /* glsl */ `#include <begin_vertex>
vEaSite = position.xy; // the plane is only offset in z, so local xy == model xy (m)`)
      .replace('#include <project_vertex>', /* glsl */ `#include <project_vertex>
vEaView = mvPosition.xyz;`);

    // ---- fragment -----------------------------------------------------------
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */ `#include <common>
uniform float uEaBlueprint;
uniform vec3 uEaFlat;
uniform vec3 uEaHaze;
uniform vec3 uEaEarth;
uniform vec3 uEaDamp;
uniform vec3 uEaQuay;
uniform vec3 uEaWater;
varying vec2 vEaSite;
varying vec3 vEaView;
${GLSL_NOISE}
float eaSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}`)
      .replace('#include <color_fragment>', /* glsl */ `#include <color_fragment>
float eaRough = 0.95;  // authored matt earth
float eaWaterMask = 0.0;
float eaEdge = 0.0;
{
  vec2 p = vEaSite;                               // model xy, metres
  float px = max(length(fwidth(p)), 1e-4);        // pixel footprint, metres
  if (uEaBlueprint < 0.5) {
    float dist = length(vEaView);
    float farK = 1.0 - smoothstep(900.0, 2200.0, dist); // all detail -> flat tone far away

    // Multi-scale, derivative-filtered tone variation.
    float drift = eaFNoise(p + 311.0, 120.0, px);     // large tonal drift ~120 m
    float patch8 = eaFNoise(p + 57.0, 8.0, px);       // patches ~8 m
    float patch3 = eaFNoise(p.yx + 91.0, 2.6, px);    // in-between scale
    float speck = eaFNoise(p, 0.3, px);               // pebble speckle ~0.3 m
    vec3 earth = uEaEarth * (1.0 + farK * (0.10 * drift + 0.10 * patch8 + 0.04 * patch3 + 0.06 * speck)); // contrast raised at integration review
    earth.b *= 1.0 - 0.04 * drift * farK;             // faint warm/cool drift

    // Gentle meander so the pads and paths are not ruler-straight.
    vec2 w = p + 3.0 * vec2(eaNoise(p / 34.0 + 5.0), eaNoise(p / 34.0 + 17.0)) - 1.5;

    // Four damp excavation pads at (+-50, +-50): ~34 m rounded squares.
    float bigK = farK * (1.0 - smoothstep(8.0, 24.0, px));
    vec2 q = abs(abs(w) - 50.0) - 12.0;               // 12 + 5 m corner radius = 17 m half-width
    float dPad = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 5.0;
    float pad = 1.0 - smoothstep(-2.0, 2.0, dPad);
    float rim = exp(-dPad * dPad / 6.0);              // darker trodden rim
    earth = mix(earth, uEaDamp * (1.0 + 0.05 * patch8 * farK), pad * 0.75 * bigK);
    earth *= 1.0 - 0.07 * rim * bigK;

    // Worn haul paths (~5 m wide, very low contrast): between the pads, then
    // out toward the +y side where materials arrive, plus one along the quay.
    vec2 ax = vec2(abs(w.x), w.y);
    float dT = eaSeg(ax, vec2(50.0, -50.0), vec2(50.0, 50.0));
    dT = min(dT, eaSeg(vec2(w.x, abs(w.y)), vec2(-50.0, 50.0), vec2(50.0, 50.0)));
    dT = min(dT, eaSeg(ax, vec2(50.0, 50.0), vec2(26.0, 118.0)));
    dT = min(dT, eaSeg(ax, vec2(26.0, 118.0), vec2(20.0, 168.0)));
    dT = min(dT, eaSeg(ax, vec2(0.0, 168.0), vec2(240.0, 168.0)));
    float trackK = farK * (1.0 - smoothstep(1.5, 5.0, px));
    float trk = (1.0 - smoothstep(1.4, 3.6, dT)) * (1.0 - pad);
    earth *= 1.0 - 0.13 * trk * trackK;

    // ILLUSTRATIVE Seine-side strip on +y: quay edge from y = 175, water from
    // 179 to 300, far quay to 304. Direction and distance are authored cues,
    // NOT surveyed. The ripple is static tone only (never animated).
    float aa = max(px, 0.15);
    float inStrip = smoothstep(175.0 - aa, 175.0 + aa, p.y) * (1.0 - smoothstep(304.0 - aa, 304.0 + aa, p.y));
    float inWater = smoothstep(179.0 - aa, 179.0 + aa, p.y) * (1.0 - smoothstep(300.0 - aa, 300.0 + aa, p.y));
    vec3 quay = uEaQuay * (1.0 + farK * (0.04 * patch3 + 0.03 * speck));
    float ripple = eaFNoise(vec2(p.x * 0.22, p.y) + 201.0, 9.0, px); // stretched along the flow
    vec3 water = uEaWater * (1.0 + farK * (0.06 * ripple + 0.04 * drift));

    vec3 col = mix(earth, quay, inStrip);
    col = mix(col, water, inWater);
    diffuseColor.rgb = col;

    eaWaterMask = inWater;
    eaRough = mix(0.95, 0.42, inWater);               // slight sheen on water only
    eaEdge = smoothstep(520.0, 800.0, length(p));     // plane edge dissolves into HAZE
  }
}`)
      // Standard only: per-pixel roughness (the chunk does not exist in Phong).
      .replace('#include <roughnessmap_fragment>', /* glsl */ `#include <roughnessmap_fragment>
#ifdef STANDARD
roughnessFactor = eaRough;
#endif`)
      // Phong only: no specular on earth, mild on water (the chunk does not exist in Standard).
      .replace('#include <specularmap_fragment>', /* glsl */ `#include <specularmap_fragment>
specularStrength *= eaWaterMask;`)
      // Blueprint: exact flat, unlit colour (shadows are intentionally dropped).
      .replace('#include <tonemapping_fragment>', /* glsl */ `gl_FragColor.rgb = mix(gl_FragColor.rgb, uEaFlat, uEaBlueprint);
#include <tonemapping_fragment>`)
      // After fog (which three applies in output space): radial fade to HAZE.
      .replace('#include <fog_fragment>', /* glsl */ `#include <fog_fragment>
gl_FragColor.rgb = mix(gl_FragColor.rgb, linearToOutputTexel(vec4(uEaHaze, 1.0)).rgb, eaEdge * (1.0 - uEaBlueprint));`);
  };
  material.customProgramCacheKey = () => 'eiffel-site-ground-v1';

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'EiffelSiteGround';
  mesh.position.set(0, 0, GROUND_Z); // MODEL coordinates (z up); caller does root.add(mesh)
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  return {
    mesh,
    setStyle(style) {
      uniforms.uEaBlueprint.value = style === 'blueprint' ? 1 : 0;
    }
  };
}

// -----------------------------------------------------------------------------
// 5. Iron lattice material patch
// -----------------------------------------------------------------------------

export function patchIronMaterial(material, { lightweight = false } = {}) {
  const uniforms = {
    uPxPerRad: { value: 1000 / (2 * Math.tan((35 * Math.PI) / 360)) }, // sane default before update()
    uIronFx: { value: 1 },       // 1 = authored colour effects on, 0 = blueprint
    uIronHaze: { value: HAZE }
  };

  const prevCompile = material.onBeforeCompile;
  const prevKey = material.customProgramCacheKey;

  const onBeforeCompile = (shader, renderer) => {
    if (typeof prevCompile === 'function') prevCompile.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);

    // ---- vertex -------------------------------------------------------------
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */ `#include <common>
uniform float uPxPerRad;
varying float vIronCoverage;
varying vec3 vIronVar;
varying vec3 vIronLocal;
varying vec2 vIronDim;
float eaHash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}`)
      .replace('#include <begin_vertex>', /* glsl */ `#include <begin_vertex>
{
  #ifdef USE_INSTANCING
    mat4 eaIM = instanceMatrix;
  #else
    mat4 eaIM = mat4(1.0);
  #endif
  float eaW = length(mat3(modelMatrix) * eaIM[0].xyz); // member width (m)
  float eaL = length(mat3(modelMatrix) * eaIM[1].xyz); // member length (m)

  // Depth of the member centreline at this vertex's station, so the whole
  // cross-section is widened uniformly.
  vec4 eaC = modelViewMatrix * (eaIM * vec4(0.0, position.y, 0.0, 1.0));
  float eaDepth = max(-eaC.z, 0.05);
  float eaPx = eaW * uPxPerRad / eaDepth;              // projected width (px)

  // Minimum pixel width: uniform X/Z scale. The I-beam face normals are
  // axis-aligned, so their directions are unchanged by this scale.
  float eaGrow = max(1.0, ${MIN_PX.toFixed(2)} / max(eaPx, 1e-4));
  transformed.xz *= eaGrow;
  vIronCoverage = clamp(eaPx / ${MIN_PX.toFixed(2)}, 0.25, 1.0);

  // Stable per-member seeds (independent of time).
  float eaId = float(gl_InstanceID);
  vIronVar = vec3(
    eaHash11(eaId + 0.5) * 2.0 - 1.0,
    eaHash11(eaId * 1.37 + 11.1) * 2.0 - 1.0,
    eaHash11(eaId * 0.73 + 29.7) * 2.0 - 1.0
  );
  vIronLocal = position;                               // unwidened unit-beam coords
  vIronDim = vec2(eaW, eaL);
}`);

    // ---- fragment -----------------------------------------------------------
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */ `#include <common>
uniform float uIronFx;
uniform vec3 uIronHaze;
varying float vIronCoverage;
varying vec3 vIronVar;
varying vec3 vIronLocal;
varying vec2 vIronDim;
${GLSL_NOISE}`)
      .replace('#include <color_fragment>', /* glsl */ `#include <color_fragment>
float eaIronSpeck = 0.0;
{
  // Surface coords in metres (two cross-section axes folded together), offset per member.
  vec2 eaUV = vec2((vIronLocal.x + vIronLocal.z * 1.7) * vIronDim.x, vIronLocal.y * vIronDim.y)
            + vIronVar.yz * 37.0;
  float eaPxM = max(length(fwidth(eaUV)), 1e-5);
  if (uIronFx > 0.5) {
    vec3 c = diffuseColor.rgb;

    // Authored puddled-iron variation: value +-6 %, very slight red/brown hue shift.
    c *= 1.0 + 0.06 * vIronVar.x;
    c *= vec3(1.0 + 0.03 * vIronVar.y, 1.0, 1.0 - 0.04 * vIronVar.y);

    // Illustrative paint/iron unevenness: fine speckle + soft mottling (filtered).
    float fine = eaFNoise(eaUV, 0.06, eaPxM);
    float mott = eaFNoise(eaUV + 13.0, 0.9, eaPxM);
    eaIronSpeck = 0.6 * fine + 0.4 * mott;
    c *= 1.0 + 0.045 * eaIronSpeck;

    // Very faint darkening near member ends (joint / gusset cue).
    float endM = (0.5 - abs(vIronLocal.y)) * vIronDim.y;        // metres from the nearer end
    float zone = max(min(0.6, vIronDim.y * 0.2), 1e-3);
    float endFilter = 1.0 - smoothstep(0.3, 1.0, eaPxM / zone);
    c *= 1.0 - 0.07 * (1.0 - smoothstep(0.0, zone, endM)) * endFilter;

    // Sub-pixel members were widened in the vertex stage; pull them toward a
    // HAZE-tinted mid tone so dense distant lattice reads as a soft tone.
    // (0.7 roughly compensates the lighting gain on albedo.)
    vec3 mid = mix(c, uIronHaze * 0.7, 0.55);
    c = mix(c, mid, (1.0 - vIronCoverage) * 0.5);

    diffuseColor.rgb = c;
  }
}`)
      .replace('#include <roughnessmap_fragment>', /* glsl */ `#include <roughnessmap_fragment>
#ifdef STANDARD
// Stronger finish variation where roughness exists: per member + speckle.
roughnessFactor = clamp(roughnessFactor + uIronFx * (0.10 * vIronVar.z + 0.08 * eaIronSpeck), 0.08, 1.0);
#endif`);
  };

  const cacheKey = () => {
    const base = typeof prevKey === 'function' ? prevKey.call(material) : '';
    return base + '|eiffel-iron-v1|' + (lightweight ? 'lw' : 'std');
  };

  material.onBeforeCompile = onBeforeCompile;
  material.customProgramCacheKey = cacheKey;
  material.needsUpdate = true;

  _restorers.add(() => {
    if (material.onBeforeCompile === onBeforeCompile) {
      material.onBeforeCompile = prevCompile;
      material.customProgramCacheKey = prevKey;
      material.needsUpdate = true;
    }
  });

  return {
    /**
     * Allocation-free. viewportHeightPx is the drawing-buffer height in
     * device pixels (CSS height * pixel ratio).
     */
    update(camera, viewportHeightPx) {
      // projectionMatrix[5] = 1 / tan(fov / 2), including camera.zoom.
      const e5 = camera && camera.projectionMatrix ? camera.projectionMatrix.elements[5] : 0;
      if (e5 > 0 && viewportHeightPx > 0) {
        uniforms.uPxPerRad.value = 0.5 * viewportHeightPx * e5;
      }
    },
    setStyle(style) {
      // Blueprint: colour effects off, minimum pixel width stays on.
      uniforms.uIronFx.value = style === 'blueprint' ? 0 : 1;
    }
  };
}

// -----------------------------------------------------------------------------
// 6. Steam puffs
// -----------------------------------------------------------------------------

export function createSteamPuffs({ count = 120 } = {}) {
  const n = Math.max(1, Math.min(160, Math.floor(count))); // hard cap: 160 particles

  // Deterministic seeds (no Math.random): identical on every load.
  let s = 0x9e3779b9;
  const rnd = () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  const positions = new Float32Array(n * 3); // real positions are computed in the shader
  const seeds = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    seeds[i * 4 + 0] = (i + 0.5) / n; // emitter choice (even split)
    seeds[i * 4 + 1] = rnd();         // phase offset
    seeds[i * 4 + 2] = rnd();         // rise height 6..14 m
    seeds[i * 4 + 3] = rnd();         // lateral jitter
  }

  const geometry = track(new THREE.BufferGeometry());
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));

  const emitterUniform = [
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ];

  const material = track(new THREE.ShaderMaterial({
    name: 'EiffelSteam',
    transparent: true,
    depthWrite: false,
    premultipliedAlpha: true, // the shader outputs premultiplied colour
    fog: true,
    uniforms: {
      uEmitters: { value: emitterUniform },
      uEmitterCount: { value: 0 },
      uT: { value: 0 },
      uViewH: { value: 1000 },                           // drawing-buffer height (px)
      uColA: { value: new THREE.Color('#f3f1ec') },      // authored fresh steam off-white
      uColB: { value: new THREE.Color('#c6c9ca') },      // authored thinning light grey
      // Fog uniforms, filled in by the renderer when scene.fog is set.
      fogColor: { value: new THREE.Color() },
      fogDensity: { value: FOG_DENSITY },
      fogNear: { value: 1 },
      fogFar: { value: 2000 }
    },
    vertexShader: /* glsl */ `
      uniform vec3 uEmitters[4];
      uniform float uEmitterCount;
      uniform float uT;
      uniform float uViewH;
      attribute vec4 aSeed;
      varying float vAlpha;
      varying float vShade;
      #include <fog_pars_vertex>
      float eaHash11(float p) {
        p = fract(p * 0.1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }
      void main() {
        float cnt = max(uEmitterCount, 1.0);
        int ei = int(min(floor(aSeed.x * cnt), cnt - 1.0));
        vec3 e = uEmitters[ei];

        // Fully deterministic in the time-bar position uT.
        float ph0 = uT * ${STEAM_K.toFixed(6)} + aSeed.y;
        float ph = fract(ph0);
        float cyc = floor(ph0);
        float j = eaHash11(cyc * 7.13 + aSeed.w * 91.7);          // per-cycle variety

        float inv = 1.0 - ph;
        float rise = mix(6.0, 14.0, aSeed.z) * (1.0 - inv * inv); // rises 6..14 m, easing out
        float size = mix(1.0, 5.0, sqrt(ph)) * (0.85 + 0.3 * j);  // ~1 m -> ~5 m

        vec3 p = e;                                               // MODEL coords, z up
        p.x += (aSeed.w - 0.5) * 0.8 + 5.0 * ph * ph * (0.6 + 0.8 * j); // drift toward +x (wind)
        p.y += (j - 0.5) * 0.8 + (aSeed.z - 0.5) * 3.0 * ph;
        p.z += 0.5 + rise;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // World-metre sprite size (manual perspective attenuation), capped so
        // close-ups never fill the screen.
        float pxSize = size * uViewH * 0.5 * projectionMatrix[1][1] / max(-mvPosition.z, 0.1);
        float cap = min(uViewH * 0.14, 140.0);
        gl_PointSize = min(pxSize, cap);
        float capFade = clamp(cap / max(pxSize, 1e-3), 0.35, 1.0); // thinner when capped

        vAlpha = smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.4, 1.0, ph)) * 0.42 * capFade; // 0.55 -> 0.42 at integration review
        vShade = ph;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColA;
      uniform vec3 uColB;
      varying float vAlpha;
      varying float vShade;
      #include <fog_pars_fragment>
      void main() {
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        if (r2 >= 1.0) discard;
        float f = 1.0 - r2;
        f *= f;                                           // soft radial falloff
        float a = vAlpha * f;
        vec3 col = mix(uColA, uColB, clamp(vShade * 0.8 + 0.2 * gl_PointCoord.y, 0.0, 1.0));
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
        #include <fog_fragment>
        gl_FragColor.rgb *= gl_FragColor.a;               // premultiplied output
      }
    `
  }));

  const points = new THREE.Points(geometry, material);
  points.name = 'EiffelSteamPuffs';
  points.frustumCulled = false; // positions are computed in the vertex shader
  points.visible = false;
  points.renderOrder = 3;
  points.onBeforeRender = (renderer) => {
    renderer.getDrawingBufferSize(_bufSize); // allocation-free
    material.uniforms.uViewH.value = _bufSize.y;
    material.uniformsNeedUpdate = true;
  };

  return {
    points,
    /**
     * emitters: array of up to 4 THREE.Vector3 in MODEL coordinates.
     * t: time-bar position 0..100 (never wall-clock time).
     */
    update(emitters, t, visible) {
      const cnt = emitters ? Math.min(emitters.length, 4) : 0;
      const show = !!visible && cnt > 0;
      points.visible = show;
      if (!show) return;
      for (let i = 0; i < cnt; i++) emitterUniform[i].copy(emitters[i]);
      material.uniforms.uEmitterCount.value = cnt;
      material.uniforms.uT.value = t;
    }
  };
}

// -----------------------------------------------------------------------------
// dispose
// -----------------------------------------------------------------------------

/**
 * Frees every geometry / material / texture created by this module and
 * restores the hooks on materials patched by patchIronMaterial(). The caller
 * still owns removing objects from the scene graph and clearing scene.fog.
 */
export function dispose() {
  _disposables.forEach((d) => {
    if (d && typeof d.dispose === 'function') d.dispose();
  });
  _disposables.clear();
  _restorers.forEach((fn) => fn());
  _restorers.clear();
}
