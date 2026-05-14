import { createGrassPlant } from "../plantFactory.js";

export function createGrassVariant2(rng) {
  return createGrassPlant(
    {
      bladeCount: 5,
      spread: 0.22,
      heightMin: 0.46,
      heightMax: 0.74,
      widthMin: 0.05,
      widthMax: 0.09,
      lean: 0.24,
      scale: 1.0,
    },
    rng
  );
}

