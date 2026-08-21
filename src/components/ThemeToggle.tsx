import React from 'react'
import { SunIcon, MoonIcon } from './icons'
import './ThemeToggle.css'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <MoonIcon size={18} /> : <SunIcon size={18} />}
    </button>
  )
}

export default ThemeToggle
