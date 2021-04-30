import * as THREE from 'three';
import SimplexNoise from 'fast-simplex-noise';
import Tile from './Tile';

type Dictionary<T> = {[key: number]: T};

const TERRAIN_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xddffdd
});

function lerp(a, b, x) {
  return a + ((b - a) * x);
}

class Terrain {
  public object: THREE.Object3D;
  private generator: SimplexNoise;
  private heights: number[][];
  private tiles: Dictionary<Dictionary<Tile>>;

  attach(parent: THREE.Object3D) {
    this.generator = new SimplexNoise({
      frequency: 0.05,
      min: 0,
      max: 5,
      octaves: 2
    });

    this.heights = [];
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
        const height = this._getIntHeight(xOffs, yOffs);
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

  private _getIntHeight(x: number, y: number) {
    const height = this.heights[x] && this.heights[x][y];
    if(height !== undefined) {
      return height;
    }

    const h = this.generator.scaled2D(x, y);
    this.heights[x] = this.heights[x] || [];
    this.heights[x][y] = h;
    return h;
  }

  private _getLerpHeight(x: number, y: number) {
    const x1 = Math.floor(x);
    const x2 = Math.ceil(x);
    const y1 = Math.floor(y);
    const y2 = Math.ceil(y);
    const xLerp = lerp(x1, x2, x % 1);
    const yLerp = lerp(y1, y2, y % 1);
    const a = this._getIntHeight(x1, y1);
    const b = this._getIntHeight(x1, y2);
    const c = this._getIntHeight(x2, y1);
    const d = this._getIntHeight(x2, y2);
    const xl1 = lerp(a, c, xLerp);
    const xl2 = lerp(b, d, xLerp);
    const yl = lerp(xl1, xl2, yLerp);
    return yl;
  }

  getPosition(coords: THREE.Vector2) {
    const height = this._getLerpHeight(coords.x, coords.y);
    return new THREE.Vector3(coords.x, height, coords.y);
  }
}

const terrain = new Terrain;
export default terrain;
