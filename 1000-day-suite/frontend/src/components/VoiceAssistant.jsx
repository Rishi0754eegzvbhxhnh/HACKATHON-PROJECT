import { useState, useEffect, useRef } from 'react'
import { useVoice, LANG_RESPONSES } from '../hooks/useVoice'
import { useApp } from '../context/AppContext'
import { post } from '../lib/api'

const LANG_BTNS = [
  { code:'en-IN', label:'🇮🇳 English' },
  { code:'hi-IN', label:'हि Hindi' },
  { code:'te-IN', label:'తె Telugu' },
  { code:'ta-IN', label:'த Tamil' },
  { code:'bn-IN', label:'ব Bengali' },
  { code:'mr-IN', label:'म Marathi' },
  { code:'gu-IN', label:'ગ Gujarati' },
  { code:'kn-IN', label:'ಕ Kannada' },
]

export default function VoiceAssistant({ open, onClose, user }) {
  const { language, setLanguage, showToast } = useApp()
  const { isListening, isSpeaking, transcript, status, setStatus,
          speak, toggleListening, stopListening, getLang } = useVoice(language)
  const [localTranscript, setLocalTranscript] = useState('Say a command or ask a health question in your language')
  const [aiResponse, setAiResponse] = useState('')
  const sessionRef = useRef(null)

  useEffect(() => {
    if (transcript) setLocalTranscript(transcript)
  }, [transcript])

  // When user stops speaking, send to Gemini
  useEffect(() => {
    if (!isListening && transcript && user) {
      handleAIQuery(transcript)
    }
  }, [isListening, transcript])

  async function handleAIQuery(text) {
    if (!text?.trim()) return
    try {
      const res = await post('/ai/chat', {
        message: text,
        sessionId: sessionRef.current,
        language
      })
      sessionRef.current = res.sessionId
      setAiResponse(res.response)
      speak(res.response, language)
      setStatus('AI responded')
    } catch (e) {
      const fallback = processCommand(text)
      if (fallback) speak(fallback, language)
    }
  }

  function processCommand(text) {
    const t = text.toLowerCase()
    const lang = getLang()
    if (t.includes('vital') || t.includes('bp') || t.includes('blood') || t.includes('बीपी') || t.includes('ఆరోగ్యం')) return lang.vitals
    if (t.includes('risk') || t.includes('score') || t.includes('जोखिम')) return lang.risk
    if (t.includes('doctor') || t.includes('डॉक्टर') || t.includes('డాక్టర్')) return lang.doctor
    if (t.includes('medicine') || t.includes('दवा') || t.includes('మందు')) return lang.medicine
    if (t.includes('diet') || t.includes('food') || t.includes('खाना') || t.includes('ఆహారం')) return lang.diet
    if (t.includes('baby') || t.includes('बच्चा') || t.includes('శిశువు')) return lang.baby
    if (t.includes('hospital') || t.includes('अस्पताल') || t.includes('ఆసుపత్రి')) return lang.hospital
    if (/emergency|help|मदद|సహాయం|உதவி|saayam/i.test(text)) return lang.emergency
    return lang.greeting
  }

  function voiceCommand(cmd) {
    const lang = getLang()
    const text = lang[cmd] || lang.greeting
    speak(text, language)
    setLocalTranscript(text)
    setStatus('Speaking...')

    if (cmd === 'emergency') {
      showToast('🚨 Emergency SOS activated!', '🚨')
      post('/alerts/emergency', {}).catch(() => {})
    }
  }

  if (!open) return null

  return (
    <div className={`voice-overlay active`}>
      <button className="voice-close" onClick={onClose}>✕</button>

      <div className="voice-lang-bar">
        {LANG_BTNS.map(l => (
          <button
            key={l.code}
            className={`voice-lang-btn ${language === l.code ? 'active' : ''}`}
            onClick={() => setLanguage(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="voice-orb-container">
        <div className="voice-rings">
          <div className="voice-ring" /><div className="voice-ring" /><div className="voice-ring" />
        </div>
        <div
          className={`voice-orb ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? '🔴' : isSpeaking ? '🔊' : '🎙️'}
        </div>
      </div>

      <div className={`voice-wave ${isListening || isSpeaking ? 'active' : ''}`}>
        {Array(7).fill(0).map((_, i) => <div key={i} className="wave-bar" />)}
      </div>

      <div className="voice-status">{status}</div>
      <div className="voice-transcript">
        {aiResponse || localTranscript}
      </div>

      <div className="voice-quick-commands">
        {[
          ['vitals', '❤️', 'My Vitals'],
          ['risk', '⚠️', 'Risk Check'],
          ['doctor', '👨‍⚕️', 'Call Doctor'],
          ['emergency', '🚨', 'Emergency'],
          ['medicine', '💊', 'Medicines'],
          ['diet', '🥗', 'Food Today'],
          ['baby', '👶', 'Baby Update'],
          ['hospital', '🏥', 'Hospital'],
        ].map(([cmd, icon, label]) => (
          <div key={cmd} className="voice-cmd-btn" onClick={() => voiceCommand(cmd)}>
            <span className="voice-cmd-icon">{icon}</span>
            <span className="voice-cmd-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
