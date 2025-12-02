import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import * as filesController from '../controllers/files.controller'

const router = Router()

// Servir archivo (con autenticación opcional para debugging)
// TODO: Hacer autenticación obligatoria en producción
router.get('/:filename', filesController.serveFile)

export default router
