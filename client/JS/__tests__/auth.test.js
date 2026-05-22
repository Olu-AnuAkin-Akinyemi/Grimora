import { describe, it, expect, beforeEach } from 'vitest'
import { Auth } from '../app/auth.js'
import { State } from '../app/state.js'

describe('Auth', () => {
  let state, auth

  beforeEach(() => {
    localStorage.clear()
    state = new State()
    auth = new Auth(state)
  })

  it('starts signed out', () => {
    expect(auth.isSignedIn()).toBe(false)
    expect(auth.getCurrentUser()).toBeNull()
  })

  it('discord sign-in resolves with discord user', async () => {
    const user = await auth.signInWithDiscord()
    expect(user.provider).toBe('discord')
    expect(user.displayName).toBe('Initiate')
    expect(user.id).toMatch(/^discord_/)
  })

  it('discord sign-in marks user as signed in', async () => {
    await auth.signInWithDiscord()
    expect(auth.isSignedIn()).toBe(true)
  })

  it('google sign-in resolves with google user', async () => {
    const user = await auth.signInWithGoogle()
    expect(user.provider).toBe('google')
    expect(user.id).toMatch(/^google_/)
  })

  it('sign out clears user', async () => {
    await auth.signInWithDiscord()
    auth.signOut()
    expect(auth.isSignedIn()).toBe(false)
    expect(auth.getCurrentUser()).toBeNull()
  })

  it('getCurrentUser returns the current user after sign in', async () => {
    const user = await auth.signInWithGoogle()
    expect(auth.getCurrentUser()).toEqual(user)
  })
})
