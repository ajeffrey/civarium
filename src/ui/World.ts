import * as THREE from 'three';
import * as CANNON from 'cannon';

interface ICameraViewport {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type IUpdateCallback = (dT: number) => void;

export const surfaceMaterial = new CANNON.Material('surface');
export const playerMaterial = new CANNON.Material('player');
const surfaceContact = new CANNON.ContactMaterial(surfaceMaterial, playerMaterial, {
  friction: 0,
  restitution: 0,
});

const calculateViewport = (zoom: number): ICameraViewport => {
  const aspect = window.innerWidth / window.innerHeight;
  return {
    top: zoom,
    bottom: -zoom,
    left: -zoom * aspect,
    right: zoom * aspect,
  };
};

const World = () => {
  const renderer = new THREE.WebGLRenderer({ alpha:true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.name = 'Scene';
  scene.background = new THREE.Color(0xf0f0f0);

  const { left, right, top, bottom } = calculateViewport(20);
  const camera = new THREE.OrthographicCamera(left, right, top, bottom, 0, 2000);
  camera.position.set(30, 30, 30);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  const world = new CANNON.World();
  world.broadphase = new CANNON.NaiveBroadphase();
  world.gravity.set(0, -100, 0);
  world.quatNormalizeFast = false;
  world.quatNormalizeSkip = 0;
  world.addContactMaterial(surfaceContact);
  const solver = new CANNON.GSSolver();
  solver.tolerance = 0.001;
  world.solver = solver;

  const updaters: IUpdateCallback[] = [];

  (window as any).THREE = THREE;
  (window as any).scene = scene;

  return {
    scene,
    domElement: () => renderer.domElement,
    addObject: (obj: THREE.Object3D) => {
      scene.add(obj);
    },
    positionCamera: (x: number, y: number, z: number) => {
      camera.position.set(x + 30, y + 30, z + 30);
    },
    addBody: (body: CANNON.Body) => {
      world.addBody(body);
    },
    onUpdate: (fn: IUpdateCallback) => {
      updaters.push(fn);
    },
    update: (deltaTime: number) => {
      world.step(deltaTime);
      updaters.forEach(updater => updater(deltaTime));
      renderer.render(scene, camera);
    },
  };
};

export default World;
export type IWorld = ReturnType<typeof World>;