import { Entity } from "./Entity";
import { IComponentClass } from './Component';

export default class EntityManager {
  public entities: Entity[] = [];

  create(parent: THREE.Object3D, name: string) {
    const entity = new Entity(parent, name);
    this.entities.push(entity);
    return entity;
  }

  remove(entity: Entity) {
    const index = this.entities.findIndex(e => e === entity);
    if(index >= 0) {
      this.entities.splice(index, 1);
    }
  }

  find(components: IComponentClass<any, any>[]) {
    return this.entities.filter(e => components.every(c => c.name in e.components));
  }

  update() {
    for(const entity of this.entities) {
      entity.update();
    }
  }
}
