import { prisma } from '../config/database'
import { emailService } from './email.service'
import crypto from 'crypto'

/**
 * Genera un código de verificación de 6 dígitos
 */
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Envía un código de verificación al email del usuario
 */
export async function sendVerificationEmail(userId: string, email: string, name: string): Promise<void> {
  try {
    // Generar código de 6 dígitos
    const verificationCode = generateVerificationCode()
    
    // Establecer expiración de 15 minutos
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    
    // Guardar código en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: expiresAt,
      },
    })
    
    console.log(`✅ Código de verificación generado: ${verificationCode} para ${email}`)
    
    // Intentar enviar email (no crítico)
    try {
      // Template HTML inline
      const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu email - ContaDash</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1d2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">ContaDash</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 400;">Sistema de Gestión Financiera</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 50px 40px;">
                            <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 600;">¡Bienvenido a ContaDash! 👋</h2>
                            <p style="margin: 0 0 30px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Hola <strong style="color: #ffffff;">${name}</strong>,</p>
                            <p style="margin: 0 0 30px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Gracias por registrarte en ContaDash. Para completar tu registro y acceder a todas las funcionalidades, necesitamos verificar tu dirección de correo electrónico.</p>
                            <p style="margin: 0 0 20px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Tu código de verificación es:</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 30px 0;">
                                        <div style="background: rgba(102, 126, 234, 0.1); border: 2px solid #667eea; border-radius: 12px; padding: 20px 40px; display: inline-block;">
                                            <span style="color: #667eea; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${verificationCode}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 20px 0 30px; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">Ingresa este código en la pantalla de verificación para activar tu cuenta.</p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px; color: #ffc107; font-size: 14px; font-weight: 600;">⚠️ Información de Seguridad</p>
                                        <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;">• Este código expira en <strong style="color: #ffffff;">15 minutos</strong><br>• Nunca compartas este código con nadie<br>• Si no solicitaste este registro, ignora este email</p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 30px 0 0; color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #0f1117; padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
                            <p style="margin: 0 0 10px; color: rgba(255,255,255,0.5); font-size: 12px; text-align: center;">© 2025 ContaDash. Todos los derechos reservados.</p>
                            <p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">Este es un email automático, por favor no respondas a este mensaje.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
      `
      
      // Enviar email
      await emailService.sendEmail({
        to: email,
        subject: 'Verifica tu email - ContaDash',
        html: htmlTemplate,
      })
      
      console.log(`✅ Email de verificación enviado a ${email}`)
    } catch (emailError) {
      console.error('⚠️ Error enviando email (continuando):', emailError)
      // No lanzar error - el código ya está guardado en la BD
    }
  } catch (error) {
    console.error('❌ Error en verificación de email:', error)
    throw error
  }
}

/**
 * Verifica el código ingresado por el usuario
 */
export async function verifyEmailCode(userId: string, code: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerificationCode: true,
        emailVerificationExpires: true,
        emailVerified: true,
      },
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    // Verificar si el email ya está verificado
    if (user.emailVerified) {
      return true
    }
    
    // Verificar si el código existe
    if (!user.emailVerificationCode) {
      throw new Error('No hay código de verificación pendiente')
    }
    
    // Verificar si el código expiró
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new Error('El código de verificación ha expirado')
    }
    
    // Verificar si el código coincide
    if (user.emailVerificationCode !== code) {
      throw new Error('Código de verificación inválido')
    }
    
    // Marcar email como verificado
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    })
    
    console.log(`✅ Email verificado para usuario ${userId}`)
    return true
  } catch (error) {
    console.error('❌ Error verificando código:', error)
    throw error
  }
}

/**
 * Reenvía el código de verificación
 */
export async function resendVerificationCode(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailVerified: true,
      },
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    if (user.emailVerified) {
      throw new Error('El email ya está verificado')
    }
    
    await sendVerificationEmail(userId, user.email, user.name)
  } catch (error) {
    console.error('❌ Error reenviando código:', error)
    throw error
  }
}
