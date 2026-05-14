import { createGrassPlant } from "../plantFactory.js";
import { THEME } from "../../theme.js";

export function createGrassVariant6(rng) {
  return createGrassPlant(
    {
      bladeCount: 3,
      spread: 0.16,
      heightMin: 0.7,
      heightMax: 1.08,
      widthMin: 0.04,
      widthMax: 0.07,
      lean: 0.18,
      scale: 1.08,
      flowers: [
        { stemHeight: 0.48, bloomColor: THEME.bloomWhite, petalColor: THEME.bloomPink, bloomSize: 0.1, radius: 0.02, angle: 2.8 },
      ],
    },
    rng
  );
}

