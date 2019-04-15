export interface IEntity {
  body?: CANNON.Body;
  object?: THREE.Object3D;
  children?: IEntity[];
  update?: (dt: number) => void;
  setTime?: (clockTime: number, dayLength: number) => void;
}

export abstract class Entity implements IEntity {
  public body?: CANNON.Body;
  public object?: THREE.Object3D;
  public children?: Entity[];
  constructor() {
    this.children = [];
  }
}