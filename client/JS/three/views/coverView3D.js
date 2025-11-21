// client/JS/three/views/coverView3D.js

import * as THREE from 'three';
import { SigilFactory } from '../sigils/sigilFactory.js';
import { createStoneMaterial } from '../materials/stoneMaterial.js';
import { createParticleGlowMaterial } from '../materials/glowMaterial.js';

/**
 * CoverView3D - The closed Grimora book with a central sigil.
 * Shows when app first opens.
 */
export class CoverView3D {
  /**
   * @param {SceneManager} sceneManager
   */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;
    
    this.group = new THREE.Group();
    this.bookGroup = new THREE.Group();
    
    this.leftCover = null;
    this.rightCover = null;
    this.spine = null;
    this.centralSigil = null;
    this.particles = null;
    
    this.isVisible = false;
    
    this.init();
  }
  
  /**
   * Initialize the cover view - closed book.
   */
  init() {
    const bookWidth = 3;
    const bookHeight = 4;
    const bookDepth = 0.3;
    
    // Create book covers and spine
    const coverMaterial = createStoneMaterial({ 
      roughness: 0.85,
      color: 0x1a1a1a 
    });
    
    // Left cover (closed position)
    const leftCoverGeom = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
    this.leftCover = new THREE.Mesh(leftCoverGeom, coverMaterial);
    this.leftCover.position.x = -bookWidth / 2 - 0.05;
    this.bookGroup.add(this.leftCover);
    
    // Right cover (closed position)
    const rightCoverGeom = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
    this.rightCover = new THREE.Mesh(rightCoverGeom, coverMaterial);
    this.rightCover.position.x = bookWidth / 2 + 0.05;
    this.bookGroup.add(this.rightCover);
    
    // Spine in the middle
    const spineGeom = new THREE.BoxGeometry(0.3, bookHeight, bookDepth);
    this.spine = new THREE.Mesh(spineGeom, coverMaterial);
    this.bookGroup.add(this.spine);
    
    // Add embossed title on right cover
    this.addBookTitle();
    
    this.group.add(this.bookGroup);
    
    // Central sigil (centered in front of camera)
    this.centralSigil = SigilFactory.createSigil('math', { 
      size: 2.5, 
      animated: true 
    });
    this.centralSigil.position.set(0, 0, 0.6);
    this.group.add(this.centralSigil);
    
    // Add ambient particles
    this.addAmbientParticles();
    
    // Position group
    this.group.position.set(0, 0, 0);
    
    // Initially hide
    this.group.visible = false;
  }
  
  /**
   * Add embossed title on book cover
   */
  addBookTitle() {
    // Simple geometric representation of "GRIMORA"
    const glowMat = createStoneMaterial({ 
      color: 0x00d9ff,
      emissive: 0x00d9ff,
      emissiveIntensity: 0.3 
    });
    
    // Title decoration (simple glowing line)
    const titleGeom = new THREE.BoxGeometry(1.5, 0.05, 0.05);
    const titleLine = new THREE.Mesh(titleGeom, glowMat);
    titleLine.position.set(this.rightCover.position.x, 0, 0.2);
    this.bookGroup.add(titleLine);
  }
  
  /**
   * Add subtle floating particles for ambiance.
   */
  addAmbientParticles() {
    const particleCount = this.sceneManager.isMobile ? 20 : 30;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = createParticleGlowMaterial({
      color: 0x00d9ff,
      size: 0.05,
      opacity: 0.4
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }
  
  /**
   * Show the cover view.
   */
  async show() {
    this.isVisible = true;
    this.scene.add(this.group);
    this.group.visible = true;
    
    // Set scene manager's active view
    this.sceneManager.setActiveView(this);
    
    // Animate camera in
    await this.animateCameraIn();
  }
  
  /**
   * Hide the cover view with book opening animation.
   */
  async hide() {
    // Animate book opening
    await this.animateBookOpening();
    
    this.group.visible = false;
    this.isVisible = false;
  }
  
  /**
   * Animate book opening - covers rotate away from spine
   */
  async animateBookOpening() {
    return new Promise(resolve => {
      const duration = 1500;
      const startTime = Date.now();
      
      // Store initial rotation
      const startRotation = { left: 0, right: 0 };
      const endRotation = { left: -Math.PI * 0.55, right: Math.PI * 0.55 }; // ~100 degrees each
      
      // Sigil fades and moves up
      const startSigilY = this.centralSigil.position.y;
      const endSigilY = startSigilY + 2;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic for smooth opening
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Rotate covers around their inner edge (spine side)
        // Left cover pivots on right edge
        this.leftCover.rotation.y = startRotation.left + (endRotation.left - startRotation.left) * eased;
        
        // Right cover pivots on left edge  
        this.rightCover.rotation.y = startRotation.right + (endRotation.right - startRotation.right) * eased;
        
        // Fade and lift sigil
        this.centralSigil.position.y = startSigilY + (endSigilY - startSigilY) * eased;
        this.centralSigil.traverse((child) => {
          if (child.material && child.material.opacity !== undefined) {
            child.material.opacity = 1 - eased;
          }
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Animate camera into the cover view.
   */
  async animateCameraIn() {
    return new Promise((resolve) => {
      const duration = 2000;
      const startTime = Date.now();
      
      const startPosition = { ...this.sceneManager.camera.position };
      const endPosition = { x: 0, y: 0, z: 5 };
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);
        
        this.sceneManager.camera.position.x = startPosition.x + (endPosition.x - startPosition.x) * eased;
        this.sceneManager.camera.position.y = startPosition.y + (endPosition.y - startPosition.y) * eased;
        this.sceneManager.camera.position.z = startPosition.z + (endPosition.z - startPosition.z) * eased;
        
        this.sceneManager.camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Animate camera out from the cover view - synchronized with book opening.
   */
  async animateCameraOut() {
    return new Promise((resolve) => {
      const duration = 1500;
      const startTime = Date.now();
      
      const startPosition = { ...this.sceneManager.camera.position };
      const endPosition = { x: 0, y: 3, z: 10 }; // Pull back and up to see full open book
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutCubic(progress);
        
        this.sceneManager.camera.position.x = startPosition.x + (endPosition.x - startPosition.x) * eased;
        this.sceneManager.camera.position.y = startPosition.y + (endPosition.y - startPosition.y) * eased;
        this.sceneManager.camera.position.z = startPosition.z + (endPosition.z - startPosition.z) * eased;
        
        // Look slightly down at book as we pull back
        const lookAtY = -0.5 * eased;
        this.sceneManager.camera.lookAt(0, lookAtY, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Animate camera out.
   */
  async animateCameraOut() {
    return new Promise(resolve => {
      const startPos = { z: this.camera.position.z };
      const endPos = { z: 12 };
      const duration = 800;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in cubic
        const eased = Math.pow(progress, 3);
        
        this.camera.position.z = startPos.z + (endPos.z - startPos.z) * eased;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Update animation loop - rotate sigils.
   */
  update(deltaTime) {
    if (!this.isVisible) return;
    
    // Gentle rotation of central sigil
    if (this.centralSigil) {
      this.centralSigil.rotation.y += deltaTime * 0.5;
    }
    
    // Subtle particle movement if implemented
    if (this.particles) {
      this.particles.rotation.y += deltaTime * 0.1;
    }
  }
  
  /**
   * Easing function for smooth animations.
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
