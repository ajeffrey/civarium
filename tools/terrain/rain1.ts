import Heightmap from "src/terrain/Heightmap";

const testSize = 256;
const scaled = testSize * 2;
const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
const heightmap = new Heightmap({ algorithm: 'fast-s    implex', octaves: 8, lacunarity: 3, persistence: 2, seed });
const cells: Array<{ x: number, y: number, h: number, wh: number, f: number, fl: number }> = [];
let min = 0;
let max = 0;
for(let y = 0; y < testSize; y++) {
  for(let x = 0; x < testSize; x++) {
    const height = heightmap.getIntHeight(x, y);
    cells.push({ x, y, h: height, wh: 0, f: 0, fl: 0 });
    min = Math.min(height, min);
    max = Math.max(height, max);
  }
}

function rain() {
  for(let y = 0; y < testSize; y++) {
    for(let x = 0; x < testSize; x++) {
      const coord = { x, y };
      let cell = cells[coord.y * testSize + coord.x];
      console.log(`start at ${x},${y}`);
      while(1) {
        cell.f += 1;
        const ncoords = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ].map(([x, y]) => ({ x: cell.x + x, y: cell.y + y })).filter(({ x, y }) => x >= 0 && y >= 0 && x < testSize && y < testSize);
        const neighbours = ncoords.map(({ x, y }) => cells[y * testSize + x]);
        const heights = neighbours.sort((a, b) => a.h - b.h);
        const fallest = heights[0];
        if(fallest.h >= cell.h) {
          cell.wh += 1;
          cell.h += 1;
          console.log('  no lower points, break');
          break;
        } else {
          cell.fl += 1;
          console.log(`  fall to ${fallest.x},${fallest.y}`);
          cell = fallest;
        }
      }
    }
  }
}

function dry(amt: number) {
  for(let y = 0; y < testSize; y++) {
    for(let x = 0; x < testSize; x++) {
      const cell = cells[y * testSize + x];
      if(cell.wh > 0) {
        const remove = Math.min(cell.wh, amt);
        cell.wh -= remove;
        cell.h -= remove;
      }
    }
  }
}

// rain();
// dry(1);

// rain();
// dry(1);

// rain();
// dry(1);

const maxFlow = Math.max(1, cells.slice().sort((a, b) => b.fl - a.fl)[0].fl);
const maxWaterHeight = Math.max(1, cells.slice().sort((a, b) => b.wh - a.wh)[0].wh);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const dpr = window.devicePixelRatio || 1;
const bsr = (ctx as any).webkitBackingStorePixelRatio || (ctx as any).backingStorePixelRatio || 1;

canvas.width = testSize * dpr / bsr;
canvas.height = testSize * dpr / bsr;

ctx.translate(0.5, 0.5);
const image = ctx.createImageData(testSize, testSize);

const scaledHeights = []; 
for(let i = 0; i < testSize * testSize; i++) {
  const height = Math.round((cells[i].h - cells[i].wh - min) / (max - min) * 255);
  const flow = cells[i].fl / maxFlow;
  const pool = cells[i].wh / maxWaterHeight;
  const depth = Math.max(flow, pool);
  scaledHeights.push(height);
  image.data[i * 4] = height * (1 - depth);
  image.data[1 + i * 4] = height * (1 - depth);
  image.data[2 + i * 4] = Math.floor(255 * depth);
  image.data[3 + i * 4] = 255;
}

ctx.putImageData(image, 0, 0);

canvas.style.width = scaled + 'px';
canvas.style.height = scaled + 'px';


document.body.appendChild(canvas);
