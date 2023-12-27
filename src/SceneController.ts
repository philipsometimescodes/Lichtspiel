import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeCamera, makeObjectsFromFile, makeLight, makeRenderer, makeGround, makeSphere, makeTarget, makeFinalTarget } from './lib/generators.ts';
import { ObjectModel } from './lib/ObjectModel.ts';
import { Vector3 } from 'three';

export class SceneController {

    onWait: (() => void) | undefined;
    onReady: (() => void) | undefined;

    private raycaster: THREE.Raycaster;
    private pointer: THREE.Vector2;

    private waitState: number = 0;
    private scene: THREE.Scene;
    private loadingManager: THREE.LoadingManager;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private newCameraPosition: THREE.Vector3 | undefined;
    private newCameraLookAt: THREE.Vector3 | undefined;
    private sphere: THREE.Mesh;
    private target: THREE.Mesh;
    private finalTarget: THREE.Mesh;
    private light: THREE.Light;
    private keepMoving: boolean;
    private environment_scenes: ObjectModel[];
    private t = 0;
    private ambientLight: THREE.Light
    private zOffset: number;


    private constructor(uiEl: HTMLElement) {
        this.raycaster = new THREE.Raycaster()
        this.pointer = new THREE.Vector2()
        this.newCameraPosition = undefined;
        this.newCameraLookAt = undefined;
        this.environment_scenes = [];
        this.loadingManager = new THREE.LoadingManager();
        this.scene = new THREE.Scene();
        this.target = makeTarget();
        this.finalTarget = makeFinalTarget();
        this.renderer = makeRenderer();
        this.camera = makeCamera();
        this.light = makeLight();
        this.ambientLight =  new THREE.AmbientLight(0xffffff, 0.1);
        this.keepMoving = false;
        this.zOffset = 0.2
        uiEl.appendChild(this.renderer.domElement);
        this.sphere = makeSphere();
        this.initDefaults()
        this.renderer.render(this.scene, this.camera);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('click', this.onClick)
        window.addEventListener('keypress', this.changeState)
        requestAnimationFrame(this.renderLoop);
        this.loadingManager.onLoad = () => {
            this.changeWaitState(false);
        };
        this.loadingManager.onStart = () => {
            this.changeWaitState(true);
        }
    }
    private changeWaitState(waiting: boolean) {
        this.waitState += waiting ? +1 : -1;
        if (this.waitState == 0 && this.onReady) {
            this.onReady();
        }
        else if (this.waitState == 1 && this.onWait) {
            this.onWait();
        }
    }

    private changeState = (event: any) => {
        console.log(event)
        if (event.code === "Space" && event.shiftKey === false) {
            this.zOffset += 0.1
            this.changeLocationOfPointLight(new Vector3(0,0, 0.01))
        } else if (event.code === "Space" && event.shiftKey === true) {
            this.zOffset -= 0.1
            this.changeLocationOfPointLight(new Vector3(0,0, 0.01))
        } else if (event.key === "y") {
            this.changeLightIntensity(0.05)
        } else if (event.key === "x") {
            this.changeLightIntensity(-0.05)
        }
        if (event.key === "w") {
            this.changeLocationOfPointLight(new Vector3(0.01,0, 0))
        } if (event.key === "s") {
            this.changeLocationOfPointLight(new Vector3(-0.01,0,0))
        } if (event.key === "a") {
            this.changeLocationOfPointLight(new Vector3(0,0.01,0))
        } if (event.key === "d") {
            this.changeLocationOfPointLight(new Vector3(0,-0.01,0))
        }
    }
    private changeLocationOfPointLight = (distance: Vector3) => {
        this.sphere.position.addScaledVector(distance, 1)
        this.light.position.addScaledVector(distance, 1)
    }

    private onClick = (event: any) => {
        this.finalTarget.position.copy(this.target.position)
        this.finalTarget.position.setZ(this.zOffset)
        this.finalTarget.visible = true
        this.keepMoving = true
    }

    private onPointerMove = (event: any) => {

        // calculate pointer position in normalized device coordinates
        // (-1 to +1) for both components
        
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObject(this.environment_scenes[0]);

        // Toggle rotation bool for meshes that we clicked
        if (intersects.length > 0) {

            this.target.position.set(0, 0, 0);
            // this.target.lookAt( intersects[ 0 ].face.normal );

            this.target.position.copy(intersects[0].point);

        }
    }

    private initDefaults = async () => {
        this.environment_scenes = await makeObjectsFromFile(["demoscene.glb"], this.loadingManager);
        this.scene.background = new THREE.Color("#000000")
        this.scene.add(this.light, this.target, ...this.environment_scenes, this.sphere, this.ambientLight, this.finalTarget);
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
        const controls = new OrbitControls(this.camera, this.renderer.domElement);

    }

    private moveLight = () => {
        const delta = this.finalTarget.position.distanceTo(this.light.position)
        this.light.position.lerp(this.finalTarget.position, 0.1)
        this.sphere.position.lerp(this.finalTarget.position, 0.1)
        if (delta <= 0.001) {
            this.keepMoving = false;
            this.finalTarget.visible = false
        }
    }

    private changeLightIntensity = (value: number) => {
        this.light.intensity = this.light.intensity + value
    }

    private renderLoop = () => {
        if (this.keepMoving) {
            this.moveLight()
        }

        requestAnimationFrame(this.renderLoop);
        // update the picking ray with the camera and pointer position

        this.renderer.render(this.scene, this.camera);
    }

    static create = (uiEl: HTMLElement) => {
        return new SceneController(uiEl);
    }


}


