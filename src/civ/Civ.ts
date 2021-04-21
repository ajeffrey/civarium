import * as THREE from 'three';
import Bar from '../ui/Bar';
import Terrain from '../Terrain';

export default class Human {
  public hunger: number;
  public speed: number = 5;
  public object: THREE.Object3D;
  private bar: Bar;

  constructor(readonly terrain: Terrain, public coords: THREE.Vector2) {
    this.hunger = 100;
    
    this.object = new THREE.Object3D();
    this.object.position.copy(terrain.getPosition(coords));

    const model = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    );

    model.position.set(0, 0, 1.25);
    model.name = 'Player';
    model.castShadow = true;
    model.receiveShadow = true;
    this.object.add(model);

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