// client/JS/app/auth.js

/**
 * Authentication module.
 * Handles Discord and Google OAuth (mock for Phase 1).
 * 
 * TODO: Replace with real OAuth when backend is ready.
 */
export class Auth {
  constructor(state) {
    this.state = state;
  }
  
  /**
   * Sign in with Discord (mock)
   * @returns {Promise<Object>} User data
   */
  async signInWithDiscord() {
    console.log('[Auth] Initiating Discord OAuth...');
    
    // Mock delay to simulate OAuth flow
    await this.delay(800);
    
    // Mock user data
    const mockUser = {
      id: 'discord_' + Date.now(),
      provider: 'discord',
      displayName: 'Initiate',
      avatar: null,
      rank: 'Initiate',
      createdAt: new Date().toISOString()
    };
    
    this.state.setUser(mockUser);
    
    console.log('[Auth] Discord sign-in successful (mock)');
    return mockUser;
  }
  
  /**
   * Sign in with Google (mock)
   * @returns {Promise<Object>} User data
   */
  async signInWithGoogle() {
    console.log('[Auth] Initiating Google OAuth...');
    
    // Mock delay to simulate OAuth flow
    await this.delay(800);
    
    // Mock user data
    const mockUser = {
      id: 'google_' + Date.now(),
      provider: 'google',
      displayName: 'Initiate',
      avatar: null,
      rank: 'Initiate',
      createdAt: new Date().toISOString()
    };
    
    this.state.setUser(mockUser);
    
    console.log('[Auth] Google sign-in successful (mock)');
    return mockUser;
  }
  
  /**
   * Sign out
   */
  signOut() {
    console.log('[Auth] Signing out...');
    this.state.clearUser();
  }
  
  /**
   * Check if user is signed in
   * @returns {boolean}
   */
  isSignedIn() {
    return this.state.user !== null;
  }
  
  /**
   * Get current user
   * @returns {Object|null}
   */
  getCurrentUser() {
    return this.state.user;
  }
  
  /**
   * Utility: delay helper
   * @param {number} ms
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Production OAuth implementation guide:
 * 
 * 1. Set up OAuth apps:
 *    - Discord: https://discord.com/developers/applications
 *    - Google: https://console.cloud.google.com/
 * 
 * 2. Create backend endpoint (CloudFlare Worker or Express):
 *    - /api/auth/discord/callback
 *    - /api/auth/google/callback
 * 
 * 3. Store OAuth secrets in environment variables
 * 
 * 4. Return JWT token to client
 * 
 * 5. Update these methods to:
 *    - Open OAuth popup
 *    - Listen for callback
 *    - Exchange code for token
 *    - Store token securely (httpOnly cookie or secure localStorage)
 */
