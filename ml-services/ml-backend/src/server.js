/**
 * server.js — SIH 2026 Backend Entry Point
 *
 * Starts Express API + Simulation Engine together.
 * Single command: node src/server.js
 */

const express      = require('express')
const cors         = require('cors')
require('dotenv').config()

const complaintsRouter  = require('./routes/complaints')
const predictionsRouter = require('./routes/predictions')
const { startEngine }   = require('./simulationEngine')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: '*',   // tighten this in production
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))

// ── Request logger (dev only) ──────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
  })
}

// ── Routes ─────────────────────────────────────────────────
app.use('/api/complaints',  complaintsRouter)
app.use('/api/predictions', predictionsRouter)

// Health check — Render.com uses this to verify service is alive
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  ts:     new Date().toISOString(),
  env:    process.env.NODE_ENV || 'development',
}))

// Catch-all 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SIH 2026 Backend running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   Complaints: http://localhost:${PORT}/api/complaints`)
  console.log(`   Hotspots:   http://localhost:${PORT}/api/predictions/hotspots\n`)

  // Start the simulation engine (30-second polling loop)
  startEngine()
})
