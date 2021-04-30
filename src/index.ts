import * as THREE from 'three';
import Stats = require('stats.js');
import Camera from './entities/Camera';
import Sun from './Sun';
import Human from './entities/Civ';
import Terrain from './Terrain';
import Controls from './Controls';
import Clock from './ui/Clock';
import EntityManager from './EntityManager';
import ModelLoader from './ModelLoader';
import { Tree } from './entities/Tree';
import Time from './Time';

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.name = 'Scene';
scene.background = new THREE.Color(0xddddff);
(window as any).THREE = THREE;
(window as any).scene = scene;

ModelLoader.loadCollada('tree', '/models/tree.dae');
ModelLoader.loadCollada('human', '/models/human.dae');
ModelLoader.loadCollada('human', '/models/human.dae');

ModelLoader.onReady(() => {
  const cameraObj = EntityManager.create(scene, 'Camera');
  const camera = cameraObj.addComponent(Camera, 4);
  const controls = new Controls(camera);

  Terrain.attach(scene);
  Clock.attach(document.body);
  Time.set(12 * 60);

  Terrain.generate(-25, -25, 50, 50);

  // Entities
  const sun = EntityManager.create(scene, 'Sun');
  sun.addComponent(Sun);

  const tree1 = EntityManager.create(scene, 'Tree');
  tree1.addComponent(Tree, new THREE.Vector2(15, -10));
  
  const tree2 = EntityManager.create(scene, 'Tree');
  tree2.addComponent(Tree, new THREE.Vector2(-10, 10));

  const human = EntityManager.create(scene, 'Human');
  human.addComponent(Human, new THREE.Vector2(0, 0));

  const axes = new THREE.AxesHelper(10);
  axes.position.set(0, 2, 0);
  scene.add(axes);

  let running = true;

  let prevTime = performance.now();
  function step(t) {
    stats.begin();
    const dt = (t - prevTime) / 1000;
    prevTime = t;

    if(controls.keys[' ']) {
      running = !running;
    }
    
    if(running) {
      controls.update();
      Time.update(dt);
      Clock.update();
      EntityManager.update();
    }

    renderer.render(scene, camera.camera);
    stats.end();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});
