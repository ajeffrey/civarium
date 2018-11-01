import * as CANNON from 'cannon';
import { System, Entity } from '../ECS';
import { SURFACE_MATERIAL, PLAYER_MATERIAL } from '../materials';

const surfaceContact = new CANNON.ContactMaterial(
  SURFACE_MATERIAL,
  PLAYER_MATERIAL,
  { friction: 0, restitution: 0 }
);

export class Physics extends System {
  private world: CANNON.World;

  constructor() {
    super();
    const world = this.world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, -10, 0);
    world.quatNormalizeFast = false;
    world.quatNormalizeSkip = 0;
    world.addContactMaterial(surfaceContact);
    const solver = new CANNON.GSSolver();
    solver.tolerance = 0.001;
    world.solver = solver;
  }

  add(entity: Entity) {
    if(entity.body && entity.object) {
      super.add(entity);
      this.world.addBody(entity.body);
    }
  }

  step(dt: number) {
    this.world.step(dt);
    for(const entity of this.entities) {
      const { x, y, z } = entity.body.position;
      entity.object.position.set(x, y, z);
    }
  }
};