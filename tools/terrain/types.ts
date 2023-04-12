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
}

