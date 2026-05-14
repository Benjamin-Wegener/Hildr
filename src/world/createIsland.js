import * as THREE from "three";
import { THEME } from "./theme.js";
import { createIslandGrass } from "./createIslandGrass.js";

export function createIsland() {
  const island = new THREE.Group();

  const dirtBody = new THREE.Mesh(
    new THREE.CylinderGeometry(16.6, 19.2, 2.2, 40, 1),
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
    new THREE.CylinderGeometry(15.1, 16.7, 0.55, 40, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.soilLight,
      roughness: 1,
      metalness: 0,
    })
  );
  soilLip.position.y = -0.18;
  soilLip.castShadow = true;
  soilLip.receiveShadow = true;
  island.add(soilLip);

  const grassCap = new THREE.Mesh(
    new THREE.CylinderGeometry(14.3, 15.1, 0.5, 40, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.grassMid,
      roughness: 1,
      metalness: 0,
    })
  );
  grassCap.position.y = 0.02;
  grassCap.castShadow = true;
  grassCap.receiveShadow = true;
  island.add(grassCap);

  const grassEdge = new THREE.Mesh(
    new THREE.CylinderGeometry(14.0, 14.4, 0.18, 40, 1),
    new THREE.MeshStandardMaterial({
      color: THEME.grassDeep,
      roughness: 1,
      metalness: 0,
    })
  );
  grassEdge.position.y = 0.18;
  grassEdge.castShadow = true;
  grassEdge.receiveShadow = true;
  island.add(grassEdge);

  const grass = createIslandGrass();
  grass.position.y = 0.18;
  island.add(grass);

  const clearing = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 24),
    new THREE.MeshStandardMaterial({
      color: THEME.soilLight,
      roughness: 1,
      metalness: 0,
    })
  );
  clearing.rotation.x = -Math.PI / 2;
  clearing.position.y = 0.195;
  clearing.receiveShadow = true;
  island.add(clearing);

  return island;
}

