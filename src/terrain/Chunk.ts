import { TerrainEntity } from './Entities';

export default class Chunk {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly size: number,
    readonly heightmap: number[],
    readonly mesh: THREE.Object3D,
    readonly entities: TerrainEntity[],
  ) {}

  
}
