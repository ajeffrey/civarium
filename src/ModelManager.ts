import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

type Dictionary<T> = {[key: string]: T};

export default class ModelManager {
  private static _models: Dictionary<THREE.Object3D> = {};

  static add(name: string, model: THREE.Object3D) {
    this._models[name] = model;
  }

  static getCopy(name: string) {
    const model = this._models[name];
    if(!model) {
      throw new Error(`model ${name} not found`);
    }

    return SkeletonUtils.clone(model);
  }
}
