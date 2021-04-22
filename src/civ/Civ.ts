import * as THREE from 'three';
import Terrain from '../Terrain';
import Stats from './Stats';

export default class Human {
  public hunger: number;
  public thirst: number;
  public speed: number = 5;
  public object: THREE.Object3D;
  private stats: Stats;

  constructor(readonly terrain: Terrain, public coords: THREE.Vector2) {
    this.hunger = 100;
    this.thirst = 100;
    this.stats = new Stats(this.getStats());
    
    this.object = new THREE.Object3D();
    this.object.position.copy(terrain.getPosition(coords));
    this.object.add(this.stats.object);

    const model = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 2.5),
      new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    );

    model.position.set(0, 0, 1.25);
    model.name = 'Player';
    model.castShadow = true;
    model.receiveShadow = true;
    this.object.add(model);
  }

  private getStats() {
    return [this.hunger, this.thirst];
  }

  moveTo(coords: THREE.Vector2) {
    this.coords.copy(coords);
    this.object.position.copy(this.terrain.getPosition(coords));
  }

  step(dt: number) {
    this.hunger -= dt * 5;
    this.thirst -= dt * 5;
    this.stats.update(this.getStats());
  }
}