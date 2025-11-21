// client/JS/app/commander.js

import { State } from './state.js';
import { Auth } from './auth.js';

/**
 * Commander - Main orchestration layer.
 * Coordinates between state, auth, UI, and THREE.js views.
 * 
 * This is the "impure" layer that glues everything together.
 */
export class Commander {
  constructor() {
    this.state = new State();
    this.auth = new Auth(this.state);
    
    this.sceneManager = null;
    this.coverView = null;
    this.mainView = null;
    this.hubView = null;
    
    this.domElements = {};
    this.sidePanelOpen = false;
    
    console.log('[Commander] Initialized');
  }
  
  /**
   * Initialize commander with scene manager and views
   * @param {SceneManager} sceneManager
   * @param {CoverView3D} coverView
   * @param {MainView3D} mainView
   * @param {HubView3D} hubView
   */
  init(sceneManager, coverView, mainView, hubView) {
    this.sceneManager = sceneManager;
    this.coverView = coverView;
    this.mainView = mainView;
    this.hubView = hubView;
    
    // Cache DOM elements
    this.cacheDOMElements();
    
    // Bind event listeners
    this.bindEvents();
    
    // Subscribe to state changes
    this.subscribeToState();
    
    // Show initial view (cover)
    this.showCover();
    
    console.log('[Commander] Ready');
  }
  
  /**
   * Cache frequently used DOM elements
   */
  cacheDOMElements() {
    this.domElements = {
      // Views
      coverView: document.getElementById('cover-view'),
      mainView: document.getElementById('main-view'),
      hubView: document.getElementById('hub-view'),
      
      // Buttons
      openGrimoraBtn: document.getElementById('open-grimora-btn'),
      bookSpineBtn: document.getElementById('book-spine-btn'),
      signInBtn: document.getElementById('sign-in-btn'),
      
      // Side Panel
      sidePanel: document.getElementById('side-panel'),
      sidePanelOverlay: document.querySelector('.side-panel-overlay'),
      
      // Modal
      authModal: document.getElementById('auth-modal'),
      authModalOverlay: document.querySelector('.modal-overlay'),
      authModalClose: document.querySelector('.modal-close'),
      discordBtn: document.querySelector('.auth-btn-discord'),
      googleBtn: document.querySelector('.auth-btn-google')
    };
  }
  
  /**
   * Bind DOM event listeners
   */
  bindEvents() {
    const { domElements } = this;
    
    // Open Grimora button (Cover → Main)
    domElements.openGrimoraBtn?.addEventListener('click', () => {
      this.transitionToMain();
    });
    
    // Book spine button (toggle side panel)
    domElements.bookSpineBtn?.addEventListener('click', () => {
      this.toggleSidePanel();
    });
    
    // Side panel overlay (close on click)
    domElements.sidePanelOverlay?.addEventListener('click', () => {
      this.closeSidePanel();
    });
    
    // Sign in button
    domElements.signInBtn?.addEventListener('click', () => {
      this.openAuthModal();
    });
    
    // Auth modal controls
    domElements.authModalOverlay?.addEventListener('click', () => {
      this.closeAuthModal();
    });
    
    domElements.authModalClose?.addEventListener('click', () => {
      this.closeAuthModal();
    });
    
    // OAuth buttons
    domElements.discordBtn?.addEventListener('click', async () => {
      await this.handleDiscordAuth();
    });
    
    domElements.googleBtn?.addEventListener('click', async () => {
      await this.handleGoogleAuth();
    });
    
    // Hall cards (future: navigate to hall detail)
    document.querySelectorAll('.hall-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('hall-enter-btn')) {
          const hallId = card.dataset.hallId;
          this.enterHall(hallId);
        }
      });
    });
    
    // Listen for sigil clicks from HubView3D
    window.addEventListener('hall-selected', (e) => {
      const { hallId } = e.detail;
      this.enterHall(hallId);
    });
  }
  
  /**
   * Subscribe to state changes
   */
  subscribeToState() {
    this.state.on('viewChange', ({ from, to }) => {
      this.handleViewChange(from, to);
    });
    
    this.state.on('userChange', (user) => {
      this.handleUserChange(user);
    });
  }
  
  /**
   * Show cover view
   */
  async showCover() {
    this.state.setView('cover');
    
    // Show 3D cover
    await this.coverView.show();
    
    // Show DOM cover
    this.domElements.coverView?.classList.add('active');
    this.domElements.mainView?.classList.remove('active');
  }
  
  /**
   * Transition from cover to main view
   */
  async transitionToMain() {
    console.log('[Commander] Transitioning to main...');
    
    // Hide cover (3D + DOM)
    await this.coverView.hide();
    this.domElements.coverView?.classList.remove('active');
    
    // Show main (3D + DOM)
    await this.mainView.show();
    this.domElements.mainView?.classList.add('active');
    
    this.state.setView('main');
  }
  
  /**
   * Toggle side panel (shows hall sigils)
   */
  toggleSidePanel() {
    if (this.sidePanelOpen) {
      this.closeSidePanel();
    } else {
      this.openSidePanel();
    }
  }
  
  /**
   * Open side panel
   */
  async openSidePanel() {
    console.log('[Commander] Opening side panel...');
    console.log('[Commander] Side panel element:', this.domElements.sidePanel);
    console.log('[Commander] Side panel current state:', this.domElements.sidePanel?.getAttribute('data-state'));
    console.log('[Commander] Book spine button:', this.domElements.bookSpineBtn);
    
    this.sidePanelOpen = true;
    
    console.log('[Commander] Setting data-state="open"');
    this.domElements.sidePanel?.setAttribute('data-state', 'open');
    console.log('[Commander] Side panel state after:', this.domElements.sidePanel?.getAttribute('data-state'));
    
    console.log('[Commander] Adding body.side-panel-open class');
    document.body.classList.add('side-panel-open');
    console.log('[Commander] Body classList:', Array.from(document.body.classList));
    
    this.domElements.bookSpineBtn?.setAttribute('aria-expanded', 'true');
    
    console.log('[Commander] Calling hubView.show()');
    // Show hub view in side panel
    await this.hubView.show();
    console.log('[Commander] hubView.show() complete');
  }
  
  /**
   * Close side panel
   */
  async closeSidePanel() {
    console.log('[Commander] Closing side panel...');
    
    this.sidePanelOpen = false;
    this.domElements.sidePanel?.setAttribute('data-state', 'closed');
    document.body.classList.remove('side-panel-open');
    this.domElements.bookSpineBtn?.setAttribute('aria-expanded', 'false');
    
    // Hide hub view
    await this.hubView.hide();
  }
  
  /**
   * Deprecated: transitionToHub (now uses side panel)
   */
  async transitionToHub() {
    await this.transitionToMain();
    await this.openSidePanel();
  }
  
  /**
   * Handle view changes
   * @param {string} from
   * @param {string} to
   */
  handleViewChange(from, to) {
    console.log(`[Commander] View changed: ${from} → ${to}`);
    
    // Update UI state classes
    document.body.dataset.view = to;
  }
  
  /**
   * Handle user auth changes
   * @param {Object|null} user
   */
  handleUserChange(user) {
    const { signInBtn } = this.domElements;
    
    if (user) {
      // Update sign-in button to show user
      if (signInBtn) {
        signInBtn.innerHTML = `
          <span class="btn-icon">✓</span>
          ${user.displayName}
        `;
      }
    } else {
      // Reset to sign-in state
      if (signInBtn) {
        signInBtn.innerHTML = `
          <span class="btn-icon">👤</span>
          Sign In
        `;
      }
    }
  }
  
  /**
   * Open auth modal
   */
  openAuthModal() {
    this.domElements.authModal?.classList.add('active');
  }
  
  /**
   * Close auth modal
   */
  closeAuthModal() {
    this.domElements.authModal?.classList.remove('active');
  }
  
  /**
   * Handle Discord authentication
   */
  async handleDiscordAuth() {
    this.showSpinner();
    
    try {
      await this.auth.signInWithDiscord();
      this.closeAuthModal();
    } catch (error) {
      console.error('[Commander] Discord auth failed:', error);
      alert('Sign-in failed. Please try again.');
    } finally {
      this.hideSpinner();
    }
  }
  
  /**
   * Handle Google authentication
   */
  async handleGoogleAuth() {
    this.showSpinner();
    
    try {
      await this.auth.signInWithGoogle();
      this.closeAuthModal();
    } catch (error) {
      console.error('[Commander] Google auth failed:', error);
      alert('Sign-in failed. Please try again.');
    } finally {
      this.hideSpinner();
    }
  }
  
  /**
   * Enter a specific hall
   * @param {string} hallId
   */
  enterHall(hallId) {
    console.log('[Commander] Entering hall:', hallId);
    
    // TODO: Implement hall detail view
    // For now, just log
    alert(`Entering ${hallId} - Coming soon!`);
  }
}
