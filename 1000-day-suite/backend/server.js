import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createServer } from 'http'

import authRouter from './routes/auth.js'
import aiRouter from './routes/ai.js'
import healthRouter from './routes/health.js'
import feedRouter from './routes/feed.js'
import alertRouter from './routes/alerts.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(helmet({ crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/, process.env.CORS_ORIGIN || 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-lang'],
}))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }))
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }))
app.use('/api/auth/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/ai', aiRouter)
app.use('/api/health', healthRouter)
app.use('/api/feed', feedRouter)
app.use('/api/alerts', alertRouter)

// Health check
app.get('/ping', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// 404
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found` }))

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err)
  res.status(err.status || 500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message })
})

app.listen(PORT, () => {
  console.log(`🚀 1000-Day Backend — http://localhost:${PORT}`)
})

export default app
