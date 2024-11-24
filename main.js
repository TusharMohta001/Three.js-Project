import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import Lenis from 'lenis'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

const loader = new GLTFLoader();
let model;



loader.load('./DamagedHelmet.gltf', function (gltf) {
  model = gltf.scene;
  scene.add(model);
}, undefined, function (error) {
  console.error(error);
});

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  alpha: true,
  antialias: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.000030;
composer.addPass(rgbShiftPass);

// Load HDR environment map
new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
  });


window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationX = (e.clientX / window.innerWidth - .5) * (Math.PI * .3);
    const rotationY = (e.clientY / window.innerHeight - .5) * (Math.PI * .1);
    gsap.to(model.rotation, {
      y: rotationX,
      x: rotationY,
      duration: 0.9,
      ease: "power2.out"
    });

  }
})

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});


function animate() {
  window.requestAnimationFrame(animate)
  if (model) {
  }
  composer.render();
}

animate();


// Get loader element
const pageLoader = document.querySelector('.loader');

// Hide loader when page is fully loaded
window.addEventListener('load', () => {
  // Fade out loader
  gsap.to(pageLoader, {
    opacity: 0,
    duration: 1,
    onComplete: () => {
      // Remove loader from DOM after animation
      pageLoader.style.display = 'none';
    }
  });
});


const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);