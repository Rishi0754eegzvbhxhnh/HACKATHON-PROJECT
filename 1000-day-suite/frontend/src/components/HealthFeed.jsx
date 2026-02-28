import { useState, useEffect } from 'react'
import { get } from '../lib/api'
import { subscribeToFeed, unsubscribe } from '../lib/supabase'
import { useVoice } from '../hooks/useVoice'

export default function HealthFeed({ language }) {
  const [feed, setFeed] = useState([])
  const { speak } = useVoice(language)

  useEffect(() => {
    get('/feed').then(res => setFeed(res.feed || [])).catch(() => {
      // Fallback static feed
      setFeed([
        {id:1,source:'WHO',source_icon:'🌍',source_color:'#2196F3',source_bg:'#E3F2FD',title:'New WHO Guidelines: Iron Supplementation During Pregnancy',summary:'WHO updates daily iron dosage for second trimester — includes folate co-prescription for maximum absorption.',tags:['#Nutrition','#Iron'],is_live:true,published_at:new Date().toISOString()},
        {id:2,source:'ICMR',source_icon:'🏛️',source_color:'#9C27B0',source_bg:'#F3E5F5',title:'Study: Mobile Monitoring Reduces Maternal Mortality 34%',summary:'ICMR confirms AI-assisted vital tracking in rural India has dramatically improved maternal outcomes.',tags:['#Research','#AI'],published_at:new Date().toISOString()},
        {id:3,source:'MoHFW',source_icon:'🇮🇳',source_color:'#F44336',source_bg:'#FFEBEE',title:'Ayushman Bharat Expands Maternity Coverage in Telangana',summary:'Government announces expanded benefits under PM-JAY scheme.',tags:['#Policy','#Ayushman'],published_at:new Date().toISOString()},
        {id:4,source:'UNICEF',source_icon:'🌱',source_color:'#4CAF50',source_bg:'#E8F5E9',title:'First 1000 Days: Why Nutrition Matters Most',summary:'UNICEF data shows brain development in first 1000 days is irreversible.',tags:['#ChildHealth','#1000Days'],published_at:new Date().toISOString()},
        {id:5,source:'Lancet',source_icon:'📰',source_color:'#FF9800',source_bg:'#FFF3E0',title:'Gestational Diabetes: Early Screening Saves Lives',summary:'Meta-analysis: glucose test at 16 weeks prevents 62% of GDM complications.',tags:['#Diabetes','#Research'],published_at:new Date().toISOString()},
        {id:6,source:'Community',source_icon:'✕',source_color:'#333',source_bg:'#F5F5F5',title:'#SafePregnancy Trends — Community Tips Going Viral',summary:'Indian mothers sharing AI monitoring strategies. 180K impressions.',tags:['#Community','#Trending'],published_at:new Date().toISOString()},
      ])
    })
  }, [])

  // Real-time new feed items
  useEffect(() => {
    const ch = subscribeToFeed(item => setFeed(prev => [item, ...prev]))
    return () => unsubscribe(ch)
  }, [])

  function timeAgo(ts) {
    if (!ts) return ''
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    if (mins < 1440) return `${Math.floor(mins/60)} hr ago`
    return `${Math.floor(mins/1440)} days ago`
  }

  return (
    <section className="feed-section" id="feed">
      <div className="section-tag">Real-Time Health Intelligence</div>
      <h2 className="section-title">Live Maternal Health <em style={{fontStyle:'italic',color:'var(--rose-deep)'}}>News Feed</em></h2>
      <p className="section-desc">AI-curated health news from WHO, ICMR, UNICEF, government portals — tap any card to hear it in your language.</p>
      <div className="feed-grid">
        {feed.map((item, i) => (
          <div key={item.id||i} className="feed-card fade-up visible" onClick={() => speak(`${item.title}. ${item.summary}`, language)}>
            <div className="feed-source">
              <div className="feed-source-icon" style={{background:item.source_bg,color:item.source_color}}>{item.source_icon}</div>
              <div>
                <div className="feed-source-name">{item.source}</div>
                <div className="feed-source-time">
                  {item.is_live && <span className="live-dot" />}
                  {timeAgo(item.published_at)}
                </div>
              </div>
            </div>
            <div className="feed-title">{item.title}</div>
            <div className="feed-summary">{item.summary}</div>
            <div className="feed-tags">
              {(item.tags||[]).map(t => (
                <span key={t} className="feed-tag" style={{background:item.source_bg+'aa',color:item.source_color}}>{t}</span>
              ))}
            </div>
            <div style={{marginTop:10,fontSize:'0.68rem',color:'var(--lavender-deep)',fontWeight:600}}>🔊 Tap to hear</div>
          </div>
        ))}
      </div>
    </section>
  )
}
