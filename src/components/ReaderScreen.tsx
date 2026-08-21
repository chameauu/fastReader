import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { RsvpWord, RsvpSettings, DisplayMode } from '../engine/types'
import { splitTextIntoWords } from '../engine/textSplitter'
import { hashContent } from '../utils/hash'
import { loadSettings, saveSettings, loadPosition, savePosition, loadDisplayMode, saveDisplayMode } from '../engine/persistence'
import { useRSVP } from '../hooks/useRSVP'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { CloseIcon, GearIcon, ModeSplitIcon, ModeFocusIcon, ModeHighlightIcon } from './icons'
import ThemeToggle from './ThemeToggle'
import SettingsPanel from './SettingsPanel'
import ContextPanel from './ContextPanel'
import FocalWord from './FocalWord'
import HighlightView from './HighlightView'
import TransportControls from './TransportControls'
import ProgressBar from './ProgressBar'
import CountdownOverlay from './CountdownOverlay'
import './ReaderScreen.css'

interface ReaderScreenProps {
  text: string
  title?: string
  onClose: () => void
  isDark: boolean
  onToggleTheme: () => void
}

const MODE_CYCLE: DisplayMode[] = ['split', 'focus', 'highlight']
const MODE_ICONS: Record<DisplayMode, React.FC<{ size?: number }>> = {
  split: ModeSplitIcon,
  focus: ModeFocusIcon,
  highlight: ModeHighlightIcon,
}
const MODE_LABELS: Record<DisplayMode, string> = {
  split: 'Split view',
  focus: 'Focus mode',
  highlight: 'Highlight view',
}

const ReaderScreen: React.FC<ReaderScreenProps> = ({ text, title, onClose, isDark, onToggleTheme }) => {
  const { state: rsvpState, actions, init } = useRSVP()
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => (loadDisplayMode() as DisplayMode) || 'split')
  const [showSettings, setShowSettings] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [settings, setSettings] = useState<RsvpSettings>(() => loadSettings())
  const hasStartedRef = useRef(false)

  const contentHash = useMemo(() => hashContent(text), [text])
  const words = useMemo(() => splitTextIntoWords(text), [text])

  useEffect(() => {
    init(settings)
  }, [])

  useEffect(() => {
    if (rsvpState) {
      actions.loadWords(words as Array<{ text: string; paragraphIndex: number }>, loadPosition(contentHash) ?? 0)
    }
  }, [rsvpState === null])

  const handleSettingsUpdate = useCallback((patch: Partial<RsvpSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      actions.updateSettings(patch)
      return next
    })
  }, [actions])

  const cycleMode = useCallback(() => {
    setDisplayMode(prev => {
      const idx = MODE_CYCLE.indexOf(prev)
      const next = MODE_CYCLE[(idx + 1) % MODE_CYCLE.length]
      saveDisplayMode(next)
      return next
    })
  }, [])

  const handleClose = useCallback(() => {
    if (rsvpState) {
      savePosition(contentHash, rsvpState.index)
    }
    actions.stop()
    onClose()
  }, [rsvpState, contentHash, actions, onClose])

  const handlePlayPause = useCallback(() => {
    if (!rsvpState) return
    if (
      !rsvpState.playing &&
      !hasStartedRef.current &&
      !rsvpState.finished &&
      rsvpState.settings.countdownSeconds > 0
    ) {
      setShowCountdown(true)
      return
    }
    hasStartedRef.current = true
    if (rsvpState.finished) actions.seekToIndex(0)
    actions.togglePlayPause()
  }, [rsvpState, actions])

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false)
    hasStartedRef.current = true
    actions.start()
  }, [actions])

  const handleCountdownCancel = useCallback(() => {
    setShowCountdown(false)
  }, [])

  const handleSkipBack = useCallback(() => actions.skipBackward(15), [actions])
  const handleSkipForward = useCallback(() => actions.skipForward(15), [actions])
  const handleDecreaseWpm = useCallback(() => actions.decreaseSpeed(), [actions])
  const handleIncreaseWpm = useCallback(() => actions.increaseSpeed(), [actions])

  const keyboardActions = useMemo(() => ({
    togglePlayPause: handlePlayPause,
    increaseSpeed: handleIncreaseWpm,
    decreaseSpeed: handleDecreaseWpm,
    skipForward: handleSkipForward,
    skipBackward: handleSkipBack,
    prevWord: actions.prevWord,
    nextWord: actions.nextWord,
    cycleMode,
    closeReader: handleClose,
  }), [handlePlayPause, handleIncreaseWpm, handleDecreaseWpm, handleSkipForward, handleSkipBack, actions, cycleMode, handleClose])

  useKeyboardShortcuts(keyboardActions)

  const currentWord = rsvpState ? rsvpState.words[rsvpState.index] ?? null : null
  const progress = rsvpState && rsvpState.words.length > 0
    ? (rsvpState.index / rsvpState.words.length) * 100
    : 0
  const playing = rsvpState?.playing ?? false
  const ModeIcon = MODE_ICONS[displayMode]

  return (
    <div className="reader-screen reader-view">
      {showCountdown && (
        <CountdownOverlay
          seconds={settings.countdownSeconds}
          onComplete={handleCountdownComplete}
          onCancel={handleCountdownCancel}
        />
      )}

      <header className="reader-header">
        <button className="reader-header-btn" onClick={handleClose} aria-label="Close reader" title="Close (Esc)">
          <CloseIcon size={20} />
        </button>
        <span className="reader-title">{title || 'FastReader'}</span>
        <div className="reader-header-actions">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button
            className="reader-header-btn"
            onClick={() => setShowSettings(s => !s)}
            aria-label="Settings"
            title="Settings"
          >
            <GearIcon size={18} />
          </button>
          <button
            className="reader-header-btn"
            onClick={cycleMode}
            aria-label={MODE_LABELS[displayMode]}
            title={MODE_LABELS[displayMode]}
          >
            <ModeIcon size={18} />
          </button>
        </div>
      </header>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}

      <main className="reader-body">
        {displayMode === 'split' && (
          <>
            <ContextPanel
              words={rsvpState?.words ?? []}
              currentIndex={rsvpState?.index ?? 0}
              collapsed={contextCollapsed}
              onToggleCollapse={() => setContextCollapsed(c => !c)}
            />
            <FocalWord word={currentWord} />
          </>
        )}
        {displayMode === 'focus' && (
          <FocalWord word={currentWord} />
        )}
        {displayMode === 'highlight' && (
          <HighlightView
            words={rsvpState?.words ?? []}
            currentIndex={rsvpState?.index ?? 0}
            onSeekToIndex={actions.seekToIndex}
          />
        )}
      </main>

      <footer className="reader-footer">
        <ProgressBar
          progress={progress}
          wordsTotal={rsvpState?.words.length ?? 0}
          wordsRead={rsvpState?.index ?? 0}
          wpm={rsvpState?.settings.wpm ?? settings.wpm}
          onSeek={actions.seekToPosition}
        />
        <TransportControls
          playing={playing}
          onTogglePlayPause={handlePlayPause}
          onPrevWord={actions.prevWord}
          onNextWord={actions.nextWord}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onDecreaseWpm={handleDecreaseWpm}
          onIncreaseWpm={handleIncreaseWpm}
          wpm={rsvpState?.settings.wpm ?? settings.wpm}
        />
      </footer>
    </div>
  )
}

export default ReaderScreen
