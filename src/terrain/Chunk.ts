export default class Chunk {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly size: number,
    readonly mesh: THREE.Object3D
  ) {}
}