import { Entity } from "./Entity";

export abstract class Component {
  constructor(public entity: Entity) {}

  update() {}
}

export interface IComponentClass<A extends any[], C extends Component> {
  new(entity: Entity,  ...args: A): C;
}