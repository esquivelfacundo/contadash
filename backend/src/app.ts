import express from 'express'
import path from 'path'
import { config } from './config/app'
import {
  securityHeaders,
  corsMiddleware,
  generalRateLimit,
  csrfProtection,
  sanitizeRequest,
  enforceTenancy,
  securityAuditLogger,
} from './middleware/security.middleware'

const app = express()

// 1. Security Headers (debe ser primero)
app.use(securityHeaders)

// 2. CORS
app.use(corsMiddleware)

// 3. Rate Limiting General
app.use(generalRateLimit)

// 4. Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 5. Request Sanitization
app.use(sanitizeRequest)

// 6. CSRF Protection
app.use(csrfProtection)

// 7. Security Audit Logger
app.use(securityAuditLogger)

// 8. Multi-Tenancy Enforcement
app.use(enforceTenancy)

// Health check (sin rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
import apiRoutes from './routes'
app.use('/api', apiRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  
  // Handle AppError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
  }
  
  // Default error
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  })
})

export default app
