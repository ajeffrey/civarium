import * as THREE from 'three';
import { Component, Entity } from './Entity';
import Time from './Time';

export default class Sun extends Component {
  private ambientLight: THREE.AmbientLight;
  public object: THREE.Object3D;
  private light: THREE.DirectionalLight;
  private isNight: boolean;

  constructor(entity: Entity) {
    super(entity);
    
    const sun = this.object = new THREE.Object3D();
    sun.position.y = -20;
    sun.name = 'Sun';
    
    const ambientLight = this.ambientLight = new THREE.AmbientLight(0x010101 * 100);
    ambientLight.name = 'Ambient Light';
    sun.add(ambientLight);

    const light = this.light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.y = 100;
    light.target.position.set(0, 0, 0);
    light.name = 'Sun Light';
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 250;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;
    // entity.transform.add(new THREE.CameraHelper(light.shadow.camera));
    sun.add(light);

    entity.transform.add(sun);
  }

  update() {
    const dayRatio = Time.wallTime / Time.DAY_LENGTH; // midnight = 0, midday = 0.5
    const phaseRatio = (dayRatio + 0.25) % 1; // sunrise = 0, sunset = 0.5

    const isNight = (phaseRatio < 0.5);
    if(isNight && !this.isNight) {
      this.isNight = true;
      this.light.intensity = 0.125;
      this.light.position.y = -100;

    } else if(!isNight && this.isNight) {
      this.isNight = false;
      this.light.intensity = 0.5;
      this.light.position.y = 100;
    }
    
    this.object.rotation.z = (dayRatio * Math.PI * 2) + Math.PI;
    this.ambientLight.intensity = 0.5 + (0.5 * Math.sin(dayRatio * Math.PI));
  }
};