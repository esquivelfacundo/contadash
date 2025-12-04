import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: Transporter

  constructor() {
    // Configurar transporter según el entorno
    if (process.env.NODE_ENV === 'production') {
      console.log('📧 Configurando SMTP para producción:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER,
      })
      
      // Producción: usar servicio real (Gmail, SendGrid, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, // 10 segundos
        greetingTimeout: 10000,
        socketTimeout: 10000,
      })
    } else {
      // Desarrollo: usar ethereal (emails de prueba)
      // En desarrollo, los emails se "envían" pero no llegan realmente
      // Se pueden ver en https://ethereal.email/
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.ETHEREAL_USER || 'test@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'test',
        },
      })
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      console.log('📧 Intentando enviar email a:', options.to)
      
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"ContaDash" <noreply@contadash.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })

      console.log('✅ Email enviado exitosamente a:', options.to)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email enviado (desarrollo):', nodemailer.getTestMessageUrl(info))
      }
    } catch (error) {
      console.error('❌ Error enviando email:', error)
      throw new Error('Error al enviar email')
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Recuperación de Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña de ContaDash.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <center>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </center>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p><strong>⏰ Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              Por seguridad, nunca compartas este enlace con nadie.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ContaDash. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Hola ${name},

      Recibimos una solicitud para restablecer tu contraseña de ContaDash.

      Haz clic en el siguiente enlace para crear una nueva contraseña:
      ${resetUrl}

      Este enlace expirará en 1 hora.

      Si no solicitaste este cambio, puedes ignorar este email de forma segura.

      © ${new Date().getFullYear()} ContaDash
    `

    await this.sendEmail({
      to: email,
      subject: '🔐 Recuperación de Contraseña - ContaDash',
      html,
      text,
    })
  }

  async sendEmailVerification(email: string, token: string, name: string): Promise<void> {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verifica tu Email</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${name}</strong>,</p>
            <p>¡Bienvenido a ContaDash! 🎉</p>
            <p>Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente botón:</p>
            <center>
              <a href="${verifyUrl}" class="button">Verificar Email</a>
            </center>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
            <p>Una vez verificado, podrás acceder a todas las funcionalidades de ContaDash.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              Si no creaste esta cuenta, puedes ignorar este email.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ContaDash. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Hola ${name},

      ¡Bienvenido a ContaDash!

      Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:
      ${verifyUrl}

      Una vez verificado, podrás acceder a todas las funcionalidades de ContaDash.

      Si no creaste esta cuenta, puedes ignorar este email.

      © ${new Date().getFullYear()} ContaDash
    `

    await this.sendEmail({
      to: email,
      subject: '✉️ Verifica tu Email - ContaDash',
      html,
      text,
    })
  }

  async sendReportEmail(
    email: string,
    reportName: string,
    attachments: Array<{ filename: string; content: Buffer; contentType: string }>
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Reporte Generado</h1>
          </div>
          <div class="content">
            <p>Tu reporte <strong>${reportName}</strong> ha sido generado exitosamente.</p>
            <p>Encontrarás los archivos adjuntos en este email.</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ContaDash. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ContaDash" <noreply@contadash.com>',
      to: email,
      subject: `📊 ${reportName} - ContaDash`,
      html,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    })
  }
}

export const emailService = new EmailService()
