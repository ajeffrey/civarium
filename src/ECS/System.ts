import { Entity } from "./Entity";

export abstract class System {
  protected entities: Entity[];

  constructor() {
    this.entities = [];
  }

  add(entity: Entity) {
    this.entities.push(entity);
  }
  
  step(dt: number) {

  }
}