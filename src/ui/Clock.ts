export default class Clock {
  private el: HTMLElement;

  constructor(parent: HTMLElement) {
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

  setTime(clockTime: number) {
    this.el.textContent = `Time: ${Math.floor(clockTime / 60)}:${Math.floor(clockTime % 60)}`;
  }
}