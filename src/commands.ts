import Human from './entities/Human';
import { FoodSource, Food } from './components/FoodSource';
import Location from './components/Location';
import EntityManager from './EntityManager';
import nearestLocation from './queries/nearestLocation';
import Time from './Time';
import Terrain from './Terrain';

export interface ICommand {
  name: string;
  step(): ICommand;
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

export const idle = (human: Human): ICommand => {
  human.state.setState('idle');
  return {
    name: 'idling',
    step() {
      if(human.hunger <= 50) {
        return findFood(human)(() => this);

      } else {
        return this;
      }
    }
  };
};

export const findFood = (human: Human) => (next: INext): ICommand => {
  const viableFoodSources = EntityManager.entities.filter(e => e.hasComponent(FoodSource) && e.getComponent(FoodSource).hasFood());
  const nearestFood = nearestLocation(human.location.coords, viableFoodSources.map(e => e.getComponent(Location)));

  if(nearestFood) {
    const s = seq(
      () => moveToCoords(human, nearestFood.coords, 2),
      () => harvestFood(human, nearestFood.entity.getComponent(FoodSource)),
      food => food ? eatFood(human, food)(next) : next(null)
    );

    return s(null);

  } else {
    return next(null);
  }
}

export const moveToCoords = (human: Human, destination: THREE.Vector2, within = 0.1) => (next: INext): ICommand => {
  const unit = destination.clone().sub(human.location.coords).normalize();
  const xDiff = destination.x - human.location.coords.x;
  const yDiff = destination.y - human.location.coords.y;
  const angle = Math.atan2(yDiff, xDiff);
  human.entity.transform.rotation.y = Math.PI / 2 + Math.atan2(yDiff, xDiff);

  return {
    name: 'moving',
    step() {
      if(human.location.coords.distanceTo(destination) > within) {
        const position = human.location.coords.clone().add(unit.clone().multiplyScalar(Time.deltaTime * human.speed));
        human.location.moveTo(position);
        return this;

      } else {
        return next(null);
      }
    }
  };
}

export const harvestFood = (human: Human, foodSource: FoodSource) => (next: INext<Food | null>): ICommand => {
  let timer = 0;
  human.state.setState('picking fruit');

  return {
    name: 'harvestingFood',
    step() {
      timer += Time.deltaTime;
      if(timer >= 3) {
        const food = foodSource.takeFood();
        return next(food);

      } else {
        return this;
      }
    }
  };
}

export const eatFood = (human: Human, food: Food) => (next: INext): ICommand => {
  human.hunger += food.fillHunger;
  return next(null);
};  

