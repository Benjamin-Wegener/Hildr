import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import * as THREE from "three";

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.1 },
    darkness: { value: 1.25 },
    tint: { value: new THREE.Vector3(0.96, 1.0, 1.04) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    uniform vec3 tint;
    varying vec2 vUv;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = smoothstep(0.95, 0.2, dot(uv, uv));
      color.rgb *= mix(vec3(1.0 - darkness * 0.22), vec3(1.0), vignette);
      color.rgb *= tint;
      gl_FragColor = color;
    }
  `,
};

export function setupPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.35,
    0.5,
    0.82
  );
  composer.addPass(bloomPass);

  const vignettePass = new ShaderPass(VignetteShader);
  composer.addPass(vignettePass);

  return composer;
}
