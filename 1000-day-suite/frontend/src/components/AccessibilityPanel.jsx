import { useState } from 'react'
import { useApp } from '../context/AppContext'

export function AccessibilityPanel({ onOpenVoice }) {
  const { largeText, setLargeText, highContrast, setHighContrast, iconMode, setIconMode } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className={`a11y-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Accessibility Settings"
        aria-label="Toggle Accessibility Menu"
      >
        ⚙️
      </button>

      <div className={`a11y-panel ${isOpen ? 'open' : ''}`}>
        <div>
          <button className={`a11y-btn ${largeText ? 'on' : ''}`} onClick={() => setLargeText(!largeText)} title="Large Text">Aa</button>
          <div className="a11y-label">Size</div>
        </div>
        <div>
          <button className={`a11y-btn ${highContrast ? 'on' : ''}`} onClick={() => setHighContrast(!highContrast)} title="High Contrast">◑</button>
          <div className="a11y-label">Contrast</div>
        </div>
        <div>
          <button className={`a11y-btn ${iconMode ? 'on' : ''}`} onClick={() => setIconMode(!iconMode)} title="Icon Mode">🖼️</button>
          <div className="a11y-label">Icons</div>
        </div>
        <div>
          <button className="a11y-btn" onClick={onOpenVoice} title="Voice">🔊</button>
          <div className="a11y-label">Read</div>
        </div>
      </div>
    </>
  )
}

export default AccessibilityPanel
