const WF_NODES = [
  { label:'👤 User Layer', color:'wf-blue', icon:'🤰', title:'User Dashboard', items:['Log BP, sugar, weight','Enter symptoms','🎙️ Voice input','Book live sessions'] },
  { label:'🧠 AI Engine', color:'wf-purple', icon:'✨', title:'Gemini AI + Voice', items:['Multilingual NLP','Risk scoring (Low/Med/High)','Voice responses in 8 langs','Pre-consult summary'], badges:true },
  { label:'👨‍⚕️ Doctor', color:'wf-green', icon:'📹', title:'Virtual Consultation', items:['Reviews AI summary','Video call (WebRTC)','Voice + text notes','Annotates risk'] },
  { label:'🗄️ Supabase', color:'wf-orange', icon:'💾', title:'Real-time DB', items:['Vitals history (live)','Prescriptions','Voice logs','Partner alerts'] },
  { label:'📊 Analytics', color:'wf-blue', icon:'📈', title:'Health Dashboard', items:['Risk trajectory','BP & sugar trends','🔊 Voice readout','Prescription reminders'] },
  { label:'🧑‍🤝‍🧑 Partner', color:'wf-pink', icon:'💑', title:'Partner Dashboard', items:['Voice risk alerts','Caregiving tips','Dialect support'] },
  { label:'🚨 Emergency', color:'wf-red', icon:'🏥', title:'Emergency Protocol', items:['Voice-triggered SOS','Hospital Locator','Ambulance 108'] },
]

export default function Workflow() {
  return (
    <section className="workflow-section" id="workflow">
      <div className="section-tag">System Architecture</div>
      <h2 className="section-title">How Everything Connects</h2>
      <p className="section-desc">AI pipeline from user vitals → doctor consultations → partner alerts → emergency services — with voice at every step.</p>
      <div className="workflow-canvas">
        <div className="workflow-diagram">
          {WF_NODES.map((node, i) => (
            <>
              <div key={node.title} className="workflow-column">
                <div className="wf-column-label">{node.label}</div>
                <div className={`wf-node ${node.color}`}>
                  <span className="wf-node-icon">{node.icon}</span>
                  <div className="wf-node-title">{node.title}</div>
                  <ul className="wf-node-items">{node.items.map(item => <li key={item}>{item}</li>)}</ul>
                  {node.badges && (
                    <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                      <span className="risk-badge risk-low">Low ✓</span>
                      <span className="risk-badge risk-medium">Medium ⚠</span>
                      <span className="risk-badge risk-high">High 🚨</span>
                    </div>
                  )}
                </div>
              </div>
              {i < WF_NODES.length - 1 && (
                <div key={`arrow-${i}`} className="wf-arrow" style={i === WF_NODES.length-2 ? {color:'#E85454'} : {}}>→</div>
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  )
}
