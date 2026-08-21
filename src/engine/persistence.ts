import { DEFAULT_SETTINGS, STORAGE_KEYS } from './types'
import type { RsvpSettings } from './types'
import type { DisplayMode } from './types'

const VALID_DISPLAY_MODES: readonly DisplayMode[] = ['split', 'focus', 'highlight']

function clampSettings(raw: Record<string, unknown>): RsvpSettings {
  const wpm = typeof raw.wpm === 'number' ? raw.wpm : DEFAULT_SETTINGS.wpm
  const punctuationPauseMs =
    typeof raw.punctuationPauseMs === 'number'
      ? raw.punctuationPauseMs
      : DEFAULT_SETTINGS.punctuationPauseMs
  const countdownSeconds =
    typeof raw.countdownSeconds === 'number'
      ? raw.countdownSeconds
      : DEFAULT_SETTINGS.countdownSeconds

  return {
    wpm: Math.max(100, Math.min(1000, Math.round(wpm))),
    punctuationPauseMs: Math.max(0, Math.min(500, Math.round(punctuationPauseMs))),
    countdownSeconds: Math.max(0, Math.min(3, Math.round(countdownSeconds))),
  }
}

export function loadSettings(): RsvpSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      return clampSettings(parsed)
    }
  } catch {
    // corrupt JSON → fall through to defaults
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: RsvpSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
  } catch {
    // private-mode Safari or quota exceeded — silently ignore
  }
}

export function loadPosition(hash: string): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.position(hash))
    if (raw !== null) {
      const n = Number(raw)
      if (Number.isFinite(n) && n >= 0) return n
    }
  } catch {
    // ignore
  }
  return null
}

export function savePosition(hash: string, index: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.position(hash), String(index))
  } catch {
    // ignore
  }
}

export function loadDisplayMode(): DisplayMode | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.displayMode)
    if (raw && VALID_DISPLAY_MODES.includes(raw as DisplayMode)) {
      return raw as DisplayMode
    }
  } catch {
    // ignore
  }
  return null
}

export function saveDisplayMode(mode: DisplayMode): void {
  try {
    if (VALID_DISPLAY_MODES.includes(mode)) {
      localStorage.setItem(STORAGE_KEYS.displayMode, mode)
    }
  } catch {
    // ignore
  }
}
