import React, { useState, useCallback } from 'react'
import './Sidebar.css'

export interface TocItem {
  label: string
  href: string
  children?: TocItem[]
}

interface SidebarProps {
  toc: TocItem[]
  onNavigate: (href: string) => void
  currentHref?: string
}

function TocEntry({
  item,
  currentHref,
  onNavigate,
  depth,
}: {
  item: TocItem
  currentHref?: string
  onNavigate: (href: string) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const isActive = item.href === currentHref
  const hasChildren = item.children && item.children.length > 0

  const handleClick = useCallback(() => {
    onNavigate(item.href)
  }, [item.href, onNavigate])

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setExpanded((prev) => !prev)
    },
    [],
  )

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={`sidebar__toc-item ${isActive ? 'sidebar__toc-item--active' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <button
            className="sidebar__expander"
            onClick={handleToggle}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              width="8"
              height="10"
              viewBox="0 0 8 10"
              className={expanded ? 'sidebar__expander-icon--expanded' : ''}
              fill="currentColor"
            >
              <polygon points="0 0, 8 5, 0 10" />
            </svg>
          </button>
        )}
        <span className="sidebar__toc-label">{item.label}</span>
      </div>
      {hasChildren && expanded && (
        <ul role="group" className="sidebar__toc-list">
          {item.children!.map((child) => (
            <TocEntry
              key={child.href}
              item={child}
              currentHref={currentHref}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

const Sidebar: React.FC<SidebarProps> = ({ toc, onNavigate, currentHref }) => {
  if (toc.length === 0) {
    return (
      <div className="sidebar__empty">
        <p>No table of contents available.</p>
      </div>
    )
  }

  return (
    <nav className="sidebar" role="navigation" aria-label="Table of contents">
      <div className="sidebar__header">
        <h2 className="sidebar__title">Contents</h2>
      </div>
      <div className="sidebar__body">
        <ul role="tree" className="sidebar__toc-list">
          {toc.map((item) => (
            <TocEntry
              key={item.href}
              item={item}
              currentHref={currentHref}
              onNavigate={onNavigate}
              depth={0}
            />
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Sidebar
