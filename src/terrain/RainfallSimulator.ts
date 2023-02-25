/*
 interface WaterCell {
  flow: number;
  flowDir: [number, number];
  depth: number;
}

function rain(size: number, heightmap: number[]) {
  const wcells: {[key: number]: WaterCell};
  for(let y = 0; y < size; y++) {
    for(let x = 0; x < size; x++) {
      const coord = { x, y };
      let cell = cells[coord.y * size + coord.x];
      console.log(`start at ${x},${y}`);
      while(1) {
        cell.f += 1;
        const ncoords = [
          [-1, -1], [-1, 0], [-1, 1]
          [0, -1], [0, 1], [1, -1]
          [1, 0], [1, 1]
        ].map(([x, y]) => ({
          x: cell.x + x,
          y: cell.y + y
        })).filter(({ x, y }) => x >= 0 && y >= 0 && x < testSize && y < testSize);
        const neighbours = ncoords.map(({ x, y }) => cells[y * testSize + x]);
        const heights = neighbours.sort((a, b) => a.h - b.h);
        const fallest = heights[0];
        if(fallest.h >= cell.h) {
          cell.wh += 1;
          cell.h += 1;
          console.log(' no lower points, break');
          break;
        } else 
          cell.fl += 1;
          console.log(` fall to ${fallest.x},${fallest.y}`)
          cell = fallest
        }
      }
    }
  }
}

*/
