import { Router } from 'express'
import {
  requestPasswordReset,
  verifyCode,
  resetPassword,
  resendCode,
} from '../controllers/password-reset.controller'
import { authRateLimit } from '../middleware/security.middleware'

const router = Router()

// Rutas de recuperación de contraseña con código
router.post('/request', authRateLimit, requestPasswordReset)

// Verificar código
router.post('/verify', authRateLimit, verifyCode)

// Restablecer contraseña
router.post('/reset', authRateLimit, resetPassword)

// Reenviar código
router.post('/resend', authRateLimit, resendCode)

export default router
