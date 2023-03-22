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

function* floodFind<T>(key: T, n: (key: T) => T[], t: (key: T) => boolean): Generator<T> {
  const open = new Set<T>([key]);
  const closed = new Set<T>([key]);
  while(open.size > 0) {
    const next = [...open][0];
    open.delete(next);
    const neighbours = n(next);
    for(const nkey of neighbours) {
      if(!closed.has(nkey) && t(nkey)) {
        open.add(nkey);
        closed.add(nkey);
        yield nkey;
      }
    }
  }
}

export class RainfallSimulator {
  constructor(private size: number) {}

  simulate(heightmap: number[]) {
    const watermap: Watermap = {};
    for(let cycles = 0; cycles < 2; cycles++) {
      this.rain(heightmap, watermap);
      this.evaporate(watermap, 1.25);
    }
    const features: WaterFeature[] = [];
    const keys = new Set(Object.keys(watermap).map(n => parseInt(n, 10)));
    while(keys.size > 0) {
      const key = [...keys][0];
      keys.delete(key);
      const water = watermap[key];

      // lake
      if(water.depth) {
        const cells = Array.from(floodFind<number>(key, this.keyNeighbours, n => watermap[n] && watermap[n].depth > 0));
        for(const found of cells) {
          keys.delete(found);
        }

        const avgHeight = cells.reduce((total, key) => total + heightmap[key] + watermap[key].depth, 0) / cells.length;
        const expandedArea = Array.from(floodFind<number>(key, this.keyNeighbours, n => heightmap[n] + (key in watermap ? watermap[key].depth : 0) <= avgHeight));
        const newAvgHeight = expandedArea.reduce((total, key) => total + heightmap[key] +(key in watermap ? watermap[key].depth : 0), 0) / expandedArea.length;
        
        features.push(new Lake(newAvgHeight, expandedArea.map(this.key2coord)));

      } else if(water.flow > 1) {
        
      }
    }
    if(features.length > 0) console.log('FEATURES: ', features.length, features.map(f => f.cells.length))
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
        const heightAt = (key: number) => heightmap[key] + waterAt(key).depth;
        const path = [];
        while (1) {
          const key = this.coord2key(coord);
          const water = waterAt(key);
          const height = heightAt(key);
          const ncoords = this.neighbours(coord).map<HCoord>(ncoord => {
            const nkey = this.coord2key(ncoord);
            const height = heightAt(nkey);
            return { ...ncoord, height };
          });
          const heights = ncoords.sort((a, b) => a.height - b.height);
          let fallest = heights[0];
          
          // we hit a plateau - try to tiebreak by flood finding a downhill
          if(fallest.height === height) {
            const iterator = floodFind<number>(this.coord2key(fallest), this.keyNeighbours, n => {
              const height = heightAt(n);
              return height <= fallest.height;
            });

            for(const key of iterator) {
              const height = heightAt(key);
              if(height < fallest.height) {
                fallest = { height, ...this.key2coord(key) };
                break;
              }
            }
          }

          if(fallest.x === 0 || fallest.y === 0 || fallest.x === this.size - 1 || fallest.y === this.size - 1) {
            path.push(this.coord2key(fallest));
            break;
          }

          // no downhill falls available
          if (fallest.height > height) {
            water.depth += 1;
            watermap[key] = water;
            heightmap[key] += path.length * 0.05;
            break;

          } else {
            water.flow += 1;
            water.flowDir[0] += fallest.x - coord.x;
            water.flowDir[1] += fallest.y - coord.y;
            path.push(key);
            watermap[key] = water;
            // heightmap[key] -= 0.1; // erosion
            coord = fallest;
          }
        }

        for(const key of path) {
          heightmap[key] -= 0.05;
        }

        for(const key of path) {
          const h = heightmap[key];
          for(const n of this.keyNeighbours(key)) {
            const nh = heightmap[n];
            heightmap[n] -= (nh - h) * 0.1;
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

