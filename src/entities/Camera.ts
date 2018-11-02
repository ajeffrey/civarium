import * as THREE from 'three';
import { Entity } from '../ecs';

interface ICameraViewport {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const clamp = (val: number, min: number, max: number) => {
  return Math.min(max, Math.max(val, min));
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
  private zoom: number;
  public camera: THREE.OrthographicCamera;
  private inner: THREE.Object3D;

  constructor(zoom: number) {
    super();
    this.zoom = zoom;
    const { left, right, top, bottom } = calculateViewport(zoom);
    const camera = this.camera = new THREE.OrthographicCamera(left, right, top, bottom, -10, 2000);
    const object = this.object = new THREE.Object3D();
    const inner = this.inner = new THREE.Object3D();
    object.name = 'Camera Dolly';
    object.add(inner);
    inner.add(camera);
    this.rotate(45, -45);
    camera.position.set(0, 0, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  zoomBy(zoom: number) {
    this.zoom = clamp(this.zoom + zoom, 10, 50);
    const { left, right, top, bottom } = calculateViewport(this.zoom);
    this.camera.left = left;
    this.camera.top = top;
    this.camera.right = right;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix();
  }

  rotate(h: number, v: number) {
    this.object.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), h);
    this.inner.rotateOnAxis(new THREE.Vector3(1, 0, 0), v);
    this.inner.rotation.x = clamp(this.inner.rotation.x, -1, -0.3);
  }

  moveTo(position: THREE.Vector3) {
    this.camera.position.copy(position.addScalar(30));
    this.camera.lookAt(position);
  }

  update(dt: number) {
    this.object.position.add(new THREE.Vector3())
  }
};