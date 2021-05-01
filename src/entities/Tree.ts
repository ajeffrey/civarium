import * as THREE from 'three';
import { Food, FoodSource } from '../components/FoodSource';
import Located from '../components/Location';
import { Model } from '../components/Model';
import { Component, Entity } from '../Entity';

export class Tree extends Component {
  constructor(entity: Entity, coords: THREE.Vector2) {
    super(entity);
    const apples: Food[] = [];
    for(let i = 0; i < 3; i++) {
      apples.push(new Food('Apple', 20));
    }

    entity.addComponent(Model, 'tree', []);
    entity.addComponent(Located, coords);
    entity.addComponent(FoodSource, apples);
  }
}
