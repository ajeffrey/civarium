import { ICommand } from '../ICommand';
import Human from '../Human';
import { IFoodSource } from '../IFoodSource';

export default class ConsumeFoodCommand implements ICommand {
  private timer: number;
  public isComplete: boolean;
  constructor(private human: Human, private foodSource: IFoodSource) {
    this.timer = 0;
    this.isComplete = false;
  }

  step(dt: number) {
    this.timer += dt;
    if(this.timer >= 1 && !this.isComplete) {
      this.isComplete = true;
      const food = this.foodSource.takeFood();
      console.log('GOT FOOD', food);
      if(food) {
        this.human.hunger += food.fillHunger;
      }
    }
  }
}