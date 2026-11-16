
import * as THREE from "three";

const canvas = document.querySelector("#scene");
const container = document.querySelector(".emblem-container");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let renderer;
let animationFrame;
let isVisible = true;
let isPageVisible = !document.hidden;

try {

  // RENDERER

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.7)
  );

  renderer.setSize(
    container.clientWidth,
    container.clientHeight,
    false
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;


  // SCENE

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  camera.position.set(0, 0, 8.5);


  const emblem = new THREE.Group();
  scene.add(emblem);


  // CHROME MATERIAL

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xe1e1df,
    metalness: 0.95,
    roughness: 0.19,
    emissive: 0x202020,
    emissiveIntensity: 0.25
  });


  // NULVYN N MARK

  const nPoints = [

    new THREE.Vector3(-2.15, -0.9, 0),

    new THREE.Vector3(-2.15, 0.65, 0.05),

    new THREE.Vector3(-1.8, 0.95, 0.12),

    new THREE.Vector3(-0.25, -0.75, 0.15),

    new THREE.Vector3(0.12, -0.9, 0.05),

    new THREE.Vector3(1.55, 0.8, -0.1),

    new THREE.Vector3(2.05, 0.72, 0)

  ];

  const nCurve = new THREE.CatmullRomCurve3(
    nPoints,
    false,
    "catmullrom",
    0.45
  );

  const nGeometry = new THREE.TubeGeometry(
    nCurve,
    180,
    0.11,
    16,
    false
  );

  const nLogo = new THREE.Mesh(
    nGeometry,
    chromeMaterial
  );

  emblem.add(nLogo);


  // ORBITAL RING

  const orbitCurve = new THREE.EllipseCurve(
    0, 0,
    2.7, 1.15,
    0,
    Math.PI * 2,
    false,
    -0.22
  );

  const orbitPoints = orbitCurve
    .getPoints(280)
    .map(point =>
      new THREE.Vector3(
        point.x,
        point.y,
        -0.18
      )
    );

  const orbitGeometry = new THREE.BufferGeometry()
    .setFromPoints(orbitPoints);

  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xc5c5c2,
    transparent: true,
    opacity: 0.7
  });

  const orbit = new THREE.Line(
    orbitGeometry,
    orbitMaterial
  );

  emblem.add(orbit);


  // FOUR POINT STAR

  const starShape = new THREE.Shape();

  starShape.moveTo(0, 0.28);

  starShape.quadraticCurveTo(
    0.04, 0.04, 0.28, 0
  );

  starShape.quadraticCurveTo(
    0.04, -0.04, 0, -0.28
  );

  starShape.quadraticCurveTo(
    -0.04, -0.04, -0.28, 0
  );

  starShape.quadraticCurveTo(
    -0.04, 0.04, 0, 0.28
  );

  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true
  });

  const star = new THREE.Mesh(
    new THREE.ShapeGeometry(starShape),
    starMaterial
  );

  star.position.set(2.18, -0.03, 0.25);

  emblem.add(star);


  // LIGHTING

  const ambient = new THREE.AmbientLight(
    0xffffff,
    1.15
  );

  scene.add(ambient);


  const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3.2
  );

  mainLight.position.set(-3, 4, 5);

  scene.add(mainLight);


  const secondaryLight = new THREE.DirectionalLight(
    0xaaaaaa,
    1.5
  );

  secondaryLight.position.set(4, -2, 3);

  scene.add(secondaryLight);


  const pointLight = new THREE.PointLight(
    0xffffff,
    18,
    12
  );

  pointLight.position.set(2, 1, 3);

  scene.add(pointLight);


  // RESPONSIVE RESIZING

  function resize() {

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    renderer.setSize(width, height, false);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.7)
    );

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    render();

  }

  const resizeObserver = new ResizeObserver(resize);

  resizeObserver.observe(container);


  // VISIBILITY OPTIMISATION

  const visibilityObserver = new IntersectionObserver(
    entries => {

      isVisible = entries[0].isIntersecting;

      if (isVisible && isPageVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }

    },
    { threshold: 0.05 }
  );

  visibilityObserver.observe(container);


  document.addEventListener("visibilitychange", () => {

    isPageVisible = !document.hidden;

    if (isPageVisible && isVisible) {
      startAnimation();
    } else {
      stopAnimation();
    }

  });


  // RENDER

  function render() {
    renderer.render(scene, camera);
  }


  // SMOOTH ANIMATION

  let startTime = null;

  function animate(time) {

    animationFrame = null;

    if (!isVisible || !isPageVisible) return;

    if (startTime === null) {
      startTime = time;
    }

    const elapsed = (time - startTime) * 0.001;

    if (!reducedMotion) {

      // Gentle floating movement

      emblem.rotation.y =
        Math.sin(elapsed * 0.32) * 0.09;

      emblem.rotation.x =
        Math.sin(elapsed * 0.24) * 0.035;

      emblem.position.y =
        Math.sin(elapsed * 0.5) * 0.045;

      // Subtle light pulse

      star.material.opacity =
        0.8 + Math.sin(elapsed * 1.8) * 0.2;

      pointLight.intensity =
        17 + Math.sin(elapsed * 0.7) * 2;

    }

    render();

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(animate);
    }

  }


  function startAnimation() {

    if (animationFrame !== null) return;

    startTime = null;

    if (reducedMotion) {
      render();
      return;
    }

    animationFrame = requestAnimationFrame(animate);

  }


  function stopAnimation() {

    if (animationFrame !== null) {

      cancelAnimationFrame(animationFrame);

      animationFrame = null;

    }

  }


  // INITIALISE

  resize();

  container.classList.add("ready");

  startAnimation();


} catch (error) {

  console.error(
    "NULVYN 3D renderer unavailable:",
    error
  );

  // Static SVG logo remains visible as fallback.

}


// SCROLL PROGRESS

const progress = document.getElementById(
  "scrollProgress"
);

let scrollScheduled = false;

function updateProgress() {

  const scrollable =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const percentage = scrollable > 0
    ? (window.scrollY / scrollable) * 100
    : 0;

  progress.style.width = percentage + "%";

  scrollScheduled = false;

}

window.addEventListener("scroll", () => {

  if (!scrollScheduled) {

    requestAnimationFrame(updateProgress);

    scrollScheduled = true;

  }

}, { passive: true });


// SCROLL REVEAL

const revealElements = document.querySelectorAll(
  ".section-reveal"
);

if ("IntersectionObserver" in window) {

  const revealObserver = new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

} else {

  revealElements.forEach(element => {
    element.classList.add("visible");
  });

}
