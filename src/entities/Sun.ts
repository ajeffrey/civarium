import * as THREE from 'three';
import { Entity } from '../framework';

export class Sun extends Entity {
  private ambientLight: THREE.AmbientLight;
  constructor() {
    super();

    const ambientLight = this.ambientLight = new THREE.AmbientLight(0x010101 * 100);
    ambientLight.name = 'Ambient Light';
    
    const sun = new THREE.Object3D();
    sun.name = 'Sun';
    
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
    sun.add(ambientLight);
    sunLight.position.x = 20;

    this.object = sun;
  }

  setTime(clockTime: number, dayLength: number) {
    this.object.rotation.y = Math.PI / 2 - (clockTime / dayLength * Math.PI * 2);
    this.ambientLight.intensity = (0.25 * Math.sin(clockTime / dayLength * Math.PI));
  }
};