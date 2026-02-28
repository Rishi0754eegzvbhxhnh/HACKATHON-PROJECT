import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { v4 as uuidv4 } from 'uuid'
import { supabase, insertOne } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── Language name map ────────────────────────────────────────
const LANG_NAMES = {
  'en-IN': 'English', 'hi-IN': 'Hindi', 'te-IN': 'Telugu', 'ta-IN': 'Tamil',
  'bn-IN': 'Bengali', 'mr-IN': 'Marathi', 'gu-IN': 'Gujarati', 'kn-IN': 'Kannada'
}

// ── System prompts per role ──────────────────────────────────
const SYSTEM = {
  mother: (lang) => `You are a warm, expert maternal health AI companion for an Indian mother.
LANGUAGE: Always respond in ${LANG_NAMES[lang] || 'English'} (language code: ${lang}).
You understand and respond about pregnancy, nutrition, symptoms, medications, baby growth.
Risk levels: Low (score 0-33), Medium (34-66), High (67-100).
Emergency keywords in any Indian language ("मदद","సహాయం","உதவி","Help","Emergency") → ALWAYS say: call 108 immediately.
Never diagnose. Always suggest consulting Dr. for serious symptoms.
Be empathetic, use simple language, avoid medical jargon.
Context: 1000-Day Maternal Care Suite serving rural and urban Indian mothers.`,

  partner: (lang) => `You are a supportive guide for an Indian husband/partner of a pregnant woman.
LANGUAGE: Always respond in ${LANG_NAMES[lang] || 'English'}.
Help them understand how to support their partner, pregnancy stages, newborn care, emotional support.
Be practical, actionable, encouraging.`,

  doctor: (lang) => `You are a clinical decision support assistant for an OB/GYN doctor in India.
LANGUAGE: Always respond in ${LANG_NAMES[lang] || 'English'}.
Provide evidence-based clinical summaries, ACOG/WHO/FOGSI guideline references.
Use medical terminology. Note when guidelines differ between regions.`
}

// ── POST /ai/chat ─────────────────────────────────────────────
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, sessionId, language } = req.body
    if (!message?.trim()) return res.status(400).json({ error: 'message required' })

    const lang = language || req.user.lang || 'en-IN'
    const userId = req.user.sub
    const role = req.user.role
    const sid = sessionId || uuidv4()

    // Get latest vitals for context
    const { data: vitals } = await supabase.from('vitals')
      .select('bp_systolic,bp_diastolic,blood_sugar,weight_kg,risk_level,risk_score')
      .eq('user_id', userId).order('recorded_at', { ascending: false }).limit(1)

    const vitalContext = vitals?.[0] ? `[Patient latest vitals: BP ${vitals[0].bp_systolic}/${vitals[0].bp_diastolic}, Sugar ${vitals[0].blood_sugar}, Risk: ${vitals[0].risk_level}(${vitals[0].risk_score}/100)]` : ''

    // Get conversation history
    const { data: history } = await supabase.from('ai_conversations')
      .select('role,content').eq('user_id', userId).eq('session_id', sid)
      .order('created_at', { ascending: true }).limit(20)

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM[role]?.(lang) + '\n' + vitalContext
    })

    const geminiHistory = (history || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const chat = model.startChat({ history: geminiHistory })
    const result = await chat.sendMessage(message)
    const aiReply = result.response.text()

    // Persist both turns
    await Promise.all([
      insertOne('ai_conversations', { user_id: userId, session_id: sid, role: 'user', content: message, language: lang }),
      insertOne('ai_conversations', { user_id: userId, session_id: sid, role: 'assistant', content: aiReply, language: lang })
    ])

    // Check for emergency keywords → create alert
    const emergencyWords = /emergency|help|मदद|సహాయం|உதவி|সাহায্য|मदत|ਮਦਦ|ಸಹಾಯ|saayam/i
    if (emergencyWords.test(message)) {
      await supabase.from('emergency_events').insert({ user_id: userId })
      // Notify partner
      const { data: profile } = await supabase.from('mother_profiles').select('partner_id').eq('user_id', userId).maybeSingle()
      if (profile?.partner_id) {
        await insertOne('partner_alerts', {
          mother_id: userId, partner_id: profile.partner_id,
          alert_type: 'emergency', message: `🚨 Emergency triggered by voice/AI. Please check immediately!`
        })
      }
    }

    res.json({ response: aiReply, sessionId: sid })
  } catch (e) {
    console.error('[ai/chat]', e)
    res.status(500).json({ error: 'AI chat failed', detail: e.message })
  }
})

// ── POST /ai/risk-assess ──────────────────────────────────────
// Real-time risk assessment from vitals
router.post('/risk-assess', requireAuth, async (req, res) => {
  try {
    const { bp_systolic, bp_diastolic, blood_sugar, weight_kg, height_cm, symptom_code, mood, language = 'en-IN' } = req.body

    // Rule-based fast scoring
    let score = 0
    if (bp_systolic >= 160 || bp_diastolic >= 110) score += 40
    else if (bp_systolic >= 140 || bp_diastolic >= 90) score += 25
    else if (bp_systolic >= 130 || bp_diastolic >= 85) score += 12
    if (blood_sugar > 140) score += 25
    else if (blood_sugar > 110) score += 12
    if (symptom_code >= 4) score += 25
    else if (symptom_code >= 2) score += 12
    if (mood >= 3) score += 8

    let bmiText = ''
    if (weight_kg > 0 && height_cm > 0) {
      const height_m = height_cm / 100
      const bmi = weight_kg / (height_m * height_m)
      bmiText = `, Weight: ${weight_kg}kg, Height: ${height_cm}cm, BMI: ${bmi.toFixed(1)}`
      if (bmi < 18.5) score += 15
      else if (bmi > 30) score += 15
      else if (bmi > 25) score += 5
    }

    const level = score >= 67 ? 'high' : score >= 34 ? 'medium' : 'low'

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `In ${LANG_NAMES[language] || 'English'}, give a SHORT (2-3 sentence) maternal health assessment:
BP: ${bp_systolic}/${bp_diastolic}, Sugar: ${blood_sugar}${bmiText}, Symptom severity: ${symptom_code}/5, Mood: ${mood}/4.
Risk score: ${score}/100 (${level}). Be compassionate and actionable. End with one practical tip.`

    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    res.json({ score: Math.min(score, 100), level, summary })
  } catch (e) {
    res.status(500).json({ error: 'Risk assessment failed' })
  }
})

// ── GET /ai/sessions ──────────────────────────────────────────
router.get('/sessions', requireAuth, async (req, res) => {
  const { data } = await supabase.from('ai_conversations')
    .select('session_id,created_at,content').eq('user_id', req.user.sub).eq('role', 'user')
    .order('created_at', { ascending: false })
  const sessions = [...new Map((data || []).map(r => [r.session_id, r])).values()]
  res.json({ sessions })
})

// ── GET /ai/history/:sessionId ────────────────────────────────
router.get('/history/:sid', requireAuth, async (req, res) => {
  const { data } = await supabase.from('ai_conversations')
    .select('id,role,content,created_at,language')
    .eq('user_id', req.user.sub).eq('session_id', req.params.sid)
    .order('created_at', { ascending: true })
  res.json({ messages: data || [] })
})

export default router
