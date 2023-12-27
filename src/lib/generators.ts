import * as THREE from 'three';
import { ObjectModel } from './ObjectModel';

const zOffset = 0.1

export const makeGround = () => {
  const groundTexture = new THREE.TextureLoader().load('./textures/gras.jpg');
  const groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
  // groundMaterial.shadowSide = THREE.DoubleSide;
  const groundGeometry = new THREE.PlaneGeometry(2, 2);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.receiveShadow = true;
  ground.position.set(0, 0, zOffset);
  // ground.rotation.x = -Math.PI / 2;
  return ground;
}

export const makeLight = () => {
  const light = new THREE.PointLight(0xffffff, 0.04);
  light.position.set(0, 0, zOffset);
  light.castShadow = true;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 2000;
  return light;
}

export const makeRenderer = () => {
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // or any other shadow map type you prefer
  return renderer;
}

export const makeCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 5;
  camera.up.set(0, 0, 1);
  camera.position.set(0, 0, 2)
  camera.lookAt(0, 0, 0);
  return camera;
}

export const makeSphere = () => {
  const geometry = new THREE.SphereGeometry( 0.02, 16, 16 ); 
  const material = new THREE.MeshBasicMaterial( { color: "#fffffff" } ); 
  const sphere = new THREE.Mesh( geometry, material );
  sphere.position.set(0,0,zOffset)
  return sphere
}

export const makeTarget = () => {
  const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.05);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  return cube;
}

export const makeFinalTarget = () => {
  const geometry = new THREE.BoxGeometry(0.02, 0.02, 0.05);
  const material = new THREE.MeshBasicMaterial({ color: "#FFF200" });
  const cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.visible = false;
  return cube;
}

export const makeObjectsFromFile = async (scenes: string[], loadingManager: THREE.LoadingManager) => {

  const Objects = await Promise.all(scenes.map(async (scene) => {
    const Object = await new ObjectModel(loadingManager, scene);
    await Object.createObject();
    return Object;
  }))
  return Objects;
}
