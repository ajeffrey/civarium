import * as THREE from 'three';
import Human from '../Human';
import Entity from '../Entity';
import MoveCommand from './MoveCommand';
import { ICommand } from '../ICommand';
import ConsumeFoodCommand from './ConsumeFoodCommand';
import { IFoodSource } from '../IFoodSource';

export default class EatCommand implements ICommand {
  public isComplete: boolean;
  private command: ICommand | null;
  private queue: ICommand[];

  constructor(private human: Human) {
    this.queue = [];
    this.isComplete = false;

    const terrain = human.terrain;

    const foodSources = terrain.entities.filter(e => e.tags.indexOf('FOOD_SOURCE') >= 0);
    let nearestDistance = Infinity;
    let nearestSource: Entity | null = null;
    for(const foodSource of foodSources) {
      const distance = human.coords.distanceTo(foodSource.coords);
      if(distance < nearestDistance) {
        nearestDistance = distance;
        nearestSource = foodSource;
      }
    }

    if(nearestSource) {
      console.log('EAT FROM', nearestSource);
      this.queue = [
        new MoveCommand(human, nearestSource.coords),
        new ConsumeFoodCommand(human, nearestSource as IFoodSource)
      ];
    }
  }

  step(dt: number) {
    if(this.isComplete) return;

    if(!this.command || this.command.isComplete) {
      if(this.queue.length > 0) {
        this.command = this.queue.shift();
        this.command.step(dt);

      } else {
        this.isComplete = true;
      }
      
    } else {
      this.command.step(dt);
    }
  }
}