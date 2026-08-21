import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSettings,
  saveSettings,
  loadPosition,
  savePosition,
  loadDisplayMode,
  saveDisplayMode,
} from './persistence'
import { DEFAULT_SETTINGS } from './types'

beforeEach(() => {
  localStorage.clear()
})

describe('loadSettings / saveSettings', () => {
  it('returns defaults when nothing saved', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('roundtrips valid settings', () => {
    const s = { wpm: 500, punctuationPauseMs: 200, countdownSeconds: 2 }
    saveSettings(s)
    expect(loadSettings()).toEqual(s)
  })

  it('clamps out-of-range wpm', () => {
    saveSettings({ wpm: 50, punctuationPauseMs: 0, countdownSeconds: 0 })
    const loaded = loadSettings()
    expect(loaded.wpm).toBe(100)

    saveSettings({ wpm: 2000, punctuationPauseMs: 0, countdownSeconds: 0 })
    const loaded2 = loadSettings()
    expect(loaded2.wpm).toBe(1000)
  })

  it('clamps out-of-range punctuationPauseMs', () => {
    saveSettings({ wpm: 300, punctuationPauseMs: -10, countdownSeconds: 0 })
    expect(loadSettings().punctuationPauseMs).toBe(0)

    saveSettings({ wpm: 300, punctuationPauseMs: 999, countdownSeconds: 0 })
    expect(loadSettings().punctuationPauseMs).toBe(500)
  })

  it('clamps out-of-range countdownSeconds', () => {
    saveSettings({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: -1 })
    expect(loadSettings().countdownSeconds).toBe(0)

    saveSettings({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 10 })
    expect(loadSettings().countdownSeconds).toBe(3)
  })

  it('corrupt JSON returns defaults', () => {
    localStorage.setItem('fastreader:settings', '{bad json!!')
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('non-numeric fields fall back to defaults', () => {
    localStorage.setItem('fastreader:settings', JSON.stringify({ wpm: 'fast' }))
    const loaded = loadSettings()
    expect(loaded.wpm).toBe(DEFAULT_SETTINGS.wpm)
  })
})

describe('loadPosition / savePosition', () => {
  it('returns null when nothing saved', () => {
    expect(loadPosition('abc123')).toBeNull()
  })

  it('roundtrips position', () => {
    savePosition('doc1', 42)
    expect(loadPosition('doc1')).toBe(42)
  })

  it('different hashes are independent', () => {
    savePosition('doc1', 10)
    savePosition('doc2', 20)
    expect(loadPosition('doc1')).toBe(10)
    expect(loadPosition('doc2')).toBe(20)
  })

  it('corrupt position returns null', () => {
    localStorage.setItem('fastreader:position:abc', 'not-a-number')
    expect(loadPosition('abc')).toBeNull()
  })
})

describe('loadDisplayMode / saveDisplayMode', () => {
  it('returns null when nothing saved', () => {
    expect(loadDisplayMode()).toBeNull()
  })

  it('roundtrips valid modes', () => {
    for (const mode of ['split', 'focus', 'highlight'] as const) {
      saveDisplayMode(mode)
      expect(loadDisplayMode()).toBe(mode)
    }
  })

  it('invalid mode is not saved', () => {
    saveDisplayMode('invalid' as 'split')
    expect(loadDisplayMode()).toBeNull()
  })
})
