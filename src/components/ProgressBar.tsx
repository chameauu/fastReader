import React, { useCallback, useRef } from 'react'
import { formatTimeRemaining } from '../utils/time'
import './ProgressBar.css'

interface ProgressBarProps {
  progress: number
  wordsTotal: number
  wordsRead: number
  wpm: number
  onSeek: (position: number) => void
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, wordsTotal, wordsRead, wpm, onSeek }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const getPercent = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    return (x / rect.width) * 100
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    onSeek(getPercent(e.clientX))
  }, [onSeek, getPercent])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    onSeek(getPercent(e.clientX))
  }, [onSeek, getPercent])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const wordsLeft = wordsTotal - wordsRead
  const remaining = formatTimeRemaining(wordsLeft * 60 / wpm)

  return (
    <div className="progress-bar-wrapper">
      <div className="progress-info">
        <span className="progress-percent">{Math.round(progress)}%</span>
        {remaining && <span className="progress-remaining">{remaining}</span>}
      </div>
      <div
        ref={trackRef}
        className="progress-track"
        role="slider"
        tabIndex={0}
        aria-label="Reading progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <div className="progress-thumb" style={{ left: `${progress}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
