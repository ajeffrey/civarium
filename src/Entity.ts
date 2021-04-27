import shortid = require('shortid');
import * as THREE from 'three';

export abstract class Component {
  constructor(public entity: Entity) {}

  update() {}
}

interface IComponentClass<A extends any[], C extends Component> {
  new(entity: Entity,  ...args: A): C;
}

export class Entity {
  readonly id: string;
  readonly name: string;
  readonly transform: THREE.Object3D;
  readonly components: {[key: string]: Component};

  constructor(parent: THREE.Object3D, name: string) {
    this.id = shortid();
    this.name = name;
    this.components = {};
    this.transform = new THREE.Object3D();
    this.transform.name = name;
    this.transform.userData = { entity: this };
    parent.add(this.transform);
  }

  addComponent<A extends any[], C extends Component, T extends IComponentClass<A, C>>(klass: T, ...args: A): InstanceType<T> {
    const component = new klass(this, ...args);
    this.components[klass.name] = component;
    return component as InstanceType<T>;
  }

  getComponent<T extends IComponentClass<any[], any>>(klass: T): InstanceType<T> {
    const component = this.components[klass.name];
    if(component) {
      return component as InstanceType<T>;

    } else {
      throw new Error(`component "${name}" not found`);
    }
  }

  hasComponent<T extends IComponentClass<any[], any>>(klass: T) {
    return klass.name in this.components;
  }

  update() {
    for(const key in this.components) {
      this.components[key].update();
    }
  }

}