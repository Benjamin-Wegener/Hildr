import * as THREE from "three";

export class ThirdPersonCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;

    this.yaw = Math.PI;
    this.pitch = 0.25;
    this.distance = 6.5;
    this.heightOffset = 2.2;
    this.lookAtHeight = 1.9;

    this.minPitch = -0.35;
    this.maxPitch = 0.65;

    this.lookAt = new THREE.Vector3();
    this.desiredPosition = new THREE.Vector3();
    this.smoothedTarget = target.position.clone();
  }

  setFaceInspectionView() {
    this.yaw = 0;
    this.pitch = 0.0;
    this.distance = 1.85;
    this.heightOffset = 2.48;
    this.lookAtHeight = 2.55;
    this.snapToOrbit();
  }

  snapToOrbit() {
    const targetPos = this.target.position;
    this.smoothedTarget.copy(targetPos);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * this.distance * Math.cos(this.pitch),
      this.heightOffset + Math.sin(this.pitch) * this.distance,
      Math.cos(this.yaw) * this.distance * Math.cos(this.pitch)
    );

    this.camera.position.copy(targetPos).add(offset);
    this.lookAt.set(targetPos.x, targetPos.y + this.lookAtHeight, targetPos.z);
    this.camera.lookAt(this.lookAt);
  }

  update(deltaTime, mouseDelta, movementRatio = 0) {
    this.yaw -= mouseDelta.x * 0.003;
    this.pitch -= mouseDelta.y * 0.002;
    this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);

    const targetPos = this.target.position;
    const targetLag = movementRatio > 0.01 ? 10 : 16;
    const targetBlend = 1 - Math.exp(-targetLag * deltaTime);
    this.smoothedTarget.lerp(targetPos, targetBlend);

    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * this.distance * Math.cos(this.pitch),
      this.heightOffset + Math.sin(this.pitch) * this.distance,
      Math.cos(this.yaw) * this.distance * Math.cos(this.pitch)
    );

    this.desiredPosition.copy(this.smoothedTarget).add(offset);
    const smoothing = 1 - Math.exp(-8 * deltaTime);
    this.camera.position.lerp(this.desiredPosition, smoothing);

    this.lookAt.set(this.smoothedTarget.x, this.smoothedTarget.y + this.lookAtHeight, this.smoothedTarget.z);
    this.camera.lookAt(this.lookAt);
  }
}
