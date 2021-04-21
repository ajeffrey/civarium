import * as THREE from 'three';
import SimplexNoise from 'fast-simplex-noise';
import Tile from './Tile';
import Entity from './Entity';

const TERRAIN_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0xddffdd
});

type Dictionary<T> = {[key: number]: T};

export default class Terrain {
  public object: THREE.Object3D;
  private heightmap: SimplexNoise;
  private tiles: Dictionary<Dictionary<Tile>>;
  public entities: Entity[];

  constructor() {
    this.heightmap = new SimplexNoise({
      frequency: 0.05,
      min: 0,
      max: 5,
      octaves: 2
    });

    this.tiles = {};
    this.object = new THREE.Object3D();
    this.entities = [];
  }

  generate(x1: number, y1: number, width: number, depth: number) {
    if(width < 1 || depth < 1) {
      throw new Error('invalid coord space');
    }

    const terrain = new THREE.Geometry();
    
    for(let x = 0; x <= width; x++) {
      for(let y = 0; y <= depth; y++) {
        const xOffs = x + x1;
        const yOffs = y + y1;
        const height = this.heightmap.scaled2D(xOffs, yOffs) % 0.5;
        terrain.vertices.push(new THREE.Vector3(xOffs, yOffs, height));
        if(x > 0 && y > 0) {
          const tile = new Tile(xOffs, yOffs);
          this.tiles[xOffs] = this.tiles[xOffs] || {};
          this.tiles[xOffs][yOffs] = tile;

          const a = (x - 1) + ((y - 1) * (width + 1));
          const b = x + ((y - 1) * (width + 1));
          const c = (x - 1) + (y * (width + 1));
          const d = x + (y * (width + 1));
          const faceA = new THREE.Face3(d, b, a);
          const faceB = new THREE.Face3(a, c, d);
          terrain.faces.push(faceA, faceB);
        }
      }
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
    this.object.add(object);
  }

  getPosition(coords: THREE.Vector2) {
    return new THREE.Vector3(coords.x, coords.y, this.heightmap.scaled2D(coords.x, coords.y) % 0.5);
  }

  addEntity(entity: Entity) {
    const object = new THREE.Object3D();
    object.position.copy(this.getPosition(entity.coords));
    this.entities.push(entity);
    object.add(entity.object);
    this.object.add(object);
  }
}