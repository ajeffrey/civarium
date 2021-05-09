import * as THREE from 'three';
import Stats = require('stats.js');
import Camera from './entities/Camera';
import Sun from './Sun';
import Human from './entities/Human';
import Terrain from './Terrain/Terrain';
import Controls from './Controls';
import Clock from './ui/Clock';
import { World } from './ecs';
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
  const cameraObj = World.entities.create(scene, 'Camera');
  const camera = cameraObj.addComponent(Camera, 4);
  const controls = new Controls(camera);

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.resize();
  });

  Clock.attach(document.body);
  Time.set(12 * 60);

  const terrain = new Terrain();
  scene.add(terrain.object);
  World.systems.add(terrain);

  // Entities
  const sun = World.entities.create(scene, 'Sun');
  sun.addComponent(Sun);

  for(const coords of [new THREE.Vector2(15, 5), new THREE.Vector2(0, 5), new THREE.Vector2(-20, -10), new THREE.Vector2(-40, -20)]) {
    const tree = World.entities.create(scene, 'Tree');
    tree.addComponent(Tree, coords);
  }

  for(const coords of [new THREE.Vector2(0, 0), new THREE.Vector2(-10, -10)]) {
  const human = World.entities.create(scene, 'Human');
  human.addComponent(Human, coords);
  }

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
      World.update();
    }

    renderer.render(scene, camera.camera);
    stats.end();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});
