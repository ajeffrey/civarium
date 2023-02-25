const VISIBLE_CLASS = 'terminal--visible';

export class Terminal {
  private isOpen: boolean;

  constructor() {
    this.isOpen = false;
    this.pane = documebt.createElement('dic')
  }

  toggle() {
    if(this.isOpen) {
      this.pane.classList.remove(VISIBLE_CLASS);
    } else {
      this.pane.classList.add(VISIBLE_CLASS);
    }
  }
}
