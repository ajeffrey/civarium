import * as THREE from 'three';
import { Component, Entity } from '../Entity';

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

export default class Camera extends Component {
  private zoom: number;
  public camera: THREE.OrthographicCamera;
  public object: THREE.Object3D;

  constructor(entity: Entity, zoom: number) {
    super(entity);

    this.zoom = zoom;
    const { left, right, top, bottom } = calculateViewport(zoom);
    const camera = this.camera = new THREE.OrthographicCamera(left, right, top, bottom, -10, 2000);
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.position.set(1000, 1000, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const object = this.object = new THREE.Object3D();
    object.add(camera);
    entity.transform.add(object);
  }

  zoomBy(zoom: number) {
    this.zoom = clamp(this.zoom + zoom, 5, 20);
    const { left, right, top, bottom } = calculateViewport(this.zoom);
    this.camera.left = left;
    this.camera.top = top;
    this.camera.right = right;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix();
  }

  rotate(h: number, v: number) {
    this.entity.transform.rotateOnWorldAxis(new THREE.Vector3(0, 0, -1), h);
    this.object.rotateOnAxis(new THREE.Vector3(-1, 0, 0), v);
    this.object.rotation.x = clamp(this.object.rotation.x, -0.6, 0);
  }

  move(position: THREE.Vector3) {
    this.camera.position.add(position);
  }

  update() {
    this.entity.transform.position.add(new THREE.Vector3())
  }
};