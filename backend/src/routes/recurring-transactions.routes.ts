import { Router } from 'express'
import * as recurringController from '../controllers/recurring-transactions.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', recurringController.getAllRecurringTransactions)
router.post('/', recurringController.createRecurringTransaction)
router.get('/upcoming', recurringController.getUpcoming)
router.get('/:id', recurringController.getRecurringTransactionById)
router.put('/:id', recurringController.updateRecurringTransaction)
router.delete('/:id', recurringController.deleteRecurringTransaction)
router.post('/:id/generate', recurringController.generateTransaction)
router.post('/:id/end', recurringController.endRecurringTransaction)
router.patch('/transactions/:transactionId/mark-paid', recurringController.markAsPaid)

export default router
