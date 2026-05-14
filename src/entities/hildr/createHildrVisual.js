import * as THREE from "three";

function createBraid(material) {
  const braid = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), material);
    knot.position.set(0, 2.7 - i * 0.14, -0.18 - i * 0.03);
    braid.add(knot);
  }
  return braid;
}

function createCape(material) {
  const group = new THREE.Group();
  const backCape = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 2.8, 2, 8),
    material
  );
  backCape.position.set(0.35, 1.55, -0.48);
  backCape.rotation.y = -0.14;
  group.add(backCape);

  const sideCape = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 2.4, 1, 6),
    material
  );
  sideCape.position.set(0.78, 1.45, -0.1);
  sideCape.rotation.y = -0.45;
  group.add(sideCape);

  return group;
}

export function createHildrVisual() {
  const group = new THREE.Group();
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xd2aa84, roughness: 0.88 });
  const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x4b342a, roughness: 0.88, metalness: 0.1 });
  const furMaterial = new THREE.MeshStandardMaterial({ color: 0xb8a07e, roughness: 0.98 });
  const capeMaterial = new THREE.MeshStandardMaterial({ color: 0xc32727, roughness: 0.7, side: THREE.DoubleSide });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: 0xd9b06a, roughness: 0.7, metalness: 0.1 });
  const steelMaterial = new THREE.MeshStandardMaterial({ color: 0x8e949d, roughness: 0.35, metalness: 0.8 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.55, 8, 14), leatherMaterial);
  torso.position.y = 1.72;
  group.add(torso);

  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), furMaterial);
  shoulderL.position.set(-0.42, 2.3, 0.02);
  group.add(shoulderL);

  const shoulderR = shoulderL.clone();
  shoulderR.position.x = 0.42;
  group.add(shoulderR);

  const furCollar = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.14, 12, 24), furMaterial);
  furCollar.position.set(0, 2.48, 0.02);
  furCollar.rotation.x = Math.PI / 2;
  group.add(furCollar);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 16), skinMaterial);
  head.position.set(0, 2.92, 0.02);
  group.add(head);

  const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMaterial);
  hairTop.position.set(0, 3.0, -0.03);
  group.add(hairTop);
  group.add(createBraid(hairMaterial));

  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.78, 6, 10), leatherMaterial);
  armL.position.set(-0.58, 1.85, -0.02);
  armL.rotation.z = 0.18;
  group.add(armL);

  const armR = armL.clone();
  armR.position.x = 0.58;
  armR.rotation.z = -0.18;
  group.add(armR);

  const bracerL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.085, 0.25, 10), steelMaterial);
  bracerL.position.set(-0.62, 1.5, 0.0);
  group.add(bracerL);
  const bracerR = bracerL.clone();
  bracerR.position.x = 0.62;
  group.add(bracerR);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.06, 10, 24), steelMaterial);
  belt.position.set(0, 1.2, 0);
  belt.rotation.x = Math.PI / 2;
  group.add(belt);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.105, 1.05, 10), leatherMaterial);
  leftLeg.position.set(-0.17, 0.62, 0);
  group.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.x = 0.17;
  group.add(rightLeg);

  const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.4), leatherMaterial);
  bootL.position.set(-0.17, 0.07, 0.08);
  group.add(bootL);
  const bootR = bootL.clone();
  bootR.position.x = 0.17;
  group.add(bootR);

  const sword = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.9, 0.08), steelMaterial);
  blade.position.y = -0.2;
  sword.add(blade);
  const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.08), steelMaterial);
  hilt.position.y = 0.27;
  sword.add(hilt);
  sword.position.set(0.35, 1.25, -0.23);
  sword.rotation.set(0.2, -0.2, 0.7);
  group.add(sword);

  group.add(createCape(capeMaterial));

  group.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  group.rotation.y = Math.PI;
  return group;
}
