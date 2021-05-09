import { ISystem } from "./System";

export default class SystemManager {
  public systems: ISystem[] = [];

  add(system: ISystem) {
    this.systems.push(system);
    return system;
  }

  update() {
    for(const system of this.systems) {
      system.update();
    }
  }
}
