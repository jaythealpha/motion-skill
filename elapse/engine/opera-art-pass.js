// elapse/engine/opera-art-pass.js
// Representative-scene art pass. Everything here is AUTHORED APPEARANCE / LIGHTING unless marked MEASURED.
// SOURCED descriptions: Sydney Opera House's 120 mm ceramic tiles; ARM's 18 reflectors (2022).
// Tile placement and appearance, light, water and finishing coordinates remain estimated.
// Fable 5.2 module, integrated and visually refined by Codex. See review/provenance notes.
import * as T from 'three';

const SKY = `
vec3 operaArtSky(vec3 d, vec3 s){ // authored low-sun gradient (not captured from photographs)
  float h = clamp(d.y, 0.0, 1.0), sd = max(dot(d, s), 0.0);
  vec3 c = mix(mix(vec3(0.50,0.60,0.72), vec3(1.0,0.60,0.30), sd*sd), vec3(0.07,0.17,0.40), pow(h, 0.5));
  return c + vec3(1.0,0.5,0.2) * (pow(sd, 24.0) * 0.6);
}`;
const NOISE = `
float oaH(vec2 p){ vec3 a = fract(vec3(mod(p, 512.0).xyx) * 0.1031); a += dot(a, a.yzx + 33.33); return fract((a.x + a.y) * a.z); }
float oaN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(oaH(i), oaH(i+vec2(1.0,0.0)), f.x), mix(oaH(i+vec2(0.0,1.0)), oaH(i+vec2(1.0,1.0)), f.x), f.y); }
float oaNf(vec2 p, float w){ return mix(0.5, oaN(p), 1.0 - smoothstep(0.3, 1.0, w)); } // derivative fade -> no shimmer`;
const WP = `
vec3 oaNw = abs(normalize((vec4(normal, 0.0) * viewMatrix).xyz));
vec2 oaUv = oaNw.y > max(oaNw.x, oaNw.z) ? vOperaArtWp.xz : (oaNw.x > oaNw.z ? vOperaArtWp.zy : vOperaArtWp.xy);
float oaFw = max(length(fwidth(vOperaArtWp)), 1e-4);
float oaVert = 1.0 - smoothstep(0.5, 0.8, oaNw.y);`;
const TILE_EXTENT = 1.018; // metres per texture repeat: 6 diagonals of a MEASURED 120 mm tile (0.1697 m each)

// Surface snippets run after <normal_fragment_maps>; valid for MeshStandard and MeshPhong (r180 chunk names).
const SURF = {
  // Authored chevron-lid layout (2.4 m ribs, 4.8 m lids): lid edges matte cream, centres gloss white, thin seams.
  shell: `
#ifdef USE_MAP
{ vec2 oaP = vMapUv * ${TILE_EXTENT.toFixed(4)}; float oaFw = max(length(fwidth(oaP)), 1e-4);
  float oaRib = abs(fract(oaP.y / 2.4) - 0.5) * 2.4;
  float oaD = min(1.2 - oaRib, abs(fract((oaP.x + oaRib * 0.8) / 4.8) - 0.5) * 4.8);
  float oaEdge = (1.0 - smoothstep(0.10, 0.34, oaD)) * clamp(0.25 / oaFw, 0.0, 1.0);
  float oaLine = (1.0 - smoothstep(0.010, 0.010 + oaFw, oaD)) * clamp(0.035 / oaFw, 0.0, 1.0);
  diffuseColor.rgb *= mix(vec3(1.0), vec3(0.94, 0.90, 0.82), oaEdge) * (1.0 - 0.22 * oaLine);
  #ifdef STANDARD
  roughnessFactor = clamp(roughnessFactor + 0.22 * oaEdge, 0.0, 1.0);
  #endif
}
#endif`,
  granite: `{ ${WP}
  float oaSp = oaNf(oaUv * 45.0, oaFw * 45.0), oaMo = oaNf(oaUv * 0.35, oaFw * 0.35);
  float oaSt = oaN(vec2(oaUv.x * 1.3, oaUv.y * 0.09)) * oaVert; // light vertical weathering streaks
  vec2 oaC = (0.5 - abs(fract(oaUv / vec2(2.4, 1.2)) - 0.5)) * vec2(2.4, 1.2); // authored panel joints
  float oaJ = (1.0 - smoothstep(0.006, 0.006 + oaFw, min(oaC.x, oaC.y))) * clamp(0.03 / oaFw, 0.0, 1.0);
  diffuseColor.rgb *= (0.90 + 0.22 * oaSp) * (0.92 + 0.16 * oaMo) * (1.0 - 0.16 * oaSt) * (1.0 - 0.18 * oaJ);
  #ifdef STANDARD
  roughnessFactor = clamp(roughnessFactor * (0.85 + 0.3 * oaMo) + 0.1 * oaSt, 0.0, 1.0);
  #endif
}`,
  timber: `{ ${WP}
  float oaBh = oaH(vec2(floor(oaUv.x / 0.14), 7.0)); // authored 140 mm boards
  float oaG = oaNf(vec2(oaUv.x * 90.0, oaUv.y * 2.2 + oaBh * 31.0), oaFw * 90.0);
  float oaG2 = oaNf(vec2(oaUv.x * 9.0 + oaBh * 5.0, oaUv.y * 0.6), oaFw * 9.0);
  float oaSeam = (1.0 - smoothstep(0.002, 0.002 + oaFw, (0.5 - abs(fract(oaUv.x / 0.14) - 0.5)) * 0.14)) * clamp(0.02 / oaFw, 0.0, 1.0);
  diffuseColor.rgb *= (1.0 + (oaBh - 0.5) * 0.06 * clamp(0.1 / oaFw, 0.0, 1.0)) * (0.97 + 0.06 * oaG) * (0.98 + 0.04 * oaG2) * (1.0 - 0.08 * oaSeam);
  #ifdef STANDARD
  roughnessFactor = clamp(roughnessFactor * (0.85 + 0.3 * oaG), 0.0, 1.0);
  #endif
}`,
  metal: `{ ${WP}
  float oaB = oaNf(vec2(oaUv.x * 6.0, oaUv.y * 260.0), oaFw * 260.0), oaB2 = oaNf(vec2(oaUv.x * 1.5, oaUv.y * 40.0), oaFw * 40.0);
  diffuseColor.rgb *= 0.93 + 0.09 * oaB + 0.06 * oaB2 + 0.0 * oaVert;
  #ifdef STANDARD
  roughnessFactor = clamp(roughnessFactor + (oaB - 0.5) * 0.18 + (oaB2 - 0.5) * 0.1, 0.05, 1.0);
  #endif
}`,
};
const SPEC = { shell: { rim: 0.5 }, granite: { wp: 1, rim: 0.14 }, timber: { wp: 1 }, metal: { wp: 1, rim: 0.1 }, glass: { sky: 1 } };
const KINDS = [['water', /water|harbou?r|sea/i], ['grid', /grid/i], ['magenta', /magenta|reflector|petal/i], ['shell', /shell|tile|sail|roof/i],
  ['glass', /glass|glaz|window/i], ['timber', /brush|timber|wood|birch|ply/i], ['metal', /metal|bronze|steel|alumin|pipe|organ|mullion/i],
  ['granite', /granite|podium|stone|concrete|precast|paving|step/i]];
const match = (s) => { if (s) for (const [k, re] of KINDS) if (re.test(s)) return k; return null; };
const kindOf = (m, key) => match(String((m.userData && m.userData.operaKind) || '')) || match(`${key || ''} ${m.name || ''}`);
const rnd = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };

// Diagonal tile field. detail=false: cream/white albedo with pale thin grout; detail=true: R=height, G=roughness.
function drawTiles(g, S, detail) {
  const N = 6, h = S / N / 2, q = h - Math.max(0.6, (S / 512) * 0.9);
  g.fillStyle = detail ? 'rgb(96,235,0)' : '#cfc8b8'; g.fillRect(0, 0, S, S);
  for (let j = 0; j <= 2 * N; j++) for (let i = 0; i <= 2 * N; i++) {
    if ((i + j) & 1) continue;
    const r = rnd(i % (2 * N), j % (2 * N)), x = i * h, y = j * h, v = 240 + r * 12;
    g.beginPath(); g.moveTo(x - q, y); g.lineTo(x, y - q); g.lineTo(x + q, y); g.lineTo(x, y + q); g.closePath();
    g.fillStyle = detail ? `rgb(${(200 + r * 40) | 0},${(95 + r * 50) | 0},0)` : `rgb(${v | 0},${(v - 4) | 0},${(v - 14) | 0})`;
    g.fill();
  }
}
function tileTex(size, detail, aniso) {
  const c = document.createElement('canvas'); c.width = c.height = size; drawTiles(c.getContext('2d'), size, detail);
  const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1 / TILE_EXTENT, 1 / TILE_EXTENT);
  t.colorSpace = detail ? T.NoColorSpace : T.SRGBColorSpace; t.anisotropy = aniso; return t;
}

export function createOperaArtPass({ renderer, scene, root, form, low = false, sun }) {
  const undo = [], kinds = new Map(), shellMeshes = [], hallMeshes = [], timberMeshes = [],originalFill=[];
  const v = new T.Vector3(), box = new T.Box3(), size = new T.Vector3(), ctr = new T.Vector3();
  const uSun = { value: new T.Vector3(0.75, 0.35, 0.56).normalize() }, uSunCol = { value: new T.Color(1.0, 0.72, 0.45) };
  const uRimK = { value: 1 }, uTime = { value: 0 }, uBld = { value: new T.Vector4(0, 0, 1, 1) }, uBldY = { value: new T.Vector3(0, 1, 0) };
  const uEnabled={value:1};
  const stats = { low, textures: 2, texturePixels: 0, hookedMaterials: 0, addedDrawCalls: 1, addedLights: 0, waterReplaced: false };

  // ---- generated cached textures (bounded: exactly two, disposed explicitly) ----
  const S = low ? 256 : 512, aniso = Math.min(low ? 2 : 8, renderer.capabilities.getMaxAnisotropy());
  const tileMap = tileTex(S, false, aniso), tileDetail = tileTex(S, true, aniso);
  stats.texturePixels = 2 * S * S;

  const tweak = (m, props) => {
    for (const k in props) {
      if (!(k in m)) continue; // property set differs between Standard and Phong
      const cur = m[k], val = props[k];
      if (cur && cur.isColor) { const h = cur.getHex(); undo.push(() => cur.setHex(h)); cur.set(val); }
      else { undo.push(() => { m[k] = cur; }); m[k] = val; }
    }
    m.needsUpdate = true;
  };

  // Conservative shader hook: chains any previous onBeforeCompile / cache key, bails out if chunks are missing.
  const hook = (m, kind) => {
    const spec = SPEC[kind]; if (!spec || !(m.isMeshStandardMaterial || m.isMeshPhongMaterial)) return;
    const prevC = m.onBeforeCompile, prevK = m.customProgramCacheKey;
    undo.push(() => { m.onBeforeCompile = prevC; m.customProgramCacheKey = prevK; m.needsUpdate = true; });
    m.onBeforeCompile = function (sh, r) {
      prevC.call(this, sh, r);
      const fs = sh.fragmentShader, vs = sh.vertexShader;
      const A = '#include <common>', B = '#include <normal_fragment_maps>', C = '#include <opaque_fragment>', P = '#include <project_vertex>';
      if (!fs.includes(A) || !fs.includes(B) || !fs.includes(C) || fs.includes('uOperaArtSun')) return;
      if (spec.wp && (!vs.includes(A) || !vs.includes(P))) return;
      sh.uniforms.uOperaArtSun = uSun; sh.uniforms.uOperaArtSunCol = uSunCol; sh.uniforms.uOperaArtRimK = uRimK;
      sh.uniforms.uOperaArtEnabled=uEnabled;
      let head = '\nuniform vec3 uOperaArtSun; uniform vec3 uOperaArtSunCol; uniform float uOperaArtRimK;uniform float uOperaArtEnabled;';
      if (spec.wp) head += '\nvarying vec3 vOperaArtWp;' + NOISE;
      if (spec.sky) head += SKY;
      let tail = '';
      if (spec.rim) tail += `{ vec3 oaV = normalize(vViewPosition); vec3 oaL = normalize((viewMatrix * vec4(uOperaArtSun, 0.0)).xyz);
        float oaF = pow(1.0 - clamp(dot(oaV, normal), 0.0, 1.0), 3.0); // warm low-sun rim on silhouettes
        outgoingLight += uOperaArtSunCol * (${spec.rim.toFixed(2)} * uOperaArtRimK * oaF * (0.25 + 0.75 * clamp(dot(normal, oaL) * 0.5 + 0.5, 0.0, 1.0))); }\n`;
      if (spec.sky) tail += `{ vec3 oaV = normalize(vViewPosition); float oaF = 0.05 + 0.95 * pow(1.0 - clamp(dot(oaV, normal), 0.0, 1.0), 5.0);
        vec3 oaR = normalize((vec4(reflect(-oaV, normal), 0.0) * viewMatrix).xyz); oaR.y = abs(oaR.y);
        outgoingLight = mix(outgoingLight, operaArtSky(normalize(oaR), uOperaArtSun) * 0.64, 0.35 + oaF * 0.5); // authored sky reflection, not sampled surroundings
        diffuseColor.a = mix(diffuseColor.a, 1.0, oaF * 0.7); }\n`;
      sh.fragmentShader = fs.replace(A, A + head).replace(B, B + '\nif(uOperaArtEnabled>.5){\n' + (SURF[kind] || '')+'\n}\n').replace(C, 'if(uOperaArtEnabled>.5){'+tail+'}\n' + C);
      if (spec.wp) sh.vertexShader = vs.replace(A, A + '\nvarying vec3 vOperaArtWp;').replace(P, P + `
        vec4 oaWp = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
        oaWp = instanceMatrix * oaWp;
        #endif
        vOperaArtWp = (modelMatrix * oaWp).xyz;`);
    };
    m.customProgramCacheKey = function () { return prevK.call(this) + '|operaArtPass2:' + kind; };
    m.needsUpdate = true; stats.hookedMaterials++;
  };

  const style = (m, kind) => { // authored physically-plausible parameters; existing hues kept except shell/glass
    if (kind === 'shell') tweak(m, { color: 0xfff8ea, map: tileMap, bumpMap: tileDetail, bumpScale: 0.003, roughnessMap: tileDetail, roughness: 1, metalness: 0, shininess: 55, specular: 0x55504a });
    else if (kind === 'granite') tweak(m, { normalScale:new T.Vector2(.12,.12),bumpScale:.008,roughness: 0.82, metalness: 0, shininess: 12, specular: 0x1c1a18 });
    else if (kind === 'timber') tweak(m, { normalScale:new T.Vector2(.06,.06),bumpScale:.002,roughness: 0.58, metalness: 0, shininess: 32, specular: 0x3a2a1c });
    else if (kind === 'metal') tweak(m, { roughness: 0.38, metalness: scene.environment ? 0.85 : 0.45, shininess: 90, specular: 0x8a8478 });
    else if (kind === 'glass') tweak(m, { color: 0x0b1c33, roughness: 0.06, metalness: 0, shininess: 120, specular: 0x9fb4cc, opacity: m.transparent ? Math.min(m.opacity, 0.6) : m.opacity });
    else if (kind === 'magenta') tweak(m, { roughness: 0.42, metalness: 0, shininess: 60, specular: 0x55303f, emissive: 0x1c0210 });
    else if (kind === 'grid' && m.isLineBasicMaterial) tweak(m, { transparent: true, opacity: 0.1, depthWrite: false });
    // Existing cached wood/stone maps already provide detail. Avoid stacking another
    // costly noise shader over them in moving close-ups; keep ceramic and glass hooks.
    if(kind==='shell'||kind==='glass')hook(m, kind);
  };

  // ---- one-time classification (setup only; never per frame) ----
  const src = form && form.materials, ents = src instanceof Map ? [...src] : Object.entries(src || {});
  for (const [key, val] of ents) for (const m of [].concat(val)) if (m && m.isMaterial) { const k = kindOf(m, key); if (k) kinds.set(m, k); }
  let waterMesh = null, waterOld = null;
  scene.traverse((o) => {
    if (o.isAmbientLight || o.isHemisphereLight) { const i = o.intensity, visible=o.visible; originalFill.push(o);undo.push(() => { o.intensity = i; o.visible=visible; }); o.visible=false; }
    if (!o.material) return;
    for (const m of [].concat(o.material)) {
      if (!m || !m.isMaterial) continue;
      let k = kinds.get(m); if (k === undefined) { k = kindOf(m, o.name); kinds.set(m, k); }
      if (k === 'water' && o.isMesh && !Array.isArray(o.material) && !waterMesh) waterMesh = o;
      else if (k === 'shell' && o.isMesh) shellMeshes.push(o);
      else if (k === 'magenta' && o.isMesh) hallMeshes.push(o);
      else if (k === 'timber' && o.isMesh) timberMeshes.push(o);
    }
  });
  for (const [m, k] of kinds) if (k && k !== 'water') style(m, k);
  const textureState=[...kinds.keys()].map(m=>({m,map:m.map,bumpMap:m.bumpMap,normalMap:m.normalMap,roughnessMap:m.roughnessMap,emissive:m.emissive?.clone()}));

  // ---- harbour: analytic waves with derivative-filtered normals, sky Fresnel, soft glint, broad building reflection ----
  const waterMat = new T.ShaderMaterial({
    uniforms: { uOaTime: uTime, uOaSun: uSun, uOaSunCol: uSunCol, uOaBld: uBld, uOaBldY: uBldY }, defines: {}, fog: false,
    vertexShader: `varying vec3 vOaW;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vOaW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
#include <logdepthbuf_vertex>
}`,
    fragmentShader: `uniform float uOaTime; uniform vec3 uOaSun; uniform vec3 uOaSunCol; uniform vec4 uOaBld; uniform vec3 uOaBldY; varying vec3 vOaW;
#include <common>
#include <logdepthbuf_pars_fragment>
${SKY}
vec2 oaW(vec2 p, vec2 d, float k, float s, float fw){ // gradient of one deep-water wave, faded once sub-pixel
  return d * (s * cos(dot(p, d) * k + uOaTime * sqrt(9.81 * k)) * (1.0 - smoothstep(0.15, 0.8, k * fw))); }
void main(){
#include <logdepthbuf_fragment>
  vec3 toCam = cameraPosition - vOaW; float dist = length(toCam); vec3 V = toCam / dist;
  vec2 p = vOaW.xz; float fw = max(length(fwidth(p)), 1e-4);
  vec2 q = p + 1.3 * vec2(sin(p.y * 0.19 + uOaTime * 0.23), cos(p.x * 0.16 - uOaTime * 0.19));
  vec2 g = oaW(q, vec2(0.80, 0.60), 0.33, 0.05, fw) + oaW(q, vec2(-0.45, 0.89), 0.62, 0.06, fw)
         + oaW(q, vec2(0.98, -0.17), 1.15, 0.07, fw) + oaW(q, vec2(0.26, 0.97), 2.1, 0.07, fw)
#ifdef OA_HQ
         + oaW(q, vec2(-0.71, -0.70), 3.9, 0.06, fw) + oaW(q, vec2(0.60, -0.80), 7.3, 0.05, fw)
#endif
         ;
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
  float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 R = reflect(-V, N); R.y = abs(R.y) + 0.02; R = normalize(R);
  vec3 sky = operaArtSky(R, uOaSun);
  // fixed soft silhouette: mirrored ray vs. an ellipsoid fitted to the shells' bounds (authored approximation)
  vec3 rad = vec3(uOaBld.z, uOaBldY.y * 0.5, uOaBld.w);
  vec3 o = (vOaW - vec3(uOaBld.x, uOaBldY.x + rad.y, uOaBld.y)) / rad;
  vec3 dd = normalize(R / rad); vec3 cp = o + dd * max(-dot(o, dd), 0.0);
  float m = (1.0 - smoothstep(0.55, 1.15, length(cp))) * uOaBldY.z;
  vec3 bcol = mix(vec3(0.20, 0.13, 0.10), vec3(0.80, 0.74, 0.62), smoothstep(-0.75, -0.35, cp.y))
            * (0.45 + 0.55 * clamp(dot(cp.xz, uOaSun.xz) * 0.6 + 0.55, 0.0, 1.0)) * uOaSunCol;
  sky = mix(sky, bcol, m * 0.8);
  vec3 body = vec3(0.004, 0.045, 0.055) + vec3(0.0, 0.07, 0.065) * (0.3 + clamp(1.0 - N.y, 0.0, 1.0) * 6.0); // dark teal
  vec3 col = mix(body, sky, F);
  float rough = smoothstep(0.05, 2.5, fw), sd = max(dot(R, uOaSun), 0.0); // filtered waves widen the glint
  col += uOaSunCol * (pow(sd, mix(260.0, 40.0, rough)) * mix(2.2, 0.5, rough) + pow(sd, 12.0) * 0.06) * (1.0 - m);
  float foot = length((p - uOaBld.xy) / (uOaBld.zw * 1.15)); // grounding: darker water against the podium
  col *= mix(1.0, 0.62 + 0.38 * smoothstep(0.75, 1.5, foot), uOaBldY.z);
  col = mix(col, operaArtSky(normalize(vec3(-V.x, 0.0, -V.z) + vec3(1e-4, 0.0, 0.0)), uOaSun) * 0.92, smoothstep(500.0, 1900.0, dist));
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  });
  waterMat.userData.operaKind = 'water';
  if (waterMesh) { waterOld = waterMesh.material; waterMat.side = waterOld.side; waterMesh.material = waterMat; stats.waterReplaced = true; }

  // ---- sky backdrop: camera-centred, drawn first, no depth test/write so it can never occlude cutaways ----
  const skyMat = new T.ShaderMaterial({
    uniforms: { uOaSun: uSun, uOaSunCol: uSunCol }, side: T.BackSide, depthTest: false, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vOaD; void main(){ vOaD = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww; }`,
    fragmentShader: `uniform vec3 uOaSun; uniform vec3 uOaSunCol; varying vec3 vOaD;
${SKY}
void main(){ vec3 d = normalize(vOaD); vec3 c = operaArtSky(d, uOaSun);
  c += uOaSunCol * (pow(max(dot(d, uOaSun), 0.0), 2500.0) * 6.0) * step(0.0, d.y);
  c = mix(c, vec3(0.03, 0.09, 0.11), 1.0 - smoothstep(-0.3, 0.0, d.y));
  gl_FragColor = vec4(c, 1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
  });
  const skyGeo = new T.IcosahedronGeometry(1, 2), skyMesh = new T.Mesh(skyGeo, skyMat);
  skyMesh.frustumCulled = false; skyMesh.renderOrder = -10000; skyMesh.name = 'operaArtSky'; scene.add(skyMesh);

  // ---- authored low-sun key (azimuth kept, elevation capped ~22 deg), cool sky fill, warm hall fill ----
  if (sun && sun.isLight) {
    const p0 = sun.position.clone(), c0 = sun.color.getHex(), i0 = sun.intensity, sh = sun.shadow, b0 = sh && sh.bias, n0 = sh && sh.normalBias;
    undo.push(() => { sun.position.copy(p0); sun.color.setHex(c0); sun.intensity = i0; if (sh) { sh.bias = b0; sh.normalBias = n0; sh.needsUpdate = true; } });
    const tp = sun.target ? sun.target.position : v.set(0, 0, 0), d = size.copy(sun.position).sub(tp), L = d.length() || 1, hz = Math.hypot(d.x, d.z);
    if (hz > 1e-3) {
      const el = Math.max(0.2, Math.min(Math.atan2(d.y, hz), 0.38)), ch = Math.cos(el) / hz;
      d.set(d.x * ch, Math.sin(el), d.z * ch).multiplyScalar(L); sun.position.copy(tp).add(d);
    }
    sun.color.setRGB(1.0, 0.8, 0.6); sun.intensity = i0 * 1.3;
    if (sh) { sh.bias = -0.0003; sh.normalBias = 0.1; sh.needsUpdate = true; }
    uSun.value.copy(sun.position).sub(tp).normalize();
    if (renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
  }
  const hemi = new T.HemisphereLight(0x9db8e6, 0x5a4636, 0.42);
  const hall = new T.PointLight(0xffc58a, 0, 60, 0.5); // gentle decay: even house light, no hot spots
  const fill = null; // One sun + one sky fill outside; avoid redundant per-pixel light loops.
  if (fill) fill.position.set(-uSun.value.x, 0.6, -uSun.value.z);
  scene.add(hemi, hall); if (fill) scene.add(fill);
  stats.addedLights = fill ? 3 : 2;

  const exteriorSunIntensity=sun?.intensity??4;
  let fitted = false, hallI = 4, mode = -1;
  const boxOf = (list) => { box.makeEmpty(); for (const o of list) box.expandByObject(o); box.getSize(size); box.getCenter(ctr); return !box.isEmpty() && size.x < 1500 && size.z < 1500 && size.y > 0.5; };
  const fit = () => { // once, after the parent's first form.apply; bounds are derived from existing geometry only
    fitted = true; scene.updateMatrixWorld(true);
    let ok = boxOf(hallMeshes), r = 20;
    if (ok) { r = Math.max(size.x, size.z) * 0.5 + 12; hall.position.set(ctr.x, box.min.y - 8, ctr.z); }
    else if ((ok = boxOf(timberMeshes))) { r = Math.max(size.x, size.z) * 0.5 + 6; hall.position.set(ctr.x, box.min.y + size.y * 0.45, ctr.z); }
    if (boxOf(shellMeshes)) {
      const wy = waterMesh ? waterMesh.getWorldPosition(v).y : box.min.y;
      uBld.value.set(ctr.x, ctr.z, Math.max(size.x * 0.45, 1), Math.max(size.z * 0.45, 1));
      uBldY.value.set(wy, Math.max((box.max.y - wy) * 1.1, 1), 1);
      if (!ok) hall.position.set(ctr.x, box.min.y + size.y * 0.3, ctr.z);
    }
    r = Math.min(40, Math.max(6, r)); hall.distance = r * 1.6; hallI = 0.9 * Math.sqrt(r); mode = -1;
  };

  function update(seconds, interior = false, options={}) {
    if (!fitted) fit();
    const bp=!!options.blueprint,strength=Math.max(.1,Math.min(2,options.lightStrength??1));
    uEnabled.value=bp?0:1;uBldY.value.z=Math.max(0,Math.min(1,options.shells??1));
    uTime.value = seconds % 1800; // absolute time -> frame-independent motion
    if (sun && sun.isLight) { uSun.value.copy(sun.position); if (sun.target) uSun.value.sub(sun.target.position); uSun.value.normalize(); }
    const k = interior ? 1 : 0,modeKey=k+(bp?2:0);
    if (modeKey !== mode) { // Mode changes restore maps without allocating new materials.
      mode = modeKey;skyMesh.visible=!bp;hemi.visible=!bp;hall.visible=!bp&&!!k;
      for(const light of originalFill)light.visible=bp;
      if(waterMesh)waterMesh.material=bp?waterOld:waterMat;
      for(const s of textureState){let changed=false;for(const key of ['map','bumpMap','normalMap','roughnessMap']){const next=bp?null:s[key];if(s.m[key]!==next){s.m[key]=next;changed=true;}}if(s.emissive)s.m.emissive.copy(bp?new T.Color(0):s.emissive);if(changed)s.m.needsUpdate=true;}
      // The cutaway is an explanatory interior, not direct outdoor sunlight through a removed roof.
      if(sun){sun.castShadow=!low&&!k&&!bp;if(renderer.shadowMap)renderer.shadowMap.needsUpdate=true;}
      if (fill) fill.intensity = k ? 0.08 : 0.22; uRimK.value = k ? 0.3 : 1;
    }
    hemi.intensity=(k?.90:.78)*strength;hall.intensity=hallI*(k?1.25:0)*strength;
    if(sun)sun.intensity=bp?0:(k?.35:exteriorSunIntensity)*strength;
  }

  function dispose() {
    for (let i = undo.length - 1; i >= 0; i--) undo[i]();
    undo.length = 0; kinds.clear(); shellMeshes.length = hallMeshes.length = timberMeshes.length = 0;
    if (waterMesh && waterOld) waterMesh.material = waterOld;
    scene.remove(skyMesh, hemi, hall); if (fill) { scene.remove(fill); fill.dispose(); }
    hemi.dispose(); hall.dispose();
    waterMat.dispose(); skyMat.dispose(); skyGeo.dispose(); tileMap.dispose(); tileDetail.dispose();
    if (renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
  }

  return { update, dispose, stats };
}
