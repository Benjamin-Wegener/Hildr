import * as THREE from "three";

export function createSunGlow() {
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(8, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffe0b3,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
  );
  glow.position.set(-95, 70, -130);
  return glow;
}
