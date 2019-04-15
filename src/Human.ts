import * as THREE from 'three';
import * as CANNON from 'cannon';
import { PLAYER_MATERIAL } from './materials';

export default class Human {
  public speed = 3;
  public object: THREE.Object3D;
  public body: CANNON.Body;

  constructor() {
    const mesh = this.object = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 3.5),
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    );
    mesh.name = 'Player';
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.body = new CANNON.Body({
      mass: 1,
      fixedRotation: true,
      material: PLAYER_MATERIAL,
      position: new CANNON.Vec3(0, 0, 10),
      shape: new CANNON.Box(new CANNON.Vec3(0.75 / 2, 0.75 / 2, 3.5 / 2)),
      linearDamping: 0
    });
  }
};
