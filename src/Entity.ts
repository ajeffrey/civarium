import * as THREE from 'three';

export default abstract class Entity {
  constructor(public coords: THREE.Vector2, public tags: string[], public object: THREE.Object3D) {

  }

  abstract step(dt: number);
}