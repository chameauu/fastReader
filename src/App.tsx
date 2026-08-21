import { useState, useCallback, useMemo } from 'react'
import LandingScreen from './components/LandingScreen'
import ReaderScreen from './components/ReaderScreen'
import { hashContent } from './utils/hash'
import { loadPosition } from './engine/persistence'
import { useTheme } from './hooks/useTheme'
import './App.css'

type Screen = 'landing' | 'reader'

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [documentText, setDocumentText] = useState('')
  const [documentTitle, setDocumentTitle] = useState('')
  const { isDark, toggle: toggleTheme } = useTheme()

  const contentHash = useMemo(
    () => documentText ? hashContent(documentText) : '',
    [documentText],
  )

  const hasSavedPosition = useMemo(() => {
    if (!contentHash) return false
    const pos = loadPosition(contentHash)
    return pos !== null && pos > 0
  }, [contentHash])

  const handleStart = useCallback((text: string, title?: string) => {
    setDocumentText(text)
    setDocumentTitle(title || '')
    setScreen('reader')
  }, [])

  const handleClose = useCallback(() => {
    setScreen('landing')
  }, [])

  const handleResumeHint = useCallback(() => {
    setScreen('reader')
  }, [])

  return (
    <div className="app-shell">
      {screen === 'landing' ? (
        <LandingScreen
          onStart={handleStart}
          hasSavedPosition={hasSavedPosition}
          onResumeHint={handleResumeHint}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <ReaderScreen
          text={documentText}
          title={documentTitle}
          onClose={handleClose}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  )
}

export default App
