// routes/alerts.js
import { Router } from 'express'
import { supabase, insertOne } from '../supabase/client.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const { data } = await supabase.from('partner_alerts')
    .select('*').eq('partner_id', req.user.sub)
    .order('created_at', { ascending: false }).limit(20)
  res.json({ alerts: data || [] })
})

router.patch('/:id/read', requireAuth, async (req, res) => {
  await supabase.from('partner_alerts').update({ read: true }).match({ id: req.params.id })
  res.json({ ok: true })
})

router.post('/emergency', requireAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    await supabase.from('emergency_events').insert({ user_id: req.user.sub, latitude, longitude })

    // Notify linked partner
    const { data: profile } = await supabase.from('mother_profiles')
      .select('partner_id').eq('user_id', req.user.sub).maybeSingle()

    let hospitalMsg = ''
    let hospitals = []

    if (latitude && longitude) {
      try {
        const query = `
          [out:json];
          node["amenity"="hospital"](around:5000, ${latitude}, ${longitude});
          out 3;
        `
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        const data = await res.json()

        hospitals = data.elements.map(e => e.tags?.name).filter(Boolean)
        if (hospitals.length > 0) {
          hospitalMsg = `\nNearby Hospitals: ${hospitals.join(', ')}`
        }
      } catch (err) {
        console.error('[Emergency] Failed to fetch hospitals:', err)
      }
    }

    if (profile?.partner_id) {
      await insertOne('partner_alerts', {
        mother_id: req.user.sub, partner_id: profile.partner_id,
        alert_type: 'emergency',
        message: `🚨 EMERGENCY SOS from ${req.user.name}! Please call 108 and go to her immediately.${hospitalMsg}`
      })
    }
    res.json({ triggered: true, hospitals })
  } catch (e) {
    res.status(500).json({ error: 'Emergency trigger failed' })
  }
})

export default router
