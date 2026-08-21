import React, { useCallback, useEffect, useRef, useState } from 'react'
import Toolbar, { type ToolbarProps } from './Toolbar'
import Sidebar, { type TocItem } from './Sidebar'
import ContextMenu from './ContextMenu'
import FileDropZone from './FileDropZone'
import './DocumentShell.css'

interface DocumentShellProps {
  file?: File
  fileType?: string
  children: React.ReactNode
  onOpenFile: () => void
  onFastRead: () => void
  onFastReadSelection?: (text: string) => void
  onFastReadChapter?: () => void
  onFastReadDocument?: () => void
  toc?: TocItem[]
  currentPage?: number
  totalPages?: number
  zoom: number
  onZoomChange: (zoom: number) => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
  onNavigate?: (href: string) => void
  currentHref?: string
  isDark: boolean
  onToggleTheme: () => void
}

const DocumentShell: React.FC<DocumentShellProps> = ({
  file,
  fileType,
  children,
  onOpenFile,
  onFastRead,
  onFastReadSelection,
  onFastReadChapter,
  onFastReadDocument,
  toc = [],
  currentPage,
  totalPages,
  zoom,
  onZoomChange,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onNavigate,
  currentHref,
  isDark,
  onToggleTheme,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    selectedText: string
  } | null>(null)

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim() || ''
      e.preventDefault()
      setContextMenu({ x: e.clientX, y: e.clientY, selectedText })
    },
    [],
  )

  const handleContextAction = useCallback(
    (actionId: string) => {
      setContextMenu(null)
      if (actionId === 'copy') {
        const selection = window.getSelection()
        if (selection && selection.toString()) {
          navigator.clipboard.writeText(selection.toString()).catch(() => {})
        }
      } else if (actionId === 'fast-read-selection' && contextMenu?.selectedText) {
        onFastReadSelection?.(contextMenu.selectedText)
      } else if (actionId === 'fast-read-chapter') {
        onFastReadChapter?.()
      } else if (actionId === 'fast-read-document') {
        onFastReadDocument?.()
      }
    },
    [contextMenu, onFastReadSelection, onFastReadChapter, onFastReadDocument],
  )

  const handleContextClose = useCallback(() => {
    setContextMenu(null)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'o':
            e.preventDefault()
            onOpenFile()
            break
          case 'l':
            e.preventDefault()
            toggleSidebar()
            break
          case '=':
          case '+':
            e.preventDefault()
            onZoomChange(Math.min(zoom + 25, 500))
            break
          case '-':
            e.preventDefault()
            onZoomChange(Math.max(zoom - 25, 25))
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onOpenFile, toggleSidebar, onZoomChange, zoom])

  const handleSidebarNavigate = useCallback(
    (href: string) => {
      onNavigate?.(href)
    },
    [onNavigate],
  )

  const sidebarVisible = sidebarOpen && toc.length > 0

  const toolbarProps: ToolbarProps = {
    file,
    fileType,
    onOpenFile,
    onFastRead,
    currentPage,
    totalPages,
    zoom,
    onZoomChange,
    onPrevPage,
    onNextPage,
    onGoToPage,
    onToggleSidebar: toc.length > 0 ? toggleSidebar : undefined,
    isDark,
    onToggleTheme,
    isSidebarVisible: sidebarVisible,
  }

  return (
    <FileDropZone onFileDrop={(_file: File) => onOpenFile()}>
      <div
        className={`document-shell ${sidebarVisible ? 'document-shell--sidebar-open' : ''}`}
        onContextMenu={handleContextMenu}
      >
        <Toolbar {...toolbarProps} />

        <div className="document-shell__body">
          {sidebarVisible && (
            <aside className="document-shell__sidebar">
              <Sidebar
                toc={toc}
                onNavigate={handleSidebarNavigate}
                currentHref={currentHref}
              />
            </aside>
          )}

          <main className="document-shell__content">
            {children}
          </main>
        </div>

        <footer className="document-shell__status-bar">
          <span>
            {fileType?.toUpperCase() || 'Document'}
            {currentPage != null && totalPages != null && (
              <> — Page {currentPage} of {totalPages}</>
            )}
          </span>
          {file && <span>{file.name}</span>}
        </footer>

        {contextMenu && (
          <ContextMenu
            position={{ x: contextMenu.x, y: contextMenu.y }}
            selectedText={contextMenu.selectedText}
            onClose={handleContextClose}
            onAction={handleContextAction}
          />
        )}
      </div>
    </FileDropZone>
  )
}

export default DocumentShell
