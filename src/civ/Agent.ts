import Human from './Civ';
import { ICommandStep, idle, interrupt } from '../commands';

export default class Agent {
  private command: ICommandStep;

  constructor(private human: Human) {
    this.command = idle(human);
  }

  step(dt: number) {
    this.human.hunger -= dt * 5;
    this.human.step();

    this.command = interrupt(this.human)(() => this.command(dt));
  }
}