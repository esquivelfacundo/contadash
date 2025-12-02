import { Request, Response, NextFunction } from 'express'
import path from 'path'

/**
 * Upload a file (image or PDF)
 */
export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' })
    }

    // Construir URL del archivo
    const fileUrl = `/uploads/${req.file.filename}`

    res.json({
      message: 'Archivo subido exitosamente',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a file
 */
export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename } = req.params

    if (!filename) {
      return res.status(400).json({ error: 'Nombre de archivo requerido' })
    }

    const fs = require('fs')
    const filePath = path.join(__dirname, '../../uploads', filename)

    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ message: 'Archivo eliminado exitosamente' })
    } else {
      res.status(404).json({ error: 'Archivo no encontrado' })
    }
  } catch (error) {
    next(error)
  }
}
