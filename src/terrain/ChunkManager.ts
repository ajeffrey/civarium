import * as THREE from "three";
import { Entity } from "../ecs";
import Chunk from "./Chunk";
import ChunkGenerator from "./ChunkGenerator";

export default class ChunkManager {
  private chunks: Map<string, Chunk>;
  private chunkGenerator: ChunkGenerator;
  private refs: Map<string, Set<string>>;
  public object: THREE.Object3D;

  constructor(chunkGenerator: ChunkGenerator) {
    this.chunkGenerator = chunkGenerator;
    this.chunks = new Map<string, Chunk>();
    this.refs = new Map<string, Set<string>>();
    this.object = new THREE.Object3D();
  }

  addRef(entity: Entity, x: number, y: number) {
    const id = this.getId(x, y);
    if(this.refs.has(id)) {
      this.refs.get(id).add(entity.id);

    } else {
      this.refs.set(id, new Set([entity.id]));
      const chunk = this.chunkGenerator.generate(x, y);
      this.chunks.set(id, chunk);
      this.object.add(chunk.mesh);
    }
  }

  removeRef(entity: Entity, x: number, y: number) {
    const id = this.getId(x, y);
    const refs = this.refs.get(id);
    if(!refs) {
      throw new Error('tried to remove invalid ref');
    }

    refs.delete(entity.id);
    if(refs.size === 0) {
      const chunk = this.chunks.get(id);
      this.object.remove(chunk.mesh);
      this.refs.delete(id);
      this.chunks.delete(id);
    }
  }

  private getId(x: number, y: number) {
    return `${x}:${y}`;
  }
  
}