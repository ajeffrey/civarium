import * as THREE from 'three';
// import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import Chunk from './Chunk';
import Heightmap from './Heightmap';
import MeshGenerator from './MeshGenerator';
import { RainfallSimulator } from './RainfallSimulator';

const WATER_MATERIAL = new THREE.MeshPhongMaterial({
  color: 0x007cf0,
  flatShading: true,
  shininess: 0,
});

export default class ChunkGenerator {
  private meshGenerator: MeshGenerator;
  private rainfallSimulator: RainfallSimulator;

  constructor(private heightmap: Heightmap, public chunkSize: number) {
    this.meshGenerator = new MeshGenerator();
    this.rainfallSimulator = new RainfallSimulator();
  }

  generate(chunkX: number, chunkY: number) {
    const { chunkSize } = this;
    const offsX = chunkX * chunkSize;
    const offsY = chunkY * chunkSize;
    const chunkHeightmap = this.heightmap.getArea(offsX, offsY, chunkSize + 1);
    const features = this.rainfallSimulator.simulate(chunkSize, chunkHeightmap);
    const mesh = this.meshGenerator.generate(chunkSize, chunkHeightmap);
    mesh.position.set(offsX, 0, -offsY);
      for (const feature of features) {
        const matrix = new THREE.Object3D();
        const featureGeo = new THREE.PlaneGeometry(1, 1);
        const featureMesh = new THREE.InstancedMesh(featureGeo, WATER_MATERIAL, feature.cells.length);
        featureMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        for (let i = 0; i < feature.cells.length; i++) {
          const cell = feature.cells[i];
          matrix.position.set(cell.x, feature.height, -cell.y);
          matrix.rotation.x = -Math.PI / 2;
          matrix.updateMatrix();
          featureMesh.setMatrixAt(i, matrix.matrix);
        }
        featureMesh.instanceMatrix.needsUpdate = true;
        mesh.add(featureMesh);
      }
    const ents = [];
    const chunk = new Chunk(chunkX, chunkY, chunkSize, chunkHeightmap, mesh, ents);
    return chunk;
  }
}
