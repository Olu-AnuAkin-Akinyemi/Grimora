// client/JS/three/views/hubView3D.js

import * as THREE from 'three';
import { SigilFactory } from '../sigils/sigilFactory.js';
import { createStoneMaterial } from '../materials/stoneMaterial.js';
import { HALLS_LEVEL1 } from '../../data/halls_level1.js';

console.log('🔮 [HubView3D] Module loading...', new Date().toISOString());

/**
 * HubView3D - The open book with four Hall sigils.
 * Sigils float in 3D space with interactive hover tooltips.
 * Renders to a dedicated canvas on the side panel.
 */
export class HubView3D {
  /**
   * @param {SceneManager} sceneManager
   */
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    
    // Create dedicated scene, camera, and renderer for side panel
    this.scene = new THREE.Scene();
    this.scene.background = null;
    
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
    
    // Get the side panel canvas
    this.canvas = document.getElementById('panel-sigils-canvas');
    if (!this.canvas) {
      console.error('[HubView3D] panel-sigils-canvas not found');
      return;
    }
    
    console.log('[HubView3D] Canvas found:', this.canvas);
    console.log('[HubView3D] Canvas computed style:', {
      display: window.getComputedStyle(this.canvas).display,
      width: window.getComputedStyle(this.canvas).width,
      height: window.getComputedStyle(this.canvas).height,
      visibility: window.getComputedStyle(this.canvas).visibility,
      opacity: window.getComputedStyle(this.canvas).opacity
    });
    
    // Create dedicated renderer for side panel
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    console.log('[HubView3D] Renderer created');
    console.log('[HubView3D] Renderer size:', this.renderer.getSize(new THREE.Vector2()));
    
    this.group = new THREE.Group();
    this.hallSigils = {}; // Map of hallId -> sigil group
    this.sigilArray = []; // Array for raycasting
    
    this.isVisible = false;
    this.hoveredSigil = null;
    this.tooltipTimeout = null;
    
    // Raycaster for hover detection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.init();
    this.setupEventListeners();
    this.startAnimationLoop();
  }
  
  /**
   * Initialize the hub view.
   */
  init() {
    // Add lighting for the sigils
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00d9ff, 1, 50);
    pointLight.position.set(0, 5, 10);
    this.scene.add(pointLight);
    
    // Create Hall sigils
    this.createHallSigils();
    
    // Add group to scene
    this.scene.add(this.group);
    
    // Position group
    this.group.position.set(0, 0, 0);
    
    // Initially hidden until panel opens
    this.group.visible = false;
    
    // Handle resize
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  /**
   * Resize canvas to fit container
   */
  resizeCanvas() {
    if (!this.canvas || !this.renderer) {
      console.warn('[HubView3D] resizeCanvas - missing canvas or renderer', {
        hasCanvas: !!this.canvas,
        hasRenderer: !!this.renderer
      });
      return;
    }
    
    const container = this.canvas.parentElement;
    const width = container?.clientWidth || window.innerWidth * 0.85;
    const height = container?.clientHeight || window.innerHeight - 100;
    
    console.log('[HubView3D] resizeCanvas:', {
      containerWidth: container?.clientWidth,
      containerHeight: container?.clientHeight,
      fallbackWidth: width,
      fallbackHeight: height,
      windowInnerHeight: window.innerHeight,
      viewportHeight: window.innerHeight
    });
    
    if (width === 0 || height === 0) {
      console.warn('[HubView3D] Canvas dimensions are zero, using fallback:', { width, height });
    }
    
    this.camera.aspect = (width || 500) / (height || 600);
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width || 500, height || 600);
    console.log('[HubView3D] Renderer size set');
  }
  
  /**
   * Deprecated: createOpenBook (not needed for side panel)
   */
  createOpenBook() {
    // No book structure needed in side panel
  }
  
  /**
   * Create Hall sigils with hover interaction data.
   * Arranged vertically for side panel.
   */
  createHallSigils() {
    console.log('[HubView3D] Creating hall sigils...');
    
    // Hall configuration with metadata - vertical layout
    const hallConfig = {
      'math-sanctum': { 
        type: 'math', 
        x: 0, 
        y: 2.0,
        title: 'Math Sanctum',
        subtitle: 'Spells of number and pattern',
        paths: ['Mind', 'Code & Flow'],
        color: 0xFFA500  // Orange/gold to differentiate from blue background
      },
      'matter-lab': { 
        type: 'chem', 
        x: 0, 
        y: 0.8,
        title: 'Matter Lab',
        subtitle: 'States, stuff, and building blocks',
        paths: ['Matter', 'Mind']
      },
      'hall-of-maat': { 
        type: 'lore', 
        x: 0, 
        y: -0.8,
        title: 'Hall of Ma\'at',
        subtitle: 'Balance, story, and clear speech',
        paths: ['Mind', 'Heart']
      },
      'machina-workshop': { 
        type: 'physeng', 
        x: 0, 
        y: -2.0,
        title: 'Machina Workshop',
        subtitle: 'Forces, motion, and tools of power',
        paths: ['Matter', 'Body & Craft']
      }
    };
    
    Object.entries(hallConfig).forEach(([hallId, config]) => {
      console.log('[HubView3D] Creating sigil:', hallId, 'type:', config.type);
      
      const sigil = SigilFactory.createSigil(config.type, { 
        size: 0.6, 
        animated: true 
      });
      
      if (!sigil) {
        console.error('[HubView3D] Failed to create sigil for:', hallId);
        return;
      }
      
      console.log('[HubView3D] Sigil created, positioning at:', { x: config.x, y: config.y });
      
      sigil.position.set(config.x, config.y, 0);
      
      // Reduce brightness for all sigils
      sigil.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.emissive) {
            child.material.emissive.multiplyScalar(0.4);
          }
          if (child.material.color && config.color) {
            // Override color for specific sigils (like math)
            child.material.color.setHex(config.color);
            child.material.color.multiplyScalar(0.6);
          } else if (child.material.color) {
            // Reduce brightness for all others
            child.material.color.multiplyScalar(0.6);
          }
          child.material.needsUpdate = true;
        }
      });
      
      sigil.userData = {
        hallId,
        baseY: config.y,
        title: config.title,
        subtitle: config.subtitle,
        paths: config.paths,
        interactive: true
      };
      
      this.hallSigils[hallId] = sigil;
      this.sigilArray.push(sigil);
      this.group.add(sigil);
      
      console.log('[HubView3D] Sigil added to group:', hallId);
    });
    
    console.log('[HubView3D] Hall sigils creation complete. Total:', this.sigilArray.length);
  }
  
  /**
   * Setup mouse event listeners for hover detection.
   */
  setupEventListeners() {
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onClick = this.handleClick.bind(this);
    
    // Attach to both window and canvas for redundancy
    this.attachListeners = () => {
      console.log('[HubView3D] Attaching event listeners to canvas');
      if (this.canvas) {
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('click', this.onClick);
      }
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('click', this.onClick);
    };
    
    this.detachListeners = () => {
      console.log('[HubView3D] Detaching event listeners');
      if (this.canvas) {
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        this.canvas.removeEventListener('click', this.onClick);
      }
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('click', this.onClick);
    };
  }
  
  /**
   * Handle mouse movement for hover detection.
   */
  handleMouseMove(event) {
    if (!this.isVisible || !this.canvas) {
      console.log('[HubView3D] Early return: isVisible=', this.isVisible, 'canvas=', !!this.canvas);
      return;
    }
    
    // Get canvas bounds
    const rect = this.canvas.getBoundingClientRect();
    console.log('[HubView3D] handleMouseMove fired. Event:', { clientX: event.clientX, clientY: event.clientY }, 'Canvas rect:', rect);
    
    // Check if mouse is within canvas bounds
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      console.log('[HubView3D] Mouse outside canvas bounds');
      if (this.hoveredSigil) {
        this.hoveredSigil.scale.set(1, 1, 1);
        this.hoveredSigil = null;
        this.scheduleHideTooltip();
      }
      return;
    }
    
    console.log('[HubView3D] Mouse within canvas bounds');
    
    // Convert mouse position to normalized device coordinates relative to canvas
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Collect all meshes from all sigils
    const meshes = [];
    const meshToSigil = new Map();
    
    this.sigilArray.forEach(sigil => {
      sigil.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);
          meshToSigil.set(child, sigil);
        }
      });
    });
    
    // Check for intersections with all meshes
    const intersects = this.raycaster.intersectObjects(meshes, false);
    
    if (intersects.length > 0) {
      // Get the sigil from the first intersected mesh
      const intersectedMesh = intersects[0].object;
      const newHovered = meshToSigil.get(intersectedMesh);
      
      if (this.hoveredSigil !== newHovered) {
        // Reset previous hovered sigil
        if (this.hoveredSigil) {
          this.hoveredSigil.scale.set(1, 1, 1);
        }
        
        this.hoveredSigil = newHovered;
        
        // Scale up new hovered sigil
        if (this.hoveredSigil) {
          this.hoveredSigil.scale.set(1.2, 1.2, 1.2);
        }
        
        this.showTooltip(newHovered, event);
      }
      
      // Set cursor to pointer on panel canvas
      if (this.canvas) this.canvas.style.cursor = 'pointer';
    } else {
      if (this.hoveredSigil) {
        // Reset scale
        this.hoveredSigil.scale.set(1, 1, 1);
        this.hoveredSigil = null;
        this.scheduleHideTooltip();
      }
      
      // Reset cursor
      if (this.canvas) this.canvas.style.cursor = 'default';
    }
  }
  
  /**
   * Handle click on sigil.
   */
  handleClick(event) {
    if (!this.hoveredSigil) return;
    
    const hallId = this.hoveredSigil.userData.hallId;
    const hallTitle = this.hoveredSigil.userData.title;
    
    console.log(`[HubView3D] Clicked sigil: ${hallId} (${hallTitle})`);
    
    // Dispatch custom event to notify app of hall selection
    window.dispatchEvent(new CustomEvent('hall-selected', {
      detail: { hallId, hallTitle }
    }));
  }
  
  /**
   * Show tooltip for hovered sigil.
   */
  showTooltip(sigil, event) {
    clearTimeout(this.tooltipTimeout);
    
    const tooltip = document.getElementById('hall-tooltip');
    console.log('[HubView3D] showTooltip: tooltip element found?', !!tooltip);
    if (!tooltip) {
      console.warn('[HubView3D] Tooltip element not found in DOM!');
      return;
    }
    
    const data = sigil.userData;
    console.log('[HubView3D] showTooltip called for:', data.title);
    
    // Update tooltip content
    tooltip.querySelector('.tooltip-title').textContent = data.title;
    tooltip.querySelector('.tooltip-subtitle').textContent = data.subtitle;
    
    const pathsContainer = tooltip.querySelector('.tooltip-paths');
    pathsContainer.innerHTML = '';
    data.paths.forEach(path => {
      const tag = document.createElement('span');
      tag.className = 'path-tag';
      tag.textContent = path;
      pathsContainer.appendChild(tag);
    });
    
    // Simple positioning: centered on cursor, above it
    let left = event.clientX - 90;
    let top = event.clientY - 100;
    
    console.log('[HubView3D] Positioning tooltip at:', { left, top, event: { clientX: event.clientX, clientY: event.clientY } });
    
    // Position tooltip with fixed positioning (global coordinates)
    tooltip.style.position = 'fixed';
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.display = 'block';
    tooltip.style.zIndex = '500';
    
    console.log('[HubView3D] Removing hidden class...');
    console.log('[HubView3D] Tooltip classList before:', tooltip.classList.toString());
    tooltip.classList.remove('hidden');
    console.log('[HubView3D] Tooltip classList after:', tooltip.classList.toString());
    console.log('[HubView3D] Tooltip computed style display:', window.getComputedStyle(tooltip).display);
    console.log('[HubView3D] Tooltip computed style opacity:', window.getComputedStyle(tooltip).opacity);
    
    // Auto-hide after 6 seconds
    this.scheduleHideTooltip(6000);
  }
  
  /**
   * Schedule tooltip to hide after delay.
   */
  scheduleHideTooltip(delay = 500) {
    clearTimeout(this.tooltipTimeout);
    this.tooltipTimeout = setTimeout(() => {
      const tooltip = document.getElementById('hall-tooltip');
      if (tooltip) {
        tooltip.classList.add('hidden');
      }
    }, delay);
  }
  
  /**
   * Show the hub view.
   */
  async show() {
    console.log('[HubView3D] show() called');
    console.log('[HubView3D] Canvas element:', this.canvas);
    console.log('[HubView3D] Canvas parent:', this.canvas?.parentElement);
    console.log('[HubView3D] Side panel element:', document.getElementById('side-panel'));
    console.log('[HubView3D] Side panel state:', document.getElementById('side-panel')?.getAttribute('data-state'));
    console.log('[HubView3D] Body side-panel-open class:', document.body.classList.contains('side-panel-open'));
    
    this.isVisible = true;
    this.group.visible = true;
    
    console.log('[HubView3D] Set isVisible=true, group.visible=true');
    console.log('[HubView3D] Group visibility status:', {
      groupVisible: this.group.visible,
      groupChildren: this.group.children.length,
      groupWorldVisible: this.group.getWorldPosition(new THREE.Vector3()),
      sceneHasGroup: this.scene.children.includes(this.group)
    });
    
    // Resize canvas when panel opens
    console.log('[HubView3D] Calling resizeCanvas (immediate)');
    this.resizeCanvas();
    
    console.log('[HubView3D] Calling resizeCanvas (via rAF)');
    requestAnimationFrame(() => {
      console.log('[HubView3D] rAF resizeCanvas');
      this.resizeCanvas();
    });
    
    console.log('[HubView3D] Calling resizeCanvas (via setTimeout 400ms)');
    setTimeout(() => {
      console.log('[HubView3D] setTimeout resizeCanvas');
      this.resizeCanvas();
    }, 400);
    
    // Reset camera position
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
    
    console.log('[HubView3D] Camera reset to position (0, 0, 8)');
    console.log('[HubView3D] Scene structure:', {
      sceneChildrenCount: this.scene.children.length,
      children: this.scene.children.map(c => ({ name: c.name || 'unnamed', type: c.type }))
    });
    console.log('[HubView3D] Sigils count:', Object.keys(this.hallSigils).length);
    console.log('[HubView3D] Hall sigils:', Object.keys(this.hallSigils));
    
    // Add event listeners
    this.attachListeners();
    
    console.log('[HubView3D] Event listeners added');
    
    // Animate sigils in
    console.log('[HubView3D] Starting animateIn...');
    await this.animateIn();
    console.log('[HubView3D] animateIn complete');
    console.log('[HubView3D] Final check - group children:', this.group.children.length, 'all visible:', this.group.children.every(c => c.visible));
  }
  
  /**
   * Hide the hub view.
   */
  async hide() {
    await this.animateOut();
    
    // Remove event listeners
    this.detachListeners();
    
    // Hide tooltip
    const tooltip = document.getElementById('hall-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
    
    this.group.visible = false;
    this.isVisible = false;
  }
  
  /**
   * Animate hub view in (camera + sigils).
   */
  async animateIn() {
    return new Promise(resolve => {
      const duration = 1200;
      const startTime = Date.now();
      
      // Camera starts pulled back
      const startCamZ = 12;
      const endCamZ = 7;
      
      // Sigils start invisible and scale up
      Object.values(this.hallSigils).forEach(sigil => {
        sigil.scale.set(0.01, 0.01, 0.01);
        sigil.visible = true;
      });
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Animate camera
        this.camera.position.z = startCamZ + (endCamZ - startCamZ) * eased;
        
        // Animate sigils scale
        Object.values(this.hallSigils).forEach(sigil => {
          const scale = 0.01 + (1 - 0.01) * eased;
          sigil.scale.set(scale, scale, scale);
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
   * Animate hub view out.
   */
  async animateOut() {
    return new Promise(resolve => {
      const duration = 800;
      const startTime = Date.now();
      
      const startCamZ = this.camera.position.z;
      const endCamZ = 10;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in cubic
        const eased = Math.pow(progress, 3);
        
        // Animate camera
        this.camera.position.z = startCamZ + (endCamZ - startCamZ) * eased;
        
        // Fade out sigils
        Object.values(this.hallSigils).forEach(sigil => {
          const scale = 1 - (1 - 0.01) * eased;
          sigil.scale.set(scale, scale, scale);
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
   * Update loop (called each frame).
   * @param {number} delta - Time since last frame
   */
  update(delta) {
    if (!this.isVisible) return;
    
    // Animate each hall sigil
    Object.values(this.hallSigils).forEach(sigil => {
      if (sigil.userData.animate) {
        sigil.userData.animate(delta);
      }
      
      // Slow continuous rotation
      sigil.rotation.y += delta * 0.3;
      
      // Gentle float
      const baseY = sigil.userData.baseY || sigil.position.y;
      sigil.userData.baseY = baseY;
      
      sigil.position.y = baseY + Math.sin(Date.now() * 0.001 + sigil.position.x) * 0.05;
    });
  }
  
  /**
   * Start dedicated animation loop for side panel
   */
  startAnimationLoop() {
    console.log('[HubView3D] Starting animation loop');
    console.log('[HubView3D] Scene children count:', this.scene.children.length);
    console.log('[HubView3D] Group children count:', this.group.children.length);
    console.log('[HubView3D] Hall sigils count:', Object.keys(this.hallSigils).length);
    
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Always update if visible
      if (this.isVisible) {
        this.update(delta);
      }
      
      // Always render (even when not visible, so it's ready when panel opens)
      if (this.renderer && this.scene && this.camera) {
        try {
          this.renderer.render(this.scene, this.camera);
        } catch (error) {
          console.error('[HubView3D] Renderer error:', error);
        }
      }
    };
    
    animate();
  }
}
