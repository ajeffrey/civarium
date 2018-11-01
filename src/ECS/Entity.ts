import { generate } from 'shortid';

export abstract class Entity {
  public body?: CANNON.Body;
  public object?: THREE.Object3D;
  
  constructor() {}

  update(dt: number) {
    
  }
}