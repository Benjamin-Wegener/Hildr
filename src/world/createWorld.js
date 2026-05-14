import * as THREE from "three";
import { createSkyDome } from "./createSkyDome.js";
import { createWaterSurface } from "./createWaterSurface.js";
import { createMountainRings } from "./createMountainRings.js";
import { createIsland } from "./createIsland.js";
import { createShoreRocks } from "./createShoreRocks.js";
import { createSunGlow } from "./createSunGlow.js";
import { THEME } from "./theme.js";

export function createWorld(scene) {
  const updaters = [];
  scene.fog = new THREE.Fog(THEME.fog, 35, 260);

  const sky = createSkyDome();
  scene.add(sky);
  scene.add(createSunGlow());

  const { mesh: water, update: updateWater } = createWaterSurface();
  scene.add(water);
  updaters.push(updateWater);

  const island = createIsland();
  scene.add(island);
  if (island.userData.update) {
    updaters.push(island.userData.update);
  }
  scene.add(createMountainRings());
  scene.add(createShoreRocks());

  const sunLight = new THREE.DirectionalLight(0xfff2dc, 2.4);
  sunLight.position.set(-35, 48, 12);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 8;
  sunLight.shadow.camera.far = 190;
  sunLight.shadow.camera.left = -60;
  sunLight.shadow.camera.right = 60;
  sunLight.shadow.camera.top = 60;
  sunLight.shadow.camera.bottom = -60;
  sunLight.shadow.bias = -0.0002;
  scene.add(sunLight);

  const fillLight = new THREE.HemisphereLight(0xc5e4ff, 0x223041, 0.72);
  scene.add(fillLight);

  return {
    update(time) {
      for (const updater of updaters) updater(time);
    },
  };
}
