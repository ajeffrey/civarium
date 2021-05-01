import * as THREE from 'three';
import { Entity, Component } from "../Entity";
import ModelManager from '../ModelManager';
import Time from '../Time';

export class Model extends Component {
  public model: THREE.Object3D;
  public animations: {[key: string]: THREE.AnimationAction};
  public mixer: THREE.AnimationMixer;
  private _animation: THREE.AnimationAction | null;
  
  constructor(entity: Entity, public modelName: string, animations: string[]) {
    super(entity);
    this.model = ModelManager.getCopy(modelName);
    this.animations = {};
    this._animation = null;
    const mixer = this.mixer = new THREE.AnimationMixer(this.model);
    for(const animation of animations) {
      const anim = ModelManager.getOriginal(animation);
      const clip = mixer.clipAction(anim.animations[0]);
      this.animations[animation] = clip;
    }
    
    entity.transform.add(this.model);
  }

  setAnimation(name: string, cb?: Function) {
    const newAnim = this.animations[name];
    newAnim.reset();

    if(this._animation) {
      newAnim.play();
      this._animation.crossFadeTo(newAnim, 0.25, true);
      
    } else {
      newAnim.play();
    }
    if(cb) {
      const handler = () => {
        cb();
        this.mixer.removeEventListener('finished', handler);
      }
      
      this.mixer.addEventListener('finished', handler);
    }

    this._animation = newAnim;
  }

  update() {
    this.mixer.update(Time.deltaTime);
  }
}
