import * as THREE from 'three';
import * as CANNON from 'cannon';
import { IWorld, surfaceMaterial } from './World';

const VOXEL_SIZE = 2;

const textureLoader = new THREE.TextureLoader();

const surfaceSideMaterial = new THREE.MeshLambertMaterial({ map: textureLoader.load('/images/surface-side.png') });
const surfaceTopMaterial = new THREE.MeshLambertMaterial({ map: textureLoader.load('/images/surface-top.png') });

export default (world: IWorld, terrain: THREE.Object3D, position: THREE.Vector3) => {
  const tileGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
  tileGeo.faces.forEach((face, i) => face.materialIndex = (i - i % 2) === 4 ? 1 : 0);
  const tile = new THREE.Mesh(tileGeo, [surfaceSideMaterial, surfaceTopMaterial]);
  tile.castShadow = true;
  tile.receiveShadow = true;
  tile.name = `Tile ${position.x}, ${position.y}, ${position.z}`;
  tile.position.set(position.x * VOXEL_SIZE, (position.y - .5) * VOXEL_SIZE, position.z * VOXEL_SIZE);

  const tileBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(VOXEL_SIZE / 2, VOXEL_SIZE / 2, VOXEL_SIZE / 2)),
    material: surfaceMaterial
  });
  tileBody.position.set(position.x * VOXEL_SIZE, (position.y - .5) * VOXEL_SIZE, position.z * VOXEL_SIZE);

  const lineGeo = new THREE.EdgesGeometry(tileGeo);
  const line = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: new THREE.Color(0), opacity: 0.25, linewidth: 1 }));
  // tile.add(line);

    terrain.add(tile);
    world.addBody(tileBody);

  return {
  };
};