import { useState } from 'react'
import { post } from '../../lib/api'

export default function VitalsLogger({ user, language, onSave, computeRisk, showToast, speak }) {
  const [form, setForm] = useState({ bp_sys: '', bp_dia: '', sugar: '', weight: '', height: '', symptom: '0', mood: '1' })
  const [risk, setRisk] = useState(null)
  const [saving, setSaving] = useState(false)

  function update(k, v) {
    const next = { ...form, [k]: v }
    setForm(next)
    if (next.bp_sys && next.bp_dia) {
      const r = computeRisk({ bp_systolic: +next.bp_sys, bp_diastolic: +next.bp_dia, blood_sugar: +next.sugar || 95, weight_kg: +next.weight || 0, height_cm: +next.height || 0, symptom_code: +next.symptom, mood: +next.mood })
      setRisk(r)
    }
  }

  async function getAIAssessment() {
    if (!form.bp_sys || !form.bp_dia) return showToast('Enter BP first', '⚠️')
    try {
      const res = await post('/ai/risk-assess', {
        bp_systolic: +form.bp_sys, bp_diastolic: +form.bp_dia,
        blood_sugar: +form.sugar || 95, weight_kg: +form.weight || 0,
        height_cm: +form.height || 0, symptom_code: +form.symptom,
        mood: +form.mood, language
      })
      setRisk(res)
      speak(res.summary, language)
      showToast('AI risk assessment complete!', '🤖')
    } catch (e) {
      if (risk) speak(`Risk is ${risk.level}, score ${risk.score} out of 100`, language)
    }
  }

  async function submit() {
    if (!user) return showToast('Sign in to save vitals', '⚠️')
    if (!form.bp_sys || !form.bp_dia) return showToast('Enter blood pressure values', '⚠️')
    setSaving(true)
    try {
      const riskData = computeRisk({ bp_systolic: +form.bp_sys, bp_diastolic: +form.bp_dia, blood_sugar: +form.sugar || 0, weight_kg: +form.weight || 0, height_cm: +form.height || 0, symptom_code: +form.symptom, mood: +form.mood })
      await onSave({
        bp_systolic: +form.bp_sys, bp_diastolic: +form.bp_dia,
        blood_sugar: +form.sugar || null, weight_kg: +form.weight || null, height_cm: +form.height || null,
        symptom_code: +form.symptom, mood: +form.mood,
        risk_score: riskData.score, risk_level: riskData.level
      })
      showToast('✅ Vitals saved & analyzed! Dashboard updated in real-time.', '❤️')
      speak(`Vitals saved. Risk level is ${riskData.level}, score ${riskData.score}.`, language)
      setForm({ bp_sys: '', bp_dia: '', sugar: '', weight: '', height: '', symptom: '0', mood: '1' })
    } catch (e) {
      showToast('Failed to save vitals. Please try again.', '⚠️')
    } finally {
      setSaving(false)
    }
  }

  const riskClass = { low: 'risk-low-bg', medium: 'risk-medium-bg', high: 'risk-high-bg' }

  return (
    <div className="tab-content active">
      <div className="vitals-form">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem' }}>Log Today's Vitals</h3>
          <button onClick={getAIAssessment} style={{ background: 'linear-gradient(135deg,#9B7ED9,#E07A94)', color: 'white', border: 'none', borderRadius: 99, padding: '12px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            🤖 AI Risk Check
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Systolic BP (mmHg)</label>
            <input type="number" placeholder="e.g. 120" value={form.bp_sys} onChange={e => update('bp_sys', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Diastolic BP (mmHg)</label>
            <input type="number" placeholder="e.g. 80" value={form.bp_dia} onChange={e => update('bp_dia', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Blood Sugar (mg/dL)</label>
            <input type="number" placeholder="e.g. 95" value={form.sugar} onChange={e => update('sugar', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Weight (kg)</label>
            <input type="number" step="0.1" placeholder="e.g. 62.4" value={form.weight} onChange={e => update('weight', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Height (cm)</label>
            <input type="number" step="1" placeholder="e.g. 165" value={form.height} onChange={e => update('height', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Main Symptom</label>
            <select value={form.symptom} onChange={e => update('symptom', e.target.value)}>
              <option value="0">None — Feeling well</option>
              <option value="1">Mild fatigue</option>
              <option value="2">Headache / dizziness</option>
              <option value="3">Nausea / vomiting</option>
              <option value="4">Chest pain / shortness of breath</option>
              <option value="5">Severe cramps / bleeding</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mood</label>
            <select value={form.mood} onChange={e => update('mood', e.target.value)}>
              <option value="1">😊 Happy & calm</option>
              <option value="2">😐 Neutral / okay</option>
              <option value="3">😔 Anxious / worried</option>
              <option value="4">😢 Sad / stressed</option>
            </select>
          </div>
        </div>

        {risk && (
          <div className={`risk-indicator ${riskClass[risk.level]}`}>
            <span style={{ fontSize: '1.5rem' }}>{risk.level === 'high' ? '🚨' : risk.level === 'medium' ? '⚠️' : '✅'}</span>
            <div>
              <strong>{risk.level?.toUpperCase()} RISK — {risk.score}/100</strong>
              {risk.summary && <div style={{ fontSize: '0.82rem', marginTop: 4 }}>{risk.summary}</div>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save & Analyze'}
          </button>
          <button className="btn-secondary" onClick={getAIAssessment}>🤖 Quick Risk Check</button>
          {risk && <button onClick={() => speak(`Risk level is ${risk.level}, score ${risk.score} out of 100. ${risk.summary || ''}`, language)} style={{ background: 'var(--lavender)', border: 'none', borderRadius: 99, padding: '14px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            🔊 Speak Result
          </button>}
        </div>
      </div>
    </div>
  )
}
