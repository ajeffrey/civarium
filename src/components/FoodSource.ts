import { Entity, Component } from "../ecs";

export class Food {
  constructor(
    readonly name: string,
    readonly fillHunger: number
    ) {}
}

export class FoodSource extends Component {
  constructor(entity: Entity, private _food: Food[]) {
    super(entity);
  }

  hasFood() {
    return this._food.length > 0;
  }

  takeFood() {
    if(!this.hasFood()) {
      return null;
    }

    const food = this._food.pop();
    return food;
  }
  
}