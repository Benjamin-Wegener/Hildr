import * as THREE from "three";
import { THEME } from "../theme.js";
import { range } from "./random.js";

function createGrassMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color.clone().multiplyScalar(0.08),
    emissiveIntensity: 0.35,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  });
}

function makeBladeShape(width, height) {
  const shape = new THREE.Shape();
  shape.moveTo(-width * 0.18, 0);
  shape.quadraticCurveTo(-width * 0.48, height * 0.32, -width * 0.12, height * 0.72);
  shape.quadraticCurveTo(-width * 0.02, height * 0.94, 0, height);
  shape.quadraticCurveTo(width * 0.02, height * 0.94, width * 0.12, height * 0.72);
  shape.quadraticCurveTo(width * 0.48, height * 0.32, width * 0.18, 0);
  shape.quadraticCurveTo(0, -height * 0.04, -width * 0.18, 0);
  return shape;
}

export function createGrassBlade(rng, options = {}) {
  const height = options.height ?? range(rng, 0.55, 1.05);
  const width = options.width ?? range(rng, 0.045, 0.08);
  const thickness = options.thickness ?? range(rng, 0.018, 0.03);
  const bendX = options.bendX ?? range(rng, -0.18, 0.18);
  const bendZ = options.bendZ ?? range(rng, -0.18, 0.18);
  const twist = options.twist ?? range(rng, 0, Math.PI * 2);
  const colorMix = range(rng, 0, 1);

  const color = new THREE.Color(THEME.grassDeep)
    .lerp(new THREE.Color(THEME.grassMid), 0.68 + colorMix * 0.16)
    .lerp(new THREE.Color(THEME.grassLight), 0.18 + colorMix * 0.26);

  const shape = makeBladeShape(width, height);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: width * 0.12,
    bevelThickness: thickness * 0.35,
    steps: 1,
  });

  geometry.center();
  geometry.translate(0, height * 0.48, 0);

  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const t = THREE.MathUtils.clamp(y / height, 0, 1);
    const curve = t * t * (1.0 - 0.15 * t);
    position.setXYZ(
      i,
      x + bendX * curve * height,
      y,
      z + bendZ * curve * height
    );
  }

  geometry.computeVertexNormals();

  const blade = new THREE.Mesh(geometry, createGrassMaterial(color));
  blade.rotation.y = twist;
  blade.castShadow = true;
  blade.receiveShadow = true;
  return blade;
}
