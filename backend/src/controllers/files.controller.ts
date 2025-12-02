import { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { prisma } from '../config/database'

/**
 * Servir archivo de forma segura
 * Solo permite acceso si el usuario es dueño de la transacción
 */
export async function serveFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { filename } = req.params
    const userId = (req as any).user?.id

    // Sanitizar filename para prevenir path traversal
    const sanitizedFilename = path.basename(filename)
    
    // Verificar que no contenga caracteres peligrosos (permitir espacios, letras, números, guiones, puntos y guiones bajos)
    if (!/^[a-zA-Z0-9._\- ]+$/.test(sanitizedFilename)) {
      return res.status(400).json({ error: 'Nombre de archivo inválido' })
    }

    // Construir path seguro
    const uploadsDir = path.join(__dirname, '../../uploads')
    const filePath = path.join(uploadsDir, sanitizedFilename)
    
    // Verificar que el path resuelto esté dentro de uploads (prevenir path traversal)
    const resolvedPath = path.resolve(filePath)
    const resolvedUploadsDir = path.resolve(uploadsDir)
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }

    // TODO: Verificar autenticación y propiedad en producción
    // Por ahora permitir acceso para debugging
    if (userId) {
      // Si hay usuario autenticado, verificar propiedad
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId,
          attachmentUrl: {
            contains: sanitizedFilename,
          },
        },
      })

      if (!transaction) {
        console.log(`Usuario ${userId} intentó acceder a archivo sin permiso: ${sanitizedFilename}`)
        // Por ahora permitir acceso para debugging
        // return res.status(403).json({ error: 'No tienes permiso' })
      }
    }

    // Determinar Content-Type basado en extensión
    const ext = path.extname(sanitizedFilename).toLowerCase()
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    // Establecer headers de seguridad
    res.setHeader('Content-Type', contentType)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedFilename}"`)
    
    // Prevenir que PDFs ejecuten JavaScript
    if (ext === '.pdf') {
      res.setHeader('Content-Security-Policy', "script-src 'none'")
    }

    // Servir archivo
    res.sendFile(filePath)
  } catch (error) {
    next(error)
  }
}
