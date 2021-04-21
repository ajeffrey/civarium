import * as THREE from 'three';
import * as Chroma from 'chroma-js';

const gradient = Chroma.scale(['#ff0000', '#00bb00']).domain([0, 1]).mode('lch')

export default class Bar {
  private object: THREE.Sprite;

  constructor(
    private max: number,
    parent: THREE.Object3D
  ) {
    const object = this.object = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x00ff00, depthTest: false }));
    object.position.set(0, 0, 4);
    object.name = 'Bar';
    parent.add(object);
  }

  update(val: number) {
    const ratio = Math.max(0, val / this.max);
    const [r, g, b] = gradient(ratio).rgb();
    this.object.material.color.setRGB(r / 255, g / 255, b / 255);
    this.object.scale.set(ratio * 4, 0.5, 1);
  }
}