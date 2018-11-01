import * as CANNON from 'cannon';
import { Entity, System } from '../ECS';

export class Behaviour extends System {

  add(entity: Entity) {
    if(entity.update) {
      super.add(entity);
    }
  }

  step(dt: number) {
    for(const entity of this.entities) {
      entity.update(dt);
    }
  }
};