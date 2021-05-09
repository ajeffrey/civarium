import FastSimplexNoise from "fast-simplex-noise";

function lerp(a, b, x) {
  return a + ((b - a) * x);
}

export default class Heightmap {
  private generator: FastSimplexNoise;
  private heights: number[][];

  constructor() {
    this.generator = new FastSimplexNoise({ frequency: 0.05, min: 0, max: 5, octaves: 2 });
    this.heights = [];
  }

  getIntHeight(x: number, y: number) {
    const height = this.heights[x] && this.heights[x][y];
    if(height !== undefined) {
      return height;
    }

    const h = this.generator.scaled2D(x, y);
    this.heights[x] = this.heights[x] || [];
    this.heights[x][y] = h;
    return h;
  }

  getLerpHeight(x: number, y: number) {
    const x1 = Math.floor(x);
    const x2 = Math.ceil(x);
    const y1 = Math.floor(y);
    const y2 = Math.ceil(y);
    const xLerp1 = lerp(this.getIntHeight(x1, y1), this.getIntHeight(x2, y1), x % 1);
    const xLerp2 = lerp(this.getIntHeight(x1, y2), this.getIntHeight(x2, y2), x % 1);
    const yLerp = lerp(xLerp1, xLerp2, y % 1);
    return yLerp;
  }
}