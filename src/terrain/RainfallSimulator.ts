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

type WaterFeature = Lake;

export class RainfallSimulator {
  simulate(size: number, heightmap: number[]) {
    const watermap = this.rain(size, heightmap);
    this.evaporate(watermap, 1);
    const features: WaterFeature[] = [];
    const keys = new Set(Object.keys(watermap).map(n => parseInt(n, 10)));
    while(keys.size > 0) {
      const key = [...keys][0];
      keys.delete(key);
      const water = watermap[key];

      // lake
      if(water.depth) {
        const height = water.depth + heightmap[key];
        const open = new Set<number>([key]);
        const included = new Set<number>();
        while(open.size > 0) {
          const next = [...open][0];
          open.delete(next);
          included.add(next);
          const coord = { x: next % size, y: Math.floor(next / size) };
          const neighbours = this.neighbours(coord, size);
          for(const { x, y } of neighbours) {
            const nkey = y * size + x;
            if(!included.has(nkey) && watermap[nkey] && watermap[nkey].depth) {
              open.add(nkey);
              included.add(nkey);
              keys.delete(nkey);
            }
          }
        }

        features.push(new Lake(height, [...included.values()].map(key => ({ x: key % size, y: Math.floor(key / size) }))))
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

  private rain(size: number, heightmap: number[], watermap: Watermap = {}) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let coord = { x, y };
        const waterAt = ({ x, y }: Coord) => watermap[(y * size) + x] || { flow: 0, depth: 0, flowDir: [0, 0] };
        const heightAt = ({ x, y }: Coord) => heightmap[(y * size) + x];
        while (1) {
          const water = waterAt(coord);
          const height = heightAt(coord) + water.depth;
          const ncoords = this.neighbours(coord, size).map<HCoord>(ncoord => {
            const height = heightAt(ncoord) + waterAt(ncoord).depth;
            return { ...ncoord, height };
          });
          const heights = ncoords.sort((a, b) => a.height - b.height);
          const fallest = heights[0];

          // no downhill falls available
          if (fallest.height >= height) {
            water.depth += 1;
            watermap[coord.y * size + coord.x] = water;
            break;
          } else {
            water.flow += 1;
            watermap[coord.y * size + coord.x] = water;
            // heightmap[coord.y * size + coord.x] -= 0.1; // erosion
            coord = fallest;
          }
        }
      }
    }

    return watermap;
  }

  private neighbours(coord: Coord, size: number): Coord[] {
    return [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1], [1, -1],
      [1, 0], [1, 1]
    ].map(([x, y]) => ({ x: coord.x + x, y: coord.y + y }))
    .filter(({ x, y }) => x >= 0 && y >= 0 && x < size && y < size);
  }
}