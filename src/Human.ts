import * as THREE from 'three';
import Bar from './Bar';
import Terrain from './Terrain';

export default class Human {
  public hunger: number;
  public speed: number = 5;
  public object: THREE.Object3D;
  private bar: Bar;

  constructor(parent: THREE.Object3D, readonly terrain: Terrain, public coords: THREE.Vector2) {
    this.hunger = 100;
    
    this.object = new THREE.Object3D();
    this.object.position.copy(terrain.getPosition(coords));
    parent.add(this.object);

    const human = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    );

    human.position.set(0, 0, 1.25);
    human.name = 'Player';
    human.castShadow = true;
    human.receiveShadow = true;
    this.object.add(human);

    this.bar = new Bar(100, this.object);
  }

  moveTo(coords: THREE.Vector2) {
    this.coords.copy(coords);
    this.object.position.copy(this.terrain.getPosition(coords));
  }

  step() {
    this.bar.update(this.hunger);
  }
}