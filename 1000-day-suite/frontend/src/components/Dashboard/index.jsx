import { useState, useEffect } from 'react'
import { useVitals } from '../../hooks/useVitals'
import { useApp } from '../../context/AppContext'
import { useVoice } from '../../hooks/useVoice'
import { useTranslation } from '../../hooks/useTranslation'
import TrendsTab from './TrendsTab'
import ChatTab from './ChatTab'
import VitalsLogger from './VitalsLogger'
import LiveConsultation from '../LiveConsultation'

const TABS = [
  { id: 'overview', labelKey: 'overview' },
  { id: 'trends', labelKey: 'trends', icon: '📈' },
  { id: 'chat', labelKey: 'aiChat', icon: '🤖' },
  { id: 'logger', labelKey: 'logVitals', icon: '✍️' },
]

export default function Dashboard({ user, language }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isConsultOpen, setIsConsultOpen] = useState(false)
  const { vitals, latest, saveVitals, computeRisk } = useVitals(user?.id)
  const { speak } = useVoice(language)
  const { showToast } = useApp()
  const { t } = useTranslation()

  const v = latest || { bp_systolic: 128, bp_diastolic: 84, blood_sugar: 95, weight_kg: 62.4, risk_score: 42, risk_level: 'medium' }

  function speakCard(text) { speak(text, language) }

  return (
    <section className="dashboard-section" id="dashboard">
      <div className="section-tag">Personal Health Monitor</div>
      <h2 className="section-title">Your Health, <em style={{ fontStyle: 'italic', color: 'var(--rose-deep)' }}>Right Now</em></h2>
      <p className="section-desc">Speak to log vitals, hear your risk score, or ask anything — no reading required.</p>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {TABS.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {t(tab.labelKey)} {tab.icon || ''}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content active">
          <div className="dashboard-grid">
            {/* BP Card */}
            <div className="dash-card" onClick={() => speakCard(`Blood pressure is ${v.bp_systolic} over ${v.bp_diastolic}. ${v.bp_systolic >= 130 ? 'Slightly elevated. Please monitor.' : 'Normal range.'}`)}>
              <div className="dash-card-header">
                <span className="dash-card-title">{t('bloodPressure')}</span>
                <span className={`dash-card-badge ${v.bp_systolic >= 140 ? 'badge-alert' : v.bp_systolic >= 130 ? 'badge-watch' : 'badge-normal'}`}>
                  {v.bp_systolic >= 140 ? 'High 🔊' : v.bp_systolic >= 130 ? 'Watch 🔊' : 'Normal 🔊'}
                </span>
              </div>
              <div className="vital-value">{v.bp_systolic}<span className="vital-unit">/{v.bp_diastolic}</span></div>
              <div className="vital-unit">mmHg · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
              {user && <div style={{ fontSize: '0.72rem', color: 'var(--ink-light)', marginTop: 6 }}>🔴 Live from Supabase</div>}
            </div>

            {/* Blood Sugar */}
            <div className="dash-card" onClick={() => speakCard(`Blood sugar is ${v.blood_sugar} mg per dL.${v.blood_sugar <= 110 ? 'Normal range.' : 'Slightly elevated.'}`)}>
              <div className="dash-card-header">
                <span className="dash-card-title">{t('bloodSugar')}</span>
                <span className={`dash-card-badge ${v.blood_sugar > 140 ? 'badge-alert' : 'badge-normal'}`}>
                  {v.blood_sugar > 140 ? 'High 🔊' : 'Normal 🔊'}
                </span>
              </div>
              <div className="vital-value">{v.blood_sugar || 95}<span className="vital-unit"> mg/dL</span></div>
              <div className="vital-unit">Fasting · {new Date().toLocaleDateString('en-IN')}</div>
            </div>

            {/* Weight */}
            <div className="dash-card" onClick={() => speakCard(`Current weight is ${v.weight_kg} kilograms.`)}>
              <div className="dash-card-header">
                <span className="dash-card-title">{t('weight')}</span>
                <span className="dash-card-badge badge-normal">Tracking 🔊</span>
              </div>
              <div className="vital-value">{v.weight_kg || 62.4}<span className="vital-unit"> kg</span></div>
              <div className="vital-unit">+0.4 kg this week</div>
            </div>

            {/* AI Risk Score */}
            <div className="dash-card" onClick={() => speakCard(`AI Risk score is ${v.risk_score} out of 100. Risk level is ${v.risk_level}. ${v.risk_level === 'medium' ? 'Please consult your doctor within 3 days.' : ''}`)}>
              <div className="dash-card-header">
                <span className="dash-card-title">{t('riskScore')}</span>
                <span className={`dash-card-badge ${v.risk_level === 'high' ? 'badge-alert' : v.risk_level === 'medium' ? 'badge-watch' : 'badge-normal'}`}>
                  {v.risk_level?.charAt(0).toUpperCase() + v.risk_level?.slice(1)} 🔊
                </span>
              </div>
              <div className="vital-value" style={{ color: v.risk_level === 'high' ? '#E85454' : v.risk_level === 'medium' ? '#E8963A' : 'var(--sage-deep)' }}>
                {v.risk_score}<span style={{ fontSize: '1.2rem', fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: 8, height: 8, marginTop: 8 }}>
                <div style={{ height: 8, borderRadius: 8, width: `${v.risk_score}%`, background: v.risk_level === 'high' ? '#E85454' : v.risk_level === 'medium' ? '#E8963A' : 'var(--sage-deep)', transition: 'width 1s' }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-light)', marginTop: 6 }}>Gemini AI Assessment</div>
            </div>

            {/* Baby Growth */}
            <div className="dash-card" onClick={() => speakCard('Your baby is in week 24. Size of an ear of corn. WHO growth 54th percentile which is healthy.')}>
              <div className="dash-card-header"><span className="dash-card-title">Baby Growth</span><span className="dash-card-badge badge-normal">Normal 🔊</span></div>
              <div className="vital-value" style={{ color: 'var(--rose-deep)', fontSize: '2rem' }}>Week 24</div>
              <div className="vital-unit">Size of an ear of corn 🌽</div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginBottom: 4 }}>WHO Percentile</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--rose-deep)' }}>54th</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sage-deep)' }}>✓ Healthy range (25–75th)</div>
              </div>
            </div>

            {/* Next Appointment */}
            <div className="dash-card" onClick={() => speakCard('Next appointment with Doctor Priya Sharma on March 3rd 2026 at 11 AM. Video consultation.')}>
              <div className="dash-card-header"><span className="dash-card-title">{t('nextAppt')}</span><span className="dash-card-badge badge-normal">Confirmed 🔊</span></div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Dr. Priya Sharma</div>
                <div style={{ color: 'var(--ink-light)' }}>📅 March 3, 2026 · 11:00 AM</div>
                <div style={{ color: 'var(--ink-light)' }}>📹 Video Consultation</div>
                <div style={{ color: 'var(--ink-light)' }}>🏥 Ayushman Health Centre</div>
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 16, borderRadius: 12, fontSize: '0.8rem', padding: 10 }}
                onClick={(e) => { e.stopPropagation(); setIsConsultOpen(true); }}
              >
                Join Session
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: '14px 20px', background: 'rgba(155,126,217,0.08)', borderRadius: 12, border: '1.5px dashed var(--lavender-deep)', fontSize: '0.82rem', color: 'var(--lavender-deep)', display: 'flex', alignItems: 'center', gap: 10 }}>
            🔊 <strong>Tip:</strong> Tap any card above to hear it read aloud in your selected language! Data updates in real-time via Supabase.
          </div>
        </div>
      )}

      {activeTab === 'trends' && <TrendsTab vitals={vitals} />}
      {activeTab === 'chat' && <ChatTab user={user} language={language} />}
      {activeTab === 'logger' && <VitalsLogger user={user} language={language} onSave={saveVitals} computeRisk={computeRisk} showToast={showToast} speak={speakCard} />}

      {isConsultOpen && <LiveConsultation user={user} onClose={() => setIsConsultOpen(false)} />}
    </section>
  )
}
