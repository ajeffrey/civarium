import * as THREE from 'three';
import { Spherical } from 'three';
import { Component, Entity } from '../ecs';

const clamp = (val: number, min: number, max: number) => {
  return Math.min(max, Math.max(val, min));
};

export default class Camera extends Component {
  public camera: THREE.OrthographicCamera;
  public focus: THREE.Vector3;
  private sphere: THREE.Spherical;
  public following: Entity | null;

  constructor(entity: Entity) {
    super(entity);

    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    const camera = this.camera = new THREE.OrthographicCamera(-width, width, height, -height, 1, 2000);
    camera.zoom = 25;
    camera.updateProjectionMatrix();

    this.focus = new THREE.Vector3(0, 0, 0);
    this.sphere = new Spherical(100, Math.PI / 4, Math.PI * 1 / 4);
    this._updatePosition();

    entity.transform.add(camera);
  }

  resize() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    Object.assign(this.camera, { left: -width, right: width, top: height, bottom: -height });
    this.camera.updateProjectionMatrix();
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