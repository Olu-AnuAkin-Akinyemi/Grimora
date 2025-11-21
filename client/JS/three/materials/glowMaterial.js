// client/JS/three/materials/glowMaterial.js

import * as THREE from 'three';

/**
 * Enhanced glow material with pulsing animation support.
 * Optimized for magical sigil effects.
 * 
 * @param {Object} options
 * @param {THREE.Color|number} [options.color=0x00d9ff] - Glow color
 * @param {number} [options.intensity=1.0] - Base intensity
 * @param {boolean} [options.pulse=false] - Enable pulsing animation
 * @param {number} [options.pulseSpeed=1.0] - Pulse speed multiplier
 * @returns {THREE.MeshBasicMaterial}
 */
export function createGlowMaterial(options = {}) {
  const {
    color = 0x00d9ff,
    intensity = 1.0,
    pulse = false,
    pulseSpeed = 1.0
  } = options;
  
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  // Store animation data
  material.userData.baseIntensity = intensity;
  material.userData.pulse = pulse;
  material.userData.pulseSpeed = pulseSpeed;
  material.userData.time = 0;
  
  // Animation function
  if (pulse) {
    material.userData.animate = (delta) => {
      material.userData.time += delta * pulseSpeed;
      const pulseValue = Math.sin(material.userData.time * 2) * 0.3 + 0.7;
      material.opacity = pulseValue * 0.7;
    };
  }
  
  return material;
}

/**
 * Create a particle glow material for ambient effects.
 * Very lightweight for mobile performance.
 * 
 * @param {Object} options
 * @param {number} [options.color=0x00d9ff] - Particle color
 * @param {number} [options.size=0.05] - Particle size
 * @param {number} [options.opacity=0.6] - Base opacity
 * @returns {THREE.PointsMaterial}
 */
export function createParticleGlowMaterial(options = {}) {
  const {
    color = 0x00d9ff,
    size = 0.05,
    opacity = 0.6
  } = options;
  
  return new THREE.PointsMaterial({
    color: color,
    size: size,
    transparent: true,
    opacity: opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true // Particles get smaller with distance
  });
}

/**
 * Create an animated shader glow material.
 * More expensive - use for hero elements only.
 * 
 * @param {Object} options
 * @returns {THREE.ShaderMaterial}
 */
export function createAnimatedGlowMaterial(options = {}) {
  const {
    color = 0x00d9ff,
    speed = 1.0,
    waveIntensity = 0.3
  } = options;
  
  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
  
  const fragmentShader = `
    uniform vec3 color;
    uniform float time;
    uniform float waveIntensity;
    
    varying vec2 vUv;
    
    void main() {
      // Create wave pattern
      float wave = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time * 0.7);
      wave = wave * waveIntensity + (1.0 - waveIntensity);
      
      // Edge glow (brighter at edges)
      float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      float edgeGlow = 1.0 - smoothstep(0.0, 0.3, edgeDist);
      
      // Combine effects
      vec3 finalColor = color * (wave + edgeGlow * 0.5);
      float alpha = (wave * 0.5 + 0.5) * (1.0 - edgeDist * 0.5);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      time: { value: 0.0 },
      waveIntensity: { value: waveIntensity }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  material.userData.animSpeed = speed;
  material.userData.animate = (delta) => {
    material.uniforms.time.value += delta * speed;
  };
  
  return material;
}
