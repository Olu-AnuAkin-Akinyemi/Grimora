// client/JS/three/sigils/sigilFactory.js

import * as THREE from 'three';
import { createGlowMaterial } from '../materials/glowMaterial.js';

/**
 * SigilFactory - Creates animated 3D sigils for each content track.
 * Optimized for mobile performance with LOD support.
 */
export class SigilFactory {
  
  /**
   * Create a sigil based on track type.
   * 
   * @param {string} type - Track type: 'math', 'chem', 'lore', 'physeng'
   * @param {Object} options
   * @param {number} [options.size=1] - Base size
   * @param {boolean} [options.animated=true] - Enable rotation animation
   * @param {number} [options.color] - Override default color
   * @returns {THREE.Group}
   */
  static createSigil(type, options = {}) {
    const {
      size = 1,
      animated = true,
      color
    } = options;
    
    let sigil;
    
    switch (type) {
      case 'math':
        sigil = this.createMathSigil(size, color || 0x00d9ff);
        break;
      case 'chem':
        sigil = this.createChemSigil(size, color || 0xff6b35);
        break;
      case 'lore':
        sigil = this.createLoreSigil(size, color || 0xffd700);
        break;
      case 'physeng':
        sigil = this.createPhysEngSigil(size, color || 0x00ff88);
        break;
      default:
        sigil = this.createDefaultSigil(size, color || 0x00d9ff);
    }
    
    // Add animation if enabled
    if (animated) {
      sigil.userData.animate = (delta) => {
        sigil.rotation.y += delta * 0.5;
        sigil.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
      };
    }
    
    return sigil;
  }
  
  /**
   * Math Sanctum sigil - Torus knot (represents interconnected operations)
   */
  static createMathSigil(size, color) {
    const group = new THREE.Group();
    
    // Main torus knot
    const geometry = new THREE.TorusKnotGeometry(
      size * 0.5,  // radius
      size * 0.15, // tube
      64,          // tubular segments (reduce for mobile)
      8,           // radial segments
      2,           // p parameter
      3            // q parameter
    );
    
    const material = createGlowMaterial({
      color: color,
      pulse: true,
      pulseSpeed: 0.8
    });
    
    const knot = new THREE.Mesh(geometry, material);
    group.add(knot);
    
    // Add inner glow sphere
    const glowGeometry = new THREE.SphereGeometry(size * 0.3, 16, 16);
    const glowMaterial = createGlowMaterial({
      color: color,
      intensity: 0.5,
      pulse: true,
      pulseSpeed: 1.2
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    return group;
  }
  
  /**
   * Matter Lab sigil - Octahedron (represents molecular structure)
   */
  static createChemSigil(size, color) {
    const group = new THREE.Group();
    
    // Main octahedron
    const geometry = new THREE.OctahedronGeometry(size * 0.6, 0);
    const material = createGlowMaterial({
      color: color,
      pulse: true,
      pulseSpeed: 1.0
    });
    
    const octahedron = new THREE.Mesh(geometry, material);
    group.add(octahedron);
    
    // Add orbiting particles (electrons)
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = size * 0.8;
      
      const particleGeom = new THREE.SphereGeometry(size * 0.08, 8, 8);
      const particleMat = createGlowMaterial({ color: color });
      const particle = new THREE.Mesh(particleGeom, particleMat);
      
      particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.3,
        Math.sin(angle) * radius
      );
      
      group.add(particle);
    }
    
    return group;
  }
  
  /**
   * Hall of Ma'at sigil - Feather (Ma'at's symbol of balance)
   */
  static createLoreSigil(size, color) {
    const group = new THREE.Group();
    
    // Create feather shape using cylinders and spheres
    // Central shaft
    const shaftGeom = new THREE.CylinderGeometry(
      size * 0.05,
      size * 0.05,
      size * 1.2,
      8
    );
    const shaftMat = createGlowMaterial({ color: color });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    group.add(shaft);
    
    // Feather barbs (simplified as flat triangles)
    const barbCount = 6;
    for (let i = 0; i < barbCount; i++) {
      const yPos = (i / barbCount - 0.5) * size * 1.0;
      const barbSize = size * 0.3 * (1 - Math.abs(i - barbCount/2) / barbCount);
      
      const barbGeom = new THREE.ConeGeometry(barbSize, size * 0.15, 3);
      const barbMat = createGlowMaterial({ color: color, opacity: 0.6 });
      
      const leftBarb = new THREE.Mesh(barbGeom, barbMat);
      leftBarb.rotation.z = Math.PI / 2;
      leftBarb.position.set(-barbSize / 2, yPos, 0);
      group.add(leftBarb);
      
      const rightBarb = new THREE.Mesh(barbGeom, barbMat);
      rightBarb.rotation.z = -Math.PI / 2;
      rightBarb.position.set(barbSize / 2, yPos, 0);
      group.add(rightBarb);
    }
    
    return group;
  }
  
  /**
   * Machina Workshop sigil - Gear/cog (represents mechanical systems)
   */
  static createPhysEngSigil(size, color) {
    const group = new THREE.Group();
    
    // Create gear shape
    const gearRadius = size * 0.6;
    const toothCount = 8;
    const shape = new THREE.Shape();
    
    // Draw gear outline
    for (let i = 0; i <= toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const nextAngle = ((i + 0.5) / toothCount) * Math.PI * 2;
      
      // Inner circle point
      const innerX = Math.cos(angle) * gearRadius * 0.7;
      const innerY = Math.sin(angle) * gearRadius * 0.7;
      
      // Outer tooth point
      const outerX = Math.cos(nextAngle) * gearRadius;
      const outerY = Math.sin(nextAngle) * gearRadius;
      
      if (i === 0) {
        shape.moveTo(innerX, innerY);
      } else {
        shape.lineTo(innerX, innerY);
      }
      
      shape.lineTo(outerX, outerY);
    }
    
    const extrudeSettings = {
      depth: size * 0.2,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = createGlowMaterial({
      color: color,
      pulse: true,
      pulseSpeed: 0.6
    });
    
    const gear = new THREE.Mesh(geometry, material);
    gear.position.z = -size * 0.1;
    group.add(gear);
    
    // Add center hole
    const holeGeom = new THREE.TorusGeometry(size * 0.25, size * 0.08, 8, 16);
    const holeMat = createGlowMaterial({ color: color, intensity: 1.5 });
    const hole = new THREE.Mesh(holeGeom, holeMat);
    group.add(hole);
    
    return group;
  }
  
  /**
   * Default/fallback sigil - Simple rotating ring
   */
  static createDefaultSigil(size, color) {
    const group = new THREE.Group();
    
    const geometry = new THREE.TorusGeometry(size * 0.5, size * 0.1, 16, 32);
    const material = createGlowMaterial({ color: color, pulse: true });
    
    const torus = new THREE.Mesh(geometry, material);
    group.add(torus);
    
    return group;
  }
}
