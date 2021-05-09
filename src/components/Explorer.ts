import { Component, Entity } from "../ecs";

export default class Explorer extends Component {
  public viewRange: number;
  constructor(entity: Entity, viewRange: number) {
    super(entity);
    this.viewRange = viewRange;
  }

  update() {
  }
}
