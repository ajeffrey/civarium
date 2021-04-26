import Time from "../Time";

function pad(value: any, length: number = 2, character: string = '0') {
  const str = value.toString();
  if(str.length >= length) return str;
  const pad = character.repeat(length - str.length);
  return pad + str;
}

export default class Clock {
  private static el: HTMLElement;

  static attach(parent: HTMLElement) {
    const label = this.el = document.createElement('span');
    label.style.position = 'absolute';
    label.style.background = 'red';
    label.style.color = 'white';
    label.style.left = '0';
    label.style.top = '0';
    label.style.fontFamily = 'Arial';
    label.style.padding = '2px 4px';
    parent.appendChild(label);
  }

  static update() {
    const time = Time.wallTime;
    const hours = Math.floor(time / 60);
    const minutes = Math.floor(time % 60)
    this.el.textContent = `Time: ${pad(hours)}:${pad(minutes)}`;
  }
}