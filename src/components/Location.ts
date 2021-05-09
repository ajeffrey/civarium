import { Entity, Component } from "../ecs";

export default class Location extends Component {
  public coords: THREE.Vector2;
  readonly loadRange: number;

  constructor(
    entity: Entity,
    coords: THREE.Vector2
  ) {
    super(entity);
    this.moveTo(coords);
  }

  moveTo(coords: THREE.Vector2) {
    this.coords = coords;
  }
}
