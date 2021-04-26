import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Camera from './entities/Camera';
import Sun from './Sun';
import Human from './civ/Civ';
import Terrain from './Terrain';
import Controls from './Controls';
import Clock from './ui/Clock';
import EntityManager from './EntityManager';
import ModelManager from './ModelManager';
import { Tree } from './entities/Tree';
import Time from './Time';

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

ModelManager.add('human', (() => {
  const model = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 2.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 }),
  );

  model.position.set(0, 0, 1.25);
  model.name = 'Player';
  model.castShadow = true;
  model.receiveShadow = true;
  return model;
})());

const loader = new GLTFLoader();
loader.load('/models/tree.gltf', ({ scene: treeModel }) => {
  treeModel.rotateX(90);
  treeModel.scale.set(0.25, 0.25, 0.25);
  treeModel.traverse(child => {
    if(child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  ModelManager.add('tree', treeModel);
  const cameraObj = EntityManager.create(scene);
  const camera = cameraObj.addComponent(Camera, 10);
  new Controls(camera);
  scene.add(camera.object);

  Terrain.attach(scene);
  Clock.attach(document.body);
  Time.set(12 * 60);

  Terrain.generate(-25, -25, 50, 50);

  // Entities
  const sun = EntityManager.create(scene);
  sun.addComponent(Sun);

  const tree1 = EntityManager.create(scene);
  tree1.addComponent(Tree, new THREE.Vector2(15, -10));
  
  const tree2 = EntityManager.create(scene);
  tree2.addComponent(Tree, new THREE.Vector2(-10, 10));

  const human = EntityManager.create(scene);
  human.addComponent(Human, new THREE.Vector2(0, 0));

  const axes = new THREE.AxesHelper(10);
  axes.position.set(0, 0, 2);
  scene.add(axes);

  let prevTime = performance.now();
  const step = (t) => {
    const dt = (t - prevTime) / 1000;
    prevTime = t;
    
    Time.update(dt);
    Clock.update();
    EntityManager.update();

    renderer.render(scene, camera.camera);

    // debug.update();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});
