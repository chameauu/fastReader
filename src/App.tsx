import { useState, useCallback, useRef } from 'react'
import HomeScreen from './components/HomeScreen'
import DocumentShell from './components/DocumentShell'
import EpubViewer, { type EpubViewerHandle } from './viewers/EpubViewer'
import PdfViewer from './viewers/PdfViewer'
import TextViewer from './viewers/TextViewer'
import ReaderScreen from './components/ReaderScreen'
import { useRecentFiles } from './hooks/useRecentFiles'
import { useTheme } from './hooks/useTheme'
import type { TocItem } from './viewers/TocItem'
import './App.css'

type Screen = 'home' | 'viewer' | 'rsvp'

function detectFileType(file: File): 'pdf' | 'epub' | 'txt' | 'md' {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'epub') return 'epub'
  if (ext === 'md') return 'md'
  return 'txt'
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<'pdf' | 'epub' | 'txt' | 'md' | null>(null)
  const [documentText, setDocumentText] = useState('')
  const [documentTitle, setDocumentTitle] = useState('')
  const [toc, setToc] = useState<TocItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [epubLocation, setEpubLocation] = useState<string | undefined>()

  const epubRef = useRef<EpubViewerHandle>(null)
  const { recentFiles, addRecentFile } = useRecentFiles()
  const { isDark, toggle: toggleTheme } = useTheme()

  const handleFileOpen = useCallback((f: File) => {
    const type = detectFileType(f)
    setFile(f)
    setFileType(type)
    setToc([])
    setCurrentPage(1)
    setTotalPages(1)
    setZoom(100)
    setEpubLocation(undefined)
    addRecentFile({
      name: f.name,
      path: f.name,
      type,
    })
    setScreen('viewer')
  }, [addRecentFile])

  const handleBackToHome = useCallback(() => {
    setScreen('home')
    setFile(null)
    setFileType(null)
  }, [])

  const extractTextAndLaunchRSVP = useCallback((text: string, title: string) => {
    setDocumentText(text)
    setDocumentTitle(title)
    setScreen('rsvp')
  }, [])

  const handleFastReadSelection = useCallback((text: string) => {
    extractTextAndLaunchRSVP(text, file?.name || '')
  }, [file, extractTextAndLaunchRSVP])

  const handleFastReadDocument = useCallback(() => {
    if (!file) return
    if (fileType === 'txt' || fileType === 'md') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text === 'string') {
          extractTextAndLaunchRSVP(text, file.name)
        }
      }
      reader.readAsText(file)
    }
    // For EPUB/PDF full-document extraction, we'll need dedicated extraction
    // logic per viewer. For now, selection-based fast read is the primary path.
  }, [file, fileType, extractTextAndLaunchRSVP])

  const handleFastReadChapter = useCallback(() => {
    // Chapter extraction requires viewer-specific logic.
    // For now, fall back to full document.
    handleFastReadDocument()
  }, [handleFastReadDocument])

  const handleCloseRSVP = useCallback(() => {
    setScreen('viewer')
  }, [])

  const handleNavigate = useCallback((href: string) => {
    if (fileType === 'epub') {
      setEpubLocation(href)
      epubRef.current?.display(href)
    }
  }, [fileType])

  const handlePrevPage = useCallback(() => {
    if (fileType === 'epub') {
      epubRef.current?.prev()
    } else if (currentPage > 1) {
      setCurrentPage((p) => p - 1)
    }
  }, [fileType, currentPage])

  const handleNextPage = useCallback(() => {
    if (fileType === 'epub') {
      epubRef.current?.next()
    } else if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1)
    }
  }, [fileType, currentPage, totalPages])

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <HomeScreen
          onFileOpen={handleFileOpen}
          recentFiles={recentFiles}
        />
      )}

      {screen === 'viewer' && file && (
        <DocumentShell
          file={file}
          fileType={fileType || undefined}
          toc={toc}
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          onZoomChange={setZoom}
          onOpenFile={handleBackToHome}
          onFastRead={() => handleFastReadDocument()}
          onFastReadSelection={handleFastReadSelection}
          onFastReadChapter={handleFastReadChapter}
          onFastReadDocument={() => handleFastReadDocument()}
          onNavigate={handleNavigate}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        >
          {fileType === 'epub' && (
            <EpubViewer
              ref={epubRef}
              file={file}
              onTextSelected={() => {}}
              onTocReady={setToc}
              onLocationChange={(loc) => {
                setCurrentPage(loc.current)
                setTotalPages(loc.total)
              }}
              currentLocation={epubLocation}
            />
          )}
          {fileType === 'pdf' && (
            <PdfViewer
              file={file}
              onTextSelected={() => {}}
              onLocationChange={(loc) => {
                setCurrentPage(loc.current)
                setTotalPages(loc.total)
              }}
              pageNumber={currentPage}
              scale={zoom / 100}
            />
          )}
          {(fileType === 'txt' || fileType === 'md') && (
            <TextViewer
              file={file}
              onTextSelected={() => {}}
            />
          )}
        </DocumentShell>
      )}

      {screen === 'rsvp' && (
        <ReaderScreen
          text={documentText}
          title={documentTitle}
          onClose={handleCloseRSVP}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  )
}

export default App
