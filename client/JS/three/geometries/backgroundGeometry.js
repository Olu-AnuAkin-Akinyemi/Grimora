// client/JS/three/geometries/backgroundGeometry.js

import * as THREE from 'three';
import { createGlowMaterial } from '../materials/glowMaterial.js';

/**
 * BackgroundGeometry - Custom optimized geometry for background sigil.
 * Creates a mystical ring design with glowing pulsing core.
 * Features dual rotating rings with subtle opacity pulsing.
 * Highly optimized for performance with WebGL fallback support.
 */
export class BackgroundGeometry {
  /**
   * Create optimized background geometry.
   * Simple pulsating glowing core sphere - minimal and clean.
   *
   * @param {Object} options
   * @param {number} [options.size=3] - Base size
   * @param {number} [options.color=0x00d9ff] - Primary color
   * @param {boolean} [options.mobile=false] - Mobile optimization mode
   * @returns {THREE.Group}
   */
  static create(options = {}) {
    const {
      size = 3,
      color = 0x00d9ff,
      mobile = false
    } = options;

    const group = new THREE.Group();

    // === GLOWING CORE SPHERE ===
    // Optimization: Use even simpler geometry on mobile
    const detail = mobile ? 0 : 1; // Lower detail on mobile
    const coreGeometry = new THREE.IcosahedronGeometry(size * 0.35, detail);
    const coreMaterial = createGlowMaterial({
      color: color,
      intensity: 1.2,
      pulse: true,
      pulseSpeed: 0.3
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.frustumCulled = true; // Optimization: enable frustum culling
    group.add(core);

    // === PARTICLES WITH GREEN/CYAN GRADIENT ===
    const particleCount = 8; // Reduced from 20
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Gradient from green to cyan
      const t = i / particleCount;
      const particleColor = new THREE.Color();
      particleColor.lerpColors(
        new THREE.Color(0x00ff88), // Green
        new THREE.Color(0x00d9ff), // Cyan
        t
      );
      
      const particleGeometry = new THREE.CircleGeometry(size * 0.02, 6);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: particleColor,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.frustumCulled = true; // Optimization
      
      // Random position in sphere
      const radius = size * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particle.userData = {
        baseRadius: radius,
        theta: theta,
        phi: phi,
        speed: 0.2 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2
      };
      
      particles.push(particle);
      group.add(particle);
    }

    // Store references for animation
    group.userData.core = core;
    group.userData.particles = particles;
    group.userData.isMobile = mobile;
    group.userData.baseColor = new THREE.Color(color);

    return group;

    // === OPTION 2: SEED OF LIFE - SACRED GEOMETRY PATTERN (COMMENTED OUT) ===
    // Seven overlapping circles representing creation, balance (Ma'at), and unity
    // Central circle + 6 surrounding circles (Vesica Piscis pattern)

    // const circleRadius = size * 0.25;
    // const segments = mobile ? 32 : 64;

    // // Create glowing material for circle rings
    // const ringMaterial = new THREE.MeshBasicMaterial({
    //   color: color,
    //   transparent: true,
    //   opacity: 0.6,
    //   side: THREE.DoubleSide,
    //   blending: THREE.AdditiveBlending
    // });

    // // Helper to create a glowing circle ring using TorusGeometry
    // const createCircleRing = (x, y, z = 0) => {
    //   // Use torus with very small tube radius to create a glowing ring
    //   const torus = new THREE.TorusGeometry(
    //     circleRadius,        // radius of the circle
    //     size * 0.005,       // tube thickness (much thinner)
    //     mobile ? 6 : 12,    // radial segments (fewer for thinner look)
    //     segments            // tubular segments
    //   );

    //   const ring = new THREE.Mesh(torus, ringMaterial);
    //   ring.position.set(x, y, z);
    //   return ring;
    // };

    // // Center circle
    // const centerCircle = createCircleRing(0, 0, 0);
    // group.add(centerCircle);

    // // Six surrounding circles (Seed of Life pattern)
    // const angleStep = (Math.PI * 2) / 6;
    // const allCircles = [centerCircle];

    // for (let i = 0; i < 6; i++) {
    //   const angle = angleStep * i;
    //   const x = Math.cos(angle) * circleRadius;
    //   const y = Math.sin(angle) * circleRadius;
    //   const circle = createCircleRing(x, y, 0);
    //   group.add(circle);
    //   allCircles.push(circle);
    // }

    // // Add glowing core at center for depth
    // const coreGeo = new THREE.SphereGeometry(size * 0.08, mobile ? 8 : 16);
    // const coreMat = createGlowMaterial({
    //   color: color,
    //   intensity: 1.5,
    //   pulse: true,
    //   pulseSpeed: 0.3
    // });
    // const coreOrb = new THREE.Mesh(coreGeo, coreMat);
    // group.add(coreOrb);

    // // Store references for animation
    // group.userData.circles = allCircles;
    // group.userData.coreOrb = coreOrb;
    // group.userData.isMobile = mobile;
    // group.userData.baseColor = new THREE.Color(color);

    // return group;
  }

  /**
   * Animate the glowing orb with particles.
   * Call this in the update loop.
   *
   * @param {THREE.Group} group - The group returned by create()
   * @param {number} delta - Time since last frame
   */
  static animate(group, delta) {
    const { core, particles } = group.userData;

    // Subtle breathing/pulsing effect on the entire orb
    const time = Date.now() * 0.0003;
    const breathe = 1 + Math.sin(time) * 0.06;
    const baseScale = group.scale.x || 1;

    if (baseScale >= 0.9 && baseScale <= 1.1) {
      group.scale.set(breathe, breathe, breathe);
    }

    // Animate particles orbiting around the orb
    if (particles) {
      particles.forEach(particle => {
        const data = particle.userData;
        const t = time + data.offset;
        
        // Orbital motion
        const theta = data.theta + t * data.speed;
        const phi = data.phi + Math.sin(t * 0.5) * 0.2; // Subtle up/down wave
        
        const x = data.baseRadius * Math.sin(phi) * Math.cos(theta);
        const y = data.baseRadius * Math.sin(phi) * Math.sin(theta);
        const z = data.baseRadius * Math.cos(phi);
        
        particle.position.set(x, y, z);
        
        // Rotate particle to face camera
        particle.lookAt(0, 0, 0);
        
        // Subtle pulse
        const pulse = 0.8 + Math.sin(t * 2 + data.offset) * 0.2;
        particle.material.opacity = pulse * 0.6;
      });
    }
  }

  /**
   * Enable drag-to-rotate interaction on the geometry.
   * Call this after adding the group to the scene.
   *
   * @param {THREE.Group} group - The group to make draggable
   * @param {HTMLElement} domElement - The canvas element
   */
  static enableDragRotation(group, domElement) {
    if (!domElement) {
      console.warn('[BackgroundGeometry] No canvas element provided for drag rotation');
      return;
    }

    console.log('[BackgroundGeometry] Enabling drag rotation on:', domElement);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      domElement.style.cursor = 'grabbing';
      console.log('[BackgroundGeometry] Mouse down - dragging started');

      previousMousePosition = {
        x: e.clientX || e.touches?.[0]?.clientX || 0,
        y: e.clientY || e.touches?.[0]?.clientY || 0
      };
    };

    const onMouseMove = (e) => {
      if (!isDragging) {
        domElement.style.cursor = 'grab';
        return;
      }

      e.preventDefault();

      const currentMousePosition = {
        x: e.clientX || e.touches?.[0]?.clientX || 0,
        y: e.clientY || e.touches?.[0]?.clientY || 0
      };

      const deltaX = currentMousePosition.x - previousMousePosition.x;
      const deltaY = currentMousePosition.y - previousMousePosition.y;

      // Rotate based on mouse movement
      group.rotation.y += deltaX * 0.01; // Horizontal drag rotates Y axis
      group.rotation.x += deltaY * 0.01; // Vertical drag rotates X axis

      console.log('[BackgroundGeometry] Rotating:', { deltaX, deltaY, rotX: group.rotation.x, rotY: group.rotation.y });

      previousMousePosition = currentMousePosition;
    };

    const onMouseUp = () => {
      isDragging = false;
      domElement.style.cursor = 'grab';
      console.log('[BackgroundGeometry] Mouse up - dragging stopped');
    };

    // Set initial cursor
    domElement.style.cursor = 'grab';

    // Mouse events
    domElement.addEventListener('mousedown', onMouseDown, { passive: false });
    domElement.addEventListener('mousemove', onMouseMove, { passive: false });
    domElement.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('mouseleave', onMouseUp);

    // Touch events
    domElement.addEventListener('touchstart', onMouseDown, { passive: false });
    domElement.addEventListener('touchmove', onMouseMove, { passive: false });
    domElement.addEventListener('touchend', onMouseUp);

    console.log('[BackgroundGeometry] Drag rotation enabled');

    // Store cleanup function
    group.userData.cleanupDragRotation = () => {
      domElement.style.cursor = '';
      domElement.removeEventListener('mousedown', onMouseDown);
      domElement.removeEventListener('mousemove', onMouseMove);
      domElement.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('mouseleave', onMouseUp);
      domElement.removeEventListener('touchstart', onMouseDown);
      domElement.removeEventListener('touchmove', onMouseMove);
      domElement.removeEventListener('touchend', onMouseUp);
      console.log('[BackgroundGeometry] Drag rotation cleaned up');
    };
  }

  /**
   * Create a simpler fallback for low-end devices.
   * Just a glowing sphere - extremely lightweight.
   */
  static createFallback(size = 3, color = 0x00d9ff) {
    const group = new THREE.Group();

    // Core sphere only
    const coreGeometry = new THREE.SphereGeometry(size * 0.35, 8, 8);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    group.userData.core = core;
    group.userData.isFallback = true;

    return group;
  }

  /**
   * Animate fallback geometry.
   */
  static animateFallback(group, delta) {
    const { core } = group.userData;

    if (core) {
      core.rotation.y += delta * 0.08;
      core.rotation.x += delta * 0.05;
      core.rotation.z += delta * 0.03;
    }

    // Gentle pulse
    const time = Date.now() * 0.0003;
    const scale = 1 + Math.sin(time) * 0.06;
    group.scale.set(scale, scale, scale);
  }
}
