// The world around the subject: sky (stars on a moonless night, or day), the sea surface, the water's colour
// with depth, and the seabed. Lives in model coordinates (z up), inside the renderer's root group.
import { LOOK } from './shapes.js';
import { groundFn } from './geom.js';
import { rng } from './math.js';

export const SEA = {
  night: { sky: '#060a13', surface: '#0e2338', surfaceOpacity: 0.55 },
  day: { sky: '#a9cbe3', surface: '#2a6f9e', surfaceOpacity: 0.45 },
  shallow: '#0b2a40', deep: '#03070c',
};

export function buildEnvironment(THREE, model, { centre = [0, 0], size: wanted } = {}) {
  const group = new THREE.Group(), sky = model.environment.sky === 'night' ? SEA.night : SEA.day, depth = model.environment.seaDepth || 0;
  // stars on a large dome, seen only from above the water
  const stars = new THREE.Group();
  if (model.environment.sky === 'night') {
    const r = rng(11), pos = [];
    for (let i = 0; i < 1500; i++) {
      const az = r() * Math.PI * 2, el = Math.asin(0.03 + r() * 0.97), R = 9000;
      pos.push(Math.cos(el) * Math.cos(az) * R, Math.cos(el) * Math.sin(az) * R, Math.sin(el) * R);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    stars.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: '#dfe8ff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false })));
  }
  group.add(stars);
  // the sea surface: a wide translucent plane at z = 0
  const surfMat = new THREE.MeshBasicMaterial({ color: sky.surface, transparent: true, opacity: sky.surfaceOpacity, side: THREE.DoubleSide, depthWrite: false });
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), surfMat);
  surface.renderOrder = 2; group.add(surface);
  // the seabed: a seeded relief around the wreck site
  let seabed = null;
  if (depth > 0) {
    const size = wanted || model.environment.seabed?.size || 4000, seg = Math.min(160, Math.max(96, Math.round(size / 60)));
    const geo = new THREE.PlaneGeometry(size, size, seg, seg), p = geo.attributes.position, ground = groundFn(model);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + centre[0], y = p.getY(i) + centre[1];
      p.setXYZ(i, x, y, ground(x, y));
    }
    geo.computeVertexNormals();
    seabed = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
    seabed.userData = { role: 'seabed', color: LOOK.sand, noEdges: true };
    group.add(seabed);
  }
  return {
    group, stars, surface, seabed, sky,
    // fog and background follow the camera: open sky above the surface, darkening water below it
    update(scene, cameraZ, style, BP, dist = 500) {
      const under = cameraZ < 0, f = Math.min(1, Math.max(0, -cameraZ / 1500));
      stars.visible = !under && style === 'color';
      if (style === 'blueprint') { scene.background = new THREE.Color(BP.bg); scene.fog = null; surfMat.color.set(BP.dim); surfMat.opacity = 0.25; return; }
      surfMat.color.set(sky.surface); surfMat.opacity = sky.surfaceOpacity;
      if (!under) { scene.background = new THREE.Color(sky.sky); scene.fog = null; return; }
      const c = new THREE.Color(SEA.shallow).lerp(new THREE.Color(SEA.deep), f);
      scene.background = c; scene.fog = new THREE.Fog(c, dist * 1.1, dist * 5);
    },
  };
}
