import { useState, useRef, useEffect } from 'react'
import { post } from '../../lib/api'
import { useVoice } from '../../hooks/useVoice'
import { subscribeToChat, unsubscribe } from '../../lib/supabase'
import { useApp } from '../../context/AppContext'

const QUICK_CMDS = [
  { text:'मेरा बीपी कैसा है?', display:'🇮🇳 "मेरा बीपी कैसा है?"' },
  { text:'నా ఆరోగ్యం ఎలా ఉంది?', display:'🟡 "నా ఆరోగ్యం ఎలా ఉంది?"' },
  { text:'What foods should I eat today?', display:'🥗 "What foods to eat today?"' },
  { text:'Is my baby growing well?', display:'👶 "Is my baby growing well?"' },
]

function ChatMessage({ msg }) {
  return (
    <div className={`chat-msg ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
      <div className="msg-bubble">{msg.content}</div>
      <div className="msg-time">{msg.time || 'Just now'}</div>
    </div>
  )
}

export default function ChatTab({ user, language }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:`Namaste! 🙏 I'm your voice-enabled AI health companion. I understand 8 Indian languages! How are you feeling today? (Tap 🎙️ to speak!)`, time:'Just now' }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sessionId, setSession] = useState(null)
  const [micActive, setMicActive] = useState(false)
  const messagesRef             = useRef(null)
  const { speak, startListening, stopListening, isListening, transcript } = useVoice(language)
  const { showToast } = useApp()

  useEffect(() => {
    messagesRef.current?.scrollTo(0, messagesRef.current.scrollHeight)
  }, [messages])

  // When voice transcript arrives, auto-send
  useEffect(() => {
    if (!isListening && transcript && micActive) {
      setInput(transcript)
      setMicActive(false)
      sendMessage(transcript)
    }
  }, [isListening, transcript])

  // Real-time chat subscription
  useEffect(() => {
    if (!user?.id || !sessionId) return
    const channel = subscribeToChat(user.id, sessionId, (msg) => {
      if (msg.role === 'assistant') {
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant' && last?.streaming) {
            return [...prev.slice(0,-1), { ...msg, time: 'Just now' }]
          }
          return [...prev, { ...msg, time: 'Just now' }]
        })
      }
    })
    return () => unsubscribe(channel)
  }, [user?.id, sessionId])

  async function sendMessage(text) {
    const msg = text || input
    if (!msg.trim()) return
    setInput('')
    setMessages(prev => [...prev, { role:'user', content:msg, time:'Just now' }])
    setLoading(true)

    try {
      const res = await post('/ai/chat', { message:msg, sessionId, language })
      setSession(res.sessionId)
      setMessages(prev => [...prev, { role:'assistant', content:res.response, time:'Just now' }])
      speak(res.response, language)
    } catch (e) {
      const errMsg = user ? 'AI temporarily unavailable.' : 'Please sign in for full AI conversation.'
      setMessages(prev => [...prev, { role:'assistant', content:errMsg, time:'Just now' }])
      showToast(errMsg, '⚠️')
    } finally {
      setLoading(false) }
  }

  function toggleMic() {
    if (micActive) { stopListening(); setMicActive(false) }
    else { setMicActive(true); startListening() }
  }

  const langLabel = { 'en-IN':'🇮🇳 English','hi-IN':'हि Hindi','te-IN':'తె Telugu','ta-IN':'த Tamil','bn-IN':'ব Bengali','mr-IN':'म Marathi' }

  return (
    <div className="tab-content active">
      <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:24,alignItems:'start'}}>
        <div className="chatbot-panel">
          <div className="chat-header">
            <div className="chat-avatar">🤖</div>
            <div style={{flex:1}}>
              <div className="chat-name">Gemini Health AI</div>
              <div className="chat-status"><span className="live-dot" />Online · Multilingual Voice Ready</div>
            </div>
            <div style={{fontSize:'0.72rem',background:'rgba(255,255,255,0.2)',padding:'4px 10px',borderRadius:99}}>
              {langLabel[language] || '🇮🇳 English'}
            </div>
          </div>

          <div className="chat-messages" ref={messagesRef}>
            {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
            {loading && (
              <div className="chat-msg ai">
                <div className="msg-bubble" style={{display:'flex',gap:4,alignItems:'center'}}>
                  <span style={{animation:'pulse 1s infinite',display:'inline-block'}}>●</span>
                  <span style={{animation:'pulse 1s 0.3s infinite',display:'inline-block'}}>●</span>
                  <span style={{animation:'pulse 1s 0.6s infinite',display:'inline-block'}}>●</span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              id="chatInput"
              placeholder="Type or 🎙️ speak your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
            />
            <button className={`chat-mic ${micActive ? 'active' : ''}`} onClick={toggleMic} title="Speak">🎙️</button>
            <button className="chat-send" onClick={() => sendMessage()}>➤</button>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="dash-card" style={{borderLeft:'4px solid var(--lavender-deep)'}}>
            <div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>
              🎙️ Voice Commands
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {QUICK_CMDS.map(cmd => (
                <button key={cmd.text} onClick={() => sendMessage(cmd.text)} style={{textAlign:'left',padding:'10px 14px',background:'var(--cream)',border:'1.5px solid rgba(0,0,0,0.08)',borderRadius:10,fontSize:'0.78rem',cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}>
                  {cmd.display}
                </button>
              ))}
            </div>
          </div>

          <div className="dash-card" style={{borderLeft:'4px solid var(--sage-deep)'}}>
            <div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.06em'}}>
              Today's Recommendations
            </div>
            <div style={{fontSize:'0.8rem',lineHeight:1.9,color:'var(--ink-light)'}}>
              🌅 Morning: Folic acid + iron<br />
              🥦 Noon: Spinach, dal, rice<br />
              🚶 4 PM: 20 min light walk<br />
              🛌 Rest: Left-side sleep<br />
              💊 Night: Calcium 500mg
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
