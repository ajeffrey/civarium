import * as THREE from 'three';
import { Component, Entity } from 'src/ecs';
import { Food, FoodSource } from 'src/components/FoodSource';
import Located from 'src/components/Location';
import { Model } from 'src/components/Model';
import { Followable } from 'src/components/Followable';

export class Tree extends Component {
  constructor(entity: Entity, coords: THREE.Vector2) {
    super(entity);
    const apples: Food[] = [];
    for(let i = 0; i < 3; i++) {
      apples.push(new Food('Apple', 20));
    }

    entity.addComponent(Followable);
    entity.addComponent(Model, 'tree', []);
    entity.addComponent(Located, coords);
    entity.addComponent(FoodSource, apples);
  }
}
