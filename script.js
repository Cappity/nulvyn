
import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const canvas = document.querySelector("#scene");
const visual = document.querySelector(".visual");

const reducedMotion =
window.matchMedia("(prefers-reduced-motion: reduce)").matches;

try {

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    visual.clientWidth,
    visual.clientHeight,
    false
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    34,
    visual.clientWidth / visual.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 8.5);

  const group = new THREE.Group();
  scene.add(group);

  // Metallic N symbol

  const points = [
    new THREE.Vector3(-2.15, -0.95, 0),
    new THREE.Vector3(-2.12, 0.55, 0.04),
    new THREE.Vector3(-1.75, 0.92, 0.12),
    new THREE.Vector3(-0.25, -0.76, 0.1),
    new THREE.Vector3(0.15, -0.9, 0),
    new THREE.Vector3(1.65, 0.88, -0.08),
    new THREE.Vector3(2.12, 0.72, 0)
  ];

  const nCurve = new THREE.CatmullRomCurve3(points);

  const nGeometry = new THREE.TubeGeometry(
    nCurve,
    150,
    0.105,
    12,
    false
  );

  const metal = new THREE.MeshStandardMaterial({
    color: 0xd7d7d4,
    metalness: 0.92,
    roughness: 0.22,
    emissive: 0x242424,
    emissiveIntensity: 0.22
  });

  const nMark = new THREE.Mesh(nGeometry, metal);
  group.add(nMark);

  // Orbital ring

  const orbitCurve = new THREE.EllipseCurve(
    0, 0,
    2.75, 1.12,
    0.1,
    Math.PI * 2.1,
    false,
    -0.18
  );

  const orbitPoints = orbitCurve
    .getPoints(220)
    .map(p => new THREE.Vector3(p.x, p.y, -0.18));

  const orbitGeometry = new THREE.BufferGeometry()
    .setFromPoints(orbitPoints);

  const orbit = new THREE.Line(
    orbitGeometry,
    new THREE.LineBasicMaterial({
      color: 0xaaa9a5,
      transparent: true,
      opacity: 0.72
    })
  );

  group.add(orbit);

  // Four-point star

  const starShape = new THREE.Shape();

  starShape.moveTo(0, .28);
  starShape.quadraticCurveTo(.045, .045, .28, 0);
  starShape.quadraticCurveTo(.045, -.045, 0, -.28);
  starShape.quadraticCurveTo(-.045, -.045, -.28, 0);
  starShape.quadraticCurveTo(-.045, .045, 0, .28);

  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1
  });

  const star = new THREE.Mesh(
    new THREE.ShapeGeometry(starShape),
    starMaterial
  );

  star.position.set(2.22, -0.05, .28);
  group.add(star);

  // Lighting

  scene.add(
    new THREE.AmbientLight(0xffffff, 1.2)
  );

  const key = new THREE.DirectionalLight(
    0xffffff,
    3.1
  );

  key.position.set(-3, 4, 5);
  scene.add(key);

  const rim = new THREE.PointLight(
    0xbfc7d4,
    18,
    12
  );

  rim.position.set(3, -1, 3);
  scene.add(rim);

  // Responsive resizing

  const resize = () => {

    const w = visual.clientWidth;
    const h = visual.clientHeight;

    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);
  };

  new ResizeObserver(resize).observe(visual);

  visual.classList.add("ready");

  // Animation

  const start = performance.now();

  function animate(now) {

    const t = (now - start) * 0.001;

    if (!reducedMotion) {

      group.rotation.y = Math.sin(t * 0.34) * 0.09;

      group.rotation.x = Math.sin(t * 0.27) * 0.035;

      group.position.y = Math.sin(t * 0.55) * 0.045;

      star.material.opacity =
        0.78 + Math.sin(t * 2.2) * 0.22;

    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    requestAnimationFrame(animate);
  }

} catch (error) {

  console.warn(
    "Three.js unavailable. Using static logo.",
    error
  );

}
