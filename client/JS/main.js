// client/JS/main.js

/**
 * Main entry point for Grimora.
 * Initializes THREE.js scene, views, and app orchestration.
 */

import * as THREE from 'three';
import { SceneManager } from './three/sceneManager.js';
import { CoverView3D } from './three/views/coverView3D.js';
import { MainView3D } from './three/views/mainView3D.js';
import { HubView3D } from './three/views/hubView3D.js';
import { Commander } from './app/commander.js';
import { CoverTooltips } from './app/coverTooltips.js';
import { IconButton3D } from './three/components/IconButton3D.js?v=40';

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
    const iconOpen = new IconButton3D('icon-3d-open', { 
      type: 'image', 
      texturePath: 'assets/book.svg',
      color: 0x88dd66,
      size: 18 // Even smaller, minimal size
    });
    
    const iconSignIn = new IconButton3D('icon-3d-signin', { 
      type: 'image', 
      texturePath: 'assets/user.svg',
      color: 0x66ccaa,
      size: 18, // Even smaller, minimal size
      blending: THREE.AdditiveBlending 
    });

    const iconSettings = new IconButton3D('icon-3d-settings', { 
      type: 'image', 
      texturePath: 'assets/settings.svg',
      color: 0x9999ff,
      size: 14, // Smaller icon
      containerSize: 45 // Smaller button size
    });

    const iconHelp = new IconButton3D('icon-3d-help', { 
      type: 'image', 
      texturePath: 'assets/help.svg',
      color: 0x66ddff,
      size: 14, // Smaller icon
      containerSize: 45 // Smaller button size
    });

    // Main view instances (same icons)
    const iconSettingsMain = new IconButton3D('icon-3d-settings-main', { 
      type: 'image', 
      texturePath: 'assets/settings.svg',
      color: 0x9999ff,
      size: 14,
      containerSize: 45
    });

    const iconHelpMain = new IconButton3D('icon-3d-help-main', { 
      type: 'image', 
      texturePath: 'assets/help.svg',
      color: 0x66ddff,
      size: 14,
      containerSize: 45
    });
    
    // Wire up hover events for cover view
    const btnOpen = document.getElementById('open-grimora-btn');
    const btnSignIn = document.getElementById('sign-in-btn');
    const btnSettings = document.getElementById('settings-btn');
    const btnHelp = document.getElementById('help-btn');

    // Wire up hover events for main view
    const btnSettingsMain = document.getElementById('settings-btn-main');
    const btnHelpMain = document.getElementById('help-btn-main');
    
    if (btnOpen && iconOpen) {
      btnOpen.addEventListener('mouseenter', () => iconOpen.setHovered(true));
      btnOpen.addEventListener('mouseleave', () => iconOpen.setHovered(false));
    }
    
    if (btnSignIn && iconSignIn) {
      btnSignIn.addEventListener('mouseenter', () => iconSignIn.setHovered(true));
      btnSignIn.addEventListener('mouseleave', () => iconSignIn.setHovered(false));
    }

    if (btnSettings && iconSettings) {
      btnSettings.addEventListener('mouseenter', () => iconSettings.setHovered(true));
      btnSettings.addEventListener('mouseleave', () => iconSettings.setHovered(false));
    }

    if (btnHelp && iconHelp) {
      btnHelp.addEventListener('mouseenter', () => iconHelp.setHovered(true));
      btnHelp.addEventListener('mouseleave', () => iconHelp.setHovered(false));
    }

    if (btnSettingsMain && iconSettingsMain) {
      btnSettingsMain.addEventListener('mouseenter', () => iconSettingsMain.setHovered(true));
      btnSettingsMain.addEventListener('mouseleave', () => iconSettingsMain.setHovered(false));
    }

    if (btnHelpMain && iconHelpMain) {
      btnHelpMain.addEventListener('mouseenter', () => iconHelpMain.setHovered(true));
      btnHelpMain.addEventListener('mouseleave', () => iconHelpMain.setHovered(false));
    }

    // Info panel functionality with dynamic content
    const infoPanel = document.getElementById('info-panel');
    const infoPanelClose = document.querySelector('.info-panel-close');
    const helpTooltip = document.getElementById('cover-tooltip-help');
    const panelTitle = document.querySelector('.info-panel-title');
    const panelText = document.querySelector('.info-panel-text');

    // Centralized help content for each view
    const helpContent = {
      cover: {
        title: "Welcome to Grimora",
        body: `
          <p><strong>Your Living Spellbook</strong></p>
          <p>Grimora is an interactive learning companion that brings STEM education to life through magical storytelling.</p>
          
          <p><strong>Getting Started</strong></p>
          <p>If you've signed up, click "Open" to begin your journey through the Halls of Knowledge:</p>
          <ul>
            <li><strong>Hall of Maat</strong> - History & Lore</li>
            <li><strong>Math Sanctum</strong> - Mathematics & Logic</li>
            <li><strong>Matter Lab</strong> - Chemistry & Science</li>
            <li><strong>Machina Workshop</strong> - Physics & Engineering</li>
          </ul>
          
          <p><strong>Sign Up</strong></p>
          <p>Create an account to save your progress and sync across devices.</p>
          
          <p><strong>Navigation</strong></p>
          <p>Use the book spine button on the right edge to access the Halls menu at any time.</p>
        `
      },
      main: {
        title: "Navigating the Halls",
        body: `
          <p><strong>The Book Spine</strong></p>
          <p>Click the spine button on the right edge of your screen to open the Halls menu. This button is always accessible, allowing you to switch between Halls at any time.</p>
          
          <p><strong>The Four Halls of Knowledge</strong></p>
          
          <p><strong>Hall of Maat</strong> - <em>History & Lore</em></p>
          <p>Explore the rich tapestry of human history, cultural narratives, and timeless wisdom. Learn about ancient civilizations, mythology, and the stories that shaped our world.</p>
          
          <p><strong>Math Sanctum</strong> - <em>Mathematics & Logic</em></p>
          <p>Master the language of numbers, patterns, and reasoning. From basic arithmetic to advanced calculus, develop your mathematical thinking and problem-solving skills.</p>
          
          <p><strong>Matter Lab</strong> - <em>Chemistry & Science</em></p>
          <p>Discover the building blocks of our universe. Experiment with elements, compounds, and reactions. Understand the scientific method and the nature of matter itself.</p>
          
          <p><strong>Machina Workshop</strong> - <em>Physics & Engineering</em></p>
          <p>Unlock the principles of motion, energy, and forces. Design, build, and understand the mechanics that power our modern world.</p>
          
          <p><strong>Your Progress</strong></p>
          <p>Cards with a glowing border indicate Halls you've unlocked and can access. Complete lessons and challenges to unlock new Halls and advance your journey.</p>
        `
      }
    };

    // Get current active view
    function getCurrentView() {
      const activeView = document.querySelector('.view-state.active');
      return activeView?.dataset.view || 'cover';
    }

    // Update panel content based on current view
    function updateHelpPanel() {
      const view = getCurrentView();
      const content = helpContent[view] || helpContent.cover;
      
      if (panelTitle && panelText) {
        panelTitle.textContent = content.title;
        panelText.innerHTML = content.body;
      }
    }

    // Both help buttons should toggle the same panel
    const setupHelpButton = (btn) => {
      if (!btn) return;
      
      btn.addEventListener('click', () => {
        // Update content before showing panel
        updateHelpPanel();
        
        infoPanel.classList.toggle('hidden');
        
        // Hide tooltip when panel opens
        if (!infoPanel.classList.contains('hidden') && helpTooltip) {
          helpTooltip.classList.add('hidden');
        }
      });
    };

    if (infoPanel) {
      setupHelpButton(btnHelp);
      setupHelpButton(btnHelpMain);

      // Close on close button click
      if (infoPanelClose) {
        infoPanelClose.addEventListener('click', () => {
          infoPanel.classList.add('hidden');
        });
      }

      // Close on click outside
      document.addEventListener('click', (e) => {
        if (!infoPanel.classList.contains('hidden') &&
            !infoPanel.contains(e.target) &&
            !btnHelp?.contains(e.target) &&
            !btnHelpMain?.contains(e.target)) {
          infoPanel.classList.add('hidden');
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !infoPanel.classList.contains('hidden')) {
          infoPanel.classList.add('hidden');
        }
      });
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
      iconSignIn,
      iconSettings,
      iconHelp,
      iconSettingsMain,
      iconHelpMain
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
