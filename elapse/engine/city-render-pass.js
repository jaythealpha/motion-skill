// city-render-pass.js — bounded HDR filmic presentation pass for Three.js r180 (WebGLRenderer).
// Targets: 1 full-res linear scene colour + 2 quarter-res bloom. Fullscreen passes: 4.
// The full canvas is treated as the view; caller viewport/scissor are saved and restored.
import * as T from 'three';

const VERT = /* glsl */`varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// Pass 1: 4x downsample + selective highlight extraction (warm emitters favoured, sky/facades excluded).
const FRAG_BRIGHT = /* glsl */`uniform sampler2D tScene; uniform vec2 uTexel; uniform vec3 uThreshold; varying vec2 vUv;
vec3 pick(vec2 uv){
  vec3 c = clamp(texture2D(tScene, uv).rgb, 0.0, 4.0);
  float peak = max(c.r, max(c.g, c.b));
  float warm = clamp((c.r - c.b) / max(peak, 1e-4), 0.0, 1.0);
  float thr = mix(uThreshold.x, uThreshold.y, warm * warm);
  return c * smoothstep(thr, thr + uThreshold.z, peak);
}
void main(){
  vec3 c = pick(vUv + uTexel * vec2(-1.0, -1.0)) + pick(vUv + uTexel * vec2(1.0, -1.0))
         + pick(vUv + uTexel * vec2(-1.0, 1.0)) + pick(vUv + uTexel * vec2(1.0, 1.0));
  gl_FragColor = vec4(c * 0.25, 1.0);
}`;

// Passes 2+3: separable gaussian (sigma 2, 9 texels folded into 5 bilinear taps; weights derived here).
const FRAG_BLUR = /* glsl */`uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec3 c = texture2D(tSrc, vUv).rgb * 0.2042;
  c += (texture2D(tSrc, vUv + uDir * 1.4073).rgb + texture2D(tSrc, vUv - uDir * 1.4073).rgb) * 0.3040;
  c += (texture2D(tSrc, vUv + uDir * 3.2941).rgb + texture2D(tSrc, vUv - uDir * 3.2941).rgb) * 0.0939;
  gl_FragColor = vec4(c, 1.0);
}`;

// Pass 4: along-edge antialias (averaging only, no sharpening), bloom, grade, single tonemap + output transform.
// ShaderMaterial injects tonemapping_pars_fragment / colorspace_pars_fragment itself; only the bodies are included.
const FRAG_FINAL = /* glsl */`uniform sampler2D tScene; uniform sampler2D tBloom; uniform vec2 uTexel; uniform float uBloom; varying vec2 vUv;
float lum(vec3 c){ return dot(max(c, 0.0), vec3(0.2126, 0.7152, 0.0722)); }
float plum(vec3 c){ float l = lum(c); return l / (1.0 + l); }
void main(){
  vec4 centre = texture2D(tScene, vUv);
  vec3 c = max(centre.rgb, 0.0);
  float ln = plum(texture2D(tScene, vUv + vec2(0.0, uTexel.y)).rgb);
  float ls = plum(texture2D(tScene, vUv - vec2(0.0, uTexel.y)).rgb);
  float le = plum(texture2D(tScene, vUv + vec2(uTexel.x, 0.0)).rgb);
  float lw = plum(texture2D(tScene, vUv - vec2(uTexel.x, 0.0)).rgb);
  float lc = plum(c);
  float hi = max(lc, max(max(ln, ls), max(le, lw)));
  float lo = min(lc, min(min(ln, ls), min(le, lw)));
  float thr = max(0.035, hi * 0.14);
  float amt = smoothstep(thr, thr * 2.5, hi - lo);
  vec2 g = vec2(le - lw, ln - ls);
  if (amt > 0.0 && dot(g, g) > 1e-6) {
    vec2 t = vec2(-g.y, g.x);
    t *= 0.75 / max(abs(t.x), abs(t.y));
    vec3 a = max(texture2D(tScene, vUv + t * uTexel).rgb, 0.0);
    vec3 b = max(texture2D(tScene, vUv - t * uTexel).rgb, 0.0);
    float wa = 1.0 / (1.0 + lum(a)), wb = 1.0 / (1.0 + lum(b));
    c = mix(c, (a * wa + b * wb) / (wa + wb), 0.5 * amt);
  }
  vec3 bloom = texture2D(tBloom, vUv).rgb;
  bloom /= 1.0 + 0.5 * max(bloom.r, max(bloom.g, bloom.b));            // bounded glow
  c += bloom * uBloom * mix(0.3, 1.0, smoothstep(0.015, 0.3, lum(c))); // keep dark smoke dark
  float l = lum(c);
  c *= mix(vec3(0.975, 0.995, 1.03), vec3(1.025, 1.0, 0.97), smoothstep(0.02, 0.9, l)); // cool shadows / warm lights
  c = max(mix(vec3(lum(c)), c, 1.07), 0.0);                            // mild saturation
  c = 0.18 * pow(c / 0.18, vec3(1.06));                                // mild contrast about mid grey
  gl_FragColor = vec4(c, centre.a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createCityRenderPass({ renderer, scene, camera, low = false }) {
  const direct = () => renderer.render(scene, camera);
  if (low) {
    return { render() { direct(); }, resize() {}, dispose() {},
      info: () => ({ mode: 'bypass', reason: 'low', fallback: false, targets: 0, passes: 1 }) };
  }

  const TAG = '[city-render-pass]', MAX_PR = 2, SPREAD = 1.5;
  let sceneStats={calls:0,triangles:0};
  let failed = null, disposed = false, last = 'none', checked = false;
  let sceneRT = null, bloomA = null, bloomB = null, sw = 0, sh = 0, bw = 0, bh = 0;
  let gl = null, hdr = false, limit = 4096, stencil = false;

  const fail = (reason, err) => {
    failed = reason; free();
    if (err) console.error(`${TAG} falling back to direct rendering (${reason})`, err);
    else console.warn(`${TAG} falling back to direct rendering (${reason})`);
  };

  if (!renderer || renderer.isWebGLRenderer !== true) fail('unsupported-renderer');
  else {
    gl = renderer.getContext();
    hdr = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
    limit = Math.max(1, Math.min(renderer.capabilities.maxTextureSize || 4096, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 4096, 8192));
    stencil = !!(gl.getContextAttributes() && gl.getContextAttributes().stencil);
  }

  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const mat = (fragmentShader, uniforms, toneMapped = false) => new T.ShaderMaterial({
    vertexShader: VERT, fragmentShader, uniforms, toneMapped, depthTest: false, depthWrite: false, blending: T.NoBlending });
  const bright = mat(FRAG_BRIGHT, { tScene: { value: null }, uTexel: { value: new T.Vector2() }, uThreshold: { value: new T.Vector3() } });
  const blur = mat(FRAG_BLUR, { tSrc: { value: null }, uDir: { value: new T.Vector2() } });
  const final = mat(FRAG_FINAL, { tScene: { value: null }, tBloom: { value: null }, uTexel: { value: new T.Vector2() }, uBloom: { value: 0.5 } }, true);
  const mats = [bright, blur, final];
  const tri = new T.Mesh(geometry, bright); tri.frustumCulled = false;
  const quadCam = new T.Camera();
  const size = new T.Vector2(), vp = new T.Vector4(), sc = new T.Vector4(), cc = new T.Color(), st = {};

  function free() {
    if (sceneRT) sceneRT.dispose(); if (bloomA) bloomA.dispose(); if (bloomB) bloomB.dispose();
    sceneRT = bloomA = bloomB = null; sw = sh = bw = bh = 0;
  }
  function build(w, h, qw, qh) {
    const mk = (x, y, depth) => new T.WebGLRenderTarget(x, y, { type: hdr ? T.HalfFloatType : T.UnsignedByteType,
      format: T.RGBAFormat, minFilter: T.LinearFilter, magFilter: T.LinearFilter, generateMipmaps: false,
      depthBuffer: depth, stencilBuffer: depth && stencil, samples: 0 });
    sceneRT = mk(w, h, true); bloomA = mk(qw, qh, false); bloomB = mk(qw, qh, false);
  }
  function complete() { // verify framebuffers so an unsupported format never yields a silent black frame
    const prev = renderer.getRenderTarget(), face = renderer.getActiveCubeFace(), mip = renderer.getActiveMipmapLevel();
    try {
      for (const rt of [sceneRT, bloomA, bloomB]) {
        renderer.setRenderTarget(rt);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return false;
      }
      return true;
    } finally { renderer.setRenderTarget(prev, face, mip); }
  }
  function ensure(cssW, cssH) {
    if (failed || disposed || gl.isContextLost()) return false;
    const pr = Math.min(Math.max(renderer.getPixelRatio() || 1, 0.25), MAX_PR);
    let w = Math.floor(cssW * pr), h = Math.floor(cssH * pr);
    if (!(w >= 1 && h >= 1)) return false;                       // 0x0 / NaN: nothing to allocate
    const k = Math.min(1, limit / Math.max(w, h));
    w = Math.max(1, Math.floor(w * k)); h = Math.max(1, Math.floor(h * k));
    if (sceneRT && w === sw && h === sh) return true;            // unchanged: no reallocation
    const qw = Math.max(1, Math.ceil(w / 4)), qh = Math.max(1, Math.ceil(h / 4));
    try {
      if (sceneRT) { sceneRT.setSize(w, h); bloomA.setSize(qw, qh); bloomB.setSize(qw, qh); } // disposes old GL storage
      else build(w, h, qw, qh);
      let ok = complete();
      if (!ok && hdr) { hdr = false; free(); build(w, h, qw, qh); ok = complete(); }           // LDR fallback
      if (!ok) throw new Error('render target framebuffer incomplete');
    } catch (e) { fail('target-allocation', e); return false; }
    sw = w; sh = h; bw = qw; bh = qh;
    bright.uniforms.tScene.value = final.uniforms.tScene.value = sceneRT.texture;
    final.uniforms.tBloom.value = bloomA.texture;
    bright.uniforms.uTexel.value.set(1 / w, 1 / h); final.uniforms.uTexel.value.set(1 / w, 1 / h);
    if (hdr) bright.uniforms.uThreshold.value.set(1.0, 0.72, 0.6); else bright.uniforms.uThreshold.value.set(0.9, 0.68, 0.2);
    final.uniforms.uBloom.value = hdr ? 0.5 : 0.35;
    return true;
  }
  const exposure = () => (hdr ? 1.0 : 1.1);

  function save() {
    st.rt = renderer.getRenderTarget(); st.face = renderer.getActiveCubeFace(); st.mip = renderer.getActiveMipmapLevel();
    st.ac = renderer.autoClear; st.acc = renderer.autoClearColor; st.acd = renderer.autoClearDepth; st.acs = renderer.autoClearStencil;
    st.tm = renderer.toneMapping; st.ex = renderer.toneMappingExposure;
    renderer.getViewport(vp); renderer.getScissor(sc); st.sct = renderer.getScissorTest();
    renderer.getClearColor(cc); st.ca = renderer.getClearAlpha();
  }
  function restore() {
    renderer.autoClear = st.ac; renderer.autoClearColor = st.acc; renderer.autoClearDepth = st.acd; renderer.autoClearStencil = st.acs;
    renderer.toneMapping = st.tm; renderer.toneMappingExposure = st.ex;
    renderer.setRenderTarget(st.rt, st.face, st.mip); st.rt = null;
    renderer.setViewport(vp); renderer.setScissor(sc); renderer.setScissorTest(st.sct);
    renderer.setClearColor(cc, st.ca);
  }
  function pass(material, target) {
    tri.material = material; material.uniformsNeedUpdate = true;
    renderer.setRenderTarget(target); renderer.render(tri, quadCam);
  }
  function programsOk() { // three logs shader errors itself; this only detects them to trigger the fallback
    for (const m of mats) {
      const p = renderer.properties && renderer.properties.get(m).currentProgram;
      if (p && p.diagnostics && p.diagnostics.runnable === false) return false;
    }
    return true;
  }
  function renderFull() {
    let ok = true;
    save();
    try {
      renderer.setScissorTest(false); renderer.setViewport(0, 0, size.x, size.y);
      renderer.toneMapping = T.NoToneMapping;                    // targets stay scene-linear
      renderer.autoClear = renderer.autoClearColor = renderer.autoClearDepth = renderer.autoClearStencil = true;
      renderer.setRenderTarget(sceneRT); renderer.render(scene, camera);
      sceneStats={calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
      renderer.autoClear = false;
      pass(bright, bloomA);
      blur.uniforms.tSrc.value = bloomA.texture; blur.uniforms.uDir.value.set(SPREAD / bw, 0); pass(blur, bloomB);
      blur.uniforms.tSrc.value = bloomB.texture; blur.uniforms.uDir.value.set(0, SPREAD / bh); pass(blur, bloomA);
      renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = exposure(); // the one tonemap
      pass(final, null);
      if (!checked) { checked = true; if (!programsOk()) { fail('shader-program'); ok = false; } }
    } catch (e) { fail('render-error', e); ok = false; }
    finally { restore(); }
    return ok;
  }

  return {
    render({ blueprint = false } = {}) {
      let full = false;
      if (!blueprint && !failed && !disposed && !(renderer.xr && renderer.xr.isPresenting)) {
        renderer.getSize(size);
        full = ensure(size.x, size.y) && renderFull();
      }
      if (!full) direct();                                        // caller's own tone mapping / colours untouched
      last = full ? 'full' : 'direct';
    },
    resize(width, height) { ensure(+width, +height); },
    dispose() {
      if (disposed) return;
      disposed = true; free(); mats.forEach((m) => m.dispose()); geometry.dispose();
    },
    info() {
      if (failed) return { mode: 'fallback', fallback: true, reason: failed, targets: 0, passes: 1, lastFrame: last };
      if (disposed) return { mode: 'disposed', fallback: false, targets: 0, passes: 1, lastFrame: last };
      return { mode: 'full', fallback: false, hdr, targetType: hdr ? 'HalfFloat' : 'UnsignedByte', samples: 0,
        targets: sceneRT ? 3 : 0, passes: 5, fullscreenPasses: 4, toneMapping: 'ACESFilmic', exposure: exposure(),
        scene: { width: sw, height: sh }, bloom: { width: bw, height: bh }, sceneStats, lastFrame: last };
    }
  };
}
