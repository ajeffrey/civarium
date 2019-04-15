import { System, IEntity } from "../framework";

const DAY_LENGTH = 24 * 60; // in minutes
const MINUTES_PER_SECOND = 15;

const time = (hours: number, minutes: number) => {
  return hours * 60 + minutes;
};

export class DayCycle extends System {
  private clockTime: number;

  constructor() {
    super();
    this.clockTime = time(12, 0);
  }

  add(entity: IEntity) {
    if(entity.setTime) {
      super.add(entity);
    }
  }

  step(dt: number) {
    this.clockTime = (this.clockTime + (dt * MINUTES_PER_SECOND)) % DAY_LENGTH;
    for(const entity of this.entities) {
      entity.setTime(this.clockTime, DAY_LENGTH);
    }
  }
};