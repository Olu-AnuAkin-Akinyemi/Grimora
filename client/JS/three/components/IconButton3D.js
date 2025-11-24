// client/JS/three/components/IconButton3D.js

import * as THREE from 'three';
import { createGlowMaterial } from '../materials/glowMaterial.js';

/**
 * 3D Icon Button - Minimal rotating glyph with hover particles
 * Optimized for performance
 */
export class IconButton3D {
  constructor(containerId, color = 0x00d9ff) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`[IconButton3D] Container not found: ${containerId}`);
      return;
    }

    this.color = color;
    this.isHovered = false;
    this.time = 0;

    this.init();
  }

  init() {
    // Create mini scene
    const size = 60; // Match button size
    this.scene = new THREE.Scene();
    
    // Camera
    this.camera = new THREE.OrthographicCamera(
      -size / 2, size / 2,
      size / 2, -size / 2,
      1, 100
    );
    this.camera.position.z = 50;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false // Optimization
    });
    this.renderer.setSize(size, size);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.pointerEvents = 'none';
    this.container.appendChild(this.renderer.domElement);

    // Shared material (optimization)
    this.glowMaterial = createGlowMaterial({
      color: this.color,
      intensity: 0.8,
      pulse: false
    });

    // Central rotating glyph (always visible)
    this.createGlyph();

    // Particle ring (hover only)
    this.createParticles();

    // Start animation
    this.animate();
  }

  createGlyph() {
    // Simple low-poly icosahedron (12 vertices)
    const geometry = new THREE.IcosahedronGeometry(8, 0);
    this.glyph = new THREE.Mesh(geometry, this.glowMaterial);
    this.scene.add(this.glyph);
  }

  createParticles() {
    this.particles = [];
    const particleCount = 4;
    const radius = 20;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.CircleGeometry(1.5, 6);
      const particle = new THREE.Mesh(geometry, this.glowMaterial.clone());
      particle.material.transparent = true;
      particle.material.opacity = 0; // Hidden by default
      
      const angle = (Math.PI * 2 / particleCount) * i;
      particle.userData = {
        baseAngle: angle,
        radius: radius,
        speed: 0.5 + Math.random() * 0.3
      };
      
      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  setHovered(hovered) {
    this.isHovered = hovered;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time += 0.016; // ~60fps

    // Rotate glyph slower and more subtly
    this.glyph.rotation.x += 0.003; // Reduced from 0.01
    this.glyph.rotation.y += 0.005; // Reduced from 0.015

    // Animate particles (only on hover)
    if (this.isHovered) {
      this.particles.forEach(particle => {
        const data = particle.userData;
        const angle = data.baseAngle + this.time * data.speed;
        
        particle.position.x = Math.cos(angle) * data.radius;
        particle.position.y = Math.sin(angle) * data.radius;
        
        // Fade in
        if (particle.material.opacity < 0.8) {
          particle.material.opacity += 0.05;
        }
      });
    } else {
      // Fade out particles
      this.particles.forEach(particle => {
        if (particle.material.opacity > 0) {
          particle.material.opacity -= 0.05;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  cleanup() {
    this.scene.clear();
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
