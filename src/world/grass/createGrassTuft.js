import * as THREE from "three";
import { createGrassBlade } from "./createGrassBlade.js";
import { range } from "./random.js";

export function createGrassTuft(rng) {
  const tuft = new THREE.Group();
  const bladeCount = 7;

  for (let i = 0; i < bladeCount; i++) {
    const blade = createGrassBlade(rng, {
      height: range(rng, 0.58, 1.12),
      width: range(rng, 0.04, 0.08),
      thickness: range(rng, 0.016, 0.026),
      bendX: range(rng, -0.12, 0.12),
      bendZ: range(rng, -0.12, 0.12),
      twist: range(rng, 0, Math.PI * 2),
    });

    const angle = (i / bladeCount) * Math.PI * 2 + range(rng, -0.55, 0.55);
    const radius = range(rng, 0.0, 0.11);
    blade.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    blade.rotation.x = range(rng, -0.16, 0.16);
    blade.rotation.z = range(rng, -0.16, 0.16);
    blade.scale.setScalar(range(rng, 0.92, 1.12));
    tuft.add(blade);
  }

  tuft.rotation.y = range(rng, 0, Math.PI * 2);
  tuft.scale.setScalar(range(rng, 0.92, 1.08));
  return tuft;
}

