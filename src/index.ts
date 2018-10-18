import * as THREE from 'three';
import * as CANNON from 'cannon';
import World from './ui/World';
import DayCycle from './ui/DayCycle';
import Terrain from './ui/Terrain';
import TimeLabel from './ui/TimeLabel';
import Player from './ui/Player';
import { keys$, scroll$ } from './Controls';

const world = World();
document.body.appendChild(world.domElement());

const dayCycle = DayCycle(world);
const terrain = Terrain(world, { size: 40 });
const timeLabel = TimeLabel(document.body);
const player = Player(world);

world.onUpdate((deltaTime: number) => {
  const time = dayCycle.getTime();
  timeLabel.update(time);
});

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

keys$.subscribe(keys => {
  let x = 0;
  let z = 0;

  player.setJumping(keys[32]);

  if(keys[ARROW_LEFT] && !keys[ARROW_RIGHT]) {
    x = -1;
  } else if(keys[ARROW_RIGHT] && !keys[ARROW_LEFT]) {
    x = 1;
  }

  if(keys[ARROW_UP] && !keys[ARROW_DOWN]) {
    z = -1;
  } else if(keys[ARROW_DOWN] && !keys[ARROW_UP]) {
    z = 1;
  }

  console.log(x, z);

  player.setMoving(x, z);
});

let time = performance.now();
let newTime;
const step = () => {
  setTimeout(() => requestAnimationFrame(step), 1000 / 60);
  world.update(1 / 60);
}

step();

