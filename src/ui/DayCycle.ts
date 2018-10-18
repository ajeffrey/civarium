import * as THREE from 'three';
import { IWorld } from './World';

const DAY_LENGTH = 24 * 60; // in minutes
const MINUTES_PER_SECOND = 30;

const time = (hours: number, minutes: number) => {
  return hours * 60 + minutes;
}

export default (world: IWorld) => {
  let clockTime = time(12, 0);
  const ambientLight = new THREE.AmbientLight(0x010101 * 100);
  ambientLight.name = 'Ambient Light';
  
  const sun = new THREE.Object3D();
  sun.name = 'Sun';
  sun.rotation.y = -Math.PI  * 3 / 4;
  
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.25);
  sunLight.target.position.set(0, 0, 0);
  sunLight.name = 'Sun Light';
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.left = -50;
  sunLight.shadow.camera.right = 50;
  sunLight.shadow.camera.top = 50;
  sunLight.shadow.camera.bottom = -50;
  sun.add(sunLight);
  sunLight.position.y = 40;

  world.addObject(ambientLight);
  world.addObject(sun);
  world.onUpdate((deltaTime: number) => {
    // clockTime = (clockTime + (deltaTime * MINUTES_PER_SECOND)) % DAY_LENGTH;
    sun.rotation.z = (Math.PI) + (clockTime / DAY_LENGTH * (Math.PI * 2));
    ambientLight.intensity = 0.75 + (0.25 * Math.sin(clockTime / DAY_LENGTH * Math.PI));
  });

  return {
    getTime: () => clockTime,
  };
};