// client/JS/three/materials/stoneMaterial.js

import * as THREE from 'three';

/**
 * Create a stone/ancient material for Grimora book and surfaces.
 * Uses PBR (Physically Based Rendering) for realistic look.
 * Optimized for mobile with reasonable settings.
 * 
 * @param {Object} options
 * @param {number} [options.roughness=0.8] - Surface roughness (0-1)
 * @param {number} [options.metalness=0.1] - Metalness (0-1)
 * @param {THREE.Color|number} [options.color=0x2d2d2d] - Base color
 * @returns {THREE.MeshStandardMaterial}
 */
export function createStoneMaterial(options = {}) {
  const {
    roughness = 0.8,
    metalness = 0.1,
    color = 0x2d2d2d
  } = options;
  
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: roughness,
    metalness: metalness,
    
    // Slight emissive glow for magical feel
    emissive: 0x0a0a0a,
    emissiveIntensity: 0.1,
    
    // Performance: no need for high-res normals on mobile
    flatShading: false,
    
    // Ambient occlusion baked into material
    aoMapIntensity: 0.5
  });
  
  return material;
}

/**
 * Create a glowing edge/accent material.
 * Used for sigil outlines, borders, and magical elements.
 * 
 * @param {Object} options
 * @param {THREE.Color|number} [options.color=0x00d9ff] - Glow color
 * @param {number} [options.intensity=1.5] - Glow intensity
 * @param {boolean} [options.transparent=true] - Enable transparency
 * @param {number} [options.opacity=0.8] - Opacity (0-1)
 * @returns {THREE.MeshBasicMaterial}
 */
export function createGlowMaterial(options = {}) {
  const {
    color = 0x00d9ff,
    intensity = 1.5,
    transparent = true,
    opacity = 0.8
  } = options;
  
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: transparent,
    opacity: opacity,
    
    // Additive blending for glow effect
    blending: THREE.AdditiveBlending,
    
    // No depth write for glows (renders behind everything)
    depthWrite: false,
    
    // Side rendering
    side: THREE.DoubleSide
  });
  
  // Store intensity for animation
  material.userData.glowIntensity = intensity;
  
  return material;
}

/**
 * Create a holographic/iridescent material.
 * Used for special effects and advanced sigils.
 * More expensive - use sparingly on mobile.
 * 
 * @param {Object} options
 * @returns {THREE.ShaderMaterial}
 */
export function createHologramMaterial(options = {}) {
  const {
    color = 0x00d9ff,
    speed = 1.0
  } = options;
  
  // Custom shader for hologram effect
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  const fragmentShader = `
    uniform vec3 glowColor;
    uniform float time;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      // Fresnel effect
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      // Animated scan lines
      float scanline = sin(vViewPosition.y * 10.0 + time * 2.0) * 0.5 + 0.5;
      
      // Combine effects
      vec3 color = glowColor * (fresnel + scanline * 0.3);
      float alpha = fresnel * 0.8;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(color) },
      time: { value: 0.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  
  // Store animation speed
  material.userData.animSpeed = speed;
  material.userData.animate = (delta) => {
    material.uniforms.time.value += delta * speed;
  };
  
  return material;
}
