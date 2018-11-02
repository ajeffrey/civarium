import { System } from "./System";
import { IEntity } from "./Entity";

export class World {
  private systems: System[];

  constructor(systems: System[]) {
    this.systems = systems;
  }

  add(entity: IEntity) {
    for(const system of this.systems) {
      system.add(entity);
    }
  }

  step(dt: number) {
    for(const system of this.systems) {
      system.step(dt);
    }
  }
}