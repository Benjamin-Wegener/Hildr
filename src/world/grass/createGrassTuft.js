import * as THREE from "three";
import { createGrassBlade } from "./createGrassBlade.js";
import { range } from "./random.js";

export function createGrassTuft(rng) {
  const tuft = new THREE.Group();
  const phase = range(rng, 0, Math.PI * 2);

  const rootBone = new THREE.Bone();
  const midBone = new THREE.Bone();
  const tipBone = new THREE.Bone();
  rootBone.name = "GrassRoot";
  midBone.name = "GrassMid";
  tipBone.name = "GrassTip";
  rootBone.add(midBone);
  midBone.add(tipBone);
  midBone.position.y = 0.38;
  tipBone.position.y = 0.34;
  tuft.add(rootBone);

  const upperBlade = createGrassBlade(rng, {
    height: range(rng, 0.72, 1.2),
    width: range(rng, 0.045, 0.075),
    thickness: range(rng, 0.016, 0.024),
    bendX: range(rng, -0.14, 0.14),
    bendZ: range(rng, -0.14, 0.14),
    twist: range(rng, 0, Math.PI * 2),
  });
  const midBlade = createGrassBlade(rng, {
    height: range(rng, 0.5, 0.92),
    width: range(rng, 0.035, 0.06),
    thickness: range(rng, 0.014, 0.022),
    bendX: range(rng, -0.12, 0.12),
    bendZ: range(rng, -0.12, 0.12),
    twist: range(rng, 0, Math.PI * 2),
  });
  const lowBlade = createGrassBlade(rng, {
    height: range(rng, 0.42, 0.78),
    width: range(rng, 0.03, 0.055),
    thickness: range(rng, 0.012, 0.02),
    bendX: range(rng, -0.1, 0.1),
    bendZ: range(rng, -0.1, 0.1),
    twist: range(rng, 0, Math.PI * 2),
  });

  lowBlade.position.set(range(rng, -0.04, 0.04), 0, range(rng, -0.04, 0.04));
  midBlade.position.set(range(rng, -0.03, 0.03), 0, range(rng, -0.03, 0.03));
  upperBlade.position.set(range(rng, -0.02, 0.02), 0, range(rng, -0.02, 0.02));

  lowBlade.rotation.x = range(rng, -0.1, 0.1);
  lowBlade.rotation.z = range(rng, -0.1, 0.1);
  midBlade.rotation.x = range(rng, -0.12, 0.12);
  midBlade.rotation.z = range(rng, -0.12, 0.12);
  upperBlade.rotation.x = range(rng, -0.16, 0.16);
  upperBlade.rotation.z = range(rng, -0.16, 0.16);

  rootBone.add(lowBlade);
  midBone.add(midBlade);
  tipBone.add(upperBlade);

  tuft.rotation.y = range(rng, 0, Math.PI * 2);
  tuft.scale.setScalar(range(rng, 0.82, 1.02));
  tuft.userData.phase = phase;
  tuft.userData.rootBone = rootBone;
  tuft.userData.midBone = midBone;
  tuft.userData.tipBone = tipBone;
  tuft.userData.update = (time) => {
    const windA = Math.sin(time * 0.85 + phase) * 0.12;
    const windB = Math.sin(time * 1.35 + phase * 1.7) * 0.18;
    const windC = Math.sin(time * 1.9 + phase * 2.3) * 0.24;
    rootBone.rotation.z = windA * 0.45;
    rootBone.rotation.x = Math.cos(time * 0.6 + phase) * 0.04;
    midBone.rotation.z = windB * 0.7;
    midBone.rotation.x = Math.sin(time * 0.95 + phase * 0.6) * 0.05;
    tipBone.rotation.z = windC * 1.0;
    tipBone.rotation.x = Math.sin(time * 1.25 + phase * 0.85) * 0.06;
  };

  return tuft;
}
