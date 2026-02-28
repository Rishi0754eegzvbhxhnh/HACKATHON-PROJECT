import { useState, useEffect, useCallback, useRef } from 'react'
import { post, get } from '../lib/api'

const U_KEY = 'mh_user'

function load(key) { try { return JSON.parse(localStorage.getItem(key)) } catch { return null } }
function save(u) {
  if (u) localStorage.setItem(U_KEY, JSON.stringify(u))
}
function clear() { localStorage.removeItem(U_KEY) }

export function useAuth() {
  const [user, setUser] = useState(() => load(U_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  // Verify auth session silently in background on load
  const verifySession = useCallback(async () => {
    try {
      const dbUser = await get('/auth/me')
      save(dbUser)
      setUser(dbUser)
    } catch {
      clear()
      setUser(null)
    }
  }, [])

  const scheduleRefresh = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        await post('/auth/refresh', {})
        scheduleRefresh()
      } catch { clear(); setUser(null) }
    }, 14 * 60 * 1000)
  }, [])

  useEffect(() => {
    verifySession().then(() => {
      if (load(U_KEY)) scheduleRefresh()
    })
    return () => clearTimeout(timerRef.current)
  }, [scheduleRefresh, verifySession])

  async function register(email, password, name, role, language) {
    setLoading(true); setError(null)
    try {
      const res = await post('/auth/register', { email, password, name, role, language })
      save(res.user)
      setUser(res.user); scheduleRefresh(); return res.user
    } catch (e) { setError(e.message); throw e }
    finally { setLoading(false) }
  }

  async function login(email, password) {
    setLoading(true); setError(null)
    try {
      const res = await post('/auth/login', { email, password })
      save(res.user)
      setUser(res.user); scheduleRefresh(); return res.user
    } catch (e) { setError(e.message); throw e }
    finally { setLoading(false) }
  }

  async function logout() {
    await post('/auth/logout', {}).catch(() => { })
    clear(); setUser(null); clearTimeout(timerRef.current)
  }

  async function updateLanguage(language) {
    await post('/auth/language', { language })
    const updated = { ...user, language }
    localStorage.setItem(U_KEY, JSON.stringify(updated))
    setUser(updated)
  }

  return { user, loading, error, register, login, logout, updateLanguage }
}
