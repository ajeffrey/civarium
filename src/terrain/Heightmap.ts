import { makeNoise2D } from "fast-simplex-noise";
import SimplexNoise = require('simplex-noise');

function lerp(a, b, x) {
  return a + ((b - a) * x);
}

interface IOptions {
  algorithm: 'white' | 'fast-simplex' | 'simplex';
  octaves: number;
  lacunarity: number;
  persistence: number;
}

const ZOOM = 64;
const SCALE = 10;

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
        const noise = new SimplexNoise();
        this.generator = (x: number, y: number) => noise.noise2D(x, y);
        break;
    }
    
    this.heights = [];
    this.options = options;
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
      const noiseValue = this.generator(x * frequency / ZOOM, y * frequency / ZOOM) * SCALE;
      height += noiseValue * amplitude;
      amplitude *= this.options.persistence;
      frequency *= this.options.lacunarity;
    }
     
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