import React from 'react'
import { PlayIcon, PauseIcon, PrevIcon, NextIcon, SkipBackIcon, SkipForwardIcon, MinusIcon, PlusIcon } from './icons'
import './TransportControls.css'

interface TransportControlsProps {
  playing: boolean
  onTogglePlayPause: () => void
  onPrevWord: () => void
  onNextWord: () => void
  onSkipBack: () => void
  onSkipForward: () => void
  onDecreaseWpm: () => void
  onIncreaseWpm: () => void
  wpm: number
}

const TransportControls: React.FC<TransportControlsProps> = ({
  playing,
  onTogglePlayPause,
  onPrevWord,
  onNextWord,
  onSkipBack,
  onSkipForward,
  onDecreaseWpm,
  onIncreaseWpm,
  wpm,
}) => {
  return (
    <div className="transport-controls">
      <button className="transport-btn" onClick={onSkipBack} aria-label="Skip back 15 words" title="Back 15 words (Shift+Left)">
        <span className="transport-skip-label">15</span>
        <SkipBackIcon size={20} />
      </button>

      <button className="transport-btn" onClick={onDecreaseWpm} aria-label="Decrease speed" title="Slower (Left/Down)">
        <MinusIcon size={18} />
      </button>

      <button className="transport-btn" onClick={onPrevWord} aria-label="Previous word" title="Previous word (,)">
        <PrevIcon size={18} />
      </button>

      <button className="transport-btn transport-btn-play" onClick={onTogglePlayPause} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause (Space)' : 'Play (Space)'}>
        {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
      </button>

      <button className="transport-btn" onClick={onNextWord} aria-label="Next word" title="Next word (.)">
        <NextIcon size={18} />
      </button>

      <button className="transport-btn" onClick={onIncreaseWpm} aria-label="Increase speed" title="Faster (Right/Up)">
        <PlusIcon size={18} />
      </button>

      <button className="transport-btn" onClick={onSkipForward} aria-label="Skip forward 15 words" title="Forward 15 words (Shift+Right)">
        <SkipForwardIcon size={20} />
        <span className="transport-skip-label">15</span>
      </button>
    </div>
  )
}

export default TransportControls
