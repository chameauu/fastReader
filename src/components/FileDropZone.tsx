import React, { useState, useCallback, useRef } from 'react'
import './FileDropZone.css'

const ACCEPTED_EXTENSIONS = ['.pdf', '.epub', '.txt', '.md']

interface FileDropZoneProps {
  children: React.ReactNode
  onFileDrop: (file: File) => void
}

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext),
  )
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ children, onFileDrop }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file && isAcceptedFile(file)) {
        onFileDrop(file)
      }
    },
    [onFileDrop],
  )

  return (
    <div
      className="file-drop-zone"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDragOver && (
        <div className="file-drop-zone__overlay" aria-hidden="true">
          <div className="file-drop-zone__message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <polyline points="9 14 12 11 15 14" />
            </svg>
            <p>Drop file to open</p>
            <span>PDF, EPUB, TXT, or MD</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileDropZone
