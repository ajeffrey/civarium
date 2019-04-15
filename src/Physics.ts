import * as CANNON from 'cannon';
import * as THREE from 'three';
import { SURFACE_MATERIAL, PLAYER_MATERIAL } from './materials';

interface Entity {
  body: CANNON.Body;
  object: THREE.Object3D;
}

const surfaceContact = new CANNON.ContactMaterial(
  SURFACE_MATERIAL,
  PLAYER_MATERIAL,
  { friction: 0.5, restitution: 0 }
);

export default class Physics {
  public world: CANNON.World;
  private entities: Entity[];

  constructor() {
    this.entities = [];
    const world = this.world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase();
    world.gravity.set(0, 0, -10);
    world.quatNormalizeFast = false;
    world.quatNormalizeSkip = 0;
    world.addContactMaterial(surfaceContact);
    const solver = new CANNON.GSSolver();
    solver.tolerance = 0.001;
    world.solver = solver;
  }

  add(entity: Entity) {
    if(entity.body && entity.object) {
      this.world.addBody(entity.body);
    }
  }

  step(dt: number) {
    this.world.step(dt);
    for(const entity of this.entities) {
      const { position, quaternion } = entity.body;
      entity.object.position.set(position.x, position.y, position.z);
      entity.object.rotation.setFromQuaternion(new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
    }
  }
};