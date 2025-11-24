// client/JS/three/components/IconButton3D.js

import * as THREE from 'three';
import { createGlowMaterial } from '../materials/glowMaterial.js';

/**
 * 3D Icon Button - Minimal rotating glyph with hover particles
 * Optimized for performance
 */
export class IconButton3D {
  constructor(containerId, configOrColor) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`[IconButton3D] Container not found: ${containerId}`);
      return;
    }

    // Handle config object or legacy color argument
    if (typeof configOrColor === 'object') {
      this.config = configOrColor;
      this.color = this.config.color || 0x00d9ff;
    } else {
      this.config = { type: 'glyph' };
      this.color = configOrColor || 0x00d9ff;
    }

    this.isHovered = false;
    this.time = 0;

    this.init();
  }

  init() {
    // Create mini scene
    const size = this.config.containerSize || 60; // Configurable size, default 60px
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
      antialias: true // Enable antialias for smoother images
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

    // Create Icon based on type
    if (this.config.type === 'image' && this.config.texturePath) {
      this.createImageIcon(this.config.texturePath);
    } else {
      this.createGlyph();
    }

    // Particle ring (hover only)
    this.createParticles();

    // Start animation
    this.animate();
  }

  createImageIcon(path) {
    const loader = new THREE.TextureLoader();
    loader.load(path, (texture) => {
      // Create a plane for the image
      const iconSize = this.config.size || 24; // Default to smaller size (was 32)
      const geometry = new THREE.PlaneGeometry(iconSize, iconSize);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        color: 0xffffff, // Tint if needed, or keep white
        blending: this.config.blending || THREE.NormalBlending,
        depthWrite: false
      });
      
      this.iconMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.iconMesh);
    });
  }

  createGlyph() {
    // Simple low-poly icosahedron (12 vertices)
    const geometry = new THREE.IcosahedronGeometry(8, 0);
    this.iconMesh = new THREE.Mesh(geometry, this.glowMaterial);
    this.scene.add(this.iconMesh);
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

    // Animate icon mesh only on hover
    if (this.iconMesh && this.isHovered) {
      if (this.config.type === 'image') {
        // Very subtle float for image icons on hover only
        this.iconMesh.position.y = Math.sin(this.time * 1.5) * 0.5;
      } else {
        // Subtle rotation for glyph icons on hover only
        this.iconMesh.rotation.x += 0.002;
        this.iconMesh.rotation.y += 0.003;
      }
    } else if (this.iconMesh) {
      // Reset position when not hovered
      this.iconMesh.position.y *= 0.9; // Smooth return to center
    }

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
