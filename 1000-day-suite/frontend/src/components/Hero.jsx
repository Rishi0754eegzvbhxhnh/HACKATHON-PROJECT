import { useTranslation } from '../hooks/useTranslation'

export default function Hero({ onOpenVoice }) {
  const { t } = useTranslation()

  function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <section className="hero" id="home">
      <div className="hero-bg" />
      <div className="hero-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      <div className="hero-content">
        <div className="hero-eyebrow">AI-Powered Maternal Healthcare</div>
        <h1 className="hero-title">{t('heroTitle')}</h1>
        <p className="hero-subtitle">
          {t('heroSubtitle')}
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => scrollTo('dashboard')}>{t('dashboard')}</button>
          <button className="btn-voice-hero" onClick={onOpenVoice}>🎙️ {t('aiChat')}</button>
          <button className="btn-secondary" onClick={() => scrollTo('workflow')}>View Workflow</button>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat-card"><div className="stat-num">1000</div><div className="stat-label">Days Tracked</div></div>
        <div className="stat-card"><div className="stat-num">8</div><div className="stat-label">Languages</div></div>
        <div className="stat-card"><div className="stat-num">24/7</div><div className="stat-label">Voice AI</div></div>
        <div className="stat-card"><div className="stat-num">🔴 Live</div><div className="stat-label">Real-time Data</div></div>
      </div>
    </section>
  )
}
