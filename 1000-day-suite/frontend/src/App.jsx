import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { useAuth } from './hooks/useAuth'
import Navigation from './components/Navigation'
import VoiceAssistant from './components/VoiceAssistant'
import AccessibilityPanel from './components/AccessibilityPanel'
import Hero from './components/Hero'
import Workflow from './components/Workflow'
import Dashboard from './components/Dashboard'
import HealthFeed from './components/HealthFeed'
import PartnerSection from './components/PartnerSection'
import EmergencySection from './components/EmergencySection'
import QRSection from './components/QRSection'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import IconModeBar from './components/IconModeBar'
import DoctorDashboard from './components/DoctorDashboard'
import PartnerDashboard from './components/PartnerDashboard'

function AppInner() {
  const { user, login, register, logout } = useAuth()
  const { voiceOpen, setVoiceOpen, language, toast, largeText, highContrast, iconMode } = useApp()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className={`app ${largeText ? 'large-text' : ''} ${highContrast ? 'high-contrast' : ''}`}>
      <Navigation
        user={user}
        onOpenVoice={() => setVoiceOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={logout}
        language={language}
      />
      <AccessibilityPanel onOpenVoice={() => setVoiceOpen(true)} />

      {/* Main sections */}
      {(!user) && (
        <>
          <Hero onOpenVoice={() => setVoiceOpen(true)} />
          <Workflow />
          <QRSection />
        </>
      )}

      {(user?.role === 'mother') && (
        <>
          <Dashboard user={user} language={language} />
          <HealthFeed language={language} />
          <PartnerSection user={user} language={language} />
          <EmergencySection onOpenVoice={() => setVoiceOpen(true)} language={language} />
        </>
      )}

      {(user?.role === 'partner') && (
        <>
          <PartnerDashboard user={user} language={language} />
          <HealthFeed language={language} />
          <EmergencySection onOpenVoice={() => setVoiceOpen(true)} language={language} />
        </>
      )}

      {(user?.role === 'doctor') && (
        <>
          <DoctorDashboard user={user} language={language} />
        </>
      )}

      <footer>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', marginBottom: 12, color: 'white' }}>✦ 1000-Day Maternal &amp; Child Care Suite</div>
        <p>Built for Hackathon 2026 · <strong>Gemini AI</strong> · Supabase Realtime · Express.js · Web Speech API</p>
        <p style={{ marginTop: 8 }}>Voice-first, language-inclusive — accessible to every mother across India 🌸</p>
        <p style={{ marginTop: 8, fontSize: '0.72rem' }}>Supported: English · हिन्दी · తెలుగు · தமிழ் · বাংলা · मराठी · ગુજરાતી · ಕನ್ನಡ</p>
      </footer>

      {/* Overlays */}
      <VoiceAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} user={user} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={login} onRegister={register} />}
      {toast && <Toast message={toast.msg} icon={toast.icon} />}
      {iconMode && <IconModeBar onOpenVoice={() => setVoiceOpen(true)} />}

      {/* Floating voice button */}
      <button className="fab-voice" onClick={() => setVoiceOpen(true)} title="Voice Assistant">🎙️</button>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
