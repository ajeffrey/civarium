import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import ModelManager from './ModelManager';

const gltfLoader = new GLTFLoader();
const colladaLoader = new ColladaLoader();

export default class ModelLoader {
  private static _loaders: Promise<any>[] = [];

  static loadGLTF(name: string, path: string) {
    this._loaders.push(new Promise(resolve => {
      gltfLoader.load(path, ({ scene }) => {
        ModelManager.add(name, scene);
        resolve(null);
      });
    }));
  }

  static loadCollada(name: string, path: string) {
    this._loaders.push(new Promise(resolve => {
      colladaLoader.load(path, ({ scene }) => {
        scene.traverse(obj => {
          if(obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        })
        ModelManager.add(name, scene);
        resolve(null);
      });
    }));
  }

  static onReady(cb: () => any) {
    Promise.all(this._loaders).then(cb);
  }
}