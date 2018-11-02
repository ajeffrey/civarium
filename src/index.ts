import * as THREE from 'three';
import { Player, Sun, Camera } from './entities';
import { DayCycle, Physics, Renderer } from './systems';
import Terrain from './terrain/Terrain';
import TimeLabel from './ui/TimeLabel';
import { Controls } from './ui/Controls';

// Entities
const sun = new Sun();
const camera = new Camera(20);
const controls = new Controls(camera);
const player = new Player(controls);
const terrain = Terrain();
const chunk = terrain.generate(-100, -100, 100, 100);
const edges = new THREE.EdgesGeometry( chunk.mesh.geometry, 0 );
const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0 } ) );


const timeLabel = TimeLabel(document.body);

// Systems
const dayCycle = new DayCycle(sun, timeLabel);
const physics = new Physics();
const renderer = new Renderer(camera);
renderer.attachTo(document.body);

const waterPlane = new THREE.PlaneGeometry(200, 200);
const mesh = new THREE.Mesh(waterPlane, new THREE.MeshLambertMaterial({ color: 0x2266ff }));
mesh.rotateX(-Math.PI / 2);
renderer.add({ object: mesh, update: ()=> {} });

physics.add(player);
physics.add({ body: chunk.body, update: () => {} });
renderer.add(sun);
renderer.add(player);
renderer.add(camera);
renderer.add({ object: chunk.mesh, update: () => {} });
renderer.add({ object: line, update: () => {} });
(window as any).THREE = THREE;
(window as any).scene = renderer.scene;

let prevTime = performance.now();
const step = (t) => {
  const dt = (t - prevTime) / 1000;
  prevTime = t;
  dayCycle.step(dt);
  physics.step(dt);
  renderer.step(dt);
  requestAnimationFrame(step);
}

requestAnimationFrame(step);

