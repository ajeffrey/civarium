import * as THREE from 'three';
import Camera from "src/entities/Camera";
import { World, Entity } from 'src/ecs';
import { Followable } from 'src/components/Followable';
import Time from 'src/Time';

const ARROW_LEFT = 'ArrowLeft';
const ARROW_UP = 'ArrowUp';
const ARROW_RIGHT = 'ArrowRight';
const ARROW_DOWN = 'ArrowDown';

interface Pointer {
  id: number;
  x: number;
  y: number;
}

function distance(a: Pointer, b: Pointer) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export default class Controls {
  public speed = 10;
  public keys: {[key: string]: boolean};
  private camera: Camera;
  private pointers: Pointer[];

  constructor(camera: Camera) {
    this.camera = camera;
    this.keys = {};
    this.pointers = [];


    window.addEventListener('mousewheel', (e: WheelEvent) => {
      this.camera.zoomBy(-e.deltaY / 50);
    }, { passive: true });

    window.addEventListener('click', this.selectEntity)

    window.addEventListener('pointerdown', this.pointerDown);

    window.addEventListener('pointerup', this.pointerUp);
    window.addEventListener('pointercancel', this.pointerUp);

    window.addEventListener('pointermove', this.pointerMove, { passive: true });

    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });
  }

  pointerDown = (e: PointerEvent) => {
    this.pointers.push({
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
    });
  }

  pointerUp = (e: PointerEvent) => {
    this.pointers = this.pointers.filter(p => p.id !== e.pointerId);
  }

  pointerMove = (e: PointerEvent) => {
    switch(this.pointers.length) {
      case 1: {
        const x = e.clientX - this.pointers[0].x;
        const y = e.clientY - this.pointers[0].y;
        this.camera.rotate(x / 50, y / 50);
        this.pointers[0].x = e.clientX;
        this.pointers[0].y = e.clientY;
        break;
      };
      case 2: {
        let [moved, stationary] = this.pointers;
        if(stationary.id === e.pointerId) {
          [moved, stationary] = [stationary, moved];
        }

        const oldDistance = distance(moved, stationary);
        moved.x = e.clientX;
        moved.y = e.clientY;
        const newDistance = distance(moved, stationary);
        const diff = newDistance - oldDistance;
        this.camera.zoomBy(diff / 50);
        break;
      }
    }
  }

  selectEntity = (e: MouseEvent) => {
    const mouse = new THREE.Vector3();
    mouse.setX(2 * (e.clientX / window.innerWidth) - 1);
    mouse.setY(1 - 2 * (e.clientY / window.innerHeight));

    const caster = new THREE.Raycaster();
    caster.setFromCamera(mouse, this.camera.camera);
    const objects = World.entities.find([]).map(e => e.transform);
    const intersections = caster.intersectObjects(objects, true);

    let point: THREE.Vector3 | null = null;
    for(const intersection of intersections) {
      let target = intersection.object;
      while(target) {
        const entity: Entity | undefined = target.userData?.entity;
        if(entity && entity.hasComponent(Followable)) {
          this.camera.follow(entity);
          return;
          
        } else {
          if(!point && intersection.point) point = intersection.point;
          target = target.parent;
        }
      }
    }

    if(point) {
      this.camera.moveTo(point);
    }
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
