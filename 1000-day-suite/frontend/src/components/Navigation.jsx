import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useTranslation } from '../hooks/useTranslation'

const LANGUAGES = [
  { code: 'en-IN', label: 'English' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'bn-IN', label: 'বাংলা' },
  { code: 'mr-IN', label: 'मराठी' },
  { code: 'gu-IN', label: 'ગુજરાતી' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' }
]

export default function Navigation({ user, onOpenVoice, onOpenAuth, onLogout }) {
  const { language, setLanguage } = useApp()

  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  const { t } = useTranslation()

  return (
    <nav className="nav-container">
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        🌸 {t('appName')}
      </div>
      <div className="nav-links">
        {['dashboard', 'feed', 'partner', 'qr'].map(id => (
          <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id) }}>
            {t(id) || id.charAt(0).toUpperCase() + id.slice(1)}
          </a>
        ))}
      </div>
      <div className="nav-right">
        <select
          className="lang-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <button className="nav-voice-btn" onClick={onOpenVoice}>🎙️</button>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>
              {user.role === 'mother' ? '🌸' : user.role === 'doctor' ? '👨‍⚕️' : '💚'} {user.name}
            </span>
            <button className="nav-voice-btn" style={{ background: 'var(--ink)', fontSize: '0.72rem', padding: '6px 14px' }} onClick={onLogout}>
              {t('logout')}
            </button>
          </div>
        ) : (
          <button className="nav-voice-btn" style={{ background: 'var(--rose-deep)' }} onClick={onOpenAuth}>
            {t('login')}
          </button>
        )}
        <div className="nav-badge">🔴 LIVE</div>
      </div>
    </nav>
  )
}
