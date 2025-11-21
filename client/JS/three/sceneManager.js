// client/JS/three/sceneManager.js

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * SceneManager - Core THREE.js setup with bloom and mobile optimization.
 * Manages scene, camera, renderer, lighting, and post-processing.
 */
export class SceneManager {
  /**
   * @param {HTMLElement} container - DOM element to render into
   */
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    
    this.activeView = null;
    this.clock = new THREE.Clock();
    this.animationId = null;
    
    // Mobile detection
    this.isMobile = this.detectMobile();
    
    this.init();
  }
  
  /**
   * Detect mobile device for performance optimization
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth < 768;
  }
  
  /**
   * Initialize THREE.js scene, camera, renderer, and lighting
   */
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to show CSS background
    this.scene.fog = new THREE.Fog(0x0d0d0d, 10, 50);
    
    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 8);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isMobile, // Disable AA on mobile for performance
      alpha: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Cap pixel ratio on mobile to improve performance
    const maxPixelRatio = this.isMobile ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    
    // Enable shadow maps (moderate quality for mobile)
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone mapping for better glow
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    this.container.appendChild(this.renderer.domElement);
    
    // Store canvas reference for mouse interactions
    this.canvas = this.renderer.domElement;
    
    // Lighting
    this.setupLighting();
    
    // Post-processing (bloom)
    this.setupPostProcessing();
    
    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize(), false);
    
    // Start render loop
    this.animate();
    
    console.log('[SceneManager] Initialized', {
      isMobile: this.isMobile,
      pixelRatio: this.renderer.getPixelRatio(),
      size: { width: window.innerWidth, height: window.innerHeight }
    });
  }
  
  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light (subtle base illumination)
    const ambient = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambient);
    
    // Main key light (bluish cyan to match glow aesthetic)
    const keyLight = new THREE.PointLight(0x00d9ff, 1.5, 100);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = !this.isMobile;
    this.scene.add(keyLight);
    
    // Fill light (warmer, from opposite side)
    const fillLight = new THREE.PointLight(0xff9966, 0.8, 80);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);
    
    // Rim light (backlight for edge definition)
    const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.6);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);
  }
  
  /**
   * Setup post-processing with bloom effect
   */
  setupPostProcessing() {
    // Composer for post-processing pipeline
    this.composer = new EffectComposer(this.renderer);
    
    // Render pass (main scene)
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // Bloom pass (glow effect)
    // Reduce bloom quality on mobile
    const bloomStrength = this.isMobile ? 0.8 : 1.2;
    const bloomRadius = this.isMobile ? 0.3 : 0.5;
    const bloomThreshold = 0.2;
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      bloomStrength,
      bloomRadius,
      bloomThreshold
    );
    
    this.composer.addPass(bloomPass);
    
    // Store bloom pass for runtime adjustment
    this.bloomPass = bloomPass;
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    
    // Update mobile detection on resize
    this.isMobile = this.detectMobile();
  }
  
  /**
   * Set the active view (CoverView3D or HubView3D)
   * @param {Object} view - View instance with update() method
   */
  setActiveView(view) {
    this.activeView = view;
  }
  
  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    // Update active view
    if (this.activeView && this.activeView.update) {
      this.activeView.update(delta);
    }
    
    // Render
    this.composer.render();
  }
  
  /**
   * Cleanup and dispose
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', () => this.onWindowResize());
    
    // Dispose geometries, materials, textures
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    this.composer.dispose();
    
    console.log('[SceneManager] Disposed');
  }
}
