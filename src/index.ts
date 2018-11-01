import * as THREE from 'three';
import { Player, Sun, Camera } from './entities';
import { DayCycle, Physics, Renderer } from './systems';
import Terrain from './terrain/Terrain';
import TimeLabel from './ui/TimeLabel';
import { Controls } from './ui/Controls';

// Entities
const controls = new Controls();
const sun = new Sun();
const camera = new Camera(20);
const player = new Player(controls);
const terrain = Terrain();
const chunk = terrain.generate(-20, -20, 20, 20);
const edges = new THREE.EdgesGeometry( chunk.mesh.geometry );
const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );


const timeLabel = TimeLabel(document.body);

// Systems
const dayCycle = new DayCycle(sun, timeLabel);
const physics = new Physics();
const renderer = new Renderer(camera);
renderer.attachTo(document.body);

physics.add(player);
physics.add({ body: chunk.body, update: () => {} });
renderer.add(sun);
renderer.add(player);
renderer.add(camera);
renderer.add({ object: chunk.mesh, update: () => {} });
renderer.add({ object: line, update: () => {} });
(window as any).THREE = THREE;
// (window as any).scene = scene;

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

