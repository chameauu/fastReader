// FastReader — shared engine/UI contract.
// This is the single source of truth for data shapes between the RSVP engine
// (framework-agnostic, EventTarget) and the React UI layer.

/** A tokenized word/segment produced by textSplitter. */
export interface RsvpWord {
  /** The token text (punctuation attached as per Readest's utils.ts). */
  text: string
  /** Index of the paragraph this word belongs to (from splitTextIntoWords). */
  paragraphIndex: number
}

/** Persisted engine settings. */
export interface RsvpSettings {
  /** Words per minute (100–1000, step 50). */
  wpm: number
  /** Extra ms added when a word ends in punctuation (`,.!?;:` …). */
  punctuationPauseMs: number
  /** Pre-playback countdown: 0–3s. 0 = no countdown. */
  countdownSeconds: number
}

/** Engine runtime state snapshot (emitted on 'state-change'). */
export interface RsvpState {
  /** All words for the current document. */
  words: readonly RsvpWord[]
  /** Current word index (0-based) within `words`. */
  index: number
  /** Whether the motor is currently playing. */
  playing: boolean
  /** True when playback reaches the last word and stops naturally. */
  finished: boolean
  /** Active settings. */
  settings: RsvpSettings
}

/** Display modes toggled by the toolbar button / `M` key. */
export type DisplayMode = 'split' | 'focus' | 'highlight'

/** Default settings used by the engine and surfaced to the UI. */
export const DEFAULT_SETTINGS: RsvpSettings = {
  wpm: 300,
  punctuationPauseMs: 120,
  countdownSeconds: 1,
}

/** Storage keys used by persistence.ts (UI reads/writes through these helpers). */
export const STORAGE_KEYS = {
  settings: 'fastreader:settings',
  displayMode: 'fastreader:displayMode',
  position: (hash: string) => `fastreader:position:${hash}`,
} as const
