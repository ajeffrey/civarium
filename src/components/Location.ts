import { Entity, Component } from "../Entity";
import Terrain from "../Terrain";

export default class Location extends Component {
  public coords: THREE.Vector2;

  constructor(
    entity: Entity,
    coords: THREE.Vector2
  ) {
    super(entity);
    this.moveTo(coords);
  }

  moveTo(coords: THREE.Vector2) {
    this.coords = coords;
    const location = Terrain.getPosition(coords);
    this.entity.transform.position.copy(location);
  }

  update() {}

}
