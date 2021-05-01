import * as THREE from 'three';
import Stats = require('stats.js');
import Camera from './entities/Camera';
import Sun from './Sun';
import Human from './entities/Human';
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
ModelLoader.loadFBX('human', '/models/human.fbx');
ModelLoader.loadFBX('walking', '/models/Walking.fbx');
ModelLoader.loadFBX('picking fruit', '/models/Pick Fruit.fbx');
ModelLoader.loadFBX('idle', '/models/Standing Idle.fbx');
ModelLoader.loadFBX('dying', '/models/Dying Backwards.fbx');

ModelLoader.onReady(() => {
  const cameraObj = EntityManager.create(scene, 'Camera');
  const camera = cameraObj.addComponent(Camera, 4);
  const controls = new Controls(camera);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.resize();
  });

  Terrain.attach(scene);
  Clock.attach(document.body);
  Time.set(12 * 60);

  Terrain.generate(-25, -25, 50, 50);

  // Entities
  const sun = EntityManager.create(scene, 'Sun');
  sun.addComponent(Sun);

  const tree1 = EntityManager.create(scene, 'Tree');
  tree1.addComponent(Tree, new THREE.Vector2(15, 5));
  
  const tree2 = EntityManager.create(scene, 'Tree');
  tree2.addComponent(Tree, new THREE.Vector2(0, 5));

  const human = EntityManager.create(scene, 'Human');
  human.addComponent(Human, new THREE.Vector2(0, 0));
  const axes = new THREE.AxesHelper(10);
  axes.position.set(0, 4, 0);
  scene.add(axes);

  let running = true;

  window.onblur = () => {
    running = false;
  }

  window.addEventListener('keydown', e => {
    if(e.key === ' ') {
      running = !running;
    }
  })

  let prevTime = performance.now();
  function step(t) {
    stats.begin();
    const dt = (t - prevTime) / 1000;
    prevTime = t;
    
    if(running) {
      Time.update(dt);
      controls.update();
      Clock.update();
      EntityManager.update();
    }

    renderer.render(scene, camera.camera);
    stats.end();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});
