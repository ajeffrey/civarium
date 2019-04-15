import * as THREE from 'three';
import Camera from './Camera';
import Sun from './Sun';
import Human from './Human';
import Physics from './Physics';
import Terrain from './Terrain';
import WallClock from './ui/WallClock';
import { Controls } from './ui/Controls';
import { CannonDebugRenderer } from './ui/CannonDebugRenderer';
import Clock from './Clock';

const renderer = new THREE.WebGLRenderer({ alpha:true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Systems
const physics = new Physics();
document.body.appendChild(renderer.domElement);

const scene = this.scene = new THREE.Scene();
scene.name = 'Scene';
scene.background = new THREE.Color(0xddddff);

const camera = new Camera(20);
scene.add(camera.root);

// Entities
const sun = new Sun();
scene.add(sun.root);

const wallClock = WallClock(document.body);

const controls = new Controls(camera);
const human = new Human();
scene.add(human.object);
physics.add(human);

// Terrain
const terrain = Terrain();

const chunk = terrain.generate(50, 50);
chunk.body.position.set(-25, -25, 0);
scene.add(chunk.object);
physics.add(chunk);

const axes = new THREE.AxesHelper(10);
axes.position.set(0, 0, 20);
scene.add(axes);

(window as any).THREE = THREE;
(window as any).scene = scene;

let wallTime = 12 * 60;
const MINUTES_PER_SECOND = 15;
const DAY_LENGTH = 24 * 60;
let prevTime = performance.now();
const step = (t) => {
  const dt = (t - prevTime) / 1000;
  prevTime = t;

  wallTime += dt * MINUTES_PER_SECOND;
  wallTime = wallTime % DAY_LENGTH;
  sun.setTime(wallTime / DAY_LENGTH);
  wallClock.setTime(wallTime);

  renderer.render(scene, camera.camera);
  physics.step(dt);

  // debug.update();
  requestAnimationFrame(step);
}

requestAnimationFrame(step);

