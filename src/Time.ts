const MINUTES_PER_SECOND = 100;

export default class Time {
  static readonly DAY_LENGTH = 24 * 60;
  public static wallTime: number;
  public static deltaTime: number;

  static set(wallTime: number) {
    this.wallTime = wallTime;
  }

  static update(dt: number) {
    this.deltaTime = dt;
    this.wallTime += dt * MINUTES_PER_SECOND;
    this.wallTime = this.wallTime % this.DAY_LENGTH;
  }
}
