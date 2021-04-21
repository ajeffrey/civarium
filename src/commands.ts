import Human from './civ/Civ';
import nearestFoodSource from './queries/nearestFoodSource';
import { IFoodSource, IFood } from './IFoodSource';

export type ICommandStep = (dt: number) => ICommandStep;
type INext<T = null> = (val: T) => ICommandStep;

function seq<IN, A, OUT>(
  fa: (input: IN) => (next: INext<A>) => ICommandStep,
  fb: (input: A) => (next: INext<OUT>) => ICommandStep,
  fc: (input: OUT) => ICommandStep
) {
  return (input: IN) => {
    return fa(input)(a => fb(a)(b => fc(b)));
  }
}

export const die = (human: Human) => (next: INext): ICommandStep => {
  let timer = 0;
  return function step(dt: number) {
    timer += dt;
    human.object.rotateX(dt * Math.PI / 2);
    if(timer >= 1) {
      console.log('death complete');
      return next(null);

    } else {
      return step;
    }
  }
};

export const idle = (human: Human): ICommandStep => {
  return function step(dt: number) {
    console.log('idle!');
    if(human.hunger <= 50) {
      return findFood(human)(() => step);

    } else {
      return step;
    }
  };
};

export const interrupt = (human: Human) => (next: INext): ICommandStep => {
  if(human.hunger <= 0) {
    return die(human)(next);
  }

  return next(null);
};

export const findFood = (human: Human) => (next: INext): ICommandStep => {
  console.log('find food');
  const viableFoodSources = human.terrain.entities.filter(e => e.tags.indexOf('FOOD_SOURCE') >= 0);
  const nearestFood = nearestFoodSource(human.coords, viableFoodSources);

  if(nearestFood) {
    return seq(
      () => moveToCoords(human, nearestFood.coords),
      () => harvestFood(nearestFood as IFoodSource),
      food => food ? eatFood(human, food)(next) : next(null)
    );

  } else {
    return next(null);
  }
}

export const moveToCoords = (human: Human, destination: THREE.Vector2) => (next: INext): ICommandStep => {
  const unit = destination.clone().sub(human.coords).normalize();

  return function step(dt: number) {
    console.log('move to coords');
    if(human.coords.distanceTo(destination) > 0.1) {
      const position = human.coords.clone().add(unit.clone().multiplyScalar(dt * human.speed));
      console.log('move to', position.x, position.y);
      human.moveTo(position);
      return step;

    } else {
      return next(null);
    }
  }
}

export const harvestFood = (foodSource: IFoodSource) => (next: INext<IFood | null>): ICommandStep => {
  let timer = 0;

  return function step(dt: number) {
    timer += dt;
    if(timer >= 1) {
      const food = foodSource.takeFood();
      return next(food);

    } else {
      return step;
    }
  }
}

export const eatFood = (human: Human, food: IFood) => (next: INext): ICommandStep => {
  human.hunger += food.fillHunger;
  return next(null);
};  