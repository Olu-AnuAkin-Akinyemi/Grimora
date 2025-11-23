// client/JS/three/views/coverView3D.js

import * as THREE from 'three';
import { BackgroundGeometry } from '../geometries/backgroundGeometry.js';
import { createStoneMaterial } from '../materials/stoneMaterial.js';

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

    this.group.add(this.bookGroup);

    // Central sigil (centered in front of camera) - using custom background geometry
    const isMobile = this.sceneManager.isMobile;
    try {
      this.centralSigil = BackgroundGeometry.create({
        size: 2.5,
        color: 0x00d9ff,
        mobile: isMobile
      });
    } catch (error) {
      console.warn('[CoverView3D] Using fallback geometry:', error);
      this.centralSigil = BackgroundGeometry.createFallback(2.5, 0x00d9ff);
    }
    this.centralSigil.position.set(0, 0, 0.6);
    this.group.add(this.centralSigil);

    // Enable drag-to-rotate interaction
    const canvas = this.sceneManager.renderer.domElement;
    BackgroundGeometry.enableDragRotation(this.centralSigil, canvas);

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
   * Hide the cover view with smooth fade transition.
   */
  async hide() {
    await this.animateFadeOut();

    // Cleanup drag rotation listeners
    if (this.centralSigil?.userData?.cleanupDragRotation) {
      this.centralSigil.userData.cleanupDragRotation();
    }

    this.group.visible = false;
    this.isVisible = false;
  }

  /**
   * Smooth scale down and fade out transition.
   */
  async animateFadeOut() {
    return new Promise(resolve => {
      const duration = 800; // Slightly longer for smooth scale
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease in cubic for smooth disappearance
        const eased = Math.pow(progress, 3);

        // Scale down the entire group (shrink to nothing)
        const scale = 1 - eased;
        this.group.scale.set(scale, scale, scale);

        // Fade everything out
        this.group.traverse((child) => {
          if (child.material) {
            if (child.material.transparent === undefined) {
              child.material.transparent = true;
            }
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
   * Update animation loop - animate central sigil.
   */
  update(deltaTime) {
    if (!this.isVisible) return;

    // Animate central sigil using optimized animation
    if (this.centralSigil) {
      if (this.centralSigil.userData.isFallback) {
        BackgroundGeometry.animateFallback(this.centralSigil, deltaTime);
      } else {
        BackgroundGeometry.animate(this.centralSigil, deltaTime);
      }
    }
  }
  
  /**
   * Easing function for smooth animations.
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
