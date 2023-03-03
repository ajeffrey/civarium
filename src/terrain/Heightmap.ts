import { makeNoise2D } from "fast-simplex-noise";
import SimplexNoise from 'simplex-noise';
import seedrandom from 'seedrandom';

function lerp(a, b, x) {
  return a + ((b - a) * x);
}

interface IOptions {
  algorithm: 'white' | 'fast-simplex' | 'simplex';
  octaves: number;
  lacunarity: number;
  persistence: number;
  seed: string;
}

const ZOOM = 1;
const SCALE = 1;

const SMOOTHNESS = 3;
const HEIGHT_FACTOR = 3;

export default class Heightmap {
  private generator: (x: number, y: number) => number;
  private heights: number[][];
  private options: IOptions;

  constructor(options: IOptions) {
    switch(options.algorithm) {
      case 'white': 
        this.generator = () => Math.random() * 2 - 1;
        break;
      case 'fast-simplex':
        this.generator = makeNoise2D();
        break;
      case 'simplex':
        const noise = new SimplexNoise(options.seed);
        this.generator = (x: number, y: number) => noise.noise2D(x, y);
        break;
    }
    
    this.heights = [];
    this.options = options;
  }

  getArea(x: number, y: number, size: number) {
    const heights: number[] = [];
    for(let hy = y; hy < (y + size); hy++) {
      for(let hx = x; hx < (x + size); hx++) {
        heights.push(this.getIntHeight(hx, hy));
      }
    }

    return heights;
  }

  getIntHeight(x: number, y: number) {
    const cachedHeight = this.heights[x] && this.heights[x][y];
    if(typeof cachedHeight === 'number') {
      return cachedHeight;
    }

    let height = 0;
    let amplitude = 1;
    let frequency = 1;
    
    for(let i = 0; i < this.options.octaves; i++) {
      const noiseValue = this.generator(x / frequency / ZOOM, y / frequency / ZOOM) * SCALE;
      height += noiseValue * amplitude;
      amplitude *= this.options.persistence;
      frequency *= this.options.lacunarity;
    }

    // round to SMOOTHNESS (e.g. nearest 1/4)
    //5.55 => 22.2 => 22 => 5.5
    //height = (Math.round(height * SMOOTHNESS) / SMOOTHNESS) * HEIGHT_FACTOR;
    height = height * HEIGHT_FACTOR;
     
    this.heights[x] = this.heights[x] || [];
    this.heights[x][y] = height;
    return height;
  }

  getLerpHeight(x: number, y: number) {
    const x1 = Math.floor(x);
    const x2 = Math.ceil(x);
    const y1 = Math.floor(y);
    const y2 = Math.ceil(y);
    const xlr = x >= 0 ? x % 1 : 1 + (x % 1);
    const ylr = y >= 0 ? y % 1 : 1 + (y % 1);
    const xLerp1 = lerp(this.getIntHeight(x1, y1), this.getIntHeight(x2, y1), xlr);
    const xLerp2 = lerp(this.getIntHeight(x1, y2), this.getIntHeight(x2, y2), xlr);
    const yLerp = lerp(xLerp1, xLerp2, ylr);
    return yLerp;
  }
}
