import React, { useState, useEffect, useCallback } from 'react'
import './CountdownOverlay.css'

interface CountdownOverlayProps {
  seconds: number
  onComplete: () => void
  onCancel: () => void
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ seconds, onComplete, onCancel }) => {
  const [count, setCount] = useState(seconds)

  useEffect(() => {
    if (count <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  const handleCancel = useCallback(() => {
    onCancel()
  }, [onCancel])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      handleCancel()
    }
    const onMouseDown = () => {
      handleCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [handleCancel])

  return (
    <div className="countdown-overlay" onClick={handleCancel}>
      <span className="countdown-number" key={count}>
        {count}
      </span>
    </div>
  )
}

export default CountdownOverlay
