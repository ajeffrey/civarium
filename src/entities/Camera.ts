import * as THREE from 'three';
import { Spherical } from 'three';
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
  public camera: THREE.OrthographicCamera;
  public focus: THREE.Vector3;
  private sphere: THREE.Spherical;
  public following: Entity | null;

  constructor(entity: Entity) {
    super(entity);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 2000);
    camera.zoom = 10;
    camera.updateProjectionMatrix();

    this.focus = new THREE.Vector3(0, 0, 0);
    this.sphere = new Spherical(100, Math.PI / 4, Math.PI / 4);
    this._updatePosition();

    entity.transform.add(camera);
  }

  zoomBy(zoom: number) {
    this.camera.zoom = clamp(this.camera.zoom + zoom, 1, 100);
    this.camera.updateProjectionMatrix();
  }
  
  follow(object: Entity | null) {
    this.following = object;
  }

  rotate(h: number, v: number) {
    this.sphere.theta += h;
    this.sphere.phi = clamp(this.sphere.phi + v, Math.PI * 2 / 8, Math.PI * 3 / 8);
    this._updatePosition();
  }

  move(position: THREE.Vector3) {
    this.focus.add(position);
    this._updatePosition();
  }

  update() {
    if(this.following) {
      this.focus.copy(this.following.transform.position);
      this._updatePosition();
    }
  }

  private _updatePosition() {
    this.camera.position.setFromSpherical(this.sphere);
    this.camera.position.add(this.focus);
    this.camera.lookAt(this.focus);
  }
};