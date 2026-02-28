import { useVoice } from '../hooks/useVoice'
import { useApp } from '../context/AppContext'

export default function IconModeBar({ onOpenVoice }) {
  const { language } = useApp()
  const { speak } = useVoice(language)

  const actions = {
    vitals:    'Checking your health vitals now.',
    doctor:    'Connecting to your doctor.',
    medicine:  'Folic acid, iron tablet, calcium. Take as prescribed.',
    food:      'Eat spinach, dal, roti, fruit today. Drink plenty of water.',
    baby:      'Your baby is growing well. Week 24. Healthy size.',
    emergency: 'Emergency! Call 108 now! Stay calm.'
  }

  return (
    <div className="icon-mode-bar">
      {[['vitals','❤️','Health'],['doctor','👨‍⚕️','Doctor'],['medicine','💊','Medicine'],['food','🥗','Food'],['baby','👶','Baby']].map(([k,icon,label]) => (
        <button key={k} className="icon-action-btn" onClick={() => speak(actions[k], language)}>
          <span className="icon">{icon}</span>
          <span className="label">{label}</span>
        </button>
      ))}
      <button className="icon-action-btn" style={{borderColor:'#E85454',background:'#FFF0F0'}} onClick={() => speak(actions.emergency, language)}>
        <span className="icon">🚨</span>
        <span className="label" style={{color:'#E85454'}}>Help</span>
      </button>
      <button className="icon-action-btn" style={{borderColor:'var(--lavender-deep)',background:'#F0EBFF'}} onClick={onOpenVoice}>
        <span className="icon">🎙️</span>
        <span className="label" style={{color:'var(--lavender-deep)'}}>Speak</span>
      </button>
    </div>
  )
}
