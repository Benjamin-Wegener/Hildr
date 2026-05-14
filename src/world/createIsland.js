import * as THREE from "three";
import { THEME } from "./theme.js";
import { createIslandGrass } from "./createIslandGrass.js";

function addSurfaceNoise(geometry, radius, amplitude, seed) {
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const radial = Math.min(Math.sqrt(x * x + z * z) / radius, 1);
    const centerWeight = 1 - radial;
    const noise = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
    const jitter = (noise - Math.floor(noise)) * 2 - 1;
    position.setY(i, y + centerWeight * amplitude * jitter);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

export function createIsland() {
  const island = new THREE.Group();

  const dirtBody = new THREE.Mesh(
    new THREE.CylinderGeometry(16.6, 19.2, 2.2, 128, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.soilDark,
      roughness: 1,
      metalness: 0,
    })
  );
  dirtBody.position.y = -1.1;
  dirtBody.castShadow = true;
  dirtBody.receiveShadow = true;
  island.add(dirtBody);

  const soilLip = new THREE.Mesh(
    new THREE.CylinderGeometry(15.1, 16.7, 0.55, 128, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.soilLight,
      roughness: 1,
      metalness: 0,
    })
  );
  soilLip.position.y = -0.18;
  addSurfaceNoise(soilLip.geometry, 16.7, 0.12, 11.4);
  soilLip.castShadow = true;
  soilLip.receiveShadow = true;
  island.add(soilLip);

  const grassCap = new THREE.Mesh(
    new THREE.CylinderGeometry(14.3, 15.1, 0.5, 128, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.grassMid,
      roughness: 1,
      metalness: 0,
    })
  );
  grassCap.position.y = 0.02;
  addSurfaceNoise(grassCap.geometry, 15.1, 0.18, 27.9);
  grassCap.castShadow = true;
  grassCap.receiveShadow = true;
  island.add(grassCap);

  const grassEdge = new THREE.Mesh(
    new THREE.CylinderGeometry(14.0, 14.4, 0.18, 128, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.grassDeep,
      roughness: 1,
      metalness: 0,
    })
  );
  grassEdge.position.y = 0.18;
  addSurfaceNoise(grassEdge.geometry, 14.4, 0.06, 48.2);
  grassEdge.castShadow = true;
  grassEdge.receiveShadow = true;
  island.add(grassEdge);

  const grass = createIslandGrass();
  grass.position.y = 0.18;
  island.add(grass);

  return island;
}
