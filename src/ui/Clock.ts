import Time from "../Time";

function pad(value: any, length: number = 2, character: string = '0') {
  const str = value.toString();
  if(str.length >= length) return str;
  const pad = character.repeat(length - str.length);
  return pad + str;
}

const WIDTH = 102;
const HEIGHT = 20;
export default class Clock {
  private static el: HTMLCanvasElement;
  private static context: CanvasRenderingContext2D;

  static attach(parent: HTMLElement) {
    const canvas = this.el = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    Object.assign(canvas.style, {
      position: 'absolute',
      right: '0',
      top: '0',
      width: `${WIDTH}px`,
      height: `${HEIGHT}px`,
    });

    parent.appendChild(canvas);
    this.context = canvas.getContext('2d');
    this.context.font = 'Arial, sans-serif';
  }

  static update() {
    const time = Time.wallTime;
    const hours = Math.floor(time / 60);
    const minutes = Math.floor(time % 60)
    const text = `Time: ${pad(hours)}:${pad(minutes)}`;
    this.context.fillStyle = 'red';
    this.context.fillRect(0, 0, WIDTH, HEIGHT);

    this.context.fillStyle = 'white';
    this.context.strokeStyle = 'white';
    this.context.font = ' 14px monospace';
    this.context.fillText(text, 6, HEIGHT - 6);
  }
}