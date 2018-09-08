import * as BABYLON from 'babylonjs';
import './resources/grassTexture';
import KeyMap from './KeyMap';
// import { GrassProceduralTexture } from './resources/grassTexture';

const CAMERA_POSITION = new BABYLON.Vector3(15, 15, -15);
const MIN_ZOOM = 5;
const MAX_ZOOM = 25;
const DEFAULT_ZOOM = 10;
const VOXEL_SIZE = 1.5;
const PLAYER_WIDTH = 0.5;
const PLAYER_HEIGHT = 1.5;
const PLAYER_SPEED = 0.1;

const canvas = document.getElementsByTagName('canvas')[0];
const engine = new BABYLON.Engine(canvas, true);

const drawTile = (x: number, y: number, z: number, scene: BABYLON.Scene) => {
  const tile = BABYLON.MeshBuilder.CreateBox(`tile`, { size: VOXEL_SIZE }, scene);

  tile.enableEdgesRendering();
  tile.edgesColor = new BABYLON.Color4(0, 0, 0, 0);
  tile.edgesWidth = 5;
  const mat = new BABYLON.StandardMaterial(`mat`, scene);
  // const grass = new GrassProceduralTexture('grass', VOXEL_SIZE, scene);
  // mat.ambientTexture = grass;
  mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
  mat.backFaceCulling = true;
  tile.material = mat;
  tile.position = new BABYLON.Vector3(x * VOXEL_SIZE, (y - .5) * VOXEL_SIZE, z * VOXEL_SIZE);
  tile.checkCollisions = true;
  tile.receiveShadows = true;
  // tile.physicsImpostor = new BABYLON.PhysicsImpostor(tile, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0 }, scene);
  return tile;
}

const drawFloor = (scene: BABYLON.Scene) => {
  const floor = [];
  for(let i = -5; i <= 5; i++) {
    for(let j = -5; j <= 5; j++) {
      const tile = drawTile(i, 0, j, scene);
      floor.push(tile);

      if(Math.random() > 0.8) {
        const stacked = drawTile(i, 1, j, scene);
        floor.push(stacked);
      }
    }
  }

  return floor;
};

const zoomCamera = (zoom: number, camera: BABYLON.FreeCamera) => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.orthoTop = zoom;
  camera.orthoBottom = -zoom;
  camera.orthoLeft = -zoom * aspect;
  camera.orthoRight = zoom * aspect;
};

(() => {
  // Create the scene space
  const scene = new BABYLON.Scene(engine);
  scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
  scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
  scene.collisionsEnabled = true;

  const keyboardState$ = KeyMap(scene);
  keyboardState$.subscribe(keyboard => {
    console.log('KEYBOARD', keyboard);
  });

  // Add a camera to the scene and attach it to the canvas
  const camera = new BABYLON.FreeCamera("Camera", CAMERA_POSITION, scene);
  camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera.setTarget(BABYLON.Vector3.Zero());
  zoomCamera(DEFAULT_ZOOM, camera);
  camera.applyGravity = true;
  camera.checkCollisions = true;

  const floor = drawFloor(scene);

  const spawnRay = new BABYLON.Ray(new BABYLON.Vector3(0, 10, 0), new BABYLON.Vector3(0, -1, 0));
  const result = scene.pickWithRay(spawnRay, null);
  let playerY = PLAYER_HEIGHT;
  if(result.hit) {
    const mesh = result.pickedMesh;
    console.log('MESH', mesh);
    playerY += mesh.position.y;
  } else {
    console.log('NO HIT');
  }

  const player = BABYLON.MeshBuilder.CreateBox('player', { size: PLAYER_WIDTH, height:PLAYER_HEIGHT }, scene);
  player.position = new BABYLON.Vector3(0, playerY, 0);
  // player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1,friction: 1 }, scene);
  // player.ellipsoid = new BABYLON.Vector3(PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_WIDTH);
  // player.ellipsoidOffset = new BABYLON.Vector3(0, PLAYER_HEIGHT / 2, 0);
  player.checkCollisions = true;

  const light = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(1, -1, 1), scene);
  light.intensity = 0.75;
  light.position = new BABYLON.Vector3(-10, 10, -10);
  const light2 = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
  light2.intensity = 0.3;
  
  var shadowGenerator = new BABYLON.ShadowGenerator(512, light);
  shadowGenerator.getShadowMap().renderList.push(player, ...floor);
  shadowGenerator.useContactHardeningShadow = true;

  const move = (x: number, z: number) => {
    if(!x && !z) {
      return;
    }
    const factor = Math.sqrt(x*x + z*z);
    // player.physicsImpostor.applyForce(new BABYLON.Vector3(x, 0, z), player.position);
    player.moveWithCollisions((new BABYLON.Vector3(x, 0, z)));
    camera.position = CAMERA_POSITION.clone();
    camera.position.x += player.position.x;
    camera.position.z += player.position.z;
  }

	scene.registerBeforeRender(() => {
		player.moveWithCollisions(scene.gravity);
  });
  
  const inputMap = {};
  const actionManager = scene.actionManager = new BABYLON.ActionManager(scene);

  actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
    inputMap[evt.sourceEvent.key] = true;
  }));
  actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {								
    inputMap[evt.sourceEvent.key] = false;
  }));
  
  scene.onBeforeRenderObservable.add((scene, state) => {
    let moveZ = 0;
    let moveX = 0;

    if(inputMap["w"] || inputMap["ArrowUp"]) {
        moveZ = 1;
    } 
    if(inputMap["a"] || inputMap["ArrowLeft"]) {
        moveX = -1;
    } 
    if(inputMap["s"] || inputMap["ArrowDown"]) {
        moveZ = -1;
    } 
    if(inputMap["d"] || inputMap["ArrowRight"]) {
        moveX = 1;;
    }

    if(moveX || moveZ) {
      const multiple = Math.sqrt(moveX * moveX + moveZ * moveZ);
      move(moveX / multiple * PLAYER_SPEED, moveZ / multiple * PLAYER_SPEED);
    }
})

  engine.runRenderLoop(() => {
    scene.render();
  });

  let zoom = DEFAULT_ZOOM;
  window.addEventListener('resize', () => {
    engine.resize();
    zoomCamera(zoom, camera);
  });

  window.addEventListener('mousewheel', (evt) => {
    if(evt.wheelDelta) {
      const delta = evt.wheelDelta;
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + (delta / Math.abs(delta))));
      zoomCamera(zoom, camera); 
    }
  })
})();