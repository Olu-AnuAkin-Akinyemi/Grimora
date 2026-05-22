import { describe, it, expect, beforeEach, vi } from 'vitest'
import { State } from '../app/state.js'

describe('State', () => {
  let state

  beforeEach(() => {
    localStorage.clear()
    state = new State()
  })

  it('initializes with cover view', () => {
    expect(state.currentView).toBe('cover')
  })

  it('initializes with no user', () => {
    expect(state.user).toBeNull()
  })

  it('sets view and emits viewChange', () => {
    const listener = vi.fn()
    state.on('viewChange', listener)
    state.setView('hub')
    expect(state.currentView).toBe('hub')
    expect(listener).toHaveBeenCalledWith({ from: 'cover', to: 'hub' })
  })

  it('persists user to localStorage on setUser', () => {
    const user = { id: 'abc', displayName: 'Initiate' }
    state.setUser(user)
    const stored = JSON.parse(localStorage.getItem('grimora_state'))
    expect(stored.user).toEqual(user)
  })

  it('loads persisted user on construction', () => {
    const user = { id: 'xyz', displayName: 'Adept' }
    localStorage.setItem('grimora_state', JSON.stringify({ user, progress: {} }))
    const fresh = new State()
    expect(fresh.user).toEqual(user)
  })

  it('clearUser sets user to null and persists', () => {
    state.setUser({ id: '1' })
    state.clearUser()
    expect(state.user).toBeNull()
    const stored = JSON.parse(localStorage.getItem('grimora_state'))
    expect(stored.user).toBeNull()
  })

  it('tracks lesson progress', () => {
    state.setLessonProgress('math-l1-01', 0.5)
    expect(state.getLessonProgress('math-l1-01')).toBe(0.5)
  })

  it('returns 0 for untracked lessons', () => {
    expect(state.getLessonProgress('unknown-lesson')).toBe(0)
  })

  it('emits progressChange when lesson progress updates', () => {
    const listener = vi.fn()
    state.on('progressChange', listener)
    state.setLessonProgress('math-l1-01', 1)
    expect(listener).toHaveBeenCalledWith({ lessonId: 'math-l1-01', progress: 1 })
  })

  it('clearStorage resets progress and removes localStorage key', () => {
    state.setLessonProgress('math-l1-01', 0.8)
    state.clearStorage()
    expect(state.progress).toEqual({})
    expect(localStorage.getItem('grimora_state')).toBeNull()
  })
})
