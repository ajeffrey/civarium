export interface Cell {
  height: number;
  river?: {
    direction: [number, number];
    flow: number;
    id: number;
  }
  lake?: {
    depth: number;
    id: number;
  }
}

export interface Props {
  size: number;
  minFlow: number;
  erosion: number;
  iterations: number;
  getHeight(x: number, y: number): number;
  probablisticFlow: boolean;
}

interface LocalCell extends Cell {
  x: number;
  y: number;
  id: number;
  water: number;
  h: number; //effective height including water depth
}

export function simulateRain({
  size,
  minFlow,
  erosion,
  iterations,
  getHeight,
  probablisticFlow
}: Props) {
  const cells: {[key:string]: LocalCell} = {};
  let min = 0;
  let max = 0;
  for(let y = 0; y < size; y++) {
    for(let x = 0; x < size; x++) {
      const height = getHeight(x, y);
      cells[x + ':' + y] = { x, y, height, id: Math.floor(Math.random() * 255), h: height, water: 1 };
      min = Math.min(height, min);
      max = Math.max(height, max);
    }
  }

  /*
   * algorithm:
   * for each cell:
   *   add 1 to cell's flow
   *   find neighbour with steepest drop
   *   if no drops found: add 1 to water height of cell
   *   if drop found: add 1 to river flow of cell, repeat for neighbour
   */
  function rain() {
    let iters = 0;
    const sorted = Object.values(cells).sort((a, b) => b.h - a.h);
    for(const cell of sorted) {
      console.log(`start at ${cell.x},${cell.y}`);
      iters += 1;
      // get all in-bound neighbours
      const ncoords = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ].map(([x, y]) => ({ x: cell.x + x, y: cell.y + y })).filter(({ x, y }) => x >= 0 && y >= 0 && x < size && y < size);
      const neighbours = ncoords.map(({ x, y }) => cells[x + ':' + y]);
      const heights = neighbours.sort((a, b) => a.h - b.h);
      let water = cell.water;
      while(water > 0) {
        const fallest = heights.shift();
        if(!fallest || fallest.h >= cell.h) {
          cell.lake = { depth: water, id: cell.id };
          break;

        } else {
          const transfer = Math.min((cell.h - fallest.h) * 10, water);
          water -= transfer;
          cell.river = { id: cell.id, direction: [fallest.x - cell.x, fallest.y - cell.y], flow: 0 }
          cell.river.flow += cell.water;
          cell.h -= erosion;
          cell.height -= erosion;
          fallest.water += transfer;
          fallest.id = cell.id;
        }
      }
    }

    console.log(`iters: ${iters}, size: ${size * size}, iters per cell: ${iters / (size * size)}`);
  }

  function dry(amt: number) {
    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const cell = cells[x + ':' + y];
        if(cell.lake) {
          if(cell.lake.depth <= amt) {
            delete cell.lake;
          } else {
            cell.lake.depth -= amt;
          }
        }
      }
    }
  }

  function minRivers(amt: number) {
    const list: LocalCell[] = [];
    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const cell = cells[x + ':' + y];
        if(cell && cell.river && cell.water < amt) {
          delete cell.river;
        }
        list.push(cell);
      }
    }

    return list;
  }

  for(let i = 0; i < iterations; i++) {
    rain();
    dry(1);
  }
  return minRivers(minFlow);
}
