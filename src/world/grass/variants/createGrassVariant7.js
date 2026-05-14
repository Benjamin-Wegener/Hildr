import { createGrassPlant } from "../plantFactory.js";
import { THEME } from "../../theme.js";

export function createGrassVariant7(rng) {
  return createGrassPlant(
    {
      bladeCount: 7,
      spread: 0.28,
      heightMin: 0.34,
      heightMax: 0.78,
      widthMin: 0.05,
      widthMax: 0.1,
      lean: 0.33,
      scale: 0.92,
      flowers: [
        { stemHeight: 0.22, bloomColor: THEME.bloomPink, petalColor: THEME.bloomWhite, bloomSize: 0.12, radius: 0.05, angle: 5.4 },
      ],
    },
    rng
  );
}

