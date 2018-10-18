import * as THREE from 'three';
import { scan } from 'rxjs/operators';
import * as Rx from 'rxjs';

interface ICameraViewport {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
const CAMERA_POSITION = new THREE.Vector3(15, 15, -15);
const MIN_ZOOM = -5;
const MAX_ZOOM = 5;
const DEFAULT_ZOOM = 0;

const clamp = (min: number, max: number, num: number) => {
  return Math.min(max, Math.max(min, num));
}

const calculateViewport = (zoom: number): ICameraViewport => {
  const aspect = window.innerWidth / window.innerHeight;
  return {
    top: zoom,
    bottom: -zoom,
    left: -zoom * aspect,
    right: zoom * aspect,
  };
};

export default () => {
  const { left, right, top, bottom } = calculateViewport(20);
  const camera = new THREE.OrthographicCamera(left, right, top, bottom, 0, 2000);
  camera.position.set(30, 30, 30);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  return camera;

  // const mouseWheel$ = new Rx.Observable<number>(observer => {
  //   window.addEventListener('mousewheel', (evt) => {
  //     observer.next(evt.wheelDelta > 0 ? 1 : -1);
  //   });
  // });
  
  // const zoom$ = mouseWheel$.pipe(scan((acc, wheel) => clamp(MIN_ZOOM, MAX_ZOOM, acc + wheel), DEFAULT_ZOOM));

  // zoom$.subscribe(zoom => {
  //   camera.zoom = 1 + (zoom / 10);
  // });
};