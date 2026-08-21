import { useEffect } from 'react'

interface ShortcutActions {
  togglePlayPause: () => void
  increaseSpeed: () => void
  decreaseSpeed: () => void
  skipForward: (n?: number) => void
  skipBackward: (n?: number) => void
  prevWord: () => void
  nextWord: () => void
  cycleMode: () => void
  closeReader: () => void
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          actions.togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) actions.skipBackward(15)
          else actions.decreaseSpeed()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) actions.skipForward(15)
          else actions.increaseSpeed()
          break
        case 'ArrowDown':
          e.preventDefault()
          actions.decreaseSpeed()
          break
        case 'ArrowUp':
          e.preventDefault()
          actions.increaseSpeed()
          break
        case ',':
          e.preventDefault()
          actions.prevWord()
          break
        case '.':
          e.preventDefault()
          actions.nextWord()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          actions.cycleMode()
          break
        case 'Escape':
          e.preventDefault()
          actions.closeReader()
          break
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [actions])
}
