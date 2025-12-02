import { Router } from 'express'
import * as exchangeController from '../controllers/exchange.controller'

const router = Router()

// Public routes (no auth required)
router.get('/blue', exchangeController.getDolarBlue)
router.get('/blue/date', exchangeController.getDolarBlueForDate)
router.get('/oficial', exchangeController.getDolarOficial)
router.get('/all', exchangeController.getAllQuotes)

export default router
