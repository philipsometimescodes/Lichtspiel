import * as THREE from 'three';
import { ObjectModel } from './ObjectModel';
import { randFloat } from 'three/src/math/MathUtils.js';

export const makeGround = () => {
  const groundTexture = new THREE.TextureLoader().load('./textures/gras.jpg')
  const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
  groundMaterial.shadowSide = THREE.DoubleSide;
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.receiveShadow = true;
  ground.position.set(0, -1, 0);
  ground.rotation.x = -Math.PI / 2;
  return ground;
}

export const makeRenderer = () => {
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // or any other shadow map type you prefer
  return renderer;
}

export const makeCamera = () => {
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  return camera;
}

export const makeCharacterSphere = () => {
  const geometry = new THREE.SphereGeometry( 1, 16, 16 ); 
  const material = new THREE.MeshBasicMaterial( { color: "#fffffff" } ); 
  const sphere = new THREE.Mesh( geometry, material );
  sphere.position.set(0,0,0)
  return sphere
}

export const makeLight = () => {
  const light = new THREE.PointLight(0xffffff, 100);
  light.position.set(0, 0, 0);
  light.castShadow = true;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 2000;
  return light;
}

export const makeObjectsFromFile = async (scenes: string[], loadingManager: THREE.LoadingManager) => {

  const Objects = await Promise.all(scenes.map(async (scene) => {
    const Object = await new ObjectModel(loadingManager, scene);
    await Object.createObject();
    return Object;
  }))
  return Objects;
}

export const makeBlock = (x: number, y: number, z:number, color: THREE.Color) => {
  
  const geometry = new THREE.BoxGeometry(randFloat(10,30), randFloat(10,20), randFloat(10,30))
  const material = new THREE.MeshStandardMaterial({color: color})
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(x,y,z)
  cube.castShadow = true;
  return cube
}