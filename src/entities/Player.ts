import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Entity } from '../ECS';
import { PLAYER_MATERIAL } from '../materials';
import { Controls } from '../ui/Controls';
import { Camera } from './Camera';

export class Player extends Entity {
  public speed = 3;
  private camera: Camera;
  private controls: Controls;

  constructor(controls: Controls) {
    super();
    this.controls = controls;

    const mesh = this.object = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 3.5, 0.75),
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    );
    mesh.name = 'Player';
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.body = new CANNON.Body({
      mass: 1,
      fixedRotation: true,
      material: PLAYER_MATERIAL,
      position: new CANNON.Vec3(0, 20, 0),
      shape: new CANNON.Box(new CANNON.Vec3(0.75 / 2, 3.5 / 2, 0.75 / 2)),
      linearDamping: 0
    });
  }

  update(dt: number) {
    console.log('update');
    const x = this.controls.xAxis();
    const y = this.controls.yAxis();
    if(x || y) {
      console.log(x, y);
    }
    this.body.position.x += this.controls.xAxis() * dt * this.speed;
    this.body.position.z -= this.controls.yAxis() * dt * this.speed;
  }
};
