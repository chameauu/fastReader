import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import type { RsvpState, RsvpSettings } from '../engine/types'

interface RSVPEngineInstance {
  loadWords(words: Array<{ text: string; paragraphIndex: number }>, startIndex?: number): void
  start(): void
  pause(): void
  resume(): void
  togglePlayPause(): void
  stop(): void
  nextWord(): void
  prevWord(): void
  skipForward(n?: number): void
  skipBackward(n?: number): void
  seekToIndex(i: number): void
  seekToPosition(pos: number): void
  increaseSpeed(): void
  decreaseSpeed(): void
  updateSettings(patch: Partial<RsvpSettings>): void
  getState(): RsvpState
  destroy(): void
  addEventListener(type: string, handler: (e: Event) => void): void
  removeEventListener(type: string, handler: (e: Event) => void): void
}

export function useRSVP() {
  const engineRef = useRef<RSVPEngineInstance | null>(null)
  const [state, setState] = useState<RsvpState | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<RsvpState>).detail
      if (detail) setState(detail)
    }
    const engine = engineRef.current
    if (engine) {
      engine.addEventListener('state-change', handler)
      return () => engine.removeEventListener('state-change', handler)
    }
  }, [])

  const init = useCallback(async (settings?: RsvpSettings) => {
    const { RSVPEngine } = await import('../engine/RSVPEngine')
    if (engineRef.current) engineRef.current.destroy()
    const engine = new RSVPEngine(settings) as unknown as RSVPEngineInstance
    engineRef.current = engine
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<RsvpState>).detail
      if (detail) setState(detail)
    }
    engine.addEventListener('state-change', handler)
    setState(engine.getState())
  }, [])

  const actions = useMemo(() => ({
    loadWords: (words: Array<{ text: string; paragraphIndex: number }>, startIndex?: number) => {
      engineRef.current?.loadWords(words, startIndex)
    },
    start: () => engineRef.current?.start(),
    pause: () => engineRef.current?.pause(),
    resume: () => engineRef.current?.resume(),
    togglePlayPause: () => engineRef.current?.togglePlayPause(),
    stop: () => engineRef.current?.stop(),
    nextWord: () => engineRef.current?.nextWord(),
    prevWord: () => engineRef.current?.prevWord(),
    skipForward: (n?: number) => engineRef.current?.skipForward(n),
    skipBackward: (n?: number) => engineRef.current?.skipBackward(n),
    seekToIndex: (i: number) => engineRef.current?.seekToIndex(i),
    seekToPosition: (pos: number) => engineRef.current?.seekToPosition(pos),
    increaseSpeed: () => engineRef.current?.increaseSpeed(),
    decreaseSpeed: () => engineRef.current?.decreaseSpeed(),
    updateSettings: (patch: Partial<RsvpSettings>) => engineRef.current?.updateSettings(patch),
  }), [])

  useEffect(() => {
    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [])

  return { state, actions, init }
}
