import * as THREE from 'three';
import * as CANNON from 'cannon';
import SimplexNoise from 'fast-simplex-noise';
import { SURFACE_MATERIAL } from '../materials';
import { Entity } from '../framework';

const TERRAIN_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xddffdd
});

class Cell extends Entity {
  constructor(x: number, y: number, baseHeight: number) {
    super();
  }
}

class Grid extends Entity {
  constructor(width: number, height: number) {
    super();
    const noise = new SimplexNoise({
      frequency: 0.0025,
      min: 0,
      max: 1,
      octaves: 2
    });

    const heightmap = [];
    for(let y = 0; y < height; y++) {
      for(let x = 0; x < width; x++) {
        heightmap.push(noise.scaled2D(x, y));
      }
    }
  }
}

export default () => {
  const heightmap = new SimplexNoise({
    frequency: 0.0025,
    min: 0,
    max: 1,
    octaves: 2
  });

  const generate = (width: number, depth: number) => {
    if(width < 1 || depth < 1) {
      throw new Error('invalid coord space');
    }

    const terrain = new THREE.Geometry();
    const heights = [];
    for(let x = 0; x <= width; x++) {
      const row = [];
      for(let y = 0; y <= depth; y++) {
        const height = 1;
        row.push(height);
        terrain.vertices.push(new THREE.Vector3(x, y, height));
        if(x > 0 && y > 0) {
          const a = (x - 1) + ((y - 1) * (width + 1));
          const b = x + ((y - 1) * (width + 1));
          const c = (x - 1) + (y * (width + 1));
          const d = x + (y * (width + 1));
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
    const object2 = new THREE.Object3D();
    object2.add(mesh);
    object.add(object2);
    object.add(line);

    const field = new CANNON.Heightfield(heights, { elementSize: 1 });
    const body = new CANNON.Body({ mass: 0, material: SURFACE_MATERIAL });
    body.addShape(field);
    return { object, body };
  };

  return { generate };
}