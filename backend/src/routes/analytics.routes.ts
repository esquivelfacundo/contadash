import { Router } from 'express'
import * as analyticsController from '../controllers/analytics.controller'
import * as yearlySummaryController from '../controllers/yearly-summary.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// Analytics endpoints
router.get('/dashboard', analyticsController.getDashboard)
router.get('/trend', analyticsController.getMonthlyTrend)
router.get('/category-breakdown', analyticsController.getCategoryBreakdown)
router.get('/client/:clientId', analyticsController.getClientAnalysis)
router.get('/compare-periods', analyticsController.comparePeriods)
router.get('/projections', analyticsController.getProjections)
router.get('/yearly-summary', yearlySummaryController.getYearlySummary)

export default router
