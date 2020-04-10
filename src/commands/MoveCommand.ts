import * as THREE from 'three';
import Human from '../Human';
import { ICommand } from '../ICommand';

export default class MoveCommand implements ICommand {
  public isComplete: boolean;
  private origin: THREE.Vector2;
  private unit: THREE.Vector2;
  private speed = 5;

  constructor(
    private human: Human,
    private destination: THREE.Vector2
  ) {
    this.origin = human.coords.clone();
    this.unit = destination.clone().sub(this.origin).normalize();
    this.isComplete = false;
  }

  step(dt: number) {
    if(this.isComplete) return;

    if(this.human.coords.distanceTo(this.destination) > 0.1) {
      const next = this.human.coords.clone().add(this.unit.clone().multiplyScalar(dt * this.speed));
      this.human.moveTo(next);

    } else {
      this.isComplete = true;
    }
  }
}