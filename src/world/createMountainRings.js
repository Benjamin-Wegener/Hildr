import * as THREE from "three";
import { THEME } from "./theme.js";

function createMountain(radius, angle, height, width, color) {
  const mountain = new THREE.Group();
  const rock = new THREE.Mesh(
    new THREE.ConeGeometry(width, height, 5),
    new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0.02 })
  );
  rock.castShadow = true;
  rock.receiveShadow = true;
  mountain.add(rock);

  const snowCap = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.45, height * 0.28, 5),
    new THREE.MeshStandardMaterial({ color: THEME.snow, roughness: 0.7, metalness: 0.0 })
  );
  snowCap.position.y = height * 0.35;
  snowCap.castShadow = true;
  snowCap.receiveShadow = true;
  mountain.add(snowCap);

  mountain.position.set(
    Math.cos(angle) * radius,
    height * 0.5 - 2.5,
    Math.sin(angle) * radius
  );
  mountain.rotation.y = angle;
  return mountain;
}

export function createMountainRings() {
  const group = new THREE.Group();

  for (let i = 0; i < 26; i++) {
    const angle = (i / 26) * Math.PI * 2;
    const radius = 115 + (i % 4) * 8;
    const height = 34 + (i % 5) * 14;
    const width = 16 + (i % 3) * 8;
    group.add(createMountain(radius, angle, height, width, THEME.mountainNear));
  }

  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const radius = 195 + (i % 5) * 9;
    const height = 24 + (i % 4) * 11;
    const width = 12 + (i % 2) * 7;
    group.add(createMountain(radius, angle, height, width, THEME.mountainFar));
  }

  return group;
}
