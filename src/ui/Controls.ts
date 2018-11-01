const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

export class Controls {
  private keys: {};

  constructor() {
    this.keys = {};
    window.addEventListener('keydown', e => {
      this.keys[e.keyCode] = true;
    });

    window.addEventListener('keyup', e => {
      this.keys[e.keyCode] = false;
    });
  }

  xAxis() {
    const isLeft = this.keys[ARROW_LEFT];
    const isRight = this.keys[ARROW_RIGHT];
    if(isLeft && !isRight) {
      return -1;
    } else if(isRight && !isLeft) {
      return 1;
    } else {
      return 0;
    }
  }

  yAxis() {
    const isUp = this.keys[ARROW_UP];
    const isDown = this.keys[ARROW_DOWN];
    if(isDown && !isUp) {
      return -1;
    } else if(isUp && !isDown) {
      return 1;
    } else {
      return 0;
    }
  }
}