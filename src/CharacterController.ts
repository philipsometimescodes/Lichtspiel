import { makeLight, makeCharacterSphere } from "./lib/generators"
import { OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from 'three';

type keyloggerObject = { [key: string]: boolean }

export class CharacterController {
    public light: THREE.Light;
    public character: THREE.Group;
    public collisionObjects: THREE.Mesh[]
    private characterSpeed = 10;    // Movement speed
    private jumpVelocity = 40;     // Initial jump velocity
    private velocityY = 0;           // Vertical velocity for jumping/falling
    private onGround = false;
    private keys: keyloggerObject = { forward: false, backward: false, left: false, right: false, jump: false, fast: false };
    public orbitcontrols: OrbitControls | undefined


    public constructor() {
        this.character = new THREE.Group();
        this.light = makeLight()
        this.character.add(makeCharacterSphere())
        this.character.add(this.light)
        this.character.position.set(0, 0, 0);
        this.character.rotation.set(0, 0, 0);
        this.collisionObjects = []
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') this.keys.forward = true;
            if (e.code === 'KeyS') this.keys.backward = true;
            if (e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'Space') this.keys.jump = true;
            if (e.code === 'ShiftLeft') this.keys.fast = true;

        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') this.keys.forward = false;
            if (e.code === 'KeyS') this.keys.backward = false;
            if (e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'Space') this.keys.jump = false;
            if (e.code === 'ShiftLeft') this.keys.fast = true;
        });

    }

    public changeLightIntensity = (value: number) => {
        this.light.intensity = this.light.intensity + value
    }

    public updateCharacter(deltaTime: number, camera: THREE.PerspectiveCamera) {
        let moveX = 0;
        let moveZ = 0;

        if (this.keys.fast) {
            this.characterSpeed = 30
        } else {
            this.characterSpeed = 10
        }
        // Forward/Backward
        if (this.keys.forward) moveZ += 1;
        if (this.keys.backward) moveZ -= 1;
    
        // Left/Right
        if (this.keys.left) moveX -= 1;
        if (this.keys.right) moveX += 1;
    
        // Normalize if diagonal movement
        let inputLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
        if (inputLength > 0) {
            moveX /= inputLength;
            moveZ /= inputLength;
        }
    
        // Get camera forward vector
        const cameraForward = new THREE.Vector3();
        camera.getWorldDirection(cameraForward);
    
        // Flatten camera direction so forward doesn't tilt up/down
        cameraForward.y = 0;
        cameraForward.normalize();
    
        // Compute camera right vector (perpendicular to forward)
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraForward, new THREE.Vector3(0,1,0));
        cameraRight.normalize();
    
        // Now forward/backward input should move along cameraForward
        // and left/right input should move along cameraRight
        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(cameraForward, moveZ);
        moveDir.addScaledVector(cameraRight, moveX);
    
        // Move the character (the ball)
        this.character.position.addScaledVector(moveDir, this.characterSpeed * deltaTime);
    
        // Gravity and jumping (unchanged)
        const gravity = -30; 
        this.velocityY += gravity * deltaTime;
    
        // Raycast down
        const rayOrigin = this.character.position.clone();
        // rayOrigin.y += 0.1;
        const raycaster = new THREE.Raycaster(rayOrigin, new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObjects(this.collisionObjects, true);
    
        if (intersects.length > 0) {
            const distanceToGround = intersects[0].distance;
            const characterHeight = 1.5; 
            if (distanceToGround <= characterHeight) {
                this.onGround = true;
                this.velocityY = 0;
                this.character.position.y = intersects[0].point.y + characterHeight;
            } else {
                this.onGround = false;
            }
        } else {
            this.onGround = false;
        }
    
        // Jumping
        if (this.keys.jump && this.onGround) {
            this.velocityY = this.jumpVelocity;
            this.onGround = false;
        }
    
        if (!this.onGround) {
            this.character.position.y += this.velocityY * deltaTime;
        }
    }
    
    
}