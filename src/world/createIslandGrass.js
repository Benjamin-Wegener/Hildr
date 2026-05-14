import * as THREE from "three";
import { createSeededRandom, range } from "./grass/random.js";
import { createGrassVariant1 } from "./grass/variants/createGrassVariant1.js";
import { createGrassVariant2 } from "./grass/variants/createGrassVariant2.js";
import { createGrassVariant3 } from "./grass/variants/createGrassVariant3.js";
import { createGrassVariant4 } from "./grass/variants/createGrassVariant4.js";
import { createGrassVariant5 } from "./grass/variants/createGrassVariant5.js";
import { createGrassVariant6 } from "./grass/variants/createGrassVariant6.js";
import { createGrassVariant7 } from "./grass/variants/createGrassVariant7.js";

const VARIANTS = [
  createGrassVariant1,
  createGrassVariant2,
  createGrassVariant3,
  createGrassVariant4,
  createGrassVariant5,
  createGrassVariant6,
  createGrassVariant7,
];

export function createIslandGrass() {
  const group = new THREE.Group();
  const rng = createSeededRandom(24680);
  const plantCount = 84;
  const outerRadius = 12.7;
  const centerClearRadius = 2.2;

  for (let i = 0; i < plantCount; i++) {
    const createVariant = VARIANTS[i % VARIANTS.length];
    const plant = createVariant(rng);

    let x = 0;
    let z = 0;
    for (let attempt = 0; attempt < 8; attempt++) {
      const radial = Math.sqrt(rng()) * outerRadius;
      const angle = rng() * Math.PI * 2;
      x = Math.cos(angle) * radial;
      z = Math.sin(angle) * radial;
      if (Math.sqrt(x * x + z * z) > centerClearRadius) break;
    }

    const distance = Math.sqrt(x * x + z * z);
    const edgeFalloff = THREE.MathUtils.clamp(distance / outerRadius, 0, 1);
    const y = 0.02 + range(rng, -0.015, 0.02) - edgeFalloff * 0.015;

    plant.position.set(x, y, z);
    plant.rotation.y += rng() * Math.PI * 2;
    plant.scale.multiplyScalar(range(rng, 0.78, 1.22) * (1 - edgeFalloff * 0.12));
    group.add(plant);
  }

  return group;
}

