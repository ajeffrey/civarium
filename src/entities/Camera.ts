import * as THREE from 'three';
import { Entity } from '../ecs';

interface ICameraViewport {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const calculateViewport = (zoom: number): ICameraViewport => {
  const aspect = window.innerWidth / window.innerHeight;
  return {
    top: zoom,
    bottom: -zoom,
    left: -zoom * aspect,
    right: zoom * aspect,
  };
};

export class Camera extends Entity {
  public camera: THREE.Camera;

  constructor(zoom: number) {
    super();
    const { left, right, top, bottom } = calculateViewport(zoom);
    const camera = this.camera = new THREE.OrthographicCamera(left, right, top, bottom, 0, 2000);
    camera.position.set(30, 30, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  moveTo(position: THREE.Vector3) {
    this.camera.position.copy(position.addScalar(30));
    this.camera.lookAt(position);
  }
};