import { GameEngine } from './Engine.js';
import { Hildr } from '../entities/Hildr.js';
import { GodBlessingsSystem } from '../systems/GodBlessingsSystem.js';
import { createHud } from '../ui/createHud.js';
import { InputState } from '../input/InputState.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';
import { PlayerController } from '../controllers/PlayerController.js';

/**
 * GameManager initializes the game world, sets up the scene, and handles all input.
 */
class GameManager {
    constructor() {
        console.log("GameManager starting up...");
        
        // 1. Initialize Game Engine (The Renderer)
        // We pass the DOM element ID so the engine knows where to attach its canvas.
        this.engine = new GameEngine('game-container');

        // 2. Initialize Player Character (Hildr)
        // Pass the scene from the engine so Hildr can be added correctly.
        this.player = new Hildr(this.engine.scene);

        // 3. Set up Input Handling
        this.blessings = new GodBlessingsSystem();
        this.hud = createHud();
        this.input = new InputState(this.engine.renderer.domElement);
        this.cameraController = new ThirdPersonCamera(this.engine.camera, this.player.mesh);
        this.applyCameraPresetFromUrl();
        this.playerController = new PlayerController(this.player, this.cameraController, this.input);
        this.setupInputListeners();
        this.engine.setUpdateCallback(this.updateGame.bind(this));
        this.engine.start();
        this.exposeDebugState();

        console.log("Game initialization complete. The world is ready!");
    }

    setupInputListeners() {
        this.input.attach();
        window.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    applyCameraPresetFromUrl() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('camera') === 'face') {
            this.cameraController.setFaceInspectionView();
        }
    }

    /**
     * Handles continuous movement logic.
     * @param {KeyboardEvent} event 
     */
    handleKeydown(event) {
        if (event.key === '1') {
            const blessingName = this.blessings.applyBlessing(this.player, 'odin');
            this.hud.setBlessing(blessingName);
            console.log(`Blessing active: ${blessingName}`, this.player.stats);
        } else if (event.key === '2') {
            const blessingName = this.blessings.applyBlessing(this.player, 'thor');
            this.hud.setBlessing(blessingName);
            console.log(`Blessing active: ${blessingName}`, this.player.stats);
        } else if (event.key === '3') {
            const blessingName = this.blessings.applyBlessing(this.player, 'freya');
            this.hud.setBlessing(blessingName);
            console.log(`Blessing active: ${blessingName}`, this.player.stats);
        }
    }

    // This function is called by the engine's render loop
    updateGame(deltaTime) {
        this.playerController.update(deltaTime);
    }

    exposeDebugState() {
        window.__hildrDebug = {
            getState: () => ({
                playerPosition: {
                    x: this.player.mesh.position.x,
                    y: this.player.mesh.position.y,
                    z: this.player.mesh.position.z,
                },
                playerRotationY: this.player.mesh.rotation.y,
                cameraYaw: this.cameraController.yaw,
                cameraPitch: this.cameraController.pitch,
                pointerLocked: this.input.mouse.isPointerLocked,
                isMoving: this.playerController.isMoving,
                speedMultiplier: this.playerController.speedMultiplier,
                activeAnimation: this.player.mesh.userData.activeAnimationName ?? null,
                animationNames: this.player.mesh.userData.animationNames ?? [],
            }),
        };
    }
}


// Export the GameManager class
export { GameManager };
