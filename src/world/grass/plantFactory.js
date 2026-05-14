import * as THREE from "three";
import { THEME } from "../theme.js";
import { range } from "./random.js";

function createBladeMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
}

function createBlade({ height, baseWidth, color, leanX = 0, leanZ = 0, twist = 0 }) {
  const geometry = new THREE.CylinderGeometry(baseWidth * 0.14, baseWidth, height, 5, 1);
  geometry.translate(0, height * 0.5, 0);

  const blade = new THREE.Mesh(geometry, createBladeMaterial(color));
  blade.rotation.x = leanX;
  blade.rotation.z = leanZ;
  blade.rotation.y = twist;
  blade.castShadow = true;
  blade.receiveShadow = true;
  return blade;
}

function createFlower({ stemHeight, bloomColor, petalColor, bloomSize = 0.16 }) {
  const flower = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, stemHeight, 5, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.grassDeep,
      roughness: 1,
      metalness: 0,
    })
  );
  stem.position.y = stemHeight * 0.5;
  stem.rotation.z = -0.1;
  stem.castShadow = true;
  stem.receiveShadow = true;
  flower.add(stem);

  const bloomCenter = new THREE.Mesh(
    new THREE.SphereGeometry(bloomSize * 0.52, 10, 10),
    new THREE.MeshStandardMaterial({
      color: bloomColor,
      roughness: 0.8,
      metalness: 0,
    })
  );
  bloomCenter.position.y = stemHeight + bloomSize * 0.28;
  bloomCenter.castShadow = true;
  bloomCenter.receiveShadow = true;
  flower.add(bloomCenter);

  const petalGeometry = new THREE.SphereGeometry(bloomSize * 0.42, 8, 8);
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: petalColor,
    roughness: 0.95,
    metalness: 0,
  });

  const offsets = [
    [0.16, 0.00, 0.02],
    [-0.16, 0.00, 0.02],
    [0.00, 0.16, 0.00],
    [0.00, -0.14, -0.01],
  ];

  for (const [x, z, y] of offsets) {
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.set(x, stemHeight + bloomSize * 0.3 + y, z);
    petal.castShadow = true;
    petal.receiveShadow = true;
    flower.add(petal);
  }

  return flower;
}

export function createGrassPlant(config, rng = Math.random) {
  const plant = new THREE.Group();
  const bladeCount = config.bladeCount ?? 5;
  const spread = config.spread ?? 0.22;
  const baseLift = config.baseLift ?? 0;

  for (let i = 0; i < bladeCount; i++) {
    const t = bladeCount === 1 ? 0 : i / (bladeCount - 1);
    const height = range(rng, config.heightMin ?? 0.42, config.heightMax ?? 0.9);
    const width = range(rng, config.widthMin ?? 0.06, config.widthMax ?? 0.11);
    const radius = range(rng, 0.02, spread);
    const angle = t * Math.PI * 2 + range(rng, -0.55, 0.55);
    const leanX = range(rng, -(config.lean ?? 0.28), config.lean ?? 0.28);
    const leanZ = range(rng, -(config.lean ?? 0.28), config.lean ?? 0.28);
    const colorMix = range(rng, 0, 1);
    const color = new THREE.Color(THEME.grassDeep)
      .lerp(new THREE.Color(THEME.grassMid), 0.45 + colorMix * 0.25)
      .lerp(new THREE.Color(THEME.grassLight), colorMix * 0.35);

    const blade = createBlade({
      height,
      baseWidth: width,
      color,
      leanX,
      leanZ,
      twist: angle * 0.18,
    });
    blade.position.set(Math.cos(angle) * radius, baseLift, Math.sin(angle) * radius);
    blade.rotation.y += angle * 0.5;
    blade.scale.y = range(rng, 0.92, 1.08);
    plant.add(blade);
  }

  for (const flower of config.flowers ?? []) {
    const bloom = createFlower(flower);
    const angle = flower.angle ?? range(rng, 0, Math.PI * 2);
    const radius = flower.radius ?? range(rng, 0, spread * 0.55);
    bloom.position.set(Math.cos(angle) * radius, baseLift, Math.sin(angle) * radius);
    bloom.rotation.y = angle * 0.35;
    bloom.scale.setScalar(flower.scale ?? 1);
    plant.add(bloom);
  }

  plant.rotation.y = range(rng, 0, Math.PI * 2);
  plant.scale.setScalar(config.scale ?? 1);
  return plant;
}

