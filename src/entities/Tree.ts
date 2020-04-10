import * as THREE from 'three';
import Entity from '../Entity';
import { IFoodSource } from '../IFoodSource';

export class TreeFactory {
  constructor(private model: THREE.Object3D) {

  }

  create(coords: THREE.Vector2) {
    return new Tree(coords, this.model);
  }
}

export default class Tree extends Entity implements IFoodSource {
  private appleCount: number;

  constructor(coords: THREE.Vector2, model: THREE.Object3D) {
    super(coords, ['FOOD_SOURCE'], model);
    this.appleCount = 3;
  }

  takeFood() {
    if(this.appleCount >= 1) {
      this.appleCount -= 1;
      return { fillHunger: 20 };
      
    } else {
      return null;
    }
  }

  step(dt: number) {
    this.appleCount += dt / 10;
  }
}