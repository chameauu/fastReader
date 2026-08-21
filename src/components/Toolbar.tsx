import React, { useCallback } from 'react'
import './Toolbar.css'

export interface ToolbarProps {
  file?: File
  fileType?: string
  onOpenFile: () => void
  onFastRead: () => void
  currentPage?: number
  totalPages?: number
  zoom: number
  onZoomChange: (zoom: number) => void
  onPrevPage?: () => void
  onNextPage?: () => void
  onGoToPage?: (page: number) => void
  onToggleSidebar?: () => void
  isDark: boolean
  onToggleTheme: () => void
  isSidebarVisible: boolean
}

const ZOOM_MIN = 25
const ZOOM_MAX = 500
const ZOOM_STEP = 25

function ToolbarIcon({
  svg,
  label,
  onClick,
  disabled,
  className,
}: {
  svg: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      className={`toolbar__btn ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {svg}
    </button>
  )
}

const Toolbar: React.FC<ToolbarProps> = ({
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
  onToggleSidebar,
  isDark,
  onToggleTheme,
  isSidebarVisible,
}) => {
  const isPdf = fileType === 'pdf'

  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(zoom + ZOOM_STEP, ZOOM_MAX))
  }, [zoom, onZoomChange])

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(zoom - ZOOM_STEP, ZOOM_MIN))
  }, [zoom, onZoomChange])

  const handlePageInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10)
      if (!isNaN(val) && onGoToPage) {
        onGoToPage(val)
      }
    },
    [onGoToPage],
  )

  return (
    <div className="toolbar">
      <div className="toolbar__left">
        <ToolbarIcon
          label="Open file"
          onClick={onOpenFile}
          svg={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          }
        />

        {onToggleSidebar && (
          <ToolbarIcon
            label={isSidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            onClick={onToggleSidebar}
            className={isSidebarVisible ? 'toolbar__btn--active' : ''}
            svg={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            }
          />
        )}

        <div className="toolbar__separator" />

        <ToolbarIcon
          label="Previous page"
          onClick={onPrevPage}
          disabled={!isPdf || !onPrevPage || (currentPage !== undefined && currentPage <= 1)}
          svg={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          }
        />

        {isPdf && currentPage != null && totalPages != null && (
          <div className="toolbar__page-input">
            <input
              type="number"
              className="toolbar__page-field"
              value={currentPage}
              min={1}
              max={totalPages}
              onChange={handlePageInput}
              aria-label="Current page"
            />
            <span className="toolbar__page-total">/ {totalPages}</span>
          </div>
        )}

        <ToolbarIcon
          label="Next page"
          onClick={onNextPage}
          disabled={!isPdf || !onNextPage || (currentPage != null && totalPages != null && currentPage >= totalPages)}
          svg={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          }
        />
      </div>

      <div className="toolbar__center">
        <div className="toolbar__title">
          {file ? file.name : 'FastReader'}
        </div>
      </div>

      <div className="toolbar__right">
        <div className="toolbar__zoom-group">
          <ToolbarIcon
            label="Zoom out"
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_MIN}
            svg={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
          <span className="toolbar__zoom-label" aria-label={`Zoom level ${zoom} percent`}>
            {zoom}%
          </span>
          <ToolbarIcon
            label="Zoom in"
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_MAX}
            svg={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          />
        </div>

        <div className="toolbar__separator" />

        <ToolbarIcon
          label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
          svg={
            isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )
          }
        />

        <button className="toolbar__fast-read-btn" onClick={onFastRead} aria-label="Fast Read">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 1.76-.57 3.39-1.53 4.71l1.43 1.44A9.96 9.96 0 0 0 22 12.05c0-5.18-3.95-9.45-9-9.95zM12 19.95c-3.95-.49-7-3.85-7-7.93 0-1.76.57-3.39 1.53-4.71L5.1 5.87A9.96 9.96 0 0 0 2 12.05c0 5.18 3.95 9.45 9 9.95v2.02l-3.54-3.54 1.41-1.41L11 18.17V13h2v6.95l3.54-3.54 1.41 1.41L14 22v-2.05z" />
          </svg>
          <span>Fast Read</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
