import * as THREE from 'three';
import * as Chroma from 'chroma-js';

const gradient = Chroma.scale(['#ff0000', '#00bb00']).domain([0, 1]).mode('lch')

export default class Stats {
  public object: THREE.Object3D;
  private sprites: THREE.Sprite[];

  constructor(
    values: number[],
  ) {
    const object = this.object = new THREE.Object3D();
    object.position.set(0, 0, 4.5);
    object.name = 'Stats';
    
    this.sprites = [];
    let position = 0;
    for(let i = values.length - 1; i >= 0; i--) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x00ff00, depthTest: false }));
      sprite.position.set(0, 0, -position * 1);
      object.add(sprite);
      this.sprites.push(sprite);
      position += 1;
    }

    this.update(values);
  }

  update(values: number[]) {
    for(let i = values.length - 1; i >= 0; i--) {
      const ratio = Math.max(0, values[i] / 100);
      const [r, g, b] = gradient(ratio).rgb();
      const object = this.sprites[values.length -1 - i];
      object.material.color.setRGB(r / 255, g / 255, b / 255);
      object.scale.set(ratio * 4, 0.5, 1);
    }
  }
}