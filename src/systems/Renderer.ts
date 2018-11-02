import * as THREE from 'three';
import { Entity, System } from '../ECS';
import { Camera } from '../entities';

export class Renderer extends System {
  private renderer: THREE.Renderer;
  public scene: THREE.Scene;
  private camera: Camera;

  constructor(camera: Camera) {
    super();
    this.camera = camera;
    const renderer = this.renderer = new THREE.WebGLRenderer({ alpha:true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    const scene = this.scene = new THREE.Scene();
    scene.name = 'Scene';
    scene.background = new THREE.Color(0xaaffff);
  }

  attachTo(parent: HTMLElement) {
    parent.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('click', () => {
      this.renderer.domElement.webkitRequestPointerLock();
    });
  }

  add(entity: Entity) {
    if(entity.object) {
      this.scene.add(entity.object);
    }
  }

  step(dt: number) {
    this.renderer.render(this.scene, this.camera.camera);
  }
};