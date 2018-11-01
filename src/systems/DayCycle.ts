import { Sun } from "../entities";
import { System } from "../ecs";

const DAY_LENGTH = 24 * 60; // in minutes
const MINUTES_PER_SECOND = 30;

const time = (hours: number, minutes: number) => {
  return hours * 60 + minutes;
};

export class DayCycle extends System {
  private clockTime: number;
  private sun: Sun;
  private clock: any;

  constructor(sun: Sun, clock: any) {
    super();
    this.clockTime = time(12, 0);
    this.sun = sun;
    this.clock = clock;
  }

  step(dt: number) {
    this.clockTime = (this.clockTime + (dt * MINUTES_PER_SECOND)) % DAY_LENGTH;
    this.sun.setTime(this.clockTime, DAY_LENGTH);
    this.clock.setTime(this.clockTime);
  }
};