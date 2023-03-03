
import * as THREE from 'three';
// import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';

const TERRAIN_MATERIAL = new THREE.MeshPhongMaterial({
  color: 0x2f944a,
  flatShading: true,
  shininess: 0,
});

// normal computation adapted from BufferGeometry#computeVertexNormals()
// https://github.com/mrdoob/three.js/blob/dev/src/core/BufferGeometry.js
const pA = new THREE.Vector3(), pB = new THREE.Vector3(), pC = new THREE.Vector3();
const cb = new THREE.Vector3(), ab = new THREE.Vector3();

function computeNormal() {
  cb.subVectors(pC, pB);
  ab.subVectors(pA, pB);
  cb.cross(ab);
}

export default class MeshGenerator {

  generate(chunkSize: number, heights: number[]) {
    const vertexWidth = chunkSize + 1;
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals = new Float32Array(vertexWidth * vertexWidth * 3);
    // const colors: number[] = [];

    const getVertex = (target: THREE.Vector3, x: number, y: number) => {
      if (x >= 0 && x <= chunkSize && y >= 0 && y <= chunkSize) {
        target.fromArray(vertices, (x + (y * vertexWidth)) * 3);

      } else {
        const height = heights[(y * vertexWidth) + x];
        target.set(x, height, -y);
      }
    };

    const addNormal = (x: number, y: number) => {
      if (x >= 0 && x <= chunkSize && y >= 0 && y <= chunkSize) {
        const offset = (x + (y * vertexWidth)) * 3;
        normals[offset] += cb.x;
        normals[offset + 1] += cb.y;
        normals[offset + 2] += cb.z;
      }
    };

    // logic: for chunk of width W
    // faces = W^2
    // vertices = (W+1)^2
    // face normals = (W + 2)^2
    for (let y = 0; y <= chunkSize + 1; y++) {
      for (let x = 0; x <= chunkSize + 1; x++) {

        // create vertices
        if (x <= chunkSize && y <= chunkSize) {
          const height = heights[(y * vertexWidth) + x];
          vertices.push(x, height, -y);
          // colors.push(x / chunkSize, y / chunkSize, 0);

          // create faces
          if (x > 0 && y > 0) {
            const a = (x - 1) + ((y - 1) * vertexWidth);
            const b = x + ((y - 1) * vertexWidth);
            const c = (x - 1) + (y * vertexWidth);
            const d = x + (y * vertexWidth);

            // add vertex indices to array
            indices.push(a, b, d);
            indices.push(d, c, a);
          }
        }

        // compute face normals and add to vertex normals

        // abd face
        getVertex(pA, x - 1, y - 1);
        getVertex(pB, x, y - 1);
        getVertex(pC, x, y);
        computeNormal();
        addNormal(x - 1, y - 1);
        addNormal(x, y - 1);
        addNormal(x, y);

        // dca face - swap pA and pC then set pB to C vertex
        pB.copy(pA); // aad
        pA.copy(pC); // dad
        pC.copy(pB); // daa
        getVertex(pB, x - 1, y); // dca
        computeNormal();
        addNormal(x, y);
        addNormal(x - 1, y);
        addNormal(x - 1, y - 1);
      }
    }

    // normalise vertex normals
    for (let i = 0; i < normals.length; i += 3) {
      const x = normals[i];
      const y = normals[i + 1];
      const z = normals[i + 2];
      const mag = Math.sqrt((x * x) + (y * y) + (z * z));
      normals[i] /= mag;
      normals[i + 1] /= mag;
      normals[i + 2] /= mag;
    }

    const terrain = new THREE.BufferGeometry();
    terrain.setIndex(indices);
    terrain.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    terrain.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    // terrain.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mesh = new THREE.Mesh(terrain, TERRAIN_MATERIAL);
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    const edges = new THREE.EdgesGeometry(mesh.geometry, 1);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0 }));

    const object = new THREE.Object3D();
    object.name = `Terrain Mesh`;
    object.add(mesh);
    // object.add(line);
    // const helper = new VertexNormalsHelper(mesh, 2, 0xff0000);
    // object.add(helper);
    return object;
  }
}
