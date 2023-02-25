import * as THREE from 'three';
// import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import Chunk from './Chunk';
import Heightmap from './Heightmap';
import MeshGenerator from './MeshGenerator'; 
export default class ChunkGenerator {
  private meshGenerator: MeshGenerator;

  constructor(private heightmap: Heightmap, public chunkSize: number) {
    this.meshGenerator = new MeshGenerator();
  }

  generate(chunkX: number, chunkY: number) {
    const { chunkSize } = this;
    const offsX = chunkX * chunkSize;
    const offsY = chunkY * chunkSize;
    const chunkHeightmap = this.heightmap.getArea(offsX, offsY, chunkSize + 1);
    const mesh = this.meshGenerator.generate(chunkSize, chunkHeightmap);
    mesh.position.set(offsX, 0, -offsY);
    const ents = [];
    const chunk = new Chunk(chunkX, chunkY, chunkSize, chunkHeightmap, mesh, ents);
    return chunk;
  }
}
