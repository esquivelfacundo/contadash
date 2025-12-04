import { Router } from 'express'
import { verifyEmail, resendCode } from '../controllers/email-verification.controller'
import { authRateLimit } from '../middleware/security.middleware'

const router = Router()

// Verificar código de email
router.post('/verify', authRateLimit, verifyEmail)

// Reenviar código
router.post('/resend', authRateLimit, resendCode)

export default router
