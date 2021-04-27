import * as THREE from 'three';
import { Component, Entity } from './Entity';
import Time from './Time';

export default class Sun extends Component {
  private ambientLight: THREE.AmbientLight;
  public object: THREE.Object3D;

  constructor(entity: Entity) {
    super(entity);
    const ambientLight = this.ambientLight = new THREE.AmbientLight(0x010101 * 100);
    ambientLight.name = 'Ambient Light';
    
    const sun = this.object = new THREE.Object3D();
    sun.name = 'Sun';
    
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.25);
    sunLight.target.position.set(0, 0, 0);
    sunLight.name = 'Sun Light';
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sun.add(sunLight);
    sun.add(orb);
    sun.add(ambientLight);
    sunLight.position.y = 100;
    orb.position.y = 100;
    entity.transform.add(sun);
  }

  update() {
    const dayRatio = Time.wallTime / Time.DAY_LENGTH;
    this.object.rotation.z = (dayRatio * Math.PI * 2) + Math.PI;
    this.ambientLight.intensity = 0.5 + (0.5 * Math.sin(dayRatio * Math.PI));
  }
};