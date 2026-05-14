import * as THREE from "three";
import { THEME } from "./theme.js";

export function createWaterSurface() {
  const geometry = new THREE.PlaneGeometry(900, 900, 200, 200);
  const material = new THREE.MeshStandardMaterial({
    color: THEME.waterBase,
    roughness: 0.1,
    metalness: 0.12,
    emissive: THEME.waterHighlight,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.95,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.15;
  mesh.receiveShadow = true;

  const positionAttr = geometry.attributes.position;
  const basePositions = new Float32Array(positionAttr.array);

  const update = (time) => {
    for (let i = 0; i < positionAttr.count; i++) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];
      const waveA = Math.sin((x + time * 14) * 0.03) * 0.12;
      const waveB = Math.cos((z - time * 10) * 0.04) * 0.08;
      const waveC = Math.sin((x + z + time * 22) * 0.018) * 0.06;
      positionAttr.array[i * 3 + 1] = waveA + waveB + waveC;
    }
    const pulse = (Math.sin(time * 0.55) + 1) * 0.5;
    material.emissiveIntensity = 0.07 + pulse * 0.08;
    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  };

  return { mesh, update };
}
