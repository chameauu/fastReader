import React, { useState, useCallback, useRef } from 'react'
import ThemeToggle from './ThemeToggle'
import './LandingScreen.css'

interface LandingScreenProps {
  onStart: (text: string, title?: string) => void
  hasSavedPosition: boolean
  onResumeHint: () => void
  isDark: boolean
  onToggleTheme: () => void
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart, hasSavedPosition, onResumeHint, isDark, onToggleTheme }) => {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleStart = useCallback(() => {
    if (!text.trim()) return
    onStart(text.trim(), title.trim() || undefined)
  }, [text, title, onStart])

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const content = reader.result as string
      setText(content)
      setTitle(file.name.replace(/\.(txt|md)$/, ''))
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.md'))) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="landing-screen">
      <div className="landing-theme-toggle">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
      <div className="landing-content">
        <h1 className="landing-title">FastReader</h1>
        <p className="landing-subtitle">Speed reading, distilled</p>

        {hasSavedPosition && (
          <button className="landing-resume-hint" onClick={onResumeHint}>
            You have a saved reading position
          </button>
        )}

        <div
          className={`landing-dropzone ${dragOver ? 'landing-dropzone--active' : ''} ${text ? 'landing-dropzone--has-text' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileChange}
            className="visually-hidden"
            aria-label="Choose a text or markdown file"
          />
          {text ? (
            <div className="landing-file-info">
              <span className="landing-file-icon">📄</span>
              <span className="landing-file-name">{title || 'Pasted text'}</span>
            </div>
          ) : (
            <div className="landing-drop-hint">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="landing-upload-icon">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Drop a .txt or .md file, or click to browse</span>
            </div>
          )}
        </div>

        <div className="landing-divider">
          <span>or paste text below</span>
        </div>

        <textarea
          className="landing-textarea"
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          aria-label="Text to read"
        />

        {text && (
          <input
            className="landing-title-input"
            placeholder="Document title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Document title"
          />
        )}

        <div className="landing-footer">
          {wordCount > 0 && (
            <span className="landing-word-count">
              {wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            className="landing-start-btn"
            onClick={handleStart}
            disabled={!text.trim()}
          >
            Start Reading
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingScreen
