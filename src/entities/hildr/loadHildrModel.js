import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "./assets/models/shieldmaiden_rigged.glb";

function applyBestUprightRotation(model) {
  const candidates = [
    new THREE.Euler(0, 0, 0),
    new THREE.Euler(Math.PI / 2, 0, 0),
    new THREE.Euler(-Math.PI / 2, 0, 0),
    new THREE.Euler(Math.PI, 0, 0),
    new THREE.Euler(0, 0, Math.PI / 2),
    new THREE.Euler(0, 0, -Math.PI / 2),
  ];

  let best = candidates[0];
  let bestHeight = -Infinity;

  for (const rot of candidates) {
    model.rotation.copy(rot);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.y > bestHeight) {
      bestHeight = size.y;
      best = rot.clone();
    }
  }

  model.rotation.copy(best);
}

function placeModelOnGround(model) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  model.position.y -= box.min.y;
}

function normalizeModelHeight(model, targetHeight = 2.7) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y > 0) {
    model.scale.multiplyScalar(targetHeight / size.y);
  }
}

function findActionName(actions, preferredNames) {
  const names = Object.keys(actions);
  for (const preferredName of preferredNames) {
    const exact = names.find((name) => name.toLowerCase() === preferredName.toLowerCase());
    if (exact) return exact;
  }

  for (const preferredName of preferredNames) {
    const partial = names.find((name) => name.toLowerCase().includes(preferredName.toLowerCase()));
    if (partial) return partial;
  }

  return names[0] ?? null;
}

function attachAnimationController(root, model, animations) {
  if (animations.length === 0) return;

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};

  for (const clip of animations) {
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.enabled = true;
    actions[clip.name] = action;
  }

  let activeAction = null;
  let activeAnimationName = null;

  const playAnimation = (preferredName, fadeSeconds = 0.18) => {
    const actionName = findActionName(actions, [preferredName, "IdleBreath", "Idle"]);
    if (!actionName) return;

    const nextAction = actions[actionName];
    if (nextAction === activeAction) return;

    nextAction.reset().setEffectiveWeight(1).fadeIn(fadeSeconds).play();
    if (activeAction) {
      activeAction.fadeOut(fadeSeconds);
    }

    activeAction = nextAction;
    activeAnimationName = actionName;
    root.userData.activeAction = activeAction;
    root.userData.activeAnimationName = activeAnimationName;
  };

  root.userData.mixer = mixer;
  root.userData.animations = animations;
  root.userData.animationNames = Object.keys(actions);
  root.userData.setAnimation = playAnimation;
  root.userData.setAnimationTimeScale = (timeScale) => {
    if (activeAction) {
      activeAction.timeScale = timeScale;
    }
  };

  playAnimation("IdleBreath", 0);
}

export async function loadHildrModel() {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(MODEL_URL);
  const model = gltf.scene;

  model.scale.setScalar(1);
  model.position.set(0, 0, 0);
  applyBestUprightRotation(model);
  normalizeModelHeight(model);
  placeModelOnGround(model);
  model.rotation.y += Math.PI;

  model.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    if (obj.material) {
      obj.material.side = THREE.DoubleSide;
      obj.material.needsUpdate = true;
    }
  });

  const root = new THREE.Group();
  root.add(model);
  attachAnimationController(root, model, gltf.animations);
  return root;
}
