// client/JS/three/views/mainView3D.js

import * as THREE from 'three';
import { SigilFactory } from '../sigils/sigilFactory.js';

/**
 * MainView3D - Background sigil view after book opens.
 * Shows large rotating background sigil.
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
    // Create large background sigil (Math/Grimora symbol)
    this.backgroundSigil = SigilFactory.createSigil('math', { 
      size: 3.5, 
      animated: true 
    });
    
    this.backgroundSigil.position.set(0, 0, -2); // Push back for background effect
    this.group.add(this.backgroundSigil);
    
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
    this.group.visible = false;
    this.isVisible = false;
  }
  
  /**
   * Animate in the main view.
   */
  async animateIn() {
    return new Promise(resolve => {
      const duration = 1000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fade in effect
        const eased = 1 - Math.pow(1 - progress, 3);
        
        if (this.backgroundSigil) {
          this.backgroundSigil.traverse((child) => {
            if (child.material && child.material.opacity !== undefined) {
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
    
    // Slow rotation for background sigil
    if (this.backgroundSigil) {
      this.backgroundSigil.rotation.y += delta * 0.15;
      this.backgroundSigil.rotation.z += delta * 0.05;
      
      // Gentle pulse
      const scale = 1 + Math.sin(Date.now() * 0.0005) * 0.05;
      this.backgroundSigil.scale.set(scale, scale, scale);
    }
  }
}
