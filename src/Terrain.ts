import * as THREE from 'three';
import SimplexNoise from 'fast-simplex-noise';
import Tile from './Tile';

type Dictionary<T> = {[key: number]: T};

const TERRAIN_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xddffdd
});

class Terrain {
  public object: THREE.Object3D;
  private heightmap: SimplexNoise;
  private tiles: Dictionary<Dictionary<Tile>>;

  attach(parent: THREE.Object3D) {
    this.heightmap = new SimplexNoise({
      frequency: 0.05,
      min: 0,
      max: 5,
      octaves: 2
    });

    this.tiles = {};
    this.object = new THREE.Object3D();
    parent.add(this.object);
  }

  generate(x1: number, y1: number, width: number, depth: number) {
    if(width < 1 || depth < 1) {
      throw new Error('invalid coord space');
    }

    const vertices = [];
    const indices = [];
    
    for(let x = 0; x <= width; x++) {
      for(let y = 0; y <= depth; y++) {
        const xOffs = x + x1;
        const yOffs = y + y1;
        const height = this.getHeight(xOffs, yOffs);
        vertices.push(xOffs, height, yOffs);
        if(x > 0 && y > 0) {
          const tile = new Tile(xOffs, yOffs);
          this.tiles[xOffs] = this.tiles[xOffs] || {};
          this.tiles[xOffs][yOffs] = tile;

          const a = (x - 1) + ((y - 1) * (width + 1));
          const b = x + ((y - 1) * (width + 1));
          const c = (x - 1) + (y * (width + 1));
          const d = x + (y * (width + 1));
          indices.push(a, b, d);
          indices.push(d, c, a);
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
    object.add(mesh);
    object.add(line);
    this.object.add(object);
  }

  getHeight(x: number, y: number) {
    return this.heightmap.scaled2D(x, y);
  }

  getPosition(coords: THREE.Vector2) {
    const height = this.getHeight(coords.x, coords.y);
    return new THREE.Vector3(coords.x, height, coords.y);
  }
}

const terrain = new Terrain;
export default terrain;
