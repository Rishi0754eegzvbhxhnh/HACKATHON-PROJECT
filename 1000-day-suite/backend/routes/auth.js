import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { supabase, findOne, insertOne } from '../supabase/client.js'
import { signAccess, signRefresh, storeRefresh, validateRefresh, revokeRefresh, revokeAll, verifyRefresh } from '../utils/jwt.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// ── Register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, language = 'en-IN', phone } = req.body
    if (!email || !password || !name || !role) return res.status(400).json({ error: 'Missing required fields' })
    if (!['mother', 'partner', 'doctor'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
    if (password.length < 8) return res.status(400).json({ error: 'Password too short' })

    if (await findOne('users', { email: email.toLowerCase() }))
      return res.status(409).json({ error: 'Email already registered' })

    const user = await insertOne('users', {
      email: email.toLowerCase(), password: await bcrypt.hash(password, 12), name, role, language, phone
    })

    if (role === 'mother') await insertOne('mother_profiles', { user_id: user.id })

    const [accessToken, refreshToken] = [signAccess(user), signRefresh(user.id)]
    await storeRefresh(user.id, refreshToken)

    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, language: user.language }
    })
  } catch (e) {
    console.error('[register]', e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// ── Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

    const user = await findOne('users', { email: email.toLowerCase() })
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' })

    const [accessToken, refreshToken] = [signAccess(user), signRefresh(user.id)]
    await storeRefresh(user.id, refreshToken)

    res.cookie('access_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, language: user.language }
    })
  } catch (e) {
    console.error('[login]', e)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ── Refresh Token ─────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' })

    const payload = verifyRefresh(refreshToken)
    await validateRefresh(refreshToken)
    await revokeRefresh(refreshToken)

    const user = await findOne('users', { id: payload.sub })
    if (!user) return res.status(401).json({ error: 'User not found' })

    const [newAccess, newRefresh] = [signAccess(user), signRefresh(user.id)]
    await storeRefresh(user.id, newRefresh)

    res.cookie('access_token', newAccess, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 })
    res.cookie('refresh_token', newRefresh, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/auth', maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.json({ message: 'Tokens refreshed' })
  } catch (e) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token', { path: '/api/auth' })
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// ── Me ────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await findOne('users', { id: req.user.sub })
    if (!user) return res.status(404).json({ error: 'Not found' })

    // Fetch mother profile if applicable
    let profile = null
    if (user.role === 'mother') {
      profile = await findOne('mother_profiles', { user_id: user.id })
    }

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, language: user.language, phone: user.phone, profile })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// ── Logout ────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  const refreshToken = req.cookies.refresh_token
  if (refreshToken) await revokeRefresh(refreshToken).catch(() => { })
  res.clearCookie('access_token')
  res.clearCookie('refresh_token', { path: '/api/auth' })
  res.json({ message: 'Logged out' })
})

// ── Link Partner ──────────────────────────────────────────────
router.post('/link-partner', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'mother') return res.status(403).json({ error: 'Only mothers' })
    const { partnerEmail } = req.body
    const partner = await findOne('users', { email: partnerEmail?.toLowerCase(), role: 'partner' })
    if (!partner) return res.status(404).json({ error: 'Partner account not found' })

    await supabase.from('mother_profiles').update({ partner_id: partner.id }).match({ user_id: req.user.sub })
    res.json({ message: 'Partner linked', partnerName: partner.name, partnerId: partner.id })
  } catch (e) {
    res.status(500).json({ error: 'Failed to link partner' })
  }
})

// ── Update language preference ────────────────────────────────
router.patch('/language', requireAuth, async (req, res) => {
  try {
    const { language } = req.body
    await supabase.from('users').update({ language }).match({ id: req.user.sub })
    res.json({ language })
  } catch (e) {
    res.status(500).json({ error: 'Failed to update language' })
  }
})

export default router
