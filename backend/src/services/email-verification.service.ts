import { prisma } from '../config/database'
import { emailService } from './email.service'
import * as fs from 'fs'
import * as path from 'path'
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
    
    // Leer template de email
    const templatePath = path.join(__dirname, '../templates/email-verification.html')
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8')
    
    // Reemplazar variables en el template
    htmlTemplate = htmlTemplate
      .replace(/{{userName}}/g, name)
      .replace(/{{verificationCode}}/g, verificationCode)
    
    // Enviar email
    await emailService.sendEmail({
      to: email,
      subject: 'Verifica tu email - ContaDash',
      html: htmlTemplate,
    })
    
    console.log(`✅ Código de verificación enviado a ${email}`)
  } catch (error) {
    console.error('❌ Error enviando código de verificación:', error)
    throw new Error('No se pudo enviar el código de verificación')
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
