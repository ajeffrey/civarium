import Heightmap from "src/terrain/Heightmap";

const testSize = 32;
const scaled = testSize * 16;
const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
const heightmap = new Heightmap({ algorithm: 'fast-simplex', octaves: 4, lacunarity: 2, persistence: 0.5, seed });
const heights = [];
let min = 0;
let max = 0;
for(let y = 0; y < testSize; y++) {
  for(let x = 0; x < testSize; x++) {
    const height = heightmap.getIntHeight(x, y);
    heights.push(height);
    min = Math.min(height, min);
    max = Math.max(height, max);
  }
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const dpr = window.devicePixelRatio || 1;
const bsr = (ctx as any).webkitBackingStorePixelRatio || (ctx as any).backingStorePixelRatio || 1;

canvas.width = testSize * dpr / bsr;
canvas.height = testSize * dpr / bsr;

ctx.translate(0.5, 0.5);
const image = ctx.createImageData(testSize, testSize);
console.log((heightmap as any).options.algorithm, min, max);

const scaledHeights = []; 
for(let i = 0; i < testSize * testSize; i++) {
  const height = Math.round((heights[i] - min) / (max - min) * 255);
  scaledHeights.push(height);
  image.data[i * 4] = height;
  image.data[1 + i * 4] = height;
  image.data[2 + i * 4] = height;
  image.data[3 + i * 4] = 255;
}

// console.log(Math.min(...scaledHeights), Math.max(...scaledHeights));

ctx.putImageData(image, 0, 0);

canvas.style.width = scaled + 'px';
canvas.style.height = scaled + 'px';


document.body.appendChild(canvas);
