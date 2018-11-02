import * as THREE from 'three';
import { Camera } from "../entities";
import { Renderer } from '../systems';

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

export class Controls {
  private camera: Camera;
  private keys: {};
  private isDragging: boolean;
  private dragPos: THREE.Vector2;

  constructor(camera: Camera) {
    this.camera = camera;
    this.keys = {};
    this.dragPos = new THREE.Vector2(0, 0);
    this.isDragging = false;

    window.addEventListener('mousedown', e => {
      this.isDragging = true;
      this.dragPos.x = e.clientX;
      this.dragPos.y = e.clientY;
    });

    window.addEventListener('mousewheel', (e: MouseWheelEvent) => {
      this.camera.zoomBy(e.wheelDelta / 500);
      console.log(e.wheelDelta);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    })

    window.addEventListener('mousemove', e => {
      if(this.isDragging) {
        const x = e.clientX - this.dragPos.x;
        const y = e.clientY - this.dragPos.y;
        this.camera.rotate(-x / 10, -y / 10);
        this.dragPos.x = e.clientX;
        this.dragPos.y = e.clientY;
      }
    });

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