import { createGrassPlant } from "../plantFactory.js";
import { THEME } from "../../theme.js";

export function createGrassVariant4(rng) {
  return createGrassPlant(
    {
      bladeCount: 4,
      spread: 0.2,
      heightMin: 0.44,
      heightMax: 0.7,
      widthMin: 0.06,
      widthMax: 0.1,
      lean: 0.2,
      scale: 0.98,
      flowers: [
        { stemHeight: 0.28, bloomColor: THEME.bloomWhite, petalColor: THEME.bloomPink, bloomSize: 0.15, radius: 0.02, angle: 0.4 },
      ],
    },
    rng
  );
}

