import Heightmap from "src/terrain/Heightmap";

const testSize = 256;
const scaled = testSize * 4;

let octaves = 7;
let lacunarity = 2.5;
let persistence = 2;
const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

function setOctaves(e) {
  octaves = parseFloat(e.target.value);
  render();
}

function setLacunarity(e) {
  lacunarity = parseFloat(e.target.value);
  render();
}

function setPersistence(e) {
  persistence = parseFloat(e.target.value);
  render();
}

function render() {
  const heightmap = new Heightmap({ algorithm: 'fast-simplex', octaves, lacunarity, persistence, seed });
  const heights = [];
  let min = 0;
  let max = 0;
  for(let y = 0; y < testSize; y++) {
    for(let x = 0; x < testSize; x++) {
      let height = heightmap.getIntHeight(x, y);
      heights.push(height);
      min = Math.min(height, min);
      max = Math.max(height, max);
    }
  }

  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  const dpr = window.devicePixelRatio || 1;
  const bsr = (ctx as any).webkitBackingStorePixelRatio || (ctx as any).backingStorePixelRatio || 1;

  const ratio = dpr / bsr;
  canvas.width = testSize * ratio;
  canvas.height = testSize * ratio;
  ctx.scale(ratio, ratio);

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

  document.getElementById('s').innerHTML = `${min} to ${max}`;
};

(document.getElementById('o') as HTMLInputElement).value = octaves.toString();
(document.getElementById('o') as HTMLInputElement).onchange = setOctaves;
(document.getElementById('l') as HTMLInputElement).value = lacunarity.toString();
(document.getElementById('l') as HTMLInputElement).onchange = setLacunarity;
(document.getElementById('p') as HTMLInputElement).value = persistence.toString();
(document.getElementById('p') as HTMLInputElement).onchange = setPersistence;

render();


