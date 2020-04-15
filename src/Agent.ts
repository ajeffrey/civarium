import * as THREE from 'three';
import Human from './Human';
import { ICommand, idle, interrupt } from './commands';

export default class Agent {
  private isDying: boolean;
  private command: ICommand;

  constructor(private human: Human) {
    this.isDying = false;
    this.command = idle(human);
  }

  step(dt: number) {
    this.human.hunger -= dt * 5;
    this.human.step();

    this.command = interrupt(this.human)(() => this.command.step(dt));
  }
}