import * as THREE from 'three';
import { createWorld } from '../world/createWorld.js';
import { setupPostProcessing } from '../rendering/setupPostProcessing.js';

/**
 * GameEngine handles the Three.js scene setup, rendering loop, and game state.
 * This class initializes the basic WebGL environment required for the game.
 */
export class GameEngine {
    constructor(containerElementId = 'game-container') {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.player = null; // Will hold the Hildr character representation
        this.world = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.updateCallback = null;
        this.container = document.getElementById(containerElementId);

        this.init();
    }

    init() {
        // 1. Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000
        );
        this.camera.position.set(0, 3.5, 8.5);
        this.camera.lookAt(0, 2.0, -8);

        // 2. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.12;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.domElement.setAttribute('id', 'game-canvas');
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        this.container.appendChild(this.renderer.domElement);

        // 3. World setup
        this.world = createWorld(this.scene);
        this.composer = setupPostProcessing(this.renderer, this.scene, this.camera);

        // 4. Handle Resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        console.log("GameEngine initialized successfully. Waiting for player/map assets.");
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // Main game loop
    animate() {
        requestAnimationFrame(() => this.animate());

        // Update logic (Movement, AI, etc.) goes here
        this.update();

        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    update() {
        const deltaTime = this.clock.getDelta();
        const time = this.clock.elapsedTime;

        if (!this.world) return;
        this.world.update(time);
        if (this.updateCallback) {
            this.updateCallback(deltaTime, time);
        }
    }

    // Start the game loop
    start() {
        this.animate();
    }

    // Clean up resources
    dispose() {
        this.renderer.dispose();
        window.removeEventListener('resize', this.onWindowResize);
    }
}
