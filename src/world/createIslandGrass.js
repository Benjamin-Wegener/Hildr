import * as THREE from "three";
import { createSeededRandom, range } from "./grass/random.js";
import { createGrassTuft } from "./grass/createGrassTuft.js";

export function createIslandGrass() {
  const group = new THREE.Group();
  const rng = createSeededRandom(24680);
  const tuftCount = 500;
  const outerRadius = 13.2;
  const centerClearRadius = 0.9;

  for (let i = 0; i < tuftCount; i++) {
    const tuft = createGrassTuft(rng);

    let x = 0;
    let z = 0;
    for (let attempt = 0; attempt < 10; attempt++) {
      const radial = Math.sqrt(rng()) * outerRadius;
      const angle = rng() * Math.PI * 2;
      x = Math.cos(angle) * radial;
      z = Math.sin(angle) * radial;
      if (Math.sqrt(x * x + z * z) > centerClearRadius) break;
    }

    const distance = Math.sqrt(x * x + z * z);
    const edgeFalloff = THREE.MathUtils.clamp(distance / outerRadius, 0, 1);
    const y = 0.02 + range(rng, -0.01, 0.018) - edgeFalloff * 0.02;

    tuft.position.set(x, y, z);
    tuft.rotation.y += rng() * Math.PI * 2;
    tuft.scale.multiplyScalar(range(rng, 0.75, 1.18) * (1 - edgeFalloff * 0.1));
    group.add(tuft);
  }

  group.userData.update = (time) => {
    for (const tuft of group.children) {
      tuft.userData.update?.(time);
    }
  };

  return group;
}
