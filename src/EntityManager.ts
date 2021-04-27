import { Entity } from "./Entity";

export default class EntityManager {
  public static entities: Entity[] = [];

  static create(parent: THREE.Object3D, name: string) {
    const entity = new Entity(parent, name);
    this.entities.push(entity);
    return entity;
  }

  static remove(entity: Entity) {
    const index = this.entities.findIndex(e => e === entity);
    if(index >= 0) {
      this.entities.splice(index, 1);
    }
  }

  static update() {
    for(const entity of this.entities) {
      entity.update();
    }
  }
}
