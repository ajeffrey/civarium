import * as THREE from 'three';
import Camera from './Camera';
import Sun from './Sun';
import Human from './civ/Civ';
import Agent from './civ/Agent';
import Terrain from './Terrain';
import Controls from './Controls';
import Clock from './ui/Clock';
import { loadTree } from './entities/Tree';

const renderer = new THREE.WebGLRenderer({ alpha: true });
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.name = 'Scene';
scene.background = new THREE.Color(0xddddff);
(window as any).THREE = THREE;
(window as any).scene = scene;


loadTree().then(Tree => {
  const camera = new Camera(10);
  scene.add(camera.object);
  const clock = new Clock(document.body);

  // Entities
  const sun = new Sun();
  scene.add(sun.object);

  // Terrain
  const terrain = new Terrain();
  terrain.generate(-25, -25, 50, 50);
  terrain.addEntity(Tree(new THREE.Vector2(15, -10)));
  scene.add(terrain.object);

  const human = new Human(terrain, new THREE.Vector2(0, 0));
  scene.add(human.object);
  const agent = new Agent(human);

  const axes = new THREE.AxesHelper(10);
  axes.position.set(0, 0, 2);
  scene.add(axes);

  let wallTime = 12 * 60;
  const MINUTES_PER_SECOND = 15;
  const DAY_LENGTH = 24 * 60;
  let prevTime = performance.now();
  const step = (t) => {
    const dt = (t - prevTime) / 1000;
    prevTime = t;
    agent.step(dt);

    wallTime += dt * MINUTES_PER_SECOND;
    wallTime = wallTime % DAY_LENGTH;
    sun.setTime(wallTime / DAY_LENGTH);
    clock.setTime(wallTime);

    renderer.render(scene, camera.camera);

    // debug.update();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});
