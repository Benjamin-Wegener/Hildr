import * as THREE from 'three';
import { createHildrVisual } from './hildr/createHildrVisual.js';
import { loadHildrModel } from './hildr/loadHildrModel.js';

/**
 * Hildr represents the player character in the game world.
 * It holds the state and the Three.js Mesh representation of the character.
 */
export class Hildr {
    constructor(scene) {
        this.name = "Hildr";
        this.stats = {
            Strength: 15,
            Agility: 12,
            MaxHealth: 100,
            CurrentHealth: 100,
            MaxMana: 50,
            CurrentMana: 50
        };
        this.isAlive = true;
        this.speed = 0.1; // Movement speed constant
        this.baseY = 0;
        this.time = 0;
        
        this.mesh = createHildrVisual();
        this.baseY = this.mesh.position.y;
        
        scene.add(this.mesh);
        console.log("Hildr entity created and added to the scene.");
        this.upgradeToGlbModel(scene);
    }

    updateVisual(deltaTime, isMoving, speedMultiplier = 1) {
        this.time += deltaTime;

        if (this.mesh.userData.mixer) {
            const desiredAnimation = isMoving ? "Walk" : "IdleBreath";
            const fadeSeconds = isMoving ? 0.12 : 0.22;
            this.mesh.userData.setAnimation?.(desiredAnimation, fadeSeconds);
            this.mesh.userData.setAnimationTimeScale?.(isMoving ? speedMultiplier : 1);
            this.mesh.userData.mixer.update(deltaTime);
            this.mesh.position.y = this.baseY;
            this.mesh.rotation.z *= 0.9;
            return;
        }

        const breathe = Math.sin(this.time * 2.2) * 0.015;
        this.mesh.position.y = this.baseY + breathe;

        if (!isMoving) {
            this.mesh.rotation.z = Math.sin(this.time * 1.1) * 0.02;
        } else {
            this.mesh.rotation.z *= 0.85;
        }
    }

    async upgradeToGlbModel(scene) {
        try {
            const glbMesh = await loadHildrModel();
            glbMesh.position.copy(this.mesh.position);
            glbMesh.rotation.copy(this.mesh.rotation);
            scene.remove(this.mesh);
            this.mesh = glbMesh;
            this.baseY = this.mesh.position.y;
            scene.add(this.mesh);
            console.log("Hildr GLB model loaded successfully.");
        } catch (error) {
            console.warn("Using procedural Hildr fallback. GLB load failed:", error);
        }
    }

    /**
     * Updates Hildr's position based on input and speed.
     * @param {object} movementVector - Object containing {dx: number, dz: number} movement input.
     * @param {THREE.Scene} scene - The scene to apply transformations to.
     */
    move(movementVector, scene) {
        if (!this.isAlive) return;

        // Calculate movement based on input vector and speed
        const deltaX = movementVector.dx * this.speed;
        const deltaZ = movementVector.dz * this.speed;

        this.mesh.position.x += deltaX;
        this.mesh.position.z += deltaZ;
        
        // Optional: Update rotation to face the direction of travel
        // (Implementation omitted for brevity, but crucial for a real game)

        console.log(`Hildr moved to: (${this.mesh.position.x.toFixed(1)}, ${this.mesh.position.z.toFixed(1)})`);
    }

    /**
     * Applies damage to the character.
     * @param {number} damage - The amount of damage received.
     */
    takeDamage(damage) {
        if (!this.isAlive) return;
        
        this.stats.CurrentHealth -= damage;
        console.log(`Hildr took ${damage} damage. Remaining HP: ${this.stats.CurrentHealth}`);

        if (this.stats.CurrentHealth <= 0) {
            this.stats.CurrentHealth = 0;
            this.isAlive = false;
            console.log("Hildr has fallen!");
        }
    }

    /**
     * Applies stat modifiers to Hildr and clamps current values to max caps.
     * @param {Record<string, number>} modifiers
     */
    applyStatModifiers(modifiers) {
        for (const [stat, amount] of Object.entries(modifiers)) {
            if (typeof this.stats[stat] === 'number') {
                this.stats[stat] += amount;
            }
        }

        this.stats.CurrentHealth = Math.min(this.stats.CurrentHealth, this.stats.MaxHealth);
        this.stats.CurrentMana = Math.min(this.stats.CurrentMana, this.stats.MaxMana);
    }

    // Placeholder for signature ability (e.g., Berserker Rage)
    useAbility(abilityName, target) {
        if (!this.isAlive) return;
        
        if (abilityName === "RAGE") {
            console.log("--- RAGE ACTIVATED! ---");
            // Logic for applying massive temporary buffs
            // In a real game, this would trigger animations and combat state changes.
            return 30; // Example damage output
        }
        return 0;
    }
}
