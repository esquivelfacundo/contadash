import { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

/**
 * Security Headers Middleware
 * Configura headers de seguridad con Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Deshabilitar CSP temporalmente para deployment
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
})

/**
 * CORS Configuration
 * Permite el frontend desde cualquier IP de la red local
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como Postman, apps móviles, health checks)
    if (!origin) return callback(null, true)
    
    // Permitir localhost en cualquier puerto
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true)
    }
    
    // Permitir cualquier IP de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const localNetworkRegex = /^https?:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/
    if (localNetworkRegex.test(origin)) {
      return callback(null, true)
    }
    
    // En producción, verificar contra ALLOWED_ORIGINS
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
      if (allowedOrigins.some(allowed => origin.startsWith(allowed.trim()))) {
        return callback(null, true)
      }
    }
    
    // En desarrollo, permitir todo
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true)
    }
    
    // Rechazar otros orígenes
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutos
})

/**
 * Rate Limiting - General
 * Límite general para todas las rutas
 * RELAJADO EN DESARROLLO
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // 10000 en dev, 100 en prod
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting para health checks y en desarrollo
    if (process.env.NODE_ENV === 'development') return true
    return req.path === '/health' || req.path === '/api/health'
  },
})

/**
 * Rate Limiting - Autenticación
 * Límite estricto para rutas de auth
 * DESHABILITADO EN DESARROLLO para facilitar testing
 */
export const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto en dev
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 1000 en dev (prácticamente sin límite), 5 en prod
  message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
  skip: (req) => {
    // Skip rate limiting en desarrollo
    return process.env.NODE_ENV === 'development'
  },
})

/**
 * Rate Limiting - API
 * Límite para rutas de API autenticadas
 */
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
  message: 'Límite de API excedido, intenta de nuevo en un minuto',
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * CSRF Protection Middleware
 * Verifica que las requests vengan del frontend autorizado
 * DESHABILITADO EN DESARROLLO para facilitar testing
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF en desarrollo
  if (process.env.NODE_ENV === 'development') {
    return next()
  }

  // Skip CSRF para GET requests (solo lectura)
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }

  // Verificar origin/referer
  const origin = req.get('origin')
  const referer = req.get('referer')
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.BACKEND_URL || 'http://localhost:3000',
  ]

  const isValidOrigin = origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))
  const isValidReferer = referer && allowedOrigins.some((allowed) => referer.startsWith(allowed))

  if (!isValidOrigin && !isValidReferer) {
    return res.status(403).json({
      error: 'CSRF validation failed',
      message: 'Request origin not allowed',
    })
  }

  next()
}

/**
 * Request Sanitization
 * Limpia y valida datos de entrada
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remover propiedades peligrosas del body
  if (req.body) {
    delete req.body.__proto__
    delete req.body.constructor
    delete req.body.prototype
  }

  // Validar Content-Type para POST/PUT/PATCH (excepto rutas de upload)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    // Excluir rutas de upload que usan multipart/form-data
    const isUploadRoute = req.path.includes('/upload')
    
    if (!isUploadRoute) {
      const contentType = req.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(400).json({
          error: 'Invalid Content-Type',
          message: 'Content-Type must be application/json',
        })
      }
    }
  }

  next()
}

/**
 * Multi-Tenancy Enforcement
 * Verifica que el usuario solo acceda a sus propios datos
 */
export const enforceTenancy = (req: Request, res: Response, next: NextFunction) => {
  // Solo aplicar a rutas autenticadas
  if (!req.user) {
    return next()
  }

  // Agregar userId al request para uso en services
  req.userId = req.user.userId

  next()
}

/**
 * Security Audit Logger
 * Registra eventos de seguridad importantes
 */
export const securityAuditLogger = (req: Request, res: Response, next: NextFunction) => {
  const sensitiveRoutes = ['/api/auth/', '/api/users/']
  const isSensitive = sensitiveRoutes.some((route) => req.path.startsWith(route))

  if (isSensitive) {
    console.log('[SECURITY AUDIT]', {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.userId || 'anonymous',
      userAgent: req.get('user-agent'),
    })
  }

  next()
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}
