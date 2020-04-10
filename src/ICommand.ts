export interface ICommand {
  isComplete: boolean;
  step(dt: number): void;
}
