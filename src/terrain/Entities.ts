interface Coord {
  x: number;
  y: number;
}

export class TerrainEntity {
  readonly cells: Coord[];
  constructor(
    cells: Coord[]
  ) {
    this.cells = cells;
  }
}

class River extends TerrainEntity {

}

class Lake extends TerrainEntity {

}
