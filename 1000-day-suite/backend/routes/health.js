import { Router } from 'express'
import { supabase, insertOne } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// ── POST /health/vitals ───────────────────────────────────────
// Save vitals + AI risk score → Supabase realtime broadcast
router.post('/vitals', requireAuth, async (req, res) => {
  try {
    const { bp_systolic, bp_diastolic, blood_sugar, weight_kg, height_cm, pulse,
      temperature, oxygen_sat, symptom_code, mood, notes, risk_score, risk_level, ai_summary } = req.body

    const vital = await insertOne('vitals', {
      user_id: req.user.sub,
      bp_systolic, bp_diastolic, blood_sugar, weight_kg, pulse,
      temperature, oxygen_sat, symptom_code: symptom_code || 0, mood: mood || 1,
      notes, risk_score: risk_score || 0, risk_level: risk_level || 'low', ai_summary
    })

    // If height_cm is provided, update the mother's profile (since height doesn't change often)
    if (height_cm) {
      await supabase.from('mother_profiles')
        .update({ height_cm })
        .eq('user_id', req.user.sub)
    }

    // If high risk → auto-create partner alert
    if (risk_level === 'high') {
      const { data: profile } = await supabase.from('mother_profiles')
        .select('partner_id').eq('user_id', req.user.sub).maybeSingle()
      if (profile?.partner_id) {
        await insertOne('partner_alerts', {
          mother_id: req.user.sub,
          partner_id: profile.partner_id,
          alert_type: 'high_risk',
          message: `🚨 High Risk Alert — ${req.user.name}'s vitals need attention. BP: ${bp_systolic}/${bp_diastolic}, Risk: ${risk_score}/100`
        })
      }
    }

    res.status(201).json({ vital })
  } catch (e) {
    console.error('[health/vitals]', e)
    res.status(500).json({ error: 'Failed to save vitals' })
  }
})

// ── GET /health/vitals ────────────────────────────────────────
router.get('/vitals', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100)
    const { data, error } = await supabase.from('vitals')
      .select('*').eq('user_id', req.user.sub)
      .order('recorded_at', { ascending: false }).limit(limit)
    if (error) throw error
    res.json({ vitals: data })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch vitals' })
  }
})

// ── GET /health/vitals/latest ─────────────────────────────────
router.get('/vitals/latest', requireAuth, async (req, res) => {
  try {
    const { data } = await supabase.from('vitals')
      .select('*').eq('user_id', req.user.sub)
      .order('recorded_at', { ascending: false }).limit(1).maybeSingle()
    res.json({ vital: data })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch latest vitals' })
  }
})

// ── POST /health/appointments ─────────────────────────────────
router.post('/appointments', requireAuth, async (req, res) => {
  try {
    const { doctor_id, scheduled_at, duration_mins, type, notes } = req.body
    const motherId = req.user.role === 'mother' ? req.user.sub : req.body.mother_id
    const appt = await insertOne('appointments', { mother_id: motherId, doctor_id, scheduled_at, duration_mins: duration_mins || 30, type: type || 'checkup', notes })
    res.status(201).json({ appointment: appt })
  } catch (e) {
    res.status(500).json({ error: 'Failed to create appointment' })
  }
})

// ── GET /health/appointments ──────────────────────────────────
router.get('/appointments', requireAuth, async (req, res) => {
  try {
    let query = supabase.from('appointments')
      .select('*, doctor:doctor_id(id,name,email), mother:mother_id(id,name,email)')
      .order('scheduled_at', { ascending: true })

    if (req.user.role === 'mother') query = query.eq('mother_id', req.user.sub)
    else if (req.user.role === 'doctor') query = query.eq('doctor_id', req.user.sub)

    const { data, error } = await query
    if (error) throw error
    res.json({ appointments: data })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
})

// ── GET /health/medications ───────────────────────────────────
router.get('/medications', requireAuth, async (req, res) => {
  const { data } = await supabase.from('medications').select('*').eq('user_id', req.user.sub)
  res.json({ medications: data || [] })
})

// ── PATCH /health/medications/:id/taken ───────────────────────
router.patch('/medications/:id/taken', requireAuth, async (req, res) => {
  const { data } = await supabase.from('medications')
    .update({ taken_today: true, taken_at: new Date().toISOString() })
    .match({ id: req.params.id, user_id: req.user.sub }).select().single()
  res.json({ medication: data })
})

// ── GET /health/summary ───────────────────────────────────────
// Full health summary for a user
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub
    const [vitalsRes, apptRes, medsRes] = await Promise.all([
      supabase.from('vitals').select('*').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(30),
      supabase.from('appointments').select('*,doctor:doctor_id(name,email)').eq('mother_id', userId).order('scheduled_at', { ascending: true }).limit(5),
      supabase.from('medications').select('*').eq('user_id', userId)
    ])

    res.json({
      vitals: vitalsRes.data || [],
      appointments: apptRes.data || [],
      medications: medsRes.data || []
    })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
})

export default router
