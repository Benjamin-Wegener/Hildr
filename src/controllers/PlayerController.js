import * as THREE from "three";

export class PlayerController {
  constructor(player, cameraController, inputState) {
    this.player = player;
    this.cameraController = cameraController;
    this.inputState = inputState;
    this.moveVector = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.worldMove = new THREE.Vector3();
    this.desiredWorldDirection = new THREE.Vector3();
    this.isMoving = false;
    this.speedMultiplier = 1;
    this.currentSpeed = 0;
    this.maxSpeed = this.player.speed * 60;
    this.acceleration = 11;
    this.deceleration = 16;
  }

  update(deltaTime) {
    if (this.cameraController.target !== this.player.mesh) {
      this.cameraController.target = this.player.mesh;
    }

    this.moveVector.set(0, 0, 0);

    if (this.inputState.isPressed("KeyW") || this.inputState.isPressed("ArrowUp")) this.moveVector.z += 1;
    if (this.inputState.isPressed("KeyS") || this.inputState.isPressed("ArrowDown")) this.moveVector.z -= 1;
    if (this.inputState.isPressed("KeyA") || this.inputState.isPressed("ArrowLeft")) this.moveVector.x += 1;
    if (this.inputState.isPressed("KeyD") || this.inputState.isPressed("ArrowRight")) this.moveVector.x -= 1;

    const mouseDelta = this.inputState.consumeMouseDelta();
    const isMoving = this.moveVector.lengthSq() > 0;
    const speedMultiplier = this.inputState.isPressed("ShiftLeft") || this.inputState.isPressed("ShiftRight") ? 1.7 : 1;
    this.isMoving = isMoving;
    this.speedMultiplier = speedMultiplier;

    const targetSpeed = isMoving ? this.maxSpeed * speedMultiplier : 0;
    const speedResponse = isMoving ? this.acceleration : this.deceleration;
    const speedBlend = 1 - Math.exp(-speedResponse * deltaTime);
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, speedBlend);

    const movementRatio = this.maxSpeed > 0 ? THREE.MathUtils.clamp(this.currentSpeed / this.maxSpeed, 0, 1) : 0;
    this.cameraController.update(deltaTime, mouseDelta, movementRatio);

    if (isMoving) {
      this.moveVector.normalize();

      const yaw = this.cameraController.yaw;
      this.forward.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
      this.right.set(this.forward.z, 0, -this.forward.x).normalize();

      this.desiredWorldDirection
        .set(0, 0, 0)
        .addScaledVector(this.right, this.moveVector.x)
        .addScaledVector(this.forward, this.moveVector.z)
        .normalize();

      this.worldMove.copy(this.desiredWorldDirection).multiplyScalar(this.currentSpeed * deltaTime);
      this.player.mesh.position.add(this.worldMove);
    }

    const animationSpeed = THREE.MathUtils.lerp(0.9, 1.1 + 0.15 * speedMultiplier, movementRatio);
    this.player.mesh.rotation.y = this.cameraController.yaw;
    this.player.updateVisual(deltaTime, isMoving, animationSpeed);
  }
}
