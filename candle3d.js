/* Real WebGL 3D candle scene (Three.js) — glass jar, colored wax, animated
   shader flame, dynamic point light, mouse parallax. Vendored Three.js
   locally so the site has no third-party CDN dependency. */
import * as THREE from './vendor/three.module.min.js';

export function createCandleScene(container, options = {}) {
  const { waxColor = '#c9762f', interactive = true, autoSpin = true } = options;

  let width = container.clientWidth || 300;
  let height = container.clientHeight || 300;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
  camera.position.set(0, 0.25, 6.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  const waxThree = new THREE.Color(waxColor);

  /* Lighting */
  const hemi = new THREE.HemisphereLight(0x5a5560, 0x120c09, 0.65);
  scene.add(hemi);

  const rim = new THREE.DirectionalLight(0xffffff, 0.35);
  rim.position.set(-3, 2.4, -2);
  scene.add(rim);

  const flameLight = new THREE.PointLight(waxThree, 3, 9, 2);
  flameLight.position.set(0, 1.5, 0.4);
  scene.add(flameLight);

  /* Whole-candle group, used for rotation/tilt */
  const group = new THREE.Group();
  scene.add(group);

  /* Glass jar */
  const jarGeo = new THREE.CylinderGeometry(1.05, 1.05, 2.7, 56, 1, true);
  const jarMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.06,
    transmission: 1,
    thickness: 0.4,
    transparent: true,
    opacity: 0.4,
    ior: 1.45,
    clearcoat: 0.4,
    side: THREE.DoubleSide,
  });
  const jar = new THREE.Mesh(jarGeo, jarMat);
  group.add(jar);

  /* Rim lip */
  const lipGeo = new THREE.TorusGeometry(1.05, 0.045, 12, 48);
  const lipMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.6 });
  const lip = new THREE.Mesh(lipGeo, lipMat);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = 1.35;
  group.add(lip);

  /* Wax */
  const waxGeo = new THREE.CylinderGeometry(0.96, 0.98, 1.55, 56);
  const waxMat = new THREE.MeshStandardMaterial({
    color: waxThree,
    roughness: 0.55,
    metalness: 0,
    emissive: waxThree,
    emissiveIntensity: 0.22,
  });
  const wax = new THREE.Mesh(waxGeo, waxMat);
  wax.position.y = -0.6;
  group.add(wax);

  /* Wax surface pool highlight */
  const poolGeo = new THREE.CircleGeometry(0.9, 48);
  const poolMat = new THREE.MeshStandardMaterial({
    color: waxThree,
    roughness: 0.2,
    metalness: 0.1,
    emissive: waxThree,
    emissiveIntensity: 0.35,
  });
  const pool = new THREE.Mesh(poolGeo, poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.175;
  group.add(pool);

  /* Wick */
  const wickGeo = new THREE.CylinderGeometry(0.022, 0.028, 0.4, 8);
  const wickMat = new THREE.MeshBasicMaterial({ color: 0x2a1c14 });
  const wick = new THREE.Mesh(wickGeo, wickMat);
  wick.position.y = 0.36;
  group.add(wick);

  /* Flame — shader-animated cone, additive glow */
  const flameGeo = new THREE.ConeGeometry(0.16, 0.46, 20, 12, true);
  flameGeo.translate(0, 0.23, 0);
  const flameMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(waxColor) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float k = (1.0 - uv.y);
        pos.x += sin(uTime * 6.2 + pos.y * 7.0) * 0.05 * k;
        pos.z += cos(uTime * 5.1 + pos.y * 6.0) * 0.04 * k;
        pos.y += sin(uTime * 8.0) * 0.015;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float alpha = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
        vec3 core = mix(uColor, vec3(1.0, 0.96, 0.85), clamp((1.0 - vUv.y) * 0.9, 0.0, 1.0));
        gl_FragColor = vec4(core, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.y = 1.55;
  group.add(flame);

  /* Soft glow sprite behind the flame for extra bloom-like presence */
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: waxThree, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(1.6, 1.6, 1);
  glow.position.y = 1.55;
  group.add(glow);

  /* Interaction: mouse parallax rotation */
  let targetRotY = 0, targetRotX = 0;
  function onMove(e) {
    const rect = container.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetRotY = nx * 0.7;
    targetRotX = -ny * 0.28;
  }
  if (interactive) {
    window.addEventListener('mousemove', onMove);
  }

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resize);

  let rafId;
  const clock = new THREE.Clock();
  let idleSpin = 0;

  function animate() {
    const t = clock.getElapsedTime();
    flameMat.uniforms.uTime.value = t;
    const flicker = 2.6 + Math.sin(t * 9.1) * 0.35 + Math.sin(t * 4.7) * 0.25 + Math.sin(t * 17) * 0.1;
    flameLight.intensity = flicker;
    glowMat.opacity = 0.55 + Math.sin(t * 9.1) * 0.15;

    if (autoSpin) idleSpin += 0.0016;
    group.rotation.y += (targetRotY + idleSpin - group.rotation.y) * 0.05;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.05;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }
  animate();

  return {
    setColor(hex) {
      const c = new THREE.Color(hex);
      waxMat.color.copy(c);
      waxMat.emissive.copy(c);
      poolMat.color.copy(c);
      poolMat.emissive.copy(c);
      flameLight.color.copy(c);
      flameMat.uniforms.uColor.value.copy(c);
      glowMat.color.copy(c);
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      if (interactive) window.removeEventListener('mousemove', onMove);
      renderer.dispose();
      jarGeo.dispose();
      waxGeo.dispose();
      wickGeo.dispose();
      flameGeo.dispose();
      poolGeo.dispose();
      lipGeo.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    },
  };
}
