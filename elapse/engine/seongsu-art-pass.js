// Seongsu Bridge art pass: the Han River surface and the air above it. Authored look only; nothing here is a
// record. The river keeps its ripple tone and gains a view-angle (Fresnel) reflection of the hazy sky, so the far
// water lightens toward the horizon, and its plane edge dissolves into the same haze as the sky and fog
// (shared with the Eiffel pass). Ripples move with the timeline t, never the wall clock.
// The far-bank blocks are generic illustrative skyline, not surveyed buildings.
import * as T from 'three';
import {HAZE} from './eiffel-art-pass.js';

export const RIVER_LOOK = {
  deep: new T.Color('#3d6468'),      // the near water, a little deeper and greener than before
  sky: new T.Color('#a9c1d3'),       // what the water reflects higher up
  strength: .78,                     // cap on the reflection mix
  fade: [560, 790]                   // plane edge -> haze (m from the bridge centre, model x/y)
};

// patch the river material (already carrying the ripple tone). Returns {setArt(on), setTime(t)}.
export function patchRiver(material, look = RIVER_LOOK) {
  const U = {
    uRvArt: {value: 1}, uRvTime: {value: 0}, uRvHaze: {value: HAZE}, uRvSky: {value: look.sky}, uRvDeep: {value: look.deep},
    uRvStrength: {value: look.strength}, uRvFade: {value: new T.Vector2(...look.fade)}
  };
  const prev = material.onBeforeCompile, prevKey = material.customProgramCacheKey?.bind(material);
  material.onBeforeCompile = (s, r) => {
    prev?.(s, r);
    Object.assign(s.uniforms, U);
    s.vertexShader = 'varying vec3 vRvWorld;\n' + s.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
vRvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    s.fragmentShader = `varying vec3 vRvWorld;
uniform float uRvArt, uRvTime, uRvStrength; uniform vec3 uRvHaze, uRvSky, uRvDeep; uniform vec2 uRvFade;
` + s.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * (uRvDeep / vec3(0.0844, 0.2051, 0.2232)), 0.55 * uRvArt);`)
      .replace('#include <opaque_fragment>', `{
  vec3 V = normalize(cameraPosition - vRvWorld);
  float c = clamp(V.y, 0.0, 1.0);
  float fr = 0.02 + 0.98 * pow(1.0 - c, 5.0);
  // long, low swell across the flow, fading out before it gets smaller than a pixel
  vec2 p = vRvWorld.xz; float px = fwidth(p.x) + fwidth(p.y);
  float fine = 1.0 - smoothstep(0.6, 3.0, px);
  float sw = sin(p.x * 0.19 + p.y * 0.045 + uRvTime) * sin(p.y * 0.31 - p.x * 0.06 - uRvTime * 0.7);
  fr = clamp(fr * (1.0 + 0.4 * sw * fine), 0.0, 1.0);
  vec3 refl = mix(uRvHaze, uRvSky, smoothstep(0.02, 0.5, c));
  outgoingLight = mix(outgoingLight, refl, min(fr, uRvStrength) * uRvArt);
}
#include <opaque_fragment>`)
      .replace('#include <fog_fragment>', `#include <fog_fragment>
gl_FragColor.rgb = mix(gl_FragColor.rgb, linearToOutputTexel(vec4(uRvHaze, 1.0)).rgb, smoothstep(uRvFade.x, uRvFade.y, length(vRvWorld.xz)) * uRvArt);`);
  };
  material.customProgramCacheKey = () => (prevKey ? prevKey() : '') + '|seongsu-river-v1';
  material.needsUpdate = true;
  return {
    uniforms: U,
    setArt(on) { U.uRvArt.value = on ? 1 : 0; },
    setTime(t) { U.uRvTime.value = t * .8; }
  };
}
