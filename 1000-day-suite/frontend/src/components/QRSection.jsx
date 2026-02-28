import { QRCodeSVG } from 'qrcode.react'

const QRS = [
  { id:'dashboard', title:'🎙️ Voice Dashboard', desc:'Opens voice-first health dashboard. Tap to hear all vitals.', url:'https://1000days.app/voice-dashboard?user=priya_s&lang=hi' },
  { id:'partner',   title:'👨 Partner Portal',  desc:'Share with husband — plays voice alerts in his language', url:'https://1000days.app/partner?token=rahul_priya&voice=1' },
  { id:'doctor',    title:'📹 Doctor Session',  desc:'Video call with live voice translation support', url:'https://meet.1000days.app/dr-priya-session-24w?voice=1' },
  { id:'emergency', title:'🚨 Emergency Card',  desc:'First responders scan to hear patient info in any language', url:'https://1000days.app/emergency?id=priya_sharma&blood=O%2B&week=24' },
]

export default function QRSection() {
  return (
    <section className="qr-section" id="qr">
      <div className="section-tag">Instant Multilingual Access</div>
      <h2 className="section-title">Scan to Access</h2>
      <p className="section-desc">Each QR code opens a voice-enabled page — no reading required. Works with screen readers and voice browsers.</p>
      <div className="qr-grid">
        {QRS.map(q => (
          <div key={q.id} className="qr-card">
            <div className="qr-box">
              <QRCodeSVG value={q.url} size={128} fgColor="#2D2320" bgColor="#FFFFFF" />
            </div>
            <div className="qr-card-title">{q.title}</div>
            <div className="qr-card-desc">{q.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
