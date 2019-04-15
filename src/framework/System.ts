import { IEntity } from "./Entity";

export abstract class System {
  protected entities: IEntity[];

  constructor() {
    this.entities = [];
  }

  add(entity: IEntity) {
    this.entities.push(entity);
  }
  
  step(dt: number) {

  }
}