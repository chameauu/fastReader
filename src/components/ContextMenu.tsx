import React, { useEffect, useRef, useCallback } from 'react'
import './ContextMenu.css'

export interface ContextMenuAction {
  id: string
  label: string
  icon?: React.ReactNode
  separator?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  position: { x: number; y: number }
  selectedText?: string
  onClose: () => void
  onAction: (actionId: string) => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  selectedText,
  onClose,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    },
    [onClose],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClickOutside, handleKeyDown])

  const menuItems: ContextMenuAction[] = [
    { id: 'copy', label: 'Copy' },
    { id: 'separator-1', label: '', separator: true },
    {
      id: 'fast-read-selection',
      label: 'Fast Read Selection',
      disabled: !selectedText,
    },
    { id: 'fast-read-chapter', label: 'Fast Read Chapter' },
    { id: 'fast-read-document', label: 'Fast Read Entire Document' },
  ]

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-label="Context menu"
    >
      {menuItems.map((item) => {
        if (item.separator) {
          return <div key={item.id} className="context-menu__separator" role="separator" />
        }
        return (
          <button
            key={item.id}
            className={`context-menu__item ${item.disabled ? 'context-menu__item--disabled' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                onAction(item.id)
              }
            }}
            disabled={item.disabled}
            role="menuitem"
          >
            <span className="context-menu__label">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default ContextMenu
