// client/JS/app/state.js

/**
 * State management for Grimora.
 * Tracks current view, user auth, and app state.
 */
export class State {
  constructor() {
    this.currentView = 'cover'; // 'cover' | 'hub' | 'hall' | 'lesson'
    this.user = null;
    this.progress = {};
    
    this.listeners = {};
    
    // Load from localStorage
    this.loadFromStorage();
  }
  
  /**
   * Set current view and notify listeners
   * @param {string} viewName
   */
  setView(viewName) {
    const oldView = this.currentView;
    this.currentView = viewName;
    
    this.emit('viewChange', { from: oldView, to: viewName });
    
    console.log('[State] View changed:', oldView, '→', viewName);
  }
  
  /**
   * Set user data
   * @param {Object} userData
   */
  setUser(userData) {
    this.user = userData;
    this.emit('userChange', userData);
    this.saveToStorage();
    
    console.log('[State] User set:', userData);
  }
  
  /**
   * Clear user (sign out)
   */
  clearUser() {
    this.user = null;
    this.emit('userChange', null);
    this.saveToStorage();
    
    console.log('[State] User cleared');
  }
  
  /**
   * Update lesson progress
   * @param {string} lessonId
   * @param {number} progress - 0-1
   */
  setLessonProgress(lessonId, progress) {
    this.progress[lessonId] = progress;
    this.emit('progressChange', { lessonId, progress });
    this.saveToStorage();
  }
  
  /**
   * Get lesson progress
   * @param {string} lessonId
   * @returns {number} - 0-1
   */
  getLessonProgress(lessonId) {
    return this.progress[lessonId] || 0;
  }
  
  /**
   * Subscribe to state changes
   * @param {string} event - 'viewChange' | 'userChange' | 'progressChange'
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  /**
   * Emit event to listeners
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * Save state to localStorage
   */
  saveToStorage() {
    try {
      const stateData = {
        user: this.user,
        progress: this.progress
      };
      localStorage.setItem('grimora_state', JSON.stringify(stateData));
    } catch (error) {
      console.error('[State] Failed to save to storage:', error);
    }
  }
  
  /**
   * Load state from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('grimora_state');
      if (stored) {
        const stateData = JSON.parse(stored);
        this.user = stateData.user || null;
        this.progress = stateData.progress || {};
        
        console.log('[State] Loaded from storage');
      }
    } catch (error) {
      console.error('[State] Failed to load from storage:', error);
    }
  }
  
  /**
   * Clear all stored data
   */
  clearStorage() {
    localStorage.removeItem('grimora_state');
    this.progress = {};
    console.log('[State] Storage cleared');
  }
}
