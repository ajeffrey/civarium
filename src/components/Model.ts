import { Entity, Component } from "../Entity";
import ModelManager from '../ModelManager';

export class Model extends Component {
  public model: THREE.Object3D;
  
  constructor(entity: Entity, public modelName: string) {
    super(entity);
    this.model = ModelManager.getCopy(modelName);
    entity.transform.add(this.model);
  }
}
