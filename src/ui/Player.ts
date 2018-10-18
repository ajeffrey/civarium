import * as THREE from 'three';
import * as CANNON from 'cannon';
import { IWorld, playerMaterial } from './World';

export default (world: IWorld) => {
  const player = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 3.5, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xff0000 }),
  );
  player.name = 'Player';
  player.castShadow = true;
  player.receiveShadow = true;

  const playerMoving = new CANNON.Vec3(0, 0, 0);

  const playerBody = new CANNON.Body({
    mass: 1,
    fixedRotation: true,
    material: playerMaterial,
    shape: new CANNON.Box(new CANNON.Vec3(0.75 / 2, 3.5 / 2, 0.75 / 2)),
    linearDamping: 0
  });

  playerBody.position.set(0, 10, 0);
  playerBody.updateMassProperties();

  // const playerLight = new THREE.SpotLight(new THREE.Color(0xffffff), 1, 50);
  // player.add(playerLight);
  // playerLight.position.y = 5;
  // playerLight.shadow.mapSize.width = 2048;
  // playerLight.shadow.mapSize.height = 2048;
  // playerLight.castShadow = true;

  let canJump = true;
  let isJumping = false;

  world.addObject(player);
  world.addBody(playerBody);
  world.onUpdate(() => {
    const { x, y, z } = playerBody.position;
    player.position.set(x, y, z);
    playerBody.velocity.x = playerMoving.x;
    playerBody.velocity.z = playerMoving.z;

    if(canJump && isJumping) {
      const caster = new THREE.Raycaster(player.position, new THREE.Vector3(0, -1, 0), 0, 1.76);
      const intersections = caster.intersectObjects(world.scene.getObjectByName('Terrain').children);
      if(intersections.length) {
        canJump = false;
        setTimeout(() => canJump = true, 1000 / 10);
        playerBody.applyImpulse(new CANNON.Vec3(0, 100, 0), playerBody.position);
      }
    }

    world.positionCamera(x + 30, y + 30, z + 30);
  });

  return {
    setJumping: (jumping: boolean) => {
      isJumping = jumping;
    },
    setMoving: (x: number, z: number) => {
      playerMoving.x = x;
      playerMoving.z = z;
      playerMoving.normalize();
      playerMoving.scale(10, playerMoving);
    }
  };
};