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