import { Router } from 'express'
import * as uploadController from '../controllers/upload.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { upload, handleMulterError } from '../middleware/upload.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Upload file (image or PDF)
router.post('/', upload.single('file'), handleMulterError, uploadController.uploadFile)

// Delete file
router.delete('/:filename', uploadController.deleteFile)

export default router
