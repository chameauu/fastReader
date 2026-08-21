import type { RsvpWord, RsvpSettings, RsvpState } from './types'
import { DEFAULT_SETTINGS } from './types'
import { getPauseMultiplier } from './orp'

const PUNCTUATION_RE = /[.!?,;:—–…]$/

export class RSVPEngine extends EventTarget {
  private _words: readonly RsvpWord[] = []
  private _index = 0
  private _playing = false
  private _finished = false
  private _settings: RsvpSettings
  private _timer: ReturnType<typeof setTimeout> | null = null

  constructor(settings?: RsvpSettings) {
    super()
    this._settings = settings
      ? { ...DEFAULT_SETTINGS, ...settings }
      : { ...DEFAULT_SETTINGS }
  }

  loadWords(words: readonly RsvpWord[], startIndex: number = 0): void {
    this._clearTimer()
    this._words = words
    this._index = words.length > 0
      ? Math.max(0, Math.min(words.length - 1, startIndex))
      : 0
    this._finished = false
    this._emit()
  }

  start(): void {
    if (this._words.length === 0 || this._playing) return
    this._playing = true
    this._emit()
    this._scheduleNext()
  }

  pause(): void {
    this._clearTimer()
    this._playing = false
    this._emit()
  }

  resume(): void {
    if (this._words.length === 0 || this._playing) return
    this._playing = true
    this._emit()
    this._scheduleNext()
  }

  togglePlayPause(): void {
    if (this._playing) {
      this.pause()
    } else {
      this.resume()
    }
  }

  stop(): void {
    this._clearTimer()
    this._index = 0
    this._playing = false
    this._finished = false
    this._emit()
  }

  nextWord(): void {
    if (this._playing) this.pause()
    this._index = Math.min(this._words.length - 1, this._index + 1)
    this._emit()
  }

  prevWord(): void {
    if (this._playing) this.pause()
    this._index = Math.max(0, this._index - 1)
    this._emit()
  }

  skipForward(n: number = 15): void {
    const wasPlaying = this._playing
    this._clearTimer()
    this._index = Math.min(this._words.length - 1, this._index + n)
    this._emit()
    if (wasPlaying && this._words.length > 0) {
      this._scheduleNext()
    }
  }

  skipBackward(n: number = 15): void {
    const wasPlaying = this._playing
    this._clearTimer()
    this._index = Math.max(0, this._index - n)
    this._emit()
    if (wasPlaying && this._words.length > 0) {
      this._scheduleNext()
    }
  }

  seekToIndex(i: number): void {
    const wasPlaying = this._playing
    this._clearTimer()
    this._index = Math.max(0, Math.min(this._words.length - 1, i))
    this._emit()
    if (wasPlaying && this._words.length > 0) {
      this._scheduleNext()
    }
  }

  seekToPosition(p: number): void {
    if (this._words.length === 0) return
    const wasPlaying = this._playing
    this._clearTimer()
    const idx = Math.floor(p * this._words.length)
    this._index = Math.max(0, Math.min(this._words.length - 1, idx))
    this._emit()
    if (wasPlaying) {
      this._scheduleNext()
    }
  }

  increaseSpeed(): void {
    this._settings = { ...this._settings, wpm: Math.min(1000, this._settings.wpm + 50) }
    this._clearTimer()
    this._emit()
    if (this._playing) this._scheduleNext()
  }

  decreaseSpeed(): void {
    this._settings = { ...this._settings, wpm: Math.max(100, this._settings.wpm - 50) }
    this._clearTimer()
    this._emit()
    if (this._playing) this._scheduleNext()
  }

  updateSettings(patch: Partial<RsvpSettings>): void {
    const next = { ...this._settings }
    if (patch.wpm !== undefined) {
      next.wpm = Math.max(100, Math.min(1000, Math.round(patch.wpm)))
    }
    if (patch.punctuationPauseMs !== undefined) {
      next.punctuationPauseMs = Math.max(0, Math.min(500, Math.round(patch.punctuationPauseMs)))
    }
    if (patch.countdownSeconds !== undefined) {
      next.countdownSeconds = Math.max(0, Math.min(3, Math.round(patch.countdownSeconds)))
    }
    this._settings = next
    this._clearTimer()
    this._emit()
    if (this._playing) this._scheduleNext()
  }

  getState(): RsvpState {
    return {
      words: this._words,
      index: this._index,
      playing: this._playing,
      finished: this._finished,
      settings: { ...this._settings },
    }
  }

  destroy(): void {
    this._clearTimer()
    this._playing = false
  }

  private _scheduleNext(): void {
    this._clearTimer()
    if (!this._playing || this._words.length === 0) return

    if (this._index >= this._words.length) {
      this._finished = true
      this._playing = false
      this._emit()
      return
    }

    const word = this._words[this._index]!
    const baseMs = 60000 / this._settings.wpm
    let duration = baseMs * getPauseMultiplier(word.text)
    if (PUNCTUATION_RE.test(word.text)) {
      duration += this._settings.punctuationPauseMs
    }

    this._timer = setTimeout(() => {
      this._timer = null
      this._advanceToNextWord()
    }, duration)
  }

  private _advanceToNextWord(): void {
    this._index++
    if (this._index >= this._words.length) {
      this._finished = true
      this._playing = false
      this._emit()
      return
    }
    this._emit()
    this._scheduleNext()
  }

  private _clearTimer(): void {
    if (this._timer !== null) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }

  private _emit(): void {
    this.dispatchEvent(
      new CustomEvent('state-change', { detail: this.getState() }),
    )
  }
}
