import Entity from "./Entity";

export interface IFood {
  fillHunger: number;
}

export interface IFoodSource extends Entity {
  takeFood(): IFood | null;
}
