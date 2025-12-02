import { Router } from 'express'
import * as reportController from '../controllers/report.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Generar reportes
router.get('/monthly', reportController.generateMonthlyReport)
router.get('/annual', reportController.generateAnnualReport)
router.get('/client', reportController.generateClientReport)
router.get('/category', reportController.generateCategoryReport)
router.get('/custom', reportController.generateCustomReport)

// Enviar reporte por email
router.post('/send-email', reportController.sendReportByEmail)

// Reportes programados
router.get('/scheduled', reportController.getScheduledReports)
router.post('/scheduled', reportController.createScheduledReport)
router.get('/scheduled/:id', reportController.getScheduledReportById)
router.put('/scheduled/:id', reportController.updateScheduledReport)
router.delete('/scheduled/:id', reportController.deleteScheduledReport)
router.patch('/scheduled/:id/toggle', reportController.toggleScheduledReport)
router.post('/scheduled/:id/execute', reportController.executeScheduledReport)

export default router
