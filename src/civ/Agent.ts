import Human from './Civ';
import { ICommand, idle, interrupt } from '../commands';

export default class Agent {
  private command: ICommand;

  constructor(private human: Human) {
    this.command = idle(human);
  }

  step(dt: number) {
    this.human.step(dt);

    this.command = interrupt(this.human)(() => this.command.step(dt));
  }
}