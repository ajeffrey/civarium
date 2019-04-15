const DAY_LENGTH = 24 * 60;
const MINUTES_PER_SECOND = 15;

const time = (time: string) => {
  const [hours, minutes] = time.split(':');
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
};

export default class Clock {
  public time: number;

  constructor() {
    this.time = time('12:00');
  }

  step(dt: number) {
    this.time = (this.time + (dt * MINUTES_PER_SECOND)) % DAY_LENGTH;
  }
}