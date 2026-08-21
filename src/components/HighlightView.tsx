import React, { useRef, useEffect, useCallback } from 'react'
import type { RsvpWord } from '../engine/types'
import './HighlightView.css'

interface HighlightViewProps {
  words: readonly RsvpWord[]
  currentIndex: number
  onSeekToIndex: (index: number) => void
}

const HighlightView: React.FC<HighlightViewProps> = ({ words, currentIndex, onSeekToIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentIndex])

  const handleClick = useCallback((index: number) => {
    onSeekToIndex(index)
  }, [onSeekToIndex])

  return (
    <div className="highlight-view" ref={containerRef}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={i === currentIndex ? activeRef : undefined}
          className={`highlight-word ${i === currentIndex ? 'highlight-word--active' : ''}`}
          onClick={() => handleClick(i)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick(i)
            }
          }}
        >
          {word.text}{' '}
        </span>
      ))}
    </div>
  )
}

export default HighlightView
