import * as THREE from 'three';
import { Entity, Component, World } from 'src/ecs';
import Explorer from 'src/components/Explorer';
import Location from 'src/components/Location';
import ChunkGenerator from './ChunkGenerator';
import Heightmap from './Heightmap';
import ChunkManager from './ChunkManager';

interface GenerationOptions {
  seed?: string;
}

export default class Terrain extends Component {
  private heightmap: Heightmap;
  private chunkGenerator: ChunkGenerator;
  private chunkManager: ChunkManager;
  public object: THREE.Object3D;
  private knownLocations: Map<string, THREE.Vector2>;

  constructor(entity: Entity, options: GenerationOptions) {
    super(entity);
    const seed = options.seed || Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
    this.heightmap = new Heightmap({ algorithm: 'fast-simplex', octaves: 8, lacunarity: 3, persistence: 2, seed });
    this.chunkGenerator = new ChunkGenerator(this.heightmap, 128);
    this.knownLocations = new Map<string, THREE.Vector2>();
    this.chunkManager = new ChunkManager(this.chunkGenerator);
    this.object = new THREE.Object3D;
    this.object.name = 'Terrain';
    this.object.add(this.chunkManager.object)
    entity.transform.add(this.object);
  }

  getPosition(coords: THREE.Vector2) {
    const height = this.heightmap.getLerpHeight(coords.x, coords.y);
    return new THREE.Vector3(coords.x, height, -coords.y);
  }

  getChunkFromCoord(coords: THREE.Vector2): THREE.Vector2 {
    const { chunkSize } = this.chunkGenerator;
    const x = Math.floor((coords.x + (chunkSize / 2)) / chunkSize);
    const y = Math.floor((coords.y + (chunkSize / 2)) / chunkSize);
    return new THREE.Vector2(x, y);
  }

  getChunkRange(coords: THREE.Vector2, viewRange: number) {
    const topLeft = this.getChunkFromCoord(new THREE.Vector2(coords.x - viewRange, coords.y - viewRange));
    const bottomRight = this.getChunkFromCoord(new THREE.Vector2(coords.x + viewRange, coords.y + viewRange));
    const list: [number, number][] = [];
    for(let x = topLeft.x - 1; x <= bottomRight.x + 1; x++) {
      for(let y = topLeft.y - 1; y <= bottomRight.y + 1; y++) {
        list.push([x, y]);
      }
    }

    return list;
  }

  update() {
    const entities = World.entities.find([Location]);
    for(const entity of entities) {
      const knownLocation = this.knownLocations.get(entity.id);
      const { coords } = entity.getComponent(Location);
      
      // only run this process if location changed or this is first time entity was seen
      if(!(knownLocation && knownLocation.equals(coords))) {
        this.knownLocations.set(entity.id, coords.clone());
        const location = this.getPosition(coords);
        entity.transform.position.copy(location);
        entity.transform.updateMatrixWorld();

        if(entity.hasComponent(Explorer)) {
          const { viewRange } = entity.getComponent(Explorer);
          const oldRange = knownLocation ? this.getChunkRange(knownLocation, viewRange) : [];
          const newRange = this.getChunkRange(coords, viewRange);
          const addRefs = newRange.filter(r => !oldRange.find(r2 => r[0] === r2[0] && r[1] === r2[1]));
          const removeRefs = oldRange.filter(r => !newRange.find(r2 => r[0] === r2[0] && r[1] === r2[1]));
          for(const removeRef of removeRefs) {
            this.chunkManager.removeRef(entity, ...removeRef);
          }

          for(const addRef of addRefs) {
            this.chunkManager.addRef(entity, ...addRef);
          }
        }
      }
    }
  }
}
