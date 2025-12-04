import { Request, Response } from 'express'
import { verifyEmailCode, resendVerificationCode } from '../services/email-verification.service'
import { generateToken, generateRefreshToken, JwtPayload } from '../utils/jwt'
import { prisma } from '../config/database'

/**
 * Verificar código de email
 */
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { userId, code } = req.body
    
    if (!userId || !code) {
      return res.status(400).json({
        error: 'userId y code son requeridos',
      })
    }
    
    // Verificar el código
    await verifyEmailCode(userId, code)
    
    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        plan: true,
        emailVerified: true,
      },
    })
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    
    // Generar tokens ahora que el email está verificado
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    }
    
    const token = generateToken(payload)
    const refreshToken = generateRefreshToken(payload)
    
    res.json({
      message: 'Email verificado exitosamente',
      user,
      token,
      refreshToken,
    })
  } catch (error: any) {
    console.error('Error verificando email:', error)
    res.status(400).json({
      error: error.message || 'Error verificando el código',
    })
  }
}

/**
 * Reenviar código de verificación
 */
export async function resendCode(req: Request, res: Response) {
  try {
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({
        error: 'userId es requerido',
      })
    }
    
    await resendVerificationCode(userId)
    
    res.json({
      message: 'Código de verificación reenviado',
    })
  } catch (error: any) {
    console.error('Error reenviando código:', error)
    res.status(400).json({
      error: error.message || 'Error reenviando el código',
    })
  }
}
