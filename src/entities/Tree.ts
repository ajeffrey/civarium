import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Entity from '../Entity';
import { IFoodSource } from '../IFoodSource';

export function loadTree() {
  return new Promise<(coords: THREE.Vector2) => Tree>(resolve => {
    const loader = new GLTFLoader();
    loader.load('/models/tree.gltf', ({ scene: treeModel }) => {
      treeModel.rotateX(90);
      treeModel.scale.set(0.25, 0.25, 0.25);
      treeModel.traverse(child => {
        if(child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      })

      resolve((coords: THREE.Vector2) => {
        return new Tree(coords, treeModel);
      });
    });
  })
}

class Tree extends Entity implements IFoodSource {
  private appleCount: number;

  constructor(coords: THREE.Vector2, model: THREE.Object3D) {
    super(coords, ['FOOD_SOURCE'], model);
    this.appleCount = 3;
  }

  takeFood() {
    if(this.appleCount >= 1) {
      this.appleCount -= 1;
      return { fillHunger: 20 };
      
    } else {
      return null;
    }
  }

  step(dt: number) {
    this.appleCount += dt / 10;
  }
}