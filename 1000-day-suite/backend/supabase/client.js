import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function findOne(table, match) {
  const { data, error } = await supabase.from(table).select('*').match(match).maybeSingle()
  if (error) throw error
  return data
}

export async function insertOne(table, values) {
  const { data, error } = await supabase.from(table).insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateWhere(table, match, values) {
  const { data, error } = await supabase.from(table).update(values).match(match).select().single()
  if (error) throw error
  return data
}
