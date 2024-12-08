import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeRenderer, makeBlock, makeGround, makeCamera } from './lib/generators.ts';
import { ObjectModel } from './lib/ObjectModel.ts';
import { CharacterController } from './CharacterController.ts';
import { randFloat } from 'three/src/math/MathUtils.js';
import * as THREE from 'three';

export class SceneController {

    onWait: (() => void) | undefined;
    onReady: (() => void) | undefined;
    public gameAlive: boolean = false
    public characterDead: boolean = false
    private onDeath: () => void
    private waitState: number = 0;
    private scene: THREE.Scene;
    private loadingManager: THREE.LoadingManager;
    private renderer: THREE.WebGLRenderer;
    private environment_scenes: ObjectModel[];
    private character: CharacterController;
    private camera: THREE.PerspectiveCamera;
    private cameraPivot: THREE.Group;
    private startingPlane: THREE.Mesh;
    private ambientLight: THREE.Light
    private envBlocks: THREE.Mesh[]
    private backgroundColor: THREE.Color
    private blockColors: THREE.Color[]

    // private AnimationMixers: THREE.AnimationMixer[]
    // private AnimationClips: THREE.AnimationClip[]
    // private AnimationActions: THREE.AnimationAction[]
    // private vectorKeyframeTracks: THREE.VectorKeyframeTrack[][]
    private clock: THREE.Clock

    private constructor(uiEl: HTMLElement, onDeath: () => void) {
        this.onDeath = onDeath
        this.character = new CharacterController()
        this.camera = makeCamera();
        this.startingPlane = makeGround()
        this.envBlocks = []
        this.clock = new THREE.Clock()
        this.clock.start()
        // this.AnimationMixers = []
        // this.AnimationClips = []
        // this.AnimationActions = []
        // this.vectorKeyframeTracks = []
        this.environment_scenes = [];
        this.character.collisionObjects.push(this.startingPlane)
        this.loadingManager = new THREE.LoadingManager();
        this.scene = new THREE.Scene();
        this.renderer = makeRenderer();
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.001);
        this.backgroundColor = new THREE.Color("#000000")
        this.blockColors = [new THREE.Color("#FCA311"), new THREE.Color("#14213D"), new THREE.Color("#E5E5E5")]
        uiEl.appendChild(this.renderer.domElement);
        this.initDefaults()
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
        this.loadingManager.onLoad = () => {
            this.changeWaitState(false);
        };
        this.loadingManager.onStart = () => {
            this.changeWaitState(true);
        }
        this.cameraPivot = new THREE.Group();

        this.cameraPivot.add(this.camera);

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

    private initDefaults = async () => {
        this.scene.background = this.backgroundColor
        for (let n = 20; n < 100; n++) {
            const block = makeBlock(randFloat(-n, n) * 5, randFloat(-n, n) * 5, randFloat(-n, n) * 5, this.blockColors[Math.floor(Math.random() * this.blockColors.length)])
            this.scene.add(block); // Add the block to the scene
            // const newMixer = new THREE.AnimationMixer(block)
            let randomVectors
            if (n % 2 == 0) {
                randomVectors = [0, 0, 0, 0, randFloat(-n, n), 0, 0, 0, 0]
            } else {
                randomVectors = [0, 0, 0, 0, 0, randFloat(-n, n), 0, 0, 0]
            }
            // let vectorKeyframeTrack = [new THREE.VectorKeyframeTrack("track.position" + n, [0, 5, 10], randomVectors)]
            // const animationClip = new THREE.AnimationClip("Action" + n, 10, vectorKeyframeTrack)
            // const action = newMixer.clipAction(animationClip)
            // action.loop = THREE.LoopRepeat
            // action.play()
            // this.envBlocks.push(block)
            // this.vectorKeyframeTracks.push(vectorKeyframeTrack)
            // this.AnimationMixers.push(newMixer)
            // this.AnimationActions.push(action)
            // this.AnimationClips.push(animationClip)
            this.character.collisionObjects.push(block)
        }
        this.scene.add(this.cameraPivot);
        this.camera.position.set(0, 10, 22);
        this.camera.lookAt(0, 1, 0);
        this.character.collisionObjects.push(...this.envBlocks)
        this.character.character.position.set(0, 1, 0);
        this.scene.add(this.startingPlane, this.character.character, ...this.environment_scenes, this.ambientLight);
        // const axesHelper = new THREE.AxesHelper(5);
        // this.scene.add(axesHelper);
        this.character.orbitcontrols = new OrbitControls(this.camera, this.renderer.domElement);
    }

    private updateCamera() {
        // Smoothly move camera pivot to follow character
        this.cameraPivot.position.lerp(this.character.character.position, 0.1);
        this.cameraPivot.position.y += 1; // slightly above character

        this.camera.lookAt(this.character.character.position.x, this.character.character.position.y, this.character.character.position.z);
    }

    public startGame = () => {
        if (this.characterDead){
            this.scene.remove.apply(this.scene, this.scene.children);
            this.initDefaults()
        }
        this.gameAlive = true

    }


    private animate = () => {
        // this.AnimationMixers.forEach((mixer) => mixer.update(this.clock.getDelta() / mixer.timeScale))
        // update the picking ray with the camera and pointer position
        requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        if (this.gameAlive) {
            this.character.updateCharacter(delta, this.camera);
            this.updateCamera();
            if (this.character.character.position.y < -100) {
                this.gameAlive = false
                this.characterDead = true
                this.onDeath()
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
    static create = (uiEl: HTMLElement, onDeath: () => void) => {
        return new SceneController(uiEl, onDeath);
    }


}
