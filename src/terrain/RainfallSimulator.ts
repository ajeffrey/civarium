interface Coord {
  x: number;
  y: number;
}

interface HCoord extends Coord {
  height: number;
}

interface WaterCell {
  flow: number;
  flowDir: [number, number];
  depth: number;
}

interface Watermap {
  [key: number]: WaterCell;
}

class Lake {
  constructor(public height: number, public cells: Coord[]) {}
}

class River {
  constructor(public cells: WaterCell[]) {}
}

type WaterFeature = Lake;

function floodFind<T>(key: T, n: (key: T) => T[], t: (key: T) => boolean): T[] {
  const open = new Set<T>([key]);
  const included = new Set<T>([key]);
  while(open.size > 0) {
    const next = [...open][0];
    open.delete(next);
    const neighbours = n(key);
    for(const nkey of neighbours) {
      if(!included.has(nkey) && t(nkey)) {
        open.add(nkey);
        included.add(nkey);
      }
    }
  }

  return Array.from(included);
}

export class RainfallSimulator {
  constructor(private size: number) {}

  simulate(heightmap: number[]) {
    const watermap = {};
    this.rain(heightmap, watermap);
    this.rain(heightmap, watermap);
    this.evaporate(watermap, 2);
    const features: WaterFeature[] = [];
    const keys = new Set(Object.keys(watermap).map(n => parseInt(n, 10)));
    while(keys.size > 0) {
      const key = [...keys][0];
      keys.delete(key);
      const water = watermap[key];

      // lake
      if(water.depth) {
        const cells = floodFind(key, this.keyNeighbours, n => watermap[n]?.depth);
        for(const found of cells) {
          keys.delete(found);
        }

        const height = cells.reduce((total, key) => total + heightmap[key] + watermap[key].depth, 0) / cells.length;;
        features.push(new Lake(height, cells.map(this.key2coord)));

      } else if(water.flow > 1) {
        
      }
    }

    return features;
  }

  private evaporate(watermap: Watermap, layers: number) {
    for(const key in watermap) {
      const cell = watermap[key];
      if(cell.depth) {
        cell.depth = Math.max(0, cell.depth - layers);
      }
    }
  }

  private rain(heightmap: number[], watermap: Watermap = {}) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let coord = { x, y };
        const waterAt = (key: number) => watermap[key] || { flow: 0, depth: 0, flowDir: [0, 0] };
        const heightAt = (key: number) => heightmap[key];
        while (1) {
          const key = this.coord2key(coord);
          const water = waterAt(key);
          const height = heightAt(key) + water.depth;
          const ncoords = this.neighbours(coord).map<HCoord>(ncoord => {
            const nkey = this.coord2key(ncoord);
            const height = heightAt(nkey) + waterAt(nkey).depth;
            return { ...ncoord, height };
          });
          const heights = ncoords.sort((a, b) => a.height - b.height);
          const fallest = heights[0];

          // no downhill falls available
          if (fallest.height >= height) {
            if(!(fallest.x === 0 || fallest.y === 0 || fallest.x === this.size - 1 || fallest.y === this.size - 1)) {
              water.depth += 1;
              watermap[key] = water;
            }
            break;
          } else {
            water.flow += 1;
            water.flowDir[0] += fallest.x - coord.x;
            water.flowDir[1] += fallest.y - coord.y;
            watermap[key] = water;
            //heightmap[key] -= 0.1; // erosion
            coord = fallest;
          }
        }
      }
    }

    return watermap;
  }

  private keyNeighbours = (key: number): number[] => {
    const neighbours = this.neighbours(this.key2coord(key));
    return neighbours.map(this.coord2key);
  }

  private neighbours = (coord: Coord): Coord[] => {
    return [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1], [1, -1],
      [1, 0], [1, 1]
    ].map(([x, y]) => ({
      x: coord.x + x,
      y: coord.y + y
    })).filter(({ x, y }) =>
      x >= 0 &&
      y >= 0 &&
      x < this.size &&
      y < this.size
    );
  }

  private coord2key = ({ x, y }: Coord) => {
    return y * this.size + x;
  }

  private key2coord = (key: number) => {
    const { size } = this;
    return { x: key % size, y: Math.floor(key / size) };
  }
}

