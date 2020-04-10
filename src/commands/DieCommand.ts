import { ICommand } from '../ICommand';
import Human from '../Human';

export default class DieCommand implements ICommand {
  public isComplete: boolean;
  private timer: number;
  
  constructor(private human: Human) {
    this.isComplete = false;
    this.timer = 0;
  }

  step(dt: number) {
    this.timer += dt;
    this.human.object.rotateX(dt * Math.PI / 2);
    if(this.timer >= 1) {
      console.log('death complete');
      this.isComplete = true;
    }
  }
}