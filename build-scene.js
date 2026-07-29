/* Cinematic scroll-driven WebGL journey: Room A "Ingredients" -> Room B "The Pour".
   A single fixed canvas whose camera and objects are driven entirely by scroll
   progress through two tall page sections. */
import * as THREE from './vendor/three.module.min.js';

export function createBuildScene(canvas, opts = {}) {
  const waxColor = opts.waxColor || '#c9762f';

  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  const hemi = new THREE.HemisphereLight(0x554a55, 0x120c09, 0.7);
  scene.add(hemi);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(-3, 3, -2);
  scene.add(rim);
  const key = new THREE.PointLight(0xffb87a, 2, 12, 2);
  key.position.set(1.5, 2, 3);
  scene.add(key);

  /* ---------- Room A: raw ingredients ---------- */
  const ingredients = new THREE.Group();
  scene.add(ingredients);

  function waxBlock(x, y, z, scale = 1) {
    const geo = new THREE.BoxGeometry(0.9 * scale, 0.55 * scale, 0.9 * scale, 2, 2, 2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.7, emissive: 0x33291a, emissiveIntensity: 0.15 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.2);
    return m;
  }
  function oilBottle(x, y, z, color) {
    const g = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.65, 24);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.1, thickness: 0.3, transparent: true, opacity: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    g.add(body);
    const liquidGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.4, 24);
    const liquidMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.4, roughness: 0.3 });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = -0.1;
    g.add(liquid);
    const capGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.18, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: 0.5 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.4;
    g.add(cap);
    g.position.set(x, y, z);
    return g;
  }
  function wickSpool(x, y, z) {
    const geo = new THREE.TorusGeometry(0.32, 0.13, 12, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd8cdb0, roughness: 0.8 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.x = Math.PI / 2;
    return m;
  }

  ingredients.add(waxBlock(-1.4, 0.3, -0.4, 1.1));
  ingredients.add(waxBlock(-0.6, -0.5, 0.6, 0.85));
  ingredients.add(waxBlock(1.5, -0.2, -0.6, 0.95));
  ingredients.add(oilBottle(1.6, 0.9, 0.5, 0xff8a3d));
  ingredients.add(oilBottle(2.1, 0.3, 0.9, 0x5be3ff));
  ingredients.add(oilBottle(-1.9, 0.8, 0.8, 0xc76cff));
  ingredients.add(wickSpool(0.3, 0.9, -1));

  const ingredientMeshes = [];
  ingredients.traverse((o) => { if (o.isMesh) ingredientMeshes.push(o); });

  /* ---------- Room B: jar + wax pour ---------- */
  const jarGroup = new THREE.Group();
  jarGroup.visible = false;
  scene.add(jarGroup);

  const jarGeo = new THREE.CylinderGeometry(1.05, 1.05, 2.7, 48, 1, true);
  const jarMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, transmission: 1, thickness: 0.4, transparent: true, opacity: 0.4, ior: 1.45, side: THREE.DoubleSide });
  const jar = new THREE.Mesh(jarGeo, jarMat);
  jarGroup.add(jar);

  const waxGeo = new THREE.CylinderGeometry(0.96, 0.98, 1, 48, 1, false);
  waxGeo.translate(0, 0.5, 0);
  const waxMat = new THREE.MeshStandardMaterial({ color: waxColor, roughness: 0.55, emissive: waxColor, emissiveIntensity: 0.2 });
  const wax = new THREE.Mesh(waxGeo, waxMat);
  wax.position.y = -1.35;
  wax.scale.y = 0.001;
  jarGroup.add(wax);

  const streamGeo = new THREE.CylinderGeometry(0.05, 0.08, 2, 12, 1, true);
  const streamMat = new THREE.MeshBasicMaterial({ color: waxColor, transparent: true, opacity: 0 });
  const stream = new THREE.Mesh(streamGeo, streamMat);
  stream.position.y = 1.6;
  jarGroup.add(stream);

  const wickGeo = new THREE.CylinderGeometry(0.022, 0.028, 0.4, 8);
  const wickMat = new THREE.MeshBasicMaterial({ color: 0x2a1c14, transparent: true, opacity: 0 });
  const wick = new THREE.Mesh(wickGeo, wickMat);
  wick.position.y = 2.2;
  jarGroup.add(wick);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();

  /* progress: 0..1 across Room A, then 1..2 across Room B (2 = end, settles) */
  let progress = 0;
  let active = true;
  function setProgress(p) {
    progress = p;
  }
  function setActive(v) {
    active = v;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!active) return;
    const t = clock.getElapsedTime();

    if (progress <= 1) {
      /* Room A: ingredients orbiting, camera circling */
      ingredients.visible = true;
      jarGroup.visible = false;
      const a = progress * Math.PI * 0.7 - 0.9;
      camera.position.set(Math.sin(a) * 6, 1.4 + Math.sin(t * 0.4) * 0.1, Math.cos(a) * 6);
      camera.lookAt(0, 0.2, 0);
      ingredientMeshes.forEach((m, i) => {
        m.rotation.y += 0.003 + i * 0.0004;
        m.position.y += Math.sin(t * 0.8 + i) * 0.0015;
      });
      ingredients.children.forEach((m) => {
        m.traverse((o) => {
          if (o.material) o.material.opacity = o.material.opacity !== undefined ? Math.min(o.material.opacity, 1) : 1;
        });
      });
    } else {
      /* Room B: pour + camera push-in */
      const bp = Math.min(1, progress - 1);
      ingredients.visible = bp < 0.15;
      if (ingredients.visible) {
        const fade = 1 - bp / 0.15;
        ingredientMeshes.forEach((m) => { if (m.material) m.material.opacity = fade * (m.material.userData?.baseOpacity ?? 1); });
      }
      jarGroup.visible = true;

      const camA = { pos: [1.6, 1.0, 5.2], look: [0, 0.2, 0] };
      const camB = { pos: [0, 0.15, 4.0], look: [0, 0.1, 0] };
      const cx = camA.pos[0] + (camB.pos[0] - camA.pos[0]) * bp;
      const cy = camA.pos[1] + (camB.pos[1] - camA.pos[1]) * bp;
      const cz = camA.pos[2] + (camB.pos[2] - camA.pos[2]) * bp;
      camera.position.set(cx, cy, cz);
      camera.lookAt(camA.look[0] + (camB.look[0] - camA.look[0]) * bp, camA.look[1] + (camB.look[1] - camA.look[1]) * bp, camA.look[2]);

      const fillP = Math.min(1, bp / 0.65);
      wax.scale.y = Math.max(0.001, fillP);
      wax.position.y = -1.35 + fillP * 0.5;

      streamMat.opacity = bp > 0.05 && bp < 0.7 ? 0.5 : 0;
      stream.position.y = 1.6 - fillP * 0.4;

      const wickP = Math.min(1, Math.max(0, (bp - 0.72) / 0.18));
      wick.position.y = 2.2 - wickP * 1.85;
      wickMat.opacity = bp > 0.72 ? 1 : 0;

      jarGroup.rotation.y += 0.0008;
    }

    renderer.render(scene, camera);
  }
  animate();

  return { setProgress, setActive };
}
