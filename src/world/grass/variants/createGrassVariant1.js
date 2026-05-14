import { createGrassPlant } from "../plantFactory.js";

export function createGrassVariant1(rng) {
  return createGrassPlant(
    {
      bladeCount: 4,
      spread: 0.18,
      heightMin: 0.32,
      heightMax: 0.52,
      widthMin: 0.07,
      widthMax: 0.1,
      lean: 0.16,
      scale: 0.95,
    },
    rng
  );
}

