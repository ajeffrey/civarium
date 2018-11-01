import { System } from './System';
import { Entity } from './Entity';

export class Scene {
  private systems: System[];
  private entities: Entity[];

  constructor(entities: Entity[], systems: System[]) {
    this.systems = systems;
    this.entities = entities;
    for(const system of systems) {
      for(const entity of entities) {
        system.add(entity);
      }
    }
  }

  step(dt: number) {
    for(const system of this.systems) {
      system.step(dt);
    }
  }
}