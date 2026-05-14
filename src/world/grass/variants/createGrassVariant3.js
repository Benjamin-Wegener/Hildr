import { createGrassPlant } from "../plantFactory.js";

export function createGrassVariant3(rng) {
  return createGrassPlant(
    {
      bladeCount: 6,
      spread: 0.26,
      heightMin: 0.58,
      heightMax: 0.96,
      widthMin: 0.05,
      widthMax: 0.08,
      lean: 0.3,
      scale: 1.08,
    },
    rng
  );
}

