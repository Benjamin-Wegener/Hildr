import * as THREE from "three";
import { THEME } from "./theme.js";

function createRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.2 * scale, 0),
    new THREE.MeshStandardMaterial({
      color: THEME.shoreRock,
      roughness: 1.0,
      metalness: 0.0,
    })
  );
  rock.position.set(x, -0.5 + scale * 0.25, z);
  rock.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.3);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

export function createShoreRocks() {
  const group = new THREE.Group();
  const ringRadius = 17;

  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 1.7 + 0.25;
    const r = ringRadius + (i % 3) * 1.8;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r + 9;
    const scale = 0.7 + (i % 4) * 0.25;
    group.add(createRock(x, z, scale));
  }

  const mossPatch = new THREE.Mesh(
    new THREE.CircleGeometry(7.5, 24),
    new THREE.MeshStandardMaterial({ color: THEME.moss, roughness: 1.0, metalness: 0.0 })
  );
  mossPatch.rotation.x = -Math.PI / 2;
  mossPatch.position.set(0, -0.48, 10);
  mossPatch.receiveShadow = true;
  group.add(mossPatch);

  return group;
}
