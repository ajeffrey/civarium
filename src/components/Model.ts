import { Entity, Component } from "../Entity";
import ModelManager from '../ModelManager';

export class Model extends Component {
  constructor(entity: Entity, public modelName: string) {
    super(entity);
    const model = ModelManager.getCopy(modelName);
    entity.transform.add(model);
  }

  update() {}
}
