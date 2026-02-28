import { useState, useEffect } from 'react'
import { useVoice } from '../hooks/useVoice'
import { subscribeToAlerts, unsubscribe } from '../lib/supabase'
import { useApp } from '../context/AppContext'

const STATIC_CARDS = [
  { icon:'🚨', title:'Risk Alert — Check on Priya', desc:'Her BP reading was 128/84 today with morning headaches. Ensure she rests, avoids stress, drinks 8+ glasses of water.', urgent:true, voice:"Alert! Your wife Priya has slightly elevated blood pressure today. Please ensure she drinks plenty of water and rests. If blood pressure goes above 140 over 90, please call Doctor Sharma immediately." },
  { icon:'🥗', title:"Today's Meal Guide", desc:'Breakfast: Poha with peanuts + milk. Lunch: Dal, palak, roti, rice, salad. Dinner: Khichdi with ghee + fruit. Avoid salty snacks.', voice:"Today meal plan: Breakfast is poha with peanuts and milk. Lunch is dal, spinach, roti, rice and salad. Dinner is khichdi with ghee and fruit. Avoid salty and fried food today." },
  { icon:'💊', title:'Medication Reminders', desc:'✅ Morning: Folic acid (given). ⏰ Afternoon: Iron tablet at 2 PM with water. 🕘 Night: Calcium 500mg at bedtime.', good:true, voice:"Medication reminder: Morning folic acid is done. Afternoon iron tablet at 2 PM with water, not milk. Night calcium 500 milligrams at bedtime." },
  { icon:'🏥', title:'Nearest Hospitals', desc:'1. AIIMS Hyderabad — 3.2 km (Ayushman). 2. Fernandez Hospital — 5.1 km. 3. Rainbow Hospital — 6.4 km. Emergency: 108', voice:"Nearest hospitals: AIIMS Hyderabad is 3.2 kilometers away and accepts Ayushman Bharat. Fernandez 5.1km. Rainbow 6.4km. For ambulance call 108." },
  { icon:'🌸', title:'Emotional Support Tips', desc:"Week 24 can bring anxiety. Spend 20 minutes for a calm conversation. A gentle foot massage reduces BP and cortisol significantly.", good:true, voice:"Emotional support tip: Week 24 can be anxious for your wife. Please spend 20 quiet minutes together tonight. A gentle foot massage can reduce blood pressure and help her sleep better." },
  { icon:'📋', title:'Baby Growth Update', desc:'Your baby is ~30cm long — size of an ear of corn! 🌽 Hearing is developing. Talk to the baby. WHO charts all normal.', voice:"Baby update! Your baby is 30 centimeters long, the size of an ear of corn. The baby can now hear sounds, so please talk to the baby regularly. All WHO growth chart measurements are normal this week." },
]

export default function PartnerSection({ user, language }) {
  const { speak } = useVoice(language)
  const { showToast } = useApp()
  const [liveAlerts, setLiveAlerts] = useState([])

  // Subscribe to real-time partner alerts
  useEffect(() => {
    if (!user?.id || user.role !== 'partner') return
    const ch = subscribeToAlerts(user.id, alert => {
      setLiveAlerts(prev => [alert, ...prev])
      showToast(alert.message, '🚨')
      speak(alert.message, language)
    })
    return () => unsubscribe(ch)
  }, [user?.id])

  return (
    <section className="partner-section" id="partner">
      <div className="section-tag">Partner Support System</div>
      <h2 className="section-title">Husband &amp; <em style={{fontStyle:'italic',color:'var(--lavender-deep)'}}>Partner Dashboard</em></h2>
      <p className="section-desc">Voice alerts, caregiving tips, and meal guidance in your partner's preferred dialect.</p>

      {/* Live alerts from Supabase */}
      {liveAlerts.length > 0 && liveAlerts.map((alert,i) => (
        <div key={i} className="partner-card urgent" style={{marginBottom:16}}>
          <span className="partner-card-icon">🔴</span>
          <div className="partner-card-title" style={{color:'#E85454'}}>Live Alert — {new Date(alert.created_at).toLocaleTimeString()}</div>
          <div className="partner-card-desc">{alert.message}</div>
          <a className="partner-card-action" onClick={() => speak(alert.message, language)}>🔊 Play Alert</a>
        </div>
      ))}

      <div className="partner-grid">
        {STATIC_CARDS.map((card, i) => (
          <div key={i} className={`partner-card ${card.urgent ? 'urgent' : card.good ? 'good' : ''}`}>
            <span className="partner-card-icon">{card.icon}</span>
            <div className="partner-card-title" style={card.urgent ? {color:'#E85454'} : {}}>{card.title}</div>
            <div className="partner-card-desc">{card.desc}</div>
            <a className="partner-card-action" style={card.good?{color:'var(--sage-deep)'}:{color:'var(--lavender-deep)'}} onClick={() => speak(card.voice, language)}>
              🔊 Play Alert
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
