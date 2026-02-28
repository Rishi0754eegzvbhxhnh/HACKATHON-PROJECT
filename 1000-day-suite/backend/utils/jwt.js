import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { supabase, insertOne, findOne } from '../supabase/client.js'

const A_SECRET = process.env.JWT_ACCESS_SECRET
const R_SECRET = process.env.JWT_REFRESH_SECRET
const R_TTL_MS = 7 * 24 * 60 * 60 * 1000

export const signAccess  = (u) => jwt.sign({ sub:u.id, email:u.email, role:u.role, name:u.name, lang:u.language||'en-IN' }, A_SECRET, { expiresIn:'15m' })
export const signRefresh = (uid) => jwt.sign({ sub:uid }, R_SECRET, { expiresIn:'7d' })
export const verifyAccess  = (t) => jwt.verify(t, A_SECRET)
export const verifyRefresh = (t) => jwt.verify(t, R_SECRET)

const hash = (t) => crypto.createHash('sha256').update(t).digest('hex')

export async function storeRefresh(userId, token) {
  await insertOne('refresh_tokens', {
    user_id: userId,
    token_hash: hash(token),
    expires_at: new Date(Date.now() + R_TTL_MS).toISOString()
  })
}

export async function validateRefresh(token) {
  const row = await findOne('refresh_tokens', { token_hash: hash(token) })
  if (!row) throw new Error('Not found')
  if (row.revoked) throw new Error('Revoked')
  if (new Date(row.expires_at) < new Date()) throw new Error('Expired')
  return row
}

export async function revokeRefresh(token) {
  await supabase.from('refresh_tokens').update({ revoked:true }).match({ token_hash: hash(token) })
}

export async function revokeAll(userId) {
  await supabase.from('refresh_tokens').update({ revoked:true }).match({ user_id: userId })
}
