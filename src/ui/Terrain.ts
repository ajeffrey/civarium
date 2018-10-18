import { IWorld } from './World';
import * as THREE from 'three';
import createTile from './Tile';

export interface ITerrainParameters {
  size: number;
}

export default (world: IWorld, { size }: ITerrainParameters) => {
  const playerPosition = [0, 0];
  const moving = [0, 0];

  const tiles = [];

  const terrain = new THREE.Object3D();
  terrain.name = 'Terrain';

  for(let i = -size / 2; i < size / 2; i++) {
    for(let j = -size / 2; j < size / 2; j++) {
      const tile = createTile(world, terrain, new THREE.Vector3(i, 0, j));
      tiles.push(tile);

      if(Math.random() > 0.8) {
        const stacked = createTile(world, terrain, new THREE.Vector3(i, 1, j));
        tiles.push(stacked);
      }
    }
  }

  world.addObject(terrain);

  return {
    setMoving: (x: number, y: number) => {
      moving[0] = x;
      moving[1] = y;
    },
  };
};