import * as THREE from 'three';
import * as CANNON from 'cannon';
import SimplexNoise from 'fast-simplex-noise';

export default () => {
  const heightmap = new SimplexNoise({
    frequency: 0.01,
    min: -5,
    max: 10,
    octaves: 4
  });

  const generate = (x1: number, z1: number, x2: number, z2: number) => {
    const width = x2 - x1;
    const depth = z2 - z1;
    if(width < 1 || depth < 1) {
      throw new Error('invalid coord space');
    }

    const terrain = new THREE.Geometry();
    const heights = [];
    let maxIndex = 0;
    for(let z = 0; z <= depth; z++) {
      const row = [];
      for(let x = 0; x <= width; x++) {
        const height = heightmap.scaled2D(x1 + x, z1 + z);
        row.push(height);
        terrain.vertices.push(new THREE.Vector3(x1 + x, height, z1 + z));
        if(x > 0 && z > 0) {
          const a = (x - 1) + ((z - 1) * width);
          const b = x + ((z - 1) * width);
          const c = (x - 1) + (z * width);
          const d = x + (z * width);
          maxIndex = Math.max(maxIndex, a, b, c, d);
          const faceA = new THREE.Face3(a, b, d);
          const faceB = new THREE.Face3(d, c, a);
          terrain.faces.push(faceA, faceB);
        }
      }

      heights.push(row);
    }

    console.log(terrain.vertices.length);
    console.log((maxIndex));
    console.log(terrain.vertices);
    console.log(terrain.faces);

    terrain.computeVertexNormals(true);
    terrain.computeFaceNormals();
    terrain.computeBoundingBox();
    const mesh = new THREE.Mesh(
      terrain,
      new THREE.MeshLambertMaterial({
        color: 0xFFDDDD
      })
    );

    const field = new CANNON.Heightfield(heights);
    const body = new CANNON.Body({ mass: 0 });
    body.addShape(field);

    return { mesh, body };
  };

  return { generate };
}