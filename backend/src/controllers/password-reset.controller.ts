import { Request, Response } from 'express'
import {
  sendPasswordResetCode,
  verifyResetCode,
  resetPasswordWithCode,
  resendResetCode,
} from '../services/password-reset.service'

/**
 * Envía código de recuperación de contraseña
 */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' })
    }

    await sendPasswordResetCode(email)

    // Por seguridad, siempre devolver éxito
    res.json({
      message: 'Si el email existe, recibirás un código de recuperación',
    })
  } catch (error) {
    console.error('Error en requestPasswordReset:', error)
    res.status(500).json({ error: 'Error al procesar la solicitud' })
  }
}

/**
 * Verifica el código de recuperación
 */
export async function verifyCode(req: Request, res: Response) {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ error: 'Email y código son requeridos' })
    }

    const isValid = await verifyResetCode(email, code)

    if (!isValid) {
      return res.status(400).json({ error: 'Código inválido o expirado' })
    }

    res.json({ message: 'Código verificado correctamente' })
  } catch (error) {
    console.error('Error en verifyCode:', error)
    res.status(500).json({ error: 'Error al verificar el código' })
  }
}

/**
 * Restablece la contraseña con el código
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: 'Email, código y nueva contraseña son requeridos',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 8 caracteres',
      })
    }

    const success = await resetPasswordWithCode(email, code, newPassword)

    if (!success) {
      return res.status(400).json({ error: 'Código inválido o expirado' })
    }

    res.json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error en resetPassword:', error)
    res.status(500).json({ error: 'Error al restablecer la contraseña' })
  }
}

/**
 * Reenvía el código de recuperación
 */
export async function resendCode(req: Request, res: Response) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' })
    }

    await resendResetCode(email)

    res.json({ message: 'Código reenviado exitosamente' })
  } catch (error) {
    console.error('Error en resendCode:', error)
    res.status(500).json({ error: 'Error al reenviar el código' })
  }
}
