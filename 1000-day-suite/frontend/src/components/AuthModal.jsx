import { useState } from 'react'

export default function AuthModal({ onClose, onLogin, onRegister }) {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ email:'', password:'', name:'', role:'mother', language:'en-IN' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function submit() {
    setError(null); setLoading(true)
    try {
      if (mode === 'login') await onLogin(form.email, form.password)
      else await onRegister(form.email, form.password, form.name, form.role, form.language)
      onClose()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const inp = { style:{width:'100%',padding:'12px 16px',border:'1.5px solid rgba(0,0,0,0.12)',borderRadius:12,fontFamily:'DM Sans,sans-serif',fontSize:'0.9rem',background:'#FDF8F2',marginTop:6,boxSizing:'border-box',outline:'none'} }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'white',borderRadius:24,padding:40,width:'100%',maxWidth:440,position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer'}}>✕</button>

        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.8rem',marginBottom:8}}>
          {mode === 'login' ? '🌸 Welcome Back' : '✦ Join 1000-Day Suite'}
        </div>
        <p style={{color:'var(--ink-light)',fontSize:'0.82rem',marginBottom:24}}>
          {mode === 'login' ? 'Sign in to your maternal health account' : 'Create your account to start tracking'}
        </p>

        {error && <div style={{background:'#FFEBEE',color:'#C62828',padding:'12px 16px',borderRadius:12,marginBottom:16,fontSize:'0.82rem'}}>{error}</div>}

        {mode === 'register' && (
          <>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Full Name</label>
              <input {...inp} placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',textTransform:'uppercase',letterSpacing:'0.06em'}}>I am a</label>
              <select {...inp} value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
                <option value="mother">🌸 Mother / Expecting</option>
                <option value="partner">💚 Partner / Husband</option>
                <option value="doctor">👨‍⚕️ Doctor</option>
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Preferred Language</label>
              <select {...inp} value={form.language} onChange={e => setForm({...form,language:e.target.value})}>
                {[['en-IN','🇮🇳 English'],['hi-IN','हि Hindi'],['te-IN','తె Telugu'],['ta-IN','த Tamil'],['bn-IN','ব Bengali'],['mr-IN','म Marathi']].map(([v,l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div style={{marginBottom:16}}>
          <label style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Email</label>
          <input {...inp} type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})} />
        </div>
        <div style={{marginBottom:24}}>
          <label style={{fontSize:'0.75rem',fontWeight:600,color:'var(--ink-light)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Password</label>
          <input {...inp} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form,password:e.target.value})} onKeyPress={e => e.key==='Enter' && submit()} />
        </div>

        <button className="btn-primary" style={{width:'100%',borderRadius:14}} onClick={submit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{textAlign:'center',marginTop:16,fontSize:'0.82rem',color:'var(--ink-light)'}}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span style={{color:'var(--lavender-deep)',cursor:'pointer',fontWeight:600}} onClick={() => setMode(mode==='login'?'register':'login')}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  )
}
