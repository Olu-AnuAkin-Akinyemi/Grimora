// client/JS/three/views/mainView3D.js

import * as THREE from 'three';
import { BackgroundGeometry } from '../geometries/backgroundGeometry.js';

/**
 * MainView3D - Background sigil view after book opens.
 * Shows large rotating custom background geometry.
 */
export class MainView3D {
  /**
   * @param {SceneManager} sceneManager
   */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.camera = sceneManager.camera;

    this.group = new THREE.Group();
    this.backgroundSigil = null;

    this.isVisible = false;

    this.init();
  }

  /**
   * Initialize the main view.
   */
  init() {
    const isMobile = this.sceneManager.isMobile;

    // Create optimized custom background geometry
    // Falls back to simpler version on low-end devices
    try {
      this.backgroundSigil = BackgroundGeometry.create({
        size: 3.5,
        color: 0x88dd66,  // Warm yellow-green (was 0x00d9ff)
        mobile: isMobile
      });
    } catch (error) {
      console.warn('[MainView3D] Using fallback geometry:', error);
      this.backgroundSigil = BackgroundGeometry.createFallback(3.5, 0x88dd66);
    }

    this.backgroundSigil.position.set(0, 0, -2); // Push back for background effect
    this.group.add(this.backgroundSigil);

    // Enable drag-to-rotate interaction
    const canvas = this.sceneManager.renderer.domElement;
    BackgroundGeometry.enableDragRotation(this.backgroundSigil, canvas);

    // Position group
    this.group.position.set(0, 0, 0);

    // Initially hide
    this.group.visible = false;
  }
  
  /**
   * Show the main view.
   */
  async show() {
    this.isVisible = true;
    this.scene.add(this.group);
    this.group.visible = true;
    
    // Set scene manager's active view
    this.sceneManager.setActiveView(this);
    
    // Position camera
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Fade in
    await this.animateIn();
  }
  
  /**
   * Hide the main view.
   */
  async hide() {
    // Cleanup drag rotation listeners
    if (this.backgroundSigil?.userData?.cleanupDragRotation) {
      this.backgroundSigil.userData.cleanupDragRotation();
    }

    this.group.visible = false;
    this.isVisible = false;
  }
  
  /**
   * Animate in the main view - ultra smooth scale up and fade-in.
   */
  async animateIn() {
    return new Promise(resolve => {
      const delay = 200; // Slight delay before appearing
      const duration = 1000; // Longer, gentler duration
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime - delay;

        // Don't start until after delay
        if (elapsed < 0) {
          requestAnimationFrame(animate);
          return;
        }

        const progress = Math.min(elapsed / duration, 1);

        // Ultra smooth ease out (ease-out-quart - even gentler than cubic)
        const eased = 1 - Math.pow(1 - progress, 4);

        // Scale up from small (start at 0.3 instead of 0 for smoother start)
        const scale = 0.3 + (eased * 0.7);
        this.group.scale.set(scale, scale, scale);

        if (this.backgroundSigil) {
          this.backgroundSigil.traverse((child) => {
            if (child.material) {
              if (child.material.transparent === undefined) {
                child.material.transparent = true;
              }
              child.material.opacity = eased * 0.6; // Semi-transparent for background
            }
          });
        }

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
   * Update loop (called each frame).
   * @param {number} delta - Time since last frame
   */
  update(delta) {
    if (!this.isVisible) return;

    // Animate background geometry using optimized animation
    if (this.backgroundSigil) {
      if (this.backgroundSigil.userData.isFallback) {
        BackgroundGeometry.animateFallback(this.backgroundSigil, delta);
      } else {
        BackgroundGeometry.animate(this.backgroundSigil, delta);
      }
    }
  }
}
