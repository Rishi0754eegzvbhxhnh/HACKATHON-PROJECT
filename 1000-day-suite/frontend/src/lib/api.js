const BASE = import.meta.env.VITE_API_URL || '/api'

export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers
    }
  })
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error || `API ${res.status}`)
    err.code = data.code
    throw err
  }
  return data
}

export const get = (path) => api(path)
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) })
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) })
export const del = (path) => api(path, { method: 'DELETE' })
