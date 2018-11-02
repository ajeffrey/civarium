import * as THREE from 'three';
import * as CANNON from 'cannon';
import SimplexNoise from 'fast-simplex-noise';
import { SURFACE_MATERIAL } from '../materials';

const TERRAIN_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xFFDDDD
});

export default () => {
  const heightmap = new SimplexNoise({
    frequency: 0.01,
    min: 0,
    max: 15,
    octaves: 8
  });

  const generate = (x1: number, z1: number, x2: number, z2: number) => {
    const width = x2 - x1;
    const depth = z2 - z1;
    if(width < 1 || depth < 1) {
      throw new Error('invalid coord space');
    }

    const terrain = new THREE.Geometry();
    const heights = [];
    for(let z = 0; z <= depth; z++) {
      const row = [];
      for(let x = 0; x <= width; x++) {
        const height = heightmap.scaled2D(x1 + x, z1 + z);
        row.push(height);
        terrain.vertices.push(new THREE.Vector3(x1 + x, height, z1 + z));
        if(x > 0 && z > 0) {
          const a = (x - 1) + ((z - 1) * (width + 1));
          const b = x + ((z - 1) * (width + 1));
          const c = (x - 1) + (z * (width + 1));
          const d = x + (z * (width + 1));
          const faceA = new THREE.Face3(d, b, a);
          const faceB = new THREE.Face3(a, c, d);
          terrain.faces.push(faceA, faceB);
        }
      }

      heights.push(row);
    }

    terrain.computeVertexNormals(true);
    terrain.computeFaceNormals();
    terrain.computeBoundingBox();
    const mesh = new THREE.Mesh(terrain, TERRAIN_MATERIAL);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const edges = new THREE.EdgesGeometry(mesh.geometry, 0);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x775555 }));

    const object = new THREE.Object3D();
    object.add(mesh);
    object.add(line);

    console.log(heights);

    const field = new CANNON.Heightfield(heights, { elementSize: 1 });
    const body = new CANNON.Body({ mass: 0, material: SURFACE_MATERIAL });
    body.addShape(field);
    body.quaternion.setFromEuler(-Math.PI / 2, 0, -Math.PI / 2);
    body.position.set(x1, -5, z1);
    return { object, body };
  };

  return { generate };
}