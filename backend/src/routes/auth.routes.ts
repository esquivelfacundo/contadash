import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { validateRequest } from '../middleware/validation.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { authRateLimit } from '../middleware/security.middleware'
import {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validations/auth.validation'

const router = Router()

// Public routes (con rate limiting estricto)
router.post('/register', authRateLimit, validateRequest(registerSchema), authController.register)
router.post('/login', authRateLimit, validateRequest(loginSchema), authController.login)

// Password reset routes (public)
router.post(
  '/request-password-reset',
  authRateLimit,
  validateRequest(requestPasswordResetSchema),
  authController.requestPasswordReset
)
router.post(
  '/reset-password',
  authRateLimit,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
)

// Email verification routes
router.post(
  '/send-verification-email',
  authMiddleware,
  authController.sendVerificationEmail
)
router.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  authController.verifyEmail
)

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile)
router.post('/logout', authMiddleware, authController.logout)

export default router
