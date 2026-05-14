import { createGrassPlant } from "../plantFactory.js";
import { THEME } from "../../theme.js";

export function createGrassVariant5(rng) {
  return createGrassPlant(
    {
      bladeCount: 5,
      spread: 0.24,
      heightMin: 0.48,
      heightMax: 0.8,
      widthMin: 0.05,
      widthMax: 0.09,
      lean: 0.23,
      scale: 1.02,
      flowers: [
        { stemHeight: 0.25, bloomColor: THEME.bloomGold, petalColor: THEME.bloomWhite, bloomSize: 0.13, radius: 0.03, angle: 1.7 },
        { stemHeight: 0.23, bloomColor: THEME.bloomWhite, petalColor: THEME.bloomGold, bloomSize: 0.12, radius: 0.08, angle: 4.2 },
      ],
    },
    rng
  );
}

