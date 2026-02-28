import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 10 } }
})

// ── Real-time subscriptions ───────────────────────────────────

// Subscribe to new vitals for a user
export function subscribeToVitals(userId, callback) {
  return supabase.channel(`vitals:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'vitals',
      filter: `user_id=eq.${userId}`
    }, payload => callback(payload.new))
    .subscribe()
}

// Subscribe to partner alerts
export function subscribeToAlerts(partnerId, callback) {
  return supabase.channel(`alerts:${partnerId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'partner_alerts',
      filter: `partner_id=eq.${partnerId}`
    }, payload => callback(payload.new))
    .subscribe()
}

// Subscribe to AI conversation (for real-time streaming feel)
export function subscribeToChat(userId, sessionId, callback) {
  return supabase.channel(`chat:${sessionId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'ai_conversations',
      filter: `user_id=eq.${userId}`
    }, payload => callback(payload.new))
    .subscribe()
}

// Subscribe to health feed updates
export function subscribeToFeed(callback) {
  return supabase.channel('health_feed')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'health_feed'
    }, payload => callback(payload.new))
    .subscribe()
}

export function unsubscribe(channel) {
  supabase.removeChannel(channel)
}
