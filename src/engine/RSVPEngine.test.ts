import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RSVPEngine } from './RSVPEngine'
import type { RsvpWord } from './types'

describe('RSVPEngine', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  const words: RsvpWord[] = [
    { text: 'Hello', paragraphIndex: 0 },
    { text: 'world', paragraphIndex: 0 },
    { text: 'foo', paragraphIndex: 0 },
    { text: 'bar', paragraphIndex: 0 },
  ]

  it('start() advances index over time', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    expect(engine.getState().index).toBe(0)
    expect(engine.getState().playing).toBe(true)
    vi.advanceTimersByTime(200)
    expect(engine.getState().index).toBe(1)
    vi.advanceTimersByTime(200)
    expect(engine.getState().index).toBe(2)
    engine.destroy()
  })

  it('pause() stops advancement', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    vi.advanceTimersByTime(100)
    engine.pause()
    const idx = engine.getState().index
    vi.advanceTimersByTime(500)
    expect(engine.getState().index).toBe(idx)
    expect(engine.getState().playing).toBe(false)
    engine.destroy()
  })

  it('resume() continues from paused position', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    vi.advanceTimersByTime(200)
    expect(engine.getState().index).toBe(1)
    engine.pause()
    vi.advanceTimersByTime(200)
    expect(engine.getState().index).toBe(1)
    engine.resume()
    vi.advanceTimersByTime(200)
    expect(engine.getState().index).toBe(2)
    engine.destroy()
  })

  it('togglePlayPause alternates', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.togglePlayPause()
    expect(engine.getState().playing).toBe(true)
    engine.togglePlayPause()
    expect(engine.getState().playing).toBe(false)
    engine.togglePlayPause()
    expect(engine.getState().playing).toBe(true)
    engine.destroy()
  })

  it('nextWord() pauses and steps forward', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    expect(engine.getState().playing).toBe(true)
    engine.nextWord()
    expect(engine.getState().playing).toBe(false)
    expect(engine.getState().index).toBe(1)
    engine.destroy()
  })

  it('nextWord() clamps at last word', () => {
    const engine = new RSVPEngine()
    engine.loadWords(words)
    engine.nextWord()
    engine.nextWord()
    engine.nextWord()
    engine.nextWord()
    expect(engine.getState().index).toBe(3)
    engine.destroy()
  })

  it('prevWord() pauses and steps backward', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words, 2)
    engine.start()
    engine.prevWord()
    expect(engine.getState().playing).toBe(false)
    expect(engine.getState().index).toBe(1)
    engine.destroy()
  })

  it('prevWord() clamps at 0', () => {
    const engine = new RSVPEngine()
    engine.loadWords(words)
    engine.prevWord()
    engine.prevWord()
    expect(engine.getState().index).toBe(0)
    engine.destroy()
  })

  it('skipForward() clamps and preserves playing', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    engine.skipForward(2)
    expect(engine.getState().index).toBe(2)
    expect(engine.getState().playing).toBe(true)
    engine.skipForward(100)
    expect(engine.getState().index).toBe(3)
    engine.destroy()
  })

  it('skipBackward() clamps and preserves playing', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words, 1)
    engine.start()
    engine.skipBackward(100)
    expect(engine.getState().index).toBe(0)
    expect(engine.getState().playing).toBe(true)
    engine.destroy()
  })

  it('seekToIndex() clamps', () => {
    const engine = new RSVPEngine()
    engine.loadWords(words)
    engine.seekToIndex(100)
    expect(engine.getState().index).toBe(3)
    engine.seekToIndex(-5)
    expect(engine.getState().index).toBe(0)
    engine.seekToIndex(2)
    expect(engine.getState().index).toBe(2)
    engine.destroy()
  })

  it('seekToPosition() maps 0..1', () => {
    const engine = new RSVPEngine()
    engine.loadWords(words)
    engine.seekToPosition(0)
    expect(engine.getState().index).toBe(0)
    engine.seekToPosition(0.5)
    expect(engine.getState().index).toBe(2)
    engine.seekToPosition(1)
    expect(engine.getState().index).toBe(3)
    engine.seekToPosition(1.5)
    expect(engine.getState().index).toBe(3)
    engine.seekToPosition(-0.5)
    expect(engine.getState().index).toBe(0)
    engine.destroy()
  })

  it('increaseSpeed() clamps at 1000', () => {
    const engine = new RSVPEngine({ wpm: 960, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.increaseSpeed()
    expect(engine.getState().settings.wpm).toBe(1000)
    engine.increaseSpeed()
    expect(engine.getState().settings.wpm).toBe(1000)
    engine.destroy()
  })

  it('decreaseSpeed() clamps at 100', () => {
    const engine = new RSVPEngine({ wpm: 130, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.decreaseSpeed()
    expect(engine.getState().settings.wpm).toBe(100)
    engine.decreaseSpeed()
    expect(engine.getState().settings.wpm).toBe(100)
    engine.destroy()
  })

  it('speed change takes effect on next tick', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    vi.advanceTimersByTime(100)
    engine.increaseSpeed() // now 350 WPM
    expect(engine.getState().settings.wpm).toBe(350)
    vi.advanceTimersByTime(172)
    expect(engine.getState().index).toBe(1)
    engine.destroy()
  })

  it('punctuation adds punctuationPauseMs', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 100, countdownSeconds: 0 })
    const punctWords: RsvpWord[] = [
      { text: 'hello,', paragraphIndex: 0 },
      { text: 'world', paragraphIndex: 0 },
    ]
    engine.loadWords(punctWords)
    engine.start()
    vi.advanceTimersByTime(200)
    expect(engine.getState().index).toBe(0)
    vi.advanceTimersByTime(100)
    expect(engine.getState().index).toBe(1)
    engine.destroy()
  })

  it('reaching end sets finished=true and playing=false', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords([{ text: 'only', paragraphIndex: 0 }])
    engine.start()
    expect(engine.getState().finished).toBe(false)
    vi.advanceTimersByTime(200)
    expect(engine.getState().finished).toBe(true)
    expect(engine.getState().playing).toBe(false)
    engine.destroy()
  })

  it('finished not set when seeking to last word', () => {
    const engine = new RSVPEngine()
    engine.loadWords(words)
    engine.seekToIndex(3)
    expect(engine.getState().finished).toBe(false)
    engine.destroy()
  })

  it('stop() resets to index 0 and clears finished', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    vi.advanceTimersByTime(200)
    engine.stop()
    expect(engine.getState().index).toBe(0)
    expect(engine.getState().playing).toBe(false)
    expect(engine.getState().finished).toBe(false)
    engine.destroy()
  })

  it('state-change fires on every mutation', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    let count = 0
    engine.addEventListener('state-change', () => { count++ })
    engine.loadWords(words)
    const c1 = count
    engine.start()
    expect(count).toBeGreaterThan(c1)
    const c2 = count
    vi.advanceTimersByTime(200)
    expect(count).toBeGreaterThan(c2)
    engine.destroy()
  })

  it('destroy() clears pending timer', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    engine.destroy()
    vi.advanceTimersByTime(1000)
    expect(engine.getState().index).toBe(0)
  })

  it('getState() returns fresh snapshot', () => {
    const engine = new RSVPEngine()
    engine.loadWords(words)
    const s1 = engine.getState()
    const s2 = engine.getState()
    expect(s1).not.toBe(s2)
    expect(s1.settings).not.toBe(s2.settings)
    expect(s1).toEqual(s2)
    engine.destroy()
  })

  it('loadWords() resets finished', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords([{ text: 'x', paragraphIndex: 0 }])
    engine.start()
    vi.advanceTimersByTime(200)
    expect(engine.getState().finished).toBe(true)
    engine.loadWords(words)
    expect(engine.getState().finished).toBe(false)
    expect(engine.getState().index).toBe(0)
    engine.destroy()
  })

  it('updateSettings() applies clamped values and reschedules', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    engine.updateSettings({ wpm: 2000 })
    expect(engine.getState().settings.wpm).toBe(1000)
    engine.updateSettings({ wpm: 50 })
    expect(engine.getState().settings.wpm).toBe(100)
    engine.destroy()
  })

  it('start() is no-op when no words loaded', () => {
    const engine = new RSVPEngine()
    engine.start()
    expect(engine.getState().playing).toBe(false)
    engine.destroy()
  })

  it('start() is no-op when already playing', () => {
    const engine = new RSVPEngine({ wpm: 300, punctuationPauseMs: 0, countdownSeconds: 0 })
    engine.loadWords(words)
    engine.start()
    engine.start()
    expect(engine.getState().playing).toBe(true)
    engine.destroy()
  })

  it('resume() is no-op when no words', () => {
    const engine = new RSVPEngine()
    engine.resume()
    expect(engine.getState().playing).toBe(false)
    engine.destroy()
  })

  it('seekToPosition with empty words does nothing', () => {
    const engine = new RSVPEngine()
    engine.seekToPosition(0.5)
    expect(engine.getState().index).toBe(0)
    engine.destroy()
  })
})
