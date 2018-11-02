import * as THREE from 'three';
import { World } from './ECS';
import { Player, Sun, Camera } from './entities';
import { DayCycle, Physics, Behaviour, Renderer } from './systems';
import Terrain from './terrain/Terrain';
import TimeLabel from './ui/TimeLabel';
import { Controls } from './ui/Controls';
import { CannonDebugRenderer } from './ui/CannonDebugRenderer';

// Camera
const camera = new Camera(20);

// Systems
const dayCycle = new DayCycle();
const physics = new Physics();
const behaviour = new Behaviour();
const renderer = new Renderer(camera);
renderer.attachTo(document.body);

// World
const world = new World([dayCycle, behaviour, physics, renderer]);
world.add(camera);

// Entities
const sun = new Sun();
world.add(sun);

const timeLabel = TimeLabel(document.body);
world.add(timeLabel);

const controls = new Controls(camera);
const player = new Player(controls);
world.add(player);

// Terrain
const terrain = Terrain();

const chunk = terrain.generate(-100, -100, 100, 100);
renderer.add({ object: chunk.object });

// const debug = new CannonDebugRenderer(renderer.scene, physics.world, {});

console.log('chunk', chunk.body);
physics.add({ body: chunk.body, object: new THREE.Object3D() });

(window as any).THREE = THREE;
(window as any).scene = renderer.scene;

let prevTime = performance.now();
const step = (t) => {
  const dt = (t - prevTime) / 1000;
  prevTime = t;
  world.step(dt);
  requestAnimationFrame(step);
}

requestAnimationFrame(step);

