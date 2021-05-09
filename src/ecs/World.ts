import EntityManager from "./EntityManager";
import SystemManager from "./SystemManager";

class World {
  public entities: EntityManager;
  public systems: SystemManager;

  constructor() {
    this.entities = new EntityManager();
    this.systems = new SystemManager();
  }

  update() {
    this.entities.update();
    this.systems.update();
  }
}

const world = new World();
export default world;