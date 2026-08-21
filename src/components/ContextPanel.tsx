import React, { useRef, useEffect } from 'react'
import type { RsvpWord } from '../engine/types'
import './ContextPanel.css'

interface ContextPanelProps {
  words: readonly RsvpWord[]
  currentIndex: number
  collapsed: boolean
  onToggleCollapse: () => void
}

const ContextPanel: React.FC<ContextPanelProps> = ({ words, currentIndex, collapsed, onToggleCollapse }) => {
  const activeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (collapsed) return
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [currentIndex, collapsed])

  const paragraphIndex = words[currentIndex]?.paragraphIndex ?? 0
  const paragraphWords = words
    .map((w, i) => ({ ...w, globalIndex: i }))
    .filter(w => w.paragraphIndex === paragraphIndex)

  return (
    <div className={`context-panel ${collapsed ? 'context-panel--collapsed' : ''}`}>
      <button
        className="context-toggle"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show context' : 'Hide context'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="15" y2="18" />
        </svg>
        <span className="context-toggle-label">Context</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`context-chevron ${!collapsed ? 'context-chevron--open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {!collapsed && (
        <div className="context-body">
          {paragraphWords.map((w) => {
            const isActive = w.globalIndex === currentIndex
            return (
              <span
                key={w.globalIndex}
                ref={isActive ? activeRef : undefined}
                className={`context-word ${isActive ? 'context-word--active' : ''}`}
              >
                {w.text}{' '}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ContextPanel
