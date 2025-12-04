import { prisma } from '../config/database'
import { emailService } from './email.service'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

/**
 * Genera un código de recuperación de 6 dígitos
 */
function generateResetCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Envía un código de recuperación de contraseña por email
 */
export async function sendPasswordResetCode(email: string): Promise<void> {
  try {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      console.log(`⚠️ Intento de recuperación para email no registrado: ${email}`)
      return
    }

    // Generar código de 6 dígitos
    const resetCode = generateResetCode()
    
    // Establecer expiración de 15 minutos
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)
    
    // Guardar código en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetCode,
        passwordResetCodeExpires: expiresAt,
      },
    })
    
    console.log(`✅ Código de recuperación generado: ${resetCode} para ${email}`)
    
    // Intentar enviar email (no crítico)
    try {
      // Template HTML inline
      const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recupera tu contraseña - ContaDash</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #667eea; padding: 40px 20px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ContaDash</h1>
                            <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Sistema de Gestión Financiera</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 20px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 22px; font-weight: 600; text-align: center;">Recupera tu contraseña 🔐</h2>
                            
                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">Hola <strong style="color: #333333;">${user.name}</strong>,</p>
                            
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.5;">Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:</p>
                            
                            <!-- Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color: #f0f4ff; border: 2px solid #667eea; border-radius: 8px; padding: 20px 40px;">
                                                    <span style="color: #667eea; font-size: 32px; font-weight: 700; letter-spacing: 6px; font-family: 'Courier New', monospace;">${resetCode}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 30px; color: #666666; font-size: 16px; line-height: 1.5; text-align: center;">Ingresa este código en la pantalla de recuperación</p>
                            
                            <!-- Warning Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff9e6; border-left: 4px solid #ffc107; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0 0 10px; color: #f57c00; font-size: 14px; font-weight: 600;">⚠️ Información de Seguridad</p>
                                        <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.5;">
                                            • El código expira en <strong>15 minutos</strong><br>
                                            • Nunca compartas este código<br>
                                            • Si no solicitaste esto, ignora este email
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 5px; color: #999999; font-size: 12px;">© 2025 ContaDash. Todos los derechos reservados.</p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">Este es un email automático, no respondas a este mensaje.</p>
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
        subject: 'Recupera tu contraseña - ContaDash',
        html: htmlTemplate,
      })
      
      console.log(`✅ Email de recuperación enviado a ${email}`)
    } catch (emailError) {
      console.error('⚠️ Error enviando email (continuando):', emailError)
      // No lanzar error - el código ya está guardado en la BD
    }
  } catch (error) {
    console.error('❌ Error en recuperación de contraseña:', error)
    throw error
  }
}

/**
 * Verifica el código de recuperación
 */
export async function verifyResetCode(email: string, code: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordResetCode: true,
        passwordResetCodeExpires: true,
      },
    })

    if (!user) {
      return false
    }

    // Verificar que el código existe
    if (!user.passwordResetCode) {
      console.log('❌ No hay código de recuperación para este usuario')
      return false
    }

    // Verificar que el código no ha expirado
    if (!user.passwordResetCodeExpires || user.passwordResetCodeExpires < new Date()) {
      console.log('❌ Código de recuperación expirado')
      return false
    }

    // Verificar que el código coincide
    if (user.passwordResetCode !== code) {
      console.log('❌ Código de recuperación incorrecto')
      return false
    }

    console.log('✅ Código de recuperación verificado correctamente')
    return true
  } catch (error) {
    console.error('❌ Error verificando código:', error)
    return false
  }
}

/**
 * Restablece la contraseña después de verificar el código
 */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> {
  try {
    // Primero verificar el código
    const isValid = await verifyResetCode(email, code)
    
    if (!isValid) {
      return false
    }

    // Hashear la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Actualizar la contraseña y limpiar el código
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        passwordResetCode: null,
        passwordResetCodeExpires: null,
      },
    })

    console.log(`✅ Contraseña actualizada exitosamente para ${email}`)
    return true
  } catch (error) {
    console.error('❌ Error restableciendo contraseña:', error)
    return false
  }
}

/**
 * Reenvía el código de recuperación
 */
export async function resendResetCode(email: string): Promise<void> {
  // Simplemente generar y enviar un nuevo código
  await sendPasswordResetCode(email)
}
