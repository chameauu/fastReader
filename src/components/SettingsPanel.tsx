import React, { useCallback } from 'react'
import type { RsvpSettings } from '../engine/types'
import './SettingsPanel.css'

interface SettingsPanelProps {
  settings: RsvpSettings
  onUpdate: (patch: Partial<RsvpSettings>) => void
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onClose }) => {
  const handleWpmChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ wpm: Number(e.target.value) })
  }, [onUpdate])

  const handlePunctuationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ punctuationPauseMs: Number(e.target.value) })
  }, [onUpdate])

  const handleCountdownChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ countdownSeconds: Number(e.target.value) })
  }, [onUpdate])

  return (
    <div className="settings-panel" role="dialog" aria-label="Reading settings">
      <div className="settings-row">
        <label className="settings-label" htmlFor="wpm-slider">
          Speed
          <span className="settings-value">{settings.wpm} WPM</span>
        </label>
        <input
          id="wpm-slider"
          type="range"
          min={100}
          max={1000}
          step={50}
          value={settings.wpm}
          onChange={handleWpmChange}
          className="settings-range"
        />
      </div>

      <div className="settings-row">
        <label className="settings-label" htmlFor="punctuation-slider">
          Punctuation Pause
          <span className="settings-value">{settings.punctuationPauseMs}ms</span>
        </label>
        <input
          id="punctuation-slider"
          type="range"
          min={0}
          max={500}
          step={10}
          value={settings.punctuationPauseMs}
          onChange={handlePunctuationChange}
          className="settings-range"
        />
      </div>

      <div className="settings-row">
        <label className="settings-label" htmlFor="countdown-select">
          Countdown
        </label>
        <select
          id="countdown-select"
          value={settings.countdownSeconds}
          onChange={handleCountdownChange}
          className="settings-select"
        >
          <option value={0}>Off</option>
          <option value={1}>1s</option>
          <option value={2}>2s</option>
          <option value={3}>3s</option>
        </select>
      </div>

      <button className="settings-close" onClick={onClose} aria-label="Close settings">
        Done
      </button>
    </div>
  )
}

export default SettingsPanel
