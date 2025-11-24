// client/JS/main.js

/**
 * Main entry point for Grimora.
 * Initializes THREE.js scene, views, and app orchestration.
 */

import { SceneManager } from './three/sceneManager.js';
import { CoverView3D } from './three/views/coverView3D.js';
import { MainView3D } from './three/views/mainView3D.js';
import { HubView3D } from './three/views/hubView3D.js';
import { Commander } from './app/commander.js';
import { CoverTooltips } from './app/coverTooltips.js';
import { IconButton3D } from './three/components/IconButton3D.js';

/**
 * Initialize the Grimora application
 */
async function init() {
  console.log('🔮 Initializing Grimora...');
  
  try {
    // Get THREE.js container
    const threeContainer = document.getElementById('three-container');
    
    if (!threeContainer) {
      throw new Error('THREE.js container not found');
    }
    
    // Initialize THREE.js scene manager
    console.log('Initializing THREE.js scene...');
    const sceneManager = new SceneManager(threeContainer);
    
    // Create 3D views
    const coverView = new CoverView3D(sceneManager);
    const mainView = new MainView3D(sceneManager);
    const hubView = new HubView3D(sceneManager);
    
    console.log('THREE.js scene initialized');
    
    // Initialize commander (app orchestration)
    const commander = new Commander();
    commander.init(sceneManager, coverView, mainView, hubView);
    
    // Initialize cover tooltips
    const coverTooltips = new CoverTooltips();
    
    // Initialize 3D icon buttons with distinct colors
    const iconOpen = new IconButton3D('icon-3d-open', 0x88dd66);      // Warm yellow-green (matches orb core)
    const iconSignIn = new IconButton3D('icon-3d-signin', 0x66ccaa);  // Warm teal (complementary variant)
    
    // Wire up hover events
    const btnOpen = document.getElementById('open-grimora-btn');
    const btnSignIn = document.getElementById('sign-in-btn');
    
    if (btnOpen && iconOpen) {
      btnOpen.addEventListener('mouseenter', () => iconOpen.setHovered(true));
      btnOpen.addEventListener('mouseleave', () => iconOpen.setHovered(false));
    }
    
    if (btnSignIn && iconSignIn) {
      btnSignIn.addEventListener('mouseenter', () => iconSignIn.setHovered(true));
      btnSignIn.addEventListener('mouseleave', () => iconSignIn.setHovered(false));
    }
    
    // Store globally for debugging (remove in production)
    window.Grimora = {
      sceneManager,
      coverView,
      mainView,
      hubView,
      commander,
      coverTooltips,
      iconOpen,
      iconSignIn
    };
    
    console.log('✨ Grimora initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize Grimora:', error);
    
    // Show error to user
    showInitError(error);
  }
}

/**
 * Show initialization error to user
 * @param {Error} error
 */
function showInitError(error) {
  const app = document.getElementById('app');
  
  if (app) {
    app.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 2rem;
        text-align: center;
        color: #e0e0e0;
      ">
        <h1 style="color: #ff6b6b; font-size: 2rem; margin-bottom: 1rem;">
          ⚠️ Initialization Error
        </h1>
        <p style="max-width: 500px; line-height: 1.6; margin-bottom: 1rem;">
          Grimora failed to initialize. This might be due to:
        </p>
        <ul style="text-align: left; max-width: 400px; line-height: 1.8;">
          <li>Browser compatibility (try Chrome, Firefox, or Safari)</li>
          <li>WebGL not supported</li>
          <li>Missing JavaScript modules</li>
        </ul>
        <p style="margin-top: 2rem; font-size: 0.875rem; color: #a0a0a0;">
          Error: ${error.message}
        </p>
        <button 
          onclick="location.reload()" 
          style="
            margin-top: 2rem;
            padding: 0.75rem 1.5rem;
            background: #00d9ff;
            color: #0d0d0d;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
          "
        >
          Reload Page
        </button>
      </div>
    `;
  }
}

/**
 * Check WebGL support
 * @returns {boolean}
 */
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Pre-initialization checks
 */
function preInit() {
  // Check WebGL
  if (!checkWebGLSupport()) {
    console.error('WebGL not supported');
    showInitError(new Error('Your browser does not support WebGL'));
    return false;
  }
  
  // Check ES6 module support
  if (typeof Symbol === 'undefined') {
    console.error('ES6 not supported');
    showInitError(new Error('Your browser does not support modern JavaScript'));
    return false;
  }
  
  return true;
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (preInit()) {
      init();
    }
  });
} else {
  // DOM already loaded
  if (preInit()) {
    init();
  }
}

// Handle page visibility (pause/resume animations)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('⏸️ Page hidden, pausing animations');
    // Scene manager automatically pauses when page is hidden
  } else {
    console.log('▶️ Page visible, resuming animations');
  }
});

// Handle errors globally
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
