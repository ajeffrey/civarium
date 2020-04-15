import Human from './Human';
import nearestFoodSource from './queries/nearestFoodSource';
import { IFoodSource, IFood } from './IFoodSource';

export interface ICommand {
  name: string;
  step(dt: number): ICommand;
}

type INext<T = null> = (val: T) => ICommand;

function seq<IN, A, OUT>(
  fa: (input: IN) => (next: INext<A>) => ICommand,
  fb: (input: A) => (next: INext<OUT>) => ICommand,
  fc: (input: OUT) => ICommand
) {
  return (input: IN): ICommand => {
    return fa(input)(a => fb(a)(b => fc(b)));
  }
}

export const die = (human: Human) => (next: INext): ICommand => {
  let timer = 0;

  return {
    name: 'dying',
    step(dt: number) {
      timer += dt;
      human.object.rotateX(dt * Math.PI / 2);
      if(timer >= 1) {
        return next(null);

      } else {
        return this;
      }
    }
  };
};

export const idle = (human: Human): ICommand => {
  return {
    name: 'idling',
    step(dt: number) {
      if(human.hunger <= 50) {
        return findFood(human)(() => this);

      } else {
        return this;
      }
    }
  };
};

export const interrupt = (human: Human) => (next: INext): ICommand => {
  if(human.hunger <= 0) {
    return die(human)(next);
  }

  return next(null);
};

export const findFood = (human: Human) => (next: INext): ICommand => {
  const viableFoodSources = human.terrain.entities.filter(e => e.tags.indexOf('FOOD_SOURCE') >= 0);
  const nearestFood = nearestFoodSource(human.coords, viableFoodSources);

  if(nearestFood) {
    const s = seq(
      () => moveToCoords(human, nearestFood.coords),
      () => harvestFood(nearestFood as IFoodSource),
      food => food ? eatFood(human, food)(next) : next(null)
    );

    return s(null);

  } else {
    return next(null);
  }
}

export const moveToCoords = (human: Human, destination: THREE.Vector2) => (next: INext): ICommand => {
  const unit = destination.clone().sub(human.coords).normalize();

  return {
    name: 'moving',
    step(dt: number) {
      if(human.coords.distanceTo(destination) > 0.1) {
        const position = human.coords.clone().add(unit.clone().multiplyScalar(dt * human.speed));
        human.moveTo(position);
        return this;

      } else {
        return next(null);
      }
    }
  };
}

export const harvestFood = (foodSource: IFoodSource) => (next: INext<IFood | null>): ICommand => {
  let timer = 0;

  return {
    name: 'harvestingFood',
    step(dt: number) {
      timer += dt;
      if(timer >= 1) {
        const food = foodSource.takeFood();
        return next(food);

      } else {
        return this;
      }
    }
  };
}

export const eatFood = (human: Human, food: IFood) => (next: INext): ICommand => {
  human.hunger += food.fillHunger;
  return next(null);
};  