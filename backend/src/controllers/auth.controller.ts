import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import {
  RegisterInput,
  LoginInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../validations/auth.validation'

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data: RegisterInput = req.body
    const result = await authService.register(data)

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data: LoginInput = req.body
    const result = await authService.login(data)

    res.json({
      message: 'Login successful',
      ...result,
    })
  } catch (error) {
    next(error)
  }
}

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const user = await authService.getProfile(req.user.userId)

    res.json({ user })
  } catch (error) {
    next(error)
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Log security event
    console.log('[SECURITY] Logout:', {
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
    })

    // Clear any server-side session data if needed
    // For JWT, the token is removed client-side
    
    res.json({ 
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data: RequestPasswordResetInput = req.body
    const result = await authService.requestPasswordReset(data.email)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data: ResetPasswordInput = req.body
    const result = await authService.resetPassword(data.token, data.password)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function sendVerificationEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await authService.sendVerificationEmail(req.user.userId)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data: VerifyEmailInput = req.body
    const result = await authService.verifyEmail(data.token)

    res.json(result)
  } catch (error) {
    next(error)
  }
}
