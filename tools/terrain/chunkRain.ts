import { Cell } from './types';

interface Props {
  size: number;
  minFlow: number;
  getHeight(x: number, y: number): number;
}

interface LocalCell extends Cell {
  x: number;
  y: number;
  id: number;
  h: number; //effective height including water depth
}

export function chunkRain({ size, minFlow, getHeight }: Props) {
  const cells: LocalCell[] = [];
  let min = 0;
  let max = 0;
  for(let y = 0; y < size; y++) {
    for(let x = 0; x < size; x++) {
      const height = getHeight(x, y);
      cells.push({ x, y, height, id: Math.floor(Math.random() * 255), h: height });
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
    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const coord = { x, y };
        let cell = cells[coord.y * size + coord.x];
        console.log(`start at ${x},${y}`);
        while(1) {
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
          const neighbours = ncoords.map(({ x, y }) => cells[y * size + x]);
          const heights = neighbours.sort((a, b) => a.h - b.h);
          const fallest = heights[0];
          if(fallest.h >= cell.h) {
            cell.lake = cell.lake || { depth: 0, id: cell.id };
            cell.lake.depth += 1;
            cell.h += 1;
            break;
          } else {
            cell.river = cell.river || { id: cell.id, direction: [fallest.x - cell.x, fallest.y - cell.y], flow: 0 }
            cell.river.flow += 1;
            fallest.id = cell.id;
            cell = fallest;
          }
        }
      }
    }

    console.log(`iters: ${iters}, size: ${size * size}, iters per cell: ${iters / (size * size)}`);
  }

  function dry(amt: number) {
    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const cell = cells[y * size + x];
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
    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const cell = cells[y * size + x];
        if(cell && cell.river && cell.river.flow < amt) {
          delete cell.river;
        }
      }
    }
  }

  rain();
  dry(1);
  minRivers(minFlow);
  return cells;
}