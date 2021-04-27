import Human from './entities/Civ';
import { FoodSource, Food } from './components/FoodSource';
import Location from './components/Location';
import EntityManager from './EntityManager';
import nearestLocation from './queries/nearestLocation';
import Time from './Time';

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

export const die = (human: Human) => (next: INext): ICommand => {
  let timer = 0;
  human.state.setState('dying');

  return {
    name: 'dying',
    step() {
      timer += Time.deltaTime;
      human.entity.transform.rotateX(Time.deltaTime * Math.PI / 2);
      if(timer >= 1) {
        return next(null);

      } else {
        return this;
      }
    }
  };
};

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

export const interrupt = (human: Human, command: ICommand) => (next: INext): ICommand => {
  if(command.name == 'dying') {
    return next(null);
  }

  if(human.hunger <= 0) {
    return die(human)(next);
  }

  return next(null);
};

export const findFood = (human: Human) => (next: INext): ICommand => {
  const viableFoodSources = EntityManager.entities.filter(e => e.hasComponent(FoodSource) && e.getComponent(FoodSource).hasFood());
  const nearestFood = nearestLocation(human.location.coords, viableFoodSources.map(e => e.getComponent(Location)));

  if(nearestFood) {
    const s = seq(
      () => moveToCoords(human, nearestFood.coords, 2),
      () => harvestFood(nearestFood.entity.getComponent(FoodSource)),
      food => food ? eatFood(human, food)(next) : next(null)
    );

    return s(null);

  } else {
    return next(null);
  }
}

export const moveToCoords = (human: Human, destination: THREE.Vector2, within = 0.1) => (next: INext): ICommand => {
  const unit = destination.clone().sub(human.location.coords).normalize();
  human.state.setState('moving');

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

export const harvestFood = (foodSource: FoodSource) => (next: INext<Food | null>): ICommand => {
  let timer = 0;

  return {
    name: 'harvestingFood',
    step() {
      timer += Time.deltaTime;
      if(timer >= 1) {
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

