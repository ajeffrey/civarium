import Heightmap from "src/terrain/Heightmap";

export function basinRain() {
interface Cell {
  height: number;
  sources: string[];
  sink: string | null;
}

const adjacencies: [number, number][] = [];

for(let nx = -1; nx <= 1; nx++) {
  for(let ny = -1; ny <= 1; ny++) {
    if(nx == 0 && ny == 0) {
      continue;
    }

    adjacencies.push([nx, ny]);
  }
}

const cells: {[key:string]: Cell} = {}
const sourcemap: {[key:string]: string[]} = {};

function mapCell(x: number, y: number) {
  const key = `${x}:${y}`;
  if(key in cells) return;
  const height = heightmap.getIntHeight(x, y);
  const neighbours: [number, number][] = adjacencies.map(([nx, ny]) => ([x + nx, y + ny]));
  const obj = { height, sink: null, sources: [] };
  let lowest = null;
  let lowestHeight = height;
  for(const n of neighbours) {
    const nHeight = heightmap.getIntHeight(...n);
    if(nHeight < lowestHeight) {
      lowestHeight = nHeight;
      lowest = n;
    }
  }
  if(lowest && (height - lowestHeight > 0.025)) {
    const lkey = lowest.join(':');
    obj.sink = lkey;
    sourcemap[lkey] = sourcemap[lkey] || [];
    sourcemap[lkey].push(key);
  }

  cells[key] = obj;
}

for(let y = 0; y < testSize; y++) {
  for(let x = 0; x < testSize; x++) {
    mapCell(x, y);
  }
}


let sizes = {};
for(const key in sourcemap) {
  const idx = sourcemap[key].length;
  sizes[idx] = sizes[idx] || 0;
  sizes[idx] += 1;
}

console.log('source counts:', sizes);
const maxSize = Math.max(...Object.keys(sizes).map(s => parseInt(s, 10)));

const flowmap: {[key:string]: number} = {};
function getFlow(x: number, y: number) {
  const key = x + ':' + y;
  if(!(key in flowmap)) {
    const sources = (sourcemap[key] || []);
    const flow = sources.reduce((acc, s) => acc + 1 + getFlow(...(s.split(':').map(n => parseInt(n))) as [number, number]), 0);
    flowmap[key] = flow;
  }
  return flowmap[key];
}

for(let y = 0; y < testSize; y++) {
  for(let x = 0; x < testSize; x++) {
    getFlow(x, y);
  }
}

const maxFlow = Math.max(...Object.values(flowmap));
console.log('max flow:', maxFlow, flowmap);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const dpr = window.devicePixelRatio || 1;
const bsr = (ctx as any).webkitBackingStorePixelRatio || (ctx as any).backingStorePixelRatio || 1;

canvas.width = testSize * dpr / bsr;
canvas.height = testSize * dpr / bsr;

ctx.translate(0.5, 0.5);
const image = ctx.createImageData(testSize, testSize);

function setPx(img, idx, r, g = r, b = g, a = 255) {
  img.data[idx * 4] = r;
  img.data[idx * 4 + 1] = g;
  img.data[idx * 4 + 2] = b;
  img.data[idx * 4 + 3] = a;
}

let min = 0, max = 0, printed = 0
for(let y = 0; y < testSize; y++) {
  for(let x = 0; x < testSize; x++) {
    const idx = x + y * testSize;
    const h = heightmap.getIntHeight(x, y);
    const flow = (flowmap[x + ':' + y] || 0);
    if(h < min) min = h;
    if(h > max) max = h;
    const b = (flow + 1) / (maxFlow + 1);
    const col = Math.floor(h * 128) + 127;
    const col2 = Math.floor(col / (flow + 1));
    if(flow == 0 && !printed) {
      console.log(b, flow, maxFlow, col2, col2, col);
      printed = 1
    }
    setPx(image, idx, col2, col2, col);
  }
}

console.log(min, max)
/*
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
*/
ctx.putImageData(image, 0, 0);

canvas.style.width = scaled + 'px';
canvas.style.height = scaled + 'px';

document.body.appendChild(canvas);

console.log('ready');
