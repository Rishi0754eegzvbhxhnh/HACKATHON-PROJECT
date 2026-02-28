import { verifyAccess } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const token = req.cookies.access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null)

  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    req.user = verifyAccess(token)
    next()
  } catch (e) {
    const code = e.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID'
    res.status(401).json({ error: e.message, code })
  }
}

export function requireRole(roles) {
  const r = Array.isArray(roles) ? roles : [roles]
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    if (!r.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
