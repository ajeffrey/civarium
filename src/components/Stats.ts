import * as THREE from 'three';
import * as Chroma from 'chroma-js';
import { Component, Entity } from '../ecs';

const gradient = Chroma.scale(['#bb0000', '#00bb00']).domain([0, 1]).mode('lch');



export default class Stats extends Component {
  public object: THREE.Object3D;
  private sprites: THREE.Sprite[];

  constructor(entity: Entity, private _getValues: () => number[]) {
    super(entity);
    const object = this.object = new THREE.Object3D();
    object.position.set(0, 3.5, 0);
    object.name = 'Stats';
    entity.transform.add(object);
    
    this.sprites = [];
    let position = 0;
    const values = _getValues();
    for(let i = values.length - 1; i >= 0; i--) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x00ff00, depthTest: false }));
      sprite.position.set(0,  -position * 1, 0);
      object.add(sprite);
      this.sprites.push(sprite);
      position += 0.5;
    }

    this.update();
  }

  hide() {
    this.object.visible = false;
  }

  update() {
    const values = this._getValues();

    for(let i = values.length - 1; i >= 0; i--) {
      const ratio = Math.max(0, values[i] / 100);
      const [r, g, b] = gradient(ratio).rgb();
      const object = this.sprites[values.length -1 - i];
      object.material.color.setRGB(r / 255, g / 255, b / 255);
      if(ratio <= 0) {
        object.visible = false;

      } else {
        object.visible = true;
        object.scale.set(ratio * 2, 0.25, 1);
      }
    }
  }
}