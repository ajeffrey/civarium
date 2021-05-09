import * as THREE from 'three';
import Chunk from './Chunk';
import Heightmap from './Heightmap';

const TERRAIN_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xddffdd
});

export default class ChunkGenerator {

  constructor(private heightmap: Heightmap, public chunkSize: number) {
  }

  generate(chunkX: number, chunkY: number) {
    const { chunkSize } = this;
    const vertices = [];
    const indices = [];
    
    for(let x = 0; x <= chunkSize; x++) {
      for(let y = 0; y <= chunkSize; y++) {
        const xOffs = x + (chunkX * chunkSize) - chunkSize / 2;
        const yOffs = y + (chunkY * chunkSize) - chunkSize / 2;
        
        const height = this.heightmap.getIntHeight(xOffs, yOffs);
        vertices.push(xOffs, height, -yOffs);
        if(x > 0 && y > 0) {
          const a = (x - 1) + ((y - 1) * (chunkSize + 1));
          const b = x + ((y - 1) * (chunkSize + 1));
          const c = (x - 1) + (y * (chunkSize + 1));
          const d = x + (y * (chunkSize + 1));
          indices.push(d, b, a);
          indices.push(a, c, d);
        }
      }
    }

    const terrain = new THREE.BufferGeometry();
    terrain.setIndex(indices);
    terrain.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    terrain.computeVertexNormals();
    const mesh = new THREE.Mesh(terrain, TERRAIN_MATERIAL);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const edges = new THREE.EdgesGeometry(mesh.geometry, 0);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0 }));

    const object = new THREE.Object3D();
    object.name = `Chunk ${chunkX} ${chunkY}`;
    object.add(mesh);
    object.add(line);
    const chunk = new Chunk(chunkX, chunkY, chunkSize, object);
    return chunk;
  }
}
