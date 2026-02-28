// routes/feed.js
import { Router } from 'express'
import { supabase } from '../supabase/client.js'

const router = Router()

router.get('/', async (req, res) => {
  const { data } = await supabase.from('health_feed')
    .select('*').order('priority', { ascending:true }).limit(20)
  res.json({ feed: data||[] })
})

export default router
