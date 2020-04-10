import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Camera from './Camera';
import Sun from './Sun';
import Human from './Human';
import Agent from './Agent';
import Terrain from './Terrain';
import Controls from './Controls';
import Clock from './Clock';
import { TreeFactory } from './entities/Tree';

const randRange = (start: number, len: number) => {
  return Math.floor(Math.random() * len) + start;
}

const loader = new GLTFLoader();

const renderer = new THREE.WebGLRenderer({ alpha:true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Systems
document.body.appendChild(renderer.domElement);

loader.load('/models/tree.gltf', tree => {
  tree.scene.rotateX(90);
  tree.scene.scale.set(0.25, 0.25, 0.25);
  tree.scene.castShadow = true;
  tree.scene.receiveShadow = true;
  const treeFactory = new TreeFactory(tree.scene);

  const scene = this.scene = new THREE.Scene();
  scene.name = 'Scene';
  scene.background = new THREE.Color(0xddddff);

  const camera = new Camera(scene, 10);
  const controls = new Controls(camera);
  const clock = new Clock(document.body);

  // Entities
  const sun = new Sun();
  scene.add(sun.root);

  // Terrain
  const terrain = new Terrain(scene);
  terrain.addEntity(treeFactory.create(new THREE.Vector2(15, -10)));

  const human = new Human(scene, terrain, new THREE.Vector2(0, 0));
  const agent = new Agent(human);

  terrain.generate(-25, -25, 50, 50);

  const axes = new THREE.AxesHelper(10);
  axes.position.set(0, 0, 2);
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

