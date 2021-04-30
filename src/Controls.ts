import * as THREE from 'three';
import Camera from "./entities/Camera";
import { Entity } from './Entity';
import EntityManager from './EntityManager';
import Time from './Time';

const ARROW_LEFT = 'ArrowLeft';
const ARROW_UP = 'ArrowUp';
const ARROW_RIGHT = 'ArrowRight';
const ARROW_DOWN = 'ArrowDown';

export default class Controls {
  public speed = 10;
  public keys: {[key: string]: boolean};
  private isDragging: boolean;
  private dragPos: THREE.Vector2;
  private camera: Camera;

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

    window.addEventListener('mousewheel', (e: WheelEvent) => {
      this.camera.zoomBy(-e.deltaY / 50);
    }, { passive: true });

    window.addEventListener('click', (e: MouseEvent) => {
      const mouse = new THREE.Vector3();
      mouse.setX(2 * (e.clientX / window.innerWidth) - 1);
      mouse.setY(1 - 2 * (e.clientY / window.innerHeight));

      const caster = new THREE.Raycaster();
      caster.setFromCamera(mouse, this.camera.camera);
      const objects = EntityManager.entities.map(e => e.transform);
      const intersections = caster.intersectObjects(objects, true);
      let following: Entity | null = null;

      for(const intersection of intersections) {
        if(following) break;

        let target = intersection.object;
        while(target) {
          const entity: Entity | undefined = target.userData?.entity;
          if(entity) {
            following = entity;
            break;
            
          } else {
            target = target.parent;
          }
        }
      }

      this.camera.follow(following);
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    })

    window.addEventListener('mousemove', e => {
      if(this.isDragging) {
        const x = e.clientX - this.dragPos.x;
        const y = e.clientY - this.dragPos.y;
        this.camera.rotate(x / 50, y / 50);
        this.dragPos.x = e.clientX;
        this.dragPos.y = e.clientY;
      }
    });

    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
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

  update() {
    const x = this.xAxis();
    const y = this.yAxis();
    if(x || y) {
      this.camera.move(new THREE.Vector3(x * Time.deltaTime * this.speed, 0, y * Time.deltaTime * this.speed));
    }
  }
}