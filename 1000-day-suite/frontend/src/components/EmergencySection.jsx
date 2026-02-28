import { useVoice } from '../hooks/useVoice'
import { useApp } from '../context/AppContext'
import { post } from '../lib/api'
import { useTranslation } from '../hooks/useTranslation'

export default function EmergencySection({ onOpenVoice, language }) {
  const { speak } = useVoice(language)
  const { showToast } = useApp()
  const { t } = useTranslation()

  async function triggerSOS() {
    showToast('🚨 Emergency SOS activated!', '🚨')

    // Initial warning while fetching GPS
    speak(t('emergency'), language)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await post('/alerts/emergency', { latitude: pos.coords.latitude, longitude: pos.coords.longitude })

          if (res.hospitals && res.hospitals.length > 0) {
            const hStr = res.hospitals.join(', ')
            showToast(`Hospitals found: ${hStr}`, '🏥')
            // Speak the located hospitals dynamically
            speak(`Help is arriving. Nearby hospitals located: ${hStr}. Please stay calm.`, language)
          } else {
            speak('Notifying your husband and contacting hospital. Please stay calm. Help is on the way. Call 108.', language)
          }
        } catch (e) {
          speak('Emergency triggered. Please call 108 immediately.', language)
        }
      }, () => {
        post('/alerts/emergency', {}).catch(() => { })
        speak('Emergency triggered. Please call 108 immediately.', language)
      })
    } else {
      post('/alerts/emergency', {}).catch(() => { })
      speak('Emergency triggered. Please call 108 immediately.', language)
    }
  }

  return (
    <section className="emergency-section" id="emergency">
      <div className="section-tag" style={{ color: '#E85454' }}>Emergency Protocol</div>
      <h2 className="section-title">When Risk = <em style={{ fontStyle: 'italic', color: '#E85454' }}>High</em></h2>
      <p className="section-desc">Say "Emergency" or "Help" in any language — voice-triggered SOS activates instantly.</p>

      <div className="emergency-flow">
        {[
          ['🎙️', 'Voice / AI Trigger', '"मदद करो" "Help me" "Saayam" activates SOS'],
          ['🗺️', 'Hospital Locator', 'Google Places API nearby hospitals'],
          ['🏥', 'Ayushman Filter', 'Government-scheme hospitals first'],
          ['📲', 'Notify Partner', 'Voice call + SMS in his language'],
          ['🚑', 'Ambulance 108', 'Auto-dials with voice brief'],
          ['👨‍⚕️', 'Doctor Notified', 'Full AI summary + audio log'],
        ].map(([icon, title, desc], i, arr) => (
          <>
            <div key={title} className={`emg-step ${i === 0 || i === arr.length - 1 ? 'alert-step' : ''}`}>
              <span className="emg-step-icon">{icon}</span>
              <div className="emg-step-title">{title}</div>
              <div className="emg-step-desc">{desc}</div>
            </div>
            {i < arr.length - 1 && <div key={`a${i}`} className="emg-arrow">→</div>}
          </>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: '24px 32px', background: 'white', borderRadius: 20, boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2rem' }}>🔴</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Emergency in any language:</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-light)' }}>
            "Help" · "मदद" · "సహాయం" · "உதவி" · "সাহায্য" · "मदत" · "ਮਦਦ" · "ಸಹಾಯ"
          </div>
        </div>
        <button className="btn-primary" style={{ marginLeft: 'auto', background: '#E85454', boxShadow: '0 4px 20px rgba(232,84,84,0.4)' }} onClick={triggerSOS}>
          🚨 Test Voice SOS (GPS)
        </button>
        <button className="btn-secondary" onClick={onOpenVoice}>🎙️ {t('openVoice')}</button>
      </div>
    </section>
  )
}
