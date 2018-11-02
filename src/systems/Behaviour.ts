import * as CANNON from 'cannon';
import { IEntity, System } from '../ECS';

export class Behaviour extends System {
  add(entity: IEntity) {
    if(entity.update) {
      super.add(entity);
    }
  }

  step(dt: number) {
    console.log(this.entities);
    for(const entity of this.entities) {
      entity.update(dt);
    }
  }
};